export interface AuthResponse {
  token?: string;
  userId?: string;
  requires2FA?: boolean;
  message?: string;
  error?: string;
}