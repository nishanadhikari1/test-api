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
router.get("/:id", getCollectionByIdHandler);
router.patch("/:id", updateCollectionHandler);
router.delete("/:id", deleteCollectionHandler);

export default router;
