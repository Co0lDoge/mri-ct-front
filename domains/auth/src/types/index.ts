/**
 * Поля соответствуют `MedWorkerRegistrationSerializer` на бэкенде
 * (`medweb/medml/serializers.py`). Все они помечены там `required=True`,
 * поэтому `fathers_name` и `med_organization` больше не опциональны:
 * пустая строка отклоняется валидацией DRF (`allow_blank=False`).
 */
export interface RegisterPayload {
  email: string;
  last_name: string;
  first_name: string;
  fathers_name: string;
  med_organization: string;
  password1: string;
  password2: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthApi {
  login(payload: LoginPayload): Promise<AuthLoginResponse>;
  register(payload: RegisterPayload): Promise<void>;
}

export interface RefreshTokenPayload {
  token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface NextAuthToken {
  name: string;
  email: string;
  sub: string;
  accessToken: string;
  accessTokenExpiry: string;
  refreshToken: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface NextAuthUser {
  name: string;
  email: string;
  image: undefined;
  data: {
    accessToken: string;
    accessTokenExpiry: string;
    refreshToken: string;
  };
}

