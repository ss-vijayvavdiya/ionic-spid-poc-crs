/**
 * Base URL of the backend. Used for /auth/spid/start, /auth/exchange, /api/*.
 * Set VITE_BASE_URL in .env.local for local dev (e.g. http://localhost:4000).
 * This file is auto-updated by scripts/start-ngrok-and-update.js when using ngrok.
 */
const raw = (import.meta.env.VITE_BASE_URL as string) || '';
export const BASE_URL = raw.trim() || (import.meta.env.DEV ? 'http://localhost:4000' : '');

/** Validate config at runtime. Returns error message or null if valid. */
export function validateConfig(): string | null {
  if (!BASE_URL) return 'VITE_BASE_URL is not set. Add it to mobile/.env.local (e.g. VITE_BASE_URL=http://localhost:4000)';
  try {
    new URL(BASE_URL);
  } catch {
    return `Invalid VITE_BASE_URL: ${BASE_URL}. Must be a valid URL (e.g. http://localhost:4000)`;
  }
  return null;
}
