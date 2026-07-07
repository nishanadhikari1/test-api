import type { Request, Response } from "express";
import { createRequestSchema, updateRequestSchema } from "./requests.schema";
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
} from "./requests.service";
import e from "cors";

import { getUserId, getCollectionId, getRequestId } from "../../utils/helper";

export async function createRequestHandler(req: Request, res: Response) {
  const parsed = createRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: parsed.error.issues });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const collectionId = getCollectionId(req);
  if (!collectionId) {
    return res.status(400).json({ error: "Collection id is required" });
  }

  try {
    const request = await createRequest(userId, collectionId, parsed.data);
    return res.status(201).json(request);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create request" });
  }
}

export async function getRequestsHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const collectionId = getCollectionId(req);
  if (!collectionId) {
    return res.status(400).json({ error: "Collection id is required" });
  }
  try {
    const requests = await getRequests(userId, collectionId);
    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
}

export async function getRequestByIdHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const collectionId = getCollectionId(req);
  if (!collectionId) {
    return res.status(400).json({ error: "Collection id is required" });
  }
  const requestId = getRequestId(req);
  if (!requestId) {
    return res.status(400).json({ error: "Request id is required" });
  }
  try {
    const request = await getRequestById(userId, collectionId, requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch the request" });
  }
}

export async function updateRequestHandler(req: Request, res: Response) {
  const parsed = updateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "validation failed", details: parsed.error.issues });
  }
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const collectionId = getCollectionId(req);
  if (!collectionId) {
    return res.status(400).json({ error: "Collection id is required" });
  }
  const requestId = getRequestId(req);
  if (!requestId) {
    return res.status(400).json({ error: "Request id is required" });
  }
  try {
    const request = await updateRequest(
      userId,
      collectionId,
      requestId,
      parsed.data,
    );
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the request" });
  }
}

export async function deleteRequestHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const collectionId = getCollectionId(req);
  if (!collectionId) {
    return res.status(400).json({ error: "Collection id is required" });
  }
  const requestId = getRequestId(req);
  if (!requestId) {
    return res.status(400).json({ error: "Request id is required" });
  }

  try {
    await deleteRequest(userId, collectionId, requestId)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({error:"Failed to delete"})
  }
}
