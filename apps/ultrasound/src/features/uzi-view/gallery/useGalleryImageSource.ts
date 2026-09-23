import { useEffect, useMemo, useState } from 'react'
import { isTiffUrl, getImageDimensions, isDicomUrl } from '@medml/shared'
import { prepareTiffImageArray } from './tiffSlides'
import type { ImageTile } from './types'

/**
 * Для TIFF/DICOM бэкенд отдаёт PNG-нарезку рядом со снимком (`<dir>/pngs`).
 * Если `slide_template` не пришёл — восстанавливаем его из URL исходника.
 */
function deriveTiffSlideTemplate(link1: string): [string, string, string] | null {
	try {
		const imageUrl = new URL(
			link1,
			typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
		)
		const pngBase = imageUrl.pathname.replace(/\/[^/]+$/, '') + '/pngs'
		return [`${imageUrl.origin}${pngBase}`, 'slide_', '.png']
	} catch {
		return null
	}
}

/** Результат подготовки, привязанный к конкретному снимку (`key`). */
interface PreparedImage {
	key: string
	tiles: ImageTile[]
	dimensions: { width: number; height: number } | null
}

export interface UseGalleryImageSourceOptions {
	link1: string | null
	image_count: number
	slide_template?: string[]
	slide_urls?: string[]
}

export interface UseGalleryImageSourceResult {
	isLoading: boolean
	/** Готовый источник для вьюера: массив кадров (TIFF/DICOM) либо один снимок. */
	imageSource: ImageTile | ImageTile[]
	/**
	 * Снимок требует PNG-нарезки (TIFF/DICOM), но кадров нет.
	 * Показывать сам TIFF нельзя — браузеры его не декодируют.
	 */
	slidesUnavailable: boolean
}

/**
 * Приводит разнородные варианты снимка (одиночный PNG, постраничная нарезка
 * TIFF/DICOM) к единому источнику для `<ThyroidAnnotatedViewer />`.
 *
 * Важно: у кадров нарезки проставляются реальные width/height. OpenSeadragon
 * с `type: 'image'` умеет узнать размеры сам, но делает это асинхронно уже
 * после построения раскладки — в постраничном режиме (`sequenceMode`) это
 * приводило к вырожденному первому кадру («тонкая полоса»). Кадры нарезки
 * одного размера, поэтому достаточно измерить первый и применить ко всем.
 */
export function useGalleryImageSource({
	link1,
	image_count,
	slide_template,
	slide_urls,
}: UseGalleryImageSourceOptions): UseGalleryImageSourceResult {
	const [prepared, setPrepared] = useState<PreparedImage | null>(null)

	const usesGeneratedSlides = link1 ? isTiffUrl(link1) || isDicomUrl(link1) : false

	// Ключи для сравнения в зависимостях: сами массивы приходят новыми
	// литералами на каждый рендер родителя. Разделитель обязателен — иначе
	// разные наборы ссылок могут склеиться в одну и ту же строку.
	const slideUrlsKey = (slide_urls ?? []).join('\n')
	const slideTemplateKey = (slide_template ?? []).join('\n')

	useEffect(() => {
		if (!link1) return

		let cancelled = false

		const prepareImage = async () => {
			try {
				if (usesGeneratedSlides) {
					// Бэкенд всегда присылает `slide_template: []`, поэтому проверяем
					// длину, а не nullish: с `??` запасной путь не срабатывал никогда.
					const template =
						slide_template && slide_template.length === 3
							? slide_template
							: (deriveTiffSlideTemplate(link1) ?? undefined)

					const tiles = prepareTiffImageArray({
						slide_urls,
						slide_template: template,
						image_count: image_count || 1,
					})

					// Размеры берём с первого кадра: OSD не должен достраивать
					// раскладку асинхронно уже после инициализации.
					const firstSize = tiles.length > 0 ? await getImageDimensions(tiles[0].url) : null
					if (cancelled) return

					const sized = firstSize
						? tiles.map(tile => ({
								...tile,
								width: firstSize.width,
								height: firstSize.height,
							}))
						: tiles

					setPrepared({ key: link1, tiles: sized, dimensions: firstSize })
					return
				}

				const dimensions = await getImageDimensions(link1)
				if (!cancelled) {
					setPrepared({ key: link1, tiles: [], dimensions })
				}
			} catch (err) {
				console.error('Error preparing image:', err)
				if (!cancelled) {
					setPrepared({ key: link1, tiles: [], dimensions: null })
				}
			}
		}

		void prepareImage()

		return () => {
			cancelled = true
		}
		// slide_urls / slide_template сравниваются по строковым ключам выше.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [link1, image_count, slideTemplateKey, slideUrlsKey, usesGeneratedSlides])

	const isReady = !link1 || prepared?.key === link1

	const imageSource = useMemo<ImageTile | ImageTile[]>(() => {
		if (usesGeneratedSlides) {
			return isReady ? (prepared?.tiles ?? []) : []
		}

		const dimensions = isReady ? prepared?.dimensions : null
		return {
			type: 'image',
			url: link1 ?? '',
			...(dimensions
				? { width: dimensions.width, height: dimensions.height }
				: {}),
		}
	}, [isReady, link1, prepared, usesGeneratedSlides])

	const slidesUnavailable =
		usesGeneratedSlides && isReady && (prepared?.tiles.length ?? 0) === 0

	return { isLoading: !isReady, imageSource, slidesUnavailable }
}
