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

/** Sample products for demo (coffee shop style). Used when "Load sample data" is tapped. */
const SAMPLE_PRODUCTS = [
  { name: 'Espresso', priceCents: 250, vatRate: 10, category: 'Beverages', sku: 'CF-001' },
  { name: 'Cappuccino', priceCents: 350, vatRate: 10, category: 'Beverages', sku: 'CF-002' },
  { name: 'Croissant', priceCents: 200, vatRate: 10, category: 'Pastries', sku: 'PK-001' },
  { name: 'Sandwich', priceCents: 650, vatRate: 10, category: 'Food', sku: 'FD-001' },
  { name: 'Mineral Water', priceCents: 150, vatRate: 22, category: 'Beverages', sku: 'BV-001' },
];

export async function seedSampleProducts(merchantId: string): Promise<Product[]> {
  const now = new Date().toISOString();
  const products: Product[] = SAMPLE_PRODUCTS.map((p, i) => ({
    id: `sample-${Date.now()}-${i}`,
    merchantId,
    name: p.name,
    priceCents: p.priceCents,
    vatRate: p.vatRate,
    category: p.category,
    sku: p.sku,
    isActive: true,
    updatedAt: now,
  }));
  await upsertProducts(products);
  return products;
}
