/**
 * Проекция снимка и сторона доли.
 */

export const PROJECTION_LONG = 'long' as const
export const PROJECTION_CROSS = 'cross' as const

export type ProjectionType = typeof PROJECTION_LONG | typeof PROJECTION_CROSS

export const PROJECTION_LABELS: Record<ProjectionType, string> = {
	long: 'Продольная',
	cross: 'Поперечная',
}

export type ProjectionSide = 'left' | 'right'

/** Подпись поля. Одна на все формы, чтобы загрузчик и карточка не расходились. */
export const PROJECTION_SIDE_FIELD_LABEL = 'Доля'

/** Почему поле вообще есть: от доли зависит работа моделей сегментации. */
export const PROJECTION_SIDE_HINT = 'От доли зависит работа модели сегментации структур ЩЖ'

export const PROJECTION_SIDE_LABELS: Record<ProjectionSide, string> = {
	left: 'Левая доля',
	right: 'Правая доля',
}

export const PROJECTION_OPTIONS = (Object.keys(PROJECTION_LABELS) as ProjectionType[]).map(value => ({
	value,
	label: PROJECTION_LABELS[value],
}))

export const PROJECTION_SIDE_OPTIONS = (Object.keys(PROJECTION_SIDE_LABELS) as ProjectionSide[]).map(value => ({
	value,
	label: PROJECTION_SIDE_LABELS[value],
}))

/** Нужна ли сторона доли для этой проекции. */
export function needsProjectionSide(projection: string | undefined | null): boolean {
	return projection === PROJECTION_LONG
}

/** Человеческая подпись проекции; для продольной — вместе со стороной. */
export function formatProjection(projection: string | undefined | null, side?: string | null): string {
	if (!projection?.trim()) return '—'

	const base = PROJECTION_LABELS[projection as ProjectionType] ?? projection

	if (!needsProjectionSide(projection)) return base

	const sideLabel = side ? PROJECTION_SIDE_LABELS[side as ProjectionSide] : undefined
	return sideLabel ? `${base}, ${sideLabel.toLowerCase()}` : base
}
