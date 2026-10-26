import { Router, type RequestHandler } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { Expense, Trip } from "../models";

const router = Router();
const categories = [
  "Transport",
  "Accommodation",
  "Food",
  "Activities and sightseeing",
  "Shopping",
  "Visa and documents",
  "Health and emergencies",
  "Other",
] as const;
const methods = [
  "Cash",
  "Credit card",
  "Debit card",
  "Digital wallet",
  "Bank transfer",
  "Other",
] as const;
const date = z.string().datetime().or(z.string().date());
const fields = z
  .object({
    tripId: z.string().refine(Types.ObjectId.isValid, "Invalid trip ID."),
    description: z.string().trim().min(1).max(180),
    amount: z.number().finite().positive().max(100000000),
    category: z.enum(categories),
    date,
    paymentMethod: z.enum(methods).default("Other"),
  })
  .strict();
const patch = fields.partial();

router.get("/", (async (req, res) => {
  const filter: any = { userId: req.userId };
  if (req.query.tripId) {
    if (!Types.ObjectId.isValid(String(req.query.tripId)))
      return res.status(400).json({ error: "Invalid trip ID." });
    filter.tripId = req.query.tripId;
  }
  if (req.query.category) {
    if (
      !categories.includes(
        String(req.query.category) as (typeof categories)[number],
      )
    )
      return res.status(400).json({ error: "Invalid expense category." });
    filter.category = req.query.category;
  }
  if (req.query.from || req.query.to) {
    const range: Record<string, Date> = {};
    if (req.query.from) {
      const from = new Date(String(req.query.from));
      if (Number.isNaN(from.getTime()))
        return res.status(400).json({ error: "Invalid start date." });
      range.$gte = from;
    }
    if (req.query.to) {
      const to = new Date(String(req.query.to));
      if (Number.isNaN(to.getTime()))
        return res.status(400).json({ error: "Invalid end date." });
      range.$lte = to;
    }
    filter.date = range;
  }
  const page = Math.max(
    1,
    Number.parseInt(String(req.query.page ?? "1"), 10) || 1,
  );
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(String(req.query.limit ?? "100"), 10) || 100),
  );
  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Expense.countDocuments(filter),
  ]);
  return res.json({ data: { expenses, page, limit, total } });
}) as RequestHandler);

router.post("/", (async (req, res) => {
  const parsed = fields.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({
        error: parsed.error.issues[0]?.message ?? "Invalid expense details.",
      });
  const trip = await Trip.exists({
    _id: parsed.data.tripId,
    userId: req.userId,
  });
  if (!trip) return res.status(404).json({ error: "Trip not found." });
  const expense = await Expense.create({
    ...parsed.data,
    date: new Date(parsed.data.date),
    userId: req.userId,
  });
  return res.status(201).json({ data: { expense } });
}) as RequestHandler);

router.patch("/:id", (async (req, res) => {
  const id = String(req.params.id);
  if (!Types.ObjectId.isValid(id))
    return res.status(400).json({ error: "Invalid expense ID." });
  const parsed = patch.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({
        error: parsed.error.issues[0]?.message ?? "Invalid expense details.",
      });
  if (!Object.keys(parsed.data).length)
    return res
      .status(400)
      .json({ error: "Provide at least one expense field to update." });
  if (
    parsed.data.tripId &&
    !(await Trip.exists({ _id: parsed.data.tripId, userId: req.userId }))
  )
    return res.status(404).json({ error: "Trip not found." });
  const update = {
    ...parsed.data,
    ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}),
  };
  const expense = await Expense.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { $set: update },
    { new: true, runValidators: true },
  ).lean();
  if (!expense) return res.status(404).json({ error: "Expense not found." });
  return res.json({ data: { expense } });
}) as RequestHandler);

router.delete("/:id", (async (req, res) => {
  const id = String(req.params.id);
  if (!Types.ObjectId.isValid(id))
    return res.status(400).json({ error: "Invalid expense ID." });
  const deleted = await Expense.findOneAndDelete({
    _id: id,
    userId: req.userId,
  });
  if (!deleted) return res.status(404).json({ error: "Expense not found." });
  return res.json({ data: { ok: true } });
}) as RequestHandler);

export default router;
