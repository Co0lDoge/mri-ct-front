import { useGetTariffPlansQuery, useGetTariffPlanByIdQuery } from '@medml/store'

export const useTariffPlans = () => {
	const { data: tariffPlans = [], isLoading, isError, error } =
		useGetTariffPlansQuery()
	return { tariffPlans, isLoading, isError, error }
}

export const useTariffPlanById = (id?: string) => {
	const { data: tariffPlan, isLoading, isError, error } =
		useGetTariffPlanByIdQuery(id ?? '', { skip: !id })
	return { tariffPlan, isLoading, isError, error }
}
