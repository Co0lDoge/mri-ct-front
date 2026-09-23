'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { imageLoader, metaData, Enums } from '@cornerstonejs/core'
import type { SeriesConfig, SeriesGroupConfig } from '../types'
import type { VoiPolicyConfig } from '../viewer/windowLevel'
import { voiRangeFromImage } from '../viewer/windowLevel'

const PREVIEW_MAX_ATTEMPTS = 2500
const { MetadataModules } = Enums

function toDisplayStr(v: unknown): string {
	if (v == null) return ''
	if (typeof v === 'string') return v.trim()
	if (typeof v === 'number') return String(v)
	if (typeof v === 'object' && v !== null && 'year' in v && 'month' in v && 'day' in v) {
		const o = v as { year: number; month: number; day: number }
		return `${o.year}-${String(o.month).padStart(2, '0')}-${String(o.day).padStart(2, '0')}`
	}
	if (typeof v === 'object' && v !== null && 'hours' in v && 'minutes' in v && 'seconds' in v) {
		const o = v as { hours: number; minutes: number; seconds: number }
		return `${String(o.hours).padStart(2, '0')}:${String(o.minutes).padStart(2, '0')}:${String(o.seconds).padStart(2, '0')}`
	}
	const s = String(v)
	return s === '[object Object]' ? '' : s
}

export type SeriesMeta = {
	patientName?: string
	patientBirthDate?: string
	studyDate?: string
	studyTime?: string
	studyDescription?: string
	modality?: string
	seriesDescription?: string
	seriesNumber?: number
	numberOfSlices?: number
}

function drawImageToCanvas(
	canvas: HTMLCanvasElement,
	pixelData: ArrayLike<number>,
	width: number,
	height: number,
	windowCenter: number,
	windowWidth: number,
	minPixel: number,
	maxPixel: number,
) {
	const ctx = canvas.getContext('2d')
	if (!ctx) return
	const imageData = ctx.createImageData(width, height)
	const data = imageData.data
	const wlMin = windowCenter - windowWidth / 2
	const wlMax = windowCenter + windowWidth / 2
	const range = wlMax - wlMin || 1
	for (let i = 0; i < pixelData.length; i++) {
		const v = Math.max(minPixel, Math.min(maxPixel, pixelData[i]))
		const normalized = (v - wlMin) / range
		const byte = Math.max(0, Math.min(255, Math.round(normalized * 255)))
		data[i * 4] = byte
		data[i * 4 + 1] = byte
		data[i * 4 + 2] = byte
		data[i * 4 + 3] = 255
	}
	ctx.putImageData(imageData, 0, 0)
}

type StudyCardProps = {
	series: SeriesConfig
	pacsBasePath: string
	cornerstoneReady: boolean
	viewerVoiPolicy: VoiPolicyConfig
	onMetaLoaded?: (studyId: string, meta: SeriesMeta) => void
	onSelect?: (studyId: string, label: string, meta: SeriesMeta) => void
	selected?: boolean
	selectionDisabled?: boolean
}

function StudyCard({
	series,
	pacsBasePath,
	cornerstoneReady,
	viewerVoiPolicy,
	onMetaLoaded,
	onSelect,
	selected,
	selectionDisabled = false,
}: StudyCardProps) {
	const { id: studyId, sliceStart, sliceCount, slicePrefix, slicePostfix } = series
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [loading, setLoading] = useState(cornerstoneReady)
	const [error, setError] = useState(false)
	const [meta, setMeta] = useState<SeriesMeta>({})

	const requestKey = [
		studyId,
		cornerstoneReady,
		pacsBasePath,
		slicePrefix ?? '',
		slicePostfix ?? '',
		sliceStart,
		sliceCount,
	].join('|')
	const [loadedKey, setLoadedKey] = useState(requestKey)
	if (loadedKey !== requestKey) {
		setLoadedKey(requestKey)
		setLoading(cornerstoneReady)
		setError(false)
	}

	useEffect(() => {
		if (!cornerstoneReady) return
		const baseUrl = `${window.location.origin}${pacsBasePath}/${studyId}`
		const prefix = slicePrefix ?? 'I'
		const postfix = slicePostfix ?? ''
		const tryLoadFromIndex = (
			index: number,
		): Promise<{ image: Awaited<ReturnType<typeof imageLoader.loadImage>>; imageId: string }> => {
			const imageId = `wadouri:${baseUrl}/${prefix}${index}${postfix}`
			return imageLoader.loadImage(imageId).then(image => ({ image, imageId }))
		}
		const trySequence = (
			fromIndex: number,
		): Promise<{ image: Awaited<ReturnType<typeof imageLoader.loadImage>>; imageId: string }> =>
			tryLoadFromIndex(fromIndex).catch(() => {
				if (fromIndex >= PREVIEW_MAX_ATTEMPTS) return Promise.reject(new Error('No slice'))
				return trySequence(fromIndex + 1)
			})
		const midIndex = sliceCount > 0 ? sliceStart + Math.max(0, Math.floor(sliceCount / 2)) : sliceStart
		tryLoadFromIndex(midIndex)
			.catch(() => trySequence(sliceStart))
			.then(({ image, imageId }) => {
				const pixelData = image.getPixelData()
				const width = image.width
				const height = image.height
				const minP = image.minPixelValue ?? 0
				const maxP = image.maxPixelValue ?? 4095
				const [wlMin, wlMax] = voiRangeFromImage(
					{
						windowCenter: image.windowCenter,
						windowWidth: image.windowWidth,
					},
					viewerVoiPolicy,
				)
				const wc = (wlMin + wlMax) / 2
				const ww = wlMax - wlMin
				const canvas = canvasRef.current
				if (canvas) {
					canvas.width = width
					canvas.height = height
					drawImageToCanvas(canvas, pixelData, width, height, wc, ww, minP, maxP)
				}
				const outMeta: SeriesMeta = {}
				try {
					const pm = metaData.get(MetadataModules.PATIENT, imageId) as { patientName?: unknown } | undefined
					const gs = metaData.get(MetadataModules.GENERAL_STUDY, imageId) as
						| { studyDate?: unknown; studyTime?: unknown; studyDescription?: unknown }
						| undefined
					const gsr = metaData.get(MetadataModules.GENERAL_SERIES, imageId) as
						| { modality?: unknown; seriesDescription?: unknown; seriesNumber?: number }
						| undefined
					if (pm?.patientName) outMeta.patientName = toDisplayStr(pm.patientName).replace(/\^/g, ' ').trim()
					if (gs?.studyDate) outMeta.studyDate = toDisplayStr(gs.studyDate)
					if (gs?.studyTime) outMeta.studyTime = toDisplayStr(gs.studyTime)
					if (gs?.studyDescription) outMeta.studyDescription = toDisplayStr(gs.studyDescription)
					if (gsr?.modality) outMeta.modality = toDisplayStr(gsr.modality)
					if (gsr?.seriesDescription) outMeta.seriesDescription = toDisplayStr(gsr.seriesDescription)
					if (gsr?.seriesNumber != null) outMeta.seriesNumber = gsr.seriesNumber
				} catch {
					// ignore
				}
				setMeta(outMeta)
				setLoading(false)
				onMetaLoaded?.(studyId, outMeta)
			})
			.catch(() => {
				setLoading(false)
				setError(true)
			})
	}, [
		studyId,
		cornerstoneReady,
		onMetaLoaded,
		viewerVoiPolicy,
		slicePrefix,
		slicePostfix,
		pacsBasePath,
		sliceStart,
		sliceCount,
	])

	const label = meta.seriesDescription?.trim() || (meta.seriesNumber != null ? `Серия ${meta.seriesNumber}` : studyId)
	const canSelect = cornerstoneReady && !selectionDisabled && !loading

	return (
		<div
			role='button'
			tabIndex={0}
			onClick={() => {
				if (!canSelect) return
				onSelect?.(studyId, label, meta)
			}}
			onKeyDown={e => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					if (!canSelect) return
					onSelect?.(studyId, label, meta)
				}
			}}
			style={{
				border: selected ? '1px solid rgba(24, 144, 255, 0.9)' : '1px solid #e5e7eb',
				borderRadius: 6,
				overflow: 'hidden',
				background: selected ? 'rgba(24, 144, 255, 0.08)' : '#ffffff',
				marginBottom: 10,
				cursor: !cornerstoneReady ? 'not-allowed' : selectionDisabled ? 'wait' : loading ? 'progress' : 'pointer',
				boxShadow: selected ? '0 0 0 1px rgba(24, 144, 255, 0.35)' : 'none',
				opacity: cornerstoneReady ? 1 : 0.75,
				outline: 'none',
			}}
		>
			<div style={{ padding: '6px 8px', fontSize: 11, fontWeight: 600, color: '#222831' }} title={label}>
				{loading && !meta.seriesDescription ? `${studyId}…` : label}
			</div>
			<div style={{ position: 'relative', aspectRatio: '1', background: '#000', minHeight: 100 }}>
				<canvas
					ref={canvasRef}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'contain',
						display: 'block',
						verticalAlign: 'bottom',
					}}
				/>
				{loading && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: 'rgba(0,0,0,0.6)',
							color: '#aaa',
							fontSize: 11,
						}}
					>
						Загрузка…
					</div>
				)}
				{error && !loading && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: '#f6f8fb',
							color: '#818181',
							fontSize: 11,
						}}
					>
						Нет превью
					</div>
				)}
			</div>
			{(meta.seriesDescription || meta.modality) && (
				<div style={{ padding: '4px 8px', fontSize: 10, color: '#818181' }}>
					{meta.seriesDescription && <div title={meta.seriesDescription}>{toDisplayStr(meta.seriesDescription)}</div>}
					{meta.modality && <div>{toDisplayStr(meta.modality)}</div>}
				</div>
			)}
		</div>
	)
}

type StudyGroupCardProps = {
	group: SeriesGroupConfig
	series: SeriesConfig[]
	pacsBasePath: string
	cornerstoneReady: boolean
	viewerVoiPolicy: VoiPolicyConfig
	onSelect?: (id: string, label: string, meta: SeriesMeta, isGroup: boolean) => void
	selected?: boolean
	selectionDisabled?: boolean
}

function StudyGroupCard({
	group,
	series,
	pacsBasePath,
	cornerstoneReady,
	viewerVoiPolicy,
	onSelect,
	selected,
	selectionDisabled = false,
}: StudyGroupCardProps) {
	const canSelect = cornerstoneReady && !selectionDisabled
	const label = group.label

	const firstSeries = series.find(s => s.id === group.seriesIds[0])

	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [loading, setLoading] = useState(cornerstoneReady)
	const [error, setError] = useState(false)

	const requestKey = [
		firstSeries?.id ?? '',
		cornerstoneReady,
		pacsBasePath,
		firstSeries?.slicePrefix ?? '',
		firstSeries?.slicePostfix ?? '',
		firstSeries?.sliceStart ?? 0,
		firstSeries?.sliceCount ?? 0,
	].join('|')
	const [loadedKey, setLoadedKey] = useState(requestKey)
	if (loadedKey !== requestKey) {
		setLoadedKey(requestKey)
		setLoading(cornerstoneReady)
		setError(false)
	}

	useEffect(() => {
		if (!cornerstoneReady || !firstSeries) return
		const baseUrl = `${window.location.origin}${pacsBasePath}/${firstSeries.id}`
		const prefix = firstSeries.slicePrefix ?? 'I'
		const postfix = firstSeries.slicePostfix ?? ''

		const tryLoadFromIndex = (
			index: number,
		): Promise<{ image: Awaited<ReturnType<typeof imageLoader.loadImage>>; imageId: string }> => {
			const imageId = `wadouri:${baseUrl}/${prefix}${index}${postfix}`
			return imageLoader.loadImage(imageId).then(image => ({ image, imageId }))
		}

		const trySequence = (
			fromIndex: number,
		): Promise<{ image: Awaited<ReturnType<typeof imageLoader.loadImage>>; imageId: string }> =>
			tryLoadFromIndex(fromIndex).catch(() => {
				if (fromIndex >= PREVIEW_MAX_ATTEMPTS) return Promise.reject(new Error('No slice'))
				return trySequence(fromIndex + 1)
			})

		const midIndex =
			firstSeries.sliceCount > 0
				? firstSeries.sliceStart + Math.max(0, Math.floor(firstSeries.sliceCount / 2))
				: firstSeries.sliceStart

		tryLoadFromIndex(midIndex)
			.catch(() => trySequence(firstSeries.sliceStart))
			.then(({ image }) => {
				const pixelData = image.getPixelData()
				const width = image.width
				const height = image.height
				const minP = image.minPixelValue ?? 0
				const maxP = image.maxPixelValue ?? 4095
				const [wlMin, wlMax] = voiRangeFromImage(
					{ windowCenter: image.windowCenter, windowWidth: image.windowWidth },
					viewerVoiPolicy,
				)
				const wc = (wlMin + wlMax) / 2
				const ww = wlMax - wlMin
				const canvas = canvasRef.current
				if (canvas) {
					canvas.width = width
					canvas.height = height
					drawImageToCanvas(canvas, pixelData, width, height, wc, ww, minP, maxP)
				}
				setLoading(false)
			})
			.catch(() => {
				setLoading(false)
				setError(true)
			})
	}, [
		firstSeries?.id,
		cornerstoneReady,
		viewerVoiPolicy,
		firstSeries?.slicePrefix,
		firstSeries?.slicePostfix,
		pacsBasePath,
		firstSeries?.sliceStart,
		firstSeries?.sliceCount,
	])

	return (
		<div
			role='button'
			tabIndex={0}
			onClick={() => {
				if (!canSelect) return
				onSelect?.(group.groupId, label, {}, true)
			}}
			onKeyDown={e => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					if (!canSelect) return
					onSelect?.(group.groupId, label, {}, true)
				}
			}}
			style={{
				border: selected ? '1px solid rgba(24, 144, 255, 0.9)' : '1px solid #e5e7eb',
				borderRadius: 6,
				overflow: 'hidden',
				background: selected ? 'rgba(24, 144, 255, 0.08)' : '#ffffff',
				marginBottom: 10,
				cursor: !cornerstoneReady ? 'not-allowed' : selectionDisabled ? 'wait' : loading ? 'progress' : 'pointer',
				boxShadow: selected ? '0 0 0 1px rgba(24, 144, 255, 0.35)' : 'none',
				opacity: cornerstoneReady ? 1 : 0.75,
				outline: 'none',
			}}
		>
			<div style={{ padding: '6px 8px', fontSize: 11, fontWeight: 600, color: '#222831' }} title={label}>
				{loading ? `${label}…` : label}
			</div>
			<div style={{ position: 'relative', aspectRatio: '1', background: '#000', minHeight: 100 }}>
				<canvas
					ref={canvasRef}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'contain',
						display: 'block',
						verticalAlign: 'bottom',
					}}
				/>
				{loading && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: 'rgba(0,0,0,0.6)',
							color: '#aaa',
							fontSize: 11,
						}}
					>
						Загрузка…
					</div>
				)}
				{error && !loading && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: '#f6f8fb',
							color: '#818181',
							fontSize: 11,
						}}
					>
						Нет превью
					</div>
				)}
			</div>
			<div style={{ padding: '6px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
				{group.seriesIds.map(id => (
					<span
						key={id}
						style={{
							fontSize: 11,
							background: '#e5e7eb',
							color: '#374151',
							padding: '2px 8px',
							borderRadius: 4,
							fontWeight: 500,
						}}
					>
						{id}
					</span>
				))}
			</div>
		</div>
	)
}

type StudyListSidebarProps = {
	pacsBasePath: string
	series: SeriesConfig[]
	seriesGroups?: SeriesGroupConfig[]
	cornerstoneReady: boolean
	viewerVoiPolicy: VoiPolicyConfig
	onSeriesSelect?: (id: string, label: string, meta: SeriesMeta, isGroup?: boolean) => void // <-- ИЗМЕНЕНО
	selectedSeriesId?: string | null
	disabled?: boolean
}

export function StudyListSidebar({
	pacsBasePath,
	series,
	seriesGroups,
	cornerstoneReady,
	viewerVoiPolicy,
	onSeriesSelect,
	selectedSeriesId,
	disabled = false,
}: StudyListSidebarProps) {
	const [headerMeta, setHeaderMeta] = useState<SeriesMeta | null>(null)

	const handleMetaLoaded = useCallback((_studyId: string, meta: SeriesMeta) => {
		setHeaderMeta(prev => prev ?? meta)
	}, [])

	const hasGroups = seriesGroups && seriesGroups.length > 0

	return (
		<div
			style={{
				width: 280,
				flexShrink: 0,
				background: '#f6f8fb',
				borderRight: '1px solid #e5e7eb',
				overflowY: 'auto',
				maxHeight: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div style={{ padding: 12, flex: 1 }}>
				<div style={{ fontSize: 12, fontWeight: 600, color: '#222831', marginBottom: 10 }}>Серии</div>

				{hasGroups ? (
					seriesGroups.map(group => (
						<StudyGroupCard
							key={group.groupId}
							group={group}
							series={series}
							pacsBasePath={pacsBasePath}
							cornerstoneReady={cornerstoneReady}
							viewerVoiPolicy={viewerVoiPolicy}
							onSelect={onSeriesSelect}
							selected={selectedSeriesId === group.groupId}
							selectionDisabled={disabled}
						/>
					))
				) : (
					series.map(s => (
						<StudyCard
							key={s.id}
							series={s}
							pacsBasePath={pacsBasePath}
							cornerstoneReady={cornerstoneReady}
							viewerVoiPolicy={viewerVoiPolicy}
							onMetaLoaded={handleMetaLoaded}
							onSelect={(id, label, meta) => onSeriesSelect?.(id, label, meta, false)}
							selected={selectedSeriesId === s.id}
							selectionDisabled={disabled}
						/>
					))
				)}
			</div>
		</div>
	)
}