/**
 * JWT storage. Uses localStorage for POC.
 * In production: prefer Capacitor Secure Storage or similar.
 */
const TOKEN_KEY = 'spid_poc_access_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);
