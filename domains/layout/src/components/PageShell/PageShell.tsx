'use client'

import './PageShell.scss'

import type { ReactNode } from 'react'

export interface PageShellProps {
	/** Надзаголовок капсом над основным заголовком («ИИ АССИСТЕНТ»). */
	eyebrow?: ReactNode
	/** Заголовок страницы. */
	title?: ReactNode
	/** Пояснение под заголовком. */
	subtitle?: ReactNode
	/** Действия справа от заголовка (кнопки). */
	actions?: ReactNode
	children: ReactNode
	className?: string
}

/**
 * Каркас страницы: контентная колонка нужной ширины + шапка с заголовком.
 *
 * Задаёт вертикальный ритм из макета (48 от appbar до заголовка, 32 до
 * контента, 24 между секциями), чтобы страницы не задавали отступы каждая
 * по-своему.
 */
export default function PageShell({
	eyebrow,
	title,
	subtitle,
	actions,
	children,
	className,
}: PageShellProps) {
	const hasHeader = Boolean(eyebrow || title || subtitle || actions)

	return (
		<div className={['page-shell', className].filter(Boolean).join(' ')}>
			<div className='page-shell__inner'>
				{hasHeader && (
					<div className='page-shell__header'>
						{eyebrow && <span className='page-shell__eyebrow'>{eyebrow}</span>}

						{(title || actions) && (
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: 16,
									flexWrap: 'wrap',
								}}
							>
								{title && <h1 className='page-shell__title'>{title}</h1>}
								{actions}
							</div>
						)}

						{subtitle && <p className='page-shell__subtitle'>{subtitle}</p>}
					</div>
				)}

				<div className='page-shell__body'>{children}</div>
			</div>
		</div>
	)
}
