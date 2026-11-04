"use client";

import { useState, useEffect, useRef, useMemo, type CSSProperties } from "react";
import type { PlaneKey } from "../../viewer/constants";
import type { MprSlotState } from "../../viewer/types";
import type { ViewportId } from "../../viewer/constants";
import segmentsData from "./segments.json";

type Props = {
  plane: PlaneKey;
  viewportId: ViewportId;
  slot: MprSlotState | undefined;
  isSelected: boolean;
  onSelect: () => void;
  gridStyle?: CSSProperties;
  stacked?: boolean;
  stackActive?: boolean;
};

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export function MprViewportTile({
  plane,
  viewportId,
  slot,
  isSelected,
  onSelect,
  gridStyle,
  stacked,
  stackActive,
}: Props) {
  const isEmpty = !slot?.seriesId;
  const [showAiContour, setShowAiContour] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const planeStr = String(plane).toLowerCase();
  const vpStr = String(viewportId).toLowerCase();

  const isCoronal = planeStr.includes("coronal") || vpStr.includes("coronal");
  const isAxial = planeStr.includes("axial") || vpStr.includes("axial");
  const isSagittal = planeStr.includes("sagittal") || vpStr.includes("sagittal");

  const maxSlices = isAxial ? 18 : 14;
  const initialSlice = isAxial ? 9 : (isSagittal ? 7 : 8);
  const [currentSlice, setCurrentSlice] = useState(initialSlice);

  // Скролл колесиком мыши синхронизирован для каждого окна
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCurrentSlice((prev) => {
        const delta = e.deltaY > 0 ? 1 : -1;
        const next = prev + delta;
        return Math.max(0, Math.min(maxSlices - 1, next));
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [maxSlices]);

  // --------------------------------------------------------------------------
  // МАТЕМАТИЧЕСКАЯ ИНТЕРПОЛЯЦИЯ 3D-ТОЧЕК ИЗ JSON
  // --------------------------------------------------------------------------
  const activePolygon = useMemo(() => {
    // 1. КОРОНАЛЬНАЯ ПЛОСКОСТЬ: берем полигон из JSON по номеру среза (3..12)
    if (isCoronal) {
      const seg = segmentsData.find((s: any) => s.points[0]?.sliceIndex === currentSlice);
      if (!seg || !seg.points || seg.points.length === 0) return null;
      return seg.points.map((p: any) => `${p.x},${p.y}`).join(" ");
    }

    // Собираем все 3D-точки из JSON
    const allPoints: Point3D[] = [];
    segmentsData.forEach((s: any) => {
      s.points.forEach((p: any) => {
        allPoints.push({ x: p.x, y: p.y, z: p.sliceIndex });
      });
    });

    const zCenterOffset = 245;
    const zVoxelScale = 6.5; // физический шаг Z (3.3мм / 0.5078мм)

    // 2. АКСИАЛЬНАЯ ПЛОСКОСТЬ (сечение X × Z по высоте Y)
    // В 18-срезовой аксиальной серии опухоль занимает срезы 7..11
    if (isAxial) {
      if (currentSlice < 7 || currentSlice > 11) return null;

      // Рассчитываем высоту среза Y в координатах 512x512
      const t = (currentSlice - 7) / (11 - 7);
      const targetY = 228 + t * (290 - 228);
      const toleranceY = 12;

      // Ищем точки, попадающие в это сечение по высоте
      const slicePts = allPoints.filter((p) => Math.abs(p.y - targetY) <= toleranceY);
      if (slicePts.length < 6) return null;

      // Группируем по Z и находим границы по X
      const zMap: Record<number, { minX: number; maxX: number }> = {};
      slicePts.forEach((p) => {
        if (!zMap[p.z]) zMap[p.z] = { minX: p.x, maxX: p.x };
        else {
          zMap[p.z].minX = Math.min(zMap[p.z].minX, p.x);
          zMap[p.z].maxX = Math.max(zMap[p.z].maxX, p.x);
        }
      });

      const zKeys = Object.keys(zMap).map(Number).sort((a, b) => a - b);
      if (zKeys.length < 2) return null;

      const leftEdge: string[] = [];
      const rightEdge: string[] = [];

      zKeys.forEach((z) => {
        const zPx = Math.round(zCenterOffset + (z - 7.5) * zVoxelScale);
        leftEdge.push(`${zMap[z].minX},${zPx}`);
        rightEdge.push(`${zMap[z].maxX},${zPx}`);
      });

      return [...leftEdge, ...rightEdge.reverse()].join(" ");
    }

    // 3. САГИТТАЛЬНАЯ ПЛОСКОСТЬ (сечение Z × Y по глубине X)
    // В 14-срезовой сагиттальной серии опухоль занимает срезы 5..9
    if (isSagittal) {
      if (currentSlice < 5 || currentSlice > 9) return null;

      // Рассчитываем латеральную координату X в координатах 512x512
      const t = (currentSlice - 5) / (9 - 5);
      const targetX = 226 + t * (294 - 226);
      const toleranceX = 12;

      const slicePts = allPoints.filter((p) => Math.abs(p.x - targetX) <= toleranceX);
      if (slicePts.length < 6) return null;

      const zMap: Record<number, { minY: number; maxY: number }> = {};
      slicePts.forEach((p) => {
        if (!zMap[p.z]) zMap[p.z] = { minY: p.y, maxY: p.y };
        else {
          zMap[p.z].minY = Math.min(zMap[p.z].minY, p.y);
          zMap[p.z].maxY = Math.max(zMap[p.z].maxY, p.y);
        }
      });

      const zKeys = Object.keys(zMap).map(Number).sort((a, b) => a - b);
      if (zKeys.length < 2) return null;

      const topEdge: string[] = [];
      const bottomEdge: string[] = [];

      zKeys.forEach((z) => {
        const zPx = Math.round(zCenterOffset + (z - 7.5) * zVoxelScale);
        topEdge.push(`${zPx},${zMap[z].minY}`);
        bottomEdge.push(`${zPx},${zMap[z].maxY}`);
      });

      return [...topEdge, ...bottomEdge.reverse()].join(" ");
    }

    return null;
  }, [isCoronal, isAxial, isSagittal, currentSlice]);

  const planeName = isCoronal ? "Корональный" : isAxial ? "Аксиальный" : "Сагиттальный";

  const outerStyle: CSSProperties = stacked
    ? {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        alignSelf: "stretch",
        zIndex: stackActive ? 2 : 1,
        visibility: stackActive ? "visible" : "hidden",
        pointerEvents: stackActive ? "auto" : "none",
        ...gridStyle,
      }
    : {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        alignSelf: "stretch",
        ...gridStyle,
      };

  return (
    <div style={outerStyle}>
      <div
        ref={containerRef}
        data-viewport={plane}
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        data-viewport-id={viewportId}
        style={{
          flex: 1,
          position: "relative",
          minWidth: 0,
          minHeight: 0,
          alignSelf: "stretch",
          backgroundColor: "#000",
          border: isSelected ? "2px solid rgba(24, 144, 255, 0.9)" : "1px solid rgba(255, 255, 255, 0.10)",
          boxShadow: isSelected ? "0 0 0 1px rgba(24, 144, 255, 0.5)" : "none",
          boxSizing: "border-box",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {isEmpty && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.7)",
              color: "#888",
              fontSize: 13,
              pointerEvents: "auto",
              zIndex: 1,
            }}
          >
            Серию слева
          </div>
        )}

        {/* ============================================================= */}
        {/* ДИНАМИЧЕСКИЙ AI СЛОЙ ИЗ SEGMENTS.JSON ДЛЯ ВСЕХ 3 ПЛОСКОСТЕЙ  */}
        {/* ============================================================= */}
        {!isEmpty && showAiContour && (
          <>
            <svg
              viewBox="0 0 512 512"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 5,
              }}
            >
              {activePolygon && (
                <polygon
                  points={activePolygon}
                  fill="rgba(255, 59, 48, 0.35)"
                  stroke="#FF3B30"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              )}
            </svg>

            {/* Информационный бейдж активного среза */}
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "1px solid #FF3B30",
                borderRadius: 6,
                padding: "4px 8px",
                color: "#fff",
                fontSize: 11,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
                pointerEvents: "auto",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: activePolygon ? "#FF3B30" : "#666",
                }}
              />
              <span>
                {planeName} {currentSlice}/{maxSlices - 1} {activePolygon ? "" : ""}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAiContour(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#aaa",
                  cursor: "pointer",
                  padding: 0,
                  marginLeft: 4,
                  fontSize: 12,
                }}
                title="Скрыть контур"
              >
                ✕
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}