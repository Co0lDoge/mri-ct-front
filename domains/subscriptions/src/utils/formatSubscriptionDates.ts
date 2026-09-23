/**
 * Утилиты для форматирования дат подписки
 */

import dayjs from 'dayjs'

/**
 * Получить количество оставшихся дней до конца подписки
 */
export const getDaysRemaining = (endDate: string | Date): number => {
	return dayjs(endDate).diff(dayjs(), 'day')
}

/**
 * Проверить, истекает ли подписка в ближайшие 7 дней
 */
export const isSubscriptionExpiringSoon = (
	endDate: string | Date,
	daysThreshold = 7,
): boolean => {
	const daysLeft = getDaysRemaining(endDate)
	return daysLeft <= daysThreshold && daysLeft > 0
}

/**
 * Проверить, истекла ли подписка
 */
export const isSubscriptionExpired = (endDate: string | Date): boolean => {
	return dayjs(endDate).isBefore(dayjs())
}

/**
 * Форматировать дату окончания подписки
 */
export const formatSubscriptionEndDate = (
	endDate: string | Date,
	format = 'DD.MM.YYYY',
): string => {
	return dayjs(endDate).format(format)
}

/**
 * Получить продолжительность подписки в днях
 */
export const getDurationInDays = (durationInSeconds: number): number => {
	return Math.ceil(durationInSeconds / 86400)
}
