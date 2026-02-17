/**
 * Products API. Merchant-scoped, JWT required.
 */
import { Router, Request } from 'express';
import { z } from 'zod';
import * as productsStore from '../store/products';

const productSchema = z.object({
  name: z.string().min(1),
  priceCents: z.number().int().min(0),
  vatRate: z.number().min(0).max(100),
  category: z.string().optional(),
  sku: z.string().optional(),
  isActive: z.boolean().optional(),
});

function requireAuth(req: Request, res: any, next: () => void) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization' });
  }
  const jwt = require('jsonwebtoken');
  const { config } = require('../config');
  try {
    const decoded = jwt.verify(auth.slice(7), config.APP_JWT_SECRET) as { merchantIds?: string[] };
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function tenantGuard(req: Request, res: any, next: () => void) {
  const user = (req as any).user;
  const merchantId = req.body?.merchantId || req.query.merchantId || req.params.merchantId || req.headers['x-merchant-id'];
  if (!merchantId) return res.status(400).json({ error: 'merchantId required' });
  if (!user?.merchantIds?.includes(merchantId)) return res.status(403).json({ error: 'Access denied' });
  (req as any).merchantId = merchantId;
  next();
}

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const merchantId = req.headers['x-merchant-id'] as string || (req as any).user?.merchantIds?.[0];
  if (!merchantId) return res.status(400).json({ error: 'merchantId required' });
  const updatedSince = req.query.updatedSince as string | undefined;
  const list = productsStore.listProducts(merchantId, updatedSince);
  res.json({ products: list });
});

router.get('/:id', requireAuth, (req, res) => {
  const merchantId = req.headers['x-merchant-id'] as string || (req as any).user?.merchantIds?.[0];
  if (!merchantId) return res.status(400).json({ error: 'merchantId required' });
  const product = productsStore.getProduct(req.params.id, merchantId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/', requireAuth, (req, res) => {
  const merchantId = req.body?.merchantId || req.headers['x-merchant-id'];
  if (!merchantId) return res.status(400).json({ error: 'merchantId required' });
  const user = (req as any).user;
  if (!user?.merchantIds?.includes(merchantId)) return res.status(403).json({ error: 'Access denied' });

  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const product = productsStore.createProduct(merchantId, { ...parsed.data, isActive: parsed.data.isActive ?? true });
  res.status(201).json(product);
});

router.put('/:id', requireAuth, (req, res) => {
  const merchantId = req.body?.merchantId || req.headers['x-merchant-id'];
  if (!merchantId) return res.status(400).json({ error: 'merchantId required' });
  const user = (req as any).user;
  if (!user?.merchantIds?.includes(merchantId)) return res.status(403).json({ error: 'Access denied' });

  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const product = productsStore.updateProduct(req.params.id, merchantId, parsed.data);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

export { router as productsRouter };
