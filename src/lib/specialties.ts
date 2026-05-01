/**
 * The DUG specialty taxonomy. Underwriters tag themselves with these on their
 * profile; jobs are tagged with these for matching/filtering.
 *
 * Loosely organized by line of business + emerging risk classes that came up
 * in the founder conversations. Add freely — these are user-facing tags, not
 * a regulatory schema.
 */
export type SpecialtyGroup =
  | "Property"
  | "Liability"
  | "Specialty"
  | "Emerging"
  | "Personal"
  | "Other";

export type Specialty = {
  slug: string;
  label: string;
  group: SpecialtyGroup;
};

export const SPECIALTIES: Specialty[] = [
  // Property
  { slug: "commercial-property", label: "Commercial Property", group: "Property" },
  { slug: "cat-wind", label: "CAT — Wind / Hail", group: "Property" },
  { slug: "cat-wildfire", label: "CAT — Wildfire", group: "Property" },
  { slug: "cat-flood", label: "CAT — Flood", group: "Property" },
  { slug: "habitational", label: "Habitational", group: "Property" },
  { slug: "builders-risk", label: "Builder's Risk", group: "Property" },

  // Liability
  { slug: "general-liability", label: "General Liability", group: "Liability" },
  { slug: "products-liability", label: "Products Liability", group: "Liability" },
  { slug: "premises-liability", label: "Premises Liability", group: "Liability" },
  { slug: "professional-liability", label: "Professional Liability / E&O", group: "Liability" },
  { slug: "directors-officers", label: "Directors & Officers", group: "Liability" },
  { slug: "employment-practices", label: "Employment Practices", group: "Liability" },

  // Specialty
  { slug: "marine", label: "Marine / Cargo", group: "Specialty" },
  { slug: "aviation", label: "Aviation", group: "Specialty" },
  { slug: "energy", label: "Energy / Oil & Gas", group: "Specialty" },
  { slug: "construction", label: "Construction", group: "Specialty" },
  { slug: "transportation", label: "Trucking / Transportation", group: "Specialty" },
  { slug: "healthcare", label: "Healthcare / Medical", group: "Specialty" },
  { slug: "entertainment", label: "Entertainment Venues", group: "Specialty" },
  { slug: "hospitality", label: "Hospitality / F&B", group: "Specialty" },

  // Emerging
  { slug: "cyber", label: "Cyber Liability", group: "Emerging" },
  { slug: "cannabis", label: "Cannabis / Hemp", group: "Emerging" },
  { slug: "bess", label: "Battery Energy Storage", group: "Emerging" },
  { slug: "drones", label: "Drones / UAS", group: "Emerging" },
  { slug: "ev-charging", label: "EV Charging Stations", group: "Emerging" },
  { slug: "crypto-mining", label: "Crypto Mining Operations", group: "Emerging" },
  { slug: "vertical-farming", label: "Vertical / Indoor Farming", group: "Emerging" },
  { slug: "psychedelics", label: "Psychedelic Therapy Clinics", group: "Emerging" },

  // Personal
  { slug: "high-net-worth", label: "High Net Worth Personal", group: "Personal" },
  { slug: "auto", label: "Personal Auto", group: "Personal" },
  { slug: "homeowners", label: "Homeowners", group: "Personal" },
];

export const SPECIALTIES_BY_SLUG: Record<string, Specialty> = Object.fromEntries(
  SPECIALTIES.map((s) => [s.slug, s]),
);

export const SPECIALTY_GROUPS: SpecialtyGroup[] = [
  "Property",
  "Liability",
  "Specialty",
  "Emerging",
  "Personal",
  "Other",
];
