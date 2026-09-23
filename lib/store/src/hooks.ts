// Re-export типизированных хуков для удобства
// Эти хуки можно использовать в компонентах вместо стандартных react-redux

export { useAppDispatch, useAppSelector } from './store';
export type { RootState, AppDispatch } from './store';
