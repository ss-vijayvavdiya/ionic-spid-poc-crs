/**
 * Products API client.
 */
import { apiFetch } from './client';
import type { Product } from '../types';

export interface ProductCreate {
  name: string;
  priceCents: number;
  vatRate: number;
  category?: string;
  sku?: string;
  isActive?: boolean;
}

export interface ProductUpdate extends Partial<ProductCreate> {}

export async function fetchProducts(merchantId: string, updatedSince?: string): Promise<Product[]> {
  const params = updatedSince ? `?updatedSince=${encodeURIComponent(updatedSince)}` : '';
  const res = await apiFetch<{ products: Product[] }>(`/products${params}`, { merchantId });
  return res.products;
}

export async function createProduct(merchantId: string, data: ProductCreate): Promise<Product> {
  return apiFetch<Product>('/products', {
    method: 'POST',
    body: { merchantId, ...data },
    merchantId,
  });
}

export async function getProduct(id: string, merchantId: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, { merchantId });
}

export async function updateProduct(id: string, merchantId: string, data: ProductUpdate): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, {
    method: 'PUT',
    body: { merchantId, ...data },
    merchantId,
  });
}
