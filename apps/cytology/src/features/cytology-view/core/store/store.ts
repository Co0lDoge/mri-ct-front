import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import {
  authSlice,
  baseApi,
  errorMiddleware,
  errorSlice,
  loadingMiddleware,
  loadingSlice,
} from "@medml/store";

import "@/lib/cytologyApi";

import cytologySlice from "./slices/cytology.slice";
import refSlice from "./slices/ref.slice";
import segmentSlice from "./slices/segment.slice";

export const createCytologyViewStore = () => {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authSlice.reducer,
      loading: loadingSlice.reducer,
      error: errorSlice.reducer,
      cytology: cytologySlice.reducer,
      ref: refSlice.reducer,
      segment: segmentSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(baseApi.middleware)
        .concat(loadingMiddleware)
        .concat(errorMiddleware),
  });

  setupListeners(store.dispatch);
  return store;
};

export type AppStore = ReturnType<typeof createCytologyViewStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
