/**
 * Thin fetch wrapper for the SimProX API.
 *
 * Responsibilities:
 *  - attach the JWT as the `x-access-token` header (see API_CONTRACT §2)
 *  - normalize the backend's three inconsistent error bodies into one ApiError
 *  - surface 401 as a typed error the auth layer can react to (the server
 *    currently *redirects* on 401 for HTML, but JSON/XHR requests get the body)
 */
import { AUTH_HEADER, type ApiError } from '@simprox/api-types';

export class ApiRequestError extends Error {
  status: number;
  body: ApiError | null;
  constructor(status: number, body: ApiError | null) {
    super(extractMessage(body) ?? `Request failed (${status})`);
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }
  get isUnauthorized() {
    return this.status === 401 || this.status === 403;
  }
}

function extractMessage(body: ApiError | null): string | undefined {
  if (!body) return undefined;
  if ('message' in body && body.message) return body.message;
  return undefined;
}

// Token storage. The Angular app used localStorage key `<prefix>_logintoken`;
// we keep a single key for the new client.
const TOKEN_KEY = 'simprox_token';

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** query params */
  params?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  if (!params) return path;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) usp.append(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers[AUTH_HEADER] = token;

  const res = await fetch(buildUrl(path, opts.params), {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    // include cookies so the httpOnly x-access-token cookie also flows
    credentials: 'include',
  });

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    throw new ApiRequestError(res.status, data as ApiError | null);
  }
  return data as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
