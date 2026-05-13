const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel,
  LevelFormat, PageOrientation, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType, ImageRun, Header, Footer, PageNumber,
  TabStopType, TabStopPosition,
  HorizontalPositionRelativeFrom, HorizontalPositionAlign,
  VerticalPositionRelativeFrom, VerticalPositionAlign,
} = require("docx");

const cccWatermark = fs.readFileSync(
  "/sessions/vibrant-practical-fermat/mnt/Projects/DUG - Decentralized Underwriting Group/Docs/.ccc_watermark.png"
);

const H1 = (text) =>
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
const H2 = (text) =>
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
const H3 = (text) =>
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
const P = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, ...opts })],
  });
const B = (text) => P(text, { bold: true });
const Bullet = (text) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 60 },
    children: [new TextRun(text)],
  });
const BulletBold = (label, rest) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 60 },
    children: [
      new TextRun({ text: label, bold: true }),
      new TextRun(rest),
    ],
  });
const Spacer = () => new Paragraph({ children: [new TextRun("")] });
const Divider = () =>
  new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "B97A2A", space: 1 },
    },
  });

// ─────────────── Requirements mapping table ───────────────
const COL_REQ = 4200;
const COL_PHASE = 1200;
const COL_NOTES = 3960;
const TABLE_W = COL_REQ + COL_PHASE + COL_NOTES; // 9360
const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const cellBorders = {
  top: cellBorder,
  bottom: cellBorder,
  left: cellBorder,
  right: cellBorder,
};

const headerCell = (text, width) =>
  new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "F4E4CC", type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        spacing: { after: 0 },
        children: [new TextRun({ text, bold: true, size: 20 })],
      }),
    ],
  });

const bodyCell = (text, width, opts = {}) =>
  new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        spacing: { after: 0 },
        children: [new TextRun({ text, size: 20, ...opts })],
      }),
    ],
  });

const phaseCell = (text) => {
  const fill =
    text === "Phase 1"
      ? "D5E8D4"
      : text === "Phase 2"
        ? "FFF2CC"
        : "FADBD8";
  return new TableCell({
    borders: cellBorders,
    width: { size: COL_PHASE, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        spacing: { after: 0 },
        children: [new TextRun({ text, bold: true, size: 20 })],
      }),
    ],
  });
};

const reqRow = (requirement, phase, notes) =>
  new TableRow({
    children: [
      bodyCell(requirement, COL_REQ),
      phaseCell(phase),
      bodyCell(notes, COL_NOTES),
    ],
  });

const reqTable = () =>
  new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: [COL_REQ, COL_PHASE, COL_NOTES],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell("Requirement (from your brief)", COL_REQ),
          headerCell("Phase", COL_PHASE),
          headerCell("Notes", COL_NOTES),
        ],
      }),
      // Workflows
      reqRow("Submission intake (web form + file upload)", "Phase 1", "Structured form built; add file upload via Supabase Storage"),
      reqRow("CSV bulk imports", "Phase 2", "Defer until carriers ask"),
      reqRow("Specialist matching (manual claim)", "Phase 1", "Open queue + specialty filter already exists"),
      reqRow("Automated matching algorithm", "Phase 2", "Tier + reputation weighting added after MVP"),
      reqRow("Analysis & response form", "Phase 1", "Already built; reframe fields for B2B advisory"),
      reqRow("Result delivery to requester", "Phase 1", "Already built (review flow)"),
      reqRow("Per-task payments via Stripe", "Phase 1", "Stripe Connect Express, application_fee_amount"),
      reqRow("Subscription model", "Phase 2", "Validate per-task first, layer subscription after"),
      reqRow("1099 generation", "Phase 1", "Handled by Stripe Connect Express"),
      // Technical
      reqRow("Multi-tenant data isolation (carrier_id)", "Phase 1", "RLS on every table; see Recommendation 2"),
      reqRow("Per-carrier database schemas", "Phase 3", "Only if a contracted enterprise requires it"),
      reqRow("Audit logging (every access)", "Phase 1", "Instrumented at data layer from day one"),
      reqRow("Role-based permissions", "Phase 1", "admin / carrier / broker / specialist; Judge added in Phase 2"),
      reqRow("Anonymity preservation (persistent pseudonyms)", "Phase 1", "Handle column already exists; lock down PII surface"),
      reqRow("File handling (PDF, image, ≤10MB)", "Phase 1", "Supabase Storage, encrypted; see Recommendation 5"),
      reqRow("Reporting for requesters", "Phase 2", "Turnaround + cost analytics"),
      reqRow("Reporting for specialists", "Phase 2", "Earnings + acceptance rate"),
      reqRow("Platform analytics", "Phase 2", "Volume + utilization + payment flows"),
      reqRow("Mobile-responsive (submission flow)", "Phase 1", "Required for brokers in the field"),
      // Security
      reqRow("HTTPS everywhere", "Phase 1", "Netlify default"),
      reqRow("Encryption at rest", "Phase 1", "Supabase default"),
      reqRow("PCI compliance", "Phase 1", "Inherited from Stripe"),
      reqRow("GDPR/privacy compliance", "Phase 1", "Privacy policy + DSAR endpoint"),
      reqRow("SOC 2 Type II", "Phase 3", "Architecture supports it from Phase 1; formal audit triggered by enterprise"),
      // Tiers
      reqRow("Tier 0 — Dojo (email only)", "Done", "Already shipped"),
      reqRow("Tier 1 — LinkedIn verified", "Phase 1", "Manual URL review; see Recommendation 3"),
      reqRow("Tier 2 — Interview verified", "Phase 2", "Calendly + Zoom + Supabase Storage for recordings"),
      reqRow("Tier 3 — Reference verified", "Phase 2", "Admin reference-call workflow"),
      reqRow("Tier 4 — Background checked", "Phase 3", "Checkr API + FCRA compliance flow"),
      reqRow("Tier-based pricing bands", "Phase 1", "Configurable in DB; pricing-band UI in Phase 2"),
      reqRow("Variable platform fee by tier", "Phase 1", "Stored on engagement; computed at charge time"),
      reqRow("Verification badges on profiles", "Phase 1", "Tier 0/1 badges at MVP; T2–T4 added with each tier"),
      reqRow("Requester filter by minimum tier", "Phase 1", "Required to make the funnel meaningful"),
      // Notifications
      reqRow("Email notifications", "Phase 1", "Resend wiring already pending"),
      reqRow("Real-time websocket notifications", "Phase 3", "Defer until high-volume carriers demand"),
      reqRow("In-app messaging", "Phase 3", "Start with structured Q&A then free-form"),
      // Misc
      reqRow("Weekly challenge system (Dojo contests)", "Phase 2", "Backend not yet built; UI shell present"),
      reqRow("Reputation scoring", "Phase 2", "See Recommendation 4 (reputation index, not \"accuracy\")"),
      reqRow("Carrier API integration", "Phase 3", "Submission ingest + result webhook"),
      reqRow("Admin dashboard", "Phase 1", "Basic version already built; expand for verification + payments"),
    ],
  });

const doc = new Document({
  creator: "DUG",
  title: "DUG — Build Phasing Response",
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } }, // 11pt
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 40, bold: true, font: "Arial", color: "1a1008" },
        paragraph: { spacing: { before: 0, after: 120 } },
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: "1a1008" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "B97A2A" },
        paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: "1a1008" },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              spacing: { after: 0 },
              children: [
                new ImageRun({
                  type: "png",
                  data: cccWatermark,
                  transformation: { width: 480, height: 264 },
                  floating: {
                    horizontalPosition: {
                      relative: HorizontalPositionRelativeFrom.PAGE,
                      align: HorizontalPositionAlign.CENTER,
                    },
                    verticalPosition: {
                      relative: VerticalPositionRelativeFrom.PAGE,
                      align: VerticalPositionAlign.CENTER,
                    },
                    behindDocument: true,
                    allowOverlap: true,
                  },
                  altText: {
                    title: "CannonCodeConnect",
                    description: "CannonCodeConnect watermark",
                    name: "CCCWatermark",
                  },
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: {
                top: { style: BorderStyle.SINGLE, size: 4, color: "B97A2A", space: 4 },
              },
              tabStops: [
                { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
              ],
              children: [
                new TextRun({
                  text: "Prepared by CannonCodeConnect  ·  Building Solutions. Connecting Success.",
                  size: 16,
                  color: "5c4033",
                }),
                new TextRun({ text: "\t", size: 16 }),
                new TextRun({ text: "Page ", size: 16, color: "5c4033" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "5c4033" }),
                new TextRun({ text: " of ", size: 16, color: "5c4033" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "5c4033" }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          style: "Title",
          children: [new TextRun("DUG — Build Phasing Response")],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "Re: Technical Requirements Summary + Identity Verification & Specialist Tiering briefs",
              italics: true,
              color: "5c4033",
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: "Prepared by ",
              size: 18,
              color: "5c4033",
            }),
            new TextRun({
              text: "CannonCodeConnect",
              size: 18,
              bold: true,
              color: "1a1008",
            }),
          ],
        }),
        Divider(),
        Spacer(),

        // ─────────────── How to read this ───────────────
        H1("How to read this"),
        P(
          "Both briefs are accepted as the design target. Nothing in your tier ladder, requirement list, or workflow shape is being removed. This document does three things:"
        ),
        Bullet("Tells you what's already built on DUG today, so the phasing isn't starting from zero."),
        Bullet("Surfaces five places we'd recommend diverging from the brief — each is called out explicitly so you can accept or override."),
        Bullet("Phases the work into Phase 1 (MVP), Phase 2 (trust + scale), and Phase 3 (enterprise) and maps every requirement from your brief to one of them."),

        Spacer(),
        Divider(),
        Spacer(),

        // ─────────────── What's already built ───────────────
        H1("What's already built on DUG today"),
        P(
          "DUG is not greenfield. The current codebase is Next.js 15 + Supabase (Postgres, Auth, RLS, Storage) + Netlify, with these features already shipped and functional:"
        ),
        H3("Marketplace"),
        Bullet("Email/password auth with email confirmation, middleware-based session refresh"),
        Bullet("Profiles with handles (pseudonym foundation), specialty tags, public profile pages"),
        Bullet("Underwriter directory (sortable, filterable)"),
        Bullet("Job board with detail pages, claim flow, structured analysis submission (rationale, premium suggestion, red flags, confidence)"),
        Bullet("Poster review + rating system, automatic recompute of underwriter rating on each review"),
        Bullet("Post-a-job form (full specialty taxonomy + budget types)"),
        Bullet("Dashboard: overview, claimed jobs, posted jobs, edit profile"),
        Bullet("Admin panel"),
        Bullet("10 seeded demo profiles + 11 seeded jobs"),
        Bullet("9 database tables (6 marketplace, 3 Dojo) with role-aware RLS policies"),
        H3("Dojo (your Tier 0)"),
        Bullet("Landing page (hero, how-it-works, sample case, comparison, mock leaderboard, contests preview, FAQ, waitlist CTA)"),
        Bullet("Case detail + structured submission form + server-side scoring engine (premium-band fit + key-factor coverage, 0–100)"),
        Bullet("Result page (reveals model rationale + matched/missed factors after submit)"),
        Bullet("Waitlist (anonymous-friendly, captures role hint + referrer)"),
        Bullet("1 seeded case live: coastal-habitational-renewal (DOJO-2026-001)"),
        H3("What's pending"),
        Bullet("Resend email wiring (notifications)"),
        Bullet("Netlify production deploy (currently sandbox/staging)"),
        Bullet("Stripe — not yet wired"),
        Bullet("Additional Dojo cases (only 1 seeded so far)"),
        Bullet("Dojo contests + leaderboards (UI present, backend not built)"),
        P(
          "Translation: about 65% of your MVP feature set is already running. Phase 1 below is mostly \"wire up what's missing and reframe what exists,\" not \"build from scratch.\""
        ),

        Spacer(),
        Divider(),
        Spacer(),

        // ─────────────── Recommendations that diverge ───────────────
        H1("Recommendations that diverge from your brief"),
        P("Five places where we'd suggest a different approach than what the brief specifies. Each is independent — you can accept some, reject others."),

        H3("1. Stay on Supabase Auth (don't switch to Clerk/Auth0)"),
        P(
          "Brief recommends Clerk or Auth0 for auth. DUG is already on Supabase Auth, which handles user management, RLS-aware sessions, social SSO, and supports SAML/OIDC for enterprise SSO when needed. Switching auth providers would cost ~1 week of rebuild plus a forced re-login event for existing users, with no user-visible benefit. Recommend: keep Supabase Auth."
        ),
        H3("2. Postgres RLS for multi-tenancy (not separate schemas per carrier)"),
        P(
          "Brief mentions \"separate database schemas per enterprise client\" as the ideal isolation pattern. RLS with a carrier_id column is what most multi-tenant SaaS uses (including Linear, Vercel, and Supabase itself). Per-schema isolation is a roughly 10× operational burden — every migration, backup, and query plan multiplies by the number of carriers. Recommend: RLS as the default; offer per-schema only if a specific enterprise customer requires it contractually."
        ),
        H3("3. Manual LinkedIn URL review at Tier 1 (no LinkedIn API)"),
        P(
          "Brief implies a LinkedIn API integration for Tier 1 verification. LinkedIn does not expose a public verification API — the official APIs require partner status and don't return employment-history data we'd need. Recommend: have specialists paste their LinkedIn URL on application, admin spot-checks against the live profile, flag if profile is private or inactive. Same outcome as the brief, just operationally honest."
        ),
        H3("4. Replace \"accuracy\" with a reputation index"),
        P(
          "Brief proposes tracking \"specialist accuracy if outcome data provided later.\" Real-world underwriting rarely has a clean right/wrong outcome — loss outcomes depend on many factors outside the specialist's analysis, and carriers rarely share outcome data with third parties. Recommend: at MVP, reputation = poster-rated quality + repeat-hire rate + on-time delivery + dispute rate. Dojo scoring remains because that has a model answer. Reintroduce \"accuracy\" only if and when carrier partners agree to share loss outcomes contractually."
        ),
        H3("5. Supabase Storage for files (not AWS S3)"),
        P(
          "Brief specifies AWS S3 for file storage. Supabase Storage runs on S3 under the hood, supports server-side encryption, signed URLs, and same compliance posture as S3 direct — and it integrates with the same RLS policies we're already using for tables. Recommend: Supabase Storage. Eliminates one provider, one credential set, and one integration."
        ),

        Spacer(),
        Divider(),
        Spacer(),

        // ─────────────── Requirements mapping ───────────────
        H1("Your requirements → build phase"),
        P("Every item from both briefs, mapped to a phase. Phase 1 = ship at MVP. Phase 2 = post-launch trust + scale. Phase 3 = enterprise-triggered."),

        reqTable(),

        Spacer(),
        Divider(),
        Spacer(),

        // ─────────────── Phase 1 ───────────────
        H1("Phase 1 — MVP"),
        P("Goal: end-to-end loop functional. Carrier/broker submits a risk → Tier 1 specialist claims it → submits analysis → gets paid → requester gets the result. Two tiers live (Tier 0 Dojo, Tier 1 Network Verified)."),

        H2("Marketplace mechanics"),
        Bullet("Rename \"jobs\" → \"engagements\" across UI (database table can stay named jobs short-term, or rename in same migration — your call)"),
        Bullet("Reframe marketplace as B2B: carrier/broker as requester, specialist as responder"),
        Bullet("Structured submission intake form: property/risk type, loss history, coverage needs, exposures"),
        Bullet("File upload on submissions (PDF, image, max 10MB per file) via Supabase Storage"),
        Bullet("Specialist queue: open-claim, filtered by specialty tags"),
        Bullet("Analysis form: bind/decline/modify/needs-more-info recommendation, premium suggestion, risk concerns, additional info requested"),
        Bullet("Result delivery to requester with specialist pseudonym + tier badge"),
        Bullet("Engagement-level minimum-tier filter (poster requires Tier 1+ specialists)"),

        H2("Tiers live at MVP"),
        BulletBold("Tier 0 — Dojo. ", "Already built. Wire the Dojo→Tier 1 application bridge."),
        BulletBold("Tier 1 — LinkedIn Verified. ", "LinkedIn URL submission + admin spot-check (manual review, see Recommendation 3). Badge: \"Network Verified.\" Eligible for paid engagements up to $200/task. Platform fee 25–30%."),

        H2("Payments — Stripe Connect"),
        Bullet("Specialists onboard as Stripe Connect Express accounts (Stripe handles W-9, 1099 generation, tax docs)"),
        Bullet("Requesters pay per engagement via Stripe Checkout or Payment Intent"),
        Bullet("Platform fee taken as application_fee_amount at charge time"),
        Bullet("Payout on engagement completion + requester sign-off"),
        Bullet("PCI compliance inherited from Stripe (no card data ever touches DUG)"),

        H2("Data isolation + compliance foundation"),
        Bullet("Add carrier_id (organization scope) to engagements + submissions + audit log tables"),
        Bullet("RLS policies scoped to carrier_id — each carrier only reads/writes their own data"),
        Bullet("Audit log table: user_id, action, resource_type, resource_id, timestamp, ip, user_agent"),
        Bullet("Every server action wraps a write to audit_log (instrumented at the data layer, not the route layer, so it can't be forgotten)"),
        Bullet("Supabase Storage with server-side encryption + signed URLs for sensitive uploads"),
        Bullet("HTTPS via Netlify; encryption at rest via Supabase"),

        H2("Roles + permissions"),
        Bullet("Role enum on profiles: admin, carrier, broker, specialist (Judge role added in Phase 2 when contests go live)"),
        Bullet("RLS enforces: specialists see only claimed engagements; carriers see only their own submissions; admins see everything"),

        H2("Anonymity model"),
        Bullet("Specialists default to pseudonymous handle; real_name + identity fields stored but never exposed in public API"),
        Bullet("public_profile_enabled boolean — false at Tier 1, opt-in true at Tier 3+"),
        Bullet("Pseudonym persists across all engagements (same handle every time)"),

        H2("Admin + notifications"),
        Bullet("Admin dashboard: view all engagements + submissions, approve Tier 1 applications, manual dispute resolution"),
        Bullet("Email notifications via Resend (finish wiring): new engagement available, recommendation submitted, payment received"),
        Bullet("Mobile-responsive submission flow (brokers uploading photos from field)"),

        Spacer(),
        Divider(),
        Spacer(),

        // ─────────────── Phase 2 ───────────────
        H1("Phase 2 — Trust + scale (post-MVP launch)"),
        P("Once the Phase 1 loop is running with real users, layer in the higher-trust tiers and the analytics + matching intelligence needed to retain both sides."),

        H2("Tier 2 — Interview Verified"),
        Bullet("Calendly integration for scheduling 15-minute screens"),
        Bullet("Zoom or Whereby for video + recording"),
        Bullet("Supabase Storage for encrypted recording storage (admin-only access)"),
        Bullet("Screening rubric + admin pass/fail workflow"),
        Bullet("Badge: \"Interview Verified.\" Pricing band $100–$200/engagement, platform fee ~22%"),

        H2("Tier 3 — Reference Verified"),
        Bullet("Reference intake form (contact info + relationship + consent to contact)"),
        Bullet("Admin reference-call tracker (status: requested → contacted → cleared)"),
        Bullet("Standardized call script + scoring rubric"),
        Bullet("Badge: \"Reference Verified.\" Optional public-identity toggle activates here"),
        Bullet("Pricing band $200–$500/engagement, platform fee ~20%"),

        H2("Marketplace intelligence"),
        Bullet("Automated specialist matching: tag-based ranking with tier + reputation weighting (not pure open queue)"),
        Bullet("Reputation index: poster ratings + repeat-hire rate + on-time delivery + dispute rate (see Recommendation 4)"),
        Bullet("Bulk CSV upload for carriers submitting multiple risks at once"),
        Bullet("Analytics dashboards: turnaround time + cost-per-analysis (requesters), earnings + acceptance rate (specialists), volume + utilization (platform)"),

        H2("Dojo expansion"),
        Bullet("Seed 5–10 additional cases across specialty lines"),
        Bullet("Contest infrastructure: timed events, live leaderboards, prize payouts"),
        Bullet("Judge role + judging workflow"),
        Bullet("Dojo track-record auto-feeds Tier 1/2 application eligibility"),

        Spacer(),
        Divider(),
        Spacer(),

        // ─────────────── Phase 3 ───────────────
        H1("Phase 3 — Enterprise + Tier 4 (triggered by first enterprise contract)"),
        P("These pieces are expensive to build and operationally heavy to maintain. Recommend treating Phase 3 as triggered by a signed enterprise contract or a specific carrier ask, not by a calendar date."),

        H2("Tier 4 — Background Checked / Expert"),
        Bullet("Checkr API integration (or HireRight) for criminal + employment verification"),
        Bullet("FCRA-compliant consent flow + adverse-action notice templates + documented appeal process (legal liability if skipped)"),
        Bullet("License verification upload (surplus lines broker, adjuster, etc.) + admin review"),
        Bullet("Optional attorney opinion letter intake for niche specialty claims"),
        Bullet("Full public profile mode (real name, credentials, bio, expertise areas)"),
        Bullet("Pricing band $500+/engagement, retainer support, platform fee ~15–18%"),

        H2("Enterprise infrastructure"),
        Bullet("API for carrier system integration (submission ingest + result webhook)"),
        Bullet("SOC 2 Type II audit prep (most controls already in place from Phase 1 audit logging + RLS)"),
        Bullet("Enterprise SSO via Supabase Auth's SAML/OIDC support"),
        Bullet("Real-time websocket notifications for high-volume carriers"),
        Bullet("In-app messaging between requester and specialist (structured Q&A first, free-form later)"),

        Spacer(),
        Divider(),
        Spacer(),

        // ─────────────── Open questions ───────────────
        H1("Open questions back to you"),
        P("Five decisions needed before Phase 1 scope locks:"),
        BulletBold(
          "Trust model on pseudonymous + verified. ",
          "If specialists are pseudonymous to buyers but verified by DUG, the platform becomes the trust intermediary and inherits liability if a verified specialist gives bad advice. How much does DUG vouch for, vs. just attest (\"we've seen the credential\")? This affects T&Cs, insurance posture, and how badges are worded."
        ),
        BulletBold(
          "Accuracy framing. ",
          "OK to drop \"accuracy\" from public reputation copy and replace with the reputation index in Recommendation 4? Dojo scoring stays — it's model-based."
        ),
        BulletBold(
          "Pricing bands. ",
          "Your ladder is $50 / $100–$200 / $200–$500 / $500+. Confirm these are still target ranges, or whether they should be left configurable per-engagement within a tier-allowed range."
        ),
        BulletBold(
          "Dojo → Tier 1 promotion criteria. ",
          "Proposed: 5+ submitted Dojo cases, at least 3 at Difficulty 3+, score above 70th percentile in chosen specialty. Open to your number."
        ),
        BulletBold(
          "Terminology. ",
          "Confirm \"Engagements\" + \"The Network\" as the umbrella terms (vs. Mandates / Briefs / The Guild / The Bench). This affects URLs, badges, marketing copy, every in-app string."
        ),

        Spacer(),
        Divider(),
        Spacer(),

        // ─────────────── Next step ───────────────
        H1("Suggested next step"),
        P(
          "Get your answers on the five open questions and a thumbs-up or override on each of the five recommendations. From there Phase 1 scope locks and I can produce a build-order list with rough effort estimates so we have visibility into when each piece ships."
        ),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(
    "/sessions/vibrant-practical-fermat/mnt/Projects/DUG - Decentralized Underwriting Group/Docs/DUG_Build_Phasing_Response.docx",
    buf
  );
  console.log("done");
});
