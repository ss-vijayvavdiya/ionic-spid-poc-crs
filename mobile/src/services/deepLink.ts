/**
 * Deep link handling for SPID callback (smartsense://auth/callback).
 * Captures URLs from handleOpenURL (called before React loads) and deviceready/resume.
 */
export type DeepLinkHandler = (url: string) => void;

const globalAny = window as unknown as {
  __spidCallbackUrl?: string | null;
  cordova?: unknown;
  handleOpenURL?: (url: string) => void;
};

function isCordova(): boolean {
  return !!globalAny.cordova;
}

/**
 * Parse code and state from auth callback URL (HTTPS or smartsense://).
 */
export function parseAuthCallback(url: string): { code: string; state: string } | null {
  try {
    const parsed = new URL(url);
    const code = parsed.searchParams.get('code');
    const state = parsed.searchParams.get('state');
    if (!code || !state) return null;
    return { code, state };
  } catch {
    const parts = url.split('?');
    if (parts.length < 2) return null;
    const params = new URLSearchParams(parts[1]);
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) return null;
    return { code, state };
  }
}

/**
 * Setup deep link listeners. Call from AuthContext on mount.
 * Processes URLs from handleOpenURL (index.html), deviceready, and resume.
 */
export function setupDeepLinks(onUrl: DeepLinkHandler): void {
  const emit = (url: string) => {
    if (!url) return;
    onUrl(url);
  };

  const processStored = () => {
    if (globalAny.__spidCallbackUrl) {
      const url = globalAny.__spidCallbackUrl;
      globalAny.__spidCallbackUrl = null;
      emit(url);
    }
  };

  // Override handleOpenURL to also emit (index.html sets early version that only stores)
  globalAny.handleOpenURL = (url: string) => {
    globalAny.__spidCallbackUrl = url;
    setTimeout(() => emit(url), 0);
  };

  if (isCordova()) {
    document.addEventListener('deviceready', processStored);
    document.addEventListener('resume', processStored);
    // If deviceready already fired, process immediately
    if (document.readyState === 'complete' || (window as any).cordova?.platformId) {
      processStored();
    }
  } else {
    processStored();
  }
}
