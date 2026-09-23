import { message } from 'antd'

import { PageShell } from '@medml/layout'
import {
	DoctorProfileEditPage,
	type DoctorProfileFormValues,
} from '@medml/doctor_profile'

import {
	useGetDoctorProfileQuery,
	useUpdateDoctorProfileMutation,
} from '@/api/doctorApi'
import { useDoctorId } from '@/api/hooks/useDoctorId'

/**
 * Редактирование профиля врача (`/profile/edit`).
 *
 * Маршрут — тонкая обёртка: данные и сохранение здесь, вся форма —
 * в домене `@medml/doctor_profile`.
 */
export default function DoctorProfileEditRoute() {
	const { doctorId, status } = useDoctorId()

	const { data: doctor, isLoading } = useGetDoctorProfileQuery(doctorId, {
		skip: !doctorId || status !== 'authenticated',
	})

	const [updateProfile, { isLoading: isSaving }] = useUpdateDoctorProfileMutation()

	const handleSubmit = async (values: DoctorProfileFormValues) => {
		try {
			await updateProfile({
				doctorId,
				last_name: values.lastName.trim(),
				first_name: values.firstName.trim(),
				fathers_name: values.fathersName.trim(),
				job: values.job?.trim() ?? '',
				med_organization: values.medOrganization.trim(),
				is_remote_worker: Boolean(values.isRemoteWorker),
				expert_details: values.expertDetails?.trim() ?? '',
			}).unwrap()

			message.success('Профиль обновлён')
		} catch (error: any) {
			console.error('Error updating doctor profile:', error)
			message.error(error?.data?.detail || 'Не удалось сохранить профиль')
		}
	}

	return (
		<PageShell
			title='Профиль врача'
			subtitle='Обновите персональные данные и профессиональный профиль.'
		>
			<DoctorProfileEditPage
				profile={doctor}
				loading={isLoading}
				saving={isSaving}
				onSubmit={handleSubmit}
			/>
		</PageShell>
	)
}
