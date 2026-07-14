import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Please sign in again to continue." });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
}