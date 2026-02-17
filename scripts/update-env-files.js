#!/usr/bin/env node
/**
 * Helper script: same as start-ngrok-and-update.js but does not fetch ngrok.
 * Use when you already have the base URL and want to set it manually.
 *
 * Usage: BASE_URL=https://your-ngrok.ngrok-free.app node scripts/update-env-files.js
 */
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.BASE_URL || '';
const ROOT = path.resolve(__dirname, '..');

if (!baseUrl || !baseUrl.startsWith('https://')) {
  console.error('Set BASE_URL env var (HTTPS). Example:');
  console.error('  BASE_URL=https://abc123.ngrok-free.app node scripts/update-env-files.js');
  process.exit(1);
}

const clean = baseUrl.replace(/\/$/, '');

// Update server/.env
const envPath = path.join(ROOT, 'server', '.env');
let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
if (/BASE_URL=/.test(content)) {
  content = content.replace(/BASE_URL=.*/m, `BASE_URL=${clean}`);
} else {
  content = content.trimEnd() + (content ? '\n' : '') + `BASE_URL=${clean}\n`;
}
fs.writeFileSync(envPath, content, 'utf8');
console.log('Updated server/.env');

// Update mobile/src/config.ts
const configPath = path.join(ROOT, 'mobile', 'src', 'config.ts');
if (fs.existsSync(configPath)) {
  let cfg = fs.readFileSync(configPath, 'utf8');
  cfg = cfg.replace(/(export\s+const\s+BASE_URL\s*=\s*)['"].*?['"]/, `$1'${clean}'`);
  fs.writeFileSync(configPath, cfg, 'utf8');
  console.log('Updated mobile/src/config.ts');
} else {
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(configPath, `export const BASE_URL = '${clean}';\n`, 'utf8');
  console.log('Created mobile/src/config.ts');
}

console.log('Signicat redirect URI:', clean + '/auth/callback');
