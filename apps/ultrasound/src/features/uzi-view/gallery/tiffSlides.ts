import type { ImageTile, TiffSlidesOptions } from './types'

/** Разворачивает PNG-нарезку TIFF/DICOM-снимка в список кадров для вьюера. */
export const prepareTiffImageArray = ({
	slide_urls,
	slide_template,
	image_count = 1,
}: TiffSlidesOptions): ImageTile[] => {
	if (slide_urls && slide_urls.length > 0) {
		return slide_urls.map((url): ImageTile => ({
			type: 'image',
			url: url,
		}))
	}

	if (slide_template && slide_template.length === 3) {
		const tmpArray: ImageTile[] = []
		for (let i = 1; i <= image_count; i++) {
			tmpArray.push({
				type: 'image',
				url: `${slide_template[0]}/${slide_template[1]}${i}${slide_template[2]}`,
			})
		}
		return tmpArray
	}

	return []
}
