import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Provider } from 'react-redux'
import { setToken, useAppSelector as useRootSelector } from '@medml/store'

import CytologyView from './CytologyView/CytologyView'
import { createCytologyViewStore } from './core/store/store'

export default function CytologyViewPage() {
	const params = useParams<{ id: string }>()
	const cytologyId = params.id?.trim() ?? ''
	const accessToken = useRootSelector(state => state.auth.accessToken)

	const store = useMemo(() => createCytologyViewStore(), [])

	useEffect(() => {
		store.dispatch(setToken(accessToken))
	}, [accessToken, store])

	if (!cytologyId) {
		return null
	}

	return (
		<Provider store={store}>
			<CytologyView generalCytologyId={cytologyId} />
		</Provider>
	)
}
