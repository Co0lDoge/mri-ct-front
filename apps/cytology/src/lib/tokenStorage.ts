const ACCESS_KEY = "cytology_access_token";
const REFRESH_KEY = "cytology_refresh_token";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(ACCESS_KEY, token);
  } catch {
    // ignore
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string): void {
  try {
    localStorage.setItem(REFRESH_KEY, token);
  } catch {
    // ignore
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(ACCESS_KEY);
  } catch {
    // ignore
  }
}

export function clearRefreshToken(): void {
  try {
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    // ignore
  }
}

export function clearAuthTokens(): void {
  clearAuthToken();
  clearRefreshToken();
}
