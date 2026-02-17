/**
 * In-memory merchant store for POC.
 * In production: use PostgreSQL with merchants table.
 */
export interface Merchant {
  id: string;
  name: string;
  vatNumber?: string;
  address?: string;
}

const merchants = new Map<string, Merchant>();

export function getMerchantsForUser(_userId: string): Merchant[] {
  return Array.from(merchants.values());
}

export function getMerchant(id: string): Merchant | undefined {
  return merchants.get(id);
}

export function seedMerchants(): void {
  merchants.clear();
  merchants.set('m1', { id: 'm1', name: 'Caffè Roma', vatNumber: 'IT12345678901', address: 'Via Roma 1, Milano' });
  merchants.set('m2', { id: 'm2', name: 'Trattoria Bella', vatNumber: 'IT98765432109', address: 'Piazza Duomo 5, Milano' });
}
