"use client";

import { X, ChevronDown } from "lucide-react";
import { SPECIALTIES, SPECIALTIES_BY_SLUG, type Specialty } from "@/lib/specialties";

const GROUP_ORDER = ["Property", "Liability", "Specialty", "Emerging", "Personal", "Other"];

interface SpecialtyFilterProps {
  /** Only slugs in this set will appear in the dropdown. Pass all available slugs. */
  available: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

export function SpecialtyFilter({ available, selected, onChange }: SpecialtyFilterProps) {
  const availableSet = new Set(available);

  // Build grouped options — only include slugs that exist in `available` AND aren't already selected
  const groups: { group: string; specs: Specialty[] }[] = [];
  for (const groupName of GROUP_ORDER) {
    const specs = SPECIALTIES.filter(
      (s) => s.group === groupName && availableSet.has(s.slug) && !selected.has(s.slug)
    );
    if (specs.length > 0) groups.push({ group: groupName, specs });
  }

  const hasMore = groups.some((g) => g.specs.length > 0);

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const slug = e.target.value;
    if (!slug) return;
    e.target.value = ""; // reset dropdown immediately
    const next = new Set(selected);
    next.add(slug);
    onChange(next);
  }

  function remove(slug: string) {
    const next = new Set(selected);
    next.delete(slug);
    onChange(next);
  }

  function clearAll() {
    onChange(new Set());
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Selected pills */}
      {[...selected].map((slug) => (
        <button
          key={slug}
          type="button"
          onClick={() => remove(slug)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 py-1 text-xs font-medium text-[var(--color-primary-fg)] transition-opacity hover:opacity-80"
        >
          {SPECIALTIES_BY_SLUG[slug]?.label ?? slug}
          <X className="h-3 w-3" />
        </button>
      ))}

      {/* Dropdown — hidden once all available are selected */}
      {hasMore && (
        <div className="relative">
          <select
            onChange={handleSelect}
            defaultValue=""
            className="h-8 appearance-none rounded-full border border-[var(--color-border)] bg-[var(--color-card)] pl-3 pr-7 text-xs font-medium text-[var(--color-muted)] hover:border-[var(--color-primary)]/60 hover:text-[var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
          >
            <option value="" disabled>
              {selected.size === 0 ? "Filter by specialty…" : "+ Add specialty"}
            </option>
            {groups.map(({ group, specs }) => (
              <optgroup key={group} label={group}>
                {specs.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--color-muted)]" />
        </div>
      )}

      {/* Clear all */}
      {selected.size > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-fg)] hover:underline"
        >
          <X className="h-3 w-3" />
          Clear all
        </button>
      )}
    </div>
  );
}
