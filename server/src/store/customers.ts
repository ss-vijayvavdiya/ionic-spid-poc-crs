/**
 * In-memory customers store. Merchant-scoped.
 */
export interface Customer {
  id: string;
  merchantId: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

const customers = new Map<string, Customer>();
let idCounter = 1;

function nextId(): string {
  return `c${idCounter++}`;
}

export function listCustomers(merchantId: string): Customer[] {
  return Array.from(customers.values())
    .filter((c) => c.merchantId === merchantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCustomer(id: string, merchantId: string): Customer | undefined {
  const c = customers.get(id);
  return c && c.merchantId === merchantId ? c : undefined;
}

export function createCustomer(
  merchantId: string,
  data: Omit<Customer, 'id' | 'merchantId' | 'createdAt'>
): Customer {
  const now = new Date().toISOString();
  const customer: Customer = {
    id: nextId(),
    merchantId,
    ...data,
    createdAt: now,
  };
  customers.set(customer.id, customer);
  return customer;
}

export function updateCustomer(
  id: string,
  merchantId: string,
  data: Partial<Pick<Customer, 'name' | 'email' | 'phone'>>
): Customer | undefined {
  const existing = getCustomer(id, merchantId);
  if (!existing) return undefined;
  const updated: Customer = {
    ...existing,
    ...data,
  };
  customers.set(id, updated);
  return updated;
}

export function deleteCustomer(id: string, merchantId: string): boolean {
  const c = customers.get(id);
  if (!c || c.merchantId !== merchantId) return false;
  customers.delete(id);
  return true;
}

export function seedCustomer(
  merchantId: string,
  data: Omit<Customer, 'id' | 'merchantId' | 'createdAt'>
): Customer {
  return createCustomer(merchantId, data);
}
