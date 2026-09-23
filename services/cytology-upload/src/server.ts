import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'

import { handleCytologyUploadHttpRequest, resolveUploadRoot, sendJson } from '@medml/cytology-upload/server'

/**
 * Сервис чанковой загрузки снимков цитологии.
 */

const PORT = Number(process.env.PORT ?? 8090)
const HOST = process.env.HOST ?? '0.0.0.0'

/** Адрес Go-шлюза (composition-api). */
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? 'http://composition_api:50055'

/** Путь создания исследования: у Go без завершающего слеша, у Django — со слешем. */
const CYTOLOGY_CREATE_PATH = process.env.CYTOLOGY_CREATE_PATH ?? '/api/v1/cytology/create'

/** Где копятся чанки и собранные файлы. В контейнере — том, иначе пропадут. */
const UPLOAD_ROOT = process.env.UPLOAD_ROOT ?? resolveUploadRoot()

/**
 * Таймаут ответа шлюза. Ноль — без лимита: отправка десятигигабайтного файла
 * легко выходит за любой разумный дефолт.
 */
const UPSTREAM_TIMEOUT_MS = Number(process.env.UPSTREAM_TIMEOUT_MS ?? 0)

const options = {
	uploadRoot: UPLOAD_ROOT,
	apiProxyTarget: API_PROXY_TARGET,
	cytologyCreatePath: CYTOLOGY_CREATE_PATH,
	upstreamRequestTimeoutMs: UPSTREAM_TIMEOUT_MS,
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
	const url = new URL(req.url ?? '/', 'http://localhost')

	// Проверка живости для healthcheck в compose.
	if (url.pathname === '/healthz') {
		sendJson(res, 200, { status: 'ok' })
		return
	}

	if (!url.pathname.startsWith('/api/upload')) {
		sendJson(res, 404, { success: false, message: 'Not found' })
		return
	}

	const handled = await handleCytologyUploadHttpRequest(req, res, url.pathname, options)
	if (!handled) {
		sendJson(res, 404, { success: false, message: 'Not found' })
	}
}

const server = createServer((req, res) => {
	handle(req, res).catch((error: unknown) => {
		const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
		console.error(`[cytology-upload] ${req.method ?? '?'} ${pathname}`, error)

		if (!res.headersSent) {
			sendJson(res, 500, {
				success: false,
				message: error instanceof Error ? error.message : 'Internal error',
			})
		}
	})
})

// Загрузка большого файла идёт долго; дефолтные таймауты Node её обрывают.
server.requestTimeout = 0
server.headersTimeout = 0
server.timeout = 0

server.listen(PORT, HOST, () => {
	console.info(
		`[cytology-upload] слушаю ${HOST}:${PORT}\n` +
			`  шлюз:      ${API_PROXY_TARGET}${CYTOLOGY_CREATE_PATH}\n` +
			`  хранилище: ${UPLOAD_ROOT}`,
	)
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
	process.on(signal, () => {
		server.close(() => process.exit(0))
	})
}
