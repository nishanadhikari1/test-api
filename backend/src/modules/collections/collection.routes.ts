import { Router } from "express";
import {
  createCollectionHandler,
  getCollectionsHandler,
  getCollectionByIdHandler,
  updateCollectionHandler,
  deleteCollectionHandler,
} from "./collection.controller";

const router = Router();

router.post("/", createCollectionHandler);
router.get("/", getCollectionsHandler);
router.get("/:collectionId", getCollectionByIdHandler);
router.patch("/:collectionId", updateCollectionHandler);
router.delete("/:collectionId", deleteCollectionHandler);

export default router;
