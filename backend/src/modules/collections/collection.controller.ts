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
    const message = parsed.error.issues[0]?.message ?? "Please enter a valid collection name.";
    return res.status(400).json({ error: message });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Please sign in again to continue." });
  }

  try {
    const collection = await createCollection(userId, parsed.data);
    return res.status(201).json(collection);
  } catch (error) {
    return res.status(500).json({ error: "We couldn’t create the collection right now." });
  }
}

export async function getCollectionsHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Please sign in again to continue." });
  }

  try {
    const collections = await getCollections(userId);
    return res.status(200).json(collections);
  } catch (error) {
    return res.status(500).json({ error: "We couldn’t load your collections right now." });
  }
}

export async function getCollectionByIdHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Please sign in again to continue." });
  }

  const collectionId = getCollectionId(req);
  if (!collectionId) {
    return res.status(400).json({ error: "Please select a collection before continuing." });
  }

  try {
    const collection = await getCollectionById(userId, collectionId);
    if (!collection) {
      return res.status(404).json({ error: "The selected collection could not be found." });
    }
    return res.status(200).json(collection);
  } catch (error) {
    return res.status(500).json({ error: "We couldn’t load the collection right now." });
  }
}

export async function updateCollectionHandler(req: Request, res: Response) {
  const parsed = updateCollectionSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Please enter a valid collection name.";
    return res.status(400).json({ error: message });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Please sign in again to continue." });
  }

  const collectionId = getCollectionId(req);
  if (!collectionId) {
    return res.status(404).json({ error: "The selected collection could not be found." });
  }

  try {
    const collection = await updateCollection(userId, collectionId, parsed.data);
    return res.status(200).json(collection);
  } catch (error) {
    return res.status(500).json({ error: "We couldn’t update the collection right now." });
  }
}

export async function deleteCollectionHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Please sign in again to continue." });

  const collectionId = getCollectionId(req);
  if (!collectionId) return res.status(400).json({ error: "Please select a collection before continuing." });

  try {
    await deleteCollection(userId, collectionId);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "We couldn’t delete the collection right now." });
  }
}