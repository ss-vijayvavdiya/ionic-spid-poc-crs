/**
 * Merchant/tenant context. User can belong to multiple merchants.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Merchant } from '../types';

const MERCHANT_KEY = 'pos_selected_merchant_id';

function getStoredMerchantId(): string | null {
  try {
    return localStorage.getItem(MERCHANT_KEY);
  } catch {
    return null;
  }
}

function setStoredMerchantId(id: string | null) {
  if (id) localStorage.setItem(MERCHANT_KEY, id);
  else localStorage.removeItem(MERCHANT_KEY);
}

interface MerchantContextValue {
  selectedMerchant: Merchant | null;
  merchants: Merchant[];
  setMerchants: (m: Merchant[]) => void;
  selectMerchant: (m: Merchant | null) => void;
  merchantId: string | null;
}

const MerchantContext = createContext<MerchantContextValue | null>(null);

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const [merchants, setMerchantsState] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchantState] = useState<Merchant | null>(null);

  const setMerchants = useCallback((m: Merchant[]) => {
    setMerchantsState(m);
    const storedId = getStoredMerchantId();
    if (m.length === 1 && !storedId) {
      setStoredMerchantId(m[0].id);
      setSelectedMerchantState(m[0]);
    } else if (storedId && m.some((x) => x.id === storedId)) {
      setSelectedMerchantState(m.find((x) => x.id === storedId) ?? null);
    } else {
      setSelectedMerchantState(null);
    }
  }, []);

  const selectMerchant = useCallback((m: Merchant | null) => {
    setSelectedMerchantState(m);
    setStoredMerchantId(m?.id ?? null);
  }, []);

  const value: MerchantContextValue = {
    selectedMerchant,
    merchants,
    setMerchants,
    selectMerchant,
    merchantId: selectedMerchant?.id ?? null,
  };

  return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>;
}

export function useMerchant(): MerchantContextValue {
  const ctx = useContext(MerchantContext);
  if (!ctx) throw new Error('useMerchant must be used within MerchantProvider');
  return ctx;
}
