import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { ShoppingBag, Repeat, Users, ChevronRight, ChevronLeft } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const slides = [
  {
    icon: ShoppingBag,
    title: "Buy & Sell",
    body: "Browse thousands of preloved pieces from sellers across Halifax — or post your own in seconds.",
  },
  {
    icon: Repeat,
    title: "Trade",
    body: "Swap clothes you no longer wear for something new-to-you. Sustainable, fun, free.",
  },
  {
    icon: Users,
    title: "Community",
    body: "Connect with local fashion lovers. Read reviews, follow your favourite sellers, build trust.",
  },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const { completeOnboarding } = useApp();
  const navigate = useNavigate();

  const finish = () => { completeOnboarding(); navigate({ to: "/auth" }); };
  const next = () => (step < 2 ? setStep(step + 1) : finish());
  const back = () => step > 0 && setStep(step - 1);
  const Slide = slides[step];
  const Icon = Slide.icon;

  // Progress: each step fills 1/3, completing when navigating from step 2
  const progress = ((step + 1) / slides.length) * 100;

  // Swipe gesture
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) next();
    else if (dx > 50) back();
    touchStartX.current = null;
  };

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-soft"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top progress bar */}
      <div className="absolute left-0 right-0 top-0 z-20 h-1 bg-border/40">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-violet-500 shadow-[0_0_12px_rgba(224,64,251,0.6)] transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Ambient gradient blobs that drift as you progress */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary/25 blur-3xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${step * 30}px, ${step * 20}px)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-fuchsia-400/30 blur-3xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${-step * 30}px, ${-step * 20}px)` }}
      />

      <div className="relative z-10 flex justify-between px-6 pt-6">
        <button
          onClick={back}
          disabled={step === 0}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full bg-card/60 backdrop-blur-md transition-all hover:bg-card disabled:pointer-events-none",
            step === 0 ? "opacity-0" : "opacity-100"
          )}
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={finish}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div key={step} className="w-full max-w-sm">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-primary shadow-glow animate-scale-in"
            style={{ animationDelay: "0ms", animationFillMode: "both" }}
          >
            <Icon className="h-11 w-11 text-primary-foreground" />
          </div>
          <h2
            className="mt-8 font-display text-3xl font-bold animate-fade-in"
            style={{ animationDelay: "100ms", animationFillMode: "both" }}
          >
            {Slide.title}
          </h2>
          <p
            className="mt-3 text-balance text-base text-muted-foreground animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            {Slide.body}
          </p>

          <div className="mt-10 flex justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={`${step}-${i}`}
                className="h-20 w-16 overflow-hidden rounded-xl bg-muted shadow-card animate-fade-in"
                style={{
                  animationDelay: `${300 + i * 80}ms`,
                  animationFillMode: "both",
                }}
              >
                <img
                  src={`https://images.unsplash.com/photo-${["1542272604-787c3835535d", "1591047139829-d91aecb6caea", "1539008835657-9e8e9680c956"][i]}?auto=format&fit=crop&w=200&q=70`}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 px-8 pb-10">
        <div className="mb-6 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 ease-out",
                i === step
                  ? "w-10 bg-gradient-to-r from-fuchsia-500 to-violet-500 shadow-[0_0_12px_rgba(224,64,251,0.6)]"
                  : i < step
                    ? "w-1.5 bg-primary/60"
                    : "w-1.5 bg-border hover:bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-4 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:shadow-[0_15px_50px_-10px_rgba(224,64,251,0.7)] active:scale-[0.98]"
        >
          {step === 2 ? "Get Started" : "Next"}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
