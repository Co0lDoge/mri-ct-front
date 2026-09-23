import path from "path";
import type { UserConfig } from "vite";

/**
 * Общие resolve-алиасы и параметры dev-сервера для SPA-приложений платформы.
 */
export function medmlSpaSharedConfig(repoRoot: string): Pick<UserConfig, "resolve" | "server"> {
  return {
    resolve: {
      alias: {
        "@medml/ui/styles": path.resolve(repoRoot, "lib/ui/src/styles"),
      },
    },
    server: {
      proxy: {
        "/api/bid": {
          target: process.env.VITE_DZI_PROXY_TARGET ?? "http://127.0.0.1:8005",
          changeOrigin: true,
        },
        "/api": {
          target:
            process.env.VITE_API_PROXY_TARGET ??
            process.env.VITE_PROXY_TARGET ??
            "http://127.0.0.1:7000",
          changeOrigin: true,
        },
      },
    },
  };
}
