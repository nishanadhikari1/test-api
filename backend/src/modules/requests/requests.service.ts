import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client";
import type { Request, Response } from "express";
import { CreateRequestInput, UpdateRequestInput } from "./requests.schema";
import { getOwnedCollection } from "../../utils/helper";
import { createRunLog } from "../runlog/runlog.service";
import { getCookieHeaderForUrl, persistCookiesFromResponse } from "../cookiejar/cookiejar.service";

export async function createRequest(userId: string, collectionId: string, input: CreateRequestInput) {
  await getOwnedCollection(userId, collectionId);
  return prisma.request.create({
    data: { name: input.name, method: input.method, url: input.url, headers: input.headers, body: input.body, collectionId },
  });
}

export async function getRequests(userId: string, collectionId: string) {
  await getOwnedCollection(userId, collectionId);
  return prisma.request.findMany({ where: { collectionId } });
}

export async function getRequestById(userId: string, collectionId: string, requestId: string) {
  await getOwnedCollection(userId, collectionId);
  return prisma.request.findFirst({ where: { collectionId, id: requestId } });
}

export async function updateRequest(userId: string, collectionId: string, requestId: string, input: UpdateRequestInput) {
  await getOwnedCollection(userId, collectionId);
  const existing = await prisma.request.findFirst({ where: { id: requestId, collectionId } });
  if (!existing) throw new Error("Request not found");
  return prisma.request.update({
    where: { id: requestId },
    data: { name: input.name, method: input.method, url: input.url, headers: input.headers, body: input.body, collectionId },
  });
}

export async function deleteRequest(userId: string, collectionId: string, requestId: string) {
  await getOwnedCollection(userId, collectionId);
  const existing = await prisma.request.findFirst({ where: { id: requestId, collectionId } });
  if (!existing) throw new Error("Request not found");
  return prisma.request.delete({ where: { id: requestId } });
}

export async function sendRequestPayload(userId: string, collectionId: string, input: CreateRequestInput) {
  await getOwnedCollection(userId, collectionId);

  const jarCookieHeader = await getCookieHeaderForUrl(userId, input.url);
  const outgoingHeaders: Record<string, string> = { ...(input.headers as Record<string, string> | undefined) };
  if (jarCookieHeader) {
    outgoingHeaders['Cookie'] = outgoingHeaders['Cookie']
      ? `${outgoingHeaders['Cookie']}; ${jarCookieHeader}`
      : jarCookieHeader;
  }

  const startTime = Date.now();
  try {
    const response = await fetch(input.url, {
      method: input.method,
      headers: outgoingHeaders,
      body: input.body !== undefined
        ? (typeof input.body === "string" ? input.body : JSON.stringify(input.body))
        : undefined,
    });

    const responseTimeMs = Date.now() - startTime;
    const setCookies = await persistCookiesFromResponse(userId, input.url, response.headers);
    const responseHeaders = Object.fromEntries(response.headers.entries());

    let responseBody: unknown = null;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = await response.text().catch(() => null);
    }

    return {
      statusCode: response.status,
      responseTimeMs,
      responseHeaders: responseHeaders as Prisma.InputJsonValue,
      responseBody: responseBody as Prisma.InputJsonValue,
      setCookies,
    };
  } catch (err) {
    return {
      statusCode: undefined,
      responseTimeMs: Date.now() - startTime,
      responseHeaders: undefined,
      responseBody: { error: (err as Error).message },
      setCookies: [],
    };
  }
}

export async function sendRequest(userId: string, collectionId: string, requestId: string) {
  await getOwnedCollection(userId, collectionId);

  const request = await prisma.request.findFirst({ where: { id: requestId, collectionId } });
  if (!request) throw new Error("The selected request could not be found.");

  const jarCookieHeader = await getCookieHeaderForUrl(userId, request.url);
  const outgoingHeaders: Record<string, string> = { ...(request.headers as Record<string, string> | null ?? {}) };
  if (jarCookieHeader) {
    outgoingHeaders['Cookie'] = outgoingHeaders['Cookie']
      ? `${outgoingHeaders['Cookie']}; ${jarCookieHeader}`
      : jarCookieHeader;
  }

  const startTime = Date.now();
  try {
    const response = await fetch(request.url, {
      method: request.method,
      headers: outgoingHeaders,
      body: request.body ? JSON.stringify(request.body) : undefined,
    });

    const responseTimeMs = Date.now() - startTime;
    const setCookies = await persistCookiesFromResponse(userId, request.url, response.headers);
    const responseHeaders = Object.fromEntries(response.headers.entries());

    let responseBody: unknown = null;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = await response.text().catch(() => null);
    }

    const runLog = await createRunLog(requestId, {
      statusCode: response.status,
      responseTimeMs,
      responseHeaders: responseHeaders as Prisma.InputJsonValue,
      responseBody: responseBody as Prisma.InputJsonValue,
    });

    return { ...runLog, setCookies };
  } catch (err) {
    const runLog = await createRunLog(requestId, {
      statusCode: undefined,
      responseTimeMs: Date.now() - startTime,
      responseHeaders: undefined,
      responseBody: { error: (err as Error).message },
    });

    return { ...runLog, setCookies: [] };
  }
}