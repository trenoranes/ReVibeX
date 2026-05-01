import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Repeat } from "@/components/ui/icons";
import { useApp } from "@/context/AppContext";
import type { Listing } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ListingCard({ listing }: { listing: Listing }) {
  const { saved, toggleSaved, isAuthed } = useApp();
  const isSaved = saved.includes(listing.id);

  const onSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthed) { toast("Sign up to save items ✨"); return; }
    toggleSaved(listing.id);
  };

  return (
    <Link
      to={"/listing/$id" as string}
      params={{ id: listing.id } as never}
      className="group block animate-fade-in"
    >
      <div className="relative overflow-hidden rounded-2xl bg-muted shadow-card">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={listing.photos[0]}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <button
          onClick={onSave}
          aria-label="Save"
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-md transition-transform active:scale-90"
        >
          <Heart className={cn("h-4 w-4", isSaved ? "fill-primary text-primary" : "text-foreground")} />
        </button>
        {listing.type === "Trade" && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground">
            <Repeat className="h-3 w-3" /> Trade
          </span>
        )}
        {listing.sold && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <span className="rounded-full bg-foreground px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-background">Sold</span>
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-semibold">{listing.title}</p>
          <p className="shrink-0 text-sm font-bold text-primary">
            {listing.type === "Trade" ? "Trade" : `$${listing.price}`}
          </p>
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <span className="truncate">@{listing.seller.name.split(" ")[0].toLowerCase()}</span>
          <span>·</span>
          <MapPin className="h-2.5 w-2.5" />
          <span className="truncate">{listing.neighbourhood}</span>
        </div>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] rounded-2xl skeleton" />
      <div className="mt-2 h-3 w-3/4 rounded skeleton" />
      <div className="mt-1.5 h-2.5 w-1/2 rounded skeleton" />
    </div>
  );
}
