import { useGetPaymentProvidersQuery } from '@medml/store'

export interface UsePaymentProvidersReturn {
	paymentProviders: ReturnType<typeof useGetPaymentProvidersQuery>['data']
	isLoading: boolean
	isError: boolean
	error: unknown
}

export const usePaymentProviders = (): UsePaymentProvidersReturn => {
	const { data: paymentProviders = [], isLoading, isError, error } =
		useGetPaymentProvidersQuery()
	return { paymentProviders, isLoading, isError, error }
}
