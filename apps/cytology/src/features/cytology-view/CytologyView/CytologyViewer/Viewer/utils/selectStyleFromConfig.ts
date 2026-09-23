import type { Annotation, AnnotationBody, AnnotationState, DrawingStyle } from '@annotorious/openseadragon'

import { IAnnotationStyleConfig } from '../interfaces/IAnnotationStylesConfig'
import { annotationTypesStyles } from '../config'

type AnnotationTag = {
	ai?: boolean
	seg_type?: string
	toDelete?: boolean
	toUpdate?: boolean
	toAdd?: boolean
}

export type AnnotationStyleOptions = {
	activeSegmentType?: string | null
	isEditMode?: boolean
}

function isReadOnlyInEditMode(tag: AnnotationTag, options?: AnnotationStyleOptions): boolean {
	if (!options?.isEditMode) {
		return false
	}
	if (!options.activeSegmentType || tag.seg_type !== options.activeSegmentType) {
		return true
	}
	if (tag.ai && !tag.toAdd && !tag.toUpdate) {
		return true
	}
	return false
}

type HexColor = `#${string}`

const FALLBACK_COLOR: HexColor = '#00d995'

function normalizeHex6(color: string): HexColor | null {
	const trimmed = color.trim()

	if (trimmed.startsWith('#')) {
		const hex = trimmed.slice(1)
		if (/^[0-9a-f]{3}$/i.test(hex)) {
			return `#${hex
				.split('')
				.map(c => c + c)
				.join('')}`
		}
		if (/^[0-9a-f]{6}$/i.test(hex)) {
			return `#${hex}`
		}
		if (/^[0-9a-f]{8}$/i.test(hex)) {
			return `#${hex.slice(0, 6)}`
		}
	}

	const rgba = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
	if (rgba) {
		const toHex = (n: number) => n.toString(16).padStart(2, '0')
		return `#${toHex(Number(rgba[1]))}${toHex(Number(rgba[2]))}${toHex(Number(rgba[3]))}`
	}

	return null
}

/** #RRGGBBAA — Annotorious 3.0.x корректно применяет прозрачность только так (не через fillOpacity). */
function colorToHex8(color: string, alpha: number): HexColor {
	const base = normalizeHex6(color) ?? FALLBACK_COLOR
	const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
		.toString(16)
		.padStart(2, '0')
	return `${base}${a}`
}

function buildSegmentTypeStyle(
	color: string,
	options?: { fillAlpha?: number; hoverFillAlpha?: number },
): IAnnotationStyleConfig {
	const fillAlpha = options?.fillAlpha ?? 0.35
	const hoverFillAlpha = options?.hoverFillAlpha ?? 0.5
	const stroke = normalizeHex6(color) ?? FALLBACK_COLOR

	return {
		stroke,
		fill: colorToHex8(color, fillAlpha),
		hover: {
			stroke,
			fill: colorToHex8(color, hoverFillAlpha),
		},
	}
}

function resolveStyleFromTag(
	response: AnnotationTag,
	colorsByType: Record<string, string>,
	options?: AnnotationStyleOptions,
): DrawingStyle | undefined {
	const segmentColor = response.seg_type ? colorsByType[response.seg_type] : undefined
	const readOnly = isReadOnlyInEditMode(response, options)

	if (segmentColor) {
		if (readOnly) {
			return buildSegmentTypeStyle(segmentColor, {
				fillAlpha: 0.18,
				hoverFillAlpha: 0.24,
			})
		}
		if (response.toDelete) {
			return buildSegmentTypeStyle(segmentColor, {
				fillAlpha: 0.2,
				hoverFillAlpha: 0.3,
			})
		}
		if (response.toUpdate) {
			return buildSegmentTypeStyle(segmentColor, {
				fillAlpha: 0.42,
				hoverFillAlpha: 0.55,
			})
		}
		if (response.toAdd) {
			return buildSegmentTypeStyle(segmentColor, {
				fillAlpha: 0.28,
				hoverFillAlpha: 0.4,
			})
		}
		return buildSegmentTypeStyle(segmentColor)
	}

	if (response.toAdd) {
		return annotationTypesStyles.add
	}
	if (response.toDelete) {
		return annotationTypesStyles.delete
	}
	if (response.toUpdate) {
		return annotationTypesStyles.update
	}
	return annotationTypesStyles.default
}

export const createSelectStyleFromConfig =
	(colorsByType: Record<string, string> = {}, options?: AnnotationStyleOptions) =>
	(annotation: Annotation, state: AnnotationState | undefined): DrawingStyle | undefined => {
		const tagging = annotation.bodies.find((b: AnnotationBody) => b?.purpose === 'tagging')?.value
		const response: AnnotationTag | undefined = tagging ? JSON.parse(tagging) : undefined

		if (!response) {
			return undefined
		}

		const style = resolveStyleFromTag(response, colorsByType, options)

		if (state?.hovered && style && 'hover' in style && style.hover) {
			return style.hover
		}

		return style
	}

export const selectStyleFromConfig = createSelectStyleFromConfig()
