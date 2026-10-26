import { Router, type RequestHandler } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { Itinerary, Trip } from "../models";

const router = Router();
const style = z.enum([
  "Mixed",
  "Culture",
  "Food",
  "Nature",
  "Adventure",
  "Relaxation",
]);
const createSchema = z
  .object({
    tripId: z.string().refine(Types.ObjectId.isValid).nullable().optional(),
    title: z.string().trim().min(1).max(120),
    destination: z.string().trim().min(1).max(120),
    days: z.number().int().min(1).max(30),
    style: style.default("Mixed"),
    budgetComfort: z
      .enum(["Thoughtful", "Balanced", "Flexible"])
      .default("Balanced"),
    activities: z.array(z.record(z.string(), z.unknown())).max(90).default([]),
  })
  .strict();
const patchSchema = z
  .object({
    id: z.string().refine(Types.ObjectId.isValid),
    title: z.string().trim().min(1).max(120),
  })
  .strict();

router.get("/", (async (req, res) => {
  const filter: Record<string, unknown> = { userId: req.userId };
  if (req.query.tripId) {
    if (!Types.ObjectId.isValid(String(req.query.tripId)))
      return res.status(400).json({ error: "Invalid trip ID." });
    filter.tripId = req.query.tripId;
  }
  const itineraries = await Itinerary.find(filter)
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();
  return res.json({ data: { itineraries } });
}) as RequestHandler);

router.post("/", (async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message ?? "Invalid itinerary." });
  if (
    parsed.data.tripId &&
    !(await Trip.exists({ _id: parsed.data.tripId, userId: req.userId }))
  )
    return res.status(404).json({ error: "Trip not found." });
  const itinerary = await Itinerary.create({
    ...parsed.data,
    tripId: parsed.data.tripId ?? null,
    userId: req.userId,
  });
  return res.status(201).json({ data: { itinerary } });
}) as RequestHandler);

router.patch("/", (async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({
        error: parsed.error.issues[0]?.message ?? "Invalid itinerary update.",
      });
  const { id, title } = parsed.data;
  const itinerary = await Itinerary.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { $set: { title } },
    { new: true, runValidators: true },
  ).lean();
  if (!itinerary)
    return res.status(404).json({ error: "Itinerary not found." });
  return res.json({ data: { itinerary } });
}) as RequestHandler);

router.delete("/", (async (req, res) => {
  const parsed = z
    .object({ id: z.string().refine(Types.ObjectId.isValid) })
    .strict()
    .safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid itinerary ID." });
  const deleted = await Itinerary.findOneAndDelete({
    _id: parsed.data.id,
    userId: req.userId,
  });
  if (!deleted) return res.status(404).json({ error: "Itinerary not found." });
  return res.json({ data: { ok: true } });
}) as RequestHandler);

export default router;
