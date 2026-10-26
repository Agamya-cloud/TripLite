import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Compass, MapPin, Plus, Sparkles, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const destinations = [
  { name: "Amalfi Coast", country: "Italy", mood: "Coastal escape", image: "https://images.pexels.com/photos/10550141/pexels-photo-10550141.jpeg", days: "5–7 days", color: "#e6a26e" },
  { name: "Kyoto", country: "Japan", mood: "Culture & calm", image: "https://images.pexels.com/photos/5745772/pexels-photo-5745772.jpeg", days: "4–6 days", color: "#7b9e7e" },
  { name: "Lisbon", country: "Portugal", mood: "City by the sea", image: "https://images.pexels.com/photos/30692189/pexels-photo-30692189.jpeg", days: "3–5 days", color: "#d98769" },
];

const metrics = [
  { label: "Planned trips", value: "0", detail: "Your next one could be anywhere", icon: CalendarDays, tint: "bg-[#e8f0eb] text-[#327462]" },
  { label: "Travel budget", value: "—", detail: "Set a budget when you plan a trip", icon: Wallet, tint: "bg-[#f7ebdc] text-[#bb7b3d]" },
  { label: "Places to explore", value: "03", detail: "Handpicked ideas to get you started", icon: Compass, tint: "bg-[#e8eaf3] text-[#6971a0]" },
];

export default function Index() {
  return (
    <div className="mx-auto max-w-[1330px]">
      <section className="mb-7 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.17em] text-[#648276]"><span className="h-1.5 w-1.5 rounded-full bg-[#e78d62]" /> YOUR TRAVEL SPACE</p>
          <h1 className="font-heading text-[30px] font-bold leading-tight tracking-[-.055em] text-[#173d35] sm:text-[36px]">Make room for <span className="text-[#d68b62]">somewhere new.</span></h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[#7d8479] sm:text-sm">A calmer way to plan the little details, so you can look forward to the big moments.</p>
        </div>
        <Link to="/itinerary" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#174f47] px-4 text-[12px] font-bold text-white shadow-[0_5px_13px_rgba(23,79,71,.13)] transition hover:-translate-y-0.5 hover:bg-[#216257]"><Plus size={16} /> Plan a trip <ArrowRight size={14} className="ml-1" /></Link>
      </section>

      <section className="relative mb-6 min-h-[255px] overflow-hidden rounded-[22px] bg-[#254d48] sm:min-h-[286px]" aria-label="Featured travel idea">
        <img src="https://images.pexels.com/photos/10550141/pexels-photo-10550141.jpeg" alt="Aerial view of the Amalfi coastline and blue Mediterranean water" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#102f2b]/85 via-[#183c38]/55 to-transparent" />
        <div className="relative flex min-h-[255px] max-w-[640px] flex-col items-start justify-center px-6 py-7 text-white sm:min-h-[286px] sm:px-9 sm:py-9">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em] backdrop-blur-sm"><Sparkles size={12} /> A little inspiration</span>
          <h2 className="font-heading text-[28px] font-bold leading-[1.1] tracking-[-.045em] sm:text-[36px]">The long way<br className="hidden sm:block" /> is the lovely way.</h2>
          <p className="mt-3 max-w-[360px] text-[12px] leading-relaxed text-white/80 sm:text-[13px]">Slow mornings, winding coastal roads, and one more scoop of gelato. Let’s make that trip happen.</p>
          <Link to="/itinerary?destination=Amalfi%20Coast" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#fffaf1] px-4 py-2.5 text-[11px] font-bold text-[#214c43] transition hover:bg-white">Explore the Amalfi Coast <ArrowRight size={14} /></Link>
        </div>
        <span className="absolute bottom-4 right-5 rounded-full bg-black/20 px-3 py-1 text-[9px] text-white/75 backdrop-blur">Curated idea · not live travel data</span>
      </section>

      <section className="mb-7 grid gap-3 sm:grid-cols-3" aria-label="Travel overview">
        {metrics.map(({ label, value, detail, icon: Icon, tint }) => (
          <div key={label} className="flex min-h-[105px] items-center gap-3.5 rounded-2xl border border-[#e9e6de] bg-white/80 p-4 sm:p-5">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${tint}`}><Icon size={18} strokeWidth={1.8} /></span>
            <div className="min-w-0"><p className="text-[10px] font-semibold text-[#858a80]">{label}</p><div className="mt-0.5 flex items-baseline gap-2"><span className="font-heading text-[23px] font-bold tracking-[-.04em] text-[#1d463c]">{value}</span><span className="truncate text-[9px] text-[#a0a397]">{detail}</span></div></div>
          </div>
        ))}
      </section>

      <section className="mb-8 grid gap-5 lg:grid-cols-[1.45fr_.8fr]">
        <div className="rounded-2xl border border-[#e9e6de] bg-white/80 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#96998e]">YOUR JOURNEYS</p><h2 className="mt-1 font-heading text-[18px] font-bold tracking-[-.035em]">Trips at a glance</h2></div><span className="rounded-full bg-[#f2f1eb] px-2.5 py-1 text-[9px] font-semibold text-[#8a8e83]">0 trips</span></div>
          <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[#dedfd5] bg-[#fbfaf7] px-4 py-5 text-center">
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f0eb] text-[#347365]"><MapPin size={17} /></span>
            <p className="text-[12px] font-bold text-[#38554b]">Your first adventure is waiting.</p>
            <p className="mt-1 max-w-sm text-[10px] leading-relaxed text-[#92958b]">Start with a destination and we’ll help you map out the days ahead.</p>
            <Link to="/itinerary" className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#287064] hover:underline">Create your first plan <ArrowRight size={12} /></Link>
          </div>
        </div>
        <div className="rounded-2xl border border-[#e9e6de] bg-[#f1f1e8] p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#397260]"><Wallet size={16} /></span><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#77877c]">A note on your numbers</p></div>
          <h2 className="font-heading text-[16px] font-bold tracking-[-.03em]">Your budget, your way.</h2>
          <p className="mt-2 text-[11px] leading-[1.7] text-[#7d877d]">Trip budgets and spending totals will live here as you add trips and expenses. Nothing is estimated or stored until you enter it.</p>
          <div className="mt-4 flex items-center gap-2 border-t border-[#dfe3d8] pt-3 text-[9px] text-[#8e968b]"><ArrowDownRight size={13} /> No trip or expense data yet</div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#96998e]">SOMEWHERE TO START</p><h2 className="mt-1 font-heading text-[20px] font-bold tracking-[-.04em]">Places with a little magic</h2></div><span className="hidden items-center gap-1 text-[10px] text-[#858c81] sm:inline-flex"><ArrowUpRight size={13} /> Curated inspiration</span></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {destinations.map((destination) => (
            <Link key={destination.name} to={`/itinerary?destination=${encodeURIComponent(destination.name)}`} className="group overflow-hidden rounded-2xl border border-[#e9e6de] bg-white transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(31,59,49,.09)]">
              <div className="relative h-[156px] overflow-hidden bg-[#e9e7dc]"><img src={destination.image} alt={`${destination.name}, ${destination.country}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /><span className="absolute left-3 top-3 rounded-full bg-[#fdfbf4]/90 px-2.5 py-1 text-[9px] font-bold text-[#46665b] backdrop-blur">{destination.mood}</span><span className="absolute right-3 top-3 h-2 w-2 rounded-full" style={{ backgroundColor: destination.color }} /></div>
              <div className="flex items-center justify-between px-4 py-3.5"><div><h3 className="font-heading text-[14px] font-bold tracking-[-.025em]">{destination.name}<span className="ml-1.5 font-sans text-[10px] font-medium text-[#9b9b90]">{destination.country}</span></h3><p className="mt-1 text-[9px] text-[#93968b]">A lovely stay: {destination.days}</p></div><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf2ed] text-[#3a7563] transition group-hover:bg-[#174f47] group-hover:text-white"><ArrowRight size={14} /></span></div>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-[9px] text-[#a0a196]">Destination notes are curated suggestions, not live availability, prices, or travel advisories.</p>
      </section>
    </div>
  );
}
