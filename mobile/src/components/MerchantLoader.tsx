/**
 * Fetches /api/me when authenticated and populates MerchantContext and UserContext.
 * Uses mock merchants if API doesn't return them yet.
 */
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMerchant } from '../contexts/MerchantContext';
import { useUser } from '../contexts/UserContext';
import { BASE_URL } from '../config';
import type { Merchant } from '../types';

const MOCK_MERCHANTS: Merchant[] = [
  { id: 'm1', name: 'Caffè Roma', vatNumber: 'IT12345678901' },
  { id: 'm2', name: 'Trattoria Bella', vatNumber: 'IT98765432109' },
];

export function MerchantLoader({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const { setMerchants } = useMerchant();
  const { setUser } = useUser();

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    fetch(`${BASE_URL}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(BASE_URL.includes('ngrok') && { 'ngrok-skip-browser-warning': '1' }),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const apiMerchants = data?.merchants as Merchant[] | undefined;
        const merchants = apiMerchants?.length ? apiMerchants : MOCK_MERCHANTS;
        setMerchants(merchants);
        const u = data?.user as { sub?: string; name?: string; email?: string; given_name?: string; family_name?: string } | undefined;
        setUser(u ? { sub: u.sub, name: u.name, email: u.email, given_name: u.given_name, family_name: u.family_name } : null);
      })
      .catch(() => {
        setMerchants(MOCK_MERCHANTS);
        setUser(null);
      });
  }, [token, setMerchants, setUser]);

  return <>{children}</>;
}
