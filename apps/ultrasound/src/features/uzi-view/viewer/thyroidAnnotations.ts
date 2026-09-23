import { fromGeoJSON, toGeoJSON } from 'svg-polygon-points'
import type { ViewerImage } from '@medml/viewers'
import type { Segment, SegmentPoint } from '../model/types'
import { getStructureFrame, type ThyroidStructureJson } from '../structures'
import { NODE_COLORS } from './constants'

/**
 * Чистые (без React/DOM/OpenSeadragon) функции построения Annotorious-
 * аннотаций из доменных данных результатов УЗИ щитовидной железы: узлов
 * (`Segment[]`) и контуров структур ЩЖ (`ThyroidStructureJson`).
 *
 * Раньше эта логика была перемешана с подпиской на события Annotorious и
 * JSX прямо внутри `OpenSeadragonViewer.tsx`. Вынесена отдельно, чтобы
 * маппинг "доменные данные → W3C Web Annotation" можно было читать и
 * тестировать без React и без живого инстанса OpenSeadragon.
 */

export function formatProbability(value?: number): string {
	return typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : '—'
}

export function getProbabilityValue(
	segment: { details?: unknown } | undefined,
	keys: string[],
): number | undefined {
	const details = (segment?.details || {}) as Record<string, number | undefined>
	for (const key of keys) {
		const value = details[key]
		if (typeof value === 'number') {
			return value
		}
	}
	return undefined
}

export function getAnnotationGroup(
	annotation: any,
	fallback?: string | number,
): string | number | undefined {
	const groupBody = annotation?.body?.find((item: any) => item.purpose === 'group')
	return groupBody?.value ?? fallback
}

export function getAnnotationPoints(
	annotation: any,
	pageIndex: number,
): SegmentPoint[] {
	const selectorValue = annotation?.target?.selector?.value || ''

	if (selectorValue.includes('<polygon')) {
		const svgValue = selectorValue.split('"')[1]
		const coords = toGeoJSON(svgValue)
		if (coords[0]) {
			return coords[0].map((point: any) => ({
				x: parseInt(point[0]),
				y: parseInt(point[1]),
				z: pageIndex,
			}))
		}
	}

	if (selectorValue.includes('xywh=')) {
		const rectValues = selectorValue.split(':')[1].split(',')
		const [x, y, width, height] = rectValues.map((value: string) => parseInt(value))

		return [
			{ x, y, z: pageIndex },
			{ x: x + width, y, z: pageIndex },
			{ x: x + width, y: y + height, z: pageIndex },
			{ x, y: y + height, z: pageIndex },
		]
	}

	return []
}

const STRUCTURE_LABELS: Record<string, string> = {
	left_lobe: 'Левая доля',
	right_lobe: 'Правая доля',
	isthmus: 'Перешеек',
}

/** Аннотации контуров структур ЩЖ (доли, перешеек) для одной страницы снимка. */
export function buildStructureAnnotationsForPage(
	structures: ThyroidStructureJson | undefined,
	pageIndex: number,
	imageUrl: string,
): any[] {
	const pageData = getStructureFrame(structures, pageIndex)
	if (!pageData) return []

	return Object.entries(pageData).reduce<any[]>((acc, [structureName, details]) => {
		if (!details?.coords || details.coords.length < 3) return acc

		const svgPoints = fromGeoJSON(details.coords).toString()
		const svgSelector = `<svg><polygon points="${svgPoints}"></polygon></svg>`

		return [
			...acc,
			{
				type: 'Annotation',
				body: [
					{
						type: 'TextualBody',
						value: STRUCTURE_LABELS[structureName] || structureName,
						purpose: 'tagging',
					},
					{
						type: 'TextualBody',
						value: details.confidence
							? `Достоверность ${(details.confidence * 100).toFixed(1)}%`
							: 'Достоверность неизвестна',
						purpose: 'commenting',
					},
					{
						type: 'TextualBody',
						value: '#0077CC',
						purpose: 'color',
					},
				],
				target: {
					source: imageUrl,
					selector: {
						type: 'SvgSelector',
						value: svgSelector,
					},
				},
				'@context': 'http://www.w3.org/ns/anno.jsonld',
				id: `structure_${structureName}_page_${pageIndex}`,
			},
		]
	}, [])
}

/** Аннотации узлов (segments), сгруппированные по страницам снимка. */
export function buildSegmentAnnotationsByPage(
	segments: Segment[] | undefined,
	images: ViewerImage[],
): Record<number, any[]> {
	const actualPages = images.length || 1
	const pageAnnotationsMap: Record<number, any[]> = {}
	for (let i = 0; i < actualPages; i++) {
		pageAnnotationsMap[i] = []
	}

	if (!segments || segments.length === 0) return pageAnnotationsMap

	segments.forEach((segment, segmentIndex) => {
		if (!segment.data) return

		const nodeColor = NODE_COLORS[segmentIndex % NODE_COLORS.length]
		const displayIndex = segmentIndex + 1
		const tirads2 = formatProbability(
			getProbabilityValue(segment, ['nodule_2', 'tirads_2']),
		)
		const tirads3 = formatProbability(
			getProbabilityValue(segment, ['nodule_3', 'tirads_3']),
		)
		const tirads4 = formatProbability(segment.details?.nodule_4)
		const tirads5 = formatProbability(segment.details?.nodule_5)

		segment.data.forEach((contour, contourIndex) => {
			if (!contour.points) return

			const pointsByPage: Record<number, SegmentPoint[]> = {}
			contour.points.forEach(point => {
				const pageIndex = point.z || 0
				if (pageIndex >= 0 && pageIndex < actualPages) {
					if (!pointsByPage[pageIndex]) {
						pointsByPage[pageIndex] = []
					}
					pointsByPage[pageIndex].push(point)
				}
			})

			Object.entries(pointsByPage).forEach(([pageIndexStr, points]) => {
				if (points.length < 3) return

				try {
					const coord = points.map(point => [point.x, point.y])
					const svgPoints = fromGeoJSON(coord).toString()
					const svgSelector = `<svg><polygon points="${svgPoints}"></polygon></svg>`

					const annotation = {
						type: 'Annotation',
						body: [
							{
								type: 'TextualBody',
								value: `Узел ${displayIndex}\nTI-RADS 2: ${tirads2}\nTI-RADS 3: ${tirads3}\nTI-RADS 4: ${tirads4}\nTI-RADS 5: ${tirads5}`,
								purpose: 'commenting',
							},
							{
								type: 'TextualBody',
								value: segment.is_ai ? 'AI only' : 'Updated',
								purpose: 'commenting',
							},
							{
								type: 'TextualBody',
								value: 'TI-RADS ' + (segment.details?.nodule_type ?? 'Unknown'),
								purpose: 'tagging',
							},
							{
								type: 'TextualBody',
								value: segment.id.toString(),
								purpose: 'group',
							},
							{
								type: 'TextualBody',
								value: segment.is_ai ? 'AI' : 'Doctor result',
								purpose: 'tagging',
							},
							{
								type: 'TextualBody',
								value: nodeColor,
								purpose: 'color',
							},
							{
								type: 'TextualBody',
								value: segment.id.toString(),
								purpose: 'node-id',
							},
						],
						target: {
							source: images[parseInt(pageIndexStr)]?.url || '',
							selector: {
								type: 'SvgSelector',
								value: svgSelector,
							},
						},
						'@context': 'http://www.w3.org/ns/anno.jsonld',
						id: contour.id
							? contour.id.toString()
							: `node_${segment.id}_contour_${contourIndex}_page_${pageIndexStr}`,
					}

					pageAnnotationsMap[parseInt(pageIndexStr)].push(annotation)
				} catch (error) {
					console.error('Error creating annotation:', error)
				}
			})
		})
	})

	return pageAnnotationsMap
}

export interface UniqueNode {
	id: number
	displayIndex: number
	type: number | string
	color: string
}

/** Данные для легенды узлов (цвет + TI-RADS тип), без Annotorious-обвязки. */
export function buildUniqueNodes(segments: Segment[] | undefined): UniqueNode[] {
	if (!segments) return []
	return segments.map((segment, index) => ({
		id: segment.id,
		displayIndex: index + 1,
		type: segment.details?.nodule_type ?? '-',
		color: NODE_COLORS[index % NODE_COLORS.length],
	}))
}
