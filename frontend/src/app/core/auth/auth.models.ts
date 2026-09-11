export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAtUtc: string;
  email: string;
}

export interface AuthSession {
  accessToken: string;
  expiresAtUtc: string;
  email: string;
}
