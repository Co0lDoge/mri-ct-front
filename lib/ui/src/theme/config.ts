import type { ThemeConfig } from 'antd'
import {
	fontFamily,
	fontWeight,
	palette,
	radius,
	semantic,
	shadow,
	slate,
	spacing,
	status,
	typography,
} from './tokens'

/**
 * Единая тема Ant Design v5 для всех приложений платформы.
 * Подключается один раз в `AntDesignProviderSpa` через `<ConfigProvider theme>`.
 *
 * Все значения берутся из `tokens.ts` — здесь нет ни одного «сырого» hex.
 * Если нужно поменять цвет — правится `tokens.ts`, а не этот файл.
 *
 * Ключевые решения соответствия макету:
 * - `colorPrimary` = cyan: он управляет фокусом, ссылками, активными
 *   состояниями — в макете всё это бирюзовое.
 * - `Button.colorPrimary` = navy: сплошная основная кнопка в макете тёмная
 *   («Войти»). Бирюзовая CTA («Провести диагностику») — отдельный вариант,
 *   см. `accentButtonTheme` ниже.
 * - Радиус кнопок/чипов/сегментов — pill (9999), карточек — 24.
 */
export const baseThemeConfig: ThemeConfig = {
	token: {
		/* Цвет */
		colorPrimary: palette.cyan,
		colorInfo: status.info,
		colorSuccess: status.success,
		colorWarning: status.warning,
		colorError: status.error,

		colorLink: semantic.link,
		colorLinkHover: palette.blue,
		colorLinkActive: palette.navy,

		colorText: semantic.textPrimary,
		colorTextSecondary: semantic.textSecondary,
		colorTextTertiary: semantic.textTertiary,
		colorTextPlaceholder: semantic.textPlaceholder,

		colorBgLayout: semantic.bgLayout,
		colorBgContainer: semantic.bgContainer,
		colorBorder: semantic.border,
		colorBorderSecondary: semantic.border,

		/* Типографика */
		fontFamily: fontFamily.ui,
		fontSize: typography.body.size,
		fontSizeSM: typography.caption.size,
		fontSizeLG: typography.body.size,
		fontSizeHeading1: typography.h1.size,
		fontSizeHeading2: typography.h2.size,
		fontSizeHeading3: typography.h3.size,
		fontSizeHeading4: typography.h4.size,
		fontSizeHeading5: typography.body.size,
		fontWeightStrong: fontWeight.semibold,

		/* Геометрия */
		borderRadius: radius.md,
		borderRadiusSM: radius.sm,
		borderRadiusLG: radius.xl,
		borderRadiusXS: radius.xs,

		controlHeight: 40,
		controlHeightSM: 32,
		controlHeightLG: 46,

		/* Тени */
		boxShadow: shadow.card,
		boxShadowSecondary: shadow.sm,
		boxShadowTertiary: shadow.xs,

		/* Сетка 4px */
		padding: spacing.lg,
		paddingSM: spacing.md,
		paddingLG: spacing.xl,
		paddingXS: spacing.sm,
		margin: spacing.lg,
		marginSM: spacing.md,
		marginLG: spacing.xl,
		marginXS: spacing.sm,

		/* Фокус: 4px cyan ring 18% */
		controlOutline: semantic.focusRing,
		controlOutlineWidth: 4,
		lineWidth: 1,
		lineWidthFocus: 2,
		wireframe: false,
	},

	components: {
		/**
		 * Макет: pill-кнопки 24px по горизонтали, 14px по вертикали,
		 * подпись 14 SemiBold. Основная — navy, вторичная — outline slate-300,
		 * текстовая — cyan.
		 */
		Button: {
			borderRadius: radius.full,
			borderRadiusLG: radius.full,
			borderRadiusSM: radius.full,
			borderRadiusXS: radius.full,

			colorPrimary: palette.navy,
			colorPrimaryHover: slate[700],
			colorPrimaryActive: palette.navy,
			primaryShadow: 'none',

			defaultBorderColor: slate[300],
			defaultColor: palette.navy,
			defaultShadow: 'none',

			colorLink: semantic.link,
			colorLinkHover: palette.blue,
			colorLinkActive: palette.navy,

			colorTextDisabled: slate[400],

			contentFontSize: typography.label.size,
			contentFontSizeLG: typography.body.size,
			contentFontSizeSM: typography.caption.size,
			fontWeight: fontWeight.semibold,

			paddingInline: spacing.xl,
			paddingInlineLG: spacing.xl,
			paddingInlineSM: spacing.lg,
		},

		/** Карточки: радиус 24, тень card, бордер slate-200, паддинг 24. */
		Card: {
			borderRadiusLG: radius.xl,
			colorBorderSecondary: semantic.border,
			boxShadowTertiary: shadow.card,
			paddingLG: spacing.xl,
			padding: spacing.xl,
			headerFontSize: typography.h4.size,
			headerFontSizeSM: typography.body.size,
		},

		/** Инпуты: радиус 14, бордер slate-200, плейсхолдер slate-400. */
		Input: {
			borderRadius: radius.md,
			borderRadiusLG: radius.md,
			borderRadiusSM: radius.sm,
			paddingInline: spacing.md,
			paddingInlineLG: spacing.lg,
			paddingBlock: spacing.sm,
			colorBorder: semantic.border,
			activeBorderColor: palette.cyan,
			hoverBorderColor: semantic.borderStrong,
			activeShadow: shadow.focus,
			colorTextPlaceholder: semantic.textPlaceholder,
		},

		InputNumber: {
			borderRadius: radius.md,
			colorBorder: semantic.border,
			activeBorderColor: palette.cyan,
			activeShadow: shadow.focus,
		},

		Select: {
			borderRadius: radius.md,
			colorBorder: semantic.border,
			optionSelectedBg: status.infoBg,
			optionSelectedColor: palette.navy,
			optionSelectedFontWeight: fontWeight.semibold,
		},

		DatePicker: {
			borderRadius: radius.md,
			colorBorder: semantic.border,
			activeBorderColor: palette.cyan,
			activeShadow: shadow.focus,
		},

		/** Чипы-статусы: pill, 12px Medium, пастельный фон. */
		Tag: {
			borderRadiusSM: radius.full,
			defaultBg: status.neutralBg,
			defaultColor: slate[700],
			fontSize: typography.caption.size,
			lineHeight: 1.4,
		},

		/** Алерты: радиус 14, паддинг 18, бордер цвета статуса. */
		Alert: {
			borderRadiusLG: radius.md,
			withDescriptionPadding: 18,
			colorSuccessBg: status.successBg,
			colorSuccessBorder: status.success,
			colorWarningBg: status.warningBg,
			colorWarningBorder: status.warning,
			colorErrorBg: status.errorBg,
			colorErrorBorder: status.error,
			colorInfoBg: status.infoBg,
			colorInfoBorder: status.info,
		},

		/** Сегменты: pill-контейнер slate-100, активная опция белая с бордером. */
		Segmented: {
			borderRadius: radius.full,
			borderRadiusSM: radius.full,
			borderRadiusLG: radius.full,
			trackBg: status.neutralBg,
			trackPadding: spacing.xs,
			itemSelectedBg: palette.white,
			itemSelectedColor: palette.navy,
			itemColor: semantic.textSecondary,
			itemHoverColor: palette.navy,
			controlHeight: 41,
		},

		Menu: {
			itemBorderRadius: radius.full,
			subMenuItemBorderRadius: radius.sm,
			itemSelectedBg: status.infoBg,
			itemSelectedColor: palette.navy,
			itemHoverBg: status.neutralBg,
			itemColor: semantic.textSecondary,
			itemHeight: 40,
			activeBarBorderWidth: 0,
			horizontalItemSelectedColor: palette.cyan,
			fontSize: typography.label.size,
		},

		/** Таблицы: заголовок на slate-50, данные — Inter (табулярные цифры). */
		Table: {
			borderRadiusLG: radius.xl,
			headerBg: slate[50],
			headerColor: semantic.textSecondary,
			headerSplitColor: 'transparent',
			borderColor: semantic.border,
			rowHoverBg: slate[50],
			cellPaddingBlock: spacing.md,
			cellPaddingInline: spacing.lg,
			fontSize: typography.bodySm.size,
		},

		Modal: {
			borderRadiusLG: radius.xl,
			paddingContentHorizontalLG: spacing.xl,
			titleFontSize: typography.h4.size,
			boxShadow: shadow.lg,
		},

		Typography: {
			colorTextSecondary: semantic.textSecondary,
			titleMarginBottom: 0,
			titleMarginTop: 0,
			fontWeightStrong: fontWeight.semibold,
		},

		Tooltip: {
			borderRadius: radius.sm,
			colorBgSpotlight: palette.navy,
		},

		Tabs: {
			itemSelectedColor: palette.navy,
			itemHoverColor: palette.cyan,
			inkBarColor: palette.cyan,
			titleFontSize: typography.label.size,
		},

		Form: {
			labelColor: slate[700],
			labelFontSize: typography.label.size,
			verticalLabelPadding: `0 0 ${spacing.xs}px`,
			itemMarginBottom: spacing.lg,
		},

		Spin: {
			colorPrimary: palette.cyan,
		},

		Progress: {
			defaultColor: palette.cyan,
		},

		Switch: {
			colorPrimary: palette.cyan,
			colorPrimaryHover: palette.blue,
		},
	},
}

/**
 * Бирюзовая CTA («Провести диагностику»).
 *
 * В макете это отдельный по смыслу тип кнопки — «запустить AI-диагностику», —
 * а не просто цвет. Оборачивайте точечно:
 *
 * ```tsx
 * <ConfigProvider theme={accentButtonTheme}>
 *   <Button type="primary">Провести диагностику</Button>
 * </ConfigProvider>
 * ```
 *
 * Либо, если в проекте antd >= 5.21, тем же результатом будет
 * `<Button color="cyan" variant="solid">` без обёртки.
 */
export const accentButtonTheme: ThemeConfig = {
	components: {
		Button: {
			colorPrimary: palette.cyan,
			colorPrimaryHover: palette.blue,
			colorPrimaryActive: palette.cyan,
			primaryShadow: 'none',
		},
	},
}

/** Соответствие TI-RADS → цвет чипа/алерта. Единая точка для всех модальностей. */
export const tiradsTone = {
	1: { color: status.success, bg: status.successBg },
	2: { color: status.success, bg: status.successBg },
	3: { color: status.warning, bg: status.warningBg },
	4: { color: status.warning, bg: status.warningBg },
	5: { color: status.error, bg: status.errorBg },
} as const
