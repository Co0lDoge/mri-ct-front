import { useEffect, useState } from 'react'
import { MedicineBoxOutlined } from '@ant-design/icons'
import { Button, Card, Result, Space, Typography } from 'antd'

import { useGetProcessingStatusQuery } from '@/lib/cytologyApi'

import './DiagnosticIsRunningView.css'

export type DiagnosticIsRunningViewProps = {
	cytologyId: string
	onReady: (id: string) => void
	onUploadAgain?: () => void
}

export function DiagnosticIsRunningView({ cytologyId, onReady, onUploadAgain }: DiagnosticIsRunningViewProps) {
	const [stopPolling, setStopPolling] = useState(false)

	const [polledId, setPolledId] = useState(cytologyId)
	if (polledId !== cytologyId) {
		setPolledId(cytologyId)
		setStopPolling(false)
	}

	const { data, isError } = useGetProcessingStatusQuery(cytologyId, {
		skip: !cytologyId,
		refetchOnMountOrArgChange: true,
		pollingInterval: stopPolling ? 0 : 3000,
	})

	const status = data?.processing_status

	if (!stopPolling && (isError || status === 'failed' || status === 'ready')) {
		setStopPolling(true)
	}

	useEffect(() => {
		if (status === 'ready') {
			onReady(String(data?.image_id ?? cytologyId))
		}
	}, [status, data?.image_id, cytologyId, onReady])

	if (!cytologyId) {
		return (
			<div className='diagnostic-is-running-page'>
				<Card className='diagnostic-is-running-card'>
					<Result
						status='warning'
						title='Не указан идентификатор исследования'
						subTitle='Вернитесь к загрузке снимка и повторите попытку.'
						extra={
							onUploadAgain ? (
								<Button type='primary' onClick={onUploadAgain}>
									Загрузить снимок
								</Button>
							) : null
						}
					/>
				</Card>
			</div>
		)
	}

	if (isError || status === 'failed') {
		return (
			<div className='diagnostic-is-running-page'>
				<Card className='diagnostic-is-running-card'>
					<Result
						status='error'
						title='Диагностика не выполнена'
						subTitle='Не удалось обработать снимок. Попробуйте загрузить его ещё раз или обратитесь в поддержку.'
						extra={
							onUploadAgain ? (
								<Button type='primary' onClick={onUploadAgain}>
									Загрузить снимок снова
								</Button>
							) : null
						}
					/>
				</Card>
			</div>
		)
	}

	if (status === 'ready') {
		return null
	}

	return (
		<div className='diagnostic-is-running-page'>
			<Card className='diagnostic-is-running-card'>
				<Space direction='vertical' size={20} className='diagnostic-is-running-content'>
					<div className='diagnostic-is-running-icon' aria-hidden>
						<MedicineBoxOutlined />
					</div>

					<div className='diagnostic-is-running-text'>
						<Typography.Title level={2} className='diagnostic-is-running-title'>
							В процессе обследования
						</Typography.Title>
						<Typography.Paragraph type='secondary' className='diagnostic-is-running-description'>
							Снимок анализируется автоматически. Обычно это занимает несколько минут — как только результат будет
							готов, вы перейдёте к просмотру.
						</Typography.Paragraph>
						<Typography.Text type='secondary' className='diagnostic-is-running-hint'>
							Пожалуйста, не закрывайте эту вкладку
						</Typography.Text>
					</div>
				</Space>
			</Card>
		</div>
	)
}
