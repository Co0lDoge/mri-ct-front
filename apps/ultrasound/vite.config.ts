import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * `next-auth/react` обращается к Node-глобалу `process` в браузере — в Vite его нет.
 * Инжектим минимальный `process` до загрузки модулей.
 */
function processPolyfillPlugin(mode: string): Plugin {
	const nodeEnv = mode === 'production' ? 'production' : 'development'
	return {
		name: 'ultrasound-process-polyfill',
		transformIndexHtml: {
			order: 'pre',
			handler() {
				return [
					{
						tag: 'script',
						children: `globalThis.process={env:{NODE_ENV:${JSON.stringify(nodeEnv)}}};`,
						injectTo: 'head-prepend',
					},
				]
			},
		},
	}
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	const proxyTarget =
		env.VITE_BACKEND_PROXY_TARGET ??
		env.VITE_ULTRASOUND_PROXY_TARGET ??
		env.ULTRASOUND_API_PROXY_TARGET ??
		'http://localhost:5173'

	// Go-шлюз с billing. По умолчанию тот же docker-compose, что и у цитологии.
	const billingTarget = env.VITE_BILLING_PROXY_TARGET ?? 'http://localhost:8080'

	return {
		plugins: [processPolyfillPlugin(mode), react()],
		resolve: {
			// УЗИ-контур рендерит через @medml/viewers (OpenSeadragon + Annotorious
			// от @recogito). Единый инстанс openseadragon обязателен: две копии
			// ломают привязку Annotorious к вьюеру.
			dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom', 'openseadragon'],
			alias: {
				'@': path.resolve(__dirname, 'src'),
				'@medml/ui': path.resolve(__dirname, '../../lib/ui/src'),
				'@medml/viewers': path.resolve(__dirname, '../../lib/viewers/src'),
				'@medml/patient_view': path.resolve(__dirname, '../../domains/patient_view/src'),
				'@medml/patient_create': path.resolve(__dirname, '../../domains/patient_create/src'),
				'@medml/doctor_profile': path.resolve(__dirname, '../../domains/doctor_profile/src'),
				'@medml/patients': path.resolve(__dirname, '../../domains/patients/src'),
				'@medml/subscriptions': path.resolve(__dirname, '../../domains/subscriptions/src'),
			},
		},
		server: {
			proxy: {
				// billing живёт только в Go-шлюзе (/api/v1), даже когда всё
				// остальное приложение смотрит на Django. Правило должно идти
				// раньше общего '/api' — Vite сопоставляет ключи по порядку.
				'/api/v1': {
					target: billingTarget,
					changeOrigin: true,
				},
				'/api': {
					target: proxyTarget,
					changeOrigin: true,
				},
			},
		},
	}
})
