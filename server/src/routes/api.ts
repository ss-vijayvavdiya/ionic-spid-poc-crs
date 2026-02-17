/**
 * Protected API routes. Require our own JWT (Bearer token).
 */
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const router = Router();

// Middleware: require Authorization: Bearer <our_jwt> (the JWT we mint after Signicat exchange).
// We do not use Signicat's access token in the app; we use our own JWT for API auth.
function requireAuth(req: Request, res: Response, next: () => void) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, config.APP_JWT_SECRET) as Record<string, unknown>;
    (req as Request & { user?: Record<string, unknown> }).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * GET /api/me
 * Returns the decoded JWT claims (user info) and a friendly message.
 * Used by the mobile app to display profile after login.
 */
router.get('/me', requireAuth, (req, res) => {
  const user = (req as Request & { user?: Record<string, unknown> }).user;
  res.json({
    message: `Hello, ${user?.name || user?.sub || 'user'}!`,
    user,
  });
});

export { router as apiRouter };
