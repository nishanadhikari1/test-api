import { prisma } from "../../lib/prisma";
import { CreateRequestInput, UpdateRequestInput } from "./requests.schema";

async function getOwnedCollection(userId: string, collectionId: string) {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!collection) {
    throw new Error("Collection not found");
  }

  return collection;
}

export async function createRequest(
  userId: string,
  collectionId: string,
  input: CreateRequestInput,
) {
  await getOwnedCollection(userId, collectionId);

  return prisma.request.create({
    data: {
      name: input.name,
      method: input.method,
      url: input.url,
      headers: input.headers,
      body: input.body,
      collectionId,
    },
  });
}

export async function getRequests(userId: string, collectionId: string) {
  await getOwnedCollection(userId, collectionId);

  return prisma.request.findMany({
    where: { collectionId },
  });
}

export async function getRequestById(
  userId: string,
  collectionId: string,
  requestId: string,
) {
  await getOwnedCollection(userId, collectionId);

  return prisma.request.findFirst({
    where: {
      collectionId,
      id: requestId,
    },
  });
}

export async function updateRequest(
  userId: string,
  collectionId: string,
  requestId: string,
  input: UpdateRequestInput,
) {
  await getOwnedCollection(userId, collectionId);

  const existing = await prisma.request.findFirst({
    where: { id: requestId, collectionId },
  });
  if (!existing) {
    throw new Error("Request not found");
  }
  return prisma.request.update({
    where: {
      id: requestId,
    },
    data: {
      name: input.name,
      method: input.method,
      url: input.url,
      headers: input.headers,
      body: input.body,
      collectionId,
    },
  });
}

export async function deleteRequest(
  userId: string,
  collectionId: string,
  requestId: string,
) {
  await getOwnedCollection(userId, collectionId);

  const existing = await prisma.request.findFirst({
    where: { id: requestId, collectionId },
  });

  if (!existing) {
    throw new Error("Request not found");
  }

  return prisma.request.delete({
    where: { id: requestId },
  });
}
