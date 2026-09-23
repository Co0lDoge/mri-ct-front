/**
 * Обходной entry для Next.js / next-auth: SessionProvider, синк сессии.
 * Vite-приложения импортируют только `@medml/ui`, без этого файла — иначе в бандл попадёт `next-auth/react`.
 */
export { RootProvider, type RootProviderProps } from "./providers/RootProvider";
export {
  RootProviderRedux,
  type RootProviderReduxProps,
} from "./providers/RootProviderRedux/RootProviderRedux";
export { default as SyncAuthWrapper } from "./wrappers/SyncAuthWrapper/SyncAuthWrapper";
