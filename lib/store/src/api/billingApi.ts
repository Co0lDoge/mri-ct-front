import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { baseApi } from './baseApi'

const billingBase = (): string => {
	let base = '/api/v1'
	try {
		const env = (import.meta as { env?: Record<string, string | undefined> }).env
		base = env?.VITE_BILLING_BASE_URL ?? base
	} catch {
		/* ignore */
	}

	const path = base.replace(/\/$/, '')
	if (typeof window === 'undefined') return path
	return `${window.location.origin}${path}`
}

const url = (path: string): string => `${billingBase()}${path}`

export interface TariffPlanDto {
	id: string
	name: string
	description: string
	/** Строкой, а не числом: `"10"`, `"50.5"`. */
	price: string
	/** Секунды. */
	duration: number
}

export interface PaymentProviderDto {
	id: string
	name: string
	is_active: boolean
}

export interface SubscriptionDto {
	id: string
	tariff_plan_id: string
	status: 'pending_payment' | 'active' | 'cancelled'
	start_date: string
	end_date: string
}

export interface SubscriptionStatusDto {
	has_active_subscription: boolean
}

export interface SubscriptionPurchaseRequestDto {
	tariff_plan_id: string
	payment_provider_id: string
}

export interface SubscriptionPurchaseResponseDto {
	subscription_id: string
	confirmation_url: string
}

export const billingApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getTariffPlans: builder.query<TariffPlanDto[], void>({
			query: () => url('/tariff_plans'),
			providesTags: ['Billing'],
		}),

		getTariffPlanById: builder.query<TariffPlanDto, string>({
			query: id => url(`/tariff_plans/${encodeURIComponent(id)}`),
			providesTags: ['Billing'],
		}),

		getPaymentProviders: builder.query<PaymentProviderDto[], void>({
			query: () => url('/payment_providers'),
			providesTags: ['Billing'],
		}),

		checkActiveSubscription: builder.query<SubscriptionStatusDto, void>({
			query: () => url('/subscriptions/check-active'),
			providesTags: ['Subscription'],
		}),

		getActiveSubscription: builder.query<SubscriptionDto | null, void>({
			async queryFn(_arg, _api, _extraOptions, baseQuery) {
				const result = (await baseQuery(url('/subscriptions/get-active'))) as {
					data?: SubscriptionDto
					error?: FetchBaseQueryError
				}

				if (result.error) {
					if (result.error.status === 404) return { data: null }
					return { error: result.error }
				}

				return { data: result.data ?? null }
			},
			providesTags: ['Subscription'],
		}),

		purchaseSubscription: builder.mutation<SubscriptionPurchaseResponseDto, SubscriptionPurchaseRequestDto>({
			query: body => ({
				url: url('/subscriptions/purchase'),
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Subscription'],
		}),
	}),
})

export const {
	useGetTariffPlansQuery,
	useGetTariffPlanByIdQuery,
	useGetPaymentProvidersQuery,
	useCheckActiveSubscriptionQuery,
	useGetActiveSubscriptionQuery,
	useLazyCheckActiveSubscriptionQuery,
	usePurchaseSubscriptionMutation,
} = billingApi
