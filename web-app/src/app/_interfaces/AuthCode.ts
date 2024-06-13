export interface AuthCode {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  issuedAt: Date;
}
