import { httpClient } from '@/infrastructure/http/httpClient';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types';

export const authApi = {
  login(payload: LoginPayload): Promise<AuthResponse> {
    return httpClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  register(payload: RegisterPayload): Promise<AuthResponse> {
    return httpClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  me(): Promise<{ user: User }> {
    return httpClient<{ user: User }>('/auth/me');
  },
};
