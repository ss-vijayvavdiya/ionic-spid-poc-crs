/**
 * Fetches /api/me when authenticated and populates MerchantContext.
 * Uses mock merchants if API doesn't return them yet.
 */
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMerchant } from '../contexts/MerchantContext';
import { BASE_URL } from '../config';
import type { Merchant } from '../types';

const MOCK_MERCHANTS: Merchant[] = [
  { id: 'm1', name: 'Caffè Roma', vatNumber: 'IT12345678901' },
  { id: 'm2', name: 'Trattoria Bella', vatNumber: 'IT98765432109' },
];

export function MerchantLoader({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const { setMerchants } = useMerchant();

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const merchants = (data?.merchants as Merchant[] | undefined) ?? MOCK_MERCHANTS;
        setMerchants(merchants);
      })
      .catch(() => setMerchants(MOCK_MERCHANTS));
  }, [token, setMerchants]);

  return <>{children}</>;
}
