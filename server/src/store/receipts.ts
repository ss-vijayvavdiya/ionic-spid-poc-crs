/**
 * In-memory receipts store. Merchant-scoped.
 * Idempotent create via clientReceiptId.
 */
export interface ReceiptItem {
  name: string;
  qty: number;
  unitPriceCents: number;
  vatRate: number;
  lineTotalCents: number;
}

export interface Receipt {
  id: string;
  merchantId: string;
  clientReceiptId: string;
  number: string;
  issuedAt: string;
  status: string;
  paymentMethod: string;
  currency: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  items: ReceiptItem[];
  createdByUserId?: string;
  createdOffline: boolean;
}

const receipts = new Map<string, Receipt>();
const clientReceiptIndex = new Map<string, string>(); // "merchantId:clientReceiptId" -> receiptId

let numberCounter: Record<string, number> = {};

function nextNumber(merchantId: string): string {
  const n = (numberCounter[merchantId] ?? 0) + 1;
  numberCounter[merchantId] = n;
  return `R-${n}`;
}

export function createReceipt(
  merchantId: string,
  clientReceiptId: string,
  data: Omit<Receipt, 'id' | 'merchantId' | 'clientReceiptId' | 'number'>
): { receipt: Receipt; isDuplicate: boolean } {
  const key = `${merchantId}:${clientReceiptId}`;
  const existingId = clientReceiptIndex.get(key);
  if (existingId) {
    const existing = receipts.get(existingId);
    if (existing) return { receipt: existing, isDuplicate: true };
  }

  const id = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const number = nextNumber(merchantId);
  const receipt: Receipt = {
    id,
    merchantId,
    clientReceiptId,
    number,
    ...data,
  };
  receipts.set(id, receipt);
  clientReceiptIndex.set(key, id);
  return { receipt, isDuplicate: false };
}

export function getReceipt(id: string, merchantId: string): Receipt | undefined {
  const r = receipts.get(id);
  return r && r.merchantId === merchantId ? r : undefined;
}

export function updateReceiptStatus(
  id: string,
  merchantId: string,
  status: 'VOIDED' | 'REFUNDED'
): Receipt | undefined {
  const r = receipts.get(id);
  if (!r || r.merchantId !== merchantId) return undefined;
  r.status = status;
  return r;
}

export function listReceipts(
  merchantId: string,
  filters?: { from?: string; to?: string; status?: string; payment?: string }
): Receipt[] {
  let list = Array.from(receipts.values()).filter((r) => r.merchantId === merchantId);
  if (filters?.from) list = list.filter((r) => r.issuedAt >= filters.from!);
  if (filters?.to) list = list.filter((r) => r.issuedAt <= filters.to!);
  if (filters?.status) list = list.filter((r) => r.status === filters.status);
  if (filters?.payment) list = list.filter((r) => r.paymentMethod === filters.payment);
  return list.sort((a, b) => (b.issuedAt > a.issuedAt ? 1 : -1));
}

export function seedReceipt(merchantId: string, clientReceiptId: string, data: Omit<Receipt, 'id' | 'merchantId' | 'clientReceiptId' | 'number'>): Receipt {
  const { receipt } = createReceipt(merchantId, clientReceiptId, data);
  return receipt;
}
