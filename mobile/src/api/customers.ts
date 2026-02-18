/**
 * Customers API client.
 */
import { apiFetch } from './client';
import type { Customer } from '../types';

export async function fetchCustomers(merchantId: string): Promise<Customer[]> {
  const res = await apiFetch<{ customers: Customer[] }>('/customers', { merchantId });
  return res.customers;
}

export async function getCustomer(id: string, merchantId: string): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}`, { merchantId });
}

export async function createCustomer(
  merchantId: string,
  data: { name: string; email?: string; phone?: string }
): Promise<Customer> {
  return apiFetch<Customer>('/customers', {
    method: 'POST',
    body: { merchantId, ...data },
    merchantId,
  });
}

export async function updateCustomer(
  id: string,
  merchantId: string,
  data: { name?: string; email?: string; phone?: string }
): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: { merchantId, ...data },
    merchantId,
  });
}

export async function deleteCustomer(id: string, merchantId: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/customers/${id}`, { method: 'DELETE', merchantId });
}
