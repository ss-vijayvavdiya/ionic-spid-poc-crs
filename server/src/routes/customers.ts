/**
 * Customers API. Merchant-scoped, JWT required.
 */
import { Router, Request } from 'express';
import { z } from 'zod';
import * as customersStore from '../store/customers';

interface AuthRequest extends Request {
  user?: { merchantIds?: string[] };
}

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
});

function requireAuth(req: AuthRequest, res: any, next: () => void) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing Authorization' });
  const jwt = require('jsonwebtoken');
  const { config } = require('../config');
  try {
    (req as AuthRequest).user = jwt.verify(auth.slice(7), config.APP_JWT_SECRET) as AuthRequest['user'];
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

const router = Router();

router.get('/', requireAuth, (req: AuthRequest, res) => {
  const merchantId = (req.headers['x-merchant-id'] as string) || req.user?.merchantIds?.[0];
  if (!merchantId) return res.status(400).json({ error: 'merchantId required' });
  if (!req.user?.merchantIds?.includes(merchantId)) return res.status(403).json({ error: 'Access denied' });
  const list = customersStore.listCustomers(merchantId);
  res.json({ customers: list });
});

router.get('/:id', requireAuth, (req: AuthRequest, res) => {
  const merchantId = (req.headers['x-merchant-id'] as string) || req.user?.merchantIds?.[0];
  if (!merchantId) return res.status(400).json({ error: 'merchantId required' });
  const customer = customersStore.getCustomer(req.params.id, merchantId);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

router.post('/', requireAuth, (req: AuthRequest, res) => {
  const merchantId = req.body?.merchantId || req.headers['x-merchant-id'];
  if (!merchantId) return res.status(400).json({ error: 'merchantId required' });
  if (!req.user?.merchantIds?.includes(merchantId)) return res.status(403).json({ error: 'Access denied' });
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const data = { ...parsed.data, email: parsed.data.email || undefined };
  const customer = customersStore.createCustomer(merchantId, data);
  res.status(201).json(customer);
});

router.put('/:id', requireAuth, (req: AuthRequest, res) => {
  const merchantId = req.body?.merchantId || req.headers['x-merchant-id'];
  if (!merchantId) return res.status(400).json({ error: 'merchantId required' });
  if (!req.user?.merchantIds?.includes(merchantId)) return res.status(403).json({ error: 'Access denied' });
  const parsed = customerSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const data = { ...parsed.data, email: parsed.data.email === '' ? undefined : parsed.data.email };
  const customer = customersStore.updateCustomer(req.params.id, merchantId, data);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  const merchantId = req.headers['x-merchant-id'] as string || req.user?.merchantIds?.[0];
  if (!merchantId) return res.status(400).json({ error: 'merchantId required' });
  const ok = customersStore.deleteCustomer(req.params.id, merchantId);
  if (!ok) return res.status(404).json({ error: 'Customer not found' });
  res.json({ ok: true });
});

export { router as customersRouter };
