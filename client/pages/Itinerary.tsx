import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Compass,
  Copy,
  MapPin,
  Pencil,
  RefreshCw,
  Sparkles,
  Sun,
  Sunset,
  Wallet,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { api, idOf, json, records, RecordData } from "@/lib/triplite-api";

type TravelStyle =
  "Mixed" | "Culture" | "Food" | "Nature" | "Adventure" | "Relaxation";
type Slot = "Morning" | "Afternoon" | "Evening";
type Activity = {
  name: string;
  description: string;
  duration: string;
  estimate: number;
  styles: TravelStyle[];
  interests: string[];
};
type DayActivity = Activity & { id: string; slot: Slot };

const destinations: Record<
  string,
  { country: string; tips: string[]; activities: Activity[] }
> = {
  "Amalfi Coast": {
    country: "Italy",
    tips: [
      "Coastal roads are winding; build in extra time between towns.",
      "Carry water and comfortable shoes for steep lanes and steps.",
      "Check seasonal ferry and local transit schedules before setting out.",
    ],
    activities: [
      {
        name: "Ravello garden walk",
        description:
          "Wander the terraced gardens at Villa Cimbrone and take in the coastline views.",
        duration: "2–3 hours",
        estimate: 14,
        styles: ["Culture", "Nature", "Relaxation", "Mixed"],
        interests: ["gardens", "architecture", "views"],
      },
      {
        name: "Amalfi's historic lanes",
        description:
          "Explore the cathedral square and the old town's narrow streets at an easy pace.",
        duration: "2 hours",
        estimate: 8,
        styles: ["Culture", "Food", "Mixed"],
        interests: ["history", "architecture", "food"],
      },
      {
        name: "Path of the Gods",
        description:
          "Take a scenic section of this hillside trail for sweeping sea and village views.",
        duration: "3–4 hours",
        estimate: 12,
        styles: ["Adventure", "Nature", "Mixed"],
        interests: ["hiking", "views", "outdoors"],
      },
      {
        name: "Seaside lunch in Cetara",
        description:
          "Pause in a small fishing village and try a relaxed local seafood lunch.",
        duration: "1.5 hours",
        estimate: 24,
        styles: ["Food", "Relaxation", "Mixed"],
        interests: ["food", "seafood", "local"],
      },
      {
        name: "Positano viewpoint stroll",
        description:
          "Follow the lanes between the upper town and waterfront for classic coastal scenery.",
        duration: "2–3 hours",
        estimate: 0,
        styles: ["Nature", "Relaxation", "Culture", "Mixed"],
        interests: ["views", "photography", "coast"],
      },
      {
        name: "Local ceramics atelier",
        description:
          "Browse hand-painted ceramics and learn about the region's craft traditions.",
        duration: "1–2 hours",
        estimate: 18,
        styles: ["Culture", "Mixed"],
        interests: ["crafts", "shopping", "art"],
      },
      {
        name: "Sunset by the water",
        description:
          "Wind down with a slow promenade and a golden-hour view of the coast.",
        duration: "1 hour",
        estimate: 0,
        styles: ["Relaxation", "Nature", "Mixed"],
        interests: ["sunset", "views", "coast"],
      },
    ],
  },
  Kyoto: {
    country: "Japan",
    tips: [
      "Temple and garden hours vary by season; check official sites before visiting.",
      "Use a transit card where accepted and keep a little cash for smaller shops.",
      "Keep voices low and follow posted photography guidance at sacred sites.",
    ],
    activities: [
      {
        name: "Fushimi Inari morning walk",
        description:
          "Follow the vermilion torii gates up the wooded hillside at your own pace.",
        duration: "2–3 hours",
        estimate: 0,
        styles: ["Culture", "Nature", "Adventure", "Mixed"],
        interests: ["temples", "hiking", "photography"],
      },
      {
        name: "Nishiki Market tasting stroll",
        description:
          "Browse the covered market and sample a few seasonal Kyoto specialties.",
        duration: "1.5–2 hours",
        estimate: 22,
        styles: ["Food", "Culture", "Mixed"],
        interests: ["food", "markets", "local"],
      },
      {
        name: "Arashiyama riverside",
        description:
          "Walk beside the river and through the bamboo grove early in the day.",
        duration: "2–3 hours",
        estimate: 0,
        styles: ["Nature", "Relaxation", "Mixed"],
        interests: ["nature", "photography", "walking"],
      },
      {
        name: "Gion heritage lanes",
        description:
          "Discover traditional streets and wooden townhouses with care for local residents.",
        duration: "1.5 hours",
        estimate: 0,
        styles: ["Culture", "Mixed"],
        interests: ["history", "architecture", "photography"],
      },
      {
        name: "Tea ceremony experience",
        description:
          "Learn the rhythm and gestures of Japanese tea in a small-group setting.",
        duration: "1–2 hours",
        estimate: 35,
        styles: ["Culture", "Relaxation", "Mixed"],
        interests: ["crafts", "culture", "tea"],
      },
      {
        name: "Nanzen-ji temple grounds",
        description:
          "Explore expansive temple grounds, gardens, and the striking brick aqueduct.",
        duration: "2 hours",
        estimate: 8,
        styles: ["Culture", "Nature", "Mixed"],
        interests: ["temples", "gardens", "architecture"],
      },
      {
        name: "Kamo River evening stroll",
        description:
          "Take a gentle walk along the river as the city settles into evening.",
        duration: "1 hour",
        estimate: 0,
        styles: ["Relaxation", "Nature", "Mixed"],
        interests: ["walking", "sunset", "local"],
      },
    ],
  },
  Lisbon: {
    country: "Portugal",
    tips: [
      "Lisbon is hilly; comfortable shoes make the old neighborhoods much easier.",
      "Confirm attraction opening times and transit options on the day.",
      "Keep an eye on belongings in busy areas and on public transport.",
    ],
    activities: [
      {
        name: "Alfama lanes and viewpoints",
        description:
          "Wander the old quarter's winding streets between its tiled facades and miradouros.",
        duration: "2–3 hours",
        estimate: 0,
        styles: ["Culture", "Nature", "Mixed"],
        interests: ["history", "views", "photography"],
      },
      {
        name: "Pastel de nata tasting",
        description:
          "Take a sweet break and compare a warm custard tart with a coffee.",
        duration: "45 minutes",
        estimate: 7,
        styles: ["Food", "Relaxation", "Mixed"],
        interests: ["food", "baking", "local"],
      },
      {
        name: "Belém riverside discoveries",
        description:
          "Explore the riverside district and its maritime monuments from the outside in.",
        duration: "2–3 hours",
        estimate: 15,
        styles: ["Culture", "Nature", "Mixed"],
        interests: ["history", "architecture", "river"],
      },
      {
        name: "Time Out Market lunch",
        description:
          "Choose from local favorites in a lively shared food hall.",
        duration: "1–1.5 hours",
        estimate: 20,
        styles: ["Food", "Mixed"],
        interests: ["food", "markets", "local"],
      },
      {
        name: "Tile museum visit",
        description:
          "Trace Portugal's azulejo tradition through historic panels and contemporary work.",
        duration: "1.5–2 hours",
        estimate: 12,
        styles: ["Culture", "Mixed"],
        interests: ["art", "history", "architecture"],
      },
      {
        name: "Monsanto park reset",
        description:
          "Trade the city streets for leafy paths and open-air viewpoints.",
        duration: "2 hours",
        estimate: 0,
        styles: ["Nature", "Adventure", "Relaxation", "Mixed"],
        interests: ["hiking", "outdoors", "views"],
      },
      {
        name: "Sunset at the waterfront",
        description:
          "Find a place along the Tagus to watch the light change over the water.",
        duration: "1 hour",
        estimate: 0,
        styles: ["Relaxation", "Nature", "Mixed"],
        interests: ["sunset", "river", "views"],
      },
    ],
  },
};

const styles: TravelStyle[] = [
  "Mixed",
  "Culture",
  "Food",
  "Nature",
  "Adventure",
  "Relaxation",
];
const slots: Slot[] = ["Morning", "Afternoon", "Evening"];
const slotIcons = { Morning: Sun, Afternoon: Compass, Evening: Sunset };
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function buildDays(
  destination: string,
  days: number,
  style: TravelStyle,
  interests: string,
  budget: string,
  variation: number,
): DayActivity[][] {
  const curated = destinations[destination]?.activities;
  if (!curated?.length) return [];
  const styleMatches = curated.filter((activity) =>
    activity.styles.includes(style),
  );
  const interestWords = interests
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean);
  const interestMatches = interestWords.length
    ? styleMatches.filter((activity) =>
        interestWords.some((word) =>
          activity.interests.some(
            (interest) => interest.includes(word) || word.includes(interest),
          ),
        ),
      )
    : [];
  const matched = interestMatches.length
    ? interestMatches
    : styleMatches.length
      ? styleMatches
      : curated;
  const budgetMatches =
    budget === "Thoughtful"
      ? matched.filter((activity) => activity.estimate <= 14)
      : matched;
  const options = budgetMatches.length ? budgetMatches : matched;
  return Array.from({ length: days }, (_, dayIndex) =>
    slots.map((slot, slotIndex) => {
      const activity =
        options[
          (dayIndex * slots.length + slotIndex + variation) % options.length
        ];
      return {
        ...activity,
        id: `${destination}-${style}-${interests}-${budget}-${variation}-${dayIndex}-${slotIndex}`,
        slot,
      };
    }),
  );
}

export default function Itinerary() {
  const [searchParams] = useSearchParams();
  const [destination, setDestination] = useState(
    searchParams.get("destination") ?? "Amalfi Coast",
  );
  const [days, setDays] = useState(4);
  const [style, setStyle] = useState<TravelStyle>("Mixed");
  const [budget, setBudget] = useState("Balanced");
  const [startTime, setStartTime] = useState("8:30 AM");
  const [interests, setInterests] = useState("");
  const [variation, setVariation] = useState(0);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [savedPlans, setSavedPlans] = useState<RecordData[]>([]);
  const [ownedTrips, setOwnedTrips] = useState<RecordData[]>([]);
  const [selectedTripId, setSelectedTripId] = useState(
    searchParams.get("tripId") ?? "",
  );
  const [apiError, setApiError] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState("");
  const [editingPlanTitle, setEditingPlanTitle] = useState("");

  const loadSavedPlans = async () => {
    try {
      const [plans, trips] = await Promise.all([
        api("/api/itineraries"),
        api("/api/trips"),
      ]);
      const tripList = records(trips);
      setSavedPlans(records(plans));
      setOwnedTrips(tripList);
      const requestedTripId = searchParams.get("tripId") ?? "";
      setSelectedTripId((current) =>
        tripList.some((trip) => idOf(trip) === current)
          ? current
          : tripList.some((trip) => idOf(trip) === requestedTripId)
            ? requestedTripId
            : "",
      );
      setApiError("");
    } catch (error) {
      setApiError((error as Error).message);
    }
  };
  useEffect(() => {
    void loadSavedPlans();
  }, []);
  const savePlan = async () => {
    if (!destinations[destination]) {
      setApiError(
        "There is no curated itinerary data for this destination yet.",
      );
      return;
    }
    if (!ownedTrips.some((trip) => idOf(trip) === selectedTripId)) {
      setApiError(
        "Choose one of your saved trips before saving this itinerary.",
      );
      return;
    }
    setSavingPlan(true);
    try {
      const payload = {
        tripId: selectedTripId,
        title: editingPlanTitle || `${destination} · ${days} days`,
        destination,
        days,
        style,
        budgetComfort: budget,
        startTime,
        interests,
        activities: plan.map((day, index) =>
          day.map((activity) => ({
            ...activity,
            day: index + 1,
            name: edited[activity.id] || activity.name,
          })),
        ),
      };
      if (editingPlanId) {
        await api("/api/itineraries", json("PATCH", { id: editingPlanId, ...payload }));
      } else {
        await api("/api/itineraries", json("POST", payload));
      }
      await loadSavedPlans();
      setEditingPlanId("");
      setEditingPlanTitle("");
      toast.success("Itinerary saved");
    } catch (error) {
      setApiError((error as Error).message);
    } finally {
      setSavingPlan(false);
    }
  };
  const loadPlan = (item: RecordData) => {
    setDestination(String(item.destination ?? ""));
    setDays(Math.min(14, Math.max(1, Number(item.days) || 1)));
    setStyle((styles.includes(item.style) ? item.style : "Mixed") as TravelStyle);
    setBudget(String(item.budgetComfort ?? "Balanced"));
    setStartTime(String(item.startTime ?? "8:30 AM"));
    setInterests(String(item.interests ?? ""));
    setSelectedTripId(String(item.tripId ?? ""));
    setEditingPlanId(idOf(item));
    setEditingPlanTitle(String(item.title ?? item.name ?? `${item.destination} · ${item.days} days`));
    const nextVariation = variation + 1;
    setVariation(nextVariation);
    const restoredNames: Record<string, string> = {};
    (Array.isArray(item.activities) ? item.activities : []).forEach((day: any, dayIndex: number) => {
      (Array.isArray(day) ? day : []).forEach((activity: any, slotIndex: number) => {
        if (activity.name) {
          restoredNames[`${item.destination}-${item.style ?? "Mixed"}-${item.interests ?? ""}-${item.budgetComfort ?? "Balanced"}-${nextVariation}-${dayIndex}-${slotIndex}`] = String(activity.name);
        }
      });
    });
    setEdited(restoredNames);
    setEditingId(null);
    setApiError("");
  };
  const deletePlan = async (item: RecordData) => {
    try {
      await api("/api/itineraries", json("DELETE", { id: idOf(item) }));
      await loadSavedPlans();
    } catch (error) {
      setApiError((error as Error).message);
    }
  };
  const renamePlan = async (item: RecordData) => {
    const title = window.prompt(
      "Rename this saved itinerary",
      item.title ?? item.name ?? "",
    );
    if (!title?.trim()) return;
    try {
      await api(
        "/api/itineraries",
        json("PATCH", { id: idOf(item), title: title.trim() }),
      );
      await loadSavedPlans();
    } catch (error) {
      setApiError((error as Error).message);
    }
  };

  useEffect(() => {
    const requested = searchParams.get("destination");
    if (requested) setDestination(requested);
  }, [searchParams]);

  const plan = useMemo(
    () => buildDays(destination, days, style, interests, budget, variation),
    [destination, days, style, interests, budget, variation],
  );
  const destinationInfo = destinations[destination];
  const totalEstimate = destinationInfo
    ? plan.flat().reduce((total, activity) => total + activity.estimate, 0) +
      days * 10
    : null;
  const mapSearch = (place: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place}, ${destination}`)}`;

  const regenerate = () => {
    setVariation((value) => value + 1);
    setEdited({});
    setEditingId(null);
  };
  const copyPlan = async () => {
    const text = plan
      .map(
        (day, index) =>
          `Day ${index + 1}\n${day.map((activity) => `${activity.slot}: ${edited[activity.id] || activity.name} — ${activity.description}`).join("\n")}`,
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Itinerary copied to clipboard");
    } catch {
      toast.error("Clipboard access is unavailable in this browser");
    }
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#78867b] transition hover:text-[#174f47]"
      >
        <ArrowLeft size={14} /> Back to overview
      </Link>
      <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#628273]">
            <Sparkles size={13} /> A thoughtful starting point
          </p>
          <h1 className="font-heading text-[30px] font-bold leading-tight tracking-[-.055em] text-[#173d35] sm:text-[36px]">
            Your days,{" "}
            <span className="text-[#d68b62]">beautifully mapped.</span>
          </h1>
          <p className="mt-2 text-[12px] text-[#80877d] sm:text-[13px]">
            A simple, transparent planner built from curated local ideas—not AI
            or live availability.
          </p>
        </div>
      </section>

      {apiError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#f0d3c8] bg-[#fff7f3] p-3 text-[11px] text-[#9a4e39]"
        >
          <span>{apiError}</span>
          <button
            onClick={() => void loadSavedPlans()}
            className="font-bold underline"
          >
            Retry
          </button>
        </div>
      )}
      <section className="mb-5 rounded-2xl border border-[#e8e5dc] bg-white p-4">
        <label className="block max-w-lg text-[10px] font-bold text-[#52645a]">
          Save itinerary to a trip
          <select
            required
            value={selectedTripId}
            onChange={(event) => setSelectedTripId(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-xl border border-[#e5e4dc] bg-[#fcfbf8] px-3 text-[12px] outline-none focus:border-[#4d8d7d]"
          >
            <option value="">Choose an owned trip…</option>
            {ownedTrips.map((trip) => (
              <option key={idOf(trip)} value={idOf(trip)}>
                {trip.name} · {trip.destination}
              </option>
            ))}
          </select>
        </label>
        {ownedTrips.length === 0 && (
          <p className="mt-2 text-[10px] text-[#a7513c]">
            Create a trip first to save this itinerary.
          </p>
        )}
      </section>
      {savedPlans.length > 0 && (
        <section className="mb-5 rounded-2xl border border-[#e8e5dc] bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading text-[14px] font-bold">
              Saved itineraries
            </h2>
            <span className="text-[9px] text-[#91978c]">
              Stored in your account
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedPlans.map((item) => (
              <div
                key={idOf(item)}
                className="flex items-center gap-2 rounded-lg bg-[#f3f5ef] px-3 py-2 text-[10px]"
              >
                <span className="font-semibold">
                  {item.title ??
                    item.name ??
                    item.destination ??
                    "Saved itinerary"}
                </span>
                <button
                  onClick={() => loadPlan(item)}
                  className="font-bold text-[#367465] hover:underline"
                >
                  Load & edit
                </button>
                <button
                  onClick={() => void renamePlan(item)}
                  className="font-bold text-[#367465] hover:underline"
                >
                  Rename
                </button>
                <button
                  onClick={() => void deletePlan(item)}
                  className="font-bold text-[#a7513c] hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      <div className="grid items-start gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="rounded-[20px] border border-[#e8e5dc] bg-white p-5 sm:p-6 xl:sticky xl:top-[88px]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#92978d]">
                MAKE IT YOURS
              </p>
              <h2 className="mt-1 font-heading text-[16px] font-bold">
                Trip details
              </h2>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e9f0e9] text-[#397466]">
              <Compass size={16} />
            </span>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold text-[#52645a]">
                Destination
              </span>
              <select
                value={destination}
                onChange={(event) => {
                  setDestination(event.target.value);
                  setEdited({});
                }}
                className="h-10 w-full rounded-xl border border-[#e5e4dc] bg-[#fcfbf8] px-3 text-[12px] text-[#34564b] outline-none transition focus:border-[#4d8d7d] focus:ring-2 focus:ring-[#4d8d7d]/10"
              >
                {!destinations[destination] && (
                  <option value={destination}>
                    {destination} · curated guide unavailable
                  </option>
                )}
                {Object.entries(destinations).map(([name, info]) => (
                  <option key={name} value={name}>
                    {name}, {info.country}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold text-[#52645a]">
                  How many days?
                </span>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={days}
                  onChange={(event) =>
                    setDays(
                      Math.max(
                        1,
                        Math.min(14, Number(event.target.value) || 1),
                      ),
                    )
                  }
                  className="h-10 w-full rounded-xl border border-[#e5e4dc] bg-[#fcfbf8] px-3 text-[12px] text-[#34564b] outline-none focus:border-[#4d8d7d] focus:ring-2 focus:ring-[#4d8d7d]/10"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold text-[#52645a]">
                  Start around
                </span>
                <select
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="h-10 w-full rounded-xl border border-[#e5e4dc] bg-[#fcfbf8] px-3 text-[12px] text-[#34564b] outline-none focus:border-[#4d8d7d]"
                >
                  {["7:30 AM", "8:30 AM", "9:30 AM", "10:30 AM"].map((time) => (
                    <option key={time}>{time}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold text-[#52645a]">
                Travel style
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {styles.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setStyle(item)}
                    className={`rounded-lg border px-1.5 py-2 text-[9px] font-semibold transition ${style === item ? "border-[#2b7161] bg-[#e9f1ec] text-[#276858]" : "border-[#eceae3] bg-[#fcfbf8] text-[#81877d] hover:border-[#b9c9bd]"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold text-[#52645a]">
                Budget comfort
              </span>
              <select
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#e5e4dc] bg-[#fcfbf8] px-3 text-[12px] text-[#34564b] outline-none focus:border-[#4d8d7d]"
              >
                <option>Thoughtful</option>
                <option>Balanced</option>
                <option>Flexible</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold text-[#52645a]">
                Interests{" "}
                <span className="font-normal text-[#9b9d94]">(optional)</span>
              </span>
              <input
                value={interests}
                onChange={(event) => setInterests(event.target.value)}
                placeholder="e.g. gardens, food, hiking"
                className="h-10 w-full rounded-xl border border-[#e5e4dc] bg-[#fcfbf8] px-3 text-[11px] text-[#34564b] outline-none placeholder:text-[#afb0a6] focus:border-[#4d8d7d] focus:ring-2 focus:ring-[#4d8d7d]/10"
              />
            </label>
            <div className="rounded-xl bg-[#f4f3ed] px-3 py-2.5 text-[9px] leading-relaxed text-[#858c81]">
              Interest matching uses curated tags. If none match this
              destination, the planner uses your travel style instead.
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#174f47] px-4 py-4 text-white sm:px-5">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-white/65">
                <MapPin size={12} />{" "}
                {destinationInfo?.country ?? "Curated guide unavailable"}
              </div>
              <h2 className="mt-1 font-heading text-[18px] font-bold tracking-[-.03em]">
                {destination}{" "}
                <span className="font-sans text-[11px] font-medium text-white/65">
                  · {days} {days === 1 ? "day" : "days"}
                </span>
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={regenerate}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/20 px-3 text-[10px] font-semibold transition hover:bg-white/10"
              >
                <RefreshCw size={13} /> Regenerate
              </button>
              <button
                type="button"
                onClick={copyPlan}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#f8f4e9] px-3 text-[10px] font-bold text-[#24594d] transition hover:bg-white"
              >
                <Copy size={13} /> Copy plan
              </button>
              <button
                type="button"
                onClick={() => void savePlan()}
                disabled={savingPlan || !selectedTripId || !destinationInfo}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#dcebe2] px-3 text-[10px] font-bold text-[#24594d] transition hover:bg-white disabled:opacity-60"
              >
                <Check size={13} /> {savingPlan ? "Saving…" : editingPlanId ? "Save changes" : "Save"}
              </button>
            </div>
          </div>

          {!destinationInfo ? (
            <div className="rounded-2xl border border-dashed border-[#dedfd5] bg-white p-6 text-center text-[12px] text-[#858b80]">
              There is no curated itinerary for this destination yet. Choose one
              of the supported destinations to see day-by-day suggestions; no
              attraction or price estimates are invented.
            </div>
          ) : (
            <div className="space-y-3">
              {plan.map((activities, dayIndex) => (
                <article
                  key={`${variation}-${dayIndex}`}
                  className="overflow-hidden rounded-2xl border border-[#e8e5dc] bg-white"
                >
                  <div className="flex items-center justify-between border-b border-[#f0eee8] px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f0eb] font-heading text-[11px] font-bold text-[#2c7060]">
                        {String(dayIndex + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-[12px] font-bold">
                          Day {dayIndex + 1}
                        </h3>
                        <p className="text-[9px] text-[#9a9c91]">
                          A {style.toLowerCase()}-leaning day, starting around{" "}
                          {startTime}
                        </p>
                      </div>
                    </div>
                    <span className="hidden items-center gap-1 text-[9px] text-[#92968b] sm:flex">
                      <Clock3 size={12} /> Flexible pacing
                    </span>
                  </div>
                  <div className="divide-y divide-[#f3f1eb] px-4 sm:px-5">
                    {activities.map((activity) => {
                      const Icon = slotIcons[activity.slot];
                      const activityName = edited[activity.id] || activity.name;
                      const isEditing = editingId === activity.id;
                      return (
                        <div
                          key={activity.id}
                          className="grid grid-cols-[25px_minmax(0,1fr)] gap-2.5 py-3.5 sm:grid-cols-[67px_25px_minmax(0,1fr)_auto] sm:gap-3"
                        >
                          <span className="col-span-2 mb-[-4px] text-[9px] font-bold text-[#839087] sm:col-span-1 sm:mb-0 sm:pt-1">
                            {activity.slot}
                          </span>
                          <span className="hidden h-6 w-6 items-center justify-center rounded-lg bg-[#f4f4ed] text-[#688176] sm:flex">
                            <Icon size={13} />
                          </span>
                          <div className="min-w-0">
                            {isEditing ? (
                              <div className="mb-1 flex gap-1.5">
                                <input
                                  autoFocus
                                  value={draft}
                                  onChange={(event) =>
                                    setDraft(event.target.value)
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      setEdited((current) => ({
                                        ...current,
                                        [activity.id]:
                                          draft.trim() || activity.name,
                                      }));
                                      setEditingId(null);
                                    }
                                    if (event.key === "Escape")
                                      setEditingId(null);
                                  }}
                                  className="min-w-0 flex-1 rounded-md border border-[#bdd0c4] px-2 py-1 text-[11px] outline-none"
                                  aria-label="Edit activity name"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEdited((current) => ({
                                      ...current,
                                      [activity.id]:
                                        draft.trim() || activity.name,
                                    }));
                                    setEditingId(null);
                                  }}
                                  aria-label="Save activity name"
                                  className="rounded-md bg-[#e9f1ec] px-2 text-[#2c7060]"
                                >
                                  <Check size={14} />
                                </button>
                              </div>
                            ) : (
                              <h4 className="flex items-center gap-1.5 text-[11px] font-bold text-[#35564b]">
                                {activityName}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDraft(activityName);
                                    setEditingId(activity.id);
                                  }}
                                  aria-label={`Edit ${activityName}`}
                                  className="rounded p-0.5 text-[#a2a69b] hover:bg-[#f0f3ed] hover:text-[#347365]"
                                >
                                  <Pencil size={11} />
                                </button>
                              </h4>
                            )}
                            <p className="mt-1 max-w-[560px] text-[10px] leading-relaxed text-[#898e84]">
                              {activity.description}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="text-[9px] text-[#8b9186]">
                                {activity.duration}
                              </span>
                              <a
                                href={mapSearch(activity.name)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#428072] hover:underline"
                              >
                                <MapPin size={10} /> Maps
                              </a>
                            </div>
                          </div>
                          <span className="col-start-2 row-start-2 whitespace-nowrap pt-1 text-[9px] text-[#91978c] sm:col-start-auto sm:row-start-auto sm:pt-1.5">
                            ~{money.format(activity.estimate)} / person
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.2fr]">
            <div className="rounded-2xl border border-[#e8e5dc] bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f6edde] text-[#b47e49]">
                  <Wallet size={14} />
                </span>
                <span className="text-[10px] font-bold">
                  Rough planning estimate
                </span>
              </div>
              {totalEstimate === null ? (
                <p className="font-heading text-[15px] font-bold text-[#858b80]">
                  No estimate available
                </p>
              ) : (
                <p className="font-heading text-[22px] font-bold tracking-[-.04em] text-[#28594d]">
                  ~{money.format(totalEstimate)}{" "}
                  <span className="font-sans text-[9px] font-medium tracking-normal text-[#989a90]">
                    per person · {budget.toLowerCase()}
                  </span>
                </p>
              )}
              <p className="mt-1 text-[9px] leading-relaxed text-[#9b9d92]">
                Includes curated activity placeholders and a simple
                local-transport allowance. Not live prices or quotes; confirm
                costs locally.
              </p>
            </div>
            <div className="rounded-2xl border border-[#e8e5dc] bg-[#f0f2eb] p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#5b806c]">
                  <Sparkles size={14} />
                </span>
                <span className="text-[10px] font-bold">A few local notes</span>
              </div>
              <ul className="space-y-1.5">
                {(
                  destinationInfo?.tips ?? [
                    "Travel guidance will be available when a curated destination profile is added.",
                  ]
                ).map((tip) => (
                  <li
                    key={tip}
                    className="flex gap-1.5 text-[9px] leading-relaxed text-[#758277]"
                  >
                    <ArrowRight
                      size={11}
                      className="mt-0.5 shrink-0 text-[#69907d]"
                    />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 text-center text-[9px] text-[#a1a297]">
            Itinerary ideas are curated samples, not live travel advice or
            guaranteed attraction schedules.
          </p>
        </section>
      </div>
    </div>
  );
}
