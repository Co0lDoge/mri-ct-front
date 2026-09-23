/** Извлекает orderId (payment_id YooKassa) из confirmation_url */
export const parsePaymentIdFromConfirmationUrl = (
	confirmationUrl: string,
): string | null => {
	try {
		const url = new URL(confirmationUrl)
		return url.searchParams.get('orderId')
	} catch {
		const match = /orderId=([^&]+)/.exec(confirmationUrl)
		return match?.[1] ?? null
	}
}
