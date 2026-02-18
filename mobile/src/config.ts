/**
 * Base URL of the backend. Used for /auth/spid/start, /auth/exchange, /api/*.
 * Set VITE_BASE_URL in .env.local for local dev (e.g. http://localhost:4000).
 * This file is auto-updated by scripts/start-ngrok-and-update.js when using ngrok.
 *
 * On Android emulator, "localhost" refers to the emulator itself. Use 10.0.2.2
 * to reach the host machine's server. We auto-substitute when running on Cordova Android.
 */
const raw = (import.meta.env.VITE_BASE_URL as string) || '';
let base = raw.trim() || (import.meta.env.DEV ? 'http://localhost:4000' : '');

// On Android emulator/device, localhost is the device; 10.0.2.2 reaches the host machine
const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
if (base && base.includes('localhost') && isAndroid) {
  base = base.replace(/localhost/g, '10.0.2.2');
}

export const BASE_URL = base;

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
