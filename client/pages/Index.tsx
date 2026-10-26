import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Compass,
  ListChecks,
  MapPin,
  Plus,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  api,
  idOf,
  labelOf,
  money,
  records,
  RecordData,
} from "@/lib/triplite-api";

const ideas = [
  {
    name: "Amalfi Coast",
    country: "Italy",
    mood: "Coastal escape",
    image:
      "https://images.pexels.com/photos/10550141/pexels-photo-10550141.jpeg",
    days: "5–7 days",
  },
  {
    name: "Kyoto",
    country: "Japan",
    mood: "Culture & calm",
    image: "https://images.pexels.com/photos/5745772/pexels-photo-5745772.jpeg",
    days: "4–6 days",
  },
  {
    name: "Lisbon",
    country: "Portugal",
    mood: "City by the sea",
    image:
      "https://images.pexels.com/photos/30692189/pexels-photo-30692189.jpeg",
    days: "3–5 days",
  },
];
const expenseTrip = (item: RecordData) =>
  String(item.tripId ?? item.trip_id ?? "");

export default function Index() {
  const [trips, setTrips] = useState<RecordData[]>([]);
  const [expenses, setExpenses] = useState<RecordData[]>([]);
  const [checklists, setChecklists] = useState<RecordData[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const [tripResponse, expenseResponse] = await Promise.all([
        api("/api/trips"),
        api("/api/expenses"),
      ]);
      const tripList = records(tripResponse);
      setTrips(tripList);
      setExpenses(records(expenseResponse));
      const checklistResults = await Promise.all(
        tripList.map((trip) =>
          api(`/api/checklists?tripId=${encodeURIComponent(idOf(trip))}`).then(
            records,
          ),
        ),
      );
      setChecklists(checklistResults.flat());
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
  const totalBudget = trips.reduce(
    (sum, trip) => sum + Number(trip.budget || 0),
    0,
  );
  const totalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );
  const checklistDone = checklists.filter((item) =>
    Boolean(item.completed ?? item.checked),
  ).length;
  const nextTrips = useMemo(
    () =>
      [...trips]
        .sort((a, b) =>
          String(a.startDate ?? "").localeCompare(String(b.startDate ?? "")),
        )
        .slice(0, 3),
    [trips],
  );

  return (
    <div className="mx-auto max-w-[1330px]">
      <section className="mb-7 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.17em] text-[#648276]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e78d62]" /> YOUR
            TRAVEL SPACE
          </p>
          <h1 className="font-heading text-[30px] font-bold leading-tight tracking-[-.055em] text-[#173d35] sm:text-[36px]">
            Make room for <span className="text-[#d68b62]">somewhere new.</span>
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[#7d8479] sm:text-sm">
            A calmer way to plan the little details, so you can look forward to
            the big moments.
          </p>
        </div>
        <Link
          to="/trips"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#174f47] px-4 text-[12px] font-bold text-white shadow-[0_5px_13px_rgba(23,79,71,.13)] transition hover:-translate-y-0.5 hover:bg-[#216257]"
        >
          <Plus size={16} /> Plan a trip{" "}
          <ArrowRight size={14} className="ml-1" />
        </Link>
      </section>
      {error && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#f0d3c8] bg-[#fff7f3] p-3 text-[11px] text-[#9a4e39]"
        >
          <span>{error}</span>
          <button onClick={() => void load()} className="font-bold underline">
            Retry
          </button>
        </div>
      )}
      <section
        className="relative mb-6 min-h-[245px] overflow-hidden rounded-[22px] bg-[#254d48] sm:min-h-[280px]"
        aria-label="Featured travel idea"
      >
        <img
          src={ideas[0].image}
          alt="Amalfi coast and Mediterranean"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#102f2b]/85 via-[#183c38]/55 to-transparent" />
        <div className="relative flex min-h-[245px] max-w-[640px] flex-col items-start justify-center px-6 py-7 text-white sm:min-h-[280px] sm:px-9">
          <span className="mb-4 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em]">
            A little inspiration
          </span>
          <h2 className="font-heading text-[28px] font-bold leading-[1.1] tracking-[-.045em] sm:text-[36px]">
            The long way
            <br /> is the lovely way.
          </h2>
          <p className="mt-3 max-w-[360px] text-[12px] leading-relaxed text-white/80">
            Slow mornings, winding coastal roads, and one more scoop of gelato.
            Let’s make that trip happen.
          </p>
          <Link
            to="/destinations"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#fffaf1] px-4 py-2.5 text-[11px] font-bold text-[#214c43]"
          >
            Explore destinations <ArrowRight size={14} />
          </Link>
        </div>
      </section>
      <section
        className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Travel overview"
      >
        {[
          {
            label: "Trips",
            value: loading ? "…" : String(trips.length),
            detail: "saved journeys",
            icon: CalendarDays,
            tint: "bg-[#e8f0eb] text-[#327462]",
          },
          {
            label: "Trip budgets",
            value: loading ? "…" : money(totalBudget),
            detail: "combined planned budget",
            icon: Wallet,
            tint: "bg-[#f7ebdc] text-[#bb7b3d]",
          },
          {
            label: "Expenses recorded",
            value: loading ? "…" : money(totalSpent),
            detail: `${expenses.length} entries`,
            icon: Wallet,
            tint: "bg-[#e8eaf3] text-[#6971a0]",
          },
          {
            label: "Checklist ready",
            value: loading ? "…" : `${checklistDone}/${checklists.length}`,
            detail: "items completed",
            icon: ListChecks,
            tint: "bg-[#e8f0eb] text-[#327462]",
          },
        ].map(({ label, value, detail, icon: Icon, tint }) => (
          <div
            key={label}
            className="flex min-h-[96px] items-center gap-3.5 rounded-2xl border border-[#e9e6de] bg-white/80 p-4"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${tint}`}
            >
              <Icon size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-[#858a80]">
                {label}
              </p>
              <div className="mt-0.5">
                <span className="font-heading text-[20px] font-bold tracking-[-.04em] text-[#1d463c]">
                  {value}
                </span>
                <span className="ml-2 text-[9px] text-[#a0a397]">{detail}</span>
              </div>
            </div>
          </div>
        ))}
      </section>
      <section className="mb-8 grid gap-5 lg:grid-cols-[1.45fr_.8fr]">
        <div className="rounded-2xl border border-[#e9e6de] bg-white/80 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#96998e]">
                YOUR JOURNEYS
              </p>
              <h2 className="mt-1 font-heading text-[18px] font-bold tracking-[-.035em]">
                Trips at a glance
              </h2>
            </div>
            <Link
              to="/trips"
              className="text-[10px] font-bold text-[#287064] hover:underline"
            >
              All trips →
            </Link>
          </div>
          {loading ? (
            <p className="text-[11px] text-[#92958b]">Loading your trips…</p>
          ) : nextTrips.length ? (
            <div className="space-y-2">
              {nextTrips.map((trip) => (
                <Link
                  key={idOf(trip)}
                  to={`/trips/${encodeURIComponent(idOf(trip))}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#efeee8] p-3.5 hover:bg-[#fbfcf9]"
                >
                  <div>
                    <h3 className="text-[12px] font-bold">{labelOf(trip)}</h3>
                    <p className="mt-1 text-[9px] text-[#92958b]">
                      {trip.destination ?? "Destination not set"}
                      {trip.startDate
                        ? ` · ${String(trip.startDate).slice(0, 10)}`
                        : ""}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#397260]">
                    {money(trip.budget || 0)}{" "}
                    <ArrowRight className="ml-1 inline" size={13} />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[135px] flex-col items-center justify-center rounded-xl border border-dashed border-[#dedfd5] bg-[#fbfaf7] px-4 py-5 text-center">
              <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f0eb] text-[#347365]">
                <MapPin size={17} />
              </span>
              <p className="text-[12px] font-bold text-[#38554b]">
                Your first adventure is waiting.
              </p>
              <p className="mt-1 text-[10px] text-[#92958b]">
                Start by creating a saved trip.
              </p>
              <Link
                to="/trips"
                className="mt-3 text-[10px] font-bold text-[#287064]"
              >
                Create a trip <ArrowRight size={12} className="inline" />
              </Link>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-[#e9e6de] bg-[#f1f1e8] p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#397260]">
              <Check size={16} />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#77877c]">
              A note on your numbers
            </p>
          </div>
          <h2 className="font-heading text-[16px] font-bold tracking-[-.03em]">
            Based on what you enter.
          </h2>
          <p className="mt-2 text-[11px] leading-[1.7] text-[#7d877d]">
            The figures above come from your saved trips, recorded expenses, and
            per-trip checklist items.
          </p>
          <div className="mt-4 flex gap-3 border-t border-[#dfe3d8] pt-3">
            <Link
              to="/budget"
              className="text-[10px] font-bold text-[#287064] hover:underline"
            >
              Budget planner
            </Link>
            <Link
              to="/expenses"
              className="text-[10px] font-bold text-[#287064] hover:underline"
            >
              Expenses
            </Link>
            <Link
              to="/checklist"
              className="text-[10px] font-bold text-[#287064] hover:underline"
            >
              Checklist
            </Link>
          </div>
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#96998e]">
              SOMEWHERE TO START
            </p>
            <h2 className="mt-1 font-heading text-[20px] font-bold tracking-[-.04em]">
              Places with a little magic
            </h2>
          </div>
          <Link
            to="/destinations"
            className="text-[10px] font-bold text-[#287064]"
          >
            Browse all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {ideas.map((d) => (
            <Link
              key={d.name}
              to={`/itinerary?destination=${encodeURIComponent(d.name)}`}
              className="group overflow-hidden rounded-2xl border border-[#e9e6de] bg-white transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(31,59,49,.09)]"
            >
              <div className="h-[150px] overflow-hidden bg-[#e9e7dc]">
                <img
                  src={d.image}
                  alt={`${d.name}, ${d.country}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <h3 className="font-heading text-[14px] font-bold">
                    {d.name}
                    <span className="ml-1.5 font-sans text-[10px] font-medium text-[#9b9b90]">
                      {d.country}
                    </span>
                  </h3>
                  <p className="mt-1 text-[9px] text-[#93968b]">
                    {d.mood} · {d.days}
                  </p>
                </div>
                <ArrowRight size={14} className="text-[#3a7563]" />
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-[9px] text-[#a0a196]">
          Destination notes are curated suggestions, not live availability,
          prices, or travel advisories.
        </p>
      </section>
    </div>
  );
}
