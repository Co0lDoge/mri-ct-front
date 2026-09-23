import React from 'react'
import { ViewerPanel } from '@medml/viewers'
import type { UniqueNode } from './thyroidAnnotations'
import type { Segment } from '../model/types'
import { formatMm, pxToMm, segmentSizePx } from './measurement'

export interface NodeLegendOverlayProps {
	nodes: UniqueNode[]
	/** Нужны контуры, чтобы посчитать габариты узла. */
	seg?: Segment[]
	/** Масштаб; если не задан — размеры не показываем. */
	pxPerMm?: number | null
}

/**
 * Легенда узлов поверх снимка: цвет, TI-RADS и — после калибровки —
 * габариты образования в миллиметрах. Именно эти значения врач переносит
 * в форму заключения.
 */
const NodeLegendOverlay: React.FC<NodeLegendOverlayProps> = ({
	nodes,
	seg,
	pxPerMm,
}) => {
	if (nodes.length === 0) return null

	const sizeLabel = (nodeId: number): string | null => {
		if (pxPerMm == null) return null
		const segment = seg?.find(item => item.id === nodeId)
		const size = segmentSizePx(segment?.data)
		if (!size) return null

		const width = pxToMm(size.widthPx, pxPerMm)
		const height = pxToMm(size.heightPx, pxPerMm)
		if (width == null || height == null) return null

		return `${formatMm(width)} × ${formatMm(height)}`
	}

	return (
		<ViewerPanel position='top-left' minWidth={140} maxHeight='calc(100% - 40px)'>
			<div
				style={{
					fontSize: 14,
					fontWeight: 'bold',
					textAlign: 'center',
					color: '#333',
					marginBottom: 8,
					borderBottom: '1px solid #eee',
					paddingBottom: 4,
				}}
			>
				Узлы:
			</div>
			{nodes.map(node => {
				const size = sizeLabel(node.id)
				return (
					<div
						key={node.id}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							fontSize: 13,
							color: '#555',
							padding: '4px 0',
						}}
					>
						<div
							style={{
								width: 14,
								height: 14,
								backgroundColor: node.color,
								borderRadius: 3,
								border: '1px solid rgba(0,0,0,0.2)',
								flexShrink: 0,
							}}
						/>
						<span style={{ flex: 1 }}>
							Узел {node.displayIndex}
							{size && (
								<span style={{ display: 'block', fontSize: 11, color: '#777' }}>
									{size}
								</span>
							)}
						</span>
						<span
							style={{
								fontSize: 11,
								backgroundColor: '#f0f0f0',
								padding: '2px 6px',
								borderRadius: 10,
								fontWeight: 'bold',
							}}
						>
							TI-RADS {node.type}
						</span>
					</div>
				)
			})}
		</ViewerPanel>
	)
}

export default NodeLegendOverlay
