import OpenSeaDragon from 'openseadragon'
import type { ViewerInstance } from './types'

/**
 * Преобразование координат между снимком и экраном.
 *
 * Вынесено сюда, потому что для этого нужен конструктор `OpenSeadragon.Point`,
 * а приложения не зависят от пакета `openseadragon` напрямую — движок
 * принадлежит `@medml/viewers`. Функции принимают и возвращают обычные числа,
 * поэтому вызывающей стороне про OSD знать не нужно.
 */

export interface PlanePoint {
	x: number
	y: number
}

/** Точка внутри элемента вьюера → координаты пикселя изображения. */
export function elementToImagePoint(
	viewer: ViewerInstance | null,
	x: number,
	y: number,
): PlanePoint | null {
	if (!viewer?.viewport) return null

	const viewportPoint = viewer.viewport.pointFromPixel(new OpenSeaDragon.Point(x, y))
	const imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint)
	return { x: imagePoint.x, y: imagePoint.y }
}

/** Координаты пикселя изображения → точка внутри элемента вьюера. */
export function imageToElementPoint(
	viewer: ViewerInstance | null,
	x: number,
	y: number,
): PlanePoint | null {
	if (!viewer?.viewport) return null

	const point = viewer.viewport.imageToViewerElementCoordinates(
		new OpenSeaDragon.Point(x, y),
	)
	return { x: point.x, y: point.y }
}
