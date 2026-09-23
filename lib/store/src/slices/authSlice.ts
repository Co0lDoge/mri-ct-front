import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  accessToken: string | undefined;
  refreshToken: string | undefined;
}

const initialState: AuthState = {
  accessToken: undefined,
  refreshToken: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | undefined>) {
      state.accessToken = action.payload;
      if (action.payload === undefined) {
        state.refreshToken = undefined;
      }
    },
    setRefreshToken(state, action: PayloadAction<string | undefined>) {
      state.refreshToken = action.payload;
    },
  },
});

export const { setToken, setRefreshToken } = authSlice.actions;
export default authSlice;

