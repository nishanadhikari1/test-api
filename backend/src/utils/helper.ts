import {prisma} from '../lib/prisma'
import type { Request} from 'express';

export function getUserId(req: Request): string | undefined {
  if (typeof req.user !== "object" || req.user === null) {
    return undefined;
  }
  return "userId" in req.user && typeof req.user.userId === "string"
    ? req.user.userId
    : undefined;
}

export function getCollectionId(req: Request): string | undefined {
  const rawId = req.params.collectionId;
  return Array.isArray(rawId) ? rawId[0] : rawId;
}

export function getRequestId(req: Request): string | undefined {
  const rawId = req.params.id;
  return Array.isArray(rawId) ? rawId[0] : rawId;
}

export async function getOwnedCollection(userId: string, collectionId: string) {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!collection) {
    throw new Error("The selected collection could not be found.");
  }

  return collection;
}
