/**
 * DUG Pricing Configuration
 *
 * Suggested engagement rate ranges and platform fees.
 * Source of truth is the `platform_config` table in Supabase (key: "pricing").
 * The values below are fallback defaults used only if the DB row is missing.
 * Admins edit these from /dashboard/admin → Pricing tab.
 *
 * Ranges are in USD dollars (not cents).
 */

export type BudgetRange = { min: number; max: number } | null;

export type PricingHint = {
  flat: BudgetRange;
  hourly: BudgetRange;
  label: string; // e.g. "Straightforward", shown in the hint
};

/**
 * Suggested ranges by complexity level (1–5).
 * Flat = total fee for the engagement. Hourly = $/hr.
 */
export const PRICING_BY_DIFFICULTY: Record<number, PricingHint> = {
  1: {
    label: "Straightforward",
    flat:   { min: 25,  max: 100  },
    hourly: { min: 35,  max: 65   },
  },
  2: {
    label: "Moderate",
    flat:   { min: 75,  max: 250  },
    hourly: { min: 50,  max: 100  },
  },
  3: {
    label: "Complex",
    flat:   { min: 150, max: 500  },
    hourly: { min: 75,  max: 150  },
  },
  4: {
    label: "Advanced",
    flat:   { min: 300, max: 1000 },
    hourly: { min: 100, max: 250  },
  },
  5: {
    label: "Expert",
    flat:   { min: 500, max: 2500 },
    hourly: { min: 150, max: 400  },
  },
};

/**
 * Overrides for specific job types that skew outside the complexity norms.
 * Only flat ranges here — these are inherently project-scoped.
 */
export const PRICING_OVERRIDES_BY_JOB_TYPE: Partial<Record<string, BudgetRange>> = {
  program_design:        { min: 500,  max: 5000  },
  portfolio_audit:       { min: 200,  max: 2000  },
  ai_benchmark:          { min: 500,  max: 10000 },
  pre_broker_consult:    { min: 50,   max: 250   },
  coverage_dispute:      { min: 100,  max: 500   },
};

/**
 * Per-find bounty defaults — shown in the bounty UI.
 */
export const BOUNTY_DEFAULTS = {
  defaultPerFind:   8,   // $ per confirmed find
  suggestedMin:     5,
  suggestedMax:     50,
};

/**
 * Platform fee rates by requester tier (basis points, e.g. 2000 = 20%).
 * Stored as integers to avoid float math.
 */
export const PLATFORM_FEES: Record<string, number> = {
  consumer:     2000, // 20%
  professional: 1500, // 15%
  enterprise:   1000, // 10%
  strategic:     750, // 7.5%
};

export function getPlatformFeeLabel(requesterType: string): string {
  const bps = PLATFORM_FEES[requesterType] ?? PLATFORM_FEES.professional;
  return `${(bps / 100).toFixed(0)}%`;
}

/**
 * Get the advisory pricing hint for a given complexity + job type + budget type.
 * Returns null if no useful hint is available.
 */
export function getPricingHint(
  difficulty: number,
  jobType: string,
  budgetType: "flat" | "hourly" | "per_find" | "milestone" | "volunteer",
): { range: BudgetRange; label: string; isOverride: boolean } | null {
  if (budgetType === "volunteer" || budgetType === "per_find" || budgetType === "milestone") {
    return null;
  }

  const byDifficulty = PRICING_BY_DIFFICULTY[difficulty];
  if (!byDifficulty) return null;

  // Job-type overrides only apply to flat fees
  if (budgetType === "flat" && PRICING_OVERRIDES_BY_JOB_TYPE[jobType]) {
    return {
      range: PRICING_OVERRIDES_BY_JOB_TYPE[jobType]!,
      label: byDifficulty.label,
      isOverride: true,
    };
  }

  const range = budgetType === "hourly" ? byDifficulty.hourly : byDifficulty.flat;
  return range ? { range, label: byDifficulty.label, isOverride: false } : null;
}

// ---------------------------------------------------------------------------
// Typed shape of the DB row — must match the JSON seeded in the migration
// ---------------------------------------------------------------------------

export type PricingConfig = {
  platformFees: Record<string, number>;           // basis points
  byDifficulty: Record<string, {
    label: string;
    flat:   { min: number; max: number };
    hourly: { min: number; max: number };
  }>;
  jobTypeOverrides: Record<string, { min: number; max: number }>;
  bounty: {
    defaultPerFind: number;
    suggestedMin: number;
    suggestedMax: number;
  };
};

// ---------------------------------------------------------------------------
// Server-side loader — reads from DB, falls back to static defaults
// ---------------------------------------------------------------------------

/** Call this in server components / actions to get live config from Supabase. */
export async function loadPricingConfig(): Promise<PricingConfig> {
  // Dynamic import so this file stays importable from client components too
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_config" as any)
    .select("value")
    .eq("key", "pricing")
    .single();
  if (data?.value) return data.value as PricingConfig;

  // Fallback to static defaults if DB row is missing
  return {
    platformFees: PLATFORM_FEES,
    byDifficulty: Object.fromEntries(
      Object.entries(PRICING_BY_DIFFICULTY).map(([k, v]) => [k, {
        label: v.label,
        flat:   v.flat   ?? { min: 0, max: 0 },
        hourly: v.hourly ?? { min: 0, max: 0 },
      }])
    ),
    jobTypeOverrides: Object.fromEntries(
      Object.entries(PRICING_OVERRIDES_BY_JOB_TYPE)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, v!])
    ),
    bounty: BOUNTY_DEFAULTS,
  };
}
