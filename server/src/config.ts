/**
 * Central configuration loaded from environment variables.
 * We validate required vars and print friendly errors so a fresher can fix .env quickly.
 */
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from server directory (works when running from server/ or from repo root)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const envSchema = z.object({
  // Server listen port. Change via PORT in .env (e.g. PORT=3000).
  PORT: z.string().default('4000').transform(Number),
  // BASE_URL: public HTTPS URL (e.g. ngrok). No trailing slash. Can be empty until script runs.
  BASE_URL: z
    .string()
    .optional()
    .transform((u) => (u && u.trim() ? u.replace(/\/$/, '') : '')),
  SIGNICAT_ISSUER: z.string().url(),
  SIGNICAT_CLIENT_ID: z.string().min(1, 'SIGNICAT_CLIENT_ID is required'),
  SIGNICAT_CLIENT_SECRET: z.string().min(1, 'SIGNICAT_CLIENT_SECRET is required'),
  ANDROID_PACKAGE_NAME: z.string().default('com.smartsense.spidpoc'),
  // SHA256 fingerprint without colons (e.g. AABBCCDD...)
  ANDROID_SHA256_FINGERPRINT: z.string().min(1, 'ANDROID_SHA256_FINGERPRINT is required (from keytool)'),
  APP_JWT_SECRET: z.string().min(16, 'APP_JWT_SECRET must be at least 16 characters'),
});

// Parse and validate; on failure we throw with a clear message
function loadConfig() {
  const raw = {
    PORT: process.env.PORT,
    BASE_URL: process.env.BASE_URL,
    SIGNICAT_ISSUER: process.env.SIGNICAT_ISSUER,
    SIGNICAT_CLIENT_ID: process.env.SIGNICAT_CLIENT_ID,
    SIGNICAT_CLIENT_SECRET: process.env.SIGNICAT_CLIENT_SECRET,
    ANDROID_PACKAGE_NAME: process.env.ANDROID_PACKAGE_NAME,
    ANDROID_SHA256_FINGERPRINT: process.env.ANDROID_SHA256_FINGERPRINT,
    APP_JWT_SECRET: process.env.APP_JWT_SECRET,
  };

  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${msg}\n\nCheck server/.env (see .env.example).`);
  }
  return result.data;
}

export const config = loadConfig();

// Convenience: redirect URI must match exactly what we register in Signicat
export const REDIRECT_URI_PATH = '/auth/callback';
export const REDIRECT_URI = config.BASE_URL ? `${config.BASE_URL}${REDIRECT_URI_PATH}` : '';
