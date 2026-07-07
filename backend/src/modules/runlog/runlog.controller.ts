import type { Request, Response } from "express";
import { getRunlogs } from "./runlog.service";
import { getUserId, getCollectionId, getRequestId } from "../../utils/helper";

export async function getRunlogsHandler(req: Request, res: Response) {
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
    const runlogs = await getRunlogs(userId, collectionId, requestId);
    return res.status(200).json(runlogs);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch runlogs" });
  }
}