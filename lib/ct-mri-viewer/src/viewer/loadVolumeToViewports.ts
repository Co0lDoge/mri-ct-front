import { Enums, cache, getRenderingEngine, imageLoader, setVolumesForViewports, volumeLoader } from "@cornerstonejs/core";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { CtViewerConfig, SeriesGroupConfig, SeriesConfig } from "../types";
import type { CtLayoutId } from "../layout";
import type { MprSlotState, VolumeViewportAssignment } from "./types";
import { RENDERING_ENGINE_ID, VIEWPORT_IDS, volumeIdForSeries, type ViewportId, type ViewerToolId } from "./constants";
import { registerVolumeImagePlaneFallback } from "./metadataProviders";
import { createTransferFunctionMappingSetter, voiRangeFromImage } from "./windowLevel";
import { getOrCreateVolumeToolGroup, CrosshairsTool, ToolGroupManager, MouseBindings } from "./toolGroup";
import { resizeEngineAfterLayout } from "./resizeViewports";
import * as cornerstoneTools from "@cornerstonejs/tools";

type SeriesEntry = CtViewerConfig["series"][number];

type ToolGroupT = ReturnType<typeof ToolGroupManager.getToolGroup>;

export type LoadVolumeContext = {
  pacsBasePath: string;
  config: CtViewerConfig;
  layoutRef: MutableRefObject<CtLayoutId>;
  activeTool: ViewerToolId;
  toolGroupsBySeriesRef: MutableRefObject<Map<string, ToolGroupT>>;
  toolGroupsByGroupRef?: MutableRefObject<Map<string, ToolGroupT>>;
  seriesVolumeIdsRef: MutableRefObject<Map<string, string>>;
  seriesInitialVoiRef: MutableRefObject<Map<string, [number, number]>>;
  setSlots: Dispatch<SetStateAction<MprSlotState[]>>;
  setFrameOfReferenceUID: (uid: string | null) => void;
};

/**
 * Загрузка серии в volume, привязка к переданным viewport'ам, ToolGroup, ориентации и VOI.
 * Вызывать при активном RenderingEngine; `removeFallback` в finally.
 */
export async function loadVolumeToViewports(
  seriesId: string,
  seriesItem: SeriesEntry,
  assignments: VolumeViewportAssignment[],
  ctx: LoadVolumeContext
): Promise<void> {
  const re = getRenderingEngine(RENDERING_ENGINE_ID);
  if (!re) return;

  const volId = volumeIdForSeries(seriesId);
  const baseUrl = ctx.config.baseUrl ?? `${window.location.origin}${ctx.pacsBasePath}/${seriesId}`;
  const prefix = seriesItem.slicePrefix ?? "I";
  const postfix = seriesItem.slicePostfix ?? "";
  const imageIds = Array.from(
    { length: seriesItem.sliceCount },
    (_, i) => `wadouri:${baseUrl}/${prefix}${seriesItem.sliceStart + i}${postfix}`
  );
  const n = imageIds.length;

  const indices = new Set<number>();
  for (let i = 0; i < Math.min(30, n); i++) indices.add(i);
  for (let i = Math.floor(n / 2) - 15; i < Math.floor(n / 2) + 15 && i < n; i++) if (i >= 0) indices.add(i);
  for (let i = n - 1; i >= n - 30 && i >= 0; i--) indices.add(i);
  const toPreload = [...indices].map((i) => imageIds[i]);
  await Promise.allSettled(toPreload.map((id) => imageLoader.loadImage(id)));

  const policy = {
    modality: ctx.config.modality,
    defaultWindow: ctx.config.defaultWindow,
  };
  const refIdx = Math.max(0, Math.floor(n / 2));
  const refImageId = imageIds[Math.min(refIdx, imageIds.length - 1)];
  if (!cache.getImage(refImageId)) {
    await imageLoader.loadImage(refImageId).catch(() => undefined);
  }
  let refImage = cache.getImage(refImageId) as
    | { windowCenter?: number | number[]; windowWidth?: number | number[] }
    | undefined;
  if (!refImage) {
    refImage = cache.getImage(imageIds[0]) as typeof refImage;
  }
  const windowRange = voiRangeFromImage(refImage, policy);
  ctx.seriesInitialVoiRef.current.set(seriesId, windowRange);

  let volume = cache.getVolume(volId);
  if (!volume) {
    volume = await volumeLoader.createAndCacheVolumeFromImages(volId, imageIds);
    await volume.load();
  }
  ctx.seriesVolumeIdsRef.current.set(seriesId, volId);

  const removeFallback = registerVolumeImagePlaneFallback(volId);
  try {
    await setVolumesForViewports(
      re,
      [{ volumeId: volId, callback: createTransferFunctionMappingSetter(windowRange) }],
      assignments.map((a) => a.viewportId),
      true,
      true
    );

    for (const { viewportId } of assignments) {
      const vp = re.getViewport(viewportId) as
        | {
            setProperties?: (props: unknown) => void;
            setVOI?: (voi: { lower: number; upper: number }) => void;
          }
        | undefined;
      if (!vp) continue;
      if (typeof vp.setVOI === "function") {
        vp.setVOI({ lower: windowRange[0], upper: windowRange[1] });
      } else if (typeof vp.setProperties === "function") {
        vp.setProperties({ voiRange: { lower: windowRange[0], upper: windowRange[1] } });
      }
    }

    const reCheck = getRenderingEngine(RENDERING_ENGINE_ID);
    if (!reCheck) {
      throw new Error("RenderingEngine not ready. Please wait for the viewer to initialize.");
    }

    const tg = getOrCreateVolumeToolGroup(seriesId, volId);
    ctx.toolGroupsBySeriesRef.current.set(seriesId, tg);

    for (const { viewportId } of assignments) {
      ctx.toolGroupsBySeriesRef.current.forEach((existing) => {
        try {
          existing?.removeViewports(RENDERING_ENGINE_ID, viewportId);
        } catch {
          /* ignore */
        }
      });
      tg.addViewport(viewportId, RENDERING_ENGINE_ID);
    }
    if (ctx.layoutRef.current === "1") {
      tg.setToolDisabled(CrosshairsTool.toolName);
    } else {
      tg.setToolEnabled(CrosshairsTool.toolName);
      if (ctx.activeTool === "Crosshairs") {
        tg.setToolActive(CrosshairsTool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
      }
    }

    const firstVp = re.getViewport(assignments[0].viewportId);
    const forUID =
      firstVp?.getFrameOfReferenceUID?.() ??
      (volume as { metadata?: { FrameOfReferenceUID?: string } })?.metadata?.FrameOfReferenceUID;
    if (forUID) ctx.setFrameOfReferenceUID(forUID);

    for (const { viewportId, orientation } of assignments) {
      const vp = re.getViewport(viewportId);
      const vpAny = vp as {
        applyViewOrientation?: (orientation: Enums.OrientationAxis, resetCamera?: boolean) => void;
      };
      const orientationAxis: Enums.OrientationAxis =
        orientation === 0
          ? Enums.OrientationAxis.AXIAL
          : orientation === 1
            ? Enums.OrientationAxis.SAGITTAL
            : Enums.OrientationAxis.CORONAL;
      if (vpAny?.applyViewOrientation) vpAny.applyViewOrientation(orientationAxis, false);
    }
    for (const { viewportId } of assignments) {
      (re.getViewport(viewportId) as { resetCamera?: () => void })?.resetCamera?.();
    }

    ctx.setSlots((prev) =>
      prev.map((slot) => {
        const a = assignments.find((x) => x.viewportId === slot.viewportId);
        if (a) {
          return {
            ...slot,
            seriesId,
            orientation: a.orientation,
          };
        }
        return slot;
      })
    );

    const viewportIdsToRender = assignments.map((a) => a.viewportId);
    re.renderViewports(viewportIdsToRender);
    resizeEngineAfterLayout();
  } finally {
    removeFallback?.();
  }
}

export function defaultMprAssignments(): VolumeViewportAssignment[] {
  return [
    { viewportId: VIEWPORT_IDS.CT_AXIAL as ViewportId, orientation: 0 },
    { viewportId: VIEWPORT_IDS.CT_SAGITTAL as ViewportId, orientation: 1 },
    { viewportId: VIEWPORT_IDS.CT_CORONAL as ViewportId, orientation: 2 },
  ];
}

/**
 * Очищает кэш томов, оставляя только указанные серии.
 * Полезно для управления памятью при загрузке новых серий.
 */
export function purgeVolumeCache(keepSeriesIds: string[]): void {
  const volumesToKeep = new Set(keepSeriesIds.map(volumeIdForSeries));
  const volumesToRemove: string[] = [];
  cache.getVolumes().forEach((volume, volumeId) => {
    if (!volumesToKeep.has(volumeId.toString())) {
      volumesToRemove.push(volumeId.toString());
    }
  });
  volumesToRemove.forEach((volumeId) => {
    try {
      cache.removeVolumeLoadObject(volumeId);
    } catch (error) {
      console.warn(`Failed to remove volume ${volumeId} from cache:`, error);
    }
  });
}

/**
 * Загружает несколько серий (например, S1, S2, S3) в разные проекции (Axial, Sagittal, Coronal)
 * и объединяет их в одну ToolGroup. Это позволяет инструменту Crosshairs синхронизировать
 * положение срезов во всех трёх окнах, так как у серий одинаковый FrameOfReferenceUID.
 *
 * Проекция каждой серии берётся из `seriesItem.projection` (поле в SeriesConfig),
 * что избавляет от дублирования информации в группе.
 */
export async function loadGroupedVolumesToViewports(
  group: SeriesGroupConfig,
  seriesConfigs: SeriesConfig[],
  ctx: LoadVolumeContext
): Promise<void> {
  const re = getRenderingEngine(RENDERING_ENGINE_ID);
  if (!re) return;

  const assignments: { seriesId: string; seriesItem: SeriesConfig; viewportId: ViewportId; orientation: number }[] = [];

  for (const seriesId of group.seriesIds) {
    const seriesItem = seriesConfigs.find((s) => s.id === seriesId);
    if (!seriesItem || !seriesItem.projection) continue;

    let viewportId: ViewportId;
    let orientation: number;

    if (seriesItem.projection === "AXIAL") {
      viewportId = VIEWPORT_IDS.CT_AXIAL as ViewportId;
      orientation = 0;
    } else if (seriesItem.projection === "SAGITTAL") {
      viewportId = VIEWPORT_IDS.CT_SAGITTAL as ViewportId;
      orientation = 1;
    } else {
      viewportId = VIEWPORT_IDS.CT_CORONAL as ViewportId;
      orientation = 2;
    }
    assignments.push({ seriesId, seriesItem, viewportId, orientation });
  }

  for (const { seriesId, seriesItem, viewportId, orientation } of assignments) {
    const volId = volumeIdForSeries(seriesId);
    const baseUrl = ctx.config.baseUrl ?? `${window.location.origin}${ctx.pacsBasePath}/${seriesId}`;
    const prefix = seriesItem.slicePrefix ?? "I";
    const postfix = seriesItem.slicePostfix ?? "";
    const imageIds = Array.from(
      { length: seriesItem.sliceCount },
      (_, i) => `wadouri:${baseUrl}/${prefix}${seriesItem.sliceStart + i}${postfix}`
    );
    const n = imageIds.length;

    const indices = new Set<number>();
    for (let i = 0; i < Math.min(30, n); i++) indices.add(i);
    for (let i = Math.floor(n / 2) - 15; i < Math.floor(n / 2) + 15 && i < n; i++) if (i >= 0) indices.add(i);
    for (let i = n - 1; i >= n - 30 && i >= 0; i--) indices.add(i);
    await Promise.allSettled([...indices].map((i) => imageLoader.loadImage(imageIds[i])));

    const policy = { modality: ctx.config.modality, defaultWindow: ctx.config.defaultWindow };
    const refIdx = Math.max(0, Math.floor(n / 2));
    const refImageId = imageIds[Math.min(refIdx, imageIds.length - 1)];
    if (!cache.getImage(refImageId)) {
      await imageLoader.loadImage(refImageId).catch(() => undefined);
    }
    let refImage = cache.getImage(refImageId) as { windowCenter?: number | number[]; windowWidth?: number | number[] } | undefined;
    if (!refImage) {
      refImage = cache.getImage(imageIds[0]) as typeof refImage;
    }
    const windowRange = voiRangeFromImage(refImage, policy);
    ctx.seriesInitialVoiRef.current.set(seriesId, windowRange);

    let volume = cache.getVolume(volId);
    if (!volume) {
      volume = await volumeLoader.createAndCacheVolumeFromImages(volId, imageIds);
      await volume.load();
    }
    ctx.seriesVolumeIdsRef.current.set(seriesId, volId);

    const removeFallback = registerVolumeImagePlaneFallback(volId);
    try {
      await setVolumesForViewports(
        re,
        [{ volumeId: volId, callback: createTransferFunctionMappingSetter(windowRange) }],
        [viewportId],
        true,
        false
      );

      const vp = re.getViewport(viewportId) as any;
      if (vp) {
        if (typeof vp.setVOI === "function") {
          vp.setVOI({ lower: windowRange[0], upper: windowRange[1] });
        } else if (typeof vp.setProperties === "function") {
          vp.setProperties({ voiRange: { lower: windowRange[0], upper: windowRange[1] } });
        }

        const orientationAxis =
          orientation === 0
            ? Enums.OrientationAxis.AXIAL
            : orientation === 1
              ? Enums.OrientationAxis.SAGITTAL
              : Enums.OrientationAxis.CORONAL;

        if (vp.applyViewOrientation) {
          vp.applyViewOrientation(orientationAxis, true); // resetCamera = true
        }

        if (vp.resetCamera) {
          vp.resetCamera();
        }
      }
    } finally {
      removeFallback?.();
    }
  }

  const tgId = `toolGroup_${group.groupId}`;
  let tg = ToolGroupManager.getToolGroup(tgId);
  if (!tg) {
    tg = ToolGroupManager.createToolGroup(tgId)!;
    tg.addTool(cornerstoneTools.PanTool.toolName);
    tg.addTool(cornerstoneTools.ZoomTool.toolName);
    tg.addTool(cornerstoneTools.StackScrollTool.toolName);
    tg.addTool(cornerstoneTools.LengthTool.toolName);
    tg.addTool(cornerstoneTools.RectangleROITool.toolName);
    tg.addTool(cornerstoneTools.EllipticalROITool.toolName);

    tg.addTool(CrosshairsTool.toolName, {
      getReferenceLineColor: (vpId: string) =>
        vpId === VIEWPORT_IDS.CT_AXIAL
          ? "rgb(200, 0, 0)"
          : vpId === VIEWPORT_IDS.CT_SAGITTAL
            ? "rgb(200, 200, 0)"
            : "rgb(0, 200, 0)",
      getReferenceLineControllable: () => true,
      getReferenceLineDraggableRotatable: () => true,
      getReferenceLineSlabThicknessControlsOn: () => true,
      filterActorUIDsToSetSlabThickness: [],
    });
    tg.addTool(cornerstoneTools.WindowLevelTool.toolName);

    tg.setToolActive(cornerstoneTools.WindowLevelTool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
    tg.setToolActive(cornerstoneTools.PanTool.toolName, { bindings: [{ mouseButton: MouseBindings.Auxiliary }] });
    tg.setToolActive(cornerstoneTools.ZoomTool.toolName, { bindings: [{ mouseButton: MouseBindings.Secondary }] });
    tg.setToolActive(cornerstoneTools.StackScrollTool.toolName, { bindings: [{ mouseButton: MouseBindings.Wheel }] });
  }

  for (const { viewportId } of assignments) {
    ctx.toolGroupsBySeriesRef.current.forEach((existing) => {
      try { existing?.removeViewports(RENDERING_ENGINE_ID, viewportId); } catch {}
    });
    if (ctx.toolGroupsByGroupRef) {
      ctx.toolGroupsByGroupRef.current.forEach((existing) => {
        try { existing?.removeViewports(RENDERING_ENGINE_ID, viewportId); } catch {}
      });
    }
    tg.addViewport(viewportId, RENDERING_ENGINE_ID);
  }

  if (ctx.toolGroupsByGroupRef) {
    ctx.toolGroupsByGroupRef.current.set(group.groupId, tg);
  }

  if (ctx.layoutRef.current === "1") {
    tg.setToolDisabled(CrosshairsTool.toolName);
  } else {
    tg.setToolEnabled(CrosshairsTool.toolName);
    if (ctx.activeTool === "Crosshairs") {
      tg.setToolActive(CrosshairsTool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
    }
  }

  ctx.setSlots((prev) =>
    prev.map((slot) => {
      const a = assignments.find((x) => x.viewportId === slot.viewportId);
      return a ? { ...slot, seriesId: a.seriesId, orientation: a.orientation } : slot;
    })
  );

  const firstVp = re.getViewport(assignments[0].viewportId);
  const forUID = firstVp?.getFrameOfReferenceUID?.();
  if (forUID) ctx.setFrameOfReferenceUID(forUID);

  re.renderViewports(assignments.map((a) => a.viewportId));
  resizeEngineAfterLayout();
}