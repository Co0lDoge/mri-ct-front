import { useCallback, useSyncExternalStore } from 'react'

/**
 * Хук для определения, находится ли ширина окна в пределах узкого
 */
export function useNarrowViewport(maxWidth = 768): boolean {
	const query = `(max-width: ${maxWidth}px)`

	const subscribe = useCallback(
		(onChange: () => void) => {
			if (typeof window === 'undefined' || !window.matchMedia) {
				return () => undefined
			}
			const mql = window.matchMedia(query)
			mql.addEventListener('change', onChange)
			return () => mql.removeEventListener('change', onChange)
		},
		[query],
	)

	const getSnapshot = useCallback(() => {
		if (typeof window === 'undefined' || !window.matchMedia) return false
		return window.matchMedia(query).matches
	}, [query])

	const getServerSnapshot = useCallback(() => false, [])

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
