/**
 * In-memory products store. Merchant-scoped.
 * In production: PostgreSQL products table.
 */
export interface Product {
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

const products = new Map<string, Product>();

let idCounter = 1;
function nextId() {
  return `p${idCounter++}`;
}

export function clearProducts(): void {
  products.clear();
  idCounter = 1;
}

export function seedProduct(merchantId: string, data: Omit<Product, 'id' | 'merchantId' | 'updatedAt'>): Product {
  const now = new Date().toISOString();
  const product: Product = {
    id: nextId(),
    merchantId,
    ...data,
    isActive: data.isActive ?? true,
    updatedAt: now,
  };
  products.set(product.id, product);
  return product;
}

export function listProducts(merchantId: string, updatedSince?: string): Product[] {
  const list = Array.from(products.values()).filter((p) => p.merchantId === merchantId && p.isActive);
  if (updatedSince) {
    return list.filter((p) => p.updatedAt >= updatedSince);
  }
  return list;
}

export function getProduct(id: string, merchantId: string): Product | undefined {
  const p = products.get(id);
  return p && p.merchantId === merchantId ? p : undefined;
}

export function createProduct(merchantId: string, data: Omit<Product, 'id' | 'merchantId' | 'updatedAt'>): Product {
  const now = new Date().toISOString();
  const product: Product = {
    id: nextId(),
    merchantId,
    ...data,
    isActive: data.isActive ?? true,
    updatedAt: now,
  };
  products.set(product.id, product);
  return product;
}

export function updateProduct(id: string, merchantId: string, data: Partial<Product>): Product | undefined {
  const existing = getProduct(id, merchantId);
  if (!existing) return undefined;
  const updated: Product = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  products.set(id, updated);
  return updated;
}
