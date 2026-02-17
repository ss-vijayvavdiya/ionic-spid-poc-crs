/**
 * Quick test: products API with sample data.
 * Run: npx ts-node scripts/test-products-api.ts
 */
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import path from 'path';
import { config } from '../src/config';

const BASE = 'http://localhost:4000';

async function main() {
  const token = jwt.sign(
    { sub: 'test', merchantIds: ['m1', 'm2'], iat: Math.floor(Date.now() / 1000) },
    config.APP_JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log('Testing GET /api/products (merchant m1 - Caffè Roma)...');
  const r1 = await fetch(`${BASE}/api/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Merchant-Id': 'm1',
    },
  });
  const data1 = (await r1.json()) as { products?: { name: string; priceCents: number }[] };
  if (!r1.ok) {
    console.error('Failed:', data1);
    process.exit(1);
  }
  console.log(`  Found ${data1.products?.length ?? 0} products`);
  data1.products?.slice(0, 3).forEach((p) => {
    console.log(`    - ${p.name}: €${(p.priceCents / 100).toFixed(2)}`);
  });

  console.log('\nTesting GET /api/products (merchant m2 - Trattoria Bella)...');
  const r2 = await fetch(`${BASE}/api/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Merchant-Id': 'm2',
    },
  });
  const data2 = (await r2.json()) as { products?: { name: string; priceCents: number }[] };
  if (!r2.ok) {
    console.error('Failed:', data2);
    process.exit(1);
  }
  console.log(`  Found ${data2.products?.length ?? 0} products`);
  data2.products?.slice(0, 3).forEach((p) => {
    console.log(`    - ${p.name}: €${(p.priceCents / 100).toFixed(2)}`);
  });

  console.log('\n✓ Products API test passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
