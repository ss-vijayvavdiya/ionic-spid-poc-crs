/**
 * Auth routes: start SPID login, handle IdP callback, exchange code for our JWT.
 */
import { Router, Request } from 'express';
import { Issuer, generators, Client } from 'openid-client';
import jwt from 'jsonwebtoken';
import { config, REDIRECT_URI } from '../config';
import { saveSession, getAndConsumeSession } from '../store';
import crypto from 'crypto';

const router = Router();

function buildCallbackHtml(currentUrl: string, appSchemeUrl: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SPID Login Received</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; line-height: 1.5; }
    .btn { display: inline-block; margin-top: 12px; padding: 10px 14px; background: #1976d2; color: #fff; text-decoration: none; border-radius: 6px; }
    .btn.secondary { background: #2e7d32; }
    code { background: #f2f2f2; padding: 2px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <h2>Login received</h2>
  <p>If the app did not open automatically, tap <strong>Continue</strong>.</p>
  <a class="btn" href="${currentUrl}">Continue</a>
  <p style="margin-top: 16px;">If that still does not open the app, use the fallback:</p>
  <a class="btn secondary" href="${appSchemeUrl}">Open in app (fallback)</a>
  <p style="margin-top: 16px; font-size: 13px; color: #666;">Current URL: <code>${currentUrl}</code></p>
  <script>
    try {
      var key = 'spid_poc_open_attempted';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        setTimeout(function () {
          window.location.href = "${appSchemeUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";
        }, 800);
      }
    } catch (e) {}
  </script>
</body>
</html>`;
}

/**
 * POST /auth/dev-token
 * Dev-only: returns a JWT for local testing when SEED_SAMPLE_DATA=true.
 * Use "Dev login" on LoginPage to skip SPID.
 */
router.post('/dev-token', (req, res) => {
  if (process.env.SEED_SAMPLE_DATA !== 'true') {
    return res.status(404).json({ error: 'Not available' });
  }
  const accessToken = jwt.sign(
    { sub: 'dev-user', merchantIds: ['m1', 'm2'], iat: Math.floor(Date.now() / 1000) },
    config.APP_JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({ access_token: accessToken, token_type: 'Bearer' });
});

// Lazy-initialized OIDC client (discovery uses SIGNICAT_ISSUER)
let clientPromise: Promise<Client> | null = null;
async function getClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const issuer = await Issuer.discover(config.SIGNICAT_ISSUER);
      return new issuer.Client({
        client_id: config.SIGNICAT_CLIENT_ID,
        client_secret: config.SIGNICAT_CLIENT_SECRET,
        redirect_uris: [REDIRECT_URI],
        response_types: ['code'],
      });
    })();
  }
  return clientPromise;
}

/**
 * GET /auth/spid/start
 * Initiates the SPID login flow. We create state and nonce for security, then redirect
 * the user's browser to Signicat's authorize endpoint.
 *
 * Why state? Prevents CSRF: we store state in our session and verify it when the IdP
 * redirects back. Only our server knows the state we sent.
 * Why nonce? Prevents replay of ID token: we send nonce to the IdP and verify it
 * is present in the ID token after the exchange.
 */
router.get('/spid/start', async (req, res) => {
  if (!REDIRECT_URI) {
    return res.status(503).json({
      error: 'BASE_URL not set. Run: node scripts/start-ngrok-and-update.js (with ngrok running)',
    });
  }
  const correlationId = crypto.randomUUID();
  console.log(`[auth] /auth/spid/start correlationId=${correlationId}`);

  try {
    const client = await getClient();
    const state = generators.state();
    const nonce = generators.nonce();
    // PKCE: generate a code_verifier and corresponding code_challenge (S256).
    // Signicat now requires PKCE for authorization_code flows.
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    saveSession({
      state,
      nonce,
      codeVerifier,
      correlationId,
      createdAt: Date.now(),
    });

    const authUrl = client.authorizationUrl({
      scope: 'openid profile email',
      state,
      nonce,
      // PKCE parameters
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: REDIRECT_URI,
    });

    console.log(`[auth] redirecting to Signicat correlationId=${correlationId}`);
    res.redirect(authUrl);
  } catch (e) {
    console.error(`[auth] error correlationId=${correlationId}`, e);
    res.status(500).json({ error: 'Failed to start login' });
  }
});

/**
 * GET /auth/callback
 * This is the redirect URI registered in Signicat. After the user logs in at Signicat,
 * Signicat redirects the browser here with ?code=...&state=...
 *
 * We return HTML with buttons and an auto-redirect (after 800ms) to smartsense:// so the
 * app opens. This approach (from ionic-spid-poc-cdx) avoids timing issues where
 * handleOpenURL fires before React is ready — the delay gives the app time to load.
 */
router.get('/callback', (req: Request, res) => {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const baseUrl = config.BASE_URL || '';
  const currentUrl = baseUrl ? `${baseUrl}${req.originalUrl}` : req.originalUrl;
  const appSchemeUrl = `smartsense://auth/callback?${new URLSearchParams({ code, state }).toString()}`;
  const html = buildCallbackHtml(currentUrl, appSchemeUrl);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-store');
  res.send(html);
});

/**
 * POST /auth/exchange
 * Called by the mobile app with the code and state it received (from the callback URL,
 * either via App Links or custom scheme). We validate state, exchange code with Signicat,
 * validate the ID token and nonce, then mint our own JWT and return it.
 */
router.post('/exchange', async (req, res) => {
  if (!REDIRECT_URI) {
    return res.status(503).json({ error: 'BASE_URL not set. Run scripts/start-ngrok-and-update.js' });
  }
  const { code, state } = req.body || {};
  const correlationId = req.headers['x-correlation-id'] as string || 'unknown';
  console.log(`[auth] /auth/exchange correlationId=${correlationId} state=${state ? 'present' : 'missing'}`);

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  const session = getAndConsumeSession(state);
  if (!session) {
    console.log(`[auth] invalid or expired state correlationId=${correlationId}`);
    return res.status(400).json({ error: 'Invalid or expired state' });
  }

  try {
    const client = await getClient();
    // Params from the app's POST body (code and state from the callback URL)
    const params = { code, state, iss: config.SIGNICAT_ISSUER };
    // Include code_verifier in the PKCE checks so the token endpoint accepts the code.
    // iss is required when Signicat's discovery has authorization_response_iss_parameter_supported=true
    const tokenSet = await client.callback(REDIRECT_URI, params, {
      state,
      nonce: session.nonce,
      code_verifier: session.codeVerifier,
    });

    // tokenSet contains access_token, id_token, etc. We use decoded ID token claims for user info.
    const claims = tokenSet.claims();
    if (!claims || !claims.sub) {
      return res.status(500).json({ error: 'No ID token claims in response' });
    }
    // Extract user info (SPID/Signicat may use different claim names; handle missing gracefully)
    const sub = (claims.sub as string) || '';
    const name = (claims.name as string) || (claims.preferred_username as string) || '';
    const givenName = (claims.given_name as string) || '';
    const familyName = (claims.family_name as string) || '';
    const email = (claims.email as string) || '';

    const user = { sub, name, given_name: givenName, family_name: familyName, email };
    // POC: add mock merchantIds. In production, load from user_merchants table.
    const merchantIds = ['m1', 'm2'];

    // Mint our own JWT (15 min expiry). The app will use this for /api/me and other APIs.
    const expiresIn = 900; // seconds
    const accessToken = jwt.sign(
      { ...user, merchantIds, iat: Math.floor(Date.now() / 1000) },
      config.APP_JWT_SECRET,
      { expiresIn }
    );

    console.log(`[auth] exchange success correlationId=${correlationId} sub=${sub}`);
    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const body = (e as { response?: { body?: unknown } })?.response?.body;
    console.error(`[auth] exchange error correlationId=${correlationId}`, msg, body || e);
    res.status(400).json({
      error: 'Token exchange failed',
      message: msg,
      ...(body && typeof body === 'object' && { details: body }),
    });
  }
});

export { router as authRouter };
