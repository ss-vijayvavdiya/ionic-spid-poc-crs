/**
 * Receipts local repo. Stores pending receipts for offline sync.
 */
import { db, type ReceiptRecord } from '../data/db';
import type { ReceiptItem } from '../types';

export interface PendingReceiptInput {
  clientReceiptId: string;
  merchantId: string;
  issuedAt: string;
  status: string;
  paymentMethod: string;
  currency: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  items: ReceiptItem[];
  createdOffline: boolean;
}

export async function addPendingReceipt(input: PendingReceiptInput): Promise<void> {
  const record: ReceiptRecord = {
    id: input.clientReceiptId,
    clientReceiptId: input.clientReceiptId,
    merchantId: input.merchantId,
    issuedAt: input.issuedAt,
    status: input.status,
    syncStatus: 'PENDING',
    paymentMethod: input.paymentMethod,
    currency: input.currency,
    subtotalCents: input.subtotalCents,
    taxCents: input.taxCents,
    totalCents: input.totalCents,
    itemsJson: JSON.stringify(input.items),
    createdOffline: input.createdOffline,
    syncAttempts: 0,
  };
  await db.receipts.add(record);
}

export async function getPendingReceipts(merchantId?: string): Promise<ReceiptRecord[]> {
  const all = await db.receipts.filter((r) => r.syncStatus === 'PENDING').toArray();
  if (merchantId) {
    return all.filter((r) => r.merchantId === merchantId);
  }
  return all;
}

/** Get all local receipts (PENDING + FAILED) for display in list. */
export async function getLocalReceiptsForDisplay(merchantId: string): Promise<ReceiptRecord[]> {
  const all = await db.receipts
    .where('merchantId')
    .equals(merchantId)
    .filter((r) => r.syncStatus === 'PENDING' || r.syncStatus === 'FAILED')
    .toArray();
  return all.sort((a, b) => (b.issuedAt > a.issuedAt ? 1 : -1));
}

export async function getPendingCount(merchantId?: string): Promise<number> {
  const list = await getPendingReceipts(merchantId);
  return list.length;
}

export async function incrementSyncAttempts(clientReceiptId: string): Promise<void> {
  const rec = await db.receipts.where('clientReceiptId').equals(clientReceiptId).first();
  if (rec) {
    await db.receipts.update(rec.id, { syncAttempts: rec.syncAttempts + 1 });
  }
}

export async function markReceiptSynced(clientReceiptId: string): Promise<void> {
  const rec = await db.receipts.where('clientReceiptId').equals(clientReceiptId).first();
  if (rec) {
    await db.receipts.update(rec.id, { syncStatus: 'SYNCED' });
  }
}

export async function markReceiptFailed(clientReceiptId: string): Promise<void> {
  const rec = await db.receipts.where('clientReceiptId').equals(clientReceiptId).first();
  if (rec) {
    await db.receipts.update(rec.id, { syncStatus: 'FAILED' });
  }
}

/** Convert ReceiptRecord to Receipt-like object for display. Pending receipts use clientReceiptId as id. */
export function pendingRecordToReceipt(rec: ReceiptRecord): {
  id: string;
  clientReceiptId: string;
  merchantId: string;
  number?: string;
  issuedAt: string;
  status: string;
  syncStatus: string;
  paymentMethod: string;
  currency: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  items: ReceiptItem[];
  createdOffline: boolean;
} {
  const items = JSON.parse(rec.itemsJson) as ReceiptItem[];
  return {
    id: rec.clientReceiptId,
    clientReceiptId: rec.clientReceiptId,
    merchantId: rec.merchantId,
    number: rec.number,
    issuedAt: rec.issuedAt,
    status: rec.status,
    syncStatus: rec.syncStatus,
    paymentMethod: rec.paymentMethod,
    currency: rec.currency,
    subtotalCents: rec.subtotalCents,
    taxCents: rec.taxCents,
    totalCents: rec.totalCents,
    items,
    createdOffline: rec.createdOffline,
  };
}
