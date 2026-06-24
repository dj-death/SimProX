/**
 * Auth request/response shapes.
 *
 * Source: api/controllers/user/authentication.ts
 *   studentLogin / adminLogin -> { message, token } (200); { message } (401/403)
 *   logout                    -> { message: 'Logout success' }
 *   getUserInfo               -> the user document
 * The server also sets an httpOnly `x-access-token` cookie on login.
 * See docs/API_CONTRACT.md §2.
 */

import { UserRole } from './common';

/** POST /stratege/api/login  and  POST /stratege/api/admin/login */
export interface LoginRequest {
  username: string;
  password: string;
  /** extends cookie maxAge to 7 days when true */
  rememberme?: boolean;
}

/** 200 response for a successful login. */
export interface LoginResponse {
  /** "Login success." */
  message: string;
  token: string;
}

/** GET /stratege/api/logout -> { message: 'Logout success' } */
export interface LogoutResponse {
  message: string;
}

/**
 * GET /stratege/api/user (and admin/user). The server returns the full user
 * document; these are the fields the client relies on. Extra fields may be
 * present (additional profile data), hence the index signature.
 */
export interface User {
  _id: string;
  username: string;
  email?: string;
  /** numeric role id (see api/models/user/UserRole) */
  role: number;
  roleName?: UserRole | string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  [key: string]: unknown;
}
