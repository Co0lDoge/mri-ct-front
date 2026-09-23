import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LoadingState {
  loading: {
    [key: string]: boolean;
  };
}

const initialState: LoadingState = {
  loading: {},
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    addLoading(state, action: PayloadAction<string>) {
      state.loading[action.payload] = true;
    },
    removeLoading(state, action: PayloadAction<string>) {
      delete state.loading[action.payload];
    },
    startLoading(state, action: PayloadAction<string>) {
      state.loading[action.payload] = true;
    },
    endLoading(state, action: PayloadAction<string>) {
      delete state.loading[action.payload];
    },
  },
});

export const { addLoading, removeLoading, startLoading, endLoading } = loadingSlice.actions;
export default loadingSlice;

