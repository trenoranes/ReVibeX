import { Link } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { X } from "@/components/ui/icons";
import { useState } from "react";

export function GuestBanner() {
  const { isGuest } = useApp();
  const [hidden, setHidden] = useState(false);
  if (!isGuest || hidden) return null;
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-secondary px-4 py-2.5 text-secondary-foreground">
      <p className="text-xs">
        You're browsing as a guest. <Link to={"/auth" as string} className="font-semibold underline underline-offset-2">Sign up</Link> to message, save and post.
      </p>
      <button onClick={() => setHidden(true)} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
