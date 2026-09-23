/**
 * Утилиты для валидации подписок и платежей
 */

import type { SubscriptionPurchaseRequest } from '../types'

/**
 * Валидировать запрос на покупку подписки
 */
export const validatePurchaseRequest = (
	request: SubscriptionPurchaseRequest,
): { isValid: boolean; errors: string[] } => {
	const errors: string[] = []

	if (!request.tariff_plan_id) {
		errors.push('Tariff plan is required')
	}

	if (!request.payment_provider_id) {
		errors.push('Payment provider is required')
	}

	return {
		isValid: errors.length === 0,
		errors,
	}
}

/**
 * Валидировать confirmation_url от платежного шлюза
 */
export const validateConfirmationUrl = (url: string): boolean => {
	try {
		new URL(url)
		return true
	} catch {
		return false
	}
}
