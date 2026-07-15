import { Router } from 'express';
import {
  getCookiesHandler,
  clearDomainHandler,
  clearAllHandler,
  deleteCookieHandler,
} from './cookiejar.controller';

const router = Router();

router.get('/', getCookiesHandler);
router.delete('/', clearAllHandler);
router.delete('/cookies/:cookieId', deleteCookieHandler);
router.delete('/:domain', clearDomainHandler);

export default router;