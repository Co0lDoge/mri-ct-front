/**
 * Статические идентификаторы Cornerstone и разметки UI для MPR-просмотровщика.
 * Порядок: константы движка → viewport’ы → привязка DOM (data-viewport) → ориентации.
 */

export const VIEWPORT_MIN_SIZE_PX = 640;

/** ID движка рендеринга в Cornerstone (должен быть уникален на страницу). */
export const RENDERING_ENGINE_ID = "pet-ct-viewer";

export const VIEWPORT_IDS = {
  CT_AXIAL: "CT_AXIAL",
  CT_SAGITTAL: "CT_SAGITTAL",
  CT_CORONAL: "CT_CORONAL",
} as const;

export const ALL_VIEWPORT_IDS = [
  VIEWPORT_IDS.CT_AXIAL,
  VIEWPORT_IDS.CT_SAGITTAL,
  VIEWPORT_IDS.CT_CORONAL,
] as const;

export type ViewportId = (typeof ALL_VIEWPORT_IDS)[number];

/** data-viewport на div → ID viewport в RenderingEngine */
export const PLANE_TO_VIEWPORT_ID: Record<"axial" | "sagittal" | "coronal", ViewportId> = {
  axial: VIEWPORT_IDS.CT_AXIAL,
  sagittal: VIEWPORT_IDS.CT_SAGITTAL,
  coronal: VIEWPORT_IDS.CT_CORONAL,
};

export const PLANES = ["axial", "sagittal", "coronal"] as const;
export type PlaneKey = (typeof PLANES)[number];

/** 0 = axial, 1 = sagittal, 2 = coronal (как в assignments при загрузке) */
export const PLANE_TO_ORIENTATION: Record<PlaneKey, 0 | 1 | 2> = {
  axial: 0,
  sagittal: 1,
  coronal: 2,
};

const CT_VOLUME_PREFIX = "ct-volume-";
export const volumeIdForSeries = (seriesId: string) => `${CT_VOLUME_PREFIX}${seriesId}`;

/** Обратное к `volumeIdForSeries` (ID серии в том же виде, что в конфиге). */
export const seriesIdFromVolumeId = (volId: string): string | null =>
  volId.startsWith(CT_VOLUME_PREFIX) ? volId.slice(CT_VOLUME_PREFIX.length) : null;
export const toolGroupIdForSeries = (seriesId: string) => `ct-toolgroup-${seriesId}`;

/** Кнопки тулбара (совпадают с CtViewerToolbar) */
export const VIEWER_TOOLS = ["WindowLevel", "Crosshairs", "Length", "RectangleROI", "EllipseROI"] as const;
export type ViewerToolId = (typeof VIEWER_TOOLS)[number];

/** Подписи для Segmented «проекция в одном окне» */
export const MPR_PROJECTION_OPTIONS = [
  { id: 0 as const, label: "Аксиальная" },
  { id: 1 as const, label: "Сагиттальная" },
  { id: 2 as const, label: "Корональная" },
];
