/**
 * Прежний модуль адресов DZI.
 *
 * Оставлен ради обратной совместимости: логика переехала в
 * `dziTileSource.ts`, где вместе с адресами живёт разбор манифеста и
 * построение tile source со своим `getTileUrl`.
 */
export { buildDziUrl, getDziApiBaseUrl, normalizeFilePath } from './dziTileSource'

/** @deprecated Строку в OSD передавать нельзя — используйте `loadDziTileSource`. */
export { buildDziUrl as buildDziTileSources } from './dziTileSource'
