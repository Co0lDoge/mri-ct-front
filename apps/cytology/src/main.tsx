import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import { createStore, setRefreshToken as setRefreshTokenState, setToken } from '@medml/store'

import { isJwtUsable } from '@medml/shared'

import App from './App'
import {
	clearAuthToken,
	clearRefreshToken,
	getAuthToken,
	getRefreshToken,
	setAuthToken,
	setRefreshToken,
} from './lib/tokenStorage'

import './styles/reset.scss'
import './styles/global.scss'

const store = createStore()

const persistedAccess = getAuthToken()
const persistedRefresh = getRefreshToken()
const canRestoreSession = isJwtUsable(persistedRefresh) || isJwtUsable(persistedAccess)

if (canRestoreSession) {
	if (persistedAccess) {
		store.dispatch(setToken(persistedAccess))
	}
	if (persistedRefresh) {
		store.dispatch(setRefreshTokenState(persistedRefresh))
	}
} else {
	clearAuthToken()
	clearRefreshToken()
}

let prevAccess = store.getState().auth.accessToken
let prevRefresh = store.getState().auth.refreshToken
store.subscribe(() => {
	const { accessToken, refreshToken } = store.getState().auth
	if (accessToken !== prevAccess) {
		prevAccess = accessToken
		if (accessToken) {
			setAuthToken(accessToken)
		} else {
			clearAuthToken()
		}
	}
	if (refreshToken !== prevRefresh) {
		prevRefresh = refreshToken
		if (refreshToken) {
			setRefreshToken(refreshToken)
		} else {
			clearRefreshToken()
		}
	}
})

const rootEl = document.getElementById('root')
if (!rootEl) {
	throw new Error('Root element #root not found')
}

createRoot(rootEl).render(
	<Provider store={store}>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</Provider>,
)
