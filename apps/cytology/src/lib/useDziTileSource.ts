import * as React from "react";

import { loadDziTileSource, type DziTileSource } from "./dziTileSource";

export interface UseDziTileSourceResult {
  tileSource: DziTileSource | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Загрузка DZI-манифеста для вьюера.
 *
 * OSD нужен готовый tile source, а манифест приходится читать самим —
 * схема тайлов у тайлера не совпадает с той, что OSD достраивает по
 * умолчанию (см. `dziTileSource.ts`). Поэтому вьюер монтируем только
 * после ответа.
 */
export function useDziTileSource(imageUrl: string): UseDziTileSourceResult {
  const [tileSource, setTileSource] = React.useState<DziTileSource | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!imageUrl) {
      setTileSource(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    loadDziTileSource(imageUrl, controller.signal)
      .then((source) => {
        setTileSource(source);
        setIsLoading(false);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setTileSource(null);
        setError(reason instanceof Error ? reason.message : String(reason));
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [imageUrl]);

  return { tileSource, isLoading, error };
}
