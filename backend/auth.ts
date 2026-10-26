import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

const cookieName = "triplite_session";

export function getJwtSecret() {
  return process.env.JWT_SECRET;
}

export function setSessionCookie(
  res: import("express").Response,
  userId: string,
) {
  const secret = getJwtSecret();
  if (!secret) throw new Error("JWT_SECRET is not configured");
  const token = jwt.sign({ sub: userId }, secret, {
    expiresIn: "7d",
    issuer: "triplite",
  });
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api",
  });
}

export const clearSessionCookie = (res: import("express").Response) => {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api",
  });
};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const secret = getJwtSecret();
  if (!secret)
    return res
      .status(503)
      .json({ error: "Authentication is not configured on this server." });
  const token = req.cookies?.[cookieName];
  if (!token)
    return res.status(401).json({ error: "Please sign in to continue." });
  try {
    const payload = jwt.verify(token, secret, { issuer: "triplite" });
    if (typeof payload === "string" || typeof payload.sub !== "string")
      return res
        .status(401)
        .json({ error: "Your session is invalid. Please sign in again." });
    req.userId = payload.sub;
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Your session has expired. Please sign in again." });
  }
};
