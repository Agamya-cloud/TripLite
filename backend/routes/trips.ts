import { Router, type RequestHandler } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { Expense, ChecklistItem, Itinerary, Trip } from "../models";

const router = Router();
const date = z.string().datetime().or(z.string().date());
const tripBaseFields = z
  .object({
    name: z.string().trim().min(1).max(100),
    destination: z.string().trim().min(1).max(120),
    startDate: date,
    endDate: date,
    travellers: z.number().int().min(1).max(30).default(1),
    travelStyle: z
      .enum(["Mixed", "Culture", "Food", "Nature", "Adventure", "Relaxation"])
      .default("Mixed"),
    budget: z.number().finite().min(0).default(0),
    currency: z
      .enum(["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY"])
      .default("USD"),
    categoryAllocations: z
      .record(z.string(), z.number().finite().min(0))
      .optional(),
    notes: z.string().trim().max(3000).default(""),
  })
  .strict();
const tripFields = tripBaseFields.refine(
  (value) =>
    new Date(value.endDate).getTime() >= new Date(value.startDate).getTime(),
  {
    message: "Return date must be on or after departure date.",
    path: ["endDate"],
  },
);
const updateFields = tripBaseFields.partial();
const isObjectId = (value: string) => Types.ObjectId.isValid(value);

router.get("/", (async (req, res) => {
  const page = Math.max(
    1,
    Number.parseInt(String(req.query.page ?? "1"), 10) || 1,
  );
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(String(req.query.limit ?? "100"), 10) || 100),
  );
  const [trips, total] = await Promise.all([
    Trip.find({ userId: req.userId })
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Trip.countDocuments({ userId: req.userId }),
  ]);
  return res.json({ data: { trips, page, limit, total } });
}) as RequestHandler);

router.post("/", (async (req, res) => {
  const parsed = tripFields.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "Invalid trip details.",
    });
  const trip = await Trip.create({ ...parsed.data, userId: req.userId });
  return res.status(201).json({ data: { trip } });
}) as RequestHandler);

router.get("/:id", (async (req, res) => {
  const id = String(req.params.id);
  if (!isObjectId(id))
    return res.status(400).json({ error: "Invalid trip ID." });
  const trip = await Trip.findOne({ _id: id, userId: req.userId }).lean();
  if (!trip) return res.status(404).json({ error: "Trip not found." });
  return res.json({ data: { trip } });
}) as RequestHandler);

router.patch("/:id", (async (req, res) => {
  const id = String(req.params.id);
  if (!isObjectId(id))
    return res.status(400).json({ error: "Invalid trip ID." });
  const parsed = updateFields.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "Invalid trip details.",
    });
  if (!Object.keys(parsed.data).length)
    return res
      .status(400)
      .json({ error: "Provide at least one trip field to update." });
  const current = await Trip.findOne({ _id: id, userId: req.userId });
  if (!current) return res.status(404).json({ error: "Trip not found." });
  const startDate = parsed.data.startDate
    ? new Date(parsed.data.startDate)
    : current.startDate;
  const endDate = parsed.data.endDate
    ? new Date(parsed.data.endDate)
    : current.endDate;
  if (endDate < startDate)
    return res
      .status(400)
      .json({ error: "Return date must be on or after departure date." });
  Object.assign(current, parsed.data);
  await current.save();
  return res.json({ data: { trip: current } });
}) as RequestHandler);

router.delete("/:id", (async (req, res) => {
  const id = String(req.params.id);
  if (!isObjectId(id))
    return res.status(400).json({ error: "Invalid trip ID." });
  const trip = await Trip.findOne({ _id: id, userId: req.userId });
  if (!trip) return res.status(404).json({ error: "Trip not found." });
  await Promise.all([
    Expense.deleteMany({ userId: req.userId, tripId: trip._id }),
    ChecklistItem.deleteMany({ userId: req.userId, tripId: trip._id }),
    Itinerary.deleteMany({ userId: req.userId, tripId: trip._id }),
  ]);
  await trip.deleteOne();
  return res.json({ data: { ok: true } });
}) as RequestHandler);

export default router;
