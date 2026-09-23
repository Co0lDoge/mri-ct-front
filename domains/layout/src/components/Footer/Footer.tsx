'use client'

import './Footer.scss'

const Footer = () => {
	const currentYear = new Date().getFullYear()

	return (
		<footer className='footer'>
			<span className='text-secondary-footer'>© {currentYear} Второе мнение. Медицинская AI-платформа</span>
		</footer>
	)
}

export default Footer
