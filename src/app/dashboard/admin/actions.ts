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

// ---------------------------------------------------------------------------
// Procedural job generator — every call produces a unique combination
// ---------------------------------------------------------------------------

const REVENUES = [1,2,3,4,5,6,7,8,9,10,12,14,15,18,20,22,25,28,30,35,40,45,50,60,75,100,120,150,200];
const SQFT = [8,12,15,18,20,24,28,32,40,50,60,75,90,100,120,150,180,200,250,300,400,500];
const UNITS = [8,12,16,20,24,32,40,48,60,72,80,96,100,120,150,180,200,240,280,320,400,500];
const EMPLOYEES = [5,8,10,12,15,18,20,25,30,35,40,50,60,75,100,120,150,200,250,300,400,500];
const TRUCKS = [3,4,5,6,7,8,10,12,14,16,18,20,24,28,32,36,40,48,56,60,72,80];
const CLAIM_AMOUNTS = [18,22,28,35,40,45,55,60,70,80,90,100,110,120,140,150,175,200,225,250,300,350,400];
const RATE_PCTS = [12,15,18,20,22,25,28,30,32,35,38,40,42,45,48,50];
const LIMITS_M = [1,2,3,4,5,6,7,8,10,12,15,20,25];
const PREMIUMS_K = [8,10,12,14,16,18,20,22,25,28,30,35,40,45,50,55,60,70,80,90,100,120,150];
const YEARS_CLEAN = [2,3,4,5,6,7,8,9,10,12,14,15,18,20];
const BUILD_MONTHS = [10,12,14,16,18,20,22,24,28,30,32,36,42,48];
const TURBINES = [4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,36,40,44,48,52,56,60];
const MW = [5,8,10,12,15,18,20,25,30,35,40,50,60,70,80,90,100,120,150,200];
const ACREAGE = [5,8,10,12,15,18,20,25,30,40,50,60,75,80,100,120,150,200];
const AIRCRAFT = [2,3,4,5,6,7,8,9,10,12,14,16];
const STATIONS = [4,6,8,10,12,15,18,20,24,28,30,35,40,50,60,75,100];
const FLOORS = [3,4,5,6,7,8,9,10,12,14,15,16,18,20,22,24,28,30];
const YACHTS_FT = [45,50,55,60,65,70,75,80,90,100,110,120,130,140,150,165,180,200];

const LOSS_HISTORY_PHRASES = [
  (amt: number) => `One GL claim filed ${pick([1,2,3])} year${pick([1,2,3])>1?"s":""} ago — settled at $${amt}K.`,
  (amt: number) => `Two property losses in the past ${pick([3,4,5])} years, $${amt}K aggregate.`,
  (amt: number) => `Prior carrier non-renewed after a $${amt}K claim. Now in the E&S market.`,
  (amt: number) => `Loss ratio was ${pick([55,60,65,70,75,80,85])}% last year. Carrier requesting $${amt}K rate increase.`,
  (_: number) => `Clean loss history — ${pick(YEARS_CLEAN)} years with no claims.`,
  (_: number) => `No prior coverage. First time seeking this line.`,
  (amt: number) => `One workers' comp claim ($${amt}K) closed. GL still clean.`,
  (amt: number) => `Adverse outcome claim in litigation — reserve set at $${amt}K, not yet resolved.`,
];

const TRIGGER_PHRASES = [
  (rate: number) => `Current carrier raising rate ${rate}%. Renewal in ${pick([30,45,60,75,90])} days.`,
  () => `Carrier non-renewing — portfolio pullback. Need a new market fast.`,
  () => `First policy expiring — want an independent review before committing to renewal terms.`,
  () => `Expanding operations and need to revisit whether current program still fits.`,
  () => `Broker submitted a quote — want a second opinion before binding.`,
  () => `Never had this coverage. Looking for program design guidance before going to market.`,
  () => `Acquisition completed last quarter. Inherited the program — want an audit before next renewal.`,
  () => `State regulator flagged a coverage gap. Need analysis before responding.`,
];

const ASK_PHRASES = [
  "Need an independent opinion on whether the rate is defensible and what the renewal strategy should be.",
  "Looking for market direction and whether the current limits are adequate.",
  "Want a second look on the submission before we bind — does the pricing make sense?",
  "Need program design input — what coverage, limits, and conditions are appropriate?",
  "Looking for a coverage gap audit and recommendations before next renewal.",
  "Need help understanding what this line of coverage would realistically cost and cover.",
  "Want to know if we should stay with the current carrier or shop it.",
  "Need an underwriting opinion letter we can share with the board.",
];

type JobSchema = {
  title: string;
  summary: string;
  description: string;
  job_type: "renewal_review"|"second_look"|"new_business_advisory"|"audit"|"program_design"|"other";
  primary_specialty: string;
  additional_specialties: string[];
  difficulty: number;
  estimated_hours: number;
  budget_cents: number;
  budget_type: "flat"|"hourly"|"volunteer";
};

type ScenarioBlueprint = {
  specialty: string;
  additionalSpecialties: string[];
  label: string; // short name for title, e.g. "roofing contractor"
  difficulty: number;
  buildDescription: () => string;
};

const SCENARIO_BLUEPRINTS: ScenarioBlueprint[] = [
  {
    specialty: "cyber", additionalSpecialties: ["professional-liability"],
    label: "tech company", difficulty: 3,
    buildDescription: () => {
      const rev = pick(REVENUES); const emp = pick(EMPLOYEES);
      const limit = pick(LIMITS_M); const prem = pick(PREMIUMS_K);
      return `${emp}-person ${pick(["SaaS","fintech","healthtech","insurtech","logistics tech","edtech"])} company, $${rev}M ARR. Cyber policy at $${limit}M limit / $${prem}K premium. ${pick(["SOC 2 Type II certified.","ISO 27001 in progress.","No formal security certification yet.","Annual pen test completed."])} ${pick(["MFA enforced company-wide.","Partial MFA rollout.","No MFA on legacy systems."])}`;
    },
  },
  {
    specialty: "commercial-property", additionalSpecialties: ["general-liability"],
    label: "warehouse facility", difficulty: 3,
    buildDescription: () => {
      const sqft = pick(SQFT); const rev = pick(REVENUES);
      const [city, state] = pick(CITIES);
      return `${sqft},000 sq ft ${pick(["distribution","cold storage","light manufacturing","fulfillment","flex industrial"])} facility in ${city}, ${state}. Tenant revenue approximately $${rev}M. ${pick(["Sprinklered throughout.","Partial sprinkler coverage.","Non-sprinklered — older build."])} ${pick(["No losses in "+ pick(YEARS_CLEAN) +" years.","One roof claim last year from hail.","Two small property losses in 5 years."])}`;
    },
  },
  {
    specialty: "general-liability", additionalSpecialties: ["products-liability"],
    label: "food & beverage operation", difficulty: 2,
    buildDescription: () => {
      const units = pick([3,5,8,10,12,15,18,20,24,28,32]);
      const rev = pick(REVENUES);
      return `${pick(["Restaurant franchise","Food truck operation","Ghost kitchen network","Catering company","Specialty food manufacturer"])} — ${units} locations, $${rev}M annual revenue. ${pick(["No prior claims.","One slip-and-fall claim 2 years ago.","One product liability claim, closed without payment."])} ${pick(["Operates in 1 state.","Licensed in "+ pick([2,3,4,5]) +" states.","Nationwide operation."])}`;
    },
  },
  {
    specialty: "directors-officers", additionalSpecialties: ["employment-practices"],
    label: "organization D&O", difficulty: 3,
    buildDescription: () => {
      const budget = pick(REVENUES); const board = pick([5,7,8,9,10,11,12,14,15,18,20]);
      const type = pick(["nonprofit arts organization","501(c)(3) healthcare charity","private equity-backed company","family-owned holding company","trade association"]);
      return `${type.charAt(0).toUpperCase() + type.slice(1)}, $${budget}M ${pick(["annual budget","revenue","assets"])}. ${board}-person board. ${pick(["Recent leadership transition.","Two board seats vacant.","Recently added two independent directors.","Board restructured after acquisition."])} ${pick(["No prior D&O claims.","One EEOC complaint filed and dismissed last year.","Shareholder derivative suit pending — outside coverage period."])}`;
    },
  },
  {
    specialty: "construction", additionalSpecialties: ["general-liability"],
    label: "contractor", difficulty: 3,
    buildDescription: () => {
      const rev = pick(REVENUES); const emp = pick(EMPLOYEES);
      const trade = pick(["roofing","electrical","HVAC","plumbing","concrete","framing","general","drywall","painting","excavation"]);
      return `${trade.charAt(0).toUpperCase() + trade.slice(1)} contractor, $${rev}M annual revenue, ${emp} employees. ${pick(["Primarily residential.","Mixed residential and commercial.","Primarily commercial and industrial.","Government contract work."])} ${pick(["Clean loss history.","One GL claim in 3 years, $"+ pick(CLAIM_AMOUNTS) +"K settled.","Two workers' comp claims in 5 years.","EMR of " + (Math.random()*0.4+0.8).toFixed(2) + "."])}`;
    },
  },
  {
    specialty: "transportation", additionalSpecialties: ["general-liability"],
    label: "trucking operation", difficulty: 3,
    buildDescription: () => {
      const trucks = pick(TRUCKS); const rev = pick(REVENUES);
      return `${trucks}-unit ${pick(["long-haul","regional","flatbed","refrigerated","tanker","intermodal","last-mile delivery"])} trucking operation, $${rev}M revenue. ${pick(["Owner-operators only.","Mix of company drivers and O/Os.","All company-employed drivers."])} ${pick(["Clean DOT record.","One DOT violation last year — corrected.","Two HOS violations in prior 12 months.","CSA score above threshold."])} ${pick(["No accidents in "+ pick([1,2,3]) +" years.","One at-fault accident — $"+ pick(CLAIM_AMOUNTS) +"K settled."])}`;
    },
  },
  {
    specialty: "habitational", additionalSpecialties: ["general-liability"],
    label: "apartment complex", difficulty: 3,
    buildDescription: () => {
      const units = pick(UNITS); const [city, state] = pick(CITIES);
      return `${units}-unit ${pick(["garden-style","mid-rise","high-rise","mixed-use","student housing","affordable housing","market-rate"])} apartment complex in ${city}, ${state}. ${pick(["Built "+ (2025-pick([2,5,8,10,15,20,25,30,35,40])) +".","Recently renovated.","Class B property.","Class A — new construction."])} ${pick(["No prior claims.","One slip-and-fall claim, $"+ pick(CLAIM_AMOUNTS) +"K settled.","One water damage claim last year.","Pending habitability complaint — not yet a claim."])}`;
    },
  },
  {
    specialty: "aviation", additionalSpecialties: ["transportation"],
    label: "aviation operator", difficulty: 4,
    buildDescription: () => {
      const aircraft = pick(AIRCRAFT);
      return `${pick(["Part 135 charter","Part 91 corporate flight department","flight school","agricultural aviation","aerial survey","Part 137 ag spray"])} operator. ${aircraft} aircraft (${pick(["turboprops","pistons","jets","helicopters","mixed fleet"])}). ${pick(["Based in the Southeast.","Multi-base operation.","Single-base operation."])} ${pick(["No hull or liability claims in "+ pick([2,3,4,5]) +" years.","One prop strike — $"+ pick(CLAIM_AMOUNTS) +"K, closed.","One liability claim in litigation, reserve $"+ pick(CLAIM_AMOUNTS) +"K."])}`;
    },
  },
  {
    specialty: "healthcare", additionalSpecialties: ["professional-liability"],
    label: "healthcare facility", difficulty: 4,
    buildDescription: () => {
      const type = pick(["ambulatory surgery center","urgent care chain","physician group","behavioral health clinic","home health agency","hospice organization","dental group practice"]);
      const rev = pick(REVENUES); const emp = pick(EMPLOYEES);
      return `${type.charAt(0).toUpperCase() + type.slice(1)}, $${rev}M revenue, ${emp} employees. ${pick(["Single location.","Multi-site — "+ pick([2,3,4,5,6]) +" locations.","Expanding — adding "+ pick([1,2,3]) +" sites."])} ${pick(["No prior malpractice claims.","One adverse outcome claim — $"+ pick(CLAIM_AMOUNTS) +"K reserve.","Two claims in 5 years, both closed.","Current carrier non-renewing."])}`;
    },
  },
  {
    specialty: "marine", additionalSpecialties: ["commercial-property"],
    label: "marine operation", difficulty: 4,
    buildDescription: () => {
      return `${pick(["International cargo shipper","Domestic inland marine operation","Port terminal operator","Freight forwarder","Ship chandler","Marine contractor","Superyacht owner"])}. ${pick(["Shipment value up to $"+ pick(REVENUES) +"M per voyage.","Fleet of "+ pick([1,2,3,4,5]) +" vessels.","Annual cargo throughput $"+ pick(REVENUES) +"M."])} ${pick(["No prior hull or cargo losses.","One cargo claim — $"+ pick(CLAIM_AMOUNTS) +"K, settled.","Coverage gap identified on last audit.","New operation — no loss history."])}`;
    },
  },
  {
    specialty: "cyber", additionalSpecialties: ["directors-officers"],
    label: "financial services firm", difficulty: 4,
    buildDescription: () => {
      const rev = pick(REVENUES); const emp = pick(EMPLOYEES);
      return `${pick(["RIA","broker-dealer","community bank","credit union","payment processor","mortgage company","insurance MGA"])} with $${rev}M revenue and ${emp} employees. ${pick(["Handles PII for "+ pick([500,1000,2500,5000,10000,50000]) +" clients.","Processes $"+ pick([1,5,10,25,50,100]) +"M+ in payments monthly.","Stores PHI for "+ pick([1000,5000,10000,50000]) +" customers."])} ${pick(["SOC 2 Type II certified.","No formal certification.","In the process of SOC 2 audit."])} ${pick(["No cyber incidents.","One phishing incident — no data exfiltrated.","Business email compromise attempt — caught in time.","Ransomware attack "+ pick([1,2,3]) +" year(s) ago — paid $"+ pick([25,50,75,100,150]) +"K ransom."])}`;
    },
  },
  {
    specialty: "professional-liability", additionalSpecialties: ["employment-practices"],
    label: "professional services firm", difficulty: 3,
    buildDescription: () => {
      const rev = pick(REVENUES); const emp = pick(EMPLOYEES);
      const type = pick(["engineering firm","architecture firm","accounting firm","law firm","consulting firm","staffing agency","HR consulting firm","IT managed services provider"]);
      return `${type.charAt(0).toUpperCase() + type.slice(1)}, $${rev}M revenue, ${emp} employees. ${pick(["Primarily public sector clients.","Primarily private sector.","Mixed client base.","Government contract focus."])} ${pick(["No E&O claims.","One E&O claim — $"+ pick(CLAIM_AMOUNTS) +"K, settled out of court.","One EEOC charge, dismissed.","Missed deadline claim filed — in litigation."])}`;
    },
  },
  {
    specialty: "energy", additionalSpecialties: ["commercial-property"],
    label: "energy asset", difficulty: 4,
    buildDescription: () => {
      const type = pick(["onshore wind farm","solar farm","BESS installation","natural gas processing facility","onshore oil production operation","geothermal plant"]);
      const turbines = pick(TURBINES); const mw = pick(MW);
      return `${turbines}-${pick(["turbine","unit","MW","acre"])} ${type}, ${mw}MW nameplate capacity. ${pick(["Located in Texas.","Located in Oklahoma.","Located in the Midwest.","Located in the Mountain West.","Multi-site operation."])} ${pick(["No prior property or BI losses.","One equipment breakdown claim — $"+ pick(CLAIM_AMOUNTS) +"K.","Curtailment event last year — BI exposure unclear.","First year of operation."])}`;
    },
  },
  {
    specialty: "cannabis", additionalSpecialties: ["products-liability"],
    label: "cannabis operation", difficulty: 5,
    buildDescription: () => {
      const acres = pick(ACREAGE); const rev = pick(REVENUES);
      return `${pick(["Outdoor cultivation","Indoor cultivation","Greenhouse grow","Dispensary chain","Vertically integrated MSO","Cannabis manufacturer","Infused products company"])} — ${acres} ${pick(["acres","5,000 sq ft","10,000 sq ft","20,000 sq ft","canopy sq ft"])} operation, $${rev}M projected revenue. ${pick(["State-licensed.","Licensed in "+ pick([2,3,4]) +" states.","Multi-state operator."])} ${pick(["No prior losses.","Product liability claim pending — no reserve set yet.","Prior carrier declined renewal.","Standard market not an option."])}`;
    },
  },
  {
    specialty: "builders-risk", additionalSpecialties: ["construction"],
    label: "construction project", difficulty: 4,
    buildDescription: () => {
      const floors = pick(FLOORS); const tiv = pick([5,8,10,12,15,18,20,25,28,30,35,40,42,50,60,75,80,100]);
      const months = pick(BUILD_MONTHS);
      return `${floors}-story ${pick(["luxury residential tower","mixed-use development","office-to-residential conversion","ground-up hotel","student housing project","medical office building","data center","distribution center"])}. TIV $${tiv}M. Estimated ${months}-month construction timeline. ${pick(["Conventional construction.","Modular construction — some off-site fabrication.","Historic renovation — asbestos abatement complete.","Mass timber construction."])} ${pick(["No prior builders risk claims on developer's book.","One prior project had a water damage claim — $"+ pick(CLAIM_AMOUNTS) +"K.","First project of this scale for the developer."])}`;
    },
  },
  {
    specialty: "ev-charging", additionalSpecialties: ["commercial-property","general-liability"],
    label: "EV charging network", difficulty: 4,
    buildDescription: () => {
      const stations = pick(STATIONS);
      return `${stations}-station ${pick(["Level 2","DC fast charge","mixed Level 2 + DCFC"])} EV charging network. ${pick(["Retail parking locations.","Highway corridor — unattended.","Fleet depot.","Workplace charging.","Multifamily residential.","Mixed retail and highway."])} ${pick(["Equipment value $"+ pick([500,750,1000,1500,2000,2500,3000]) +"K.","Per-station equipment value ~$"+ pick([15,20,25,30,40,50,60,75,100]) +"K."])} ${pick(["New — no loss history.","One EV fire incident at a third-party location; no direct connection.","Customer vehicle damage claim — disputed liability."])}`;
    },
  },
  {
    specialty: "employment-practices", additionalSpecialties: ["directors-officers"],
    label: "employer EPLI", difficulty: 3,
    buildDescription: () => {
      const emp = pick(EMPLOYEES); const rev = pick(REVENUES);
      return `${pick(["Tech company","Retailer","Hospitality group","Healthcare employer","Logistics company","Media company","Financial services firm"])}, ${emp} employees, $${rev}M revenue. ${pick(["Recent RIF — "+ pick([5,10,12,15,18,20,25]) +"% headcount reduction.","Management change — new CEO and CFO.","Rapid growth — headcount doubled in 18 months.","Remote-to-return-to-office conflict."])} ${pick(["No prior EPLI claims.","One EEOC charge — dismissed.","One EPLI claim settled for $"+ pick(CLAIM_AMOUNTS) +"K.","Two claims in 3 years — one settled, one pending."])}`;
    },
  },
  {
    specialty: "psychedelics", additionalSpecialties: ["healthcare","professional-liability"],
    label: "behavioral health clinic", difficulty: 5,
    buildDescription: () => {
      const locs = pick([1,2,3,4,5]);
      return `${pick(["Ketamine-assisted therapy clinic","Psilocybin wellness center","MDMA-assisted therapy practice","Psychedelic integration coaching center"])} — ${locs} location${locs>1?"s":""}. ${pick(["State-licensed.","Operating under research exemption.","Expanding to "+ pick([1,2,3]) +" additional states."])} ${pick(["Standard market declining.","One specialty carrier willing to quote.","No carrier currently on risk.","Prior carrier non-renewed at program expiration."])} ${pick(["No prior malpractice claims.","One adverse reaction event — no claim filed.","Patient complaint under review."])}`;
    },
  },
  {
    specialty: "drones", additionalSpecialties: ["aviation","general-liability"],
    label: "drone operation", difficulty: 3,
    buildDescription: () => {
      const states = pick([1,2,3,4,5,6,7,8]);
      return `${pick(["Precision agriculture drone company","Commercial inspection operation","Aerial photography business","Package delivery pilot","Survey and mapping firm","Infrastructure inspection company"])} operating in ${states} state${states>1?"s":""}. ${pick(["FAA Part 107 certified operators.","BVLOS waiver in place.","Night operations waiver.","No waivers — standard Part 107."])} ${pick([pick(AIRCRAFT) +" aircraft (drones) in fleet.","Fleet of "+ pick(AIRCRAFT) +" UAS."])} ${pick(["No prior aviation or GL claims.","One hull loss — $"+ pick(CLAIM_AMOUNTS) +"K.","Third-party property damage claim pending."])}`;
    },
  },
  {
    specialty: "high-net-worth", additionalSpecialties: ["marine"],
    label: "high-net-worth client", difficulty: 3,
    buildDescription: () => {
      const yachtFt = pick(YACHTS_FT); const rev = pick([5,8,10,12,15,20,25,30,40,50]);
      return `${pick(["Family office","UHNW individual","Private equity partner","Tech founder","Real estate developer"])} with estimated net worth $${pick([5,10,15,20,25,30,40,50,75,100])}M. ${pick(["Primary residence + "+ pick([1,2,3]) +" vacation homes.","Yacht ("+yachtFt+"ft) + primary residence.","Art collection valued at $"+ pick([1,2,3,4,5]) +"M.","Classic car collection — "+ pick([3,5,7,10,12]) +" vehicles."])} ${pick(["Currently with a standard carrier — wants specialty HNW review.","Existing HNW program — wants an audit for gaps.","No umbrella in place.","Umbrella limits may be inadequate for current exposure."])}`;
    },
  },
];

const JOB_TYPES_LIST = [
  "renewal_review","renewal_review","renewal_review", // weighted heavier
  "second_look","second_look",
  "new_business_advisory","new_business_advisory",
  "audit",
  "program_design",
] as const;

function generateJob(cityState: [string, string]): JobSchema {
  const blueprint = pick(SCENARIO_BLUEPRINTS);
  const [city, state] = cityState;
  const jobType = pick(JOB_TYPES_LIST);
  const claimAmt = pick(CLAIM_AMOUNTS);
  const ratePct = pick(RATE_PCTS);

  const lossPhrase = pick(LOSS_HISTORY_PHRASES)(claimAmt);
  const triggerPhrase = pick(TRIGGER_PHRASES)(ratePct);
  const askPhrase = pick(ASK_PHRASES);

  const riskDesc = blueprint.buildDescription();

  const jobTypeLabel: Record<string, string> = {
    renewal_review: "renewal review",
    second_look: "second look",
    new_business_advisory: "new business advisory",
    audit: "coverage audit",
    program_design: "program design",
  };

  const title = `${blueprint.label.charAt(0).toUpperCase() + blueprint.label.slice(1)} — ${jobTypeLabel[jobType]} (${city}, ${state})`;
  const summary = `${riskDesc.split(".")[0]}. ${triggerPhrase.split(".")[0]}.`;
  const description = `${riskDesc} ${lossPhrase} ${triggerPhrase} ${askPhrase}`;

  const difficulty = Math.min(5, Math.max(1, blueprint.difficulty + pick([-1, 0, 0, 1])));
  const estimatedHours = pick([2, 3, 3, 4, 4, 5, 5, 6, 7, 8]);
  const hourlyRate = pick([75, 85, 95, 100, 110, 125, 150]);
  const budgetCents = Math.round((estimatedHours * hourlyRate) / 25) * 2500;

  return {
    title,
    summary: summary.length > 200 ? summary.slice(0, 197) + "…" : summary,
    description,
    job_type: jobType,
    primary_specialty: blueprint.specialty,
    additional_specialties: blueprint.additionalSpecialties,
    difficulty,
    estimated_hours: estimatedHours,
    budget_cents: budgetCents,
    budget_type: "flat",
  };
}

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
  for (let i = 0; i < 20; i++) {
    const t = generateJob(pick(CITIES));
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - daysAgo * 86_400_000).toISOString();

    await service.from("jobs").insert({
      poster_id: adminUser.id,
      title: t.title,
      summary: t.summary,
      description: t.description,
      job_type: t.job_type,
      primary_specialty: t.primary_specialty,
      additional_specialties: t.additional_specialties,
      difficulty: t.difficulty,
      estimated_hours: t.estimated_hours,
      budget_cents: t.budget_cents,
      budget_type: t.budget_type,
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

// ===========================================================================
// DEMO CLEANER — wipes all is_demo jobs + demo-* auth users
// ===========================================================================

export async function clearDemoAction() {
  await assertAdmin();
  const service = createServiceClient();

  // 1. Delete all demo jobs
  const { error: jobsError } = await service
    .from("jobs")
    .delete()
    .eq("is_demo", true);

  if (jobsError) return { error: `Failed to delete demo jobs: ${jobsError.message}` };

  // 2. Find all demo profiles (handle starts with "demo-")
  const { data: demoProfiles, error: profilesError } = await service
    .from("profiles")
    .select("id")
    .like("handle", "demo-%");

  if (profilesError) return { error: `Failed to find demo users: ${profilesError.message}` };

  const demoIds = (demoProfiles ?? []).map((p) => p.id);

  // 3. Delete each auth user — DB trigger cascades to profile + profile_specialties
  let deletedUsers = 0;
  for (const id of demoIds) {
    const { error } = await service.auth.admin.deleteUser(id);
    if (!error) deletedUsers++;
    else console.error(`Failed to delete demo user ${id}: ${error.message}`);
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/jobs");
  revalidatePath("/underwriters");

  return {
    success: true,
    jobsDeleted: 0, // already wiped above
    usersDeleted: deletedUsers,
  };
}
