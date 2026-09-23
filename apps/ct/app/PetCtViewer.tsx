"use client";

import { CtMriView } from "@medml/ct-mri-viewer";
import { defaultViewerConfig } from "./viewerConfig";

export default function PetCtViewer() {
  const { pacsBasePath, series, initialSeriesId, modality } = defaultViewerConfig;

  return (
    <CtMriView
      generalStudyId={initialSeriesId ?? "S1"}
      pacsBasePath={pacsBasePath}
      series={series}
      initialSeriesId={initialSeriesId}
      modality={modality ?? "CT"}
      enableCrosshairs
    />
  );
}
