import type { ViewportId } from "./constants";

/** Состояние одного фиксированного viewport’а (axial / sagittal / coronal). */
export type MprSlotState = {
  viewportId: ViewportId;
  seriesId: string | null;
  orientation: number | null;
};

export type VolumeViewportAssignment = {
  viewportId: ViewportId;
  orientation: number;
};
