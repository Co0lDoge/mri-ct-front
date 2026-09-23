'use client'

import './Header.scss'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from 'antd'

import { HeaderIcon } from '@medml/ui'
import { usePathname } from 'next/navigation'

/** Пункты навигации Next-варианта — те же, что в HeaderSpa по умолчанию. */
const NAV_ITEMS = [
	{ label: 'Пациенты', href: '/patients', matchPaths: ['/patient_profile'] },
	{ label: 'Добавить снимок', href: '/upload_photo', matchPaths: [] },
	{ label: 'Помощь', href: '/faq', matchPaths: [] },
]

const Header = () => {
	const { status } = useSession()
	const pathname = usePathname()

	const isAuthenticated = status === 'authenticated'
	const showLoginButton = !isAuthenticated && status !== 'loading' && pathname !== '/auth/login'
	const showRegisterButton = !isAuthenticated && status !== 'loading' && pathname === '/auth/login'

	return (
		<header className='app-bar'>
			<Link href='/' className='app-bar__logo' aria-label='На главную'>
				<HeaderIcon />
			</Link>

			{isAuthenticated && (
				<nav className='app-bar__nav'>
					{NAV_ITEMS.map(item => {
						const isActive = pathname === item.href || item.matchPaths.includes(pathname ?? '')
						return (
							<Link
								key={item.href}
								href={item.href}
								className={['app-bar__nav-item', isActive ? 'app-bar__nav-item--active' : ''].filter(Boolean).join(' ')}
							>
								{item.label}
							</Link>
						)
					})}
				</nav>
			)}

			<div className='app-bar__actions'>
				{showLoginButton && (
					<Link href='/auth/login'>
						<Button>Вход</Button>
					</Link>
				)}

				{showRegisterButton && (
					<Link href='/auth/register'>
						<Button>Регистрация</Button>
					</Link>
				)}
			</div>
		</header>
	)
}

export default Header
