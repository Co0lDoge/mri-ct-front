export interface TariffPlan {
	id: string
	name: string
	description: string
	price: string
	duration: number
}

export interface PaymentProvider {
	id: string
	name: string
	is_active: boolean
}

export interface Subscription {
	id: string
	tariff_plan_id: string
	status: 'pending_payment' | 'active' | 'cancelled'
	start_date: string
	end_date: string
}

export interface SubscriptionStatus {
	has_active_subscription: boolean
}

export interface SubscriptionPurchaseRequest {
	tariff_plan_id: string
	payment_provider_id: string
}

export interface SubscriptionPurchaseResponse {
	subscription_id: string
	confirmation_url: string
}

export interface PaymentHistory {
	id: string
	subscription_id: string
	amount: number
	currency: string
	status: 'completed' | 'failed' | 'pending' | 'cancelled'
	payment_date: string
	payment_provider_id: string
}

export interface SubscriptionError {
	code: string
	message: string
	details?: Record<string, unknown>
}
