import { useCallback, useEffect, useState } from 'react'
import { Form, message } from 'antd'
import type { FormInstance } from 'antd'
import { useUpdateThyroidUziDataMutation } from '@/api/uziApi'
import type { ThyroidUziApiResponse, UziDeviceInfo } from '../model/types'
import { PROJECTION_LONG, needsProjectionSide } from '@/lib/projection'

export interface UseThyroidStudyFormOptions {
	uziId: string
	data: ThyroidUziApiResponse | undefined
	devices: UziDeviceInfo[] | undefined
}

export interface UseThyroidStudyFormResult {
	form: FormInstance
	saving: boolean
	modalVisible: boolean
	setModalVisible: (visible: boolean) => void
	handleSave: () => Promise<void>
}

/**
 * Синхронизация формы параметров исследования с ответом API и её сохранение.
 * Раньше и заполнение полей, и сборка payload жили прямо в `ResultsPage`.
 */
export function useThyroidStudyForm({ uziId, data, devices }: UseThyroidStudyFormOptions): UseThyroidStudyFormResult {
	const [form] = Form.useForm()
	const [saving, setSaving] = useState(false)
	const [modalVisible, setModalVisible] = useState(false)
	const [updateUzi] = useUpdateThyroidUziDataMutation()

	useEffect(() => {
		if (!data || !devices) return

		const { details } = data.info
		form.setFieldsValue({
			uziDevice: devices.find(d => d.name === data.info.uzi_device_name)?.id ?? null,
			projectionType: details.projection_type || PROJECTION_LONG,
			projectionSide: needsProjectionSide(details.projection_type || PROJECTION_LONG)
				? (details.projection_side ?? undefined)
				: undefined,
			shortResult: data.info.has_nodules === 'T',
			diagnosis: data.info.diagnosis,
			cdk: details.cdk,
			echogenicity: details.echogenicity,
			isthmus: details.isthmus,
			left_depth: details.left_depth,
			left_length: details.left_length,
			left_width: details.left_width,
			position: details.position,
			profile: details.profile,
			result: details.result,
			right_depth: details.right_depth,
			right_length: details.right_length,
			right_width: details.right_width,
			rln: details.rln,
			structure: details.structure,
			additional_data: details.additional_data,
		})
	}, [data, devices, form])

	const handleSave = useCallback(async () => {
		setSaving(true)
		try {
			const values = await form.validateFields()

			await updateUzi({
				uziId,
				data: {
					patient_card: {
						patient: data?.info.patient.id,
						has_nodules: values.shortResult ? 'T' : 'F',
						diagnosis: values.diagnosis,
					},
					acceptance_datetime: data?.info.diagnos_date,
					details: {
						...values,
						// Бэкенд ждёт snake_case; поля формы названы иначе,
						// поэтому проекцию и сторону кладём явно.
						projection_type: values.projectionType,
						projection_side: needsProjectionSide(values.projectionType) ? (values.projectionSide ?? null) : null,
						nodule_type: [],
						ai_info: [],
					},
					uzi_device: values.uziDevice,
				},
			}).unwrap()

			// Перечитывать снимок вручную не нужно: мутация инвалидирует
			// тег Uzi, и RTK Query обновит данные сам.
			message.success('Результат сохранен!')
			setModalVisible(false)
		} catch (saveError) {
			console.error('Error saving:', saveError)
			message.error('Ошибка при сохранении')
		} finally {
			setSaving(false)
		}
	}, [data, form, updateUzi, uziId])

	return { form, saving, modalVisible, setModalVisible, handleSave }
}
