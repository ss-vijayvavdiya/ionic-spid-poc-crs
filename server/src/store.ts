/**
 * In-memory store for OIDC authorization session data.
 * Keyed by "state" so we can validate the callback and prevent CSRF/replay.
 * In production you would use Redis or a database with TTL.
 */

export interface AuthSession {
  state: string;
  nonce: string;
  // PKCE code verifier associated with this auth request.
  // Signicat requires PKCE, so we must send a code_challenge at authorize
  // time and the matching code_verifier at token exchange time.
  codeVerifier: string;
  correlationId: string;
  createdAt: number;
  used?: boolean;
}

const sessions = new Map<string, AuthSession>();

// Sessions older than this (ms) are considered expired (e.g. 5 minutes).
// This limits the time window in which a stolen callback URL could be used.
const TTL_MS = 5 * 60 * 1000;

function pruneExpired() {
  const now = Date.now();
  for (const [state, s] of sessions.entries()) {
    if (now - s.createdAt > TTL_MS || s.used) sessions.delete(state);
  }
}

export function saveSession(session: AuthSession): void {
  pruneExpired();
  sessions.set(session.state, session);
}

export function getAndConsumeSession(state: string): AuthSession | null {
  const session = sessions.get(state);
  if (!session) return null;
  if (session.used) return null;
  if (Date.now() - session.createdAt > TTL_MS) {
    sessions.delete(state);
    return null;
  }
  // One-time use: mark as used and remove so the same code/state cannot be reused
  session.used = true;
  sessions.delete(state);
  return session;
}

export function getSession(state: string): AuthSession | null {
  const session = sessions.get(state);
  if (!session || session.used) return null;
  if (Date.now() - session.createdAt > TTL_MS) {
    sessions.delete(state);
    return null;
  }
  return session;
}
