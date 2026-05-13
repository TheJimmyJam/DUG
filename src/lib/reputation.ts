/**
 * DUG Reputation Index (RI)
 *
 * A 0–100 composite score built entirely from peer signals and performance data.
 * DUG does not attest to accuracy — underwriters build their own reputation
 * through completed engagements, peer reviews, and Dojo performance.
 *
 * Components (always adds to 100 max):
 *   Peer Score   0–50 pts  Avg rating weighted by review volume confidence
 *   Volume       0–20 pts  Completed engagement count (log-scaled, caps at 10)
 *   Verification 0–15 pts  DUG-verified credential
 *   Tenure       0–15 pts  Years of P&C experience (caps at 15)
 *
 * Tiers:
 *   75–100  Elite
 *   55–74   Established
 *   35–54   Rising
 *   1–34    New
 *   0       — (no signal yet)
 */

export type RITier = "Elite" | "Established" | "Rising" | "New" | "—";

export type ReputationIndex = {
  score: number;         // 0–100, rounded integer
  tier: RITier;
  components: {
    peerScore: number;    // 0–50
    volume: number;       // 0–20
    verification: number; // 0–15
    tenure: number;       // 0–15
  };
  hasSignal: boolean;    // false = no reviews + no engagements yet
};

export type RIInput = {
  rating: number | null;
  rating_count: number;
  completed_job_count: number;
  years_experience: number | null;
  is_verified: boolean;
};

export function computeReputationIndex(profile: RIInput): ReputationIndex {
  // Peer score: full weight at 5+ reviews, tapers below that
  const ratingValue = profile.rating ?? 0;
  const confidence = Math.min(1, profile.rating_count / 5);
  const peerScore = Math.round((ratingValue / 5) * 50 * confidence);

  // Volume: each engagement worth 2 pts, caps at 10 engagements (20 pts)
  const volume = Math.min(profile.completed_job_count, 10) * 2;

  // Verification: binary 15 pts
  const verification = profile.is_verified ? 15 : 0;

  // Tenure: 1 pt per year, caps at 15
  const tenure = Math.min(profile.years_experience ?? 0, 15);

  const score = Math.min(100, peerScore + volume + verification + tenure);

  const hasSignal = profile.rating_count > 0 || profile.completed_job_count > 0;

  const tier: RITier = !hasSignal
    ? "—"
    : score >= 75
    ? "Elite"
    : score >= 55
    ? "Established"
    : score >= 35
    ? "Rising"
    : "New";

  return {
    score,
    tier,
    components: { peerScore, volume, verification, tenure },
    hasSignal,
  };
}

export const RI_TIER_COLORS: Record<RITier, string> = {
  "Elite":       "text-[var(--color-accent)]",
  "Established": "text-[var(--color-success)]",
  "Rising":      "text-[var(--color-primary)]",
  "New":         "text-[var(--color-muted)]",
  "—":           "text-[var(--color-muted)]",
};
