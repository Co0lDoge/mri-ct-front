import type { CtViewerConfig } from "../types";

/** Поля, влияющие только на запасной VOI (без DICOM-тегов на кадре). */
export type VoiPolicyConfig = Pick<CtViewerConfig, "modality" | "defaultWindow">;

const DEFAULT_WINDOW: Record<string, [number, number]> = {
  CT: [40, 400],
  MR: [400, 800],
};

/**
 * Запасной диапазон [lower, upper], когда **нет кадра** (не должно часто случаться).
 */
export function getWindowRangeFromConfig(config: VoiPolicyConfig): [number, number] {
  if (config.defaultWindow) {
    const [center, width] = config.defaultWindow;
    return [center - width / 2, center + width / 2];
  }
  const modality = config.modality === "MR" ? "MR" : "CT";
  const [center, width] = DEFAULT_WINDOW[modality];
  return [center - width / 2, center + width / 2];
}

/** Совпадает с превью в сайдбаре: при отсутствии WC/WW на кадре — 40/400, а не «модальный» запас тома. */
export const PREVIEW_MATCH_FALLBACK_WC = 40;
export const PREVIEW_MATCH_FALLBACK_WW = 400;

type ImageWithVoi = {
  windowCenter?: number | number[];
  windowWidth?: number | number[];
};

/**
 * Один VOI для тома и для превью: WC/WW с кадра, иначе те же числа, что в `StudyListSidebar` при отрисовке canvas.
 */
export function voiRangeFromImage(image: ImageWithVoi | undefined, policy: VoiPolicyConfig): [number, number] {
  if (!image) {
    return getWindowRangeFromConfig(policy);
  }
  const wc = Array.isArray(image.windowCenter)
    ? image.windowCenter[0]
    : (image.windowCenter ?? PREVIEW_MATCH_FALLBACK_WC);
  const ww = Array.isArray(image.windowWidth)
    ? image.windowWidth[0]
    : (image.windowWidth ?? PREVIEW_MATCH_FALLBACK_WW);
  return [wc - ww / 2, wc + ww / 2];
}

export function createTransferFunctionMappingSetter(range: [number, number]) {
  return ({
    volumeActor,
  }: {
    volumeActor: {
      getProperty: () => { getRGBTransferFunction: (i: number) => { setMappingRange: (l: number, u: number) => void } };
    };
  }) => {
    volumeActor.getProperty().getRGBTransferFunction(0).setMappingRange(range[0], range[1]);
  };
}
