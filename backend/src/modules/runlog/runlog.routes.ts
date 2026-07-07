import { Router } from 'express';
import { getRunlogsHandler } from './runlog.controller';

const router = Router({ mergeParams: true });

router.get('/', getRunlogsHandler);

export default router;