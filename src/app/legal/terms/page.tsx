import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "Terms of Service — DUG" };

const EFFECTIVE_DATE = "May 12, 2026";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        <article className="mx-auto max-w-2xl">

          <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Effective {EFFECTIVE_DATE}</p>
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            These terms are a working draft. Final terms will be reviewed by insurance regulatory counsel before public launch.
          </p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--color-fg)]/90">

            <Section title="1. Acceptance of Terms">
              <p>By accessing or using the DUG platform (&ldquo;DUG,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), including its website, marketplace, Dojo, and any related services (collectively, the &ldquo;Platform&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the Platform.</p>
              <p className="mt-3">These Terms apply to all users, including underwriters and other credentialed professionals who provide advisory analysis (&ldquo;Members&rdquo;), and individuals or entities who post evaluation requests (&ldquo;Requesters&rdquo;).</p>
            </Section>

            <Section title="2. Nature of the Platform — Advisory Only">
              <p>DUG is a consulting marketplace. It connects Requesters seeking independent advisory analysis with Members who provide professional opinion based on their experience and judgment.</p>
              <p className="mt-3"><strong>No binding authority.</strong> No analysis, recommendation, premium suggestion, risk assessment, or any other output delivered through the Platform constitutes a binding commitment, a coverage decision, or an offer to bind insurance on behalf of any insurer, MGA, or other risk-bearing entity. Members do not bind coverage. DUG does not bind coverage.</p>
              <p className="mt-3"><strong>Complementary, not definitive.</strong> All advisory output on the Platform is intended as a frame of reference — a professional second opinion — to inform the independent judgment of the Requester. It is the sole responsibility of the Requester, and of any underwriter, broker, agent, or other licensed professional relying on Platform output, to evaluate that output and make their own independent decisions about whether to use it, how to use it, and the weight to give it. DUG output does not replace, supersede, or constitute regulated insurance advice.</p>
              <p className="mt-3"><strong>Requester responsibility.</strong> Whether a Requester acts on advisory output is entirely their decision. DUG has no involvement in, and accepts no responsibility for, any binding decision, coverage placement, policy issuance, claims outcome, or financial consequence that results from a Requester&apos;s choice to rely on or disregard Platform output.</p>
            </Section>

            <Section title="3. DUG&apos;s Role — Attestation Platform">
              <p>DUG operates as an attestation intermediary. When DUG displays a &ldquo;Verified&rdquo; badge or similar credential indicator on a Member&apos;s profile, this means only that DUG has reviewed documentation indicating that the Member holds or has held the stated credential, license, or experience. It does not mean:</p>
              <ul className="mt-3 ml-4 space-y-1.5 list-disc list-outside">
                <li>That DUG vouches for the accuracy, quality, or fitness of any analysis that Member provides;</li>
                <li>That the Member&apos;s credential is currently active, in good standing, or sufficient for any particular purpose;</li>
                <li>That DUG has evaluated the Member&apos;s competence, judgment, or professional conduct beyond the documentation reviewed; or</li>
                <li>That DUG assumes any liability for acts or omissions by that Member.</li>
              </ul>
              <p className="mt-3">DUG&apos;s attestation function is analogous to a data provider that supplies verified reference data — the existence of the data does not make the provider responsible for decisions made using it. DUG attests to credentials; it does not warrant outcomes.</p>
              <p className="mt-3"><strong>Reputation Index.</strong> DUG displays a Reputation Index (RI) score on Member profiles. The RI is a composite signal derived from peer review ratings, engagement volume, DUG credential verification status, and self-reported tenure. The RI reflects peer and performance signals only — it is not a measure of accuracy, and DUG makes no representation that a higher RI correlates with better advisory outcomes for any particular engagement.</p>
            </Section>

            <Section title="4. Member Obligations">
              <p>Members agree to:</p>
              <ul className="mt-3 ml-4 space-y-1.5 list-disc list-outside">
                <li>Provide accurate information about their credentials, experience, and professional background when creating or updating their profile;</li>
                <li>Disclose any conflicts of interest relevant to an engagement before accepting it;</li>
                <li>Deliver advisory analysis in good faith, based on their professional judgment and the information available to them;</li>
                <li>Clearly communicate the limitations of their analysis, including data gaps, time constraints, or jurisdictional limitations;</li>
                <li>Comply with all applicable laws and any professional licensing or regulatory requirements that govern their practice;</li>
                <li>Not represent their DUG advisory output as a binding underwriting decision, a policy commitment, or regulated insurance advice; and</li>
                <li>Maintain their own professional liability coverage where required by applicable law or professional standards.</li>
              </ul>
              <p className="mt-3">Members are independent contractors. Nothing in these Terms creates an employment, agency, joint venture, or partnership relationship between DUG and any Member.</p>
            </Section>

            <Section title="5. Requester Obligations">
              <p>Requesters agree to:</p>
              <ul className="mt-3 ml-4 space-y-1.5 list-disc list-outside">
                <li>Provide accurate and complete information when posting an engagement, including all material facts relevant to the risk or issue being evaluated;</li>
                <li>Not submit confidential, proprietary, or personally identifiable information of third parties without authorization;</li>
                <li>Use Platform output only as one input among many in their own independent decision-making process;</li>
                <li>Not represent Platform advisory output to third parties (including insureds, regulators, or courts) as a binding underwriting determination; and</li>
                <li>Pay all agreed engagement fees in accordance with the Platform&apos;s payment terms.</li>
              </ul>
            </Section>

            <Section title="6. Payments and Fees">
              <p>DUG charges a platform fee on each completed paid engagement. The applicable fee rate is determined by the Requester&apos;s tier (Consumer, Professional, Enterprise, or Strategic) as displayed at the time of posting. Fee rates are subject to change; the rate applicable to a given engagement is the rate in effect when the engagement is posted.</p>
              <p className="mt-3">Fees for volunteer-budget engagements are zero. DUG reserves the right to introduce minimum fee floors or modify fee structures with reasonable notice.</p>
              <p className="mt-3">Members are solely responsible for any applicable taxes on payments received through the Platform.</p>
            </Section>

            <Section title="7. Prohibited Conduct">
              <p>You may not use the Platform to:</p>
              <ul className="mt-3 ml-4 space-y-1.5 list-disc list-outside">
                <li>Post false, misleading, or fraudulent engagement requests or member profiles;</li>
                <li>Circumvent the Platform&apos;s payment system by engaging Members directly after initial contact through DUG;</li>
                <li>Attempt to identify or contact the counterparty in an anonymous or pseudonymous engagement outside the Platform;</li>
                <li>Violate any applicable law, including insurance regulations, privacy laws, or securities laws;</li>
                <li>Submit malicious code, scrape the Platform, or interfere with its operation; or</li>
                <li>Harass, threaten, or defame any other user.</li>
              </ul>
            </Section>

            <Section title="8. Disclaimers">
              <p><strong>No warranty.</strong> The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; DUG makes no warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement. DUG does not warrant that the Platform will be error-free, uninterrupted, or free of harmful components.</p>
              <p className="mt-3"><strong>No warranty of advisory output.</strong> DUG makes no representation or warranty regarding the accuracy, completeness, timeliness, or fitness of any advisory analysis provided by Members. Members&apos; opinions are their own.</p>
              <p className="mt-3"><strong>No regulatory compliance warranty.</strong> DUG does not warrant that use of the Platform by any Member or Requester complies with the insurance laws or regulations of any jurisdiction. Users are responsible for their own regulatory compliance.</p>
            </Section>

            <Section title="9. Limitation of Liability">
              <p>To the fullest extent permitted by applicable law, DUG and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, loss of data, or business interruption — arising out of or related to your use of the Platform or any advisory output obtained through it, regardless of the theory of liability and even if DUG has been advised of the possibility of such damages.</p>
              <p className="mt-3">DUG&apos;s total aggregate liability for direct damages arising from these Terms or your use of the Platform shall not exceed the greater of (a) the total platform fees paid by you to DUG in the twelve months preceding the claim, or (b) one hundred U.S. dollars ($100).</p>
              <p className="mt-3">These limitations apply to the maximum extent permitted by law. Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability for certain damages; in those jurisdictions, DUG&apos;s liability is limited to the minimum extent permitted by law.</p>
            </Section>

            <Section title="10. Indemnification">
              <p>You agree to indemnify, defend, and hold harmless DUG and its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from: (a) your use of the Platform; (b) your breach of these Terms; (c) any advisory analysis you provide or rely upon through the Platform; (d) your violation of any applicable law or regulation; or (e) any dispute between you and another user.</p>
            </Section>

            <Section title="11. Intellectual Property">
              <p>DUG owns all rights in the Platform, including its design, software, branding, and content created by DUG. You retain ownership of content you submit (engagement descriptions, advisory analysis, profile information), but you grant DUG a non-exclusive, royalty-free, worldwide license to display, store, and transmit that content as necessary to operate the Platform.</p>
              <p className="mt-3">DUG may use aggregated, de-identified data derived from Platform activity for product improvement, research, and benchmarking purposes.</p>
            </Section>

            <Section title="12. Privacy">
              <p>Your use of the Platform is also governed by our <a href="/legal/privacy" className="underline underline-offset-2 hover:text-[var(--color-primary)]">Privacy Policy</a>, which is incorporated into these Terms by reference.</p>
            </Section>

            <Section title="13. Termination">
              <p>DUG may suspend or terminate your access to the Platform at any time, with or without cause, with or without notice. You may delete your account at any time. Upon termination, your right to use the Platform ceases immediately. Provisions of these Terms that by their nature should survive termination — including Sections 2, 3, 8, 9, 10, and 14 — will survive.</p>
            </Section>

            <Section title="14. Governing Law and Disputes">
              <p>These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law principles. Any dispute arising out of or relating to these Terms or the Platform that cannot be resolved informally shall be submitted to binding arbitration under the rules of the American Arbitration Association, conducted in Dallas, Texas. Notwithstanding this, either party may seek injunctive or other equitable relief in any court of competent jurisdiction.</p>
              <p className="mt-3">You and DUG each waive the right to a jury trial and the right to participate in a class action with respect to any dispute arising from these Terms.</p>
            </Section>

            <Section title="15. Changes to These Terms">
              <p>DUG may update these Terms from time to time. Material changes will be communicated by updating the effective date above and, where appropriate, by notifying users by email or in-platform notice. Continued use of the Platform after the effective date of any update constitutes acceptance of the revised Terms.</p>
            </Section>

            <Section title="16. Contact">
              <p>Questions about these Terms? Email us at <a href="mailto:hello@dug.community" className="underline underline-offset-2 hover:text-[var(--color-primary)]">hello@dug.community</a>.</p>
            </Section>

          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-[var(--color-fg)] mb-3">{title}</h2>
      <div className="text-sm leading-relaxed text-[var(--color-fg)]/80 space-y-2">
        {children}
      </div>
    </section>
  );
}
