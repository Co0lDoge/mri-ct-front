import type { CtViewerConfig } from "@medml/ct-mri-viewer";

/**
 * Конфиг по умолчанию для CT-просмотрщика.
 * Использует mock данные из public/dicoms для тестирования.
 */
export const defaultViewerConfig: CtViewerConfig = {
  pacsBasePath: "/dicoms",
  series: [{ id: "S1", sliceStart: 0, sliceCount: 14 }],
  initialSeriesId: "S1",
  modality: "CT",
};
