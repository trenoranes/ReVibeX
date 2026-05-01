import { cn } from "@/lib/utils";
import { CATEGORY_GROUPS, type Category } from "@/lib/mock-data";

export type CategoryValue = "All" | Category;

interface Props {
  value: CategoryValue;
  onChange: (v: CategoryValue) => void;
}

export function CategoryScroller({ value, onChange }: Props) {
  return (
    <div className="px-4 pb-2">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Category
        </span>
        <select
          aria-label="Choose category"
          value={value}
          onChange={(event) => onChange(event.target.value as CategoryValue)}
          className={cn(
            "h-11 w-full appearance-none rounded-full border border-border bg-muted py-2.5 pl-24 pr-10",
            "font-display text-sm font-semibold text-foreground shadow-soft outline-none transition-colors",
            "hover:bg-accent focus:border-primary focus:ring-2 focus:ring-primary/20",
          )}
        >
          <option value="All">All categories</option>
          {CATEGORY_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.items.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
