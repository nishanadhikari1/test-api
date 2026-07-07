import { Router } from "express";
import {
  createRequestHandler,
  getRequestsHandler,
  getRequestByIdHandler,
  updateRequestHandler,
  deleteRequestHandler,
} from "./requests.controller";

const router = Router({ mergeParams: true });

router.post('/', createRequestHandler)
router.get('/', getRequestsHandler)
router.get('/:id', getRequestByIdHandler)
router.patch('/:id', updateRequestHandler)
router.delete('/:id', deleteRequestHandler)

export default router