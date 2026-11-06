"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CtViewerConfig } from "../types";
import { message } from "antd";
import { StudyListSidebar } from "./StudyListSidebar";
import type { CtToolId } from "./CtViewerToolbar";
import type { CtLayoutId } from "../layout";
import { DEFAULT_CT_LAYOUT } from "../layout";
import { MprControlBar } from "./mpr/MprControlBar";
import { MprViewportGrid } from "./mpr/MprViewportGrid";
import { RenderingEngine, Enums, getRenderingEngine, cache } from "@cornerstonejs/core";
import * as polySeg from "@cornerstonejs/polymorphic-segmentation";
import type { PublicViewportInput } from "@cornerstonejs/core/types";
import * as cornerstoneTools from "@cornerstonejs/tools";
import {
  ALL_VIEWPORT_IDS,
  RENDERING_ENGINE_ID,
  VIEWPORT_IDS,
  VIEWPORT_MIN_SIZE_PX,
  toolGroupIdForSeries,
  volumeIdForSeries,
} from "../viewer/constants";
import type { MprSlotState } from "../viewer/types";
import { registerCacheBasedMetadataProvider } from "../viewer/metadataProviders";
import { loadVolumeToViewports, loadGroupedVolumesToViewports, defaultMprAssignments, purgeVolumeCache } from "../viewer/loadVolumeToViewports";
import { resizeEngineAfterLayout, resizeEnginePreserveViewPresentationSync } from "../viewer/resizeViewports";
import { useMprVoiSync } from "./hooks/useMprVoiSync";
import {
  ToolGroupManager,
  CrosshairsTool,
  LengthTool,
  EllipticalROITool,
  RectangleROITool,
  WindowLevelTool,
  MouseBindings,
} from "../viewer/toolGroup";
import { initializeCornerstone } from "../viewer/cornerstoneInit";

const {
  init: toolsInit,
  addTool,
  StackScrollTool,
  WindowLevelTool: WLTool,
  PanTool,
  ZoomTool,
  CrosshairsTool: CHtool,
  LengthTool: LenTool,
  RectangleROITool: RectTool,
  EllipticalROITool: EllTool,
} = cornerstoneTools;

type CtViewerProps = {
  config: CtViewerConfig;
};

export function CtViewer({ config }: CtViewerProps) {
  const { pacsBasePath, series } = config;
  if (!series.length) throw new Error("CtViewerConfig.series must not be empty");

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportGridRef = useRef<HTMLDivElement>(null);
  const resizeDebounceRef = useRef<number | undefined>(undefined);
  const cleanupRef = useRef<(() => void) | null>(null);
  const cacheMetadataCleanupRef = useRef<(() => void) | null>(null);
  const [messageApi, messageContextHolder] = message.useMessage();
  const [ready, setReady] = useState(false);
  const [cornerstoneReady, setCornerstoneReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(config.initialSeriesId ?? null);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const loadTokenRef = useRef(0);
  const mountedRef = useRef(true);
  const [activeTool, setActiveToolState] = useState<CtToolId>("WindowLevel");
  const [layout, setLayout] = useState<CtLayoutId>(DEFAULT_CT_LAYOUT);
  const layoutRef = useRef<CtLayoutId>(DEFAULT_CT_LAYOUT);
  layoutRef.current = layout;
  const [singleProjection, setSingleProjection] = useState<0 | 1 | 2>(0);
  const prevLayoutForResizeRef = useRef<CtLayoutId | null>(null);
  const prevProjectionForResizeRef = useRef<0 | 1 | 2 | null>(null);
  const cornerstoneReadyRef = useRef(false);
  const [slots, setSlots] = useState<MprSlotState[]>(() =>
    ALL_VIEWPORT_IDS.map((viewportId) => ({
      viewportId,
      seriesId: null,
      orientation: null,
    }))
  );
  const [, setFrameOfReferenceUID] = useState<string | null>(null);
  type ToolGroupT = ReturnType<typeof ToolGroupManager.getToolGroup>;
  const toolGroupsBySeriesRef = useRef<Map<string, ToolGroupT>>(new Map());
  const toolGroupsByGroupRef = useRef<Map<string, ToolGroupT>>(new Map());
  const seriesVolumeIdsRef = useRef<Map<string, string>>(new Map());
  const seriesInitialVoiRef = useRef<Map<string, [number, number]>>(new Map());
  useMprVoiSync(cornerstoneReady);
  const activeToolRef = useRef<CtToolId>(activeTool);
  activeToolRef.current = activeTool;

  const applyToolToAllGroups = useCallback((fn: (tg: NonNullable<ToolGroupT>) => void) => {
    toolGroupsBySeriesRef.current.forEach((tg) => tg && fn(tg));
    toolGroupsByGroupRef.current.forEach((tg) => tg && fn(tg));
  }, []);

  const setTool = useCallback(
    (tool: CtToolId) => {
      applyToolToAllGroups((tg) => {
        tg.setToolPassive(LenTool.toolName);
        tg.setToolPassive(EllTool.toolName);
        tg.setToolPassive(RectTool.toolName);
        tg.setToolPassive(WLTool.toolName);
        if (layoutRef.current !== "1") {
          tg.setToolEnabled(CrosshairsTool.toolName);
        } else {
          tg.setToolDisabled(CrosshairsTool.toolName);
        }
        if (tool === "WindowLevel") {
          tg.setToolActive(WindowLevelTool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
        } else if (tool === "Crosshairs") {
          if (layoutRef.current !== "1") {
            tg.setToolActive(CrosshairsTool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
          }
        } else if (tool === "Length") {
          tg.setToolActive(LengthTool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
        } else if (tool === "RectangleROI") {
          tg.setToolActive(RectangleROITool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
        } else {
          tg.setToolActive(EllipticalROITool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
        }
      });
      setActiveToolState(tool);
    },
    [applyToolToAllGroups]
  );

  useEffect(() => {
    if (layout !== "1" || activeTool !== "Crosshairs") return;
    setTool("WindowLevel");
  }, [layout, activeTool, setTool]);

  useEffect(() => {
    if (!cornerstoneReady) return;
    applyToolToAllGroups((tg) => {
      if (layout === "1") {
        tg.setToolDisabled(CrosshairsTool.toolName);
      } else {
        tg.setToolEnabled(CrosshairsTool.toolName);
      }
    });
  }, [layout, cornerstoneReady, applyToolToAllGroups]);

  const resetWindowLevel = useCallback(() => {
    const re = getRenderingEngine(RENDERING_ENGINE_ID);
    if (!re) return;
    const slotsWithVolume = slots.filter((s) => s.seriesId != null);
    for (const slot of slotsWithVolume) {
      const seriesId = slot.seriesId!;
      const range = seriesInitialVoiRef.current.get(seriesId);
      if (!range) continue;
      const volumeId = seriesVolumeIdsRef.current.get(seriesId);
      const vp = re.getViewport(slot.viewportId) as
        | {
            setProperties?: (props: unknown) => void;
            setVOI?: (voi: { lower: number; upper: number }, volId?: string, suppressEvents?: boolean) => void;
            getDefaultActor?: () => { actor?: unknown };
          }
        | undefined;
      if (!vp) continue;
      if (typeof vp.setVOI === "function") {
        vp.setVOI({ lower: range[0], upper: range[1] }, volumeId, true);
      } else if (typeof vp.setProperties === "function") {
        vp.setProperties({ voiRange: { lower: range[0], upper: range[1] } });
      }
      const actorEntry = vp.getDefaultActor?.();
      const actor = actorEntry?.actor as
        | {
            getProperty?: () => {
              getRGBTransferFunction?: (i: number) => { setMappingRange: (l: number, u: number) => void };
            };
          }
        | undefined;
      const property = actor?.getProperty?.();
      const rgbTF = property?.getRGBTransferFunction?.(0);
      if (rgbTF) {
        rgbTF.setMappingRange(range[0], range[1]);
      }
    }
    re.renderViewports(slotsWithVolume.map((s) => s.viewportId));
  }, [slots]);

  const loadVolumeAndAssignToSlots = useCallback(
    async (seriesId: string) => {
      const s = series.find((x) => x.id === seriesId);
      if (!s) return;
      const re = getRenderingEngine(RENDERING_ENGINE_ID);
      if (!re) return;
      await loadVolumeToViewports(seriesId, s, defaultMprAssignments(), {
        pacsBasePath,
        config,
        layoutRef,
        activeTool: activeToolRef.current,
        toolGroupsBySeriesRef,
        toolGroupsByGroupRef,
        seriesVolumeIdsRef,
        seriesInitialVoiRef,
        setSlots,
        setFrameOfReferenceUID,
      });
    },
    [pacsBasePath, series, config]
  );

  const handleSeriesSelect = useCallback(
    async (id: string, label: string, meta?: unknown, isGroup?: boolean) => {
      if (!cornerstoneReadyRef.current) return;
      if (isLoadingSeries) return;
      const myToken = ++loadTokenRef.current;
      setError(null);
      setActiveSeriesId(id);
      setIsLoadingSeries(true);
      try {
        if (myToken !== loadTokenRef.current) return;
        if (!mountedRef.current) return;

        const currentSeriesIds = slots.map(s => s.seriesId).filter(Boolean).filter(sid => sid !== id) as string[];
        purgeVolumeCache(currentSeriesIds);

        if (isGroup) {
          const group = config.seriesGroups?.find((g) => g.groupId === id);
          if (group) {
            await loadGroupedVolumesToViewports(group, series, {
              pacsBasePath,
              config,
              layoutRef,
              activeTool: activeToolRef.current,
              toolGroupsBySeriesRef,
              toolGroupsByGroupRef,
              seriesVolumeIdsRef,
              seriesInitialVoiRef,
              setSlots,
              setFrameOfReferenceUID,
            });
          }
        } else {
          await loadVolumeAndAssignToSlots(id);
        }

        if (myToken !== loadTokenRef.current) return;
        if (!mountedRef.current) return;
        messageApi.success(`Загружено: ${label}`, 2);
      } catch (err) {
        console.error("Load volume error:", err);
        if (myToken === loadTokenRef.current) {
          setError(err instanceof Error ? err.message : String(err));
          messageApi.error("Не удалось загрузить серию", 2);
        }
      } finally {
        if (myToken === loadTokenRef.current) {
          setIsLoadingSeries(false);
        }
      }
    },
    [isLoadingSeries, loadVolumeAndAssignToSlots, messageApi, config, series, slots]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const checkReady = () => {
      const rect = container.getBoundingClientRect();
      return rect.width >= 400 && rect.height >= 400;
    };
    if (checkReady()) {
      setReady(true);
      return;
    }
    const ro = new ResizeObserver(() => {
      if (checkReady()) {
        setReady(true);
        ro.disconnect();
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    cornerstoneReadyRef.current = cornerstoneReady;
  }, [cornerstoneReady]);

  useEffect(() => {
    if (!ready || !containerRef.current) return;

    const container = containerRef.current;
    let disposed = false;
    const el1 = container.querySelector("[data-viewport=axial]") as HTMLDivElement;
    const el2 = container.querySelector("[data-viewport=sagittal]") as HTMLDivElement;
    const el3 = container.querySelector("[data-viewport=coronal]") as HTMLDivElement;
    if (!el1 || !el2 || !el3) return;

    const run = async () => {
      try {
        setError(null);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

        await initializeCornerstone();
        cacheMetadataCleanupRef.current = registerCacheBasedMetadataProvider(config);

        const renderingEngine = new RenderingEngine(RENDERING_ENGINE_ID);
        const viewerInput: PublicViewportInput[] = [
          {
            viewportId: VIEWPORT_IDS.CT_AXIAL,
            element: el1,
            type: Enums.ViewportType.ORTHOGRAPHIC,
            defaultOptions: { orientation: Enums.OrientationAxis.AXIAL },
          },
          {
            viewportId: VIEWPORT_IDS.CT_SAGITTAL,
            element: el2,
            type: Enums.ViewportType.ORTHOGRAPHIC,
            defaultOptions: { orientation: Enums.OrientationAxis.SAGITTAL },
          },
          {
            viewportId: VIEWPORT_IDS.CT_CORONAL,
            element: el3,
            type: Enums.ViewportType.ORTHOGRAPHIC,
            defaultOptions: { orientation: Enums.OrientationAxis.CORONAL },
          },
        ];
        renderingEngine.setViewports(viewerInput);

        const viewports = [...ALL_VIEWPORT_IDS];
        viewports.forEach((id) => renderingEngine.getViewport(id)?.resetCamera?.());
        renderingEngine.resize(true, true);
        renderingEngine.renderViewports(viewports);

        setCornerstoneReady(true);

        const ro = new ResizeObserver(() => {
          if (!disposed) {
            resizeEnginePreserveViewPresentationSync();
          }
        });
        ro.observe(container);

        cleanupRef.current = () => {
          disposed = true;
          mountedRef.current = false;
          setCornerstoneReady(false);
          cacheMetadataCleanupRef.current?.();
          cacheMetadataCleanupRef.current = null;
          toolGroupsBySeriesRef.current.forEach((_, seriesId) => {
            ToolGroupManager.destroyToolGroup(toolGroupIdForSeries(seriesId));
          });
          toolGroupsBySeriesRef.current.clear();
          toolGroupsByGroupRef.current.forEach((_, groupId) => {
            ToolGroupManager.destroyToolGroup(`toolGroup_${groupId}`);
          });
          toolGroupsByGroupRef.current.clear();
          ro.disconnect();
          renderingEngine.destroy();
        };
      } catch (err) {
        console.error("PET-CT Viewer error:", err);
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    run();
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [ready, pacsBasePath]);

  useEffect(() => {
    if (!cornerstoneReady) return;

    const prevL = prevLayoutForResizeRef.current;
    const prevP = prevProjectionForResizeRef.current;
    const layoutChanged = prevL !== null && prevL !== layout;
    const projectionChanged = prevP !== null && prevP !== singleProjection;
    const projectionOnly = layout === "1" && !layoutChanged && projectionChanged;

    prevLayoutForResizeRef.current = layout;
    prevProjectionForResizeRef.current = singleProjection;

    if (projectionOnly) {
      const id = requestAnimationFrame(() => {
        resizeEnginePreserveViewPresentationSync();
      });
      return () => cancelAnimationFrame(id);
    }

    resizeEngineAfterLayout();
    const t =
      layoutChanged || prevL === null ? window.setTimeout(() => resizeEngineAfterLayout(), 120) : undefined;
    return () => {
      if (t != null) window.clearTimeout(t);
    };
  }, [layout, singleProjection, cornerstoneReady]);

  useEffect(() => {
    if (!cornerstoneReady || typeof ResizeObserver === "undefined") return;
    const el = viewportGridRef.current;
    if (!el) return;
    const bump = () => {
      if (resizeDebounceRef.current != null) window.clearTimeout(resizeDebounceRef.current);
      resizeDebounceRef.current = window.setTimeout(() => {
        resizeDebounceRef.current = undefined;
        resizeEngineAfterLayout();
      }, 48);
    };
    const ro = new ResizeObserver(bump);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (resizeDebounceRef.current != null) window.clearTimeout(resizeDebounceRef.current);
    };
  }, [cornerstoneReady]);

  useEffect(() => {
    if (!cornerstoneReady) return;
    if (!config.initialSeriesId) return;

    const isGroup = config.seriesGroups?.some((g) => g.groupId === config.initialSeriesId) ?? false;
    const label = isGroup
      ? (config.seriesGroups?.find((g) => g.groupId === config.initialSeriesId)?.label ?? config.initialSeriesId)
      : (series.find((x) => x.id === config.initialSeriesId)?.id ?? config.initialSeriesId);

    handleSeriesSelect(config.initialSeriesId, label, {}, isGroup);
  }, [cornerstoneReady]);

  return (
    <>
      {messageContextHolder}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          minHeight: config.embedded ? 520 : Math.max(VIEWPORT_MIN_SIZE_PX + 120, 560),
          height: config.embedded ? "100%" : "calc(100vh - 120px)",
        }}
      >
        <StudyListSidebar
          pacsBasePath={pacsBasePath}
          series={series}
          seriesGroups={config.seriesGroups}
          cornerstoneReady={cornerstoneReady}
          viewerVoiPolicy={{ modality: config.modality, defaultWindow: config.defaultWindow }}
          onSeriesSelect={(id, label, meta, isGroup) => handleSeriesSelect(id, label, meta, isGroup ?? false)}
          selectedSeriesId={activeSeriesId}
          disabled={isLoadingSeries}
        />
        <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
          {isLoadingSeries && (
            <div style={{ padding: "6px 10px", border: "1px solid #ffe58f", borderRadius: 6, background: "#fffbe6" }}>
              <span style={{ color: "#614700", fontSize: 12 }}>Загрузка серии…</span>
            </div>
          )}
          {error && (
            <div style={{ color: "#c00", padding: 8, background: "#fee" }}>
              Ошибка: {error}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minHeight: 0, minWidth: 0 }}>
            <MprControlBar
              activeTool={activeTool}
              onToolChange={setTool}
              onResetWindowLevel={resetWindowLevel}
              resetWindowLevelDisabled={!slots.some((s) => s.seriesId != null)}
              layout={layout}
              onLayoutChange={setLayout}
              singleProjection={singleProjection}
              onSingleProjectionChange={setSingleProjection}
              slots={slots}
            />
            <MprViewportGrid
              gridRootRef={viewportGridRef}
              layout={layout}
              slots={slots}
              singleProjection={singleProjection}
              segments={config.segments}
              sliceUrls={config.sliceUrls}
            />
          </div>
        </div>
      </div>
    </>
  );
}