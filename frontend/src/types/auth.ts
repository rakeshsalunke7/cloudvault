export interface User {
  id?: number;
  fullName: string;
  email: string;
  profileImage?: string | null;
  googleId?: string | null;
  authProvider?: 'LOCAL' | 'GOOGLE' | string;
  role?: 'USER' | 'ADMIN' | string;
  active?: boolean;
}

export interface AuthResponse {
  token: string;
  message: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
