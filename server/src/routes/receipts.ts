/**
 * Receipts API. Idempotent create via clientReceiptId for offline sync.
 */
import { Router, Request } from 'express';
import { z } from 'zod';
import * as receiptsStore from '../store/receipts';

interface AuthRequest extends Request {
  user?: { sub?: string; merchantIds?: string[] };
}

const receiptItemSchema = z.object({
  name: z.string(),
  qty: z.number().int().min(1),
  unitPriceCents: z.number().int().min(0),
  vatRate: z.number().min(0).max(100),
  lineTotalCents: z.number().int().min(0),
});

const createReceiptSchema = z.object({
  merchantId: z.string(),
  clientReceiptId: z.string().uuid(),
  issuedAt: z.string(),
  status: z.string().default('COMPLETED'),
  paymentMethod: z.string(),
  currency: z.string().default('EUR'),
  subtotalCents: z.number().int(),
  taxCents: z.number().int(),
  totalCents: z.number().int(),
  items: z.array(receiptItemSchema),
  createdOffline: z.boolean().default(false),
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
  const merchantId = req.headers['x-merchant-id'] as string || req.user?.merchantIds?.[0];
  if (!merchantId) return res.status(400).json({ error: 'merchantId required' });
  if (!req.user?.merchantIds?.includes(merchantId)) return res.status(403).json({ error: 'Access denied' });

  const filters = {
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
    status: req.query.status as string | undefined,
    payment: req.query.payment as string | undefined,
  };
  const list = receiptsStore.listReceipts(merchantId, filters);
  res.json({ receipts: list });
});

router.get('/:id', requireAuth, (req: AuthRequest, res) => {
  const merchantId = req.headers['x-merchant-id'] as string || req.user?.merchantIds?.[0];
  if (!merchantId) return res.status(400).json({ error: 'merchantId required' });
  const receipt = receiptsStore.getReceipt(req.params.id, merchantId);
  if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
  res.json(receipt);
});

router.post('/', requireAuth, (req: AuthRequest, res) => {
  const parsed = createReceiptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const { merchantId, clientReceiptId, ...data } = parsed.data;
  if (!req.user?.merchantIds?.includes(merchantId)) return res.status(403).json({ error: 'Access denied' });

  const { receipt, isDuplicate } = receiptsStore.createReceipt(merchantId, clientReceiptId, {
    ...data,
    createdByUserId: req.user?.sub as string,
  });
  res.status(isDuplicate ? 200 : 201).json({
    id: receipt.id,
    number: receipt.number,
    clientReceiptId: receipt.clientReceiptId,
  });
});

export { router as receiptsRouter };
