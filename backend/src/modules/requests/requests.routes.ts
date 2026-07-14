import { Router } from "express";
import {
  createRequestHandler,
  getRequestsHandler,
  getRequestByIdHandler,
  updateRequestHandler,
  deleteRequestHandler,
  sendRequestHandler,
  sendRequestDirectHandler,
} from "./requests.controller";

const router = Router({ mergeParams: true });

router.post('/', createRequestHandler)
router.get('/', getRequestsHandler)
router.post('/send', sendRequestDirectHandler)
router.get('/:id', getRequestByIdHandler)
router.patch('/:id', updateRequestHandler)
router.delete('/:id', deleteRequestHandler)
router.post('/:id/send', sendRequestHandler);

export default router