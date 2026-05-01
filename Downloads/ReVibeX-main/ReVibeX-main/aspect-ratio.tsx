import { cn } from "@/lib/utils";
import logoMark from "@/assets/logo-variant-monogram.png";

export function Logo({ className, size = 28, showText = true }: { className?: string; size?: number; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={logoMark}
        alt="ReVibeX"
        width={1024}
        height={1024}
        loading="lazy"
        className="rounded-[28%] shadow-glow"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className="font-display font-bold tracking-tight" style={{ fontSize: size * 0.7 }}>
          ReVibe<span className="text-primary">X</span>
        </span>
      )}
    </div>
  );
}
