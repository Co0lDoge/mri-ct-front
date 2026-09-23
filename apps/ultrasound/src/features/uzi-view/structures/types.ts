export interface ThyroidStructureDetails {
	confidence?: number
	coords: [number, number][]
}

/** Структуры одного кадра: имя структуры → контур. */
export type ThyroidStructureFrame = Record<string, ThyroidStructureDetails>

/**
 * JSON со структурами ЩЖ: `view_type` + произвольные ключи-кадры.
 *
 * Индексная сигнатура обязана включать тип `view_type` (иначе TS2411), поэтому
 * значение — union. Для чтения кадров используйте `getStructureFrame`, который
 * делает сужение в одном месте вместо `as any` по месту использования.
 */
export interface ThyroidStructureJson {
	view_type: string
	[frameIndex: string]: ThyroidStructureFrame | string
}

/** Кадры JSON-а, кроме служебного `view_type`. */
export function getStructureFrameKeys(structures: ThyroidStructureJson): string[] {
	return Object.keys(structures)
		.filter(key => key !== 'view_type')
		.sort()
}

/** Безопасно достаёт структуры кадра, отсекая служебный `view_type`. */
export function getStructureFrame(
	structures: ThyroidStructureJson | undefined,
	frameIndex: string | number,
): ThyroidStructureFrame | undefined {
	if (!structures) return undefined
	const key = String(frameIndex)
	if (key === 'view_type') return undefined
	const frame = structures[key]
	return typeof frame === 'string' || frame == null ? undefined : frame
}
