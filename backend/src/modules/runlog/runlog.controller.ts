import type { Request, Response } from "express";
import { getRunlogs } from "./runlog.service";
import { getUserId, getCollectionId, getRequestId } from "../../utils/helper";

export async function getRunlogsHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Please sign in again to continue." });
  }
  const collectionId = getCollectionId(req);
  if (!collectionId) {
    return res.status(400).json({ error: "Please select a collection before continuing." });
  }
  const requestId = getRequestId(req);
  if (!requestId) {
    return res.status(400).json({ error: "The selected request could not be found." });
  }
  try {
    const runlogs = await getRunlogs(userId, collectionId, requestId);
    return res.status(200).json(runlogs);
  } catch (error) {
    return res.status(500).json({ error: "We couldn’t load the request history right now." });
  }
}