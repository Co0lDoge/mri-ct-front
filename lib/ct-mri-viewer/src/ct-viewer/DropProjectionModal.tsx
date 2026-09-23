'use client'

import { useState, useEffect } from 'react'
import { Modal, Button } from 'antd'

const AXIAL = 0
const SAGITTAL = 1
const CORONAL = 2

const ORIENTATIONS = [
	{ id: AXIAL, label: 'Аксиальная' },
	{ id: SAGITTAL, label: 'Сагиттальная' },
	{ id: CORONAL, label: 'Корональная' },
] as const

type DropProjectionModalProps = {
	open: boolean
	seriesLabel?: string
	showFillOtherSlots: boolean
	onConfirm: (orientation: number, fillOtherSlots: boolean) => void
	onCancel: () => void
}

export function DropProjectionModal({
	open,
	seriesLabel,
	showFillOtherSlots,
	onConfirm,
	onCancel,
}: DropProjectionModalProps) {
	const [orientation, setOrientation] = useState<number>(ORIENTATIONS[0].id)
	const [fillOtherSlots, setFillOtherSlots] = useState(true)

	const [wasOpen, setWasOpen] = useState(open)

	if (open !== wasOpen) {
		setWasOpen(open)
		if (open) {
			setOrientation(ORIENTATIONS[0].id)
			setFillOtherSlots(true)
		}
	}

	const handleOk = () => {
		onConfirm(orientation, showFillOtherSlots ? fillOtherSlots : false)
	}

	return (
		<Modal
			title='Выбор проекции'
			open={open}
			onOk={handleOk}
			onCancel={onCancel}
			okText='Применить'
			cancelText='Отмена'
		>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				{seriesLabel && (
					<div style={{ fontSize: 13, color: '#666' }}>
						Серия: <strong>{seriesLabel}</strong>
					</div>
				)}
				<div>
					<div style={{ marginBottom: 8, fontWeight: 500 }}>Какая проекция?</div>
					<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
						{ORIENTATIONS.map(({ id, label }) => (
							<Button
								key={id}
								type={orientation === id ? 'primary' : 'default'}
								onClick={() => setOrientation(id)}
								size='middle'
							>
								{label}
							</Button>
						))}
					</div>
				</div>
				{showFillOtherSlots && (
					<label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
						<input type='checkbox' checked={fillOtherSlots} onChange={e => setFillOtherSlots(e.target.checked)} />
						<span>Разместить другие проекции в пустых окнах</span>
					</label>
				)}
			</div>
		</Modal>
	)
}
