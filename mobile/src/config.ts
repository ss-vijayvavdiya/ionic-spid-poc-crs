/**
 * Base URL of the backend. Used for /auth/spid/start, /auth/exchange, /api/*.
 * Set VITE_BASE_URL in .env.local for local dev (e.g. http://localhost:4000).
 * This file is auto-updated by scripts/start-ngrok-and-update.js when using ngrok.
 */
export const BASE_URL =
  (import.meta.env.VITE_BASE_URL as string) ||
  'https://8343-14-195-76-134.ngrok-free.app';
