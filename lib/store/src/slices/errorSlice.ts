import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ErrorState {
  error: {
    [key: string]: string;
  };
}

const initialState: ErrorState = {
  error: {},
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    addError(state, action: PayloadAction<{ key: string; message: string }>) {
      state.error[action.payload.key] = action.payload.message;
    },
    deleteError(state, action: PayloadAction<string>) {
      delete state.error[action.payload];
    },
    clearAllErrors(state) {
      state.error = {};
    },
  },
});

export const { addError, deleteError, clearAllErrors } = errorSlice.actions;
export default errorSlice;

