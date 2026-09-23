'use client'

import { ConfigProvider, theme } from 'antd'
import { ReactNode } from 'react'

import { baseThemeConfig } from '../../theme/config'

export interface AntDesignProviderSpaProps {
	children: ReactNode
	darkMode?: boolean
}

/**
 * Ant Design для Vite/CRA: без @ant-design/nextjs-registry.
 */
export function AntDesignProviderSpa({ children, darkMode = false }: AntDesignProviderSpaProps) {
	const themeConfig = {
		...baseThemeConfig,
		algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
	}

	return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
}
