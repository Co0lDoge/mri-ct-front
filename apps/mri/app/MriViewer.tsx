"use client";

import { CtMriView } from "@medml/ct-mri-viewer";
import { defaultViewerConfig } from "./viewerConfig";
import segmentsData from "./segments.json";

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
      segments={segmentsData as any}
      studyInfo={{
        conclusion: "МР-признаки эндоселлярной аденомы гипофиза. Автоматическая 3D-сегментация nnU-Net: локализация подтверждена (Knosp 0-1-2: 85%, Knosp 3: 10%, Knosp 4: 5%).",
        statusLabel: "Обработано ИИ (nnU-Net 3D)",
      }}
    />
  );
}