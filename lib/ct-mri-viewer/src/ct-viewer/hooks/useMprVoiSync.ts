import { useEffect, useRef } from "react";
import { EVENTS, getRenderingEngine } from "@cornerstonejs/core";
import { ALL_VIEWPORT_IDS, RENDERING_ENGINE_ID } from "../../viewer/constants";

type VoiDetail = {
  viewportId: string;
  volumeId: string;
  range?: { lower: number; upper: number };
};

type VpWithVoi = {
  element?: EventTarget | null;
  getVolumeId?: () => string;
  setVOI?: (voi: { lower: number; upper: number }, volumeId?: string, suppressEvents?: boolean) => void;
};

/**
 * Один том на три MPR, но WindowLevel по умолчанию меняет только активный viewport.
 * Дублируем VOI на остальные ортогональные окна по событию CORNERSTONE_VOI_MODIFIED.
 */
export function useMprVoiSync(cornerstoneReady: boolean): void {
  const applyingRef = useRef(false);

  useEffect(() => {
    if (!cornerstoneReady) return;
    const re = getRenderingEngine(RENDERING_ENGINE_ID);
    if (!re) return;

    const onVoi = (evt: Event) => {
      if (applyingRef.current) return;
      const ce = evt as CustomEvent<VoiDetail>;
      const d = ce.detail;
      if (!d?.range || d.volumeId == null) return;

      applyingRef.current = true;
      try {
        for (const id of ALL_VIEWPORT_IDS) {
          if (id === d.viewportId) continue;
          const vp = re.getViewport(id) as unknown as VpWithVoi;
          const vid = typeof vp.getVolumeId === "function" ? vp.getVolumeId() : undefined;
          if (vid !== d.volumeId || typeof vp.setVOI !== "function") continue;
          vp.setVOI({ lower: d.range.lower, upper: d.range.upper }, d.volumeId, true);
        }
        re.renderViewports([...ALL_VIEWPORT_IDS]);
      } finally {
        applyingRef.current = false;
      }
    };

    const cleanups: (() => void)[] = [];
    for (const id of ALL_VIEWPORT_IDS) {
      const vp = re.getViewport(id) as unknown as VpWithVoi;
      const el = vp?.element;
      if (!el || typeof el.addEventListener !== "function") continue;
      el.addEventListener(EVENTS.VOI_MODIFIED, onVoi);
      cleanups.push(() => el.removeEventListener(EVENTS.VOI_MODIFIED, onVoi));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [cornerstoneReady]);
}
