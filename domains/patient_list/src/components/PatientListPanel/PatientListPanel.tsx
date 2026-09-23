'use client'

import '../../styles/patient_list.scss'

import * as React from 'react'
import { Button, Card, Space, Table } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { TableCurrentDataSource } from 'antd/es/table/interface'

import { useNarrowViewport } from '@medml/shared'

import { PatientListHeader } from '../PatientListHeader'
import { DiagnosisTag, StatusTag } from '../tags'
import type { PatientListSort, PatientListSortOrder, PatientRow } from '../../types'

const TABLE_MIN_WIDTH = 1232
const TABLE_FITS_FROM = TABLE_MIN_WIDTH + 48 + 48

export type PatientListPanelProps = {
	className?: string
	title?: React.ReactNode

	rows: PatientRow[]
	total: number
	page: number
	pageSize: number

	isLoading?: boolean
	searchValue?: string

	sort?: PatientListSort

	onSearchChange?: (value: string) => void
	onSearchSubmit?: (value: string) => void
	onAddPatient?: () => void

	onPageChange?: (page: number) => void
	onPageSizeChange?: (pageSize: number) => void

	onSortChange?: (sort: PatientListSort) => void

	onOpenPatientCard?: (id: PatientRow['id']) => void

	onDeletePatient?: (id: PatientRow['id']) => void

	emptyText?: React.ReactNode
}

function toTableSortOrder(order: PatientListSortOrder | undefined): 'ascend' | 'descend' | undefined {
	if (order === 'ascend' || order === 'descend') return order
	return undefined
}

export function PatientListPanel({
	className,
	title,
	rows,
	total,
	page,
	pageSize,
	isLoading,
	searchValue,
	sort,
	onSearchChange,
	onSearchSubmit,
	onAddPatient,
	onPageChange,
	onPageSizeChange,
	onSortChange,
	onOpenPatientCard,
	onDeletePatient,
	emptyText = 'Пациенты не найдены',
}: PatientListPanelProps) {
	const diagnosisFilters = React.useMemo(
		() =>
			Array.from(
				new Map(
					rows
						.filter(r => r.diagnosisLabel)
						.map(r => [r.diagnosisLabel, { text: r.diagnosisLabel as string, value: r.diagnosisLabel as string }]),
				).values(),
			),
		[rows],
	)

	const statusFilters = React.useMemo(
		() =>
			Array.from(
				new Map(
					rows
						.filter(r => r.statusLabel)
						.map(r => [r.statusLabel, { text: r.statusLabel as string, value: r.statusLabel as string }]),
				).values(),
			),
		[rows],
	)

	const sortKey = sort?.key ?? null
	const sortOrder = sort?.order ?? null

	const columns = React.useMemo<ColumnsType<PatientRow>>(
		() => [
			{
				title: 'Пациент',
				dataIndex: 'fullName',
				key: 'fullName',
				width: 280,
				ellipsis: { showTitle: true },
				sorter: true,
				sortOrder: sortKey === 'fullName' ? toTableSortOrder(sortOrder) : undefined,
				render: (_value, row) => <span className='patients-panel__patient-name'>{row.fullName}</span>,
			},
			{
				title: 'Полис',
				dataIndex: 'policyNumber',
				key: 'policyNumber',
				width: 200,
				render: (v: string | undefined) => (v ? <span className='patients-panel__numeric'>{v}</span> : '—'),
			},
			{
				title: 'Email',
				dataIndex: 'email',
				key: 'email',
				width: 240,
				ellipsis: { showTitle: true },
				render: (v: string | undefined) => v ?? '—',
			},
			{
				title: 'Дата',
				dataIndex: 'birthDate',
				key: 'birthDate',
				width: 140,
				sorter: true,
				sortOrder: sortKey === 'birthDate' ? toTableSortOrder(sortOrder) : undefined,
				render: (v: string | undefined) => (v ? <span className='patients-panel__numeric'>{v}</span> : '—'),
			},
			{
				title: 'Диагноз',
				dataIndex: 'diagnosisLabel',
				key: 'diagnosisLabel',
				width: 160,
				filters: statusFilters.length > 0 ? statusFilters : diagnosisFilters,
				onFilter: (value, record) => (record.statusLabel ?? record.diagnosisLabel) === value,
				render: (v: string | undefined, row) =>
					row.statusLabel ? (
						<StatusTag tone={row.statusTone}>{row.statusLabel}</StatusTag>
					) : v ? (
						<DiagnosisTag>{v}</DiagnosisTag>
					) : (
						'—'
					),
			},
			{
				title: '',
				key: 'actions',
				width: 212,
				align: 'right',
				render: (_v, row) => <Button onClick={() => onOpenPatientCard?.(row.id)}>Карта пациента</Button>,
			},
		],
		[diagnosisFilters, onOpenPatientCard, sortKey, sortOrder, statusFilters],
	)

	const handleTableChange = React.useCallback(
		(
			pagination: TablePaginationConfig,
			_filters: unknown,
			sorter: unknown,
			extra: TableCurrentDataSource<PatientRow>,
		) => {
			if (extra.action === 'paginate') {
				if (pagination.current != null) {
					onPageChange?.(pagination.current)
				}
				if (pagination.pageSize != null && pagination.pageSize !== pageSize) {
					onPageSizeChange?.(pagination.pageSize)
				}
			}
			if (extra.action === 'sort' && onSortChange) {
				const s = (Array.isArray(sorter) ? sorter[0] : sorter) as {
					field?: string
					order?: PatientListSortOrder
				}
				const nextKey = (s.field ?? null) as PatientListSort['key']
				const nextOrder = (s.order ?? null) as PatientListSortOrder
				onSortChange({ key: nextKey, order: nextOrder })
			}
		},
		[onPageChange, onPageSizeChange, onSortChange, pageSize],
	)

	const tablePagination = React.useMemo(
		() => ({
			current: page,
			pageSize,
			total,
			showSizeChanger: true,
			pageSizeOptions: [10, 20, 50],
			showTotal: (totalCount: number, range: [number, number]) => (
				<span className='patients-panel__footer-total'>
					{totalCount <= 0 ? 'Нет пациентов' : `Показано ${range[1] - range[0] + 1} из ${totalCount} пациентов`}
				</span>
			),
		}),
		[page, pageSize, total],
	)

	const isNarrow = useNarrowViewport(TABLE_FITS_FROM - 1)

	return (
		<Card className={['patients-panel', className].filter(Boolean).join(' ')}>
			<Space direction='vertical' size={20} style={{ width: '100%' }}>
				<PatientListHeader
					title={title}
					searchValue={searchValue}
					onSearchChange={onSearchChange}
					onSearchSubmit={onSearchSubmit}
					onAddClick={onAddPatient}
				/>

				<Table<PatientRow>
					rowKey='id'
					columns={columns}
					dataSource={rows}
					loading={isLoading}
					pagination={tablePagination}
					onChange={handleTableChange}
					locale={{ emptyText }}
					showSorterTooltip={{ title: 'Сортировать' }}
					size='middle'
					tableLayout='fixed'
					scroll={isNarrow ? { x: TABLE_MIN_WIDTH } : undefined}
				/>
			</Space>
		</Card>
	)
}
