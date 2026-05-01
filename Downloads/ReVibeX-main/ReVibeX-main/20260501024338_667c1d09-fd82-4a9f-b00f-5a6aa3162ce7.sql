import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useApp } from "@/context/AppContext";
import { TabBar } from "@/components/app/TabBar";
import { ChevronLeft, Send, MoreHorizontal, Trash2 } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const messagesSearchSchema = z.object({
  t: z.string().optional(),
});

export const Route = createFileRoute("/messages")({
  validateSearch: messagesSearchSchema,
  component: Messages,
});

function Messages() {
  const navigate = useNavigate();
  const { t: threadParam } = Route.useSearch();
  const { threads, sendMessage, deleteMessage, loadThreadMessages } = useApp();
  const [activeId, setActiveId] = useState<string | null>(threadParam ?? null);
  const [draft, setDraft] = useState("");
  const [showThemTyping, setShowThemTyping] = useState(true);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync URL → activeId when navigating in with ?t=
  useEffect(() => {
    if (threadParam && threadParam !== activeId) setActiveId(threadParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadParam]);

  // Lazy-load real messages when a thread is opened
  useEffect(() => {
    if (activeId) loadThreadMessages(activeId);
  }, [activeId, loadThreadMessages]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const active = threads.find((t) => t.id === activeId);

  useEffect(() => {
    if (active && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [active?.messages.length, activeId]);


  const send = () => {
    if (!draft.trim() || !activeId) return;
    sendMessage(activeId, draft.trim());
    setDraft("");
    setShowThemTyping(true);
    setTimeout(() => setShowThemTyping(false), 3000);
  };

  if (active) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-3 py-3 backdrop-blur-xl">
          <button onClick={() => { setActiveId(null); navigate({ to: "/messages" as string, search: {} as never }); }} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <img src={active.user.avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
          <div className="flex-1 min-w-0">
            <p className="truncate font-semibold">{active.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">re: {active.listingTitle}</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"><MoreHorizontal className="h-5 w-5" /></button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {active.messages.map((m) => (
            <div key={m.id} className={cn("flex group", m.from === "me" ? "justify-end" : "justify-start")}>
              <div className={cn("relative max-w-[75%] rounded-2xl px-4 py-2.5 text-sm animate-fade-in",
                m.from === "me" ? "rounded-br-sm bg-gradient-primary text-primary-foreground shadow-glow" : "rounded-bl-sm bg-muted text-foreground"
              )}>
                {m.text}
                <p className={cn("mt-1 text-[10px]", m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground")}>{m.time}</p>
                {m.from === "me" && (
                  <button onClick={() => deleteMessage(active.id, m.id)} className="absolute -left-9 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-destructive text-destructive-foreground group-hover:flex">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {showThemTyping && active.typing && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0.15s" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-background px-3 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <div className="flex items-center gap-2">
            <input
              value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Message…"
              className="flex-1 rounded-full border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button onClick={send} disabled={!draft.trim()} className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow disabled:opacity-40 active:scale-95">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-20 bg-background/85 px-5 pb-3 pt-6 backdrop-blur-xl">
        <h1 className="font-display text-3xl font-bold">Messages</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {loading ? "Loading conversations…" : `${threads.reduce((a, t) => a + t.unread, 0)} unread`}
        </p>
      </header>
      {loading ? (
        <ul className="px-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3">
              <div className="h-12 w-12 shrink-0 rounded-full skeleton" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="h-3.5 w-32 rounded skeleton" />
                  <div className="h-2.5 w-10 rounded skeleton" />
                </div>
                <div className="mt-2 h-3 w-3/4 rounded skeleton" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="px-2 animate-fade-in">
          {threads.map((t) => (
            <li key={t.id}>
              <button onClick={() => setActiveId(t.id)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-muted">
                <div className="relative">
                  <img src={t.user.avatar} className="h-12 w-12 rounded-full object-cover" alt="" />
                  {t.unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{t.unread}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-semibold">{t.user.name}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{t.time}</span>
                  </div>
                  <p className={cn("truncate text-sm", t.unread > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {t.typing ? <span className="text-primary italic">typing…</span> : t.lastMessage}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      <TabBar />
    </div>
  );
}
