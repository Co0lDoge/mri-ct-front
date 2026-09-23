/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_BACKEND_BASE_URL?: string
	readonly VITE_API_BASE_URL?: string
	readonly VITE_BACKEND_PROXY_TARGET?: string
	readonly VITE_ULTRASOUND_PROXY_TARGET?: string
	/** Только `true` — включить GET проверку сессии на бэкенде (по умолчанию выкл.) */
	readonly VITE_SESSION_CHECK?: string
	/** Путь относительно API base (по умолчанию `/session`) */
	readonly VITE_SESSION_PATH?: string
	/** Путь refresh относительно API base (по умолчанию `/auth/token/refresh/`) */
	readonly VITE_AUTH_REFRESH_PATH?: string
	/** `thyroid` (по умолчанию) | `med` — какой набор API-путей использовать */
	readonly VITE_API_BACKEND?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

declare module "@recogito/annotorious-openseadragon";
declare module "@recogito/annotorious-selector-pack";
declare module "svg-polygon-points" {
	export function fromGeoJSON(coords: number[][]): { toString(): string };
	export function toGeoJSON(svg: string): number[][][];
}
