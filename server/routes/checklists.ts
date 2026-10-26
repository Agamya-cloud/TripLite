import { Router, type RequestHandler } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { ChecklistItem, Trip } from "../models";

const router = Router();
const categories = [
  "Documents",
  "Clothing",
  "Electronics",
  "Toiletries",
  "Health",
  "Accessories",
  "Other",
] as const;
const fields = z
  .object({
    tripId: z.string().refine(Types.ObjectId.isValid, "Invalid trip ID."),
    title: z.string().trim().min(1).max(120),
    category: z.enum(categories).default("Other"),
    completed: z.boolean().default(false),
  })
  .strict();
const validId = (id: string) => Types.ObjectId.isValid(id);

router.get("/", (async (req, res) => {
  const tripId = String(req.query.tripId ?? "");
  if (!validId(tripId))
    return res.status(400).json({ error: "A valid trip ID is required." });
  const trip = await Trip.exists({ _id: tripId, userId: req.userId });
  if (!trip) return res.status(404).json({ error: "Trip not found." });
  const items = await ChecklistItem.find({ userId: req.userId, tripId })
    .sort({ createdAt: 1 })
    .lean();
  return res.json({ data: { items } });
}) as RequestHandler);

router.post("/", (async (req, res) => {
  const parsed = fields.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({
        error: parsed.error.issues[0]?.message ?? "Invalid checklist item.",
      });
  const trip = await Trip.exists({
    _id: parsed.data.tripId,
    userId: req.userId,
  });
  if (!trip) return res.status(404).json({ error: "Trip not found." });
  const normalizedTitle = parsed.data.title.toLocaleLowerCase();
  try {
    const item = await ChecklistItem.create({
      ...parsed.data,
      normalizedTitle,
      userId: req.userId,
    });
    return res.status(201).json({ data: { item } });
  } catch (error: any) {
    if (error?.code === 11000)
      return res
        .status(409)
        .json({ error: "That item is already on this trip's checklist." });
    throw error;
  }
}) as RequestHandler);

router.post("/reset", (async (req, res) => {
  const tripId = String(req.query.tripId ?? "");
  if (!validId(tripId))
    return res.status(400).json({ error: "A valid trip ID is required." });
  const trip = await Trip.exists({ _id: tripId, userId: req.userId });
  if (!trip) return res.status(404).json({ error: "Trip not found." });
  const result = await ChecklistItem.updateMany(
    { userId: req.userId, tripId },
    { $set: { completed: false } },
  );
  return res.json({ data: { modified: result.modifiedCount } });
}) as RequestHandler);

router.patch("/:id", (async (req, res) => {
  const id = String(req.params.id);
  if (!validId(id))
    return res.status(400).json({ error: "Invalid checklist item ID." });
  const parsed = z
    .object({
      title: z.string().trim().min(1).max(120).optional(),
      category: z.enum(categories).optional(),
      completed: z.boolean().optional(),
    })
    .strict()
    .refine((body) => Object.keys(body).length > 0)
    .safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({
        error: parsed.error.issues[0]?.message ?? "Invalid checklist update.",
      });
  const update = {
    ...parsed.data,
    ...(parsed.data.title
      ? { normalizedTitle: parsed.data.title.toLocaleLowerCase() }
      : {}),
  };
  try {
    const item = await ChecklistItem.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: update },
      { new: true, runValidators: true },
    ).lean();
    if (!item)
      return res.status(404).json({ error: "Checklist item not found." });
    return res.json({ data: { item } });
  } catch (error: any) {
    if (error?.code === 11000)
      return res
        .status(409)
        .json({ error: "That item is already on this trip's checklist." });
    throw error;
  }
}) as RequestHandler);

router.delete("/:id", (async (req, res) => {
  const id = String(req.params.id);
  if (!validId(id))
    return res.status(400).json({ error: "Invalid checklist item ID." });
  const item = await ChecklistItem.findOneAndDelete({
    _id: id,
    userId: req.userId,
  });
  if (!item)
    return res.status(404).json({ error: "Checklist item not found." });
  return res.json({ data: { ok: true } });
}) as RequestHandler);

export default router;
