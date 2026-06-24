/**
 * Auth API calls, typed against @simprox/api-types.
 * Endpoints: API_CONTRACT §4.2 (player) / §4.3 (admin).
 */
import type { LoginRequest, LoginResponse, LogoutResponse, User } from '@simprox/api-types';
import { apiRequest } from './client';

export function studentLogin(body: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/stratege/api/login', { method: 'POST', body });
}

export function adminLogin(body: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/stratege/api/admin/login', { method: 'POST', body });
}

export function logout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>('/stratege/api/logout');
}

export function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/stratege/api/user');
}
