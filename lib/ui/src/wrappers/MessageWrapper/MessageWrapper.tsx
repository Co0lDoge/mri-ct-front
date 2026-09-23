'use client'

import { App } from 'antd'
import { useCallback, useMemo, type ReactNode } from 'react'

import { MessageContext } from '../../contexts'

interface MessageWrapperProps {
	children: ReactNode
}

const MessageWrapper: React.FC<MessageWrapperProps> = ({ children }) => {
	const { message: messageApi } = App.useApp()

	const setError = useCallback(
		(error?: string) => {
			if (error) messageApi.error(error)
		},
		[messageApi],
	)

	const value = useMemo(() => ({ messageApi, setError }), [messageApi, setError])

	return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
}

export default MessageWrapper
