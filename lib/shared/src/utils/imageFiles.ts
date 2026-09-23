/**
 * Утилиты для работы с файлами изображений медицинских снимков.
 * Общие для модальностей (УЗИ, цитология), поэтому живут в @medml/shared,
 * а не в конкретном приложении.
 */

/** Расширение файла из URL без query/hash, в нижнем регистре. */
export const getFileExtension = (url: string): string => {
	if (!url) return ''
	const withoutQuery = url.split('?')[0].split('#')[0]
	const parts = withoutQuery.split('.')
	if (parts.length < 2) return ''
	return parts.pop()?.toLowerCase() || ''
}

export const isTiffUrl = (url: string): boolean => {
	const ext = getFileExtension(url)
	return ext === 'tiff' || ext === 'tif'
}

/**
 * DICOM-снимок. Пустое расширение тоже считается DICOM: бэкенд отдаёт такие
 * файлы без расширения, и для них так же требуется PNG-нарезка.
 */
export const isDicomUrl = (url: string): boolean => {
	const ext = getFileExtension(url)
	return ext === 'dcm' || ext === 'dicom' || ext === ''
}

/** Натуральные размеры картинки; `null`, если загрузить не удалось. */
export const getImageDimensions = (
	url: string,
): Promise<{ width: number; height: number } | null> => {
	return new Promise(resolve => {
		if (!url) {
			resolve(null)
			return
		}

		const img = new Image()
		img.onload = () => {
			resolve({ width: img.naturalWidth, height: img.naturalHeight })
		}
		img.onerror = () => resolve(null)
		img.src = url
	})
}
