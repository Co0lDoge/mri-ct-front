import { isGoBackend } from '@/lib/apiBackend'

/**
 * Тайлы DZI для OpenSeadragon.
 */

export interface DziMeta {
	width: number
	height: number
	tileSize: number
	overlap: number
	format: string
}

export interface DziTileSource extends DziMeta {
	tileOverlap: number
	minLevel: number
	maxLevel: number
	getTileUrl: (level: number, x: number, y: number) => string
}

function getApiBaseUrl(): string {
	const value = import.meta.env.VITE_API_BASE_URL
	return typeof value === 'string' && value.length > 0 ? value.replace(/\/+$/, '') : '/api/v3'
}

/** База отдельного DZI-сервиса (только для python-бэкенда). */
export function getDziApiBaseUrl(): string {
	const value = import.meta.env.VITE_DZI_API_BASE_URL
	return typeof value === 'string' && value.length > 0 ? value.replace(/\/+$/, '') : '/api/bid/v1/dzi'
}

export function normalizeFilePath(imageUrl: string): string {
	return imageUrl.replace(/^\/media\//, '').replace(/^\/+/, '')
}

/**
 * Адрес DZI-манифеста.
 *
 * В go-режиме путь обязан быть percent-encoded целиком: роутер шлюза
 * забирает `{file_path}` до первого слеша, поэтому сырые разделители
 * развалили бы маршрут.
 */
export function buildDziUrl(imageUrl: string): string {
	const filePath = normalizeFilePath(imageUrl)
	return isGoBackend()
		? `${getApiBaseUrl()}/tiler/dzi/${encodeURIComponent(filePath)}`
		: `${getDziApiBaseUrl()}/${filePath}`
}

/** Адрес одного тайла. Схема `{file_path}/files/{level}/{col}_{row}.{format}`. */
export function buildTileUrl(imageUrl: string, level: number, col: number, row: number, format: string): string {
	return `${buildDziUrl(imageUrl)}/files/${level}/${col}_${row}.${format}`
}

export function parseDziXml(xml: string): DziMeta | null {
	const doc = new DOMParser().parseFromString(xml, 'application/xml')
	if (doc.querySelector('parsererror')) return null

	const image = doc.querySelector('Image')
	const size = doc.querySelector('Size')
	if (!image || !size) return null

	const width = Number(size.getAttribute('Width'))
	const height = Number(size.getAttribute('Height'))
	if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
		return null
	}

	return {
		width,
		height,
		tileSize: Number(image.getAttribute('TileSize')) || 256,
		overlap: Number(image.getAttribute('Overlap')) || 0,
		format: image.getAttribute('Format') || 'jpeg',
	}
}

export function dziMaxLevel(width: number, height: number): number {
	return Math.ceil(Math.log2(Math.max(width, height)))
}

/**
 * Загрузить манифест и собрать tile source для OSD.
 */
export async function loadDziTileSource(imageUrl: string, signal?: AbortSignal): Promise<DziTileSource> {
	const url = buildDziUrl(imageUrl)
	const response = await fetch(url, { signal })
	if (!response.ok) {
		throw new Error(`Не удалось загрузить DZI (${response.status}): ${url}`)
	}

	const meta = parseDziXml(await response.text())
	if (!meta) {
		throw new Error(`Некорректный DZI-манифест: ${url}`)
	}

	return {
		...meta,
		tileOverlap: meta.overlap,
		minLevel: 0,
		maxLevel: dziMaxLevel(meta.width, meta.height),
		getTileUrl: (level, x, y) => buildTileUrl(imageUrl, level, x, y, meta.format),
	}
}
