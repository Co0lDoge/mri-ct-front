"use client";

import type { Ref } from "react";
import type { CtLayoutId } from "../../layout";
import type { MprSlotState } from "../../viewer/types";
import { PLANES, PLANE_TO_ORIENTATION, PLANE_TO_VIEWPORT_ID, VIEWPORT_MIN_SIZE_PX } from "../../viewer/constants";
import { outerGridStyleForLayout, cellPlacementForPlane } from "../../viewer/multiLayoutGrid";
import { MprViewportTile } from "./MprViewportTile";

type Props = {
  layout: CtLayoutId;
  slots: MprSlotState[];
  /** Режим «1 окно»: какая проекция видна (0 / 1 / 2). */
  singleProjection: 0 | 1 | 2;
  /** Только сетка окон — для ResizeObserver после смены раскладки */
  gridRootRef?: Ref<HTMLDivElement>;
};

/**
 * Три MPR-окна — всегда три прямых потомка одной сетки (ref для ResizeObserver не меняет «родителя» плиток).
 * Режим «1»: те же узлы `[data-viewport]`, те же родители — все три плитки в одной grid-ячейке (перекрытие),
 * без обёртки и репарента: иначе RenderingEngine теряет связь с canvas и даёт чёрный экран.
 */
export function MprViewportGrid({ layout, slots, singleProjection, gridRootRef }: Props) {
  const minH = VIEWPORT_MIN_SIZE_PX;
  const gridStyle = outerGridStyleForLayout(layout, minH);

  return (
    <div ref={gridRootRef} style={gridStyle}>
      {PLANES.map((plane) => {
        const viewportId = PLANE_TO_VIEWPORT_ID[plane];
        const slot = slots.find((s) => s.viewportId === viewportId);
        const isSingle = layout === "1";
        const cellStyle =
          isSingle
            ? { gridColumn: "1 / 2", gridRow: "1 / 2" }
            : cellPlacementForPlane(layout, plane);
        const stackActive = !isSingle || PLANE_TO_ORIENTATION[plane] === singleProjection;
        return (
          <MprViewportTile
            key={plane}
            plane={plane}
            viewportId={viewportId}
            slot={slot}
            isSelected={false}
            onSelect={() => {}}
            gridStyle={cellStyle}
            stacked={isSingle}
            stackActive={stackActive}
          />
        );
      })}
    </div>
  );
}
