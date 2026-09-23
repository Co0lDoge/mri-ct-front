import type { CSSProperties } from 'react'

import { radius, semantic, shadow, spacing } from './theme/tokens'

type TokenLike = {
	colorBgContainer?: string
	colorBgLayout: string
}

export const getSurfaceCardStyle = (token: TokenLike): CSSProperties => ({
	background: token.colorBgContainer || semantic.bgContainer,
	borderRadius: radius.xl,
	boxShadow: shadow.card,
	border: `1px solid ${semantic.border}`,
})

export const getPageSurfaceStyle = (token: TokenLike): CSSProperties => ({
	backgroundColor: token.colorBgLayout || semantic.bgLayout,
	padding: spacing.lg,
	borderRadius: radius.xl,
})

export const getAccentOutlineButtonStyle = (): CSSProperties => ({
	color: semantic.textPrimary,
	borderColor: semantic.borderStrong,
	borderRadius: radius.full,
})
