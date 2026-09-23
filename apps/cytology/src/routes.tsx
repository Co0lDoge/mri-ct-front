import { Navigate, type RouteObject } from 'react-router-dom'

import AppShell from '@/layouts/AppShell'
import RequireAuth from '@/layouts/RequireAuth'
import CytologyViewRoute from '@/pages/CytologyViewRoute'
import FaqRoute from '@/pages/FaqRoute'
import LoginRoute from '@/pages/LoginRoute'
import PatientProfileRoute from '@/pages/PatientProfileRoute'
import PatientsRoute from '@/pages/PatientsRoute'
import DiagnosticIsRunningRoute from '@/pages/DiagnosticIsRunningRoute'
import PlaceholderRoute from '@/pages/PlaceholderRoute'
import RegisterRoute from '@/pages/RegisterRoute'
import SubscriptionRoute from '@/pages/SubscriptionRoute'
import SubscriptionReturnRoute from '@/pages/SubscriptionReturnRoute'
import UploadPhotoRoute from '@/pages/UploadPhotoRoute'

const routes: RouteObject[] = [
	{
		path: '/',
		element: <AppShell />,
		children: [
			{ path: 'auth/login', element: <LoginRoute /> },
			{ path: 'auth/register', element: <RegisterRoute /> },
			{ index: true, element: <Navigate to='/auth/login' replace /> },
			{
				path: 'faq',
				element: (
					<RequireAuth>
						<FaqRoute />
					</RequireAuth>
				),
			},
			{
				path: 'patients',
				element: (
					<RequireAuth>
						<PatientsRoute />
					</RequireAuth>
				),
			},
			{
				path: 'patient_profile',
				element: (
					<RequireAuth>
						<PatientProfileRoute />
					</RequireAuth>
				),
			},
			{
				path: 'subscription',
				element: (
					<RequireAuth>
						<SubscriptionRoute />
					</RequireAuth>
				),
			},
			{
				// Сюда возвращает ЮKassa после оплаты (YOOKASSA_RETURN_URL).
				path: 'subscription/return',
				element: (
					<RequireAuth>
						<SubscriptionReturnRoute />
					</RequireAuth>
				),
			},
			{
				path: 'upload_photo',
				element: (
					<RequireAuth>
						<UploadPhotoRoute />
					</RequireAuth>
				),
			},
			{
				path: 'cytology/:id',
				element: (
					<RequireAuth>
						<CytologyViewRoute />
					</RequireAuth>
				),
			},
			{
				path: 'diagnostic_is_running/:id',
				element: (
					<RequireAuth>
						<DiagnosticIsRunningRoute />
					</RequireAuth>
				),
			},
			{ path: 'history', element: <PlaceholderRoute title='История' /> },
			{ path: 'dialogs', element: <PlaceholderRoute title='Диалоги' /> },
			{ path: 'export', element: <PlaceholderRoute title='Экспорт' /> },
			{
				path: 'diagnosis_is_complete/:id',
				element: <PlaceholderRoute title='Статус завершения диагностики' />,
			},
			{ path: '*', element: <Navigate to='/auth/login' replace /> },
		],
	},
]

export default routes
