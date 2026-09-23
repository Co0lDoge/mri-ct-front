// Контуры структур ЩЖ (доли, перешеек), которые вьюер рисует поверх снимка.
//
// Загрузка пользовательского JSON и его хранение в localStorage удалены
// вместе с блоком «JSON загрузки ЩЖ» на странице загрузки снимка.
// Демонстрационный набор тоже убран: он подставлялся, когда к снимку не
// приложены структуры, и мешал — на снимке появлялись чужие контуры.
// Остались только тип и аксессоры.
export type {
	ThyroidStructureDetails,
	ThyroidStructureFrame,
	ThyroidStructureJson,
} from './types'
export { getStructureFrame, getStructureFrameKeys } from './types'

