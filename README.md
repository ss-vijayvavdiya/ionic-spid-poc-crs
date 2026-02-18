# SPID SSO POC — Ionic React + Node.js + Signicat Sandbox

A **production-style** proof-of-concept for **SPID (Sistema Pubblico di Identità Digitale)** authentication in a mobile app, combined with a **POS Receipt** workflow (checkout, products, customers, receipts, reports).

> **Stakeholder documentation:** For architecture, approach, implementation rationale, and Mermaid diagrams (flows, sequence, components), see **[DOCUMENTATION.md](DOCUMENTATION.md)**.

- **Aggregator**: Signicat Sandbox (real SPID test environment)
- **Mobile**: Ionic React (TypeScript) + Cordova (Android)
- **Backend**: Node.js (TypeScript) + Express
- **Auth flow**: OIDC Authorization Code with backend token exchange; backend mints its own JWT for app API calls
- **POS features**: Merchant selection, checkout, products, customers, receipts, reports; offline support; i18n (EN, IT, DE)

The app opens the **system browser** for login; after Signicat redirects to our callback URL, the app can open via **HTTPS App Links** (when host is stable) or via a **custom scheme fallback** (`smartsense://auth/callback`) so it works with ngrok’s changing free URL.

---

## Table of contents

1. [Tools to install](#1-tools-to-install)
2. [Android emulator setup](#2-android-emulator-setup)
3. [Debug keystore fingerprint (for assetlinks.json)](#3-debug-keystore-fingerprint-for-assetlinksjson)
4. [Signicat sandbox setup](#4-signicat-sandbox-setup)
5. [Running the POC](#5-running-the-poc)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Tools to install

Install the following before running the POC.

| Tool | Purpose | How to install / verify |
|------|--------|--------------------------|
| **Git** | Clone and version control | `git --version` |
| **Node.js + npm** | Backend and frontend build | `node -v` and `npm -v` (you said already installed) |
| **Java JDK 17** | Required for Android SDK / Gradle | Install from [Adoptium](https://adoptium.net/) or your OS package manager. Set `JAVA_HOME` to the JDK root. Verify: `java -version` |
| **Android Studio** | Android SDK, emulator, and build tools | Download from [developer.android.com](https://developer.android.com/studio). Install and run once to complete setup. |
| **Android SDK + Platform Tools** | Build and run Android apps; `adb` for devices/emulators | Via Android Studio: **Settings → Appearance & Behavior → System Settings → Android SDK**. Install **Android SDK Platform** (e.g. API 34) and **Android SDK Platform-Tools**. |
| **ANDROID_HOME** | So Cordova/Gradle can find the SDK | Set to SDK path, e.g. `export ANDROID_HOME=$HOME/Library/Android/sdk` (macOS) or `%LOCALAPPDATA%\Android\Sdk` (Windows). Add to your shell profile. |
| **PATH** | Run `adb` and other tools | Add `$ANDROID_HOME/platform-tools` (and optionally `$ANDROID_HOME/tools`) to `PATH`. |
| **ngrok (free)** | Expose localhost as HTTPS for Signicat redirect and App Links | Install: `brew install ngrok` (macOS) or download from [ngrok.com](https://ngrok.com). Sign up and run `ngrok config add-authtoken <your-token>`. |
| **Ionic CLI** | Create and run Ionic apps | `npm install -g @ionic/cli` |
| **Cordova** | Add Android platform and plugins | Use `npx cordova` (no global install required) |

Quick checks:

```bash
node -v    # e.g. v18+
npm -v
java -version   # 17+
echo $ANDROID_HOME
adb version
ngrok version
ionic -v
npx cordova -v
```

---

## 2. Android emulator setup

1. Open **Android Studio**.
2. **Tools → Device Manager** (or **AVD Manager**).
3. **Create Device**: pick a phone (e.g. Pixel 6), then choose a system image (e.g. API 34), download if needed, and finish.
4. Start the emulator from the Device Manager (play button).
5. In a terminal, run:
   ```bash
   adb devices
   ```
   You should see your emulator listed. This is required so you can install and run the Ionic/Cordova app.

---

## 3. Debug keystore fingerprint (for assetlinks.json)

Android App Links require a **Digital Asset Links** file (e.g. `assetlinks.json`) that ties your domain to your app’s signing certificate. For local/dev builds we use the **debug keystore**.

1. Run (on macOS/Linux; Windows use `%USERPROFILE%\.android\debug.keystore`):
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
2. In the output, find **SHA256** under the certificate fingerprint. It looks like:
   `AA:BB:CC:DD:...` (with colons).
3. For our backend config we need the **same fingerprint without colons** (e.g. `AABBCCDD...`). You can copy and then remove colons, or use:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep -A1 "SHA256" | tail -1 | sed 's/.*SHA256: //;s/://g'
   ```
4. Put this value in `server/.env` as `ANDROID_SHA256_FINGERPRINT=...`. The backend serves `/.well-known/assetlinks.json` using this value so Android can verify App Links.

---

## 4. Signicat sandbox setup

Signicat provides the SPID sandbox. You need a tenant and app configured there.

1. **Sign up / log in** at [Signicat](https://signicat.com) and open the **dashboard** (sandbox if you have a sandbox account).
2. **Create or select an application** (OIDC/OAuth2 client).
3. **Obtain these values** (exact names may vary in the dashboard):
   - **SIGNICAT_ISSUER**  
     Base URL / issuer of your tenant, e.g. `https://api.sandbox.signicat.com/oidc`. This is used for OIDC discovery (e.g. `/.well-known/openid-configuration`).
   - **SIGNICAT_CLIENT_ID**  
     Client ID of your app.
   - **SIGNICAT_CLIENT_SECRET**  
     Client secret of your app.
4. **Redirect URI**  
   Signicat requires an exact redirect URI. After you start ngrok, your redirect URI will be:
   ```text
   https://<your-ngrok-domain>/auth/callback
   ```
   Example: `https://abc123.ngrok-free.app/auth/callback`.  
   Add this **exact** URL in the Signicat app’s redirect URI list. With ngrok free, the domain changes each time you restart ngrok, so you must **update this redirect URI in Signicat** whenever the ngrok URL changes.
5. **Enable SPID** in the sandbox and ensure the **SPID test** identity provider is enabled so you can log in with test credentials.

Put the values in `server/.env` (see [Running the POC](#5-running-the-poc)).

---

## 5. Running the POC

### 5.1 One-time setup

1. **Clone / open** the repo and install dependencies:
   ```bash
   cd ionic-spid-poc-crs
   npm install
   cd server && npm install && cd ..
   cd mobile && npm install && cd ..
   ```
2. **Backend env**  
   Copy `server/.env.example` to `server/.env` and fill in:
   - `PORT=4000` (change to any port; use the same port when running ngrok)
   - `BASE_URL` — leave empty for now; the ngrok script will set it.
   - `SIGNICAT_ISSUER`, `SIGNICAT_CLIENT_ID`, `SIGNICAT_CLIENT_SECRET` (from Signicat).
   - `ANDROID_PACKAGE_NAME=com.smartsense.spidpoc`
   - `ANDROID_SHA256_FINGERPRINT` — SHA256 of debug keystore **without colons** (see section 3).
   - `APP_JWT_SECRET` — a long random string for signing our own JWTs (e.g. `openssl rand -hex 32`).
3. **Mobile**  
   Add Android and install plugins (from repo root or `mobile/`):
   ```bash
   cd mobile
   npx ionic build
   npx cap add android   # or: npx cordova platform add android
   npx cordova platform add android
   npx cordova plugin add cordova-plugin-inappbrowser
   npx cordova plugin add cordova-plugin-customurlscheme --variable URL_SCHEME=smartsense
   npm install
   cd ..
   ```
   (If you use Capacitor instead of Cordova, adjust: add Android, add InAppBrowser and a custom URL scheme / App Links plugin as per Capacitor docs.)

### 5.2 Start server (and optionally ngrok)

**Option A — Local dev (no SPID, no ngrok)**

1. **Terminal 1 — Backend**
   ```bash
   cd server
   npm run dev
   ```
   Ensure `SEED_SAMPLE_DATA=true` in `server/.env` for sample merchants, products, customers.

2. **Terminal 2 — Mobile**
   ```bash
   cd mobile
   npm run dev
   ```
   Open `http://localhost:5173` in a browser. Set `mobile/.env.local` with `VITE_BASE_URL=http://localhost:4000`. Use **"Dev login (skip SPID)"** to sign in and test the POS flow.

**Option B — Full SPID flow (with ngrok)**

1. **Terminal 1 — Backend**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:<PORT>` (PORT from server/.env, default 4000).

2. **Terminal 2 — ngrok**
   ```bash
   ngrok http <PORT>
   ```
   Leave it running. Note the HTTPS URL (e.g. `https://abc123.ngrok-free.app`).

3. **Terminal 3 — Update config with ngrok URL**
   ```bash
   node scripts/start-ngrok-and-update.js
   ```
   This script reads the ngrok API (`http://127.0.0.1:4040/api/tunnels`), gets the public HTTPS URL, and writes it to:
   - `server/.env` → `BASE_URL=...`
   - `mobile/src/config.ts` → `BASE_URL`
   It also prints:
   - The exact URL to set as **Redirect URI** in Signicat: `https://<ngrok-domain>/auth/callback`
   - A link to test: `https://<ngrok-domain>/health`

4. **Update Signicat**  
   In the Signicat dashboard, set the redirect URI to the printed value (`https://<ngrok-domain>/auth/callback`). Do this again whenever you restart ngrok and the domain changes.

### 5.3 Build and run the mobile app

From the repo root:

```bash
cd mobile
npm run build
npx cordova prepare android
npx cordova run android
```

Or with Ionic CLI:

```bash
cd mobile
ionic build
ionic cordova run android
```

If you use **Cordova** only:

```bash
npx cordova run android
```

The app will install on the emulator or connected device. Tap **Login with SPID**; the system browser opens the backend’s `/auth/spid/start`, which redirects to Signicat. After login, Signicat redirects to `https://<ngrok-domain>/auth/callback`. The server returns `302` to `smartsense://auth/callback?code=...&state=...`, which opens the app automatically. If ngrok shows a "Visit Site" interstitial, tap it once. The app then exchanges `code`/`state` for your backend JWT and can call `/api/me`.

---

## 6. Troubleshooting

### App Links do not open the app

- **HTTPS App Links** require the **exact host** in the Android intent-filter and in `assetlinks.json`. With ngrok free, the host changes; after running `scripts/start-ngrok-and-update.js` you may need to run `npx cordova prepare android` (or rebuild) so the manifest host matches. Even then, Android caches App Links verification; use the **“Continue in app”** button (custom scheme `smartsense://`) as the reliable fallback.
- **Custom scheme** (`smartsense://auth/callback`) does not depend on the host and works as long as the app is installed and the plugin is configured.
- Confirm in `config.xml` that the custom URL scheme is `smartsense` and that the intent-filter for `smartsense` is present.

### assetlinks.json not accessible

- The backend serves it at `https://<ngrok-domain>/.well-known/assetlinks.json`. Open that URL in a browser; you should see JSON with `package_name` and `sha256_cert_fingerprints`.
- Ensure `ANDROID_SHA256_FINGERPRINT` in `server/.env` is the **SHA256 of the same keystore you use to build the app** (debug keystore for debug builds), **without colons**.
- Android only uses assetlinks for **https** App Links; custom scheme does not use it.

### Signature mismatch / wrong SHA256

- Ensure you are using the **debug** keystore for debug builds: `~/.android/debug.keystore`, alias `androiddebugkey`, passwords `android`.
- Re-run `keytool -list -v -keystore ~/.android/debug.keystore ...` and copy the SHA256 (without colons) into `ANDROID_SHA256_FINGERPRINT`.
- Rebuild the app and restart the server so the new fingerprint is served.

### App freezes on ngrok-free.app after SPID login (CSP error)

- **Symptom:** App freezes on the ngrok page after successful SPID login, with a CSP error like `Refused to load the image 'https://ngrok.com/assets/favicon.ico' because it violates Content Security Policy`.
- **Cause:** InAppBrowser (`_blank`) loads the ngrok interstitial page, which has a restrictive CSP that blocks ngrok assets. The page fails to render and the app appears frozen.
- **Fix:** The app now uses the **system browser** (`_system`) for login instead of InAppBrowser. The system browser handles the redirect; when the server returns `302` to `smartsense://auth/callback`, the app opens automatically via `handleOpenURL`. Rebuild the app if you had an older version.

### 404 on auth/callback after SPID login

- **ngrok free URLs change** every time you restart ngrok. If you see `GET https://...ngrok-free.app/auth/callback 404`, the tunnel for that URL is likely inactive.
- **Fix:** In Terminal 1 start ngrok: `ngrok http 4000`. In Terminal 2 run `node scripts/start-ngrok-and-update.js`. Update the Signicat redirect URI to the printed URL (`https://<new-domain>/auth/callback`). Restart the server. Try login again.
- **Verify:** Open `https://<ngrok-domain>/health` in a browser — you should see `{"ok":true,...}`. If you get 404, ngrok is not forwarding to your server.

### Redirect URI mismatch on Signicat

- Signicat compares the redirect URI **exactly**. It must be `https://<your-ngrok-domain>/auth/callback` with no trailing slash (unless you registered one).
- After every ngrok restart, run `node scripts/start-ngrok-and-update.js` and then **update the redirect URI in the Signicat dashboard** to the new `https://<new-domain>/auth/callback`.

### Android build: Gradle not found

- If `npx cordova build android` fails with “Could not find an installed version of Gradle”, ensure Android Studio is installed and that Gradle is on your PATH, or open the project in Android Studio once so it installs the Gradle wrapper. Alternatively, install Gradle (e.g. `brew install gradle` on macOS) and ensure it’s in PATH.

### How to view logcat (Android logs)

- With device/emulator connected:
  ```bash
  adb logcat
  ```
- Filter by your app (package `com.smartsense.spidpoc`):
  ```bash
  adb logcat | grep -i spidpoc
  ```
- Or filter by Cordova/WebView:
  ```bash
  adb logcat *:S Cordova:V chromium:V
  ```

### Server or exchange errors

- Check server logs for correlation IDs printed during `/auth/spid/start` and `/auth/exchange`. Use them to trace the same login attempt.
- Ensure `BASE_URL` in `server/.env` matches the ngrok HTTPS URL (no trailing slash). Restart the server after changing `.env`.
- Ensure the app uses the same `BASE_URL` in `mobile/src/config.ts` (run the ngrok update script so both stay in sync).

### Moving to production

- Use a **fixed domain** and set `BASE_URL` to that (e.g. `https://auth.yourcompany.com`).
- In Signicat, register the production redirect URI.
- Use a **reserved ngrok domain** or your own HTTPS host so the callback URL is stable; then HTTPS App Links will work without relying on the custom scheme.

---

## Repository layout (file tree)

```text
ionic-spid-poc-crs/
├── README.md
├── DOCUMENTATION.md          # Stakeholder docs, architecture, flows
├── package.json              # Root scripts: install:all, server, mobile:android, ngrok:update
├── .gitignore
├── server/
│   ├── src/
│   │   ├── config.ts         # Env validation (zod)
│   │   ├── index.ts          # Express app, mounts routes
│   │   ├── seed.ts           # Sample merchants, products, customers, receipts
│   │   ├── store.ts          # In-memory state/nonce store
│   │   ├── store/            # products, receipts, customers, merchants
│   │   └── routes/
│   │       ├── auth.ts       # /auth/spid/start, /auth/callback, /auth/exchange, /auth/dev-token
│   │       ├── api.ts        # /api/me (protected)
│   │       ├── products.ts   # /api/products
│   │       ├── receipts.ts   # /api/receipts
│   │       ├── customers.ts  # /api/customers
│   │       └── wellKnown.ts  # /.well-known/assetlinks.json
│   ├── .env.example
│   ├── .env                  # Created by you; BASE_URL updated by script
│   ├── package.json
│   └── tsconfig.json
├── mobile/
│   ├── src/
│   │   ├── config.ts         # BASE_URL (VITE_BASE_URL from .env.local)
│   │   ├── App.tsx           # handleOpenURL, routes, exchangeAndNavigate
│   │   ├── main.tsx
│   │   ├── theme/            # variables.css, design-tokens.css
│   │   ├── contexts/         # Auth, Merchant, Connectivity, Sync, User
│   │   ├── store/            # productsRepo, receiptsRepo (Dexie/IndexedDB)
│   │   ├── api/              # products, receipts API client
│   │   ├── components/       # HeaderBar, Menu, EmptyState, ProductThumbnail, etc.
│   │   ├── i18n/             # EN, IT, DE translations
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       ├── MerchantSelectPage.tsx
│   │       ├── CheckoutPage.tsx
│   │       ├── ProductsPage.tsx, ProductFormPage.tsx
│   │       ├── CustomersPage.tsx, CustomerFormPage.tsx
│   │       ├── ReceiptsPage.tsx, ReceiptDetailPage.tsx
│   │       ├── ReportsPage.tsx
│   │       └── ...
│   ├── config.xml            # Cordova: smartsense scheme, HTTPS intent-filter
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── ionic.config.json
└── scripts/
    ├── start-ngrok-and-update.js   # Fetches ngrok URL, updates server/.env, mobile/src/config.ts
    └── update-env-files.js         # Manual: BASE_URL=... node scripts/update-env-files.js
```

---

## Flow summary

1. App opens system browser at `https://<ngrok>/auth/spid/start`.
2. Backend creates `state`/`nonce`, stores them, redirects to Signicat authorize URL.
3. User logs in with SPID (Signicat sandbox).
4. Signicat redirects to `https://<ngrok>/auth/callback?code=...&state=...`.
5. Callback page is shown; user can tap “Continue in app” (`smartsense://auth/callback?code=...&state=...`) so the app opens even if HTTPS App Links fail (e.g. ngrok host change).
6. App sends `code` and `state` to `POST /auth/exchange`; backend exchanges code with Signicat, validates ID token, and issues its **own** JWT.
7. App stores the JWT and calls `GET /api/me` with `Authorization: Bearer <jwt>` to show the user profile.

This keeps the app independent of Signicat’s tokens and aligns with production: a stable domain only requires updating `BASE_URL` and Signicat redirect config.

---

## Exact commands to run

```bash
# 1) One-time: install dependencies
npm run install:all

# 2) One-time: copy server env and fill Signicat + ANDROID_SHA256_FINGERPRINT + APP_JWT_SECRET
cp server/.env.example server/.env
# Edit server/.env

# 3) One-time: add Cordova and plugins (from repo root; use npx so Cordova need not be global)
cd mobile
npm run build
npx cordova platform add android
npx cordova plugin add cordova-plugin-inappbrowser
npx cordova plugin add cordova-plugin-customurlscheme --variable URL_SCHEME=smartsense
cd ..

# 4) Start server (Terminal 1)
npm run server

# 5) Start ngrok (Terminal 2)
ngrok http 4000

# 6) Update BASE_URL in server + mobile (Terminal 3)
npm run ngrok:update
# Then update Signicat redirect URI to the printed URL + /auth/callback

# 7) Build and run Android app
cd mobile && npm run build && npx cordova prepare android && npx cordova run android
```

---

## Final checklist (must work)

- [ ] Server runs on `localhost:<PORT>` (PORT from .env); ngrok exposes it with an HTTPS URL.
- [ ] Visiting `<BASE_URL>/auth/spid/start` takes the user to Signicat login.
- [ ] After login, Signicat redirects to `<BASE_URL>/auth/callback` with `code` and `state`.
- [ ] The callback page appears; it tries to open the app via the same URL (App Links) and shows a “Continue in app” fallback button using `smartsense://auth/callback?code=...&state=...`.
- [ ] The app receives the callback (via custom scheme when the user taps the fallback).
- [ ] The app calls `POST /auth/exchange` with `{ code, state }` and receives our JWT.
- [ ] The app calls `GET /api/me` with `Authorization: Bearer <jwt>` and displays user info.
