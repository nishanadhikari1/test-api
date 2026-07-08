import Tokens from 'csrf';
import type { Request, Response, NextFunction } from 'express';

const tokens = new Tokens();

export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const secret = req.cookies?.csrfSecret;
  const tokenFromHeader = req.headers['x-csrf-token'];

  if (!secret || !tokenFromHeader || typeof tokenFromHeader !== 'string') {
    return res.status(403).json({ error: 'Missing CSRF token' });
  }

  if (!tokens.verify(secret, tokenFromHeader)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}