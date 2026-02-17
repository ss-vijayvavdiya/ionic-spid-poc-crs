/**
 * Sync manager. Processes pending receipts when online.
 * Retry: 3 attempts with exponential backoff.
 */
import { createReceipt } from '../api/receipts';
import * as receiptsRepo from './receiptsRepo';

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function syncPendingReceipts(merchantId?: string): Promise<{ synced: number; failed: number }> {
  const pending = await receiptsRepo.getPendingReceipts(merchantId);
  let synced = 0;
  let failed = 0;

  for (const rec of pending) {
    if (rec.syncAttempts >= MAX_ATTEMPTS) {
      await receiptsRepo.markReceiptFailed(rec.clientReceiptId);
      failed++;
      continue;
    }

    const items = JSON.parse(rec.itemsJson) as { name: string; qty: number; unitPriceCents: number; vatRate: number; lineTotalCents: number }[];
    try {
      await createReceipt(rec.merchantId, {
        clientReceiptId: rec.clientReceiptId,
        issuedAt: rec.issuedAt,
        status: rec.status,
        paymentMethod: rec.paymentMethod as 'CASH' | 'CARD' | 'WALLET' | 'SPLIT',
        currency: rec.currency,
        subtotalCents: rec.subtotalCents,
        taxCents: rec.taxCents,
        totalCents: rec.totalCents,
        items,
        createdOffline: rec.createdOffline,
      });
      await receiptsRepo.markReceiptSynced(rec.clientReceiptId);
      synced++;
    } catch {
      await receiptsRepo.incrementSyncAttempts(rec.clientReceiptId);
      const backoff = BASE_DELAY_MS * Math.pow(2, rec.syncAttempts);
      await delay(backoff);
      failed++;
    }
  }

  return { synced, failed };
}
