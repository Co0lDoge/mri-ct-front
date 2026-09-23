import { isGoBackend } from './apiBackend'

/**
 * Пути цитологии и тайлера для двух бэкендов.
 */

const enc = (value: string | number): string => encodeURIComponent(String(value))

/** Слеш на конце нужен Django (APPEND_SLASH), Go-роутер его не принимает. */
const tail = (): string => (isGoBackend() ? '' : '/')

export const cytologyRoutes = {
	/** POST multipart — создание исследования. */
	create: (): string => `/cytology/create${tail()}`,

	/** GET — карточка исследования (`original_image` + `info.image_group`). */
	info: (id: string | number): string => `/cytology/${enc(id)}`,

	/**
	 * GET — сегменты одного типа.
	 *
	 * Django отдаёт тип последним сегментом пути и массивом групп,
	 * Go — query-параметром `seg_type` и страницей `{count, results}`.
	 */
	segmentsByType: (id: string | number, segType: string): string =>
		isGoBackend()
			? `/cytology/${enc(id)}/segments?seg_type=${enc(segType)}`
			: `/cytology/${enc(id)}/segments/${enc(segType)}/`,

	/** POST — новая группа сегментаций. */
	segmentGroupCreate: (cytologyId: string | number): string =>
		`/cytology/segment/group/create/${enc(cytologyId)}${tail()}`,

	/** PATCH / DELETE — конкретный сегмент. */
	segmentUpdate: (segmentId: string | number): string => `/cytology/segment/update/${enc(segmentId)}${tail()}`,

	/** POST — копия исследования на пересмотр. */
	copy: (): string => `/cytology/copy${tail()}`,

	/** PATCH — данные исследования. */
	update: (id: string | number): string => `/cytology/${enc(id)}/update${tail()}`,

	/** GET — история пересмотров. */
	history: (id: string | number): string => `/cytology/history/${enc(id)}${tail()}`,

	/**
	 * GET — снимки цитологии пациента.
	 *
	 * Django принимает id карты пациента, Go — id самого пациента.
	 * Поэтому вызывающий код обязан передать оба.
	 */
	patientShots: (ids: { cardId: string; patientId?: string }): string =>
		isGoBackend() ? `/cytology/patient/${enc(ids.patientId ?? ids.cardId)}/shots` : `/patient/shots/${enc(ids.cardId)}`,
} as const

/**
 * Тело запроса на копию исследования.
 *
 * Django ждёт числовой `pk`, Go — строковый `id` (uuid).
 */
export function buildCopyBody(id: string | number): Record<string, string | number> {
	return isGoBackend() ? { id: String(id) } : { pk: Number(id) }
}

/**
 * Ручки, которых в Go-шлюзе нет вовсе.
 *
 * `processing-status` в спеке composition-api отсутствует: статус обработки
 * там не публикуется. Опрашивать его в go-режиме бессмысленно — вызывающий
 * код должен пропускать запрос.
 */
export const goMissingEndpoints = {
	processingStatus: (): boolean => isGoBackend(),
	segmentTypes: (): boolean => isGoBackend(),
	/**
	 * Редактирование карты пациента целиком (`/patient/update/{id}`).
	 *
	 * В шлюзе правки разнесены по двум ручкам и вместе не покрывают форму:
	 * `PATCH /med/patient/{id}` принимает только `active` и `malignancy`,
	 * `PATCH /med/card/{doctor_id}/{patient_id}` — только `diagnosis`.
	 * ФИО, полис и почту менять нечем, поэтому форма редактирования
	 * недоступна целиком.
	 */
	patientCardUpdate: (): boolean => isGoBackend(),
} as const
