export type Collection = { id: string; name: string };

export type RequestItem = {
  id: string;
  name: string;
  url: string;
  method: string;
  body?: unknown;
  headers?: unknown;
};

export type RunLogResult = {
  statusCode: number | null;
  responseTimeMs: number | null;
  responseHeaders: Record<string, string> | null;
  responseBody: unknown;
};

export type KeyValuePair = { key: string; value: string; enabled: boolean };

export type StoredCookie = {
  id: string;
  name: string;
  value: string;
  path: string;
  expires: string | null;
  httpOnly: boolean;
};

export type CookieJarByDomain = Record<string, StoredCookie[]>;