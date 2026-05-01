import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search, SlidersHorizontal, Bell, X, Check } from "@/components/ui/icons";
import { useApp } from "@/context/AppContext";
import { ListingCard, ListingCardSkeleton } from "@/components/app/ListingCard";
import { TabBar } from "@/components/app/TabBar";
import { GuestBanner } from "@/components/app/GuestBanner";
import { Logo } from "@/components/app/Logo";
import { cn } from "@/lib/utils";
import type { Category, Condition, Size } from "@/lib/mock-data";
import { CategoryScroller } from "@/components/app/CategoryScroller";

export const Route = createFileRoute("/browse")({
  // Disable per-route component splitting — keeps Browse in the main bundle
  // so hot reloads can't leave us with a stale `?tsr-split=component` URL
  // that fails to fetch ("Failed to fetch dynamically imported module").
  codeSplitGroupings: [],
  component: Browse,
});

const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];
const CONDITIONS: Condition[] = ["New with tags", "Like new", "Good", "Fair"];
const TYPES = ["Any", "Sell", "Trade"] as const;
type TypeFilter = (typeof TYPES)[number];

// Halifax Regional Municipality neighbourhoods + approx coordinates (lat, lng)
const NEIGHBOURHOOD_COORDS: Record<string, [number, number]> = {
  "Downtown": [44.6488, -63.5752],
  "North End": [44.6582, -63.5942],
  "South End": [44.6314, -63.5807],
  "West End": [44.6491, -63.6045],
  "Quinpool": [44.6470, -63.6010],
  "Clayton Park": [44.6620, -63.6520],
  "Fairview": [44.6612, -63.6347],
  "Spryfield": [44.6181, -63.6280],
  "Bedford": [44.7325, -63.6556],
  "Sackville": [44.7720, -63.6850],
  "Dartmouth": [44.6710, -63.5772],
  "Cole Harbour": [44.6700, -63.4760],
};
type Neighbourhood = keyof typeof NEIGHBOURHOOD_COORDS;
const NEIGHBOURHOODS = Object.keys(NEIGHBOURHOOD_COORDS) as Neighbourhood[];

const RADIUS_OPTIONS = [5, 10, 25, 50] as const;
type Radius = (typeof RADIUS_OPTIONS)[number] | "Any";

// Haversine distance in km
function distanceKm(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "nearest", label: "Nearest to me" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
] as const;
type SortKey = (typeof SORT_OPTIONS)[number]["value"];

function Browse() {
  const { listings } = useApp();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"All" | Category>("All");
  const [sizes, setSizes] = useState<Size[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("Any");
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [neighbourhoods, setNeighbourhoods] = useState<Neighbourhood[]>([]);
  const [myLocation, setMyLocation] = useState<Neighbourhood>("Downtown");
  const [radius, setRadius] = useState<Radius>("Any");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const myCoords = NEIGHBOURHOOD_COORDS[myLocation];

  const filtered = useMemo(() => {
    const list = listings.filter((l) => {
      if (l.sold) return false;
      if (cat !== "All" && l.category !== cat) return false;
      if (sizes.length && !sizes.includes(l.size)) return false;
      if (conditions.length && !conditions.includes(l.condition)) return false;
      if (typeFilter !== "Any" && l.type !== typeFilter) return false;
      if (l.type === "Sell" && l.price > maxPrice) return false;
      if (neighbourhoods.length && !neighbourhoods.includes(l.neighbourhood as Neighbourhood)) return false;
      if (radius !== "Any") {
        const coords = NEIGHBOURHOOD_COORDS[l.neighbourhood];
        if (!coords) return false;
        if (distanceKm(myCoords, coords) > radius) return false;
      }
      if (query && !`${l.title} ${l.brand} ${l.description}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    const sorted = [...list];
    if (sortBy === "nearest") {
      sorted.sort((a, b) => {
        const ca = NEIGHBOURHOOD_COORDS[a.neighbourhood];
        const cb = NEIGHBOURHOOD_COORDS[b.neighbourhood];
        const da = ca ? distanceKm(myCoords, ca) : Infinity;
        const db = cb ? distanceKm(myCoords, cb) : Infinity;
        return da - db;
      });
    } else if (sortBy === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else {
      sorted.sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
    }
    return sorted;
  }, [listings, cat, sizes, conditions, typeFilter, maxPrice, neighbourhoods, radius, myCoords, query, sortBy]);

  const toggle = <T,>(arr: T[], v: T): T[] => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  const activeCount = sizes.length + conditions.length + neighbourhoods.length + (typeFilter !== "Any" ? 1 : 0) + (maxPrice < 200 ? 1 : 0) + (radius !== "Any" ? 1 : 0) + (sortBy !== "newest" ? 1 : 0);
  const resetFilters = () => { setSizes([]); setConditions([]); setTypeFilter("Any"); setMaxPrice(200); setNeighbourhoods([]); setRadius("Any"); setSortBy("newest"); };

  // Swipe-down to dismiss
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStartY = useState({ current: 0 })[0] as { current: number };
  const scrollAtStart = useState({ current: 0 })[0] as { current: number };
  const closeDrawer = () => { setDrawerOpen(false); setDragY(0); setDragging(false); };
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>, fromHandle: boolean) => {
    const target = e.currentTarget.querySelector("[data-drawer-scroll]") as HTMLElement | null;
    scrollAtStart.current = target?.scrollTop ?? 0;
    if (!fromHandle && scrollAtStart.current > 0) return;
    touchStartY.current = e.touches[0].clientY;
    setDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) setDragY(dy);
  };
  const onTouchEnd = () => {
    if (!dragging) return;
    if (dragY > 100) closeDrawer();
    else { setDragY(0); setDragging(false); }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <GuestBanner />
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <Logo size={26} />
          <Link to={"/messages" as string} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </Link>
        </div>

        <div className="px-4 pb-3 pt-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brands, items, vibes…"
              className="w-full rounded-full border border-border bg-card py-3 pl-10 pr-12 text-sm shadow-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open filters"
              className="absolute right-2 top-1/2 flex h-8 -translate-y-1/2 items-center gap-1 rounded-full bg-muted px-2.5 transition-colors hover:bg-accent"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{activeCount}</span>
              )}
            </button>
          </div>
        </div>

        <CategoryScroller value={cat} onChange={setCat} />

      </header>

      <main className="px-4 pt-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : filtered.length ? (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-display text-lg font-semibold">No matches</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different filter or search term.</p>
          </div>
        )}
      </main>

      <TabBar />

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in sm:items-center"
          onClick={closeDrawer}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl bg-card shadow-card animate-slide-up sm:rounded-3xl touch-pan-y"
            style={{
              transform: dragY ? `translateY(${dragY}px)` : undefined,
              transition: dragging ? "none" : "transform 200ms ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
            role="dialog"
            aria-label="Filters"
          >
            <div
              className="flex justify-center pt-2.5 pb-1 sm:hidden"
              onTouchStart={(e) => onTouchStart(e, true)}
            >
              <span className="h-1.5 w-10 rounded-full bg-muted-foreground/40" />
            </div>
            <div
              className="flex items-center justify-between border-b border-border px-5 py-3"
              onTouchStart={(e) => onTouchStart(e, true)}
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-bold">Filters</h2>
                {activeCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{activeCount}</span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div data-drawer-scroll className="flex-1 space-y-6 overflow-y-auto px-5 py-5" onTouchStart={(e) => onTouchStart(e, false)}>
              <FilterSection title="Sort by">
                <div className="flex flex-wrap gap-1.5">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all",
                        sortBy === opt.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                      )}
                    >{opt.label}</button>
                  ))}
                </div>
                {sortBy === "nearest" && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Sorting by distance from <span className="font-semibold text-foreground">{myLocation}</span>.
                  </p>
                )}
              </FilterSection>

              <FilterSection title="Listing type">
                <div className="flex gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={cn(
                        "flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition-all",
                        typeFilter === t ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-card text-muted-foreground"
                      )}
                    >{t}</button>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Size">
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((s) => {
                    const on = sizes.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => setSizes((p) => toggle(p, s))}
                        className={cn(
                          "flex items-center justify-center gap-1 rounded-2xl border-2 px-3 py-2.5 text-xs font-bold transition-all",
                          on ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/40"
                        )}
                      >
                        {on && <Check className="h-3 w-3" />}{s}
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              <FilterSection title="Condition">
                <div className="flex flex-wrap gap-1.5">
                  {CONDITIONS.map((c) => {
                    const on = conditions.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => setConditions((p) => toggle(p, c))}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all",
                          on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                        )}
                      >{c}</button>
                    );
                  })}
                </div>
              </FilterSection>

              <FilterSection title={`Halifax neighbourhoods${neighbourhoods.length ? ` · ${neighbourhoods.length}` : ""}`}>
                <div className="flex flex-wrap gap-1.5">
                  {NEIGHBOURHOODS.map((n) => {
                    const on = neighbourhoods.includes(n);
                    return (
                      <button
                        key={n}
                        onClick={() => setNeighbourhoods((p) => toggle(p, n))}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all",
                          on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                        )}
                      >{n}</button>
                    );
                  })}
                </div>
                {neighbourhoods.length > 0 && (
                  <button
                    onClick={() => setNeighbourhoods([])}
                    className="mt-2 text-[11px] font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    Clear neighbourhoods
                  </button>
                )}
              </FilterSection>

              <FilterSection title="Near me">
                <label className="mb-2 block text-[11px] font-semibold text-muted-foreground">
                  My location
                </label>
                <select
                  value={myLocation}
                  onChange={(e) => setMyLocation(e.target.value as Neighbourhood)}
                  aria-label="My location"
                  className="mb-3 w-full rounded-2xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {NEIGHBOURHOODS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <label className="mb-2 block text-[11px] font-semibold text-muted-foreground">
                  Radius
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setRadius("Any")}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all",
                      radius === "Any" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                    )}
                  >Any distance</button>
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRadius(r)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all",
                        radius === r ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                      )}
                    >{r} km</button>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title={`Max price · $${maxPrice}${maxPrice >= 200 ? "+" : ""}`}>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[var(--color-primary)]"
                  aria-label="Max price"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>$10</span><span>$200+</span>
                </div>
              </FilterSection>
            </div>

            <div className="flex items-center gap-3 border-t border-border px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
              <button
                onClick={resetFilters}
                className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Reset
              </button>
              <button
                onClick={closeDrawer}
                className="flex-1 rounded-full bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98]"
              >
                Show {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}
