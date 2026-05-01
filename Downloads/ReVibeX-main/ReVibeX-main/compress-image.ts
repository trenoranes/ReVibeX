import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { listings as seedListings, threads as seedThreads, currentUser, type Listing, type Seller, type Thread, type Category, type Condition, type Size, type ListingType } from "@/lib/mock-data";
import { toast } from "sonner";

interface AppState {
  isAuthed: boolean;
  isGuest: boolean;
  hasOnboarded: boolean;
  darkMode: boolean;
  saved: string[];
  listings: Listing[];
  threads: Thread[];
  user: Seller;
  session: Session | null;
  loadingListings: boolean;
  login: () => void;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  toggleDark: () => void;
  toggleSaved: (id: string) => Promise<void>;
  addListing: (l: Omit<Listing, "id" | "seller" | "postedAt"> & { id?: string }) => Promise<string | null>;
  updateListing: (id: string, l: Omit<Listing, "id" | "seller" | "postedAt">) => Promise<boolean>;
  markSold: (id: string) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  updateProfile: (patch: { display_name?: string; location?: string; bio?: string }) => Promise<void>;
  refreshListings: () => Promise<void>;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  deleteMessage: (threadId: string, messageId: string) => Promise<void>;
  openOrCreateThread: (seller: Seller, listingTitle: string) => Promise<string | null>;
  loadThreadMessages: (threadId: string) => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

const get = (k: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(k) ?? fallback;
};

interface DBListing {
  id: string;
  seller_id: string;
  title: string;
  brand: string | null;
  price: number;
  type: string;
  trade_for: string | null;
  category: string;
  condition: string;
  size: string;
  neighbourhood: string;
  description: string | null;
  photos: string[];
  sold: boolean;
  sold_at: string | null;
  created_at: string;
}

interface DBProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  location: string | null;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function buildSeller(profile: DBProfile | undefined, fallbackId: string): Seller {
  return {
    id: fallbackId,
    name: profile?.display_name || "Seller",
    avatar: profile?.avatar_url || `https://i.pravatar.cc/150?u=${fallbackId}`,
    rating: 5.0,
    sales: 0,
    followers: 0,
    verified: false,
    neighbourhood: profile?.location?.replace(", Halifax", "") || "Halifax",
  };
}

function dbToListing(row: DBListing, profilesMap: Map<string, DBProfile>): Listing {
  const profile = profilesMap.get(row.seller_id);
  return {
    id: row.id,
    title: row.title,
    brand: row.brand || "",
    price: Number(row.price),
    type: row.type as ListingType,
    tradeFor: row.trade_for || undefined,
    category: row.category as Category,
    condition: row.condition as Condition,
    size: row.size as Size,
    neighbourhood: row.neighbourhood,
    description: row.description || "",
    photos: row.photos.length ? row.photos : ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"],
    seller: buildSeller(profile, row.seller_id),
    postedAt: timeAgo(row.created_at),
    sold: row.sold,
    soldAt: row.sold_at ? new Date(row.sold_at).getTime() : undefined,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [threads, setThreads] = useState<Thread[]>(seedThreads);
  const [user, setUser] = useState<Seller>(currentUser);
  const [loadingListings, setLoadingListings] = useState(false);

  const refreshListings = useCallback(async () => {
    setLoadingListings(true);
    try {
      const { data: rows, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const sellerIds = Array.from(new Set((rows ?? []).map((r) => r.seller_id)));
      const profilesMap = new Map<string, DBProfile>();
      if (sellerIds.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, location")
          .in("id", sellerIds);
        (profiles ?? []).forEach((p) => profilesMap.set(p.id, p as DBProfile));
      }
      const live = (rows ?? []).map((r) => dbToListing(r as DBListing, profilesMap));
      setListings(live);
    } catch (e) {
      console.error("Failed to load listings", e);
    } finally {
      setLoadingListings(false);
    }
  }, []);

  const refreshSaved = useCallback(async (uid: string | undefined) => {
    if (!uid) { setSaved([]); return; }
    const { data, error } = await supabase.from("saves").select("listing_id").eq("user_id", uid);
    if (error) { console.error(error); return; }
    setSaved((data ?? []).map((r) => r.listing_id));
  }, []);

  const refreshUserProfile = useCallback(async (uid: string | undefined, email: string | undefined) => {
    if (!uid) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, location, bio")
      .eq("id", uid)
      .maybeSingle();
    if (data) {
      setUser({
        id: uid,
        name: data.display_name || email?.split("@")[0] || "You",
        avatar: data.avatar_url || `https://i.pravatar.cc/150?u=${uid}`,
        rating: 5.0,
        sales: 0,
        followers: 0,
        verified: true,
        neighbourhood: data.location?.replace(", Halifax", "") || "Halifax",
      });
    }
  }, []);

  const refreshThreads = useCallback(async (uid: string | undefined) => {
    if (!uid) { setThreads(seedThreads); return; }
    const { data: rows, error } = await supabase
      .from("threads")
      .select("id, buyer_id, seller_id, listing_title, last_message, last_message_at, created_at")
      .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });
    if (error) { console.error("Failed to load threads", error); return; }
    const otherIds = Array.from(new Set((rows ?? []).map((r) => (r.buyer_id === uid ? r.seller_id : r.buyer_id))));
    const profilesMap = new Map<string, DBProfile>();
    if (otherIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, location")
        .in("id", otherIds);
      (profs ?? []).forEach((p) => profilesMap.set(p.id, p as DBProfile));
    }
    const liveThreads: Thread[] = (rows ?? []).map((r) => {
      const otherId = r.buyer_id === uid ? r.seller_id : r.buyer_id;
      return {
        id: r.id,
        user: buildSeller(profilesMap.get(otherId), otherId),
        listingTitle: r.listing_title,
        lastMessage: r.last_message ?? "",
        time: r.last_message_at ? timeAgo(r.last_message_at) : timeAgo(r.created_at),
        unread: 0,
        typing: false,
        messages: [],
      };
    });
    setThreads(liveThreads);
  }, []);

  useEffect(() => {
    setHasOnboarded(get("rvx_onboarded", "0") === "1");
    setIsGuest(get("rvx_guest", "0") === "1");
    const dark = get("rvx_dark", "0") === "1";
    setDarkMode(dark);
    if (dark) document.documentElement.classList.add("dark");

    const isVerified = (s: Session | null) =>
      !!s && (!s.user.email || !!s.user.email_confirmed_at);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      const verified = isVerified(sess);
      setIsAuthed(verified);
      if (verified) {
        setIsGuest(false);
        localStorage.setItem("rvx_guest", "0");
        // Defer DB calls to avoid potential deadlock in the auth callback
        setTimeout(() => {
          refreshUserProfile(sess?.user.id, sess?.user.email);
          refreshSaved(sess?.user.id);
          refreshThreads(sess?.user.id);
        }, 0);
      } else {
        setSaved([]);
        setUser(currentUser);
        setThreads(seedThreads);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      const verified = isVerified(sess);
      setIsAuthed(verified);
      if (verified) {
        refreshUserProfile(sess?.user.id, sess?.user.email);
        refreshSaved(sess?.user.id);
        refreshThreads(sess?.user.id);
      }
    });

    refreshListings();

    return () => subscription.unsubscribe();
  }, [refreshListings, refreshSaved, refreshUserProfile, refreshThreads]);

  // Realtime: refresh thread list whenever a thread row changes for me
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) return;
    const channel = supabase
      .channel(`threads-${uid}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "threads" }, () => {
        refreshThreads(uid);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new as { thread_id: string; sender_id: string; text: string; id: string; created_at: string };
        setThreads((ts) => ts.map((t) => t.id === newMsg.thread_id
          ? {
              ...t,
              lastMessage: newMsg.text,
              time: "now",
              messages: t.messages.some((m) => m.id === newMsg.id)
                ? t.messages
                : [...t.messages, { id: newMsg.id, from: newMsg.sender_id === uid ? "me" : "them", text: newMsg.text, time: timeAgo(newMsg.created_at) }],
            }
          : t));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id, refreshThreads]);

  // Auto-hide sold listings after 36h (local-only purge)
  useEffect(() => {
    const t = setInterval(() => {
      setListings((ls) => ls.filter((l) => !(l.sold && l.soldAt && Date.now() - l.soldAt > 36 * 3600 * 1000)));
    }, 60_000);
    return () => clearInterval(t);
  }, []);


  const value: AppState = {
    isAuthed, isGuest, hasOnboarded, darkMode, saved, listings, threads, user, session, loadingListings,
    login: () => { setIsAuthed(true); setIsGuest(false); localStorage.setItem("rvx_guest", "0"); },
    loginAsGuest: () => { setIsGuest(true); setIsAuthed(false); localStorage.setItem("rvx_guest", "1"); },
    logout: async () => {
      await supabase.auth.signOut();
      setIsAuthed(false); setIsGuest(false);
      setSaved([]); setUser(currentUser);
      localStorage.setItem("rvx_guest", "0");
    },
    completeOnboarding: () => { setHasOnboarded(true); localStorage.setItem("rvx_onboarded", "1"); },
    toggleDark: () => {
      setDarkMode((d) => {
        const n = !d;
        localStorage.setItem("rvx_dark", n ? "1" : "0");
        document.documentElement.classList.toggle("dark", n);
        return n;
      });
    },
    toggleSaved: async (id) => {
      if (!session?.user?.id) {
        toast("Sign up to save items ✨");
        return;
      }
      const uid = session.user.id;
      const isSaved = saved.includes(id);
      // Optimistic update
      setSaved((s) => isSaved ? s.filter((x) => x !== id) : [...s, id]);
      if (isSaved) {
        const { error } = await supabase.from("saves").delete().eq("user_id", uid).eq("listing_id", id);
        if (error) {
          // Saving mock listings (uuid-incompatible ids) will fail — silently ignore those
          if (!/invalid input syntax/i.test(error.message)) {
            toast.error("Could not unsave");
            setSaved((s) => [...s, id]);
          }
        }
      } else {
        const { error } = await supabase.from("saves").insert({ user_id: uid, listing_id: id });
        if (error) {
          if (/invalid input syntax/i.test(error.message)) {
            // mock listing — keep local-only save, no error
          } else {
            toast.error("Could not save");
            setSaved((s) => s.filter((x) => x !== id));
          }
        }
      }
    },
    addListing: async (l) => {
      if (!session?.user?.id) {
        toast.error("Please sign in to post");
        return null;
      }
      const { data, error } = await supabase
        .from("listings")
        .insert({
          seller_id: session.user.id,
          title: l.title,
          brand: l.brand,
          price: l.price,
          type: l.type,
          trade_for: l.tradeFor ?? null,
          category: l.category,
          condition: l.condition,
          size: l.size,
          neighbourhood: l.neighbourhood,
          description: l.description,
          photos: l.photos,
        })
        .select("id")
        .single();
      if (error) { toast.error(error.message); return null; }
      await refreshListings();
      return data.id;
    },
    updateListing: async (id, l) => {
      if (!session?.user?.id) { toast.error("Please sign in"); return false; }
      const { error } = await supabase
        .from("listings")
        .update({
          title: l.title,
          brand: l.brand,
          price: l.price,
          type: l.type,
          trade_for: l.tradeFor ?? null,
          category: l.category,
          condition: l.condition,
          size: l.size,
          neighbourhood: l.neighbourhood,
          description: l.description,
          photos: l.photos,
        })
        .eq("id", id)
        .eq("seller_id", session.user.id);
      if (error) { toast.error(error.message); return false; }
      await refreshListings();
      return true;
    },
    markSold: async (id) => {
      // Local mark for mock listings
      setListings((ls) => ls.map((x) => x.id === id ? { ...x, sold: true, soldAt: Date.now() } : x));
      const { error } = await supabase.from("listings").update({ sold: true, sold_at: new Date().toISOString() }).eq("id", id);
      if (error && !/invalid input syntax/i.test(error.message)) toast.error("Could not update");
    },
    deleteListing: async (id) => {
      setListings((ls) => ls.filter((x) => x.id !== id));
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error && !/invalid input syntax/i.test(error.message)) toast.error("Could not delete");
    },
    updateProfile: async (patch) => {
      if (!session?.user?.id) return;
      const { error } = await supabase.from("profiles").update(patch).eq("id", session.user.id);
      if (error) { toast.error(error.message); return; }
      await refreshUserProfile(session.user.id, session.user.email);
    },
    refreshListings,
    sendMessage: async (threadId, text) => {
      if (!session?.user?.id) { toast.error("Sign in to send messages"); return; }
      // Mock seed threads have non-uuid ids — keep them local-only
      if (!/^[0-9a-f]{8}-/i.test(threadId)) {
        setThreads((ts) => ts.map((t) => t.id === threadId
          ? { ...t, lastMessage: text, time: "now", messages: [...t.messages, { id: Date.now().toString(), from: "me", text, time: "now" }] }
          : t));
        return;
      }
      const { data, error } = await supabase
        .from("messages")
        .insert({ thread_id: threadId, sender_id: session.user.id, text })
        .select("id, created_at")
        .single();
      if (error) { toast.error(error.message); return; }
      // Optimistic local append (realtime echo will dedupe by id)
      setThreads((ts) => ts.map((t) => t.id === threadId
        ? {
            ...t,
            lastMessage: text,
            time: "now",
            messages: t.messages.some((m) => m.id === data.id)
              ? t.messages
              : [...t.messages, { id: data.id, from: "me", text, time: timeAgo(data.created_at) }],
          }
        : t));
    },
    deleteMessage: async (threadId, messageId) => {
      // Optimistic remove
      setThreads((ts) => ts.map((t) => t.id === threadId
        ? { ...t, messages: t.messages.filter((m) => m.id !== messageId) }
        : t));
      if (!/^[0-9a-f]{8}-/i.test(messageId)) return; // local-only mock id
      const { error } = await supabase.from("messages").delete().eq("id", messageId);
      if (error) toast.error("Could not delete message");
    },
    openOrCreateThread: async (seller, listingTitle) => {
      if (!session?.user?.id) { toast("Sign up to message sellers ✨"); return null; }
      const uid = session.user.id;
      if (uid === seller.id) { toast("That's you 🙃"); return null; }

      const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

      // Existing thread in local cache (either real or mock)
      const existing = threads.find((t) => t.user.id === seller.id && t.listingTitle === listingTitle);
      if (existing) return existing.id;

      // Mock seed seller (non-uuid id) — DB insert would fail uuid validation. Create a local-only thread.
      if (!isUuid(seller.id)) {
        const localId = `local-${seller.id}-${Date.now()}`;
        setThreads((ts) => [
          { id: localId, user: seller, listingTitle, lastMessage: "", time: "now", unread: 0, typing: false, messages: [] },
          ...ts,
        ]);
        return localId;
      }

      // Look up in DB — match a thread between the two users for this listing, regardless of direction
      const { data: found, error: findErr } = await supabase
        .from("threads")
        .select("id")
        .or(`and(buyer_id.eq.${uid},seller_id.eq.${seller.id}),and(buyer_id.eq.${seller.id},seller_id.eq.${uid})`)
        .eq("listing_title", listingTitle)
        .maybeSingle();
      if (findErr && !/multiple/i.test(findErr.message)) {
        // Not a "more than one row" error; surface it
        toast.error(findErr.message);
        return null;
      }
      if (found?.id) {
        await refreshThreads(uid);
        return found.id;
      }

      // Create new — current user is the buyer (initiator)
      const { data: created, error } = await supabase
        .from("threads")
        .insert({ buyer_id: uid, seller_id: seller.id, listing_title: listingTitle })
        .select("id")
        .single();
      if (error) { toast.error(error.message); return null; }
      await refreshThreads(uid);
      return created.id;
    },
    loadThreadMessages: async (threadId) => {
      if (!/^[0-9a-f]{8}-/i.test(threadId)) return; // mock thread, messages already inline
      const uid = session?.user?.id;
      if (!uid) return;
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, text, created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) { console.error(error); return; }
      setThreads((ts) => ts.map((t) => {
        if (t.id !== threadId) return t;
        const fromDb = (data ?? []).map((m) => ({
          id: m.id,
          from: (m.sender_id === uid ? "me" : "them") as "me" | "them",
          text: m.text,
          time: timeAgo(m.created_at),
        }));
        const dbIds = new Set(fromDb.map((m) => m.id));
        // Keep any optimistic messages not yet in the DB response
        const optimistic = t.messages.filter((m) => !dbIds.has(m.id));
        return { ...t, messages: [...fromDb, ...optimistic] };
      }));
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
