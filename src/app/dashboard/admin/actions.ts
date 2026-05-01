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

const CITIES_DEMO: [string, string][] = [
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
  "Workers comp and employer liability specialist. Transitioned to consulting after 18 years on the carrier side.",
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

const REVENUES_D = [1,2,3,4,5,6,7,8,9,10,12,14,15,18,20,22,25,28,30,35,40,45,50,60,75,100];
const EMPLOYEES_D = [5,8,10,12,15,18,20,25,30,35,40,50,60,75,100,120,150,200,250,300];
const TRUCKS_D = [3,4,5,6,7,8,10,12,14,16,18,20,24,28,32,36,40,48];
const CLAIM_AMOUNTS_D = [18,22,28,35,40,45,55,60,70,80,90,100,110,120,140,150,175,200];
const RATE_PCTS_D = [12,15,18,20,22,25,28,30,32,35,38,40,42,45,48,50];
const LIMITS_M_D = [1,2,3,4,5,6,7,8,10,12,15,20,25];
const PREMIUMS_K_D = [8,10,12,14,16,18,20,22,25,28,30,35,40,45,50,55,60,70,80];
const YEARS_CLEAN_D = [2,3,4,5,6,7,8,9,10,12,14,15,18,20];
const BUILD_MONTHS_D = [10,12,14,16,18,20,22,24,28,30,32,36,42,48];
const TURBINES_D = [4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,36,40];
const MW_D = [5,8,10,12,15,18,20,25,30,35,40,50,60,70,80,90,100];
const ACREAGE_D = [5,8,10,12,15,18,20,25,30,40,50,60,75,80,100,120];
const AIRCRAFT_D = [2,3,4,5,6,7,8,9,10,12];
const STATIONS_D = [4,6,8,10,12,15,18,20,24,28,30,35,40,50];
const FLOORS_D = [3,4,5,6,7,8,9,10,12,14,15,16,18,20,22,24];
const UNITS_D = [8,12,16,20,24,32,40,48,60,72,80,96,100,120,150,180,200];
const YACHTS_FT_D = [45,50,55,60,65,70,75,80,90,100,110,120,130,140,150,165];

const LOSS_HISTORY_PHRASES_D = [
  (amt: number) => `One GL claim filed ${pickD([1,2,3])} year(s) ago — settled at $${amt}K.`,
  (amt: number) => `Two property losses in the past ${pickD([3,4,5])} years, $${amt}K aggregate.`,
  (amt: number) => `Prior carrier non-renewed after a $${amt}K claim. Now in the E&S market.`,
  (amt: number) => `Loss ratio was ${pickD([55,60,65,70,75,80,85])}% last year. Carrier requesting $${amt}K rate increase.`,
  (_: number) => `Clean loss history — ${pickD(YEARS_CLEAN_D)} years with no claims.`,
  (_: number) => `No prior coverage. First time seeking this line.`,
  (amt: number) => `One workers comp claim ($${amt}K) closed. GL still clean.`,
  (amt: number) => `Adverse outcome claim in litigation — reserve set at $${amt}K, not yet resolved.`,
];

const TRIGGER_PHRASES_D = [
  (rate: number) => `Current carrier raising rate ${rate}%. Renewal in ${pickD([30,45,60,75,90])} days.`,
  () => `Carrier non-renewing — portfolio pullback. Need a new market fast.`,
  () => `First policy expiring — want an independent review before committing to renewal terms.`,
  () => `Expanding operations and need to revisit whether current program still fits.`,
  () => `Broker submitted a quote — want a second opinion before binding.`,
  () => `Never had this coverage. Looking for program design guidance before going to market.`,
  () => `Acquisition completed last quarter. Inherited the program — want an audit before next renewal.`,
  () => `State regulator flagged a coverage gap. Need analysis before responding.`,
];

const ASK_PHRASES_D = [
  "Need an independent opinion on whether the rate is defensible and what the renewal strategy should be.",
  "Looking for market direction and whether the current limits are adequate.",
  "Want a second look on the submission before we bind — does the pricing make sense?",
  "Need program design input — what coverage, limits, and conditions are appropriate?",
  "Looking for a coverage gap audit and recommendations before next renewal.",
  "Need help understanding what this line of coverage would realistically cost and cover.",
  "Want to know if we should stay with the current carrier or shop it.",
  "Need an underwriting opinion letter we can share with the board.",
];

function pickD<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleD<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function uidD(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

type JobSchemaD = {
  title: string; summary: string; description: string;
  job_type: "renewal_review"|"second_look"|"new_business_advisory"|"audit"|"program_design"|"other";
  primary_specialty: string; additional_specialties: string[];
  difficulty: number; estimated_hours: number; budget_cents: number;
  budget_type: "flat"|"hourly"|"volunteer";
};

type ScenarioBlueprintD = {
  specialty: string; additionalSpecialties: string[];
  label: string; difficulty: number; buildDescription: () => string;
};

const SCENARIO_BLUEPRINTS_D: ScenarioBlueprintD[] = [
  { specialty:"cyber", additionalSpecialties:["professional-liability"], label:"tech company", difficulty:3,
    buildDescription:()=>`${pickD(EMPLOYEES_D)}-person ${pickD(["SaaS","fintech","healthtech","insurtech","logistics tech","edtech"])} company, $${pickD(REVENUES_D)}M ARR. Cyber at $${pickD(LIMITS_M_D)}M limit / $${pickD(PREMIUMS_K_D)}K. ${pickD(["SOC 2 Type II certified.","No formal certification yet.","Annual pen test completed."])} ${pickD(["MFA enforced company-wide.","Partial MFA rollout.","No MFA on legacy systems."])}`},
  { specialty:"commercial-property", additionalSpecialties:["general-liability"], label:"warehouse facility", difficulty:3,
    buildDescription:()=>`${pickD(UNITS_D)},000 sq ft ${pickD(["distribution","cold storage","light manufacturing","fulfillment","flex industrial"])} facility. $${pickD(REVENUES_D)}M tenant revenue. ${pickD(["Sprinklered throughout.","Partial sprinkler coverage.","Non-sprinklered."])} ${pickD(["No losses in "+pickD(YEARS_CLEAN_D)+" years.","One roof claim last year.","Two small losses in 5 years."])}`},
  { specialty:"general-liability", additionalSpecialties:["products-liability"], label:"food & beverage operation", difficulty:2,
    buildDescription:()=>`${pickD(["Restaurant franchise","Food truck operation","Ghost kitchen network","Catering company","Specialty food manufacturer"])} — ${pickD([3,5,8,10,12,15,18,20])} locations, $${pickD(REVENUES_D)}M revenue. ${pickD(["No prior claims.","One slip-and-fall claim 2 years ago.","One product liability claim, closed."])} ${pickD(["1 state.","Licensed in "+pickD([2,3,4,5])+" states.","Nationwide."])}`},
  { specialty:"directors-officers", additionalSpecialties:["employment-practices"], label:"organization D&O", difficulty:3,
    buildDescription:()=>`${pickD(["Nonprofit","501(c)(3)","Private equity-backed company","Family-owned holding company","Trade association"])}, $${pickD(REVENUES_D)}M budget. ${pickD([5,7,9,10,12,15])}-person board. ${pickD(["Recent leadership transition.","Two board seats vacant.","Board restructured after acquisition."])} ${pickD(["No prior D&O claims.","One EEOC complaint — dismissed.","Shareholder suit pending."])}`},
  { specialty:"construction", additionalSpecialties:["general-liability"], label:"contractor", difficulty:3,
    buildDescription:()=>`${pickD(["Roofing","Electrical","HVAC","Plumbing","Concrete","Framing","General","Excavation"])} contractor, $${pickD(REVENUES_D)}M revenue, ${pickD(EMPLOYEES_D)} employees. ${pickD(["Primarily residential.","Mixed residential and commercial.","Primarily commercial.","Government contract work."])} ${pickD(["Clean loss history.","One GL claim, $"+pickD(CLAIM_AMOUNTS_D)+"K settled.","EMR of "+(Math.random()*0.4+0.8).toFixed(2)+"."])}`},
  { specialty:"transportation", additionalSpecialties:["general-liability"], label:"trucking operation", difficulty:3,
    buildDescription:()=>`${pickD(TRUCKS_D)}-unit ${pickD(["long-haul","regional","flatbed","refrigerated","tanker","intermodal","last-mile"])} operation, $${pickD(REVENUES_D)}M revenue. ${pickD(["Owner-operators only.","Mix of company and O/O drivers.","All company drivers."])} ${pickD(["Clean DOT record.","One DOT violation — corrected.","Two HOS violations.","CSA score above threshold."])} ${pickD(["No accidents in "+pickD([1,2,3])+" years.","One at-fault accident — $"+pickD(CLAIM_AMOUNTS_D)+"K settled."])}`},
  { specialty:"habitational", additionalSpecialties:["general-liability"], label:"apartment complex", difficulty:3,
    buildDescription:()=>`${pickD(UNITS_D)}-unit ${pickD(["garden-style","mid-rise","high-rise","mixed-use","student housing","affordable housing","market-rate"])} apartment complex. ${pickD(["Recently renovated.","Class B property.","Class A — new construction.","Built "+(2025-pickD([5,10,15,20,30]))+"."])} ${pickD(["No prior claims.","One slip-and-fall, $"+pickD(CLAIM_AMOUNTS_D)+"K settled.","One water damage claim last year."])}`},
  { specialty:"aviation", additionalSpecialties:["transportation"], label:"aviation operator", difficulty:4,
    buildDescription:()=>`${pickD(["Part 135 charter","Part 91 corporate flight department","Flight school","Agricultural aviation","Aerial survey"])} operator. ${pickD(AIRCRAFT_D)} aircraft (${pickD(["turboprops","pistons","jets","helicopters","mixed fleet"])}). ${pickD(["Single-base.","Multi-base operation."])} ${pickD(["No hull or liability claims in "+pickD([2,3,4,5])+" years.","One prop strike — $"+pickD(CLAIM_AMOUNTS_D)+"K, closed.","One liability claim in litigation."])}`},
  { specialty:"healthcare", additionalSpecialties:["professional-liability"], label:"healthcare facility", difficulty:4,
    buildDescription:()=>`${pickD(["Ambulatory surgery center","Urgent care chain","Physician group","Behavioral health clinic","Home health agency","Dental group practice"])}, $${pickD(REVENUES_D)}M revenue, ${pickD(EMPLOYEES_D)} employees. ${pickD(["Single location.","Multi-site — "+pickD([2,3,4,5])+" locations.","Expanding."])} ${pickD(["No prior malpractice claims.","One adverse outcome — $"+pickD(CLAIM_AMOUNTS_D)+"K reserve.","Two claims in 5 years, both closed."])}`},
  { specialty:"marine", additionalSpecialties:["commercial-property"], label:"marine operation", difficulty:4,
    buildDescription:()=>`${pickD(["International cargo shipper","Domestic inland marine operation","Port terminal operator","Freight forwarder","Marine contractor","Superyacht owner"])}. ${pickD(["Shipment value up to $"+pickD(REVENUES_D)+"M per voyage.","Fleet of "+pickD([1,2,3,4,5])+" vessels.","Annual cargo throughput $"+pickD(REVENUES_D)+"M."])} ${pickD(["No prior losses.","One cargo claim — $"+pickD(CLAIM_AMOUNTS_D)+"K, settled.","Coverage gap identified on last audit."])}`},
  { specialty:"cyber", additionalSpecialties:["directors-officers"], label:"financial services firm", difficulty:4,
    buildDescription:()=>`${pickD(["RIA","Broker-dealer","Community bank","Credit union","Payment processor","Mortgage company","Insurance MGA"])} with $${pickD(REVENUES_D)}M revenue, ${pickD(EMPLOYEES_D)} employees. ${pickD(["SOC 2 Type II certified.","No formal certification.","SOC 2 audit in progress."])} ${pickD(["No cyber incidents.","One phishing incident — no exfiltration.","Business email compromise — caught in time.","Ransomware "+pickD([1,2,3])+" year(s) ago."])}`},
  { specialty:"professional-liability", additionalSpecialties:["employment-practices"], label:"professional services firm", difficulty:3,
    buildDescription:()=>`${pickD(["Engineering firm","Architecture firm","Accounting firm","Law firm","Consulting firm","Staffing agency","IT managed services provider"])}, $${pickD(REVENUES_D)}M revenue, ${pickD(EMPLOYEES_D)} employees. ${pickD(["Primarily public sector clients.","Primarily private sector.","Mixed client base."])} ${pickD(["No E&O claims.","One E&O claim — $"+pickD(CLAIM_AMOUNTS_D)+"K, settled.","Missed deadline claim — in litigation."])}`},
  { specialty:"energy", additionalSpecialties:["commercial-property"], label:"energy asset", difficulty:4,
    buildDescription:()=>`${pickD(TURBINES_D)}-unit ${pickD(["onshore wind farm","solar farm","BESS installation","natural gas processing facility","geothermal plant"])}, ${pickD(MW_D)}MW nameplate. ${pickD(["Texas.","Oklahoma.","Midwest.","Mountain West.","Multi-site."])} ${pickD(["No prior property or BI losses.","One equipment breakdown — $"+pickD(CLAIM_AMOUNTS_D)+"K.","Curtailment event last year.","First year of operation."])}`},
  { specialty:"cannabis", additionalSpecialties:["products-liability"], label:"cannabis operation", difficulty:5,
    buildDescription:()=>`${pickD(["Outdoor cultivation","Indoor cultivation","Greenhouse grow","Dispensary chain","Cannabis manufacturer","Infused products company"])} — ${pickD(ACREAGE_D)} acres, $${pickD(REVENUES_D)}M projected revenue. ${pickD(["State-licensed.","Licensed in "+pickD([2,3,4])+" states.","Multi-state operator."])} ${pickD(["No prior losses.","Product liability claim pending.","Prior carrier declined renewal.","Standard market not an option."])}`},
  { specialty:"builders-risk", additionalSpecialties:["construction"], label:"construction project", difficulty:4,
    buildDescription:()=>`${pickD(FLOORS_D)}-story ${pickD(["luxury residential tower","mixed-use development","office-to-residential conversion","ground-up hotel","student housing project","medical office building","data center"])}. TIV $${pickD([5,8,10,15,20,25,30,40,50,60,75,80,100])}M. ${pickD(BUILD_MONTHS_D)}-month timeline. ${pickD(["Conventional construction.","Modular construction.","Historic renovation.","Mass timber."])} ${pickD(["No prior builders risk claims.","One water damage claim — $"+pickD(CLAIM_AMOUNTS_D)+"K.","First project of this scale."])}`},
  { specialty:"ev-charging", additionalSpecialties:["commercial-property","general-liability"], label:"EV charging network", difficulty:4,
    buildDescription:()=>`${pickD(STATIONS_D)}-station ${pickD(["Level 2","DC fast charge","mixed Level 2 + DCFC"])} network. ${pickD(["Retail parking.","Highway corridor — unattended.","Fleet depot.","Workplace charging.","Multifamily residential."])} ${pickD(["New — no loss history.","One EV fire at a third-party location — no direct connection.","Customer vehicle damage claim — disputed."])}`},
  { specialty:"employment-practices", additionalSpecialties:["directors-officers"], label:"employer EPLI", difficulty:3,
    buildDescription:()=>`${pickD(["Tech company","Retailer","Hospitality group","Healthcare employer","Logistics company","Financial services firm"])}, ${pickD(EMPLOYEES_D)} employees, $${pickD(REVENUES_D)}M revenue. ${pickD(["Recent RIF — "+pickD([5,10,15,20,25])+"% headcount reduction.","Management change — new CEO.","Rapid growth — headcount doubled in 18 months.","Return-to-office conflict."])} ${pickD(["No prior EPLI claims.","One EEOC charge — dismissed.","One EPLI claim settled for $"+pickD(CLAIM_AMOUNTS_D)+"K."])}`},
  { specialty:"psychedelics", additionalSpecialties:["healthcare","professional-liability"], label:"behavioral health clinic", difficulty:5,
    buildDescription:()=>`${pickD(["Ketamine-assisted therapy clinic","Psilocybin wellness center","MDMA-assisted therapy practice"])} — ${pickD([1,2,3,4,5])} location(s). ${pickD(["State-licensed.","Operating under research exemption.","Expanding to "+pickD([1,2,3])+" additional states."])} ${pickD(["Standard market declining.","One specialty carrier willing to quote.","No carrier currently on risk."])} ${pickD(["No prior malpractice claims.","One adverse reaction event — no claim filed."])}`},
  { specialty:"drones", additionalSpecialties:["aviation","general-liability"], label:"drone operation", difficulty:3,
    buildDescription:()=>`${pickD(["Precision agriculture drone company","Commercial inspection operation","Aerial photography business","Survey and mapping firm","Infrastructure inspection company"])} in ${pickD([1,2,3,4,5,6,7,8])} state(s). ${pickD(["FAA Part 107 certified.","BVLOS waiver in place.","Night operations waiver."])} Fleet of ${pickD(AIRCRAFT_D)} UAS. ${pickD(["No prior claims.","One hull loss — $"+pickD(CLAIM_AMOUNTS_D)+"K.","Third-party property damage claim pending."])}`},
  { specialty:"high-net-worth", additionalSpecialties:["marine"], label:"high-net-worth client", difficulty:3,
    buildDescription:()=>`${pickD(["Family office","UHNW individual","Private equity partner","Tech founder","Real estate developer"])} with net worth ~$${pickD([5,10,15,20,25,30,40,50,75,100])}M. ${pickD(["Primary + "+pickD([1,2,3])+" vacation homes.","Yacht ("+pickD(YACHTS_FT_D)+"ft) + primary residence.","Art collection $"+pickD([1,2,3,4,5])+"M.","Classic car collection — "+pickD([3,5,7,10,12])+" vehicles."])} ${pickD(["Wants specialty HNW review.","Existing HNW program — audit for gaps.","No umbrella in place.","Umbrella limits may be inadequate."])}`},
];

const JOB_TYPES_LIST_D = [
  "renewal_review","renewal_review","renewal_review",
  "second_look","second_look",
  "new_business_advisory","new_business_advisory",
  "audit","program_design",
] as const;

function generateJobD(cityState: [string, string]): JobSchemaD {
  const blueprint = pickD(SCENARIO_BLUEPRINTS_D);
  const [city, state] = cityState;
  const jobType = pickD(JOB_TYPES_LIST_D);
  const claimAmt = pickD(CLAIM_AMOUNTS_D);
  const ratePct = pickD(RATE_PCTS_D);
  const lossPhrase = pickD(LOSS_HISTORY_PHRASES_D)(claimAmt);
  const triggerPhrase = pickD(TRIGGER_PHRASES_D)(ratePct);
  const askPhrase = pickD(ASK_PHRASES_D);
  const riskDesc = blueprint.buildDescription();
  const jobTypeLabel: Record<string, string> = {
    renewal_review:"renewal review", second_look:"second look",
    new_business_advisory:"new business advisory", audit:"coverage audit", program_design:"program design",
  };
  const title = `${blueprint.label.charAt(0).toUpperCase() + blueprint.label.slice(1)} — ${jobTypeLabel[jobType]} (${city}, ${state})`;
  const summary = `${riskDesc.split(".")[0]}. ${triggerPhrase.split(".")[0]}.`;
  const description = `${riskDesc} ${lossPhrase} ${triggerPhrase} ${askPhrase}`;
  const difficulty = Math.min(5, Math.max(1, blueprint.difficulty + pickD([-1, 0, 0, 1])));
  const estimatedHours = pickD([2, 3, 3, 4, 4, 5, 5, 6, 7, 8]);
  const hourlyRate = pickD([75, 85, 95, 100, 110, 125, 150]);
  const budgetCents = Math.round((estimatedHours * hourlyRate) / 25) * 2500;
  return {
    title, summary: summary.length > 200 ? summary.slice(0, 197) + "…" : summary,
    description, job_type: jobType, primary_specialty: blueprint.specialty,
    additional_specialties: blueprint.additionalSpecialties, difficulty,
    estimated_hours: estimatedHours, budget_cents: budgetCents, budget_type: "flat",
  };
}

export async function runDemoGeneratorAction() {
  const adminUser = await assertAdmin();
  const service = createServiceClient();
  const createdHandles: string[] = [];

  for (let i = 0; i < 15; i++) {
    const firstName = pickD(FIRST_NAMES);
    const lastName = pickD(LAST_NAMES);
    const displayName = `${firstName} ${lastName}`;
    const tag = uidD();
    const handle = `demo-${firstName.toLowerCase().slice(0, 4)}${lastName.toLowerCase().slice(0, 4)}-${tag}`.slice(0, 32);
    const email = `demo.${tag}@dug-demo.example`;
    const [city, state] = pickD(CITIES_DEMO);
    const yearsExp = Math.floor(Math.random() * 28) + 2;
    const numSpecialties = Math.floor(Math.random() * 3) + 1;
    const specialties = shuffleD(SPECIALTIES_POOL).slice(0, numSpecialties);
    const bio = pickD(BIOS);

    const { data, error } = await service.auth.admin.createUser({
      email, password: "DemoUW2026!", email_confirm: true,
      user_metadata: { handle, display_name: displayName },
    });
    if (error) { console.error(`Demo UW create error: ${error.message}`); continue; }

    const userId = data.user.id;
    await service.from("profiles").update({
      handle, display_name: displayName, bio,
      location_city: city, location_state: state,
      years_experience: yearsExp, role: "underwriter",
      is_verified: Math.random() > 0.4,
    }).eq("id", userId);

    if (specialties.length > 0) {
      await service.from("profile_specialties").insert(
        specialties.map((slug) => ({ profile_id: userId, specialty_slug: slug }))
      );
    }
    createdHandles.push(handle);
  }

  for (let i = 0; i < 20; i++) {
    const t = generateJobD(pickD(CITIES_DEMO));
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - daysAgo * 86_400_000).toISOString();
    await service.from("jobs").insert({
      poster_id: adminUser.id, title: t.title, summary: t.summary,
      description: t.description, job_type: t.job_type,
      primary_specialty: t.primary_specialty, additional_specialties: t.additional_specialties,
      difficulty: t.difficulty, estimated_hours: t.estimated_hours,
      budget_cents: t.budget_cents, budget_type: t.budget_type,
      status: "open" as const, is_demo: true, created_at: createdAt,
    });
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/jobs");
  revalidatePath("/underwriters");
  return { success: true, underwritersCreated: createdHandles.length, jobsCreated: 20 };
}

export async function clearDemoAction() {
  await assertAdmin();
  const service = createServiceClient();

  const { error: jobsError } = await service.from("jobs").delete().eq("is_demo", true);
  if (jobsError) return { error: `Failed to delete demo jobs: ${jobsError.message}` };

  const { data: demoProfiles, error: profilesError } = await service
    .from("profiles").select("id").like("handle", "demo-%");
  if (profilesError) return { error: `Failed to find demo users: ${profilesError.message}` };

  const demoIds = (demoProfiles ?? []).map((p) => p.id);
  let deletedUsers = 0;
  for (const id of demoIds) {
    const { error } = await service.auth.admin.deleteUser(id);
    if (!error) deletedUsers++;
    else console.error(`Failed to delete demo user ${id}: ${error.message}`);
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/jobs");
  revalidatePath("/underwriters");
  return { success: true, jobsDeleted: 0, usersDeleted: deletedUsers };
}
