'use client'

import { Spin } from 'antd'
import { useEffect, useState, type ReactNode } from 'react'

import { LoadingContext } from '../../contexts'

import './LoadingWrapper.scss'

interface LoadingWrapperProps {
	children: ReactNode
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
	const [loading, setLoading] = useState<boolean>(false)
	const [loadingStack, setLoadingStack] = useState<Record<string, boolean[]>>({})

	const start = (actionName: string) => {
		setLoadingStack(prevState => {
			const newStack = { ...prevState }

			if (actionName in newStack) {
				return {
					...newStack,
					[actionName]: [...newStack[actionName], true],
				}
			} else {
				return {
					...newStack,
					[actionName]: [true],
				}
			}
		})
	}

	const stop = (actionName: string) => {
		setLoadingStack(prevState => {
			const newState = { ...prevState }

			if (actionName in newState) {
				if (newState[actionName].length > 1) {
					newState[actionName].pop()
				} else {
					delete newState[actionName]
				}
			}

			return newState
		})
	}

	const stopAll = () => {
		setLoadingStack({})
	}

	const isBusy = Object.keys(loadingStack).length > 0

	if (isBusy && !loading) {
		setLoading(true)
	}

	useEffect(() => {
		if (isBusy) return

		const timer = setTimeout(() => setLoading(false), 250)
		return () => clearTimeout(timer)
	}, [isBusy])

	return (
		<LoadingContext.Provider value={{ start, stop, stopAll }}>
			<Spin fullscreen spinning={loading} rootClassName='spinner' />
			{children}
		</LoadingContext.Provider>
	)
}

export default LoadingWrapper
