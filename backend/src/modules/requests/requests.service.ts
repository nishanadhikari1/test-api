import { prisma } from "../../lib/prisma";
import { CreateRequestInput } from "./requests.schema";

export async function createRequest(userId: string, collectionId: string, input: CreateRequestInput,){
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!collection) {
    throw new Error("Collection not found");
  }

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

export async function getRequests(userId: string, collectionId: string){
    
}
