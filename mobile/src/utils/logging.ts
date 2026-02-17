/**
 * Safe logger that never logs tokens or sensitive data.
 */
const PASSWORD_PATTERNS = [
  /token/i,
  /password/i,
  /secret/i,
  /bearer/i,
  /authorization/i,
];

function sanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (PASSWORD_PATTERNS.some((p) => p.test(obj))) return '[REDACTED]';
    return obj;
  }
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (PASSWORD_PATTERNS.some((p) => p.test(k))) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = sanitize(v);
      }
    }
    return out;
  }
  return obj;
}

export const logger = {
  info: (msg: string, data?: unknown) => {
    console.log(`[POS] ${msg}`, data !== undefined ? sanitize(data) : '');
  },
  warn: (msg: string, data?: unknown) => {
    console.warn(`[POS] ${msg}`, data !== undefined ? sanitize(data) : '');
  },
  error: (msg: string, err?: unknown) => {
    console.error(`[POS] ${msg}`, err !== undefined ? sanitize(err) : '');
  },
};
