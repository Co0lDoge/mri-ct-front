'use client'

import './Header.scss'

import * as React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button, Drawer } from 'antd'
import { MenuOutlined } from '@ant-design/icons'

import { useAppDispatch, useAppSelector, setToken } from '@medml/store'
import { HeaderIcon } from '@medml/ui'

export interface HeaderNavItem {
	label: string
	to: string
	matchPaths?: string[]
	/** Счётчик справа от подписи (непрочитанное и т.п.). */
	badge?: number
}

export interface HeaderSpaProps {
	/** Очистка токенов вне Redux (например localStorage refresh/access). */
	onLogoutClearStorage?: () => void
	navItems?: HeaderNavItem[]
	userInitials?: string
}

const DEFAULT_NAV_ITEMS: HeaderNavItem[] = [
	{ label: 'Пациенты', to: '/patients', matchPaths: ['/patient_profile'] },
	{ label: 'Добавить снимок', to: '/upload_photo' },
	{ label: 'Помощь', to: '/faq' },
]

export default function HeaderSpa({
	onLogoutClearStorage,
	navItems = DEFAULT_NAV_ITEMS,
	userInitials,
}: HeaderSpaProps) {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const { pathname } = useLocation()
	const accessToken = useAppSelector(s => s.auth.accessToken)

	const [menuOpen, setMenuOpen] = React.useState(false)

	const isAuthenticated = Boolean(accessToken)
	const showLoginButton = !isAuthenticated && pathname !== '/auth/login'
	const showRegisterButton = !isAuthenticated && pathname === '/auth/login'

	// Панель закрывается при переходе, иначе остаётся открытой поверх страницы.
	React.useEffect(() => {
		setMenuOpen(false)
	}, [pathname])

	const handleLogout = () => {
		dispatch(setToken(undefined))
		onLogoutClearStorage?.()
		navigate('/auth/login', { replace: true })
	}

	const isItemActive = (item: HeaderNavItem) => pathname === item.to || (item.matchPaths?.includes(pathname) ?? false)

	const renderNavItem = (item: HeaderNavItem) => (
		<NavLink
			key={item.to}
			to={item.to}
			className={['app-bar__nav-item', isItemActive(item) ? 'app-bar__nav-item--active' : ''].filter(Boolean).join(' ')}
		>
			{item.label}
			{item.badge != null && item.badge > 0 && <span className='app-bar__badge'>{item.badge}</span>}
		</NavLink>
	)

	return (
		<header className='app-bar'>
			<NavLink to='/' className='app-bar__logo' aria-label='На главную'>
				<HeaderIcon />
			</NavLink>

			{isAuthenticated && <nav className='app-bar__nav'>{navItems.map(renderNavItem)}</nav>}

			<div className='app-bar__actions'>
				{isAuthenticated && (
					<>
						{userInitials && (
							<span className='app-bar__avatar' aria-hidden='true'>
								{userInitials}
							</span>
						)}
						<Button onClick={handleLogout}>Выйти</Button>

						{/* На узких экранах навигация уезжает сюда (см. Header.scss). */}
						<Button
							className='app-bar__burger'
							icon={<MenuOutlined />}
							aria-label='Меню'
							onClick={() => setMenuOpen(true)}
						/>
					</>
				)}

				{showLoginButton && (
					<NavLink to='/auth/login'>
						<Button>Вход</Button>
					</NavLink>
				)}

				{showRegisterButton && (
					<NavLink to='/auth/register'>
						<Button>Регистрация</Button>
					</NavLink>
				)}
			</div>

			<Drawer
				className='app-bar-drawer'
				title='Меню'
				placement='right'
				width={280}
				open={menuOpen}
				onClose={() => setMenuOpen(false)}
			>
				<nav className='app-bar-drawer__nav'>{navItems.map(renderNavItem)}</nav>
			</Drawer>
		</header>
	)
}
