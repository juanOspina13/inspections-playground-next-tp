import { api } from './api';
import { LoginRequest, AccessTokenResponse, UserProfile } from '@/types/auth';

export const authenticationServices = {
  // Login
  loginRequest: async (credentials: LoginRequest) => {
    const { data } = await api.post<AccessTokenResponse>('/login', credentials);
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    return data;
  },

  // Get user profile
  getUserProfile: async () => {
    const { data } = await api.get<UserProfile>('/user/profile');
    return data;
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const { data } = await api.post<AccessTokenResponse>('/token/refresh', {
      refresh_token: refreshToken,
    });
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    return data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
