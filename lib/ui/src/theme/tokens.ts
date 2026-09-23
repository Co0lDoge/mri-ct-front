/**
 * Дизайн-токены платформы «Второе мнение».
 *
 * ЕДИНСТВЕННЫЙ источник правды по цвету/типографике/радиусам/теням.
 * Значения сняты из Figma «01 — Design System» (Redesign Mockups).
 *
 * Правила:
 * - Ни один hex не должен появляться в компонентах напрямую — только отсюда.
 * - `theme/config.ts` (antd ThemeConfig) собирается из этих значений.
 * - `styles/tokens.scss` держит те же значения для SCSS-слоя.
 */

/* ------------------------------------------------------------------ */
/* Примитивы: сырая палитра                                            */
/* ------------------------------------------------------------------ */

/** Нейтральная шкала Slate — 60% интерфейса. */
export const slate = {
	50: '#F8FAFC',
	100: '#F1F5F9',
	200: '#E2E8F0',
	300: '#CBD5E1',
	400: '#94A3B8',
	500: '#64748B',
	600: '#475569',
	700: '#334155',
	800: '#1E293B',
	900: '#0F172A',
} as const

export const palette = {
	/** Brand Navy — структура, основной текст, сплошные кнопки. */
	navy: '#0F172A',
	/** Teal-Cyan — AI-акцент, фокус, ссылки. Используется точечно (10%). */
	cyan: '#06B6D4',
	/** Bright Blue — вторичный акцент, начало AI-градиента. */
	blue: '#3B82F6',
	/** Medical Gray — фон рабочих областей. */
	medicalGray: '#F8FAFC',
	white: '#FFFFFF',
} as const

/** Статусы. В УЗИ-контуре завязаны на TI-RADS, поэтому названы по смыслу. */
export const status = {
	/** Norm — TI-RADS 1–2. */
	success: '#10B981',
	successBg: '#ECFDF5',
	/** Monitor — TI-RADS 3–4. */
	warning: '#F59E0B',
	warningBg: '#FFFBEB',
	/** High risk — TI-RADS 5. */
	error: '#E11D48',
	errorBg: '#FFF1F2',
	/** Info / AI. */
	info: '#06B6D4',
	infoBg: '#ECFEFF',
	neutralBg: '#F1F5F9',
} as const

/** Градиент только для логотипа и AI-акцентов, не для фонов кнопок. */
export const aiGradient = `linear-gradient(90deg, ${palette.blue} 0%, ${palette.cyan} 100%)`

/* ------------------------------------------------------------------ */
/* Семантика: на что цвет назначен                                     */
/* ------------------------------------------------------------------ */

export const semantic = {
	textPrimary: slate[900],
	textSecondary: slate[600],
	textTertiary: slate[500],
	textPlaceholder: slate[400],
	textInverse: palette.white,

	bgLayout: slate[50],
	bgContainer: palette.white,
	bgMuted: slate[100],

	border: slate[200],
	borderStrong: slate[300],

	link: palette.cyan,
	focusRing: 'rgba(6, 182, 212, 0.18)',
} as const

/* ------------------------------------------------------------------ */
/* Типографика                                                         */
/* ------------------------------------------------------------------ */

/**
 * Onest — display и UI. Inter — табличные данные, измерения, проценты
 * (у Inter табулярные цифры, поэтому числа не «прыгают» в таблицах).
 */
export const fontFamily = {
	ui: "'Onest', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
	data: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
} as const

export const fontWeight = {
	regular: 400,
	medium: 500,
	semibold: 600,
	bold: 700,
} as const

/**
 * Шкала из макета. `tracking` — letter-spacing в px (в макете отрицательный
 * у крупных заголовков и положительный у капса).
 */
export const typography = {
	display: { size: 60, weight: fontWeight.bold, tracking: -1.2, family: fontFamily.ui },
	h1: { size: 48, weight: fontWeight.bold, tracking: -0.96, family: fontFamily.ui },
	h2: { size: 36, weight: fontWeight.bold, tracking: -0.72, family: fontFamily.ui },
	h3: { size: 30, weight: fontWeight.semibold, tracking: 0, family: fontFamily.ui },
	h4: { size: 24, weight: fontWeight.semibold, tracking: 0, family: fontFamily.ui },
	body: { size: 16, weight: fontWeight.regular, tracking: 0, family: fontFamily.ui },
	bodySm: { size: 14, weight: fontWeight.regular, tracking: 0, family: fontFamily.ui },
	label: { size: 14, weight: fontWeight.medium, tracking: 0, family: fontFamily.ui },
	caption: { size: 12, weight: fontWeight.regular, tracking: 0, family: fontFamily.ui },
	/** Надзаголовок капсом — секции дизайн-системы, шапки метрик. */
	eyebrow: { size: 12, weight: fontWeight.semibold, tracking: 0.96, family: fontFamily.ui },
	dataSm: { size: 16, weight: fontWeight.semibold, tracking: 0, family: fontFamily.data },
	dataLg: { size: 30, weight: fontWeight.bold, tracking: 0, family: fontFamily.data },
	/** Крупное число в плитке метрики. */
	metric: { size: 40, weight: fontWeight.bold, tracking: 0, family: fontFamily.data },
} as const

/* ------------------------------------------------------------------ */
/* Геометрия                                                           */
/* ------------------------------------------------------------------ */

/** Сетка 4px. Используйте только эти значения для gap/padding/margin. */
export const spacing = {
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 24,
	'2xl': 32,
	'3xl': 48,
	'4xl': 64,
	'5xl': 80,
} as const

/**
 * Радиусы. В макете «pill by default»: кнопки, чипы и сегменты — полностью
 * скруглённые, карточки — крупный радиус.
 */
export const radius = {
	xs: 6,
	sm: 10,
	/** Инпуты, алерты. */
	md: 14,
	lg: 18,
	/** Карточки, плитки метрик. */
	xl: 24,
	'2xl': 32,
	/** Кнопки, чипы, сегменты. */
	full: 9999,
} as const

/** Мягкие «длинные» тени на базе navy, а не чёрного — иначе выглядят грязно. */
export const shadow = {
	xs: '0px 1px 2px 0px rgba(15, 23, 42, 0.04)',
	sm: '0px 4px 12px 0px rgba(15, 23, 42, 0.04)',
	/** Дефолт для карточек и плиток. */
	card: '0px 12px 36px 0px rgba(15, 23, 42, 0.05)',
	md: '0px 18px 44px 0px rgba(15, 23, 42, 0.08)',
	lg: '0px 32px 64px 0px rgba(15, 23, 42, 0.15)',
	/** Кольцо фокуса: 4px cyan 18%. */
	focus: `0px 0px 0px 4px ${semantic.focusRing}`,
} as const

/** Иконки: Lucide, обводка 1.5px, наследуют currentColor. */
export const iconography = {
	strokeWidth: 1.5,
	sizes: [16, 20, 24] as const,
	defaultColor: slate[500],
} as const

/**
 * Каркас страницы. Снято с макетов «02 — Screens» (вьюпорт 1440):
 * appbar 46 → контент; колонка 1280 с полями по 80; заголовок страницы
 * на 48 ниже appbar; между заголовком и первым блоком — 32.
 */
export const layout = {
	/** Ширина контентной колонки: карточки ровно такой ширины. */
	contentMaxWidth: 1280,
	/** Боковые поля контейнера на узких экранах. */
	contentPaddingX: spacing.xl,
	/** Высота верхней панели. */
	appBarHeight: 46,
	/** Отступ от appbar до заголовка страницы. */
	pageTopOffset: spacing['3xl'],
	/** Заголовок страницы → первый блок контента. */
	pageHeaderGap: spacing['2xl'],
	/** Расстояние между карточками/секциями. */
	sectionGap: spacing.xl,
	/** Внутренний паддинг карточки (строка внутри = 1280 − 24×2 = 1232). */
	cardPadding: spacing.xl,
	/** Гаттер между колонками в двухколоночных экранах. */
	columnGutter: spacing.xl,
} as const
