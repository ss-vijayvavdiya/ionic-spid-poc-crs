/**
 * SPID POC Backend — Entry point.
 * Starts Express, mounts auth and API routes, serves assetlinks for Android App Links.
 */
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { apiRouter } from './routes/api';
import { productsRouter } from './routes/products';
import { receiptsRouter } from './routes/receipts';
import { wellKnownRouter } from './routes/wellKnown';
import { config } from './config';
import { runSeed } from './seed';

if (process.env.SEED_SAMPLE_DATA === 'true') {
  runSeed();
}

const app = express();

// Allow mobile app (and browser during login) to call our APIs from any origin (POC).
// In production you would restrict to your app's origin/scheme.
app.use(cors({ origin: true, credentials: true }));

// Parse JSON bodies for POST /auth/exchange and other APIs
app.use(express.json());

// Health check — used to verify server and ngrok are working
app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), baseUrl: config.BASE_URL });
});

// Mount route modules
app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/api/products', productsRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/.well-known', wellKnownRouter);

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
  console.log(`[server] BASE_URL (redirect/callback): ${config.BASE_URL}`);
});
