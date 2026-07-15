import { prisma } from '../../lib/prisma';

export function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function domainMatches(cookieDomain: string, requestDomain: string): boolean {
  if (cookieDomain === requestDomain) return true;
  return requestDomain.endsWith(`.${cookieDomain}`);
}

export function parseSetCookieHeader(header: string): {
  name: string;
  value: string;
  domain?: string;
  path: string;
  expires?: Date;
  httpOnly: boolean;
  secure: boolean;
} | null {
  const parts = header.split(';').map((p) => p.trim());
  const first = parts[0];
  if (!first) return null;

  const eqIdx = first.indexOf('=');
  if (eqIdx === -1) return null;

  const name = first.slice(0, eqIdx).trim();
  const value = first.slice(eqIdx + 1).trim();
  if (!name) return null;

  let domain: string | undefined;
  let path = '/';
  let expires: Date | undefined;
  let httpOnly = false;
  let secure = false;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const lower = part.toLowerCase();

    if (lower === 'httponly') {
      httpOnly = true;
    } else if (lower === 'secure') {
      secure = true;
    } else if (lower.startsWith('domain=')) {
      domain = part.slice(7).replace(/^\./, '');
    } else if (lower.startsWith('path=')) {
      path = part.slice(5) || '/';
    } else if (lower.startsWith('expires=')) {
      const d = new Date(part.slice(8));
      if (!isNaN(d.getTime())) expires = d;
    } else if (lower.startsWith('max-age=')) {
      const seconds = parseInt(part.slice(8), 10);
      if (!isNaN(seconds)) {
        expires = new Date(Date.now() + seconds * 1000);
      }
    }
  }

  return { name, value, domain, path, expires, httpOnly, secure };
}

export async function getCookieHeaderForUrl(
  userId: string,
  url: string,
): Promise<string | null> {
  const requestDomain = extractDomain(url);
  const now = new Date();

  const allCookies = await prisma.cookieJar.findMany({
    where: {
      userId,
      OR: [{ expires: null }, { expires: { gt: now } }],
    },
  });

  const applicable = allCookies.filter((c) =>
    domainMatches(c.domain, requestDomain),
  );

  if (applicable.length === 0) return null;

  return applicable.map((c) => `${c.name}=${c.value}`).join('; ');
}

export async function persistCookiesFromResponse(
  userId: string,
  requestUrl: string,
  responseHeaders: Record<string, string>,
): Promise<void> {
  const requestDomain = extractDomain(requestUrl);

  const raw = responseHeaders['set-cookie'];
  if (!raw) return;

  // Split on ", " that is followed by a new cookie name=value pair.
  // This avoids splitting on commas inside Expires date strings.
  const setCookieHeaders = raw.split(/,\s*(?=[^;,=\s]+=[^;,]*)/);

  const ops: Promise<unknown>[] = [];

  for (const header of setCookieHeaders) {
    const parsed = parseSetCookieHeader(header);
    if (!parsed) continue;

    const effectiveDomain = parsed.domain ?? requestDomain;
    const isExpired = parsed.expires !== undefined && parsed.expires <= new Date();

    if (isExpired) {
      ops.push(
        prisma.cookieJar.deleteMany({
          where: { userId, domain: effectiveDomain, name: parsed.name, path: parsed.path },
        }),
      );
    } else {
      ops.push(
        prisma.cookieJar.upsert({
          where: {
            userId_domain_name_path: {
              userId,
              domain: effectiveDomain,
              name: parsed.name,
              path: parsed.path,
            },
          },
          update: {
            value: parsed.value,
            expires: parsed.expires ?? null,
            httpOnly: parsed.httpOnly,
            secure: parsed.secure,
          },
          create: {
            userId,
            domain: effectiveDomain,
            name: parsed.name,
            value: parsed.value,
            path: parsed.path,
            expires: parsed.expires ?? null,
            httpOnly: parsed.httpOnly,
            secure: parsed.secure,
          },
        }),
      );
    }
  }

  await Promise.all(ops);
}

export async function getCookiesByDomain(userId: string) {
  const cookies = await prisma.cookieJar.findMany({
    where: { userId },
    orderBy: [{ domain: 'asc' }, { name: 'asc' }],
  });

  const grouped: Record<
    string,
    { id: string; name: string; value: string; path: string; expires: Date | null; httpOnly: boolean }[]
  > = {};

  for (const c of cookies) {
    if (!grouped[c.domain]) grouped[c.domain] = [];
    grouped[c.domain].push({
      id: c.id,
      name: c.name,
      value: c.value,
      path: c.path,
      expires: c.expires,
      httpOnly: c.httpOnly,
    });
  }

  return grouped;
}

export async function clearCookiesForDomain(userId: string, domain: string) {
  return prisma.cookieJar.deleteMany({ where: { userId, domain } });
}

export async function clearAllCookies(userId: string) {
  return prisma.cookieJar.deleteMany({ where: { userId } });
}

export async function deleteCookieById(userId: string, cookieId: string) {
  return prisma.cookieJar.deleteMany({ where: { id: cookieId, userId } });
}