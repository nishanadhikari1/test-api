import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import authRoutes from './modules/auth/auth.routes';
import collectionRoutes from './modules/collections/collection.routes'
import requestRoutes from './modules/requests/requests.routes'
import runlogsRoutes from './modules/runlog/runlog.routes'
import { authMiddleware } from './middleware/auth.middleware';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser())

app.use('/api/auth', authRoutes);
app.use('/api/collections', authMiddleware, collectionRoutes)
app.use('/api/collections/:collectionId/requests', authMiddleware, requestRoutes)
app.use('/api/collections/:collectionId/requests/:id/runs', authMiddleware, runlogsRoutes)

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;