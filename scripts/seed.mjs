#!/usr/bin/env node
/**
 * Seed the DUG sandbox with demo profiles, jobs, submissions, and reviews.
 *
 * Idempotent-ish: every demo entity uses an `is_demo`/handle tag so re-running
 * is safe but not perfectly clean — for a hard reset, drop the rows first.
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// -----------------------------------------------------------------------------
// Demo cohort — 8 underwriters across the six archetypes + 2 posters
// -----------------------------------------------------------------------------
const DEMO_USERS = [
  // The poster (Ben himself, conceptually) — also marked "both" so he can claim too
  {
    email: "ben+demo@dug.example",
    handle: "ben",
    display_name: "Ben Volkmer",
    bio: "Founder. 20 years in P&C recruiting, building DUG to give underwriters the broker model.",
    location_city: "Dallas",
    location_state: "TX",
    years_experience: 20,
    role: "both",
    is_verified: true,
    is_admin: true,
    specialties: ["commercial-property", "general-liability"],
  },
  {
    email: "sarah.chen+demo@dug.example",
    handle: "sarahchen",
    display_name: "Sarah Chen, CPCU, AIC",
    bio: "Former Chubb underwriter, now independent. 15 yrs writing cyber and tech E&O. Caregiver to two — work the hours that work for me.",
    location_city: "Austin",
    location_state: "TX",
    years_experience: 15,
    role: "underwriter",
    is_verified: true,
    specialties: ["cyber", "professional-liability"],
  },
  {
    email: "marcus.rivera+demo@dug.example",
    handle: "marcusrivera",
    display_name: "Marcus Rivera",
    bio: "Retired CAT property adjuster (Crawford, 28 yrs). Wildfire and wind specialist. Available for second-look reviews and underwriting consults.",
    location_city: "Boise",
    location_state: "ID",
    years_experience: 28,
    role: "underwriter",
    is_verified: true,
    specialties: ["cat-wildfire", "cat-wind", "commercial-property"],
  },
  {
    email: "priya.shah+demo@dug.example",
    handle: "priyashah",
    display_name: "Priya Shah",
    bio: "Cannabis and emerging risk specialist. 9 yrs at a regional MGA. Currently between roles — taking advisory work to stay sharp.",
    location_city: "Denver",
    location_state: "CO",
    years_experience: 9,
    role: "underwriter",
    is_verified: false,
    specialties: ["cannabis", "products-liability"],
  },
  {
    email: "tom.becker+demo@dug.example",
    handle: "tombecker",
    display_name: "Tom Becker, PE",
    bio: "Former battery storage risk engineer. 12 yrs. Now consulting on BESS, EV charging, and energy storage exposures.",
    location_city: "San Diego",
    location_state: "CA",
    years_experience: 12,
    role: "underwriter",
    is_verified: true,
    specialties: ["bess", "ev-charging", "energy"],
  },
  {
    email: "alex.morgan+demo@dug.example",
    handle: "alexmorgan",
    display_name: "Alex Morgan",
    bio: "Junior commercial UW at a regional carrier. Here to get reps on risks my carrier won't touch.",
    location_city: "Chicago",
    location_state: "IL",
    years_experience: 3,
    role: "underwriter",
    is_verified: false,
    specialties: ["general-liability", "premises-liability", "hospitality"],
  },
  {
    email: "rita.koenig+demo@dug.example",
    handle: "ritakoenig",
    display_name: "Rita Koenig",
    bio: "Retired entertainment-venue UW. 30 yrs. Indoor trampoline parks, escape rooms, climbing gyms — I've underwritten them all.",
    location_city: "Phoenix",
    location_state: "AZ",
    years_experience: 30,
    role: "underwriter",
    is_verified: true,
    specialties: ["entertainment", "premises-liability", "general-liability"],
  },
  {
    email: "javier.ortiz+demo@dug.example",
    handle: "javierortiz",
    display_name: "Javier Ortiz",
    bio: "Drone delivery, UAS, and emerging mobility risks. 7 yrs aviation underwriting before going independent.",
    location_city: "Miami",
    location_state: "FL",
    years_experience: 7,
    role: "underwriter",
    is_verified: true,
    specialties: ["drones", "aviation", "transportation"],
  },
  {
    email: "deborah.clarke+demo@dug.example",
    handle: "deborahclarke",
    display_name: "Deborah Clarke",
    bio: "Construction and contractor liability. 22 yrs. Mil spouse — work from wherever the family lands.",
    location_city: "Norfolk",
    location_state: "VA",
    years_experience: 22,
    role: "underwriter",
    is_verified: true,
    specialties: ["construction", "general-liability"],
  },
  // A second poster — represents an MGA admin
  {
    email: "mga.poster+demo@dug.example",
    handle: "westpoint_mga",
    display_name: "Westpoint Specialty MGA",
    bio: "Specialty MGA writing emerging risks. Posts second-look and program-design jobs.",
    location_city: "Hartford",
    location_state: "CT",
    years_experience: 0,
    role: "poster",
    is_verified: true,
    specialties: [],
  },
];

const DEMO_PASSWORD = "DemoUW2026!"; // shared across demo accounts; auto-confirmed

// -----------------------------------------------------------------------------
// Demo jobs (10–14 across statuses, all marked is_demo=true)
// -----------------------------------------------------------------------------
const DEMO_JOBS = [
  {
    poster: "westpoint_mga",
    title: "Indoor trampoline park — second look on GL pricing",
    summary: "15K sq ft converted warehouse, 450 jumps/day, prior $180K loss. Need second opinion before binding.",
    description:
      "Submission for indoor trampoline park in TX. 15,000 sq ft converted warehouse. 450 jump sessions/day. Prior carrier non-renewed after $180K liability claim (foam pit injury, fractured spine). Owner has waivers but enforcement is loose. Asking $22K for $2M GL. Need a second look from someone who's seen these claims — what red flags are we missing? Recommend bind/decline/quote with conditions.",
    job_type: "second_look",
    primary_specialty: "entertainment",
    additional_specialties: ["premises-liability", "general-liability"],
    difficulty: 4,
    estimated_hours: 4,
    budget_cents: 350000,
    budget_type: "flat",
    status: "open",
  },
  {
    poster: "westpoint_mga",
    title: "Cannabis dispensary chain (4 locations) — appetite check",
    summary: "Vertically integrated CO operator, $4.2M revenue, want product liability + property + GL bundle.",
    description:
      "Vertically integrated cannabis operator in Colorado. 4 retail locations + cultivation. $4.2M revenue. Looking for product liability, property, GL bundle. Existing carrier raised rates 40% at renewal. Need someone who knows this market to evaluate whether to quote, at what price, and what exclusions are non-negotiable.",
    job_type: "new_business_advisory",
    primary_specialty: "cannabis",
    additional_specialties: ["products-liability", "commercial-property"],
    difficulty: 4,
    estimated_hours: 6,
    budget_cents: 500000,
    budget_type: "flat",
    status: "open",
  },
  {
    poster: "ben",
    title: "BESS facility (utility-scale, 50MWh) — risk assessment",
    summary: "Lithium-ion battery storage at solar farm in TX. Need fire/thermal-runaway risk analysis before quote.",
    description:
      "Utility-scale battery energy storage system co-located with 200MW solar farm in West Texas. 50MWh nameplate. NFPA 855-compliant on paper. Fire suppression is novec-based. Looking for written risk assessment covering thermal runaway exposure, separation distances, suppression adequacy, and what underwriting questions to ask before quoting $50M property.",
    job_type: "new_business_advisory",
    primary_specialty: "bess",
    additional_specialties: ["energy", "commercial-property"],
    difficulty: 5,
    estimated_hours: 10,
    budget_cents: 1500000,
    budget_type: "flat",
    status: "open",
  },
  {
    poster: "westpoint_mga",
    title: "Drone delivery startup — coverage gap audit",
    summary: "Series A logistics company operating in 3 metros. Audit existing AV/GL stack.",
    description:
      "Drone delivery startup operating in Phoenix, Austin, and Tampa. Series A. Currently has aviation liability + GL but coverage is bolted together from 3 carriers. Need an audit of where the gaps are and recommendations on consolidating onto purpose-built coverage.",
    job_type: "audit",
    primary_specialty: "drones",
    additional_specialties: ["aviation", "professional-liability"],
    difficulty: 4,
    estimated_hours: 8,
    budget_cents: 800000,
    budget_type: "flat",
    status: "open",
  },
  {
    poster: "ben",
    title: "Cyber renewal — manufacturer with $80M revenue",
    summary: "Mid-market industrial manufacturer, no major incidents, renewing cyber liability. Want second opinion on retention/limits.",
    description:
      "Industrial manufacturer ($80M revenue, OT/IT mix). Renewing cyber. Carrier offering $5M limit at $42K with $250K retention. Want second opinion: are limits adequate, is retention reasonable for the exposure, what controls would justify a better rate next year?",
    job_type: "renewal_review",
    primary_specialty: "cyber",
    additional_specialties: ["professional-liability"],
    difficulty: 3,
    estimated_hours: 3,
    budget_cents: 250000,
    budget_type: "flat",
    status: "open",
  },
  {
    poster: "westpoint_mga",
    title: "Wildfire WUI property — defensible space evaluation",
    summary: "Insured high net worth home in CA WUI zone. Owner did major mitigation. Reasonable to bind?",
    description:
      "$3.5M custom home in California wildland-urban interface. Owner spent $80K on defensible space, hardened roof, ember-resistant vents. Want a CAT wildfire specialist to evaluate whether the mitigation is real and write a one-page memo we can use to justify binding the risk.",
    job_type: "new_business_advisory",
    primary_specialty: "cat-wildfire",
    additional_specialties: ["high-net-worth", "commercial-property"],
    difficulty: 4,
    estimated_hours: 5,
    budget_cents: 450000,
    budget_type: "flat",
    status: "claimed",
    claimed_by_handle: "marcusrivera",
  },
  // A completed job → triggers a review row
  {
    poster: "westpoint_mga",
    title: "Escape room facility — premises liability assessment",
    summary: "Completed → reviewed. Reference example for how the flow looks end-to-end.",
    description:
      "Two-location escape room operator in AZ. Asking for $1M GL. Need premises liability assessment and underwriting recommendation.",
    job_type: "second_look",
    primary_specialty: "entertainment",
    additional_specialties: ["premises-liability"],
    difficulty: 3,
    estimated_hours: 3,
    budget_cents: 200000,
    budget_type: "flat",
    status: "completed",
    claimed_by_handle: "ritakoenig",
    submission: {
      recommendation: "quote_with_modifications",
      rationale:
        "Escape rooms are generally manageable risks, but I'd want three modifications before binding: (1) add a fire-evacuation drill requirement (12-month) as a warranty, (2) exclude any \"live actor\" interactive elements unless you see a separate operations review, (3) require a $5K deductible to align ownership with safety practices. With those, $1M GL at the asked premium is defensible. Loss history I've seen on escape rooms is dominated by trip-and-fall in dim rooms and panic-induced injuries during \"surprise\" segments.",
      suggested_premium_cents: 220000,
      suggested_terms: {
        deductible: 5000,
        exclusions: ["live actor interactions"],
        warranties: ["12-month fire drill"],
      },
      red_flags: ["live actors", "low lighting", "no documented evacuation plan"],
      confidence: 4,
    },
    review: {
      rating: 5,
      feedback:
        "Excellent — the live-actor exclusion is exactly the conversation we needed to have with the agent. Bound with the modifications recommended.",
    },
  },
  {
    poster: "ben",
    title: "Hospitality — boutique hotel restaurant liquor liability",
    summary: "Boutique hotel adding rooftop bar. Need liquor liability appetite + pricing input.",
    description:
      "30-room boutique hotel in Dallas adding a rooftop bar. Want $1M liquor liability. Need someone who's underwritten hospitality F&B to give pricing direction and call out red flags.",
    job_type: "new_business_advisory",
    primary_specialty: "hospitality",
    additional_specialties: ["general-liability"],
    difficulty: 3,
    estimated_hours: 3,
    budget_cents: 175000,
    budget_type: "flat",
    status: "open",
  },
  {
    poster: "westpoint_mga",
    title: "Construction defect — multi-family GC retrospective",
    summary: "Mid-size GC, 200 units/yr. Looking at last 5 yrs of claim activity for go/no-go on renewal.",
    description:
      "General contractor doing 200+ multi-family units annually in VA/NC/SC. Last 5 years claim activity needs review. Recommendation needed: renew, renew with rate increase, decline, or quote with new exclusions.",
    job_type: "renewal_review",
    primary_specialty: "construction",
    additional_specialties: ["general-liability"],
    difficulty: 4,
    estimated_hours: 6,
    budget_cents: 600000,
    budget_type: "flat",
    status: "claimed",
    claimed_by_handle: "deborahclarke",
  },
  {
    poster: "ben",
    title: "Vertical farm — emerging-risk program design input",
    summary: "Indoor vertical farming operator scaling fast. Want input on what a program would need to cover.",
    description:
      "Indoor vertical farming startup with operations in 4 states, expanding to 8. Want input from someone who's seen this exposure: what coverages should a packaged program include, what's the loss profile, what carriers are even open to writing this?",
    job_type: "program_design",
    primary_specialty: "vertical-farming",
    additional_specialties: ["commercial-property", "general-liability"],
    difficulty: 5,
    estimated_hours: 8,
    budget_cents: 900000,
    budget_type: "flat",
    status: "open",
  },
  // A volunteer / portfolio-builder job
  {
    poster: "ben",
    title: "[Sandbox] Crypto mining facility — write your own analysis",
    summary: "No-pay portfolio-builder. Whoever does this gets featured.",
    description:
      "Cryptocurrency mining operation in WV. 20MW load, immersion-cooled. No standard market wants to touch it. This is an open exercise — write your best analysis on appetite, exclusions, and what a reasonable program would look like. Best submission gets featured on the site and a public review on the author's profile. Pay = $0; visibility = real.",
    job_type: "program_design",
    primary_specialty: "crypto-mining",
    additional_specialties: ["commercial-property", "energy"],
    difficulty: 5,
    estimated_hours: 6,
    budget_cents: 0,
    budget_type: "volunteer",
    status: "open",
  },
];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
async function ensureUser(spec) {
  // Upsert via Supabase Auth Admin API.
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const existing = list?.users?.find((u) => u.email === spec.email);
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email: spec.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      handle: spec.handle,
      display_name: spec.display_name,
    },
  });
  if (error) throw new Error(`createUser ${spec.email}: ${error.message}`);
  return data.user.id;
}

async function upsertProfile(userId, spec) {
  // Trigger created the row; we update with full data.
  const { error } = await supabase
    .from("profiles")
    .update({
      handle: spec.handle,
      display_name: spec.display_name,
      bio: spec.bio,
      location_city: spec.location_city,
      location_state: spec.location_state,
      years_experience: spec.years_experience,
      role: spec.role,
      is_verified: spec.is_verified,
      is_admin: spec.is_admin ?? false,
    })
    .eq("id", userId);
  if (error) throw new Error(`updateProfile ${spec.handle}: ${error.message}`);

  // Replace specialties
  await supabase.from("profile_specialties").delete().eq("profile_id", userId);
  if (spec.specialties.length > 0) {
    const rows = spec.specialties.map((slug) => ({
      profile_id: userId,
      specialty_slug: slug,
    }));
    const { error: insErr } = await supabase
      .from("profile_specialties")
      .insert(rows);
    if (insErr) throw new Error(`insertSpecialties ${spec.handle}: ${insErr.message}`);
  }
}

async function upsertJobs(handleToId) {
  // Wipe demo jobs first so re-runs are clean.
  await supabase.from("jobs").delete().eq("is_demo", true);

  for (const j of DEMO_JOBS) {
    const posterId = handleToId.get(j.poster);
    if (!posterId) throw new Error(`unknown poster handle: ${j.poster}`);

    const claimedById = j.claimed_by_handle
      ? handleToId.get(j.claimed_by_handle)
      : null;

    const insert = {
      poster_id: posterId,
      title: j.title,
      summary: j.summary,
      description: j.description,
      job_type: j.job_type,
      primary_specialty: j.primary_specialty,
      additional_specialties: j.additional_specialties ?? [],
      difficulty: j.difficulty,
      estimated_hours: j.estimated_hours ?? null,
      budget_cents: j.budget_cents ?? null,
      budget_type: j.budget_type,
      status: j.status === "claimed" ? "claimed" : j.status === "completed" ? "completed" : "open",
      claimed_by: claimedById,
      claimed_at: claimedById ? new Date(Date.now() - 86_400_000 * 3).toISOString() : null,
      completed_at: j.status === "completed" ? new Date(Date.now() - 86_400_000).toISOString() : null,
      is_demo: true,
    };

    const { data: jobRow, error } = await supabase
      .from("jobs")
      .insert(insert)
      .select("id")
      .single();
    if (error) throw new Error(`insertJob ${j.title}: ${error.message}`);
    const jobId = jobRow.id;

    // Submission + review for the completed example
    if (j.submission && claimedById) {
      const { data: sub, error: subErr } = await supabase
        .from("submissions")
        .insert({
          job_id: jobId,
          underwriter_id: claimedById,
          recommendation: j.submission.recommendation,
          rationale: j.submission.rationale,
          suggested_premium_cents: j.submission.suggested_premium_cents ?? null,
          suggested_terms: j.submission.suggested_terms ?? null,
          red_flags: j.submission.red_flags ?? [],
          confidence: j.submission.confidence,
        })
        .select("id")
        .single();
      if (subErr) throw new Error(`insertSubmission ${j.title}: ${subErr.message}`);

      if (j.review) {
        const { error: revErr } = await supabase.from("reviews").insert({
          job_id: jobId,
          submission_id: sub.id,
          poster_id: posterId,
          underwriter_id: claimedById,
          rating: j.review.rating,
          feedback: j.review.feedback,
        });
        if (revErr) throw new Error(`insertReview ${j.title}: ${revErr.message}`);
      }
    }
  }
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
async function main() {
  console.log(`Seeding ${DEMO_USERS.length} demo users…`);
  const handleToId = new Map();
  for (const u of DEMO_USERS) {
    const id = await ensureUser(u);
    await upsertProfile(id, u);
    handleToId.set(u.handle, id);
    console.log(`  · ${u.handle}`);
  }

  console.log(`\nSeeding ${DEMO_JOBS.length} demo jobs…`);
  await upsertJobs(handleToId);

  console.log("\nDone.\n");
  console.log("Demo login (any of the above):");
  console.log(`  email:    sarah.chen+demo@dug.example`);
  console.log(`  password: ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
