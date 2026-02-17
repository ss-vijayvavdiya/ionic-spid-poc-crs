#!/usr/bin/env node
/**
 * Reads the current ngrok public HTTPS URL from the ngrok agent API and updates:
 *   - server/.env (BASE_URL)
 *   - mobile/src/config.ts (BASE_URL export)
 *
 * Prerequisites:
 *   1. ngrok must be running (e.g. "ngrok http 4000" or "ngrok http <PORT>" to match server/.env PORT).
 *   2. If ngrok is not running, this script can optionally print instructions.
 *
 * Usage: node scripts/start-ngrok-and-update.js
 *
 * After running, the user must update the Signicat dashboard redirect URI to:
 *   https://<ngrok-domain>/auth/callback
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const NGROK_API = 'http://127.0.0.1:4040/api/tunnels';
const ROOT = path.resolve(__dirname, '..');

/** Read PORT from server/.env (default 4000) so ngrok command matches server. */
function getServerPort() {
  const envPath = path.join(ROOT, 'server', '.env');
  if (!fs.existsSync(envPath)) return 4000;
  const content = fs.readFileSync(envPath, 'utf8');
  const m = content.match(/PORT\s*=\s*(\d+)/);
  return m ? parseInt(m[1], 10) : 4000;
}

function fetchNgrokTunnels() {
  return new Promise((resolve, reject) => {
    const url = new URL(NGROK_API);
    const client = url.protocol === 'https:' ? https : http;
    const req = client.get(NGROK_API, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse ngrok API response'));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('ngrok API timeout — is ngrok running? Run: ngrok http ' + getServerPort()));
    });
  });
}

/**
 * Find the first public HTTPS URL from ngrok tunnels.
 */
function getHttpsUrl(tunnels) {
  if (!tunnels.tunnels || !Array.isArray(tunnels.tunnels)) return null;
  const t = tunnels.tunnels.find((x) => x.public_url && x.public_url.startsWith('https://'));
  return t ? t.public_url.replace(/\/$/, '') : null;
}

/**
 * Update or create BASE_URL in server/.env
 */
function updateServerEnv(baseUrl) {
  const envPath = path.join(ROOT, 'server', '.env');
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }
  const line = `BASE_URL=${baseUrl}\n`;
  if (/BASE_URL=/.test(content)) {
    content = content.replace(/BASE_URL=.*/m, `BASE_URL=${baseUrl}`);
  } else {
    content = content.trimEnd() + (content ? '\n' : '') + line;
  }
  fs.writeFileSync(envPath, content, 'utf8');
  console.log('[script] Updated server/.env BASE_URL');
}

/**
 * Update mobile/src/config.ts with the new BASE_URL
 */
function updateMobileConfig(baseUrl) {
  const configPath = path.join(ROOT, 'mobile', 'src', 'config.ts');
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      "// Auto-updated by scripts/start-ngrok-and-update.js\n" +
      "export const BASE_URL = '" + baseUrl + "';\n",
      'utf8'
    );
    console.log('[script] Created mobile/src/config.ts');
  } else {
    let content = fs.readFileSync(configPath, 'utf8');
    content = content.replace(
      /(export\s+const\s+BASE_URL\s*=\s*)['"].*?['"]/,
      "$1'" + baseUrl + "'"
    );
    if (!/BASE_URL/.test(content)) {
      content = content.trimEnd() + "\nexport const BASE_URL = '" + baseUrl + "';\n";
    }
    fs.writeFileSync(configPath, content, 'utf8');
    console.log('[script] Updated mobile/src/config.ts');
  }
}

/**
 * Update mobile/config.xml intent-filter android:host for HTTPS App Links
 * so that after cordova prepare, the app can open for https://<ngrok-host>/auth/callback
 */
function updateConfigXmlHost(baseUrl) {
  try {
    const u = new URL(baseUrl);
    const host = u.hostname;
    const configPath = path.join(ROOT, 'mobile', 'config.xml');
    if (!fs.existsSync(configPath)) return;
    let content = fs.readFileSync(configPath, 'utf8');
    content = content.replace(
      /android:host="replace-me\.ngrok-free\.app"/,
      'android:host="' + host + '"'
    );
    fs.writeFileSync(configPath, content, 'utf8');
    console.log('[script] Updated mobile/config.xml HTTPS App Links host to', host);
  } catch (e) {
    console.warn('[script] Could not update config.xml host:', e.message);
  }
}

async function main() {
  console.log('[script] Fetching ngrok tunnels from', NGROK_API);
  let tunnels;
  try {
    tunnels = await fetchNgrokTunnels();
  } catch (e) {
    console.error(e.message);
    console.log('\nStart ngrok first in another terminal: ngrok http ' + getServerPort() + ' (must match server PORT in server/.env)');
    process.exit(1);
  }

  const baseUrl = getHttpsUrl(tunnels);
  if (!baseUrl) {
    console.error('No HTTPS tunnel found in ngrok. Ensure ngrok is exposing an HTTPS URL.');
    process.exit(1);
  }

  console.log('[script] Base URL:', baseUrl);
  updateServerEnv(baseUrl);
  updateMobileConfig(baseUrl);
  updateConfigXmlHost(baseUrl);

  console.log('\n--- Next steps ---');
  console.log('1. Update Signicat redirect URI to:', baseUrl + '/auth/callback');
  console.log('2. Restart the server if it was already running (so it picks up new BASE_URL).');
  console.log('3. Open in browser to test:', baseUrl + '/health');
}

main();
