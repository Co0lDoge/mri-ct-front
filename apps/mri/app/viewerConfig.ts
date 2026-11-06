import type { CtViewerConfig } from "@medml/ct-mri-viewer";

export const defaultViewerConfig: CtViewerConfig = {
  pacsBasePath: "/dicoms",
  series: [
    { id: "S1", sliceStart: 0, sliceCount: 14, projection: "SAGITTAL" },
    { id: "S2", sliceStart: 0, sliceCount: 14, projection: "CORONAL" },
    { id: "S3", sliceStart: 0, sliceCount: 18, projection: "AXIAL" },
  ],
  seriesGroups: [
    {
      groupId: "G_MRI_3PLANE",
      label: "МРТ 3-плоскостная (Синхронно)",
      seriesIds: ["S1", "S2", "S3"],
    },
  ],
  initialSeriesId: "G_MRI_3PLANE",
  modality: "MR",
  defaultWindow: [1500, 3000],
};
