import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import authRoutes from './modules/auth/auth.routes';
import collectionRoutes from './modules/collections/collection.routes'
import requestRoutes from './modules/requests/requests.routes'
import runlogsRoutes from './modules/runlog/runlog.routes'
import cookiejarRoutes from './modules/cookiejar/cookiejar.routes'
import authMiddleware from './middleware/auth.middleware';
import { authLimiter } from './middleware/rateLimitter'
import { errorHandler } from './middleware/errorHandler';
import { csrfMiddleware } from './middleware/csrf.middleware';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser())

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/collections', authMiddleware, csrfMiddleware, collectionRoutes)
app.use('/api/collections/:collectionId/requests', authMiddleware, csrfMiddleware, requestRoutes)
app.use('/api/collections/:collectionId/requests/:id/runs', authMiddleware, csrfMiddleware, runlogsRoutes)
app.use('/api/cookiejar', authMiddleware, csrfMiddleware, cookiejarRoutes)
app.use(errorHandler)

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;