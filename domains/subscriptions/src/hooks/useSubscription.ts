import {
	useAppSelector,
	useGetActiveSubscriptionQuery,
	useCheckActiveSubscriptionQuery,
	usePurchaseSubscriptionMutation,
	useGetTariffPlansQuery,
	useGetPaymentProvidersQuery,
} from '@medml/store'
import type { SubscriptionPurchaseRequest } from '../types'

export interface UseSubscriptionReturn {
	subscription: ReturnType<typeof useGetActiveSubscriptionQuery>['data']
	tariffPlans: ReturnType<typeof useGetTariffPlansQuery>['data']
	paymentProviders: ReturnType<typeof useGetPaymentProvidersQuery>['data']
	hasActiveSubscription: boolean
	selectedTariffId: string | null
	selectedPaymentProviderId: string | null
	modalStep: 'tariff' | 'payment' | 'waiting'
	isModalOpen: boolean
	isLoading: boolean
	isCheckingStatus: boolean
	isPurchasing: boolean
	purchaseSubscription: (
		data: SubscriptionPurchaseRequest,
	) => Promise<{ confirmation_url: string }>
	refetchStatus: () => void
	subscriptionError: unknown
	purchaseError: unknown
}

export const useSubscription = (): UseSubscriptionReturn => {
	const { data: statusData, isLoading: isCheckingStatus, refetch } =
		useCheckActiveSubscriptionQuery()
	const hasActiveSubscription = statusData?.has_active_subscription ?? false

	const {
		data: subscription,
		isLoading: isLoadingSubscription,
		error: subscriptionError,
	} = useGetActiveSubscriptionQuery(undefined, {
		skip: !hasActiveSubscription,
	})

	const { data: tariffPlans } = useGetTariffPlansQuery()
	const { data: paymentProviders } = useGetPaymentProvidersQuery()
	const [purchase, { isLoading: isPurchasing, error: purchaseError }] =
		usePurchaseSubscriptionMutation()

	const subscriptionState = useAppSelector(state => state.subscription)

	const isLoading = isLoadingSubscription || isCheckingStatus

	return {
		subscription,
		tariffPlans,
		paymentProviders,
		hasActiveSubscription,
		selectedTariffId: subscriptionState.selectedTariffId,
		selectedPaymentProviderId: subscriptionState.selectedPaymentProviderId,
		modalStep: subscriptionState.modalStep,
		isModalOpen: subscriptionState.isModalOpen,
		isLoading,
		isCheckingStatus,
		isPurchasing,
		purchaseSubscription: async (data: SubscriptionPurchaseRequest) => {
			const result = await purchase(data).unwrap()
			return { confirmation_url: result.confirmation_url }
		},
		refetchStatus: () => {
			void refetch()
		},
		subscriptionError,
		purchaseError,
	}
}
