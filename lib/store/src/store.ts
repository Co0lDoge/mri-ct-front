import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { baseApi } from './api/baseApi';
import authSlice from './slices/authSlice';
import loadingSlice from './slices/loadingSlice';
import errorSlice from './slices/errorSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import './api/billingApi';
import errorMiddleware from './middleware/errorMiddleware';
import loadingMiddleware from './middleware/loadingMiddleware';

let storeInstance: ReturnType<typeof makeStore> | undefined;


const makeStore = () => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authSlice.reducer,
      subscription: subscriptionSlice.reducer,
      loading: loadingSlice.reducer,
      error: errorSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      })
        .concat(baseApi.middleware)
        .concat(loadingMiddleware)
        .concat(errorMiddleware),
  });
};

export const createStore = () => {
  if (typeof window === 'undefined') {
    return makeStore();
  }
  if (!storeInstance) {
    storeInstance = makeStore();
  }
  return storeInstance;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

