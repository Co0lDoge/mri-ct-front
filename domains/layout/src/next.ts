/**
 * Обходной entry для Next.js: компоненты каркаса, завязанные на `next/link`
 * и `next/navigation`. Vite-приложения импортируют только `@medml/layout` —
 * иначе в бандл попадёт `next`.
 */
export { default as HeaderNext, type HeaderNextProps } from './components/Header/HeaderNext'
