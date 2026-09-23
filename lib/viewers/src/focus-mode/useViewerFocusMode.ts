import { useState, type Dispatch, type SetStateAction } from 'react'
import { Grid } from 'antd'

/**
 * Режим фокуса на снимке: соседние блоки страницы можно убрать, снимок при
 * этом становится выше.
 *
 * Живёт в `@medml/viewers`, потому что это поведение самого рабочего места
 * врача, а не конкретного исследования: и в УЗИ, и в цитологии страница
 * устроена одинаково — сводка сверху, снимок слева, панель справа.
 * Доменного здесь ничего нет, только флаги видимости и высота.
 */

export interface ViewerFocusMode {
	/** Показывать ли сводку над снимком. */
	showOverview: boolean
	setShowOverview: Dispatch<SetStateAction<boolean>>
	/** Показывать ли боковую панель справа от снимка. */
	showSidebar: boolean
	setShowSidebar: Dispatch<SetStateAction<boolean>>
	/** Убраны оба соседних блока — остался один снимок. */
	isViewerFocused: boolean
	/** Высота области снимка в пикселях с учётом ширины экрана. */
	viewerHeight: number
	/** Убрать оба блока разом, а если хоть один скрыт — вернуть всё обратно. */
	toggleFocus: () => void
}

/**
 * Высоты подобраны так, чтобы снимок рос по мере освобождения места, но не
 * уезжал за пределы экрана: на узких экранах вертикального запаса нет, и
 * скрытие блоков там ничего не даёт.
 */
function resolveViewerHeight(
	isNarrow: boolean,
	isMedium: boolean,
	hiddenCount: number,
): number {
	if (isNarrow) return 360
	if (isMedium) return 480
	if (hiddenCount === 2) return 820
	if (hiddenCount === 1) return 720
	return 600
}

export function useViewerFocusMode(): ViewerFocusMode {
	const screens = Grid.useBreakpoint()

	const [showOverview, setShowOverview] = useState(true)
	const [showSidebar, setShowSidebar] = useState(true)

	const isViewerFocused = !showOverview && !showSidebar
	const hiddenCount = (showOverview ? 0 : 1) + (showSidebar ? 0 : 1)

	const viewerHeight = resolveViewerHeight(!screens.md, !screens.lg, hiddenCount)

	const toggleFocus = () => {
		// Если скрыт хотя бы один блок — кнопка возвращает обычный режим.
		const shouldFocus = showOverview || showSidebar
		setShowOverview(!shouldFocus)
		setShowSidebar(!shouldFocus)
	}

	return {
		showOverview,
		setShowOverview,
		showSidebar,
		setShowSidebar,
		isViewerFocused,
		viewerHeight,
		toggleFocus,
	}
}
