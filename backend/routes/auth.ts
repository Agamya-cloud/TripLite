import { Router, type RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { clearSessionCookie, requireAuth, setSessionCookie } from "../auth";
import { User } from "../models";

const router = Router();
const credentials = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
});
const registerSchema = credentials.extend({
  name: z.string().trim().min(1).max(80),
});
const safeUser = (user: any) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
});

router.post("/register", (async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({
        error:
          parsed.error.issues[0]?.message ?? "Invalid registration details.",
      });
  if (!process.env.JWT_SECRET)
    return res
      .status(503)
      .json({ error: "Authentication is not configured on this server." });
  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({ ...parsed.data, passwordHash });
    setSessionCookie(res, String(user._id));
    return res.status(201).json({ data: { user: safeUser(user) } });
  } catch (error: any) {
    if (error?.code === 11000)
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    throw error;
  }
}) as RequestHandler);

router.post("/login", (async (req, res) => {
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Enter a valid email and password." });
  if (!process.env.JWT_SECRET)
    return res
      .status(503)
      .json({ error: "Authentication is not configured on this server." });
  const user = await User.findOne({ email: parsed.data.email }).select(
    "+passwordHash",
  );
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash)))
    return res.status(401).json({ error: "Email or password is incorrect." });
  setSessionCookie(res, String(user._id));
  return res.json({ data: { user: safeUser(user) } });
}) as RequestHandler);

router.get("/me", requireAuth, (async (req, res) => {
  const user = await User.findById(req.userId).select("name email").lean();
  if (!user)
    return res
      .status(401)
      .json({
        error: "Your account is no longer available. Please sign in again.",
      });
  return res.json({
    data: {
      user: { id: String(user._id), name: user.name, email: user.email },
    },
  });
}) as RequestHandler);

router.patch("/me", requireAuth, (async (req, res) => {
  const parsed = z
    .object({ name: z.string().trim().min(1).max(80) })
    .strict()
    .safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({
        error: parsed.error.issues[0]?.message ?? "Invalid profile details.",
      });
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: { name: parsed.data.name } },
    { new: true, runValidators: true },
  )
    .select("name email")
    .lean();
  if (!user) return res.status(404).json({ error: "Account not found." });
  return res.json({
    data: {
      user: { id: String(user._id), name: user.name, email: user.email },
    },
  });
}) as RequestHandler);

router.post("/logout", (req, res) => {
  clearSessionCookie(res);
  return res.json({ data: { ok: true } });
});

export default router;
