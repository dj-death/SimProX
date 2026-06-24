/**
 * Cross-cutting API types: auth, error envelopes, shared identifiers.
 *
 * Derived from server.ts (error handlers) and
 * api/controllers/user/authentication.ts (token lookup).
 * See docs/API_CONTRACT.md §1–§2.
 */

/** JWT is sent as the `x-access-token` header (also accepted via body/query/cookie). */
export const AUTH_HEADER = 'x-access-token' as const;

/** Roles, from api/models/user/UserRole. */
export type UserRole = 'student' | 'facilitator' | 'distributor' | 'admin';

/**
 * Error responses are currently NOT uniform on the server. These three shapes
 * are what the existing handlers emit (server.ts:198-279). A rewrite should
 * normalize behind `ApiError`; until then a client must tolerate all three.
 */
export interface DataError {
  /** "400 Data Error" */
  title: string;
  message: string;
  /** Domain/validation error code when present. */
  errorCode?: string | number;
}

export interface SystemError {
  /** "500 System Error" */
  title: string;
  message: string;
}

export interface NotFoundError {
  message: string;
}

/** Union of every error body the current backend can return as JSON. */
export type ApiError = DataError | SystemError | NotFoundError;

/**
 * Recommended normalized envelope for the rewrite (step 2 target — not yet
 * emitted by the server). Use this for new endpoints.
 */
export interface ApiEnvelope<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}

/** Most mutating endpoints reply with a bare message. */
export interface MessageResponse {
  message: string;
}

/** A simulation period. 0 is the initial/seed period; rounds run from 1. */
export type Period = number;

/** 1-based company identifier within a seminar. */
export type CompanyId = number;

export type SeminarId = string;
