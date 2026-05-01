import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { TabBar } from "@/components/app/TabBar";
import { ChevronLeft, Edit3, Package, Trash2, Plus, Tag } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/my-listings")({
  head: () => ({
    meta: [
      { title: "My listings — Revere" },
      { name: "description", content: "Manage the items you've posted: edit, mark as sold, or delete." },
    ],
  }),
  component: MyListings,
});

function MyListings() {
  const navigate = useNavigate();
  const { user, listings, isAuthed, isGuest, markSold, deleteListing, loadingListings } = useApp();
  const [filter, setFilter] = useState<"all" | "active" | "sold">("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSkeleton(false), 350);
    return () => clearTimeout(t);
  }, []);

  const myListings = useMemo(
    () => listings.filter((l) => l.seller.id === user.id),
    [listings, user.id]
  );

  const filtered = useMemo(() => {
    if (filter === "active") return myListings.filter((l) => !l.sold);
    if (filter === "sold") return myListings.filter((l) => l.sold);
    return myListings;
  }, [myListings, filter]);

  const activeCount = myListings.filter((l) => !l.sold).length;
  const soldCount = myListings.filter((l) => l.sold).length;

  if (isGuest || !isAuthed) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="mx-5 mt-20 rounded-3xl bg-gradient-hero p-8 text-center text-primary-foreground shadow-glow">
          <h2 className="font-display text-2xl font-bold">Sign in to manage listings</h2>
          <p className="mt-2 text-sm opacity-90">Create an account to start posting and managing your items.</p>
          <button onClick={() => navigate({ to: "/auth" as string })} className="mt-6 rounded-full bg-primary-foreground px-6 py-3 text-sm font-bold text-secondary">
            Sign up free
          </button>
        </div>
        <TabBar />
      </div>
    );
  }

  const loading = showSkeleton || loadingListings;

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 px-3 py-3 backdrop-blur-xl">
        <button onClick={() => navigate({ to: "/profile" as string })} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-display text-lg font-bold">My listings</p>
        <Link to={"/post" as string} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      <div className="px-5 pt-5">
        <div className="flex gap-2 rounded-full bg-muted p-1">
          {([
            ["all", `All ${myListings.length}`],
            ["active", `Active ${activeCount}`],
            ["sold", `Sold ${soldCount}`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "flex-1 rounded-full py-2 text-xs font-semibold capitalize transition-all",
                filter === key ? "bg-background shadow-soft" : "text-muted-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square w-full rounded-2xl skeleton" />
                <div className="h-3 w-3/4 rounded skeleton" />
                <div className="h-3 w-1/2 rounded skeleton" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 text-center animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Tag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 font-display text-lg font-bold">
              {filter === "sold" ? "Nothing sold yet" : filter === "active" ? "No active listings" : "You haven't listed anything yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {filter === "all" ? "Post your first item to get started." : "Try another filter or post something new."}
            </p>
            <Link
              to={"/post" as string}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
            >
              <Plus className="h-4 w-4" /> Post a listing
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 animate-fade-in">
            {filtered.map((l) => (
              <div key={l.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <Link to={"/listing/$id" as string} params={{ id: l.id } as never} className="relative block aspect-square w-full bg-muted">
                  <img src={l.photos[0]} alt={l.title} className="h-full w-full object-cover" />
                  {l.sold && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                      <span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-background">Sold</span>
                    </div>
                  )}
                  {l.type === "Trade" && !l.sold && (
                    <span className="absolute left-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-secondary-foreground">Trade</span>
                  )}
                </Link>
                <div className="p-2.5">
                  <p className="truncate text-sm font-semibold">{l.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.type === "Trade" ? "Trade" : `$${l.price}`} · {l.postedAt}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      onClick={() => navigate({ to: "/post" as string, search: { edit: l.id } as never })}
                      className="flex flex-1 items-center justify-center gap-1 rounded-full border border-border bg-background py-1.5 text-[11px] font-semibold hover:bg-muted"
                      aria-label="Edit listing"
                    >
                      <Edit3 className="h-3 w-3" /> Edit
                    </button>
                    {!l.sold && (
                      <button
                        onClick={() => { markSold(l.id); toast.success("Marked sold ✓"); }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-success-foreground"
                        aria-label="Mark as sold"
                      >
                        <Package className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmId(l.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                      aria-label="Delete listing"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm animate-scale-in rounded-3xl bg-card p-5 shadow-card">
            <p className="font-display text-lg font-bold">Delete this listing?</p>
            <p className="mt-1 text-sm text-muted-foreground">This can't be undone. Saved copies on other accounts will also disappear.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirmId(null)} className="flex-1 rounded-full border border-border bg-background py-2.5 text-sm font-semibold">Cancel</button>
              <button
                onClick={() => { deleteListing(confirmId); setConfirmId(null); toast("Listing deleted"); }}
                className="flex-1 rounded-full bg-destructive py-2.5 text-sm font-bold text-destructive-foreground"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}
