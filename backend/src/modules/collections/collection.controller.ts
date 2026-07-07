import type { Request, Response } from "express";
import { createCollectionSchema, updateCollectionSchema } from "./collection.schema";
import {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
} from "./collection.service";
import { getUserId, getCollectionId } from "../../utils/helper";

export async function createCollectionHandler(req: Request, res: Response) {
  const parsed = createCollectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: parsed.error.issues });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const collection = await createCollection(userId, parsed.data);
    return res.status(201).json(collection);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create collection" });
  }
}

export async function getCollectionsHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const collections = await getCollections(userId);
    return res.status(200).json(collections);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get collections" });
  }
}

export async function getCollectionByIdHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const collectionId = getCollectionId(req);
  if (!collectionId) {
    return res.status(400).json({ error: "Collection id is required" });
  }

  try {
    const collection = await getCollectionById(userId, collectionId);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    return res.status(200).json(collection);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get collection" });
  }
}

export async function updateCollectionHandler(req: Request, res: Response) {
  const parsed = updateCollectionSchema.safeParse(req.body);
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
    return res.status(404).json({ error: "Collection not found" });
  }

  try {
    const collection = await updateCollection(userId, collectionId, parsed.data);
    return res.status(200).json(collection);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update collection" });
  }
}

export async function deleteCollectionHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const collectionId = getCollectionId(req);
  if (!collectionId) return res.status(400).json({ error: "Collection id is required" });

  try {
    await deleteCollection(userId, collectionId);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete collection" });
  }
}