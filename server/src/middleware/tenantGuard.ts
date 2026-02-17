/**
 * Tenant guard: ensures user has access to merchantId.
 */
import { Request, Response, NextFunction } from 'express';

export function tenantGuard(req: Request, res: Response, next: NextFunction) {
  const user = (req as Request & { user?: { merchantIds?: string[] } }).user;
  const merchantId = (req.params.merchantId || req.body?.merchantId || req.query.merchantId || req.headers['x-merchant-id']) as string;
  if (!merchantId) {
    return res.status(400).json({ error: 'merchantId required' });
  }
  const allowed = user?.merchantIds?.includes(merchantId);
  if (!allowed) {
    return res.status(403).json({ error: 'Access denied to merchant' });
  }
  (req as Request & { merchantId?: string }).merchantId = merchantId;
  next();
}
