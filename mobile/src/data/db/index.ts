/**
 * IndexedDB (Dexie) setup for offline-first data.
 * Products cache, receipts (pending sync), sync metadata.
 */
import Dexie, { type Table } from 'dexie';

export interface ProductRecord {
  id: string;
  merchantId: string;
  name: string;
  priceCents: number;
  vatRate: number;
  category?: string;
  sku?: string;
  isActive: boolean;
  updatedAt: string;
}

export interface ReceiptRecord {
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
  itemsJson: string;
  createdOffline: boolean;
  syncAttempts: number;
}

export interface SyncMetaRecord {
  id: string;
  merchantId: string;
  lastProductSync?: string;
  lastReceiptSync?: string;
}

class PosDatabase extends Dexie {
  products!: Table<ProductRecord>;
  receipts!: Table<ReceiptRecord>;
  syncMeta!: Table<SyncMetaRecord>;

  constructor() {
    super('pos_db');
    this.version(1).stores({
      products: 'id, merchantId, [merchantId+updatedAt]',
      receipts: 'id, clientReceiptId, merchantId, [merchantId+issuedAt], [merchantId+clientReceiptId]',
      syncMeta: 'id, merchantId',
    });
  }
}

export const db = new PosDatabase();
