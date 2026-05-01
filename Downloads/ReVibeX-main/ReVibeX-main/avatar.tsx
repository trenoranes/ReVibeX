import { Link, useRouterState } from "@tanstack/react-router";
import { Home, MessageCircle, Plus, Heart, User } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

type Tab = { to: string; label: string; icon: typeof Home; gated?: boolean; primary?: boolean };
const tabs: Tab[] = [
  { to: "/browse", label: "Browse", icon: Home },
  { to: "/messages", label: "Messages", icon: MessageCircle, gated: true },
  { to: "/post", label: "Post", icon: Plus, primary: true, gated: true },
  { to: "/saved", label: "Saved", icon: Heart, gated: true },
  { to: "/profile", label: "Profile", icon: User },
];

export function TabBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { isAuthed } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-center justify-around border-t border-border bg-background/85 px-2 py-2 backdrop-blur-xl sm:rounded-t-2xl sm:border-x">
        {tabs.map((t) => {
          const active = path.startsWith(t.to);
          const Icon = t.icon;
          if (t.primary) {
            return (
              <Link
                key={t.to}
                to={(!isAuthed && t.gated ? "/auth" : t.to) as string}
                onClick={() => !isAuthed && t.gated && toast("Sign up to post listings ✨")}
                className="-mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow transition-transform active:scale-95"
                aria-label="Post"
              >
                <Icon className="h-6 w-6" />
              </Link>
            );
          }
          return (
            <Link
              key={t.to}
              to={(!isAuthed && t.gated ? "/auth" : t.to) as string}
              onClick={() => {
                if (!isAuthed && t.gated) {
                  toast("Sign up to use this feature ✨");
                  return;
                }
                if (active) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
              <span className="text-[10px] font-medium">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
