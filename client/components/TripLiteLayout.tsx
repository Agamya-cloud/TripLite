import {
  Compass,
  LayoutDashboard,
  ListChecks,
  Map,
  MapPin,
  Plane,
  Receipt,
  Settings,
  Wallet,
  Sparkles,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const navigation = [
  { label: "Overview", to: "/", icon: LayoutDashboard },
  { label: "Trips", to: "/trips", icon: Plane },
  { label: "Budget", to: "/budget", icon: Wallet },
  { label: "Expenses", to: "/expenses", icon: Receipt },
  { label: "Checklist", to: "/checklist", icon: ListChecks },
  { label: "Destinations", to: "/destinations", icon: MapPin },
  { label: "Itinerary planner", to: "/itinerary", icon: Map },
  { label: "Settings / profile", to: "/settings", icon: Settings },
];

export default function TripLiteLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-[#183a34] lg:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-[#e8e5dc] bg-[#fbfaf6] px-5 py-7 lg:flex">
        <Link
          to="/"
          className="mb-12 flex items-center gap-3 px-2"
          aria-label="TripLite home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#174f47] text-white shadow-sm">
            <Plane size={19} strokeWidth={2.2} />
          </span>
          <span className="font-heading text-[20px] font-extrabold tracking-[-0.05em]">
            triplite<span className="text-[#e78d62]">.</span>
          </span>
        </Link>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#9b9d91]">
          Workspace
        </p>
        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-semibold transition-colors ${isActive ? "bg-[#e6efeb] text-[#174f47]" : "text-[#777e75] hover:bg-[#f0eee7] hover:text-[#174f47]"}`
              }
            >
              <Icon size={17} strokeWidth={1.9} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-[#e8eee7] p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#237365]">
            <Sparkles size={17} />
          </div>
          <p className="text-[13px] font-bold">A little more adventure?</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#78837a]">
            Turn your next big idea into a day-by-day plan.
          </p>
          <Link
            to="/itinerary"
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1a6a5d] hover:underline"
          >
            Build an itinerary <Compass size={13} />
          </Link>
        </div>
        <div className="mt-5 border-t border-[#e8e5dc] px-2 pt-4 text-[10px] text-[#a0a196]">
          Thoughtful trips, lighter planning.
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-[248px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#e9e6de]/90 bg-[#f8f7f2]/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <Link
            to="/"
            className="flex items-center gap-2.5 lg:hidden"
            aria-label="TripLite home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-[#174f47] text-white">
              <Plane size={15} />
            </span>
            <span className="font-heading text-[18px] font-extrabold tracking-[-0.05em]">
              triplite<span className="text-[#e78d62]">.</span>
            </span>
          </Link>
          <div className="hidden text-[12px] text-[#8d9288] lg:block">
            Your space <span className="mx-2 text-[#d3d0c7]">/</span>
            <span className="font-semibold text-[#38544b]">
              {navigation.find((item) => item.to === location.pathname)
                ?.label ??
                (location.pathname.startsWith("/trips/")
                  ? "Trip details"
                  : "TripLite")}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[11px] font-medium text-[#879087] sm:inline">
              Your next great story starts here
            </span>
            <Link
              to="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dce2d8] bg-[#e7eee6] text-[11px] font-bold text-[#245e50]"
              aria-label="Settings and profile"
            >
              <Settings size={15} />
            </Link>
          </div>
        </header>
        <main className="px-5 pb-24 pt-7 sm:px-8 sm:pt-9 lg:px-10 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-[#e7e4dc] bg-[#fbfaf6]/95 px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 backdrop-blur-lg lg:hidden"
        aria-label="Mobile navigation"
      >
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex min-w-[76px] flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[9px] font-semibold ${isActive ? "text-[#176152]" : "text-[#92958a]"}`
            }
          >
            <Icon size={18} strokeWidth={1.9} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
