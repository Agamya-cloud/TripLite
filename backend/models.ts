import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

const tripSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    destination: { type: String, required: true, trim: true, maxlength: 120 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    travellers: { type: Number, required: true, min: 1, max: 30, default: 1 },
    travelStyle: {
      type: String,
      enum: ["Mixed", "Culture", "Food", "Nature", "Adventure", "Relaxation"],
      default: "Mixed",
    },
    budget: { type: Number, min: 0, default: 0 },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY"],
      default: "USD",
    },
    categoryAllocations: { type: Schema.Types.Mixed, default: {} },
    notes: { type: String, trim: true, maxlength: 3000, default: "" },
  },
  { timestamps: true },
);
tripSchema.index({ userId: 1, startDate: 1 });

const expenseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    description: { type: String, required: true, trim: true, maxlength: 180 },
    amount: { type: Number, required: true, min: 0.01 },
    category: {
      type: String,
      required: true,
      enum: [
        "Transport",
        "Accommodation",
        "Food",
        "Activities and sightseeing",
        "Shopping",
        "Visa and documents",
        "Health and emergencies",
        "Other",
      ],
    },
    date: { type: Date, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "Cash",
        "Credit card",
        "Debit card",
        "Digital wallet",
        "Bank transfer",
        "Other",
      ],
      default: "Other",
    },
  },
  { timestamps: true },
);
expenseSchema.index({ userId: 1, tripId: 1, date: -1 });

const checklistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    normalizedTitle: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Documents",
        "Clothing",
        "Electronics",
        "Toiletries",
        "Health",
        "Accessories",
        "Other",
      ],
      default: "Other",
    },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
);
checklistSchema.index(
  { userId: 1, tripId: 1, normalizedTitle: 1 },
  { unique: true },
);

const itinerarySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", default: null },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    destination: { type: String, required: true, trim: true, maxlength: 120 },
    days: { type: Number, required: true, min: 1, max: 30 },
    style: {
      type: String,
      enum: ["Mixed", "Culture", "Food", "Nature", "Adventure", "Relaxation"],
      default: "Mixed",
    },
    budgetComfort: {
      type: String,
      enum: ["Thoughtful", "Balanced", "Flexible"],
      default: "Balanced",
    },
    startTime: { type: String, trim: true, maxlength: 20, default: "8:30 AM" },
    interests: { type: String, trim: true, maxlength: 300, default: "" },
    activities: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true },
);
itinerarySchema.index({ userId: 1, updatedAt: -1 });

const model = (name: string, schema: Schema) =>
  (mongoose.models[name] as mongoose.Model<any> | undefined) ??
  mongoose.model<any>(name, schema);

export const User = model("User", userSchema);
export const Trip = model("Trip", tripSchema);
export const Expense = model("Expense", expenseSchema);
export const ChecklistItem = model("ChecklistItem", checklistSchema);
export const Itinerary = model("Itinerary", itinerarySchema);
