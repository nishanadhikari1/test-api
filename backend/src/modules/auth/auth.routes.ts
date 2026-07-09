import { Router } from "express";
import {register, login, logout} from './auth.controller'
import { getMe } from "./auth.controller";
import authMiddleware from "../../middleware/auth.middleware";

const router = Router()


router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authMiddleware, getMe);

export default router;