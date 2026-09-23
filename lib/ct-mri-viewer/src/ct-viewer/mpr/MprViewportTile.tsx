"use client";

import type { CSSProperties } from "react";
import type { PlaneKey } from "../../viewer/constants";
import type { MprSlotState } from "../../viewer/types";
import type { ViewportId } from "../../viewer/constants";

type Props = {
  plane: PlaneKey;
  viewportId: ViewportId;
  slot: MprSlotState | undefined;
  isSelected: boolean;
  onSelect: () => void;
  gridStyle?: CSSProperties;
  /** Режим «1 окно»: та же плитка в общей grid-ячейке; не display:none (0×0 у Cornerstone). */
  stacked?: boolean;
  stackActive?: boolean;
};

/**
 * Один «плиточный» viewport: div с `data-viewport={plane}` — по нему Cornerstone привязывает canvas.
 */
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
  /* Один столбец: элементы — grid-items в одной ячейке (не position:absolute — иначе якорь съезжает).
   * Скрытые плоскости: visibility:hidden + низкий z-index (без opacity:0 у соседних WebGL). */
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
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            Нажмите на серию слева
          </div>
        )}
      </div>
    </div>
  );
}
