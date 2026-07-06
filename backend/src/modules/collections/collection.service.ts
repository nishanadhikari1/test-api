import { prisma } from '../../lib/prisma';
import { CreateCollectionInput, UpdateCollectionInput } from './collection.schema';

export async function createCollection(userId: string, input: CreateCollectionInput) {
  return prisma.collection.create({
    data: {
      name: input.name,
      userId,
    },
  });
}

export async function getCollections(userId: string) {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCollectionById(userId: string, collectionId: string) {
  return prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
  });
}

export async function updateCollection(userId: string, collectionId: string, input: UpdateCollectionInput) {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!existing) throw new Error('Collection not found');

  return prisma.collection.update({
    where: { id: collectionId },
    data: {
      name: input.name,
    },
  });
}

export async function deleteCollection(userId: string, collectionId: string) {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!existing) throw new Error('Collection not found');

  return prisma.collection.delete({
    where: { id: collectionId },
  });
}