"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient, getCurrentUser } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Guard: only let is_admin profiles through
// ---------------------------------------------------------------------------
async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Not authorized — admin only");
  return user;
}

// ===========================================================================
// USERS
// ===========================================================================

export async function getAllUsersAction() {
  await assertAdmin();
  const service = createServiceClient();

  // Pull auth.users for emails (service role only)
  const { data: authData } = await service.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const { data: profiles, error } = await service
    .from("profiles")
    .select("*, profile_specialties(specialty_slug)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (profiles ?? []).map((p) => ({
    ...p,
    email: emailMap.get(p.id) ?? "",
  }));
}

export async function addUserAction(formData: FormData) {
  await assertAdmin();
  const service = createServiceClient();

  const email = (formData.get("email") as string).trim().toLowerCase();
  const displayName = (formData.get("display_name") as string).trim();
  const role = (formData.get("role") as string) ?? "underwriter";
  const password = (formData.get("password") as string) || "TempPass2026!";
  const isAdmin = formData.get("is_admin") === "true";

  // Derive handle from email local-part
  const rawHandle = email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 28) || "user";
  const handle = rawHandle.length < 3 ? rawHandle + "xxx".slice(0, 3 - rawHandle.length) : rawHandle;

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { handle, display_name: displayName },
  });

  if (error) return { error: error.message };

  // Trigger auto-created the profile row; patch it now
  await service
    .from("profiles")
    .update({ display_name: displayName, role: role as "underwriter" | "poster" | "both", is_admin: isAdmin })
    .eq("id", data.user.id);

  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function deleteUserAction(userId: string) {
  await assertAdmin();
  const service = createServiceClient();

  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function updateUserAction(userId: string, updates: {
  display_name?: string;
  role?: "underwriter" | "poster" | "both";
  is_admin?: boolean;
  is_verified?: boolean;
}) {
  await assertAdmin();
  const service = createServiceClient();

  const { error } = await service.from("profiles").update(updates).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  return { success: true };
}

// ===========================================================================
// JOBS
// ===========================================================================

export async function getAllJobsAction() {
  await assertAdmin();
  const service = createServiceClient();

  const { data, error } = await service
    .from("jobs")
    .select(`
      id, title, summary, status, job_type, primary_specialty,
      difficulty, budget_cents, budget_type, estimated_hours,
      is_demo, created_at, updated_at,
      poster:profiles!jobs_poster_id_fkey(id, handle, display_name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deleteJobAction(jobId: string) {
  await assertAdmin();
  const service = createServiceClient();

  const { error } = await service.from("jobs").delete().eq("id", jobId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function updateJobAction(
  jobId: string,
  updates: {
    title?: string;
    summary?: string;
    status?: "open" | "claimed" | "submitted" | "completed" | "cancelled";
    budget_cents?: number | null;
    budget_type?: "hourly" | "flat" | "volunteer";
    difficulty?: number;
    estimated_hours?: number | null;
  }
) {
  await assertAdmin();
  const service = createServiceClient();

  const { error } = await service.from("jobs").update(updates).eq("id", jobId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  return { success: true };
}

// ===========================================================================
// DEMO GENERATOR — 15 underwriters + 20 jobs per run, additive
// ===========================================================================

const FIRST_NAMES = [
  "James","Maria","Robert","Patricia","Michael","Linda","William","Barbara",
  "David","Elizabeth","Richard","Jennifer","Joseph","Thomas","Susan","Charles",
  "Jessica","Christopher","Sarah","Daniel","Karen","Matthew","Lisa","Anthony",
  "Nancy","Mark","Betty","Donald","Margaret","Steven","Sandra","Ashley",
  "Dorothy","Kimberly","Emily","Michelle","Carol","Amanda","Melissa","Deborah",
  "Stephanie","Rebecca","Sharon","Laura","Cynthia","Kathleen","Amy","Angela",
  "Shirley","Anna","Brenda","Pamela","Emma","Nicole","Helen","Samantha",
  "Katherine","Christine","Debra","Rachel","Carolyn","Janet",
];

const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis",
  "Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson",
  "Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson",
  "White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker",
  "Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
  "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell",
  "Carter","Roberts","Phillips","Evans","Turner","Parker","Collins","Edwards",
  "Stewart","Morris","Murphy","Cook","Rogers","Morgan","Peterson","Cooper",
  "Reed","Bailey","Bell","Gomez","Kelly","Howard","Ward","Cox","Diaz",
  "Richardson","Wood","Watson","Brooks","Bennett","Gray","Reyes","Cruz",
  "Hughes","Price","Myers","Long","Foster","Sanders","Ross","Morales","Powell",
];

const CITIES: [string, string][] = [
  ["Dallas","TX"],["Houston","TX"],["Austin","TX"],["San Antonio","TX"],
  ["New York","NY"],["Los Angeles","CA"],["Chicago","IL"],["Phoenix","AZ"],
  ["Philadelphia","PA"],["San Diego","CA"],["San Jose","CA"],["Jacksonville","FL"],
  ["Columbus","OH"],["Charlotte","NC"],["Indianapolis","IN"],["Seattle","WA"],
  ["Denver","CO"],["Nashville","TN"],["Oklahoma City","OK"],["Las Vegas","NV"],
  ["Memphis","TN"],["Louisville","KY"],["Portland","OR"],["Atlanta","GA"],
  ["Tampa","FL"],["Raleigh","NC"],["Minneapolis","MN"],["Miami","FL"],
  ["Cleveland","OH"],["New Orleans","LA"],["Boise","ID"],["Richmond","VA"],
  ["Hartford","CT"],["Boston","MA"],["Detroit","MI"],["Kansas City","MO"],
  ["Omaha","NE"],["Tulsa","OK"],["Sacramento","CA"],["Albuquerque","NM"],
];

const SPECIALTIES_POOL = [
  "commercial-property","cat-wind","cat-wildfire","cat-flood","habitational",
  "builders-risk","general-liability","products-liability","premises-liability",
  "professional-liability","directors-officers","employment-practices","marine",
  "aviation","energy","construction","transportation","healthcare","entertainment",
  "hospitality","cyber","cannabis","bess","drones","ev-charging","crypto-mining",
  "vertical-farming","psychedelics","high-net-worth","homeowners",
];

const BIOS = [
  "Commercial lines specialist with deep experience in property CAT exposures. Available for second-look reviews and renewal analysis.",
  "Former regional carrier UW now consulting independently. Specialty in liability lines and coverage gap audits.",
  "Retired MGA underwriter. 20+ years writing E&S business. Love the complex stuff standard markets won't touch.",
  "P&C generalist with strong construction background. Mil spouse — work remotely from wherever we land.",
  "Emerging risk specialist. My niche is anything less than 10 years old as a commercial line.",
  "Senior UW background in both personal and commercial lines. Here to stay sharp and build a consulting book.",
  "Actuarial background crossed with underwriting experience. Pricing, exposure analysis, program design.",
  "Inland marine and specialty property. 15 yrs at Lloyd's syndicates before going independent.",
  "Admitted carrier vet now writing E&S business. Strong on CAT modeling interpretation.",
  "Workers' comp and employer liability specialist. Transitioned to consulting after 18 years on the carrier side.",
  "Healthcare liability underwriter. Hospitals, ASCs, physician groups — know the space well.",
  "Cyber and tech E&O specialist. Former incident response background gives me a claims perspective most UWs lack.",
  "Transportation and logistics specialist. Trucking, cargo, warehouse legal liability.",
  "Aviation underwriter — GA, Part 135, drones. Have written everything from Cessnas to helicopters.",
  "Energy sector specialist. Onshore O&G, wind, solar, BESS. Strong loss control background.",
  "Habitational and real estate UW. Multi-family, mixed-use, REITs.",
  "D&O and management liability. Public company, private company, nonprofit — all segments.",
  "Product liability and product recall specialist. Food, pharma, consumer goods.",
  "Marine cargo and hull underwriter. Domestic and international shipments.",
  "Entertainment venue specialist. Amusement parks, venues, special events.",
];

const JOB_TEMPLATES = [
  {
    title: "Cyber liability renewal — fintech startup",
    summary: "Series B fintech, $15M revenue, renewing cyber. SOC 2 certified but recent third-party breach exposure.",
    description: "Series B fintech startup ($15M ARR) renewing cyber liability. SOC 2 Type II certified. Vendor had a breach last year — no direct impact but carrier is asking hard questions. $3M limit at $28K. Need analysis of whether limits are adequate and what the renewal conversation should look like.",
    job_type: "renewal_review", primary_specialty: "cyber",
    additional_specialties: ["professional-liability"], difficulty: 3, estimated_hours: 3, budget_cents: 250000, budget_type: "flat",
  },
  {
    title: "Commercial property — cold storage facility",
    summary: "Multi-tenant cold storage warehouse, 180K sq ft, ammonia refrigeration system.",
    description: "180,000 sq ft multi-tenant cold storage facility. Ammonia refrigeration (500 lb charge). No major losses in 7 years. Current carrier is non-renewing due to portfolio changes. Need underwriting recommendation and market direction.",
    job_type: "new_business_advisory", primary_specialty: "commercial-property",
    additional_specialties: ["general-liability"], difficulty: 4, estimated_hours: 5, budget_cents: 400000, budget_type: "flat",
  },
  {
    title: "General liability — food truck franchise",
    summary: "Regional food truck franchise with 22 units. Need GL second look before binding.",
    description: "Food truck franchise in the Southwest — 22 units, all owner-operated licensees. GL submission is at $950 per unit. Need second look on whether that's defensible and what endorsements are non-negotiable for mobile food operations.",
    job_type: "second_look", primary_specialty: "hospitality",
    additional_specialties: ["general-liability","products-liability"], difficulty: 2, estimated_hours: 2, budget_cents: 175000, budget_type: "flat",
  },
  {
    title: "D&O renewal — nonprofit board",
    summary: "501(c)(3) with $8M budget. D&O renewal with recent personnel dispute history.",
    description: "Nonprofit arts organization, $8M annual budget, 12-person board. D&O renewing. Two board members resigned after personnel dispute last year (no claim filed). Need analysis of exposure and renewal strategy.",
    job_type: "renewal_review", primary_specialty: "directors-officers",
    additional_specialties: ["employment-practices"], difficulty: 3, estimated_hours: 3, budget_cents: 200000, budget_type: "flat",
  },
  {
    title: "Marine cargo — pharmaceutical shipments",
    summary: "Specialty pharma company moving temperature-sensitive product globally. New cargo program needed.",
    description: "Specialty pharmaceutical company shipping biologics globally. Temperature-sensitive, requires cold chain documentation. Currently uninsured on cargo. Need program design recommendation — what coverage, what limits, what conditions.",
    job_type: "program_design", primary_specialty: "marine",
    additional_specialties: ["healthcare","professional-liability"], difficulty: 4, estimated_hours: 6, budget_cents: 550000, budget_type: "flat",
  },
  {
    title: "Construction — roofing contractor GL renewal",
    summary: "Large roofing contractor ($6M revenue) with two claims in 3 years. Renewal audit.",
    description: "Roofing contractor, $6M revenue, residential and light commercial. Two GL claims in 3 years ($40K aggregate). Current carrier raised rate 35%. Need audit of claim drivers and recommendation on renewal strategy.",
    job_type: "audit", primary_specialty: "construction",
    additional_specialties: ["general-liability"], difficulty: 3, estimated_hours: 4, budget_cents: 300000, budget_type: "flat",
  },
  {
    title: "Aviation — charter operator liability",
    summary: "Part 135 charter operator, 6 aircraft. GL/hull renewal — need specialist review.",
    description: "Part 135 charter operator based in TX. 6 aircraft (2 King Airs, 4 pistons). Hull + GL renewing. One prop strike claim ($80K, 2022). Need specialist review of whether the current program is structured correctly.",
    job_type: "renewal_review", primary_specialty: "aviation",
    additional_specialties: ["transportation"], difficulty: 4, estimated_hours: 5, budget_cents: 450000, budget_type: "flat",
  },
  {
    title: "EV charging — highway corridor network",
    summary: "50-station EV charging corridor across TX and NM. Property + GL program needed.",
    description: "Developer building a 50-station EV fast charging corridor along I-40 and I-10. Stations are unattended. Property (equipment) + GL (customer vehicle damage, slips/falls) needed. Need program design input.",
    job_type: "program_design", primary_specialty: "ev-charging",
    additional_specialties: ["commercial-property","general-liability"], difficulty: 4, estimated_hours: 7, budget_cents: 700000, budget_type: "flat",
  },
  {
    title: "Healthcare — outpatient surgery center GL",
    summary: "Free-standing ASC, 4 surgical suites. GL renewal with one adverse outcome claim.",
    description: "Free-standing ambulatory surgery center, 4 suites, 3,200 procedures/year. One adverse outcome claim filed last year (orthopedic). GL renewal needs analysis — should we take the carrier's 40% rate increase or shop it?",
    job_type: "renewal_review", primary_specialty: "healthcare",
    additional_specialties: ["professional-liability","general-liability"], difficulty: 4, estimated_hours: 4, budget_cents: 350000, budget_type: "flat",
  },
  {
    title: "Cannabis — outdoor cultivation property",
    summary: "80-acre outdoor cannabis farm in Oregon. Property and crop coverage needed.",
    description: "80-acre outdoor cannabis cultivation operation in southern Oregon. Crop ($2.2M value at harvest), equipment, and greenhouse structures. No specialty carrier in place — need market identification and program design.",
    job_type: "program_design", primary_specialty: "cannabis",
    additional_specialties: ["commercial-property","products-liability"], difficulty: 5, estimated_hours: 8, budget_cents: 750000, budget_type: "flat",
  },
  {
    title: "Trucking — long-haul fleet renewal",
    summary: "48-truck long-haul fleet (lower 48). Renewal with 3 DOT violations last cycle.",
    description: "Long-haul trucking company, 48 power units. Lower 48 operation. 3 DOT violations in last 12 months (2 HOS, 1 vehicle maintenance). Renewal coming up. Need analysis and loss control recommendations.",
    job_type: "renewal_review", primary_specialty: "transportation",
    additional_specialties: ["general-liability"], difficulty: 3, estimated_hours: 4, budget_cents: 280000, budget_type: "flat",
  },
  {
    title: "Habitational — garden-style apartment GL",
    summary: "250-unit garden-style apartment complex. GL and property renewal in coastal SC.",
    description: "250-unit garden-style apartment complex in Myrtle Beach, SC. Coastal — wind exposure. GL renewing with one slip-and-fall claim. Property carrier non-renewing. Need second-look on GL and market direction for property.",
    job_type: "second_look", primary_specialty: "habitational",
    additional_specialties: ["cat-wind","general-liability"], difficulty: 3, estimated_hours: 3, budget_cents: 225000, budget_type: "flat",
  },
  {
    title: "E&O — independent insurance agency",
    summary: "10-person agency, $4M commission revenue. E&O renewal after a missed deadline claim.",
    description: "10-person independent insurance agency in the Midwest. $4M commission revenue. E&O renewing after a missed renewal deadline claim ($110K settlement). Need analysis of the E&O renewal and whether the standard market is still viable.",
    job_type: "renewal_review", primary_specialty: "professional-liability",
    additional_specialties: ["employment-practices"], difficulty: 3, estimated_hours: 3, budget_cents: 225000, budget_type: "flat",
  },
  {
    title: "Drone agriculture — precision spraying operation",
    summary: "Aerial precision ag company operating in 6 states. Aviation + GL package review.",
    description: "Precision agriculture company using drones for crop spraying and field mapping. Operating in IA, IL, MN, ND, SD, NE. Aviation liability + GL current program — need specialist review before renewal.",
    job_type: "renewal_review", primary_specialty: "drones",
    additional_specialties: ["aviation","general-liability"], difficulty: 3, estimated_hours: 4, budget_cents: 325000, budget_type: "flat",
  },
  {
    title: "EPLI — tech company workforce reduction",
    summary: "200-person SaaS company did a 15% RIF. EPLI renewal review needed.",
    description: "200-person SaaS company did a 15% reduction in force. EPLI renewal in 90 days. Need analysis of the RIF exposure, whether to disclose proactively on the renewal application, and what limits make sense.",
    job_type: "renewal_review", primary_specialty: "employment-practices",
    additional_specialties: ["directors-officers"], difficulty: 4, estimated_hours: 4, budget_cents: 375000, budget_type: "flat",
  },
  {
    title: "Builders risk — luxury condo conversion",
    summary: "12-story historic office to residential conversion in downtown Denver. $42M TIV.",
    description: "Historic 12-story office building conversion to 84 luxury condos in Denver. $42M TIV. Asbestos abatement complete. Estimated 28-month build. Need builders risk underwriting recommendation and key terms to watch.",
    job_type: "new_business_advisory", primary_specialty: "builders-risk",
    additional_specialties: ["commercial-property","construction"], difficulty: 4, estimated_hours: 6, budget_cents: 500000, budget_type: "flat",
  },
  {
    title: "Marine — superyacht liability program",
    summary: "Private family office with 3 yachts. Hull + P&I review.",
    description: "Private family office, 3 superyachts (165ft, 120ft, 80ft). Flagged in Cayman, crewed professionally. Combined hull value $42M. P&I current through a club. Owner wants a consolidated review — is the structure optimal?",
    job_type: "audit", primary_specialty: "marine",
    additional_specialties: ["high-net-worth"], difficulty: 5, estimated_hours: 8, budget_cents: 900000, budget_type: "flat",
  },
  {
    title: "Product recall — food manufacturer",
    summary: "Regional food manufacturer, $18M revenue. Contemplating product recall coverage for the first time.",
    description: "Regional food manufacturer ($18M revenue), branded and private label. No recall in company history but a vendor had a scare last year. Owner wants to understand what recall coverage would cost and cover before the next renewal cycle.",
    job_type: "new_business_advisory", primary_specialty: "products-liability",
    additional_specialties: ["commercial-property"], difficulty: 3, estimated_hours: 4, budget_cents: 325000, budget_type: "flat",
  },
  {
    title: "Energy — onshore wind farm property",
    summary: "28-turbine wind farm in Oklahoma. Property + BI renewal — first independent review.",
    description: "28-turbine onshore wind farm in the Oklahoma panhandle. 70MW nameplate. Property + business interruption renewing. Owner wants to know if the current program adequately covers curtailment and catastrophic blade loss.",
    job_type: "audit", primary_specialty: "energy",
    additional_specialties: ["commercial-property","cat-wind"], difficulty: 4, estimated_hours: 7, budget_cents: 650000, budget_type: "flat",
  },
  {
    title: "Psychedelic therapy clinic — program design",
    summary: "Licensed ketamine clinic expanding to 3 locations. Standard market declining.",
    description: "Licensed ketamine-assisted therapy clinic expanding from 1 to 3 locations in CO. State-licensed. Want malpractice, GL, and property. Standard markets mostly declining. Need program design recommendation and any carrier leads willing to look at it.",
    job_type: "program_design", primary_specialty: "psychedelics",
    additional_specialties: ["healthcare","professional-liability"], difficulty: 5, estimated_hours: 8, budget_cents: 800000, budget_type: "flat",
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function runDemoGeneratorAction() {
  const adminUser = await assertAdmin();
  const service = createServiceClient();

  // ---- 15 demo underwriters ----
  const createdHandles: string[] = [];

  for (let i = 0; i < 15; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const displayName = `${firstName} ${lastName}`;
    const tag = uid();
    const handle = `demo-${firstName.toLowerCase().slice(0, 4)}${lastName.toLowerCase().slice(0, 4)}-${tag}`.slice(0, 32);
    const email = `demo.${tag}@dug-demo.example`;
    const [city, state] = pick(CITIES);
    const yearsExp = Math.floor(Math.random() * 28) + 2;
    const numSpecialties = Math.floor(Math.random() * 3) + 1;
    const specialties = shuffle(SPECIALTIES_POOL).slice(0, numSpecialties);
    const bio = pick(BIOS);

    const { data, error } = await service.auth.admin.createUser({
      email,
      password: "DemoUW2026!",
      email_confirm: true,
      user_metadata: { handle, display_name: displayName },
    });

    if (error) {
      console.error(`Demo UW create error: ${error.message}`);
      continue;
    }

    const userId = data.user.id;

    // Update profile with full demo data
    await service.from("profiles").update({
      handle,
      display_name: displayName,
      bio,
      location_city: city,
      location_state: state,
      years_experience: yearsExp,
      role: "underwriter",
      is_verified: Math.random() > 0.4,
    }).eq("id", userId);

    // Add specialties
    if (specialties.length > 0) {
      await service.from("profile_specialties").insert(
        specialties.map((slug) => ({ profile_id: userId, specialty_slug: slug }))
      );
    }

    createdHandles.push(handle);
  }

  // ---- 20 demo jobs (poster = current admin user) ----
  const shuffledTemplates = shuffle(JOB_TEMPLATES);
  // Cycle through all 20 templates (we have exactly 20)
  for (let i = 0; i < 20; i++) {
    const t = shuffledTemplates[i % shuffledTemplates.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - daysAgo * 86_400_000).toISOString();

    await service.from("jobs").insert({
      poster_id: adminUser.id,
      title: t.title,
      summary: t.summary,
      description: t.description,
      job_type: t.job_type as "renewal_review" | "second_look" | "new_business_advisory" | "audit" | "program_design" | "other",
      primary_specialty: t.primary_specialty,
      additional_specialties: t.additional_specialties ?? [],
      difficulty: t.difficulty,
      estimated_hours: t.estimated_hours ?? null,
      budget_cents: t.budget_cents ?? null,
      budget_type: t.budget_type as "hourly" | "flat" | "volunteer",
      status: "open" as const,
      is_demo: true,
      created_at: createdAt,
    });
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/jobs");
  revalidatePath("/underwriters");

  return {
    success: true,
    underwritersCreated: createdHandles.length,
    jobsCreated: 20,
  };
}
