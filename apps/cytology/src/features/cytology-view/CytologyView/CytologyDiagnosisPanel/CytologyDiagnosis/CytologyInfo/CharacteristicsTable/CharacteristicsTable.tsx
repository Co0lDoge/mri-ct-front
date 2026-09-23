import React, { useMemo, useEffect, useContext } from 'react'
import { Empty, Table } from 'antd'

import { ModalContext } from '@medml/ui'

import { ICytologyInfoCellCharacteristics, ICytologyInfoClusterCharacteristics } from '@cytology/core/types/cytology'

import { characteristicsDict, columns, TableItem } from './props'

import './CharacteristicsTable.css'

type CombinedCharacteristics = ICytologyInfoCellCharacteristics & ICytologyInfoClusterCharacteristics

interface CharacteristicsTableProps {
	characteristics: CombinedCharacteristics
}

const CharacteristicsTable: React.FC<CharacteristicsTableProps> = ({ characteristics }) => {
	const { changeModalProps } = useContext(ModalContext)

	useEffect(() => {
		changeModalProps({
			title: 'Результаты исследования',
			footer: [],
			centered: true,
			width: '70%',
		})
	}, [changeModalProps])

	// Таблица целиком выводится из `characteristics` — это производное
	// значение, а не состояние. Раньше оно считалось в эффекте и клалось в
	// useState: лишний цикл рендера и пустая таблица в первом кадре.
	const tableData: TableItem[] = useMemo(() => {
		const fieldNames = Object.keys(characteristics) as Array<keyof CombinedCharacteristics>

		return fieldNames.map((fieldName, id) => {
			const fieldValue = characteristics[fieldName]
			const fieldMeta = characteristicsDict[fieldName]

			const baseItem: Omit<TableItem, 'references' | 'status'> = {
				id,
				name: fieldMeta.name,
				result: fieldValue,
			}

			if (fieldMeta.ref) {
				const { normStart, normEnd } = fieldMeta
				const isNormal = fieldValue >= normStart && fieldValue <= normEnd
				let status: 0 | 1 | 2 = isNormal ? 0 : 1

				if (!isNormal) {
					const deviation = fieldValue < normStart ? normStart - fieldValue : fieldValue - normEnd
					status = deviation >= 40 ? 2 : 1
				}

				return {
					...baseItem,
					references: [normStart, normEnd] as [number, number],
					status,
				}
			}

			return {
				...baseItem,
				references: [0, 0] as [number, number],
				status: 1,
			}
		})
	}, [characteristics])

	const rowClassName = (record: TableItem) => {
		switch (record.status) {
			case 0:
				return 'row-normal'
			case 1:
				return 'row-warning'
			case 2:
				return 'row-error'
			default:
				return ''
		}
	}

	return (
		<Table
			className='characteristics-table'
			columns={columns}
			dataSource={tableData}
			rowClassName={rowClassName}
			pagination={false}
			rowHoverable={false}
			rowKey='id'
			locale={{ emptyText: <Empty description='Нет данных' /> }}
		/>
	)
}

export default CharacteristicsTable
