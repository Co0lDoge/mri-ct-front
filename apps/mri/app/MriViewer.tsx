"use client";

import { CtMriView } from "@medml/ct-mri-viewer";
import { defaultViewerConfig } from "./viewerConfig";

export default function MriViewer() {
  return (
    <CtMriView
      generalStudyId={defaultViewerConfig.initialSeriesId ?? "S1"}
      pacsBasePath={defaultViewerConfig.pacsBasePath}
      series={defaultViewerConfig.series}
      seriesGroups={defaultViewerConfig.seriesGroups}
      initialSeriesId={defaultViewerConfig.initialSeriesId}
      modality={defaultViewerConfig.modality ?? "MR"}
      enableCrosshairs
    />
  );
}