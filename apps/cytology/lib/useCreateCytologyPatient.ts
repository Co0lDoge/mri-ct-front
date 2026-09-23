import { message } from 'antd'
import dayjs from 'dayjs'
import { useCreateMedPatientCardMutation, useCreateMedPatientMutation } from '@medml/patients'
import { stripPolicyDigits, type PatientCreateValuesCytology } from '@medml/patient_create'

import { isGoBackend } from './apiBackend'
import { useAddPatientMutation } from './patientsApi'

/**
 * Создание карты пациента
 *
 * * **Django** — один `POST /patient/create/{doctorId}` с телом
 *   `{ patient, card }`.
 * * **Go** — сначала `POST /med/patient` создаёт пациента, затем
 *   `POST /med/card` привязывает его к врачу. Идентификатор из первого
 *   ответа нужен второму, поэтому запросы строго последовательны.
 */
export function useCreateCytologyPatient(doctorId: string): {
	createPatient: (values: PatientCreateValuesCytology) => Promise<boolean>
	isCreating: boolean
} {
	const [addPatientDjango, { isLoading: isCreatingDjango }] = useAddPatientMutation()
	const [createMedPatient, { isLoading: isCreatingMedPatient }] = useCreateMedPatientMutation()
	const [createMedCard, { isLoading: isCreatingMedCard }] = useCreateMedPatientCardMutation()

	const isCreating = isGoBackend() ? isCreatingMedPatient || isCreatingMedCard : isCreatingDjango

	const createPatient = async (values: PatientCreateValuesCytology): Promise<boolean> => {
		if (!doctorId) {
			message.warning('Не удалось определить врача')
			return false
		}

		const birthDate = dayjs(values.birthDate).format('YYYY-MM-DD')
		const policy = stripPolicyDigits(values.personalPolicy)
		const diagnosis = values.diagnosis?.trim() ?? ''

		try {
			if (isGoBackend()) {
				const fullname = [values.lastName, values.firstName, values.fathersName]
					.map(part => part.trim())
					.filter(Boolean)
					.join(' ')

				const created = await createMedPatient({
					email: values.email.trim(),
					fullname,
					policy,
					active: values.active,
					// Признака злокачественности в форме цитологии нет.
					malignancy: false,
					birth_date: birthDate,
				}).unwrap()

				if (!created.id) {
					message.error('Сервер не вернул идентификатор пациента')
					return false
				}

				await createMedCard({
					patient_id: created.id,
					doctor_id: doctorId,
					diagnosis,
				}).unwrap()
			} else {
				await addPatientDjango({
					medWorkerId: doctorId,
					payload: {
						patient: {
							first_name: values.firstName.trim(),
							last_name: values.lastName.trim(),
							fathers_name: values.fathersName.trim(),
							personal_policy: policy,
							email: values.email.trim(),
							...(values.active ? { is_active: true } : {}),
							birth_date: birthDate,
						},
						card: { diagnosis },
					},
				}).unwrap()
			}

			message.success('Карта пациента создана')
			return true
		} catch {
			message.error('Не удалось создать карту пациента')
			return false
		}
	}

	return { createPatient, isCreating }
}
