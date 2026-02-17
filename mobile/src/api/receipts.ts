/**
 * Receipts API client.
 */
import { apiFetch } from './client';
import type { Receipt, ReceiptItem, PaymentMethod } from '../types';

export interface CreateReceiptPayload {
  merchantId: string;
  clientReceiptId: string;
  issuedAt: string;
  status?: string;
  paymentMethod: PaymentMethod;
  currency?: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  items: ReceiptItem[];
  createdOffline?: boolean;
}

export interface CreateReceiptResponse {
  id: string;
  number: string;
  clientReceiptId: string;
}

export async function createReceipt(
  merchantId: string,
  payload: Omit<CreateReceiptPayload, 'merchantId'>
): Promise<CreateReceiptResponse> {
  return apiFetch<CreateReceiptResponse>('/receipts', {
    method: 'POST',
    body: { merchantId, ...payload },
    merchantId,
  });
}

export async function fetchReceipts(
  merchantId: string,
  filters?: { from?: string; to?: string; status?: string; payment?: string }
): Promise<Receipt[]> {
  const params = new URLSearchParams();
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.payment) params.set('payment', filters.payment);
  const qs = params.toString();
  const res = await apiFetch<{ receipts: Receipt[] }>(`/receipts${qs ? `?${qs}` : ''}`, { merchantId });
  return res.receipts;
}

export async function getReceipt(id: string, merchantId: string): Promise<Receipt> {
  return apiFetch<Receipt>(`/receipts/${id}`, { merchantId });
}

export async function voidReceipt(id: string, merchantId: string): Promise<Receipt> {
  return apiFetch<Receipt>(`/receipts/${id}/void`, { method: 'PUT', merchantId });
}

export async function refundReceipt(id: string, merchantId: string): Promise<Receipt> {
  return apiFetch<Receipt>(`/receipts/${id}/refund`, { method: 'PUT', merchantId });
}
