/**
 * Money formatting utilities. All amounts in cents.
 */
export function formatCents(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function centsToEuros(cents: number): number {
  return cents / 100;
}
