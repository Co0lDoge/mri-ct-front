import { getRenderingEngine } from "@cornerstonejs/core";
import { ALL_VIEWPORT_IDS, RENDERING_ENGINE_ID } from "./constants";

type ViewportWithPresentation = {
  getViewPresentation?: () => unknown;
  setViewPresentation?: (p: unknown) => void;
};

function snapshotPresentations(re: NonNullable<ReturnType<typeof getRenderingEngine>>): Map<string, unknown> {
  const out = new Map<string, unknown>();
  for (const id of ALL_VIEWPORT_IDS) {
    const vp = re.getViewport(id) as unknown as ViewportWithPresentation;
    if (vp?.getViewPresentation == null) continue;
    try {
      out.set(id, vp.getViewPresentation());
    } catch {
      /* viewport пустой */
    }
  }
  return out;
}

function restorePresentations(re: NonNullable<ReturnType<typeof getRenderingEngine>>, snaps: Map<string, unknown>): void {
  for (const id of ALL_VIEWPORT_IDS) {
    const pres = snaps.get(id);
    if (pres == null) continue;
    const vp = re.getViewport(id) as unknown as ViewportWithPresentation;
    if (vp?.setViewPresentation == null) continue;
    try {
      vp.setViewPresentation(pres);
    } catch {
      /* */
    }
  }
}

/** Сохранить zoom/pan/displayArea, выполнить resize, вернуть — без потери масштаба при смене размера canvas. */
export function resizeEnginePreserveViewPresentationSync(): void {
  const re = getRenderingEngine(RENDERING_ENGINE_ID);
  if (!re) return;
  try {
    const snaps = snapshotPresentations(re);
    re.resize(true, true);
    restorePresentations(re, snaps);
    re.renderViewports([...ALL_VIEWPORT_IDS]);
  } catch (e) {
    console.warn("[ct-mri-viewer] resize/render:", e);
  }
}

/** После смены CSS-раскладки — два rAF, затем resize с сохранением вида. */
export function resizeEngineAfterLayout(): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      resizeEnginePreserveViewPresentationSync();
    });
  });
}
