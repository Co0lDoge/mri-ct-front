import React from 'react'
import { Button, Select, Space, Typography } from 'antd'
import type { GalleryToolbarProps } from './types'
import { getAccentOutlineButtonStyle } from '@/styles/uiPatterns'

const GalleryToolbar: React.FC<GalleryToolbarProps> = ({
	isEditMode,
	currentGroup,
	segmentOptions = [],
	onSelectGroup,
	onStartEdit,
	onSave,
	onCancel,
	isSaving = false,
	hasUnsavedChanges = false,
}) => {
	return (
		<div style={{ marginBottom: 16 }}>
			<Space
				wrap
				size={[12, 12]}
				style={{ display: 'flex', justifyContent: 'center' }}
			>
				{isEditMode ? (
					<>
						<Typography.Text type='secondary'>
							Редактируйте точки полигона или обведите контур заново для
							выбранного узла.
						</Typography.Text>

						{segmentOptions.length > 0 && (
							<Select
								value={currentGroup}
								onChange={value => onSelectGroup?.(value)}
								options={segmentOptions}
								style={{ minWidth: 220 }}
								placeholder='Выберите узел'
							/>
						)}

						<Button type='primary' onClick={onSave} loading={isSaving}>
							Сохранить
						</Button>
						<Button onClick={onCancel} disabled={isSaving}>
							Отмена
						</Button>
						{!hasUnsavedChanges && (
							<Typography.Text type='secondary'>
								Пока нет несохранённых изменений.
							</Typography.Text>
						)}
					</>
				) : (
					<Button
						type='default'
						onClick={onStartEdit}
						style={{ ...getAccentOutlineButtonStyle(), borderRadius: '20px' }}
					>
						Изменить результаты
					</Button>
				)}
			</Space>
		</div>
	)
}

export default GalleryToolbar
