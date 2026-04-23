export interface LoginRequest {
  username: string;
  password: string;
}

export interface AccessTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  roles: string[];
}
