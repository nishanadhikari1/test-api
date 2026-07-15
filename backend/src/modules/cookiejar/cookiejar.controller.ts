import type { Request, Response } from 'express';
import { getUserId } from '../../utils/helper';
import {
  getCookiesByDomain,
  clearCookiesForDomain,
  clearAllCookies,
  deleteCookieById,
} from './cookiejar.service';

export async function getCookiesHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Please sign in again to continue.' });

  try {
    const grouped = await getCookiesByDomain(userId);
    return res.status(200).json(grouped);
  } catch {
    return res.status(500).json({ error: "We couldn't load the cookie jar right now." });
  }
}

export async function clearDomainHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Please sign in again to continue.' });

  const domain = Array.isArray(req.params.domain) ? req.params.domain[0] : req.params.domain;
  if (!domain) return res.status(400).json({ error: 'Domain is required.' });

  try {
    await clearCookiesForDomain(userId, domain);
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: "We couldn't clear those cookies right now." });
  }
}

export async function clearAllHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Please sign in again to continue.' });

  try {
    await clearAllCookies(userId);
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: "We couldn't clear the cookie jar right now." });
  }
}

export async function deleteCookieHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Please sign in again to continue.' });

  const cookieId = Array.isArray(req.params.cookieId) ? req.params.cookieId[0] : req.params.cookieId;
  if (!cookieId) return res.status(400).json({ error: 'Cookie ID is required.' });

  try {
    await deleteCookieById(userId, cookieId);
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: "We couldn't delete that cookie right now." });
  }
}