/**
 * Products local repo. Caches products for offline use.
 */
import { db, type ProductRecord } from '../data/db';
import type { Product } from '../types';

export function toProduct(p: ProductRecord): Product {
  return {
    id: p.id,
    merchantId: p.merchantId,
    name: p.name,
    priceCents: p.priceCents,
    vatRate: p.vatRate,
    category: p.category,
    sku: p.sku,
    isActive: p.isActive,
    updatedAt: p.updatedAt,
  };
}

export async function upsertProducts(products: Product[]): Promise<void> {
  const records: ProductRecord[] = products.map((p) => ({
    id: p.id,
    merchantId: p.merchantId,
    name: p.name,
    priceCents: p.priceCents,
    vatRate: p.vatRate,
    category: p.category,
    sku: p.sku,
    isActive: p.isActive,
    updatedAt: p.updatedAt,
  }));
  await db.products.bulkPut(records);
}

export async function getProducts(merchantId: string): Promise<Product[]> {
  const records = await db.products.where('merchantId').equals(merchantId).toArray();
  return records.map(toProduct);
}
