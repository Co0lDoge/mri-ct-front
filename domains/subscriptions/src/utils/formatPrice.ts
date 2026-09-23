/** Цена с бэкенда приходит строкой в рублях, например "50.5" */
export const formatPrice = (price: string | number, currency = 'RUB'): string => {
	const value = typeof price === 'string' ? parseFloat(price) : price
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency,
	}).format(Number.isFinite(value) ? value : 0)
}

export const durationToDays = (durationSeconds: number): number =>
	Math.max(1, Math.floor(durationSeconds / 86400))
