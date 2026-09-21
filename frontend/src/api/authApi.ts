import api from './axios';

import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '@/types/auth';

export const authApi = {
  login: (
    data: LoginRequest
  ) =>
    api
      .post<AuthResponse>(
        '/api/auth/login',
        data
      )
      .then((r) => r.data),

  register: (
    data: RegisterRequest
  ) =>
    api
      .post<void>(
        '/api/auth/register',
        data
      )
      .then((r) => r.data),

  googleAuthUrl: () =>
    `${
      import.meta.env
        .VITE_API_BASE_URL ||
      'http://localhost:8080'
    }/oauth2/authorization/google`,

  exchangeOAuthCode: (
    code: string
  ) =>
    api
      .post<AuthResponse>(
        '/api/auth/oauth/exchange',
        {
          code,
        }
      )
      .then((r) => r.data),
};