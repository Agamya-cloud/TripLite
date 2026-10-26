import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useParams,
} from "react-router-dom";
import {
  api,
  idOf,
  json,
  labelOf,
  money,
  records,
  RecordData,
} from "@/lib/triplite-api";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Compass,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

const input =
  "h-10 w-full rounded-xl border border-[#e5e4dc] bg-[#fcfbf8] px-3 text-[12px] text-[#34564b] outline-none focus:border-[#4d8d7d] focus:ring-2 focus:ring-[#4d8d7d]/10";
const button =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#174f47] px-4 text-[11px] font-bold text-white transition hover:bg-[#216257] disabled:cursor-not-allowed disabled:opacity-50";
const softButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#e5e4dc] bg-white px-3 text-[10px] font-semibold text-[#456458] hover:bg-[#f5f5ef]";
const panel = "rounded-2xl border border-[#e9e6de] bg-white/85 p-5 sm:p-6";
const titleClass =
  "font-heading text-[29px] font-bold tracking-[-.05em] text-[#173d35]";
const expenseCategories = [
  "Transport",
  "Accommodation",
  "Food",
  "Activities and sightseeing",
  "Shopping",
  "Visa and documents",
  "Health and emergencies",
  "Other",
];
const paymentMethods = [
  "Cash",
  "Credit card",
  "Debit card",
  "Digital wallet",
  "Bank transfer",
  "Other",
];
const checklistCategories = [
  "Documents",
  "Clothing",
  "Electronics",
  "Toiletries",
  "Health",
  "Accessories",
  "Other",
];
const budgetCategories = [
  "Transportation",
  "Accommodation",
  "Food",
  "Activities",
  "Shopping",
  "Emergency reserve",
  "Other",
];
const essentials: { title: string; category: string }[] = [
  { title: "Government ID / passport", category: "Documents" },
  { title: "Tickets and travel confirmations", category: "Documents" },
  { title: "Accommodation booking details", category: "Documents" },
  { title: "Wallet and payment cards", category: "Accessories" },
  { title: "Cash", category: "Accessories" },
  { title: "Mobile phone", category: "Electronics" },
  { title: "Phone charger", category: "Electronics" },
  { title: "Power bank", category: "Electronics" },
  { title: "Headphones", category: "Electronics" },
  { title: "Clothing", category: "Clothing" },
  { title: "Comfortable footwear", category: "Clothing" },
  { title: "Sleepwear", category: "Clothing" },
  { title: "Toiletries", category: "Toiletries" },
  { title: "Toothbrush and toothpaste", category: "Toiletries" },
  { title: "Skincare and sunscreen", category: "Toiletries" },
  { title: "Personal medicines", category: "Health" },
  { title: "Basic first-aid supplies", category: "Health" },
  { title: "Reusable water bottle", category: "Accessories" },
  { title: "Travel bag and luggage essentials", category: "Accessories" },
];
function PageHeading({
  eyebrow,
  title,
  note,
  action,
}: {
  eyebrow: string;
  title: string;
  note?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#628273]">
          {eyebrow}
        </p>
        <h1 className={titleClass}>{title}</h1>
        {note && <p className="mt-1.5 text-[12px] text-[#80877d]">{note}</p>}
      </div>
      {action}
    </div>
  );
}
function ErrorBox({ error, retry }: { error: string; retry?: () => void }) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#f0d3c8] bg-[#fff7f3] p-3 text-[11px] text-[#9a4e39]"
    >
      <span className="flex items-center gap-2">
        <AlertCircle size={15} />
        {error}
      </span>
      {retry && (
        <button className="underline" onClick={retry}>
          Retry
        </button>
      )}
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[#dedfd5] bg-[#fbfaf7] px-4 py-9 text-center text-[12px] text-[#858b80]">
      {children}
    </div>
  );
}
const tripName = (trip: RecordData) => labelOf(trip) || "Untitled trip";
const expenseTripId = (expense: RecordData) => String(expense.tripId ?? "");
const currencyOf = (trip?: RecordData) => String(trip?.currency || "USD");
const tripCurrency = (trips: RecordData[], tripId: string) =>
  currencyOf(trips.find((t) => idOf(t) === tripId));
const expenseBudgetCategory: Record<string, string> = {
  Transport: "Transportation",
  Accommodation: "Accommodation",
  Food: "Food",
  "Activities and sightseeing": "Activities",
  Shopping: "Shopping",
  "Health and emergencies": "Emergency reserve",
  "Visa and documents": "Other",
  Other: "Other",
};

export function TripsPage() {
  const [params] = useSearchParams();
  const [trips, setTrips] = useState<RecordData[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [destination, setDestination] = useState(
    params.get("destination") ?? "",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travellers, setTravellers] = useState("");
  const [travelStyle, setTravelStyle] = useState("Mixed");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      setTrips(records(await api("/api/trips")));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || endDate < startDate) {
      setError("Choose a valid trip date range.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api(
        "/api/trips",
        json("POST", {
          name: name.trim(),
          destination: destination.trim(),
          startDate,
          endDate,
          travellers: travellers ? Number(travellers) : undefined,
          travelStyle,
          budget: budget ? Number(budget) : undefined,
          currency,
          notes: notes.trim() || undefined,
          categoryAllocations: {},
        }),
      );
      setName("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setTravellers("");
      setBudget("");
      setNotes("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeading
        eyebrow="YOUR JOURNEYS"
        title="Trips"
        note="Create trips with the key dates, budget, and travel details."
      />
      {error && <ErrorBox error={error} retry={() => void load()} />}
      <div className="grid items-start gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <form onSubmit={create} className={panel}>
          <h2 className="mb-4 font-heading text-[17px] font-bold">
            Plan a trip
          </h2>
          <div className="space-y-3">
            <label className="block text-[10px] font-bold">
              Trip name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${input} mt-1.5`}
                placeholder="A week by the sea"
              />
            </label>
            <label className="block text-[10px] font-bold">
              Destination
              <input
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className={`${input} mt-1.5`}
                placeholder="Lisbon, Portugal"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] font-bold">
                Start date
                <input
                  required
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`${input} mt-1.5`}
                />
              </label>
              <label className="text-[10px] font-bold">
                End date
                <input
                  required
                  min={startDate || undefined}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`${input} mt-1.5`}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] font-bold">
                Travellers
                <input
                  type="number"
                  min="1"
                  value={travellers}
                  onChange={(e) => setTravellers(e.target.value)}
                  className={`${input} mt-1.5`}
                  placeholder="Optional"
                />
              </label>
              <label className="text-[10px] font-bold">
                Travel style
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className={`${input} mt-1.5`}
                >
                  {[
                    "Mixed",
                    "Culture",
                    "Food",
                    "Nature",
                    "Adventure",
                    "Relaxation",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-[1fr_100px] gap-2">
              <label className="text-[10px] font-bold">
                Budget
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={`${input} mt-1.5`}
                  placeholder="Optional"
                />
              </label>
              <label className="text-[10px] font-bold">
                Currency
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`${input} mt-1.5`}
                >
                  {["USD", "EUR", "GBP", "CAD", "AUD", "JPY"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-[10px] font-bold">
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 min-h-20 w-full rounded-xl border border-[#e5e4dc] bg-[#fcfbf8] p-3 text-[12px] outline-none focus:border-[#4d8d7d]"
                placeholder="Anything to remember…"
              />
            </label>
            <button className={`${button} w-full`} disabled={saving}>
              <Plus size={14} />
              {saving ? "Saving…" : "Create trip"}
            </button>
          </div>
        </form>
        <section className={panel}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-[17px] font-bold">Your trips</h2>
            <span className="rounded-full bg-[#edf2ed] px-2.5 py-1 text-[10px] font-bold text-[#397260]">
              {trips.length}
            </span>
          </div>
          {loading ? (
            <p className="text-sm text-[#858b80]">Loading trips…</p>
          ) : trips.length ? (
            <div className="space-y-2">
              {trips.map((t) => (
                <Link
                  key={idOf(t)}
                  to={`/trips/${encodeURIComponent(idOf(t))}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#efeee8] p-4 transition hover:border-[#b9cfc2] hover:bg-[#fbfcf9]"
                >
                  <div>
                    <h3 className="text-[13px] font-bold">{tripName(t)}</h3>
                    <p className="mt-1 text-[10px] text-[#858b80]">
                      {t.destination} · {String(t.startDate).slice(0, 10)} –{" "}
                      {String(t.endDate).slice(0, 10)}
                    </p>
                  </div>
                  <span className="text-right text-[10px] font-semibold text-[#5c8b7d]">
                    {t.budget ? money(t.budget, currencyOf(t)) : ""}{" "}
                    {currencyOf(t)}
                    <ArrowRight size={15} className="ml-2 inline" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <Empty>
              Your saved trips will appear here once you create one.
            </Empty>
          )}
        </section>
      </div>
    </div>
  );
}

export function TripDetailPage() {
  const { tripId = "" } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<RecordData | null>(null);
  const [draft, setDraft] = useState<RecordData>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      const value = await api<any>(`/api/trips/${encodeURIComponent(tripId)}`);
      const item = value?.trip ?? value;
      setTrip(item);
      setDraft({
        name: item.name ?? "",
        destination: item.destination ?? "",
        startDate: String(item.startDate ?? "").slice(0, 10),
        endDate: String(item.endDate ?? "").slice(0, 10),
        travellers: item.travellers ?? "",
        travelStyle: item.travelStyle ?? "Mixed",
        budget: item.budget ?? "",
        currency: item.currency ?? "USD",
        notes: item.notes ?? "",
        categoryAllocations: item.categoryAllocations ?? {},
      });
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    void load();
  }, [tripId]);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (draft.endDate < draft.startDate) {
      setError("End date must be on or after the start date.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...draft,
        travellers: draft.travellers ? Number(draft.travellers) : undefined,
        budget: draft.budget === "" ? undefined : Number(draft.budget),
      };
      const value = await api<any>(
        `/api/trips/${encodeURIComponent(tripId)}`,
        json("PATCH", payload),
      );
      const item = value?.trip ?? value ?? { ...trip, ...payload };
      setTrip(item);
      setDraft({ ...draft });
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!window.confirm("Delete this trip and its saved details?")) return;
    setBusy(true);
    try {
      await api(`/api/trips/${encodeURIComponent(tripId)}`, {
        method: "DELETE",
      });
      navigate("/trips");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };
  if (!trip && !error)
    return <p className="text-sm text-[#858b80]">Loading trip…</p>;
  return (
    <div className="mx-auto max-w-[1050px]">
      <Link
        to="/trips"
        className="mb-4 inline-flex text-[11px] font-semibold text-[#668075] hover:underline"
      >
        ← All trips
      </Link>
      {error && <ErrorBox error={error} retry={() => void load()} />}
      {trip && (
        <>
          <PageHeading
            eyebrow="TRIP DETAILS"
            title={tripName(trip)}
            note={`${trip.destination} · ${String(trip.startDate).slice(0, 10)} – ${String(trip.endDate).slice(0, 10)}`}
          />
          <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
            <form className={panel} onSubmit={save}>
              <h2 className="mb-4 font-heading text-[17px] font-bold">
                Trip information
              </h2>
              <div className="space-y-3">
                <label className="block text-[10px] font-bold">
                  Name
                  <input
                    required
                    className={`${input} mt-1.5`}
                    value={draft.name ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </label>
                <label className="block text-[10px] font-bold">
                  Destination
                  <input
                    required
                    className={`${input} mt-1.5`}
                    value={draft.destination ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, destination: e.target.value })
                    }
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[10px] font-bold">
                    Start date
                    <input
                      required
                      type="date"
                      className={`${input} mt-1.5`}
                      value={draft.startDate ?? ""}
                      onChange={(e) =>
                        setDraft({ ...draft, startDate: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-[10px] font-bold">
                    End date
                    <input
                      required
                      type="date"
                      min={draft.startDate || undefined}
                      className={`${input} mt-1.5`}
                      value={draft.endDate ?? ""}
                      onChange={(e) =>
                        setDraft({ ...draft, endDate: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[10px] font-bold">
                    Travellers
                    <input
                      type="number"
                      min="1"
                      className={`${input} mt-1.5`}
                      value={draft.travellers ?? ""}
                      onChange={(e) =>
                        setDraft({ ...draft, travellers: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-[10px] font-bold">
                    Travel style
                    <select
                      className={`${input} mt-1.5`}
                      value={draft.travelStyle ?? "Mixed"}
                      onChange={(e) =>
                        setDraft({ ...draft, travelStyle: e.target.value })
                      }
                    >
                      {[
                        "Mixed",
                        "Culture",
                        "Food",
                        "Nature",
                        "Adventure",
                        "Relaxation",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-[1fr_100px] gap-2">
                  <label className="text-[10px] font-bold">
                    Budget
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={`${input} mt-1.5`}
                      value={draft.budget ?? ""}
                      onChange={(e) =>
                        setDraft({ ...draft, budget: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-[10px] font-bold">
                    Currency
                    <select
                      className={`${input} mt-1.5`}
                      value={draft.currency ?? "USD"}
                      onChange={(e) =>
                        setDraft({ ...draft, currency: e.target.value })
                      }
                    >
                      {["USD", "EUR", "GBP", "CAD", "AUD", "JPY"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block text-[10px] font-bold">
                  Notes
                  <textarea
                    className="mt-1.5 min-h-20 w-full rounded-xl border border-[#e5e4dc] bg-[#fcfbf8] p-3 text-[12px] outline-none focus:border-[#4d8d7d]"
                    value={draft.notes ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, notes: e.target.value })
                    }
                  />
                </label>
                <button className={button} disabled={busy}>
                  {busy ? "Saving…" : "Save trip details"}
                </button>
                <button
                  type="button"
                  onClick={() => void remove()}
                  className="ml-3 inline-flex items-center gap-2 text-[11px] font-semibold text-[#a7513c] hover:underline"
                >
                  <Trash2 size={14} />
                  Delete trip
                </button>
              </div>
            </form>
            <section className={`${panel} space-y-3`}>
              <h2 className="font-heading text-[17px] font-bold">Trip tools</h2>
              <Link
                className="block rounded-xl bg-[#f4f5ef] p-4 text-[12px] font-bold hover:bg-[#eaf0e9]"
                to={`/expenses?tripId=${encodeURIComponent(tripId)}`}
              >
                Expenses <span className="float-right">→</span>
              </Link>
              <Link
                className="block rounded-xl bg-[#f4f5ef] p-4 text-[12px] font-bold hover:bg-[#eaf0e9]"
                to={`/checklist?tripId=${encodeURIComponent(tripId)}`}
              >
                Packing checklist <span className="float-right">→</span>
              </Link>
              <Link
                className="block rounded-xl bg-[#f4f5ef] p-4 text-[12px] font-bold hover:bg-[#eaf0e9]"
                to={`/budget?tripId=${encodeURIComponent(tripId)}`}
              >
                Budget planner <span className="float-right">→</span>
              </Link>
              <Link
                className="block rounded-xl bg-[#f4f5ef] p-4 text-[12px] font-bold hover:bg-[#eaf0e9]"
                to={`/itinerary?tripId=${encodeURIComponent(tripId)}&destination=${encodeURIComponent(trip.destination ?? "")}`}
              >
                Build an itinerary <span className="float-right">→</span>
              </Link>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export function ExpensesPage() {
  const [params, setParams] = useSearchParams();
  const [expenses, setExpenses] = useState<RecordData[]>([]);
  const [trips, setTrips] = useState<RecordData[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tripFilter, setTripFilter] = useState(params.get("tripId") ?? "");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("date-desc");
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [form, setForm] = useState<RecordData>({
    description: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "Cash",
    tripId: params.get("tripId") ?? "",
  });
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      const [ex, tr] = await Promise.all([
        api("/api/expenses"),
        api("/api/trips"),
      ]);
      setExpenses(records(ex));
      setTrips(records(tr));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const visible = useMemo(
    () =>
      expenses
        .filter(
          (x) =>
            (!tripFilter || expenseTripId(x) === tripFilter) &&
            (category === "All" || x.category === category) &&
            (!fromDate || String(x.date).slice(0, 10) >= fromDate) &&
            (!toDate || String(x.date).slice(0, 10) <= toDate) &&
            `${x.description ?? ""} ${x.category ?? ""} ${x.paymentMethod ?? ""}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "amount-desc"
            ? Number(b.amount) - Number(a.amount)
            : sort === "amount-asc"
              ? Number(a.amount) - Number(b.amount)
              : sort === "date-asc"
                ? String(a.date).localeCompare(String(b.date))
                : String(b.date).localeCompare(String(a.date)),
        ),
    [expenses, tripFilter, category, fromDate, toDate, search, sort],
  );
  const summaries = useMemo(() => {
    const acc: Record<string, Record<string, number>> = {};
    visible.forEach((x) => {
      const linkedTrip = trips.find((trip) => idOf(trip) === expenseTripId(x));
      const c = linkedTrip ? currencyOf(linkedTrip) : "Currency unknown";
      const cat = x.category || "Other";
      acc[cat] ??= {};
      acc[cat][c] = (acc[cat][c] ?? 0) + Number(x.amount || 0);
    });
    return acc;
  }, [visible, trips]);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        tripId: String(form.tripId),
      };
      if (editing)
        await api(
          `/api/expenses/${encodeURIComponent(idOf(editing))}`,
          json("PATCH", payload),
        );
      else await api("/api/expenses", json("POST", payload));
      setEditing(null);
      setForm({
        description: "",
        amount: "",
        category: "Food",
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: "Cash",
        tripId: tripFilter,
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  const edit = (item: RecordData) => {
    setEditing(item);
    setForm({
      description: item.description ?? "",
      amount: item.amount ?? "",
      category: item.category ?? "Other",
      date: String(item.date ?? "").slice(0, 10),
      paymentMethod: item.paymentMethod ?? "Other",
      tripId: expenseTripId(item),
    });
  };
  const remove = async (item: RecordData) => {
    if (!window.confirm(`Delete expense “${item.description}”?`)) return;
    try {
      await api(`/api/expenses/${encodeURIComponent(idOf(item))}`, {
        method: "DELETE",
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeading
        eyebrow="SPENDING, WITHOUT THE SPREADSHEET"
        title="Expenses"
        note="Track actual spending with clear categories and dates."
        action={
          <Link to="/budget" className={softButton}>
            Open budget planner →
          </Link>
        }
      />
      {error && <ErrorBox error={error} retry={() => void load()} />}
      <div className="grid items-start gap-5 lg:grid-cols-[.72fr_1.28fr]">
        <form onSubmit={save} className={panel}>
          <h2 className="mb-4 font-heading text-[17px] font-bold">
            {editing ? "Edit expense" : "Add an expense"}
          </h2>
          <div className="space-y-3">
            <label className="block text-[10px] font-bold">
              Trip
              <select
                required
                value={form.tripId}
                onChange={(e) => setForm({ ...form, tripId: e.target.value })}
                className={`${input} mt-1.5`}
              >
                <option value="">Choose trip…</option>
                {trips.map((t) => (
                  <option key={idOf(t)} value={idOf(t)}>
                    {tripName(t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[10px] font-bold">
              Description
              <input
                required
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className={`${input} mt-1.5`}
                placeholder="Train tickets"
              />
            </label>
            <label className="block text-[10px] font-bold">
              Amount
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={`${input} mt-1.5`}
              />
            </label>
            <label className="block text-[10px] font-bold">
              Category
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`${input} mt-1.5`}
              >
                {expenseCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] font-bold">
                Date
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={`${input} mt-1.5`}
                />
              </label>
              <label className="text-[10px] font-bold">
                Payment method
                <select
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({ ...form, paymentMethod: e.target.value })
                  }
                  className={`${input} mt-1.5`}
                >
                  {paymentMethods.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <button className={`${button} w-full`} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add expense"}
            </button>
            {editing && (
              <button
                type="button"
                className={`${softButton} w-full`}
                onClick={() => setEditing(null)}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
        <section className={panel}>
          <h2 className="mb-3 font-heading text-[17px] font-bold">
            Your spending
          </h2>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <label className="relative sm:col-span-2 xl:col-span-1">
              <Search
                size={14}
                className="absolute left-3 top-3 text-[#92968b]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${input} pl-9`}
                placeholder="Search description, category"
              />
            </label>
            <select
              value={tripFilter}
              onChange={(e) => {
                setTripFilter(e.target.value);
                setParams(e.target.value ? { tripId: e.target.value } : {});
              }}
              className={input}
            >
              <option value="">All trips</option>
              {trips.map((t) => (
                <option key={idOf(t)} value={idOf(t)}>
                  {tripName(t)}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={input}
            >
              <option>All</option>
              {expenseCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <label className="text-[9px] font-bold text-[#728176]">
              From
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={`${input} mt-1`}
              />
            </label>
            <label className="text-[9px] font-bold text-[#728176]">
              To
              <input
                type="date"
                min={fromDate || undefined}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={`${input} mt-1`}
              />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={input}
            >
              <option value="date-desc">Newest date</option>
              <option value="date-asc">Oldest date</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
            </select>
          </div>
          <div className="mb-4 rounded-xl bg-[#f4f5ef] p-3">
            <p className="mb-2 text-[10px] font-bold">
              Category summaries · grouped by trip currency
            </p>
            <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
              {expenseCategories
                .filter((c) => summaries[c])
                .map((c) => (
                  <p
                    key={c}
                    className="flex justify-between gap-2 text-[9px] text-[#728176]"
                  >
                    <span>{c}</span>
                    <span className="text-right">
                      {Object.entries(summaries[c])
                        .map(([cur, total]) =>
                          cur === "Currency unknown"
                            ? `${total.toLocaleString()} · currency unknown`
                            : `${money(total, cur)} ${cur}`,
                        )
                        .join(" · ")}
                    </span>
                  </p>
                ))}
            </div>
          </div>
          {visible.length ? (
            <div className="divide-y divide-[#f0eee8]">
              {visible.map((item) => {
                const trip = trips.find((t) => idOf(t) === expenseTripId(item));
                return (
                  <article
                    key={idOf(item)}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold">
                        {item.description}
                      </p>
                      <p className="mt-1 text-[9px] text-[#91978c]">
                        {item.category} · {String(item.date).slice(0, 10)} ·{" "}
                        {item.paymentMethod || "Payment unspecified"} ·{" "}
                        {tripName(trip ?? {})}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <b className="text-[12px]">
                        {trip
                          ? `${money(item.amount, currencyOf(trip))} ${currencyOf(trip)}`
                          : `${Number(item.amount).toLocaleString()} · currency unknown`}
                      </b>
                      <button onClick={() => edit(item)} className={softButton}>
                        Edit
                      </button>
                      <button
                        aria-label="Delete expense"
                        onClick={() => void remove(item)}
                        className="text-[#a7513c]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <Empty>No expenses match these filters.</Empty>
          )}
        </section>
      </div>
    </div>
  );
}

export function ChecklistPage() {
  const [params, setParams] = useSearchParams();
  const [trips, setTrips] = useState<RecordData[]>([]);
  const [items, setItems] = useState<RecordData[]>([]);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editing, setEditing] = useState("");
  const [draft, setDraft] = useState("");
  const [draftCategory, setDraftCategory] = useState("Other");
  const tripId = params.get("tripId") ?? "";
  const loadTrips = async () => {
    try {
      setTrips(records(await api("/api/trips")));
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const load = async () => {
    if (!tripId) {
      setItems([]);
      return;
    }
    try {
      setItems(
        records(
          await api(`/api/checklists?tripId=${encodeURIComponent(tripId)}`),
        ),
      );
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    void loadTrips();
  }, []);
  useEffect(() => {
    void load();
  }, [tripId]);
  const add = async (title: string, categoryValue = newCategory) => {
    if (!tripId || !title.trim()) return;
    try {
      await api(
        "/api/checklists",
        json("POST", {
          tripId,
          title: title.trim(),
          category: categoryValue,
          completed: false,
        }),
      );
      setText("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const patch = async (item: RecordData, data: RecordData) => {
    try {
      await api(
        `/api/checklists/${encodeURIComponent(idOf(item))}`,
        json("PATCH", data),
      );
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const remove = async (item: RecordData) => {
    if (!window.confirm(`Delete “${item.title}” from this checklist?`)) return;
    try {
      await api(`/api/checklists/${encodeURIComponent(idOf(item))}`, {
        method: "DELETE",
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const reset = async () => {
    if (
      !tripId ||
      !window.confirm(
        "Reset this checklist? All items will be marked incomplete.",
      )
    )
      return;
    try {
      await api(
        `/api/checklists/reset?tripId=${encodeURIComponent(tripId)}`,
        json("POST"),
      );
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const addDefaults = async () => {
    const existing = new Set(
      items.map((i) =>
        String(i.title ?? "")
          .trim()
          .toLocaleLowerCase(),
      ),
    );
    try {
      for (const item of essentials)
        if (!existing.has(item.title.toLocaleLowerCase())) {
          await api(
            "/api/checklists",
            json("POST", {
              tripId,
              title: item.title,
              category: item.category,
              completed: false,
            }),
          );
          existing.add(item.title.toLocaleLowerCase());
        }
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const completed = items.filter((i) => Boolean(i.completed)).length;
  const visible = items.filter(
    (i) =>
      (filter === "All" ||
        (filter === "Done" ? Boolean(i.completed) : !i.completed)) &&
      (categoryFilter === "All" || i.category === categoryFilter),
  );
  return (
    <div className="mx-auto max-w-[1050px]">
      <PageHeading
        eyebrow="READY WHEN YOU ARE"
        title="Trip checklist"
        note="Pack and prepare with a checklist for every trip."
      />
      {error && <ErrorBox error={error} retry={() => void load()} />}
      <section className={`${panel} mb-5`}>
        <label className="block text-[10px] font-bold">
          Choose a trip
          <select
            className={`${input} mt-1.5 max-w-lg`}
            value={tripId}
            onChange={(e) =>
              setParams(e.target.value ? { tripId: e.target.value } : {})
            }
          >
            <option value="">Select a trip…</option>
            {trips.map((t) => (
              <option key={idOf(t)} value={idOf(t)}>
                {tripName(t)}
              </option>
            ))}
          </select>
        </label>
      </section>
      {tripId ? (
        <section className={panel}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-[18px] font-bold">
                {tripName(trips.find((t) => idOf(t) === tripId) ?? {})}
              </h2>
              <p className="mt-1 text-[10px] text-[#858b80]">
                {completed} of {items.length} complete
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => void addDefaults()} className={softButton}>
                Add 19 essentials
              </button>
              <button onClick={() => void reset()} className={softButton}>
                Reset
              </button>
            </div>
          </div>
          <div
            className="mb-5 h-2.5 overflow-hidden rounded-full bg-[#e9e9e1]"
            role="progressbar"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={items.length || 1}
          >
            <div
              className="h-full rounded-full bg-[#438474] transition-all"
              style={{
                width: `${items.length ? (completed / items.length) * 100 : 0}%`,
              }}
            />
          </div>
          <form
            className="mb-4 grid gap-2 sm:grid-cols-[1fr_160px_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              void add(text);
            }}
          >
            <input
              required
              className={input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a checklist item"
            />
            <select
              className={input}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              {checklistCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button className={button}>
              <Plus size={14} />
              Add
            </button>
          </form>
          <div className="mb-3 flex flex-wrap gap-2">
            <div className="flex gap-1">
              {["All", "To do", "Done"].map((x) => (
                <button
                  key={x}
                  onClick={() => setFilter(x)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${filter === x ? "bg-[#e6efeb] text-[#245d50]" : "text-[#879087] hover:bg-[#f4f3ed]"}`}
                >
                  {x}
                </button>
              ))}
            </div>
            <select
              aria-label="Filter checklist category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`${input} h-8 w-auto min-w-36`}
            >
              <option>All</option>
              {checklistCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          {items.length === 0 && (
            <div className="mb-3 rounded-xl bg-[#f4f5ef] p-3 text-[10px] text-[#687d70]">
              Add the 19 suggested essentials, then tailor the list to your
              trip.
            </div>
          )}
          <div className="divide-y divide-[#f0eee8]">
            {visible.map((item) => {
              const currentId = idOf(item);
              return (
                <div
                  key={currentId}
                  className="flex flex-wrap items-center gap-3 py-2.5"
                >
                  <button
                    aria-label={
                      item.completed ? "Mark incomplete" : "Mark complete"
                    }
                    onClick={() =>
                      void patch(item, { completed: !item.completed })
                    }
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${item.completed ? "border-[#438474] bg-[#438474] text-white" : "border-[#cfd6cb]"}`}
                  >
                    {item.completed && <Check size={13} />}
                  </button>
                  {editing === currentId ? (
                    <>
                      <input
                        autoFocus
                        className={`${input} h-8 min-w-32 flex-1`}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                      />
                      <select
                        className="h-8 rounded border px-2 text-[10px]"
                        value={draftCategory}
                        onChange={(e) => setDraftCategory(e.target.value)}
                      >
                        {checklistCategories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <button
                        className={softButton}
                        onClick={() => {
                          void patch(item, {
                            title: draft.trim(),
                            category: draftCategory,
                          });
                          setEditing("");
                        }}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        className={`min-w-0 flex-1 text-[12px] ${item.completed ? "text-[#9a9f95] line-through" : "text-[#405b4e]"}`}
                      >
                        {item.title}
                      </span>
                      <span className="text-[9px] text-[#92968b]">
                        {item.category}
                      </span>
                      <button
                        className={softButton}
                        onClick={() => {
                          setEditing(currentId);
                          setDraft(item.title);
                          setDraftCategory(item.category ?? "Other");
                        }}
                      >
                        Edit
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => void remove(item)}
                    aria-label="Delete checklist item"
                    className="text-[#a7513c]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
          {items.length > 0 && items.length < essentials.length && (
            <button
              onClick={() => void addDefaults()}
              className="mt-4 text-[10px] font-bold text-[#367465] hover:underline"
            >
              Add remaining suggested essentials
            </button>
          )}
        </section>
      ) : (
        <Empty>Select a trip to load its checklist.</Empty>
      )}
    </div>
  );
}

export function BudgetPage() {
  const [params, setParams] = useSearchParams();
  const [trips, setTrips] = useState<RecordData[]>([]);
  const [expenses, setExpenses] = useState<RecordData[]>([]);
  const [error, setError] = useState("");
  const [budget, setBudget] = useState("");
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const tripId = params.get("tripId") ?? "";
  const trip = trips.find((t) => idOf(t) === tripId);
  const currency = currencyOf(trip);
  const load = async () => {
    try {
      const [t, e] = await Promise.all([
        api("/api/trips"),
        api("/api/expenses"),
      ]);
      setTrips(records(t));
      setExpenses(records(e));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    if (!tripId && trips.length) setParams({ tripId: idOf(trips[0]) });
  }, [tripId, trips, setParams]);
  useEffect(() => {
    if (trip) {
      setBudget(String(trip.budget ?? ""));
      const raw = trip.categoryAllocations ?? {};
      setAllocations(
        Object.fromEntries(
          budgetCategories.map((c) => [c, String(raw[c] ?? "")]),
        ),
      );
    }
  }, [trip]);
  const actual = expenses.filter((x) => expenseTripId(x) === tripId);
  const spent = actual.reduce((n, x) => n + Number(x.amount || 0), 0);
  const allocated = budgetCategories.reduce(
    (n, c) => n + (Number(allocations[c]) || 0),
    0,
  );
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!trip) return;
    setBusy(true);
    try {
      await api(
        `/api/trips/${encodeURIComponent(tripId)}`,
        json("PATCH", {
          budget: Number(budget),
          categoryAllocations: Object.fromEntries(
            budgetCategories.map((c) => [c, Number(allocations[c]) || 0]),
          ),
        }),
      );
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeading
        eyebrow="PLAN WITH REAL NUMBERS"
        title="Budget planner"
        note="Each trip is shown in its own currency; no currency conversions are assumed."
      />
      {error && <ErrorBox error={error} retry={() => void load()} />}
      <section className={`${panel} mb-5`}>
        <label className="block text-[10px] font-bold">
          Trip
          <select
            value={tripId}
            onChange={(e) =>
              setParams(e.target.value ? { tripId: e.target.value } : {})
            }
            className={`${input} mt-1.5 max-w-lg`}
          >
            <option value="">Select a trip…</option>
            {trips.map((t) => (
              <option key={idOf(t)} value={idOf(t)}>
                {tripName(t)} · {currencyOf(t)}
              </option>
            ))}
          </select>
        </label>
      </section>
      {trip ? (
        <div className="grid items-start gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <section className={panel}>
            <h2 className="mb-4 font-heading text-[17px] font-bold">
              Budget allocation ({currency})
            </h2>
            <form onSubmit={save} className="space-y-3">
              <label className="block text-[10px] font-bold">
                Total trip budget
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={`${input} mt-1.5`}
                />
              </label>
              <p className="pt-1 text-[10px] font-bold text-[#697b70]">
                Category targets
              </p>
              {budgetCategories.map((c) => (
                <label
                  key={c}
                  className="flex items-center justify-between gap-3 text-[10px] font-semibold"
                >
                  {c}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={allocations[c] ?? ""}
                    onChange={(e) =>
                      setAllocations({ ...allocations, [c]: e.target.value })
                    }
                    className={`${input} max-w-[150px]`}
                    placeholder={currency}
                  />
                </label>
              ))}
              <p className="text-[9px] text-[#8a9187]">
                Allocated {money(allocated, currency)} of{" "}
                {money(budget, currency)} {currency}
              </p>
              <button className={`${button} w-full`} disabled={busy}>
                {busy ? "Saving…" : "Save budget"}
              </button>
            </form>
          </section>
          <section className={panel}>
            <h2 className="mb-4 font-heading text-[17px] font-bold">
              Actual spending · {currency}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#f3f5ef] p-4">
                <p className="text-[10px] text-[#829086]">Trip budget</p>
                <b className="mt-1 block font-heading text-[20px]">
                  {money(budget, currency)}
                </b>
              </div>
              <div className="rounded-xl bg-[#f3f5ef] p-4">
                <p className="text-[10px] text-[#829086]">Expenses recorded</p>
                <b className="mt-1 block font-heading text-[20px]">
                  {money(spent, currency)}
                </b>
              </div>
              <div className="rounded-xl bg-[#f3f5ef] p-4">
                <p className="text-[10px] text-[#829086]">Remaining</p>
                <b className="mt-1 block font-heading text-[20px]">
                  {money(Number(budget) - spent, currency)}
                </b>
              </div>
            </div>
            {Number(budget) > 0 && (
              <>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e9e9e1]">
                  <div
                    className={`h-full rounded-full ${spent > Number(budget) ? "bg-[#c66b4d]" : "bg-[#438474]"}`}
                    style={{
                      width: `${Math.min(100, (spent / Number(budget)) * 100)}%`,
                    }}
                  />
                </div>
                <p
                  className={`mt-2 text-[10px] font-semibold ${spent > Number(budget) ? "text-[#a7513c]" : spent / Number(budget) >= 0.8 ? "text-[#b2763d]" : "text-[#728176]"}`}
                  role={spent / Number(budget) >= 0.8 ? "alert" : undefined}
                >
                  {Math.round((spent / Number(budget)) * 100)}% used
                  {spent > Number(budget) ? " · Over budget" : spent / Number(budget) >= 0.8 ? " · Approaching budget limit" : ""}
                </p>
              </>
            )}
            <h3 className="mb-2 mt-6 text-[11px] font-bold">
              Spending by category
            </h3>
            <div className="divide-y divide-[#f0eee8]">
              {budgetCategories.map((c) => {
                const sourceCats = Object.entries(expenseBudgetCategory)
                  .filter(([, v]) => v === c)
                  .map(([k]) => k);
                const amount = actual
                  .filter((e) => sourceCats.includes(e.category))
                  .reduce((n, e) => n + Number(e.amount || 0), 0);
                const target = Number(allocations[c]) || 0;
                return (
                  <div key={c} className="py-2">
                    <div className="flex justify-between gap-3 text-[11px]">
                      <span>
                        {c}
                        <span className="ml-2 text-[9px] text-[#9a9f95]">
                          Target {money(target, currency)}
                        </span>
                      </span>
                      <b>{money(amount, currency)}</b>
                    </div>
                    {target > 0 && (
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-[#eeeee7]">
                        <div
                          className={`h-full rounded ${amount > target ? "bg-[#c66b4d]" : "bg-[#81a38f]"}`}
                          style={{
                            width: `${Math.min(100, (amount / target) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                    {target > 0 && amount > target && (
                      <p className="mt-1 text-[9px] font-semibold text-[#a7513c]">
                        Over this category target by{" "}
                        {money(amount - target, currency)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <Link
              to={`/expenses?tripId=${encodeURIComponent(tripId)}`}
              className="mt-4 inline-flex text-[10px] font-bold text-[#337364] hover:underline"
            >
              Manage expenses →
            </Link>
          </section>
        </div>
      ) : (
        <Empty>Create a trip before planning its budget.</Empty>
      )}
    </div>
  );
}

const destinations = [
  {
    name: "Amalfi Coast",
    country: "Italy",
    mood: "Coastal escape",
    type: "Coastal",
    budget: "Premium",
    season: "Spring and early autumn are often pleasant.",
    duration: "5–7 days",
    description:
      "Cliffside villages, lemon groves, and Mediterranean views reward a slower pace.",
    attractions: ["Ravello gardens", "Amalfi Cathedral", "Path of the Gods"],
    styles: ["Coast", "Food", "Culture"],
    tips: ["Expect steep lanes and stairs.", "Check seasonal ferry schedules."],
    image:
      "https://images.pexels.com/photos/10550141/pexels-photo-10550141.jpeg",
  },
  {
    name: "Kyoto",
    country: "Japan",
    mood: "Culture & calm",
    type: "Heritage city",
    budget: "Moderate",
    season: "Spring blossoms and autumn foliage are popular seasons.",
    duration: "4–6 days",
    description:
      "Historic temples, quiet gardens, and traditional neighborhoods make room for unhurried exploration.",
    attractions: ["Fushimi Inari", "Arashiyama bamboo grove", "Nishiki Market"],
    styles: ["Culture", "Nature", "Food"],
    tips: ["Visit popular sites early.", "Follow local etiquette at shrines."],
    image: "https://images.pexels.com/photos/5745772/pexels-photo-5745772.jpeg",
  },
  {
    name: "Lisbon",
    country: "Portugal",
    mood: "City by the sea",
    type: "Coastal city",
    budget: "Moderate",
    season: "Spring and autumn are usually comfortable for walking.",
    duration: "3–5 days",
    description:
      "Tiled streets, viewpoints, neighborhood cafes, and an easy-going waterfront city break.",
    attractions: ["Alfama", "Belém", "Time Out Market"],
    styles: ["City", "Food", "Culture"],
    tips: [
      "Wear comfortable shoes for hills.",
      "Check transit service on travel days.",
    ],
    image:
      "https://images.pexels.com/photos/30692189/pexels-photo-30692189.jpeg",
  },
  {
    name: "Marrakech",
    country: "Morocco",
    mood: "Colorful city break",
    type: "Heritage city",
    budget: "Moderate",
    season: "Spring and autumn are often milder than midsummer.",
    duration: "3–5 days",
    description:
      "A sensory mix of gardens, craft traditions, and historic architecture around the old medina.",
    attractions: ["Jemaa el-Fnaa", "Bahia Palace", "Majorelle Garden"],
    styles: ["Culture", "Food", "Shopping"],
    tips: [
      "Agree on taxi fares before travel.",
      "Dress respectfully in religious sites.",
    ],
    image: "https://images.pexels.com/photos/6621125/pexels-photo-6621125.jpeg",
  },
  {
    name: "Vancouver",
    country: "Canada",
    mood: "City meets nature",
    type: "Nature city",
    budget: "Premium",
    season: "Late spring through early autumn is a common outdoor season.",
    duration: "4–6 days",
    description:
      "A walkable waterfront city framed by mountains, parks, and a lively food scene.",
    attractions: ["Stanley Park", "Granville Island", "Grouse Mountain"],
    styles: ["Nature", "City", "Food"],
    tips: [
      "Mountain weather can change quickly.",
      "Use transit for downtown trips.",
    ],
    image: "https://images.pexels.com/photos/11431965/pexels-photo-11431965.jpeg",
  },
  {
    name: "Mexico City",
    country: "Mexico",
    mood: "Food & culture",
    type: "City",
    budget: "Moderate",
    season: "November through April is typically the drier period.",
    duration: "4–6 days",
    description:
      "Layered history, leafy plazas, art, and regional cooking across a sprawling capital.",
    attractions: ["Chapultepec Park", "Historic Center", "Frida Kahlo Museum"],
    styles: ["Food", "Culture", "City"],
    tips: [
      "Allow extra time for traffic.",
      "Use official taxi or rideshare options.",
    ],
    image: "https://images.pexels.com/photos/13201083/pexels-photo-13201083.jpeg",
  },
];
export function DestinationsPage() {
  const [search, setSearch] = useState("");
  const [styleFilter, setStyleFilter] = useState("All styles");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [budgetFilter, setBudgetFilter] = useState("All budgets");
  const shown = destinations.filter((d) =>
    `${d.name} ${d.country} ${d.mood} ${d.styles.join(" ")} ${d.attractions.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()) &&
    (styleFilter === "All styles" || d.styles.includes(styleFilter)) &&
    (typeFilter === "All types" || d.type === typeFilter) &&
    (budgetFilter === "All budgets" || d.budget === budgetFilter),
  );
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeading
        eyebrow="A LITTLE INSPIRATION"
        title="Destinations"
        note="Curated ideas to help you choose where to go."
      />
      <label className="relative mb-5 block max-w-lg">
        <Search size={15} className="absolute left-3 top-3 text-[#92968b]" />
        <input
          className={`${input} pl-9`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search destinations, attractions, or styles"
        />
      </label>
      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        <select aria-label="Filter by travel style" value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)} className={input}>
          <option>All styles</option>{[...new Set(destinations.flatMap((d) => d.styles))].map((style) => <option key={style}>{style}</option>)}
        </select>
        <select aria-label="Filter by destination type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={input}>
          <option>All types</option>{[...new Set(destinations.map((d) => d.type))].map((type) => <option key={type}>{type}</option>)}
        </select>
        <select aria-label="Filter by budget category" value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)} className={input}>
          <option>All budgets</option>{[...new Set(destinations.map((d) => d.budget))].map((budget) => <option key={budget}>{budget}</option>)}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((d) => (
          <article
            key={d.name}
            className="overflow-hidden rounded-2xl border border-[#e9e6de] bg-white"
          >
            <img
              className="h-40 w-full object-cover"
              src={d.image}
              alt={`${d.name}, ${d.country}`}
              loading="lazy"
            />
            <div className="p-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#648276]">
                {d.mood}
              </p>
              <h2 className="mt-1 font-heading text-[17px] font-bold">
                {d.name}
                <span className="ml-2 font-sans text-[11px] font-medium text-[#92968b]">
                  {d.country}
                </span>
              </h2>
              <p className="mt-2 text-[10px] leading-relaxed text-[#737f75]">
                {d.description}
              </p>
              <p className="mt-1 text-[9px] text-[#858b80]">Suggested stay: {d.duration} · {d.budget} budget</p>
              <p className="mt-1 text-[9px] text-[#858b80]">Season note: {d.season} Conditions vary; verify before travel.</p>
              <p className="mt-3 text-[9px] font-bold text-[#52645a]">
                Places to explore
              </p>
              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                {d.attractions.map((spot) => (
                  <a
                    key={spot}
                    className="text-[10px] text-[#428072] hover:underline"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot}, ${d.name}, ${d.country}`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {spot} ↗
                  </a>
                ))}
              </div>
              <p className="mt-2 text-[9px] font-bold text-[#52645a]">
                Travel styles
              </p>
              <p className="mt-1 text-[10px] text-[#828b81]">
                {d.styles.join(" · ")}
              </p>
              <ul className="mt-2 space-y-1">
                {d.tips.map((t) => (
                  <li key={t} className="text-[9px] text-[#828b81]">
                    • {t}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/itinerary?destination=${encodeURIComponent(d.name)}`}
                  className={`${softButton} flex-1`}
                >
                  <Compass size={13} />
                  Itinerary ideas
                </Link>
                <Link
                  to={`/trips?destination=${encodeURIComponent(`${d.name}, ${d.country}`)}`}
                  className={`${button} flex-1`}
                >
                  <Plus size={13} />
                  Use for a trip
                </Link>
                <a
                  className={`${softButton} flex-1`}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.name}, ${d.country}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Google Maps ↗
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
      {shown.length === 0 && <Empty>No destinations match your search.</Empty>}
      <p className="mt-4 text-[9px] text-[#a0a196]">
        These are curated suggestions, not live availability, prices, or travel
        advisories.
      </p>
    </div>
  );
}

export function SettingsPage() {
  const [profile, setProfile] = useState<RecordData | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const load = async () => {
    setLoading(true);
    try {
      const result = await api<any>("/api/auth/me");
      const user = result?.user ?? result?.profile ?? result;
      setProfile(user);
      setName(user?.name ?? "");
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await api<any>(
        "/api/auth/me",
        json("PATCH", { name: name.trim() }),
      );
      const user = result?.user ?? result?.profile ?? result;
      setProfile(user);
      setName(user?.name ?? name.trim());
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    setBusy(true);
    try {
      await api("/api/auth/logout", json("POST"));
      navigate("/auth");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <div className="mx-auto max-w-[850px]">
      <PageHeading
        eyebrow="YOUR ACCOUNT"
        title="Settings & profile"
        note="Update your profile and manage your session."
      />
      {error && <ErrorBox error={error} retry={() => void load()} />}
      {loading ? (
        <p className="text-sm text-[#858b80]">Loading profile…</p>
      ) : !profile ? (
        <section className={`${panel} max-w-2xl`}>
          <h2 className="font-heading text-[17px] font-bold">Sign in to manage your profile</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-[#858b80]">Account settings and saved travel details are available after you sign in.</p>
          <Link to="/auth" className={`${button} mt-4`}>Sign in or create an account</Link>
        </section>
      ) : (
        <section className={`${panel} max-w-2xl`}>
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e7eee6] font-heading text-lg font-bold text-[#245e50]">
              {String(name || profile?.email || "T")
                .slice(0, 1)
                .toUpperCase()}
            </div>
            <div>
              <h2 className="font-heading text-[17px] font-bold">
                {name || "Traveler"}
              </h2>
              <p className="text-[11px] text-[#858b80]">
                {profile?.email ?? "Account email"}
              </p>
            </div>
          </div>
          <form onSubmit={save} className="space-y-3">
            <label className="block text-[10px] font-bold">
              Name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${input} mt-1.5`}
              />
            </label>
            <p className="text-[10px] text-[#858b80]">
              Email: {profile?.email ?? "Not available"}
            </p>
            <button className={button} disabled={busy}>
              {busy ? "Saving…" : "Save name"}
            </button>
          </form>
          <div className="mt-5 border-t border-[#efeee8] pt-4">
            <button
              onClick={() => void logout()}
              disabled={busy}
              className="text-[11px] font-bold text-[#a7513c] hover:underline"
            >
              Sign out
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
