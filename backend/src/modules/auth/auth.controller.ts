import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.schema";
import { loginUser, registerUser } from "./auth.service";
import { getUserId } from "../../utils/helper";
import { getUserById } from "./auth.service";
import Tokens from "csrf";

const tokens = new Tokens();

function setAuthCookies(res: Response, token: string) {
  const cookieOptions = {
    httpOnly: true,
    // secure: true, // only for production
    sameSite: "strict" as const,
    maxAge: 86400000,
  };

  res.cookie("token", token, cookieOptions);

  const csrfSecret = tokens.secretSync();
  const csrfToken = tokens.create(csrfSecret);

  res.cookie("csrfSecret", csrfSecret, cookieOptions);
  res.cookie("csrfToken", csrfToken, { ...cookieOptions, httpOnly: false });
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: parsed.error.issues });
  }
  try {
    const result = await registerUser(parsed.data);
    setAuthCookies(res, result.token);
    res.status(201).json(result.user);
  } catch (error) {
    res.status(409).json({ error: (error as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed" });
  }

  try {
    const result = await loginUser(parsed.data);
    setAuthCookies(res, result.token);
    res.status(200).json(result.user);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
}

export async function logout(req: Request, res: Response) {
  const clearOptions = {
    httpOnly: true,
    // secure: true, //only for production
    sameSite: "strict" as const,
  };

  res.clearCookie("token", clearOptions);
  res.clearCookie("csrfSecret", clearOptions);
  res.clearCookie("csrfToken", { ...clearOptions, httpOnly: false });

  res.status(200).json({ message: "Logged out" });
}

export async function getMe(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user" });
  }
}