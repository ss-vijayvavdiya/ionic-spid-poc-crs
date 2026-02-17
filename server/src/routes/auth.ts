/**
 * Auth routes: start SPID login, handle IdP callback, exchange code for our JWT.
 */
import { Router } from 'express';
import { Issuer, generators, Client } from 'openid-client';
import jwt from 'jsonwebtoken';
import { config, REDIRECT_URI } from '../config';
import { saveSession, getAndConsumeSession } from '../store';
import crypto from 'crypto';

const router = Router();

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
 * We must return HTML that:
 * (a) Lets Android App Links open the app (same URL as the link) when the host matches.
 * (b) Provides a fallback "Continue in app" button using custom scheme (smartsense://)
 *     so that when ngrok host changes and App Links don't match, the user can still
 *     open the app with the same code/state.
 */
router.get('/callback', (req, res) => {
  const fallbackUrl = `smartsense://auth/callback?${new URLSearchParams(req.query as Record<string, string>).toString()}`;

  // Build the current URL with query string for "same URL" link (helps App Links)
  const currentQuery = new URLSearchParams(req.query as Record<string, string>).toString();
  const base = config.BASE_URL || 'https://replace-me.ngrok-free.app';
  const sameUrl = `${base}/auth/callback?${currentQuery}`;

  // No meta refresh or JS redirect to sameUrl — that caused an infinite loop (callback
  // page reloading itself). User must tap a link. Prefer the custom-scheme link so the app opens.
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login received</title>
  <style>
    body { font-family: system-ui; padding: 2rem; max-width: 360px; margin: 0 auto; }
    .btn { display: inline-block; margin-top: 0.5rem; padding: 0.75rem 1.5rem; color: white; text-decoration: none; border-radius: 8px; text-align: center; font-weight: bold; }
    .btn-primary { background: #0066cc; }
    .btn-secondary { background: #555; }
    a:active { opacity: 0.9; }
    p { color: #333; }
  </style>
</head>
<body>
  <p><strong>Login received.</strong></p>
  <p>Tap the button below to return to the app and finish login.</p>
  <p><a href="${fallbackUrl}" class="btn btn-primary">Open app (finish login)</a></p>
  <p style="margin-top:1rem;font-size:0.85em;color:#666">If nothing happens: long-press the button above and choose &quot;Open with&quot; or &quot;Open in app&quot; (SPID POC).</p>
  <p style="margin-top:1.5rem;font-size:0.9em;color:#666">Or try (App Links):</p>
  <p><a href="${sameUrl}" class="btn btn-secondary">Continue (same URL)</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
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
    const params = { code, state };
    // Include code_verifier in the PKCE checks so the token endpoint accepts the code.
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
    console.error(`[auth] exchange error correlationId=${correlationId}`, e);
    res.status(400).json({ error: 'Token exchange failed' });
  }
});

export { router as authRouter };
