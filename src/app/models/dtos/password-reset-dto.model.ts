export interface ResetPasswordDto {
  id: string;
  token: string;
  newPassword: string;
}