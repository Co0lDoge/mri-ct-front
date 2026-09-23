import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SubscriptionModalStep = 'tariff' | 'payment' | 'waiting'

export interface SubscriptionState {
	selectedTariffId: string | null
	selectedPaymentProviderId: string | null
	modalStep: SubscriptionModalStep
	isModalOpen: boolean
}

const initialState: SubscriptionState = {
	selectedTariffId: null,
	selectedPaymentProviderId: null,
	modalStep: 'tariff',
	isModalOpen: false,
}

const subscriptionSlice = createSlice({
	name: 'subscription',
	initialState,
	reducers: {
		setSelectedTariff(state, action: PayloadAction<string | null>) {
			state.selectedTariffId = action.payload
		},
		setSelectedPaymentProvider(state, action: PayloadAction<string | null>) {
			state.selectedPaymentProviderId = action.payload
		},
		setModalStep(state, action: PayloadAction<SubscriptionModalStep>) {
			state.modalStep = action.payload
		},
		openModal(state) {
			state.isModalOpen = true
			state.modalStep = 'tariff'
			state.selectedTariffId = null
			state.selectedPaymentProviderId = null
		},
		closeModal(state) {
			state.isModalOpen = false
			state.modalStep = 'tariff'
			state.selectedTariffId = null
			state.selectedPaymentProviderId = null
		},
	},
})

export const {
	setSelectedTariff,
	setSelectedPaymentProvider,
	setModalStep,
	openModal,
	closeModal,
} = subscriptionSlice.actions

export default subscriptionSlice
