import type { CytologySegmentType } from './cytologyApi'

const SEGMENT_LABELS: Record<string, string> = {
	NIL: 'Нет информации о клетках',
	NIR: 'Нет информации о скоплениях',
	NIM: 'Нет информации о метастазе',
	CNO: 'Клетки ЩЖ (норма)',
	CGE: 'Клетки ЩЖ Гюртле',
	C2N: 'Клетки ЩЖ с 2 или более ядрами',
	CPS: 'Клетка ЩЖ с псевдоисключением',
	CFC: 'Клетки ЩЖ с бородой в ядре',
	CLY: 'Лимфоциты',
	SOS: 'Бесформенная структура с упорядоченным расположением клеток',
	SDS: 'Бесформенная структура с неупорядоченным расположением клеток',
	SMS: 'Микрофолликулярная структура',
	STS: 'Трабекулярная структура',
	SPS: 'Папиллярная структура',
	SNM: 'Скопление без метастаза',
	STM: 'Скопление с метастазом',
}

const SEGMENT_CODES = Object.keys(SEGMENT_LABELS)

const PALETTE = ['#00d0fa', '#53fa00', '#ff6200', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1']

export const CYTOLOGY_SEGMENT_TYPES: CytologySegmentType[] = SEGMENT_CODES.map((code, index) => ({
	code,
	label: SEGMENT_LABELS[code] ?? code,
	color: PALETTE[index % PALETTE.length] ?? '#00d0fa',
}))
