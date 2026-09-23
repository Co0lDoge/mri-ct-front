import { AuthState } from '../slices/authSlice';

export const prepareHeaders = (
  headers: Headers,
  api: { getState: () => unknown; endpoint: string; type: string }
) => {
  const state = api.getState() as { auth: AuthState };
  const token = state?.auth?.accessToken;

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    headers.delete('Authorization');
  }

  return headers;
};

