import * as React from 'react'
import { Alert, Button, Progress, Result, Space, Spin, Typography } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

import { useGetProcessingStatusQuery } from '@/lib/cytologyApi'

/** Как часто спрашиваем статус, мс. */
const POLL_INTERVAL = 2000

/** Подписи под каждый статус обработки. */
const STATUS_LABELS: Record<string, string> = {
	pending: 'Снимок в очереди на обработку',
	processing: 'Идёт разметка снимка',
	ready: 'Обработка завершена',
	failed: 'Обработка не удалась',
}

/**
 * Ожидание обработки загруженного снимка.
 *
 * Сюда попадают сразу после загрузки: пока сервис режет изображение на
 * тайлы и прогоняет модель, открывать вьюер бессмысленно. Как только
 * статус становится `ready`, уводим на сам снимок.
 */
export default function DiagnosticIsRunningRoute() {
	const navigate = useNavigate()
	const params = useParams<{ id: string }>()
	const cytologyId = params.id?.trim() ?? ''

	const { data, error, isLoading } = useGetProcessingStatusQuery(cytologyId, {
		skip: !cytologyId,
		pollingInterval: POLL_INTERVAL,
	})

	const status = data?.processing_status
	const isReady = status === 'ready'

	React.useEffect(() => {
		if (!isReady || !cytologyId) return
		navigate(`/cytology/${encodeURIComponent(cytologyId)}`, { replace: true })
	}, [isReady, cytologyId, navigate])

	if (!cytologyId) {
		return (
			<Result
				status='warning'
				title='Снимок не указан'
				subTitle='В адресе страницы нет идентификатора исследования.'
				extra={
					<Button type='primary' onClick={() => navigate('/patients')}>
						К списку пациентов
					</Button>
				}
			/>
		)
	}

	if (status === 'failed') {
		return (
			<Result
				status='error'
				title='Не удалось обработать снимок'
				subTitle='Попробуйте загрузить файл ещё раз или обратитесь к администратору.'
				extra={
					<Space>
						<Button type='primary' onClick={() => navigate('/upload_photo')}>
							Загрузить заново
						</Button>
						<Button onClick={() => navigate('/patients')}>К пациентам</Button>
					</Space>
				}
			/>
		)
	}

	return (
		<div style={{ maxWidth: 560, margin: '0 auto', padding: 24, textAlign: 'center' }}>
			<Spin size='large' />

			<Typography.Title level={3} style={{ marginTop: 24 }}>
				Обрабатываем снимок
			</Typography.Title>

			<Typography.Paragraph type='secondary'>
				{isLoading ? 'Запрашиваем статус…' : (STATUS_LABELS[status ?? ''] ?? 'Ожидаем ответа сервиса')}
			</Typography.Paragraph>

			<Progress percent={100} status='active' showInfo={false} />

			{error != null && (
				<Alert
					style={{ marginTop: 24, textAlign: 'left' }}
					type='warning'
					showIcon
					message='Статус обработки временно недоступен'
					description='Продолжаем опрашивать сервис. Снимок можно открыть позже из карты пациента.'
				/>
			)}

			<div style={{ marginTop: 24 }}>
				<Button onClick={() => navigate('/patients')}>Вернуться к пациентам</Button>
			</div>
		</div>
	)
}
