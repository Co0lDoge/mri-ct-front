import type { CSSProperties } from "react";
import type { CtLayoutId } from "../layout";
import type { PlaneKey } from "./constants";

/** Внешняя сетка области просмотра: одна ячейка для режима «1» или сетка 3× для остальных. */
export function outerGridStyleForLayout(layout: CtLayoutId, minViewportPx: number): CSSProperties {
  if (layout === "1") {
    return {
      display: "grid",
      gridTemplateColumns: "minmax(256px, 1fr)",
      gridTemplateRows: "minmax(256px, 1fr)",
      gap: 8,
      flex: 1,
      minHeight: 0,
      width: "100%",
      height: "100%",
      /* нижняя граница — чтобы пустой просмотр не схлопнулся */
      minBlockSize: minViewportPx,
    };
  }
  return gridStyleForMultiLayout(layout, minViewportPx);
}

/** CSS grid для трёх viewport’ов (не режим «1 окно»). */
export function gridStyleForMultiLayout(layout: Exclude<CtLayoutId, "1">, minViewportPx: number): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns:
      layout === "3H"
        ? `minmax(256px, 1fr) minmax(256px, 1fr) minmax(256px, 1fr)`
        : layout === "3V"
          ? `minmax(256px, 1fr)`
          : `minmax(256px, 1fr) minmax(256px, 1fr)`,
    gridTemplateRows:
      layout === "3H"
        ? `minmax(256px, 1fr)`
        : layout === "3V"
          ? `minmax(256px, 1fr) minmax(256px, 1fr) minmax(256px, 1fr)`
          : `minmax(256px, 1fr) minmax(256px, 1fr)`,
    gap: 8,
    flex: 1,
    minHeight: 0,
    width: "100%",
    height: "100%",
    minBlockSize: minViewportPx,
  };
}

export function cellPlacementForPlane(layout: Exclude<CtLayoutId, "1">, plane: PlaneKey): CSSProperties {
  if (layout === "3H") {
    if (plane === "axial") return { gridColumn: "1 / 2", gridRow: "1 / 2" };
    if (plane === "sagittal") return { gridColumn: "2 / 3", gridRow: "1 / 2" };
    return { gridColumn: "3 / 4", gridRow: "1 / 2" };
  }
  if (layout === "3V") {
    if (plane === "axial") return { gridColumn: "1 / 2", gridRow: "1 / 2" };
    if (plane === "sagittal") return { gridColumn: "1 / 2", gridRow: "2 / 3" };
    return { gridColumn: "1 / 2", gridRow: "3 / 4" };
  }
  /* 2L1R */
  if (plane === "axial") return { gridColumn: "1 / 2", gridRow: "1 / 2" };
  if (plane === "sagittal") return { gridColumn: "1 / 2", gridRow: "2 / 3" };
  return { gridColumn: "2 / 3", gridRow: "1 / 3" };
}
