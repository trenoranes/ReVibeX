import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "ReVibeX — Halifax's secondhand fashion marketplace" },
      { name: "description", content: "Buy, sell and trade secondhand clothing in Halifax. Sustainable style for students and young professionals." },
      { name: "theme-color", content: "#e040fb" },
      { property: "og:title", content: "ReVibeX — Halifax's secondhand fashion marketplace" },
      { property: "og:description", content: "Buy, sell and trade secondhand clothing in Halifax." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@1,9..144,400;1,9..144,500;1,9..144,600;1,9..144,700;1,9..144,800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4 text-center">
      <div>
        <h1 className="font-display text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">404</h1>
        <p className="mt-4 text-muted-foreground">This page doesn't exist.</p>
        <a href="/" className="mt-6 inline-block rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">Go home</a>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><HeadContent /></head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AppProvider>
      {/* Mobile-first app frame: full width on phones, centered card on tablet+ */}
      <div className="min-h-screen sm:bg-muted/30">
        <div className="mx-auto min-h-screen w-full max-w-md bg-background sm:shadow-2xl sm:ring-1 sm:ring-border/50">
          <Outlet />
        </div>
      </div>
      <Toaster position="top-center" />
    </AppProvider>
  );
}
