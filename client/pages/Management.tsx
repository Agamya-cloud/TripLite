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
const categories = [
  "Lodging",
  "Transport",
  "Food",
  "Activities",
  "Shopping",
  "Other",
];
const essentials = [
  "Passport / ID",
  "Travel insurance details",
  "Flight tickets / boarding passes",
  "Accommodation confirmations",
  "Wallet and payment cards",
  "Local currency",
  "Phone and charger",
  "Power adapter",
  "Medications",
  "Prescription details",
  "Toiletries",
  "Weather-appropriate clothing",
  "Comfortable walking shoes",
  "Reusable water bottle",
  "Sunglasses",
  "Travel documents copies",
  "Emergency contacts",
  "Headphones",
  "Day bag",
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
const tripIdOfExpense = (expense: RecordData) =>
  String(expense.tripId ?? expense.trip_id ?? "");

export function TripsPage() {
  const [trips, setTrips] = useState<RecordData[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
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
  const create = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api(
        "/api/trips",
        json("POST", {
          name,
          destination,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          budget: budget ? Number(budget) : undefined,
        }),
      );
      setName("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setBudget("");
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
        note="Create trips and keep the practical details together."
      />
      {error && <ErrorBox error={error} retry={() => void load()} />}
      <div className="grid items-start gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <form onSubmit={create} className={panel}>
          <h2 className="mb-4 font-heading text-[17px] font-bold">
            Plan a trip
          </h2>
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-[#52645a]">
              Trip name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${input} mt-1.5`}
                placeholder="A week by the sea"
              />
            </label>
            <label className="block text-[10px] font-bold text-[#52645a]">
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
              <label className="text-[10px] font-bold text-[#52645a]">
                Start date
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`${input} mt-1.5`}
                />
              </label>
              <label className="text-[10px] font-bold text-[#52645a]">
                End date
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`${input} mt-1.5`}
                />
              </label>
            </div>
            <label className="block text-[10px] font-bold text-[#52645a]">
              Budget
              <input
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className={`${input} mt-1.5`}
                placeholder="Optional"
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
              {trips.map((trip) => (
                <Link
                  key={idOf(trip)}
                  to={`/trips/${encodeURIComponent(idOf(trip))}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#efeee8] p-4 transition hover:border-[#b9cfc2] hover:bg-[#fbfcf9]"
                >
                  <div>
                    <h3 className="text-[13px] font-bold">{tripName(trip)}</h3>
                    <p className="mt-1 text-[10px] text-[#858b80]">
                      {trip.destination || "Destination not set"}
                      {trip.startDate
                        ? ` · ${String(trip.startDate).slice(0, 10)}`
                        : ""}
                    </p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-[#5c8b7d]" />
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
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      const result = await api<any>(`/api/trips/${encodeURIComponent(tripId)}`);
      setTrip(result?.trip ?? result);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    void load();
  }, [tripId]);
  const update = async (patch: RecordData) => {
    setBusy(true);
    try {
      const result = await api<any>(
        `/api/trips/${encodeURIComponent(tripId)}`,
        json("PATCH", patch),
      );
      setTrip(result?.trip ?? result ?? { ...trip, ...patch });
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!window.confirm("Delete this trip?")) return;
    setBusy(true);
    try {
      await api(`/api/trips/${encodeURIComponent(tripId)}`, {
        method: "DELETE",
        credentials: "include",
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
            note={trip.destination}
          />
          <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
            <section className={panel}>
              <h2 className="mb-4 font-heading text-[17px] font-bold">
                Trip information
              </h2>
              <div className="space-y-3">
                <label className="block text-[10px] font-bold">
                  Name
                  <input
                    className={`${input} mt-1.5`}
                    defaultValue={trip.name ?? trip.title ?? ""}
                    onBlur={(e) =>
                      e.target.value !== (trip.name ?? trip.title ?? "") &&
                      void update({ name: e.target.value })
                    }
                  />
                </label>
                <label className="block text-[10px] font-bold">
                  Destination
                  <input
                    className={`${input} mt-1.5`}
                    defaultValue={trip.destination ?? ""}
                    onBlur={(e) =>
                      e.target.value !== (trip.destination ?? "") &&
                      void update({ destination: e.target.value })
                    }
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[10px] font-bold">
                    Start
                    <input
                      type="date"
                      className={`${input} mt-1.5`}
                      defaultValue={String(trip.startDate ?? "").slice(0, 10)}
                      onBlur={(e) => void update({ startDate: e.target.value })}
                    />
                  </label>
                  <label className="text-[10px] font-bold">
                    End
                    <input
                      type="date"
                      className={`${input} mt-1.5`}
                      defaultValue={String(trip.endDate ?? "").slice(0, 10)}
                      onBlur={(e) => void update({ endDate: e.target.value })}
                    />
                  </label>
                </div>
                <label className="block text-[10px] font-bold">
                  Budget
                  <input
                    type="number"
                    min="0"
                    className={`${input} mt-1.5`}
                    defaultValue={trip.budget ?? ""}
                    onBlur={(e) =>
                      Number(e.target.value) !== Number(trip.budget ?? 0) &&
                      void update({ budget: Number(e.target.value) })
                    }
                  />
                </label>
                <p className="text-[9px] text-[#92968b]">
                  Changes save when you leave a field.{busy ? " Saving…" : ""}
                </p>
                <button
                  onClick={() => void remove()}
                  className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#a7513c] hover:underline"
                >
                  <Trash2 size={14} /> Delete trip
                </button>
              </div>
            </section>
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
                to={`/itinerary?destination=${encodeURIComponent(trip.destination ?? "")}`}
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
  const [sort, setSort] = useState("date-desc");
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [form, setForm] = useState<RecordData>({
    description: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    tripId: params.get("tripId") ?? "",
  });
  const tripId = params.get("tripId") ?? "";
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
  const save = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        tripId: form.tripId || undefined,
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
        tripId,
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const beginEdit = (item: RecordData) => {
    setEditing(item);
    setForm({
      description: item.description ?? item.name ?? "",
      amount: item.amount ?? "",
      category: item.category ?? "Other",
      date: String(item.date ?? "").slice(0, 10),
      tripId: tripIdOfExpense(item),
    });
  };
  const visible = useMemo(
    () =>
      expenses
        .filter(
          (x) =>
            (!tripId || tripIdOfExpense(x) === tripId) &&
            (category === "All" || x.category === category) &&
            `${x.description ?? x.name ?? ""} ${x.category ?? ""}`
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
    [expenses, tripId, category, search, sort],
  );
  const remove = async (item: RecordData) => {
    try {
      await api(`/api/expenses/${encodeURIComponent(idOf(item))}`, {
        method: "DELETE",
        credentials: "include",
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <div className="mx-auto max-w-[1150px]">
      <PageHeading
        eyebrow="SPENDING, WITHOUT THE SPREADSHEET"
        title="Expenses"
        note="Log and review actual trip spending."
        action={
          <Link to="/budget" className={softButton}>
            Open budget planner →
          </Link>
        }
      />
      {error && <ErrorBox error={error} retry={() => void load()} />}
      <div className="grid items-start gap-5 lg:grid-cols-[.75fr_1.25fr]">
        <form onSubmit={save} className={panel}>
          <h2 className="mb-4 font-heading text-[17px] font-bold">
            {editing ? "Edit expense" : "Add an expense"}
          </h2>
          <div className="space-y-3">
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
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] font-bold">
                Amount
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={`${input} mt-1.5`}
                />
              </label>
              <label className="text-[10px] font-bold">
                Category
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className={`${input} mt-1.5`}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-[10px] font-bold">
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`${input} mt-1.5`}
              />
            </label>
            <label className="block text-[10px] font-bold">
              Trip
              <select
                value={form.tripId}
                onChange={(e) => {
                  setForm({ ...form, tripId: e.target.value });
                  setParams(e.target.value ? { tripId: e.target.value } : {});
                }}
                className={`${input} mt-1.5`}
              >
                <option value="">Unassigned</option>
                {trips.map((t) => (
                  <option key={idOf(t)} value={idOf(t)}>
                    {tripName(t)}
                  </option>
                ))}
              </select>
            </label>
            <button className={`${button} w-full`}>
              {editing ? "Save changes" : "Add expense"}
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading text-[17px] font-bold">
              Your spending
            </h2>
            <span className="text-[11px] font-bold text-[#386c5c]">
              {money(
                visible.reduce((sum, x) => sum + Number(x.amount || 0), 0),
              )}{" "}
              total
            </span>
          </div>
          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <label className="relative">
              <Search
                size={14}
                className="absolute left-3 top-3 text-[#92968b]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${input} pl-9`}
                placeholder="Search expenses"
              />
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={input}
            >
              <option>All</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={input}
            >
              <option value="date-desc">Newest</option>
              <option value="date-asc">Oldest</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
            </select>
          </div>
          {visible.length ? (
            <div className="divide-y divide-[#f0eee8]">
              {visible.map((item) => (
                <article
                  key={idOf(item)}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold">
                      {item.description ?? item.name}
                    </p>
                    <p className="mt-1 text-[9px] text-[#91978c]">
                      {item.category ?? "Other"} ·{" "}
                      {String(item.date ?? "").slice(0, 10)}
                      {item.tripId &&
                        ` · ${tripName(trips.find((t) => idOf(t) === tripIdOfExpense(item)) ?? {})}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <b className="text-[12px]">{money(item.amount)}</b>
                    <button
                      aria-label="Edit expense"
                      onClick={() => beginEdit(item)}
                      className={softButton}
                    >
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
              ))}
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
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState("");
  const [draft, setDraft] = useState("");
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
  const add = async (title: string) => {
    if (!tripId || !title.trim()) return;
    try {
      await api(
        "/api/checklists",
        json("POST", { tripId, title: title.trim(), completed: false }),
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
    try {
      await api(`/api/checklists/${encodeURIComponent(idOf(item))}`, {
        method: "DELETE",
        credentials: "include",
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
        "Reset this checklist? Completed items will be marked incomplete.",
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
      items.map((i) => String(i.title ?? i.name).toLowerCase()),
    );
    try {
      for (const title of essentials.filter(
        (x) => !existing.has(x.toLowerCase()),
      ))
        await api(
          "/api/checklists",
          json("POST", { tripId, title, completed: false }),
        );
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const visible = items.filter(
    (item) =>
      filter === "All" ||
      (filter === "Done"
        ? Boolean(item.completed ?? item.checked)
        : !(item.completed ?? item.checked)),
  );
  return (
    <div className="mx-auto max-w-[1050px]">
      <PageHeading
        eyebrow="READY WHEN YOU ARE"
        title="Trip checklist"
        note="Pack and prepare with one list for each trip."
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
                {trips.find((t) => idOf(t) === tripId)
                  ? tripName(trips.find((t) => idOf(t) === tripId)!)
                  : "Your trip"}
              </h2>
              <p className="mt-1 text-[10px] text-[#858b80]">
                {items.filter((i) => i.completed ?? i.checked).length} of{" "}
                {items.length} complete
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
          <form
            className="mb-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void add(text);
            }}
          >
            <input
              className={input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a checklist item"
            />
            <button className={button}>
              <Plus size={14} />
              Add
            </button>
          </form>
          <div className="mb-3 flex gap-1">
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
          {items.length === 0 && (
            <div className="mb-3 rounded-xl bg-[#f4f5ef] p-3 text-[10px] text-[#687d70]">
              Start with the 19 suggested essentials, then tailor the list to
              your trip.
            </div>
          )}
          <div className="divide-y divide-[#f0eee8]">
            {visible.map((item) => {
              const checked = Boolean(item.completed ?? item.checked);
              const currentId = idOf(item);
              return (
                <div key={currentId} className="flex items-center gap-3 py-2.5">
                  <button
                    aria-label={checked ? "Mark incomplete" : "Mark complete"}
                    onClick={() => void patch(item, { completed: !checked })}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${checked ? "border-[#438474] bg-[#438474] text-white" : "border-[#cfd6cb]"}`}
                  >
                    {checked && <Check size={13} />}
                  </button>
                  {editing === currentId ? (
                    <input
                      autoFocus
                      className={`${input} h-8`}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          void patch(item, { title: draft.trim() });
                          setEditing("");
                        }
                        if (e.key === "Escape") setEditing("");
                      }}
                    />
                  ) : (
                    <span
                      className={`flex-1 text-[12px] ${checked ? "text-[#9a9f95] line-through" : "text-[#405b4e]"}`}
                    >
                      {item.title ?? item.name}
                    </span>
                  )}
                  {editing === currentId ? (
                    <button
                      onClick={() => {
                        void patch(item, { title: draft.trim() });
                        setEditing("");
                      }}
                      className={softButton}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className={softButton}
                      onClick={() => {
                        setEditing(currentId);
                        setDraft(item.title ?? item.name ?? "");
                      }}
                    >
                      Edit
                    </button>
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
  const tripId = params.get("tripId") ?? "";
  const trip = trips.find((t) => idOf(t) === tripId);
  const load = async () => {
    try {
      const [t, e] = await Promise.all([
        api("/api/trips"),
        api("/api/expenses"),
      ]);
      const tripList = records(t);
      setTrips(tripList);
      setExpenses(records(e));
      const selected = tripList.find((x) => idOf(x) === tripId) ?? tripList[0];
      if (selected) {
        if (!tripId) setParams({ tripId: idOf(selected) });
        setBudget(String(selected.budget ?? ""));
        const raw = selected.categoryAllocations ?? selected.allocations ?? {};
        setAllocations(
          Object.fromEntries(categories.map((c) => [c, String(raw[c] ?? "")])),
        );
      }
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    const selected = trips.find((t) => idOf(t) === tripId);
    if (selected) {
      setBudget(String(selected.budget ?? ""));
      const raw = selected.categoryAllocations ?? selected.allocations ?? {};
      setAllocations(
        Object.fromEntries(categories.map((c) => [c, String(raw[c] ?? "")])),
      );
    }
  }, [tripId, trips]);
  const actual = expenses.filter((x) => tripIdOfExpense(x) === tripId);
  const spent = actual.reduce((n, x) => n + Number(x.amount || 0), 0);
  const allocationTotal = Object.values(allocations).reduce(
    (n, v) => n + (Number(v) || 0),
    0,
  );
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!trip) return;
    try {
      await api(
        `/api/trips/${encodeURIComponent(tripId)}`,
        json("PATCH", {
          budget: Number(budget),
          categoryAllocations: Object.fromEntries(
            categories.map((c) => [c, Number(allocations[c]) || 0]),
          ),
        }),
      );
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <div className="mx-auto max-w-[1050px]">
      <PageHeading
        eyebrow="PLAN WITH REAL NUMBERS"
        title="Budget planner"
        note="Budgets and totals come from your saved trip and expenses."
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
                {tripName(t)}
              </option>
            ))}
          </select>
        </label>
      </section>
      {trip ? (
        <div className="grid items-start gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <section className={panel}>
            <h2 className="mb-4 font-heading text-[17px] font-bold">
              Budget allocation
            </h2>
            <form onSubmit={save} className="space-y-3">
              <label className="block text-[10px] font-bold">
                Total trip budget
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={`${input} mt-1.5`}
                />
              </label>
              <p className="pt-1 text-[10px] font-bold text-[#697b70]">
                Optional category targets
              </p>
              {categories.map((c) => (
                <label
                  key={c}
                  className="flex items-center justify-between gap-3 text-[10px] font-semibold"
                >
                  {c}
                  <input
                    type="number"
                    min="0"
                    value={allocations[c] ?? ""}
                    onChange={(e) =>
                      setAllocations({ ...allocations, [c]: e.target.value })
                    }
                    className={`${input} max-w-[150px]`}
                    placeholder="$0"
                  />
                </label>
              ))}
              <p className="text-[9px] text-[#8a9187]">
                Allocated {money(allocationTotal)} of {money(budget)}. Category
                targets are planning amounts; spending is calculated from
                expenses.
              </p>
              <button className={`${button} w-full`}>Save budget</button>
            </form>
          </section>
          <section className={panel}>
            <h2 className="mb-4 font-heading text-[17px] font-bold">
              Actual spending
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#f3f5ef] p-4">
                <p className="text-[10px] text-[#829086]">Trip budget</p>
                <b className="mt-1 block font-heading text-[20px]">
                  {money(budget)}
                </b>
              </div>
              <div className="rounded-xl bg-[#f3f5ef] p-4">
                <p className="text-[10px] text-[#829086]">Expenses recorded</p>
                <b className="mt-1 block font-heading text-[20px]">
                  {money(spent)}
                </b>
              </div>
              <div className="rounded-xl bg-[#f3f5ef] p-4">
                <p className="text-[10px] text-[#829086]">Remaining</p>
                <b className="mt-1 block font-heading text-[20px]">
                  {money(Number(budget) - spent)}
                </b>
              </div>
            </div>
            {Number(budget) > 0 && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e9e9e1]">
                <div
                  className="h-full rounded-full bg-[#438474]"
                  style={{
                    width: `${Math.min(100, (spent / Number(budget)) * 100)}%`,
                  }}
                />
              </div>
            )}
            <h3 className="mb-2 mt-6 text-[11px] font-bold">
              Spending by category
            </h3>
            <div className="divide-y divide-[#f0eee8]">
              {categories.map((c) => {
                const amount = actual
                  .filter((e) => e.category === c)
                  .reduce((n, e) => n + Number(e.amount || 0), 0);
                return (
                  <div
                    key={c}
                    className="flex justify-between py-2 text-[11px]"
                  >
                    <span>
                      {c}
                      <span className="ml-2 text-[9px] text-[#9a9f95]">
                        Target {money(allocations[c] || 0)}
                      </span>
                    </span>
                    <b>{money(amount)}</b>
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
    days: "5–7 days",
    image:
      "https://images.pexels.com/photos/10550141/pexels-photo-10550141.jpeg",
  },
  {
    name: "Kyoto",
    country: "Japan",
    mood: "Culture & calm",
    days: "4–6 days",
    image: "https://images.pexels.com/photos/5745772/pexels-photo-5745772.jpeg",
  },
  {
    name: "Lisbon",
    country: "Portugal",
    mood: "City by the sea",
    days: "3–5 days",
    image:
      "https://images.pexels.com/photos/30692189/pexels-photo-30692189.jpeg",
  },
  {
    name: "Marrakech",
    country: "Morocco",
    mood: "Colorful city break",
    days: "3–5 days",
    image: "https://images.pexels.com/photos/3889855/pexels-photo-3889855.jpeg",
  },
  {
    name: "Vancouver",
    country: "Canada",
    mood: "City meets nature",
    days: "4–6 days",
    image: "https://images.pexels.com/photos/208701/pexels-photo-208701.jpeg",
  },
  {
    name: "Mexico City",
    country: "Mexico",
    mood: "Food & culture",
    days: "4–6 days",
    image: "https://images.pexels.com/photos/3889855/pexels-photo-3889855.jpeg",
  },
];
export function DestinationsPage() {
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const shown = destinations.filter((d) =>
    `${d.name} ${d.country} ${d.mood}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const plan = async (d: (typeof destinations)[number]) => {
    try {
      await api(
        "/api/trips",
        json("POST", { name: `${d.name} getaway`, destination: d.name }),
      );
      navigate("/trips");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeading
        eyebrow="A LITTLE INSPIRATION"
        title="Destinations"
        note="A searchable collection of curated places to start planning."
      />
      {error && <ErrorBox error={error} />}
      <label className="relative mb-5 block max-w-lg">
        <Search size={15} className="absolute left-3 top-3 text-[#92968b]" />
        <input
          className={`${input} pl-9`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search places, countries, or moods"
        />
      </label>
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
              <p className="mt-1 text-[10px] text-[#92968b]">
                A lovely stay: {d.days} · Curated idea, not live availability
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/itinerary?destination=${encodeURIComponent(d.name)}`}
                  className={`${softButton} flex-1`}
                >
                  <Compass size={13} /> Itinerary ideas
                </Link>
                <button
                  onClick={() => void plan(d)}
                  className={`${button} flex-1`}
                >
                  <Plus size={13} /> Plan this trip
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {shown.length === 0 && <Empty>No destinations match your search.</Empty>}
    </div>
  );
}

export function SettingsPage() {
  const [profile, setProfile] = useState<RecordData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const load = async () => {
    setLoading(true);
    try {
      const data = await api<any>("/api/auth/me");
      setProfile(data?.user ?? data?.profile ?? data);
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
  const display =
    profile?.name ?? profile?.displayName ?? profile?.email ?? "Traveler";
  return (
    <div className="mx-auto max-w-[850px]">
      <PageHeading
        eyebrow="YOUR ACCOUNT"
        title="Settings & profile"
        note="Your account details and session controls."
      />
      {error && <ErrorBox error={error} retry={() => void load()} />}
      {loading ? (
        <p className="text-sm text-[#858b80]">Loading profile…</p>
      ) : (
        <section className={`${panel} max-w-2xl`}>
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e7eee6] font-heading text-lg font-bold text-[#245e50]">
              {String(display).slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="font-heading text-[17px] font-bold">{display}</h2>
              <p className="text-[11px] text-[#858b80]">
                {profile?.email ?? "Signed-in TripLite account"}
              </p>
            </div>
          </div>
          <dl className="divide-y divide-[#efeee8] border-y border-[#efeee8] text-[11px]">
            <div className="flex justify-between gap-3 py-3">
              <dt className="text-[#858b80]">Name</dt>
              <dd className="font-semibold">
                {profile?.name ?? profile?.displayName ?? "Not provided"}
              </dd>
            </div>
            <div className="flex justify-between gap-3 py-3">
              <dt className="text-[#858b80]">Email</dt>
              <dd className="font-semibold">
                {profile?.email ?? "Not provided"}
              </dd>
            </div>
          </dl>
          <p className="my-4 text-[10px] leading-relaxed text-[#92968b]">
            Profile editing is not available in the current API contract.
            Account details are read from your authenticated session.
          </p>
          <button
            onClick={() => void logout()}
            disabled={busy}
            className={button}
          >
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </section>
      )}
    </div>
  );
}
