import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { ChevronLeft, Heart, Share2, MoreVertical, MapPin, Star, Repeat, MessageCircle, Tag, Flag, X, Loader2, DollarSign } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/listing/$id")({
  component: ListingDetail,
});

type OfferMode = null | "offer" | "trade";

function ListingDetail() {
  const { id } = useParams({ from: "/listing/$id" });
  const navigate = useNavigate();
  const { listings, saved, toggleSaved, isAuthed, markSold, user, openOrCreateThread, sendMessage } = useApp();
  const listing = useMemo(() => listings.find((l) => l.id === id), [listings, id]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [offerMode, setOfferMode] = useState<OfferMode>(null);
  const [offerText, setOfferText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!listing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Listing not found.</p>
      </div>
    );
  }

  const isSaved = saved.includes(listing.id);
  const isOwn = listing.seller.id === user.id;

  const gate = (action: string, fn: () => void) => () => {
    if (!isAuthed) { toast(`Sign up to ${action} ✨`); navigate({ to: "/auth" as string }); return; }
    fn();
  };

  const handleMessageSeller = async () => {
    if (isOwn) { toast("That's your own listing 🙃"); return; }
    const threadId = await openOrCreateThread(listing.seller, listing.title);
    if (!threadId) return; // openOrCreateThread already showed a toast
    navigate({ to: "/messages" as string, search: { t: threadId } as never });
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/listing/${listing.id}` : `/listing/${listing.id}`;
    const shareData = {
      title: `${listing.brand} · ${listing.title}`,
      text: `Check out this ${listing.title} on Revere${listing.type === "Sell" ? ` — $${listing.price}` : " — open to trade"}`,
      url,
    };
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard 🔗");
        return;
      }
      toast(url);
    } catch (err) {
      // User cancelled the share sheet — silent
      if ((err as DOMException)?.name !== "AbortError") {
        toast.error("Couldn't share — try again");
      }
    }
  };

  const openOffer = (mode: "offer" | "trade") => {
    if (isOwn) { toast("That's your own listing 🙃"); return; }
    setOfferMode(mode);
    setOfferText("");
  };

  const submitOffer = async () => {
    if (!listing || !offerMode) return;
    const trimmed = offerText.trim();
    if (offerMode === "offer") {
      const num = Number(trimmed);
      if (!trimmed || Number.isNaN(num) || num <= 0) { toast.error("Enter a valid amount"); return; }
    } else if (!trimmed) {
      toast.error("Describe what you'd like to trade"); return;
    }
    setSubmitting(true);
    try {
      const threadId = await openOrCreateThread(listing.seller, listing.title);
      if (!threadId) return;
      const message = offerMode === "offer"
        ? `💸 Offer: $${Number(trimmed)} for "${listing.title}"`
        : `🔁 Trade proposal for "${listing.title}":\n${trimmed}`;
      await sendMessage(threadId, message);
      toast.success(offerMode === "offer" ? "Offer sent 💸" : "Trade proposed 🔁");
      setOfferMode(null);
      setOfferText("");
      navigate({ to: "/messages" as string, search: { t: threadId } as never });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="relative">
        <div className="aspect-square w-full bg-muted">
          <img src={listing.photos[photoIdx]} alt={listing.title} className="h-full w-full object-cover animate-fade-in" key={photoIdx} />
        </div>

        <button onClick={() => navigate({ to: "/browse" as string })} className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-md shadow-soft">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="absolute right-4 top-4 flex gap-2">
          <button onClick={handleShare} aria-label="Share listing" className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-md shadow-soft">
            <Share2 className="h-4 w-4" />
          </button>
          <button onClick={() => setShowMenu((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-md shadow-soft">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {showMenu && (
          <div className="absolute right-4 top-16 z-10 w-48 animate-scale-in rounded-2xl bg-popover p-1.5 shadow-card">
            {isOwn && <button onClick={() => { setShowMenu(false); navigate({ to: "/post" as string, search: { edit: listing.id } as never }); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"><Tag className="h-4 w-4" /> Edit listing</button>}
            {isOwn && !listing.sold && <button onClick={() => { markSold(listing.id); setShowMenu(false); toast.success("Marked as sold ✓"); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"><Tag className="h-4 w-4" /> Mark as sold</button>}
            <button onClick={() => { setShowMenu(false); toast("Reported. Thanks for helping 🙏"); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-destructive hover:bg-muted"><Flag className="h-4 w-4" /> Report listing</button>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {listing.photos.map((_, i) => (
            <button key={i} onClick={() => setPhotoIdx(i)} className={cn("h-1.5 rounded-full transition-all", i === photoIdx ? "w-6 bg-primary-foreground" : "w-1.5 bg-primary-foreground/50")} />
          ))}
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{listing.brand}</p>
            <h1 className="mt-0.5 font-display text-2xl font-bold">{listing.title}</h1>
          </div>
          <p className="font-display text-2xl font-bold text-primary">
            {listing.type === "Trade" ? "Trade" : `$${listing.price}`}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Tag2 label={listing.condition} />
          <Tag2 label={`Size ${listing.size}`} />
          <Tag2 label={listing.category} />
          <Tag2 label={listing.neighbourhood} icon={<MapPin className="h-3 w-3" />} />
        </div>

        {listing.type === "Trade" && listing.tradeFor && (
          <div className="mt-4 rounded-2xl border border-primary/30 bg-accent p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Repeat className="h-3.5 w-3.5" /> Open to trade
            </div>
            <p className="mt-1 text-sm text-foreground">{listing.tradeFor}</p>
          </div>
        )}

        <p className="mt-5 text-sm leading-relaxed text-foreground">{listing.description}</p>

        <Link to={"/profile" as string} className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
          <img src={listing.seller.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold">{listing.seller.name}</p>
              {listing.seller.verified && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">✓</span>}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-primary text-primary" />{listing.seller.rating}</span>
              <span>·</span>
              <span>{listing.seller.sales} sales</span>
            </div>
          </div>
          <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
        </Link>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button onClick={gate("make offers", () => openOffer("offer"))} className="rounded-full border border-border bg-card py-3 text-sm font-semibold shadow-soft hover:bg-muted">Make Offer</button>
          <button onClick={gate("propose trades", () => openOffer("trade"))} className="rounded-full border border-border bg-card py-3 text-sm font-semibold shadow-soft hover:bg-muted">Propose Trade</button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="mx-auto flex max-w-md items-center gap-3 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-xl sm:rounded-t-2xl sm:border-x">
          <button onClick={gate("save items", () => toggleSaved(listing.id))} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-soft">
            <Heart className={cn("h-5 w-5", isSaved && "fill-primary text-primary")} />
          </button>
          <button onClick={gate("message sellers", handleMessageSeller)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98]">
            <MessageCircle className="h-4 w-4" /> Message Seller
          </button>
        </div>
      </div>

      {offerMode && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center animate-fade-in"
          onClick={() => !submitting && setOfferMode(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-card animate-scale-in sm:rounded-3xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-xl font-bold">
                  {offerMode === "offer" ? "Make an offer" : "Propose a trade"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[260px]">
                  for "{listing.title}"{listing.type === "Sell" ? ` · listed at $${listing.price}` : ""}
                </p>
              </div>
              <button
                onClick={() => !submitting && setOfferMode(null)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              {offerMode === "offer" ? (
                <div className="relative">
                  <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    inputMode="decimal"
                    autoFocus
                    value={offerText}
                    onChange={(e) => setOfferText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitOffer()}
                    placeholder="Your offer"
                    className="w-full rounded-2xl border border-border bg-background pl-9 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ) : (
                <textarea
                  autoFocus
                  rows={4}
                  value={offerText}
                  onChange={(e) => setOfferText(e.target.value)}
                  placeholder="What would you like to swap? (e.g. size M cardigan + $20)"
                  className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setOfferMode(null)}
                disabled={submitting}
                className="flex-1 rounded-full border border-border bg-card py-3 text-sm font-semibold hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitOffer}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98] disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Sending…" : offerMode === "offer" ? "Send offer" : "Send proposal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tag2({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
      {icon}{label}
    </span>
  );
}
