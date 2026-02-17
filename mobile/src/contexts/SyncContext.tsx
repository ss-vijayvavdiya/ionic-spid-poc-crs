/**
 * Sync context. Exposes pending count and manual sync trigger.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useConnectivity } from './ConnectivityContext';
import { useMerchant } from './MerchantContext';
import { getPendingCount } from '../store/receiptsRepo';
import { syncPendingReceipts } from '../store/syncManager';

interface SyncContextValue {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncError: string | null;
  refreshPendingCount: () => Promise<void>;
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { isOnline } = useConnectivity();
  const { merchantId } = useMerchant();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const wasOfflineRef = useRef(true);

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount(merchantId ?? undefined);
    setPendingCount(count);
  }, [merchantId]);

  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      setLastSyncError('Offline');
      return;
    }
    setIsSyncing(true);
    setLastSyncError(null);
    try {
      await syncPendingReceipts(merchantId ?? undefined);
      await refreshPendingCount();
    } catch (e) {
      setLastSyncError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, merchantId, refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    if (isOnline && wasOfflineRef.current) {
      wasOfflineRef.current = false;
      triggerSync();
    }
    if (!isOnline) wasOfflineRef.current = true;
  }, [isOnline, triggerSync]);

  const value: SyncContextValue = {
    pendingCount,
    isSyncing,
    lastSyncError,
    refreshPendingCount,
    triggerSync,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
}
