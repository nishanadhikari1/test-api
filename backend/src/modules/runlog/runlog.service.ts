import { prisma } from "../../lib/prisma";
import { getOwnedCollection } from "../../utils/helper";

export async function getRunlogs(
  userId: string,
  collectionId: string,
  requestId: string,
) {
  await getOwnedCollection(userId, collectionId);

  const request = await prisma.request.findFirst({
    where: { id: requestId, collectionId },
  });

  if (!request) {
    throw new Error("Request not found");
  }

  return prisma.runLog.findMany({
    where: { requestId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createRunLog(requestId: string, data: {
  statusCode?: number;
  responseTimeMs?: number;
  responseHeaders?: unknown;
  responseBody?: unknown;
}) {
  return prisma.runLog.create({
    data: {
      requestId,
      statusCode: data.statusCode,
      responseTimeMs: data.responseTimeMs,
      responseHeaders: data.responseHeaders,
      responseBody: data.responseBody,
    },
  });
}