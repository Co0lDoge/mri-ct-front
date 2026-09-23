import type { IncomingMessage, ServerResponse } from "node:http";

import {
  handleCytologyUploadHttpRequest,
  resolveUploadRoot,
  sendJson,
  type CytologyUploadServerOptions,
} from "./server/handlers";

export type CytologyUploadApiPluginOptions = CytologyUploadServerOptions;

type ViteDevServer = {
  middlewares: {
    use: (
      handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void
    ) => void;
  };
};

/** Vite plugin без импорта типов из `vite` — иначе в monorepo ломается сравнение Plugin. */
export function cytologyUploadApiPlugin(options: CytologyUploadApiPluginOptions = {}) {
  const uploadRoot = options.uploadRoot ?? resolveUploadRoot();

  return {
    name: "cytology-upload-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/upload")) {
          next();
          return;
        }

        try {
          const url = new URL(req.url, "http://localhost");
          const handled = await handleCytologyUploadHttpRequest(
            req,
            res,
            url.pathname,
            { ...options, uploadRoot }
          );

          if (!handled) {
            sendJson(res, 404, { success: false, message: "Not found" });
          }
        } catch (error) {
          const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
          console.error(`[cytology-upload-api] ${req.method ?? "?"} ${pathname}`, error);
          sendJson(res, 500, {
            success: false,
            message: error instanceof Error ? error.message : "Internal error",
          });
        }
      });
    },
  };
}
