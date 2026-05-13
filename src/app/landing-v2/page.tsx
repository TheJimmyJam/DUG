"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight } from "lucide-react";

// ─── Scroll reveal hook ──────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    // Regular fade-up reveals
    const ro = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-vis", "");
            ro.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    // Word-group reveals
    const wo = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("wg-vis");
            wo.unobserve(e.target);
          }
        }),
      { threshold: 0.2 }
    );
    document.querySelectorAll("[data-rev]").forEach((el) => ro.observe(el));
    document.querySelectorAll("[data-wg]").forEach((el) => wo.observe(el));
    return () => {
      ro.disconnect();
      wo.disconnect();
    };
  }, []);
}

// ─── Word-by-word reveal ─────────────────────────────────────────────────────
function WordReveal({
  text,
  className = "",
  base = 0,
}: {
  text: string;
  className?: string;
  base?: number;
}) {
  return (
    <span data-wg className={className}>
      {text.split(" ").map((w, i) => (
        <span
          key={i}
          className="wr"
          style={{ "--wd": `${base + i * 0.045}s` } as React.CSSProperties}
        >
          {w}{" "}
        </span>
      ))}
    </span>
  );
}

// ─── Slide-text button ───────────────────────────────────────────────────────
function SlideBtn({
  children,
  href,
  gold = false,
}: {
  children: React.ReactNode;
  href: string;
  gold?: boolean;
}) {
  return (
    <Link href={href} className={`sb${gold ? " sb--gold" : ""}`}>
      <span className="sb__track">
        <span className="sb__txt">{children}</span>
        <span className="sb__txt">{children}</span>
      </span>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function LandingV2() {
  useScrollReveal();

  const problems = [
    [
      "Carriers need expert second opinions",
      "but their internal bench is thin and getting thinner.",
    ],
    [
      "Independent consultants have deep expertise",
      "but no platform, no pipeline, and no way to prove it.",
    ],
    [
      "Emerging talent has the instincts",
      "but no track record, no reps, and no way in.",
    ],
    [
      "Brokers need verified risk experts",
      "but have no way to find or vet independent underwriters.",
    ],
  ] as const;

  const pillars = [
    {
      tag: "Community",
      title: "Credibility you earn in public.",
      body: "Debate real risks, challenge peers, and build a reputation that travels with you. When someone with 200 Dojo completions and a 4.9 rating weighs in, it carries weight.",
      href: "/community",
      cta: "Explore discussions",
      gold: false,
    },
    {
      tag: "The Dojo",
      title: "Reps before the paycheck.",
      body: "Practice on curated risk scenarios, get scored, compete in timed contests. Your Dojo record feeds your public profile before you ever claim a paid engagement.",
      href: "/dojo",
      cta: "Start training",
      gold: true,
    },
    {
      tag: "Marketplace",
      title: "Advisory work on your terms.",
      body: "Claim consulting assignments — second looks, audits, renewal reviews, complex risk analysis. Your reputation from community and Dojo follows you here.",
      href: "/engagements",
      cta: "Browse engagements",
      gold: false,
    },
  ] as const;

  const audience = [
    [
      "Senior veterans",
      "Mentor, moderate, and take the occasional engagement. Stay sharp without going back to a carrier seat.",
    ],
    [
      "Claims adjusters",
      "You understand loss. The Dojo teaches you to price it. Cross the aisle on your schedule.",
    ],
    [
      "Hungry juniors",
      "See 10× more risk across more lines than any carrier will show you. Build your book in public.",
    ],
    [
      "Between jobs",
      "Keep sharp, build visibility, and earn consulting income while you figure out the next move.",
    ],
    [
      "Subject matter experts",
      "Deep expertise in cannabis, BESS, cyber, ag? The market needs your brain. DUG gives you the reps.",
    ],
    [
      "Premium auditors",
      "Risk data fluency is half the job. The other half is right here.",
    ],
  ] as const;

  const dojoFeatures = [
    [
      "Practice cases",
      "Curated scenarios across lines. Submit an analysis, get scored, see how you compare.",
    ],
    [
      "Contests",
      "Timed challenges with live leaderboards. Compete for recognition, not just reps.",
    ],
    [
      "Public record",
      "Your training history lives on your profile. A strong Dojo record = instant credibility.",
    ],
    [
      "Blinded carrier data",
      "Eventually: real submissions, anonymized. The closest thing to live reps outside a carrier seat.",
    ],
  ] as const;

  return (
    <div className="v2" data-theme="dark">
      <SiteHeader />
      <main>

        {/* ── Hero ── */}
        <section className="v2-s v2-hero">
          <div className="v2-w">
            <p className="v2-eye" data-rev>
              THE NETWORK FOR INDEPENDENT UNDERWRITING
            </p>
            <h1
              className="v2-h1"
              data-rev
              style={{ "--d": "0.1s" } as React.CSSProperties}
            >
              Underwriting talent
              <br />
              is distributed.
              <br />
              <span className="v2-h1--em">Now it&apos;s deployable.</span>
            </h1>
            <p
              className="v2-sub"
              data-rev
              style={{ "--d": "0.2s" } as React.CSSProperties}
            >
              DUG is the platform where independent underwriters build
              reputation, sharpen their edge, and take on consulting work — on
              their own terms.
            </p>
            <div
              className="v2-ctas"
              data-rev
              style={{ "--d": "0.3s" } as React.CSSProperties}
            >
              <SlideBtn href="/signup" gold>
                Join the Network
              </SlideBtn>
              <SlideBtn href="/dojo">Enter the Dojo</SlideBtn>
            </div>
            <p
              className="v2-fn"
              data-rev
              style={{ "--d": "0.4s" } as React.CSSProperties}
            >
              Free to join. No carrier affiliation required.{" "}
              <Link href="/manifesto" className="v2-a">
                Read the manifesto →
              </Link>
            </p>
          </div>
        </section>

        {/* ── Problem escalation ── */}
        <section className="v2-s v2-problem">
          <div className="v2-w">
            <p className="v2-eye" data-rev>
              THE UNDERWRITING MARKET
            </p>
            <h2 className="v2-stat-h">
              <WordReveal text="The insurance industry spent a decade automating underwriter seats. The talent didn't disappear." />
              <WordReveal
                text="It just has nowhere to go."
                className="v2-stat-em"
                base={0.65}
              />
            </h2>
            <div className="v2-probs">
              {problems.map(([bold, rest], i) => (
                <div
                  key={i}
                  className="v2-prob"
                  data-rev
                  style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}
                >
                  <span className="v2-prob__n">0{i + 1}</span>
                  <span>
                    <strong>{bold}</strong> {rest}
                  </span>
                </div>
              ))}
            </div>
            <div className="v2-contrast" data-rev>
              <p className="v2-contrast__a">
                Without a network, underwriting talent is invisible.
              </p>
              <p className="v2-contrast__b">With DUG, it&apos;s deployable.</p>
            </div>
          </div>
        </section>

        {/* ── Platform ── */}
        <section className="v2-s v2-platform">
          <div className="v2-w">
            <p className="v2-eye" data-rev>
              INFRASTRUCTURE FOR INDEPENDENT UNDERWRITING
            </p>
            <h2
              className="v2-sh2"
              data-rev
              style={{ "--d": "0.1s" } as React.CSSProperties}
            >
              The DUG Platform
            </h2>
            <div className="v2-pgrid">
              {pillars.map((p, i) => (
                <div
                  key={p.tag}
                  className={`v2-pc${p.gold ? " v2-pc--g" : ""}`}
                  data-rev
                  style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}
                >
                  <p className="v2-pc__tag">{p.tag}</p>
                  <h3 className="v2-pc__h3">{p.title}</h3>
                  <p className="v2-pc__body">{p.body}</p>
                  <Link href={p.href} className="v2-pc__link">
                    {p.cta}
                    <ArrowRight className="v2-pc__icon" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who it's for ── */}
        <section className="v2-s v2-for">
          <div className="v2-w">
            <p className="v2-eye" data-rev>
              BUILT FOR
            </p>
            <h2
              className="v2-sh2"
              data-rev
              style={{ "--d": "0.1s" } as React.CSSProperties}
            >
              One network.
              <br />
              Every underwriter.
            </h2>
            <div className="v2-fgrid">
              {audience.map(([title, body], i) => (
                <div
                  key={title as string}
                  className="v2-fc"
                  data-rev
                  style={{ "--d": `${i * 0.07}s` } as React.CSSProperties}
                >
                  <p className="v2-fc__title">{title}</p>
                  <p className="v2-fc__body">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dojo spotlight ── */}
        <section className="v2-s v2-dojo">
          <div className="v2-w">
            <div className="v2-dojo-in">
              <div data-rev>
                <p className="v2-eye v2-eye--g">THE DOJO</p>
                <h2 className="v2-dojo-h">
                  The path from insider
                  <br />
                  to underwriter.
                </h2>
                <p className="v2-dojo-p">
                  An Uber driver isn&apos;t a professional driver — but they can
                  become one. The Dojo is the vessel. Claims adjusters, premium
                  auditors, subject matter experts, and career changers get
                  structured reps on real risk scenarios instead of waiting for
                  a carrier to sweep them up and train them.
                </p>
                <p className="v2-dojo-p v2-mt">
                  Practice submissions are scored. Contests rank participants in
                  real time. Your Dojo record feeds your public profile — before
                  you ever claim a paid engagement.
                </p>
                <div className="v2-mt2">
                  <SlideBtn href="/dojo" gold>
                    Enter the Dojo
                  </SlideBtn>
                </div>
              </div>
              <div className="v2-dojo-feats">
                {dojoFeatures.map(([t, b], i) => (
                  <div
                    key={t as string}
                    className="v2-df"
                    data-rev
                    style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}
                  >
                    <p className="v2-df__t">{t}</p>
                    <p className="v2-df__b">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="v2-s v2-cta-s">
          <div className="v2-w">
            <div className="v2-cta-box" data-rev>
              <p className="v2-eye v2-eye--g">
                READY TO BUILD YOUR REPUTATION?
              </p>
              <h2 className="v2-cta-h">
                Your expertise is already here.
                <br />
                The reps aren&apos;t.
              </h2>
              <p className="v2-cta-p">
                Join the community. Hit the Dojo. Take an engagement when
                you&apos;re ready. Your profile builds the whole time.
              </p>
              <div className="v2-cta-btns">
                <SlideBtn href="/signup" gold>
                  Create your profile
                </SlideBtn>
                <SlideBtn href="/dojo">Explore the Dojo</SlideBtn>
              </div>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />

      <style>{`
        /* ─── Root ─── */
        .v2 { background: #0d0b08; color: #f0ece4; }
        .v2-w { max-width: 72rem; margin: 0 auto; padding: 0 1.5rem; }
        @media (min-width: 1024px) { .v2-w { padding: 0 2rem; } }
        .v2-s { padding: 6rem 0; border-bottom: 1px solid rgba(240,236,228,0.07); }
        .v2-s:last-child { border-bottom: none; }

        /* ─── Eyebrow ─── */
        .v2-eye {
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(240,236,228,0.38);
          margin-bottom: 1.25rem;
        }
        .v2-eye--g { color: rgba(196,137,90,0.75); }

        /* ─── Scroll reveal ─── */
        [data-rev] {
          opacity: 0; transform: translateY(22px);
          transition: opacity 0.65s ease, transform 0.65s ease;
          transition-delay: var(--d, 0s);
        }
        [data-rev][data-vis] { opacity: 1; transform: translateY(0); }

        /* ─── Word reveal ─── */
        .wr { display: inline; opacity: 0; filter: blur(4px); transition: none; }
        .wg-vis .wr {
          animation: wFade 0.5s ease forwards;
          animation-delay: var(--wd, 0s);
        }
        @keyframes wFade {
          from { opacity: 0; filter: blur(4px); }
          to   { opacity: 1; filter: blur(0);   }
        }

        /* ─── Slide button ─── */
        .sb {
          display: inline-flex; align-items: center; overflow: hidden;
          border-radius: 9999px; padding: 0.72rem 1.6rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.07em;
          text-transform: uppercase; text-decoration: none;
          border: 1px solid rgba(240,236,228,0.2);
          color: rgba(240,236,228,0.8);
          transition: border-color 0.2s;
        }
        .sb:hover { border-color: rgba(240,236,228,0.45); }
        .sb--gold { background: #c4895a; color: #1a1410; border-color: transparent; }
        .sb--gold:hover { background: #d4a574; border-color: transparent; }
        .sb__track {
          display: flex; flex-direction: column;
          height: 1em; line-height: 1em;
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        .sb:hover .sb__track { transform: translateY(-1em); }
        .sb__txt { display: block; height: 1em; white-space: nowrap; }

        /* ─── Hero ─── */
        .v2-hero {
          min-height: 92vh; display: flex; align-items: center;
          padding-top: 8rem; padding-bottom: 5rem;
          position: relative; overflow: hidden;
        }
        .v2-hero::before {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 70% 55% at 15% 55%, rgba(196,137,90,0.09) 0%, transparent 65%);
        }
        .v2-hero .v2-w { position: relative; z-index: 1; }
        .v2-h1 {
          font-size: clamp(2.6rem, 7.5vw, 5.5rem);
          font-weight: 700; letter-spacing: -0.03em; line-height: 1.06;
          margin-bottom: 1.5rem;
        }
        .v2-h1--em { color: #c4895a; }
        .v2-sub {
          font-size: clamp(0.95rem, 2vw, 1.2rem);
          color: rgba(240,236,228,0.6); max-width: 40rem;
          line-height: 1.65; margin-bottom: 2rem;
        }
        .v2-ctas { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
        .v2-fn { font-size: 0.78rem; color: rgba(240,236,228,0.38); }
        .v2-a { color: rgba(240,236,228,0.55); text-decoration: underline; text-underline-offset: 3px; }
        .v2-a:hover { color: rgba(240,236,228,0.8); }

        /* ─── Problem ─── */
        .v2-stat-h {
          font-size: clamp(1.5rem, 4vw, 2.8rem); font-weight: 700;
          letter-spacing: -0.025em; line-height: 1.35;
          max-width: 52rem; margin-bottom: 3.5rem;
        }
        .v2-stat-em { display: block; color: #c4895a; margin-top: 0.25rem; }
        .v2-probs { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 3.5rem; }
        .v2-prob {
          display: flex; gap: 1.25rem; align-items: baseline;
          padding: 1.25rem 1.5rem;
          border: 1px solid rgba(240,236,228,0.08); border-radius: 12px;
          background: rgba(240,236,228,0.025);
          font-size: 0.95rem; line-height: 1.65; color: rgba(240,236,228,0.68);
        }
        .v2-prob strong { color: #f0ece4; }
        .v2-prob__n {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em;
          color: #c4895a; min-width: 1.5rem; flex-shrink: 0; padding-top: 0.15rem;
        }
        .v2-contrast { padding-top: 1rem; }
        .v2-contrast__a {
          font-size: clamp(1.1rem, 3vw, 2rem); font-weight: 700;
          letter-spacing: -0.02em; color: rgba(240,236,228,0.38);
          line-height: 1.3; margin-bottom: 0.2rem;
        }
        .v2-contrast__b {
          font-size: clamp(1.1rem, 3vw, 2rem); font-weight: 700;
          letter-spacing: -0.02em; color: #f0ece4; line-height: 1.3;
        }

        /* ─── Platform ─── */
        .v2-sh2 {
          font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 700;
          letter-spacing: -0.025em; line-height: 1.2; margin-bottom: 2.5rem;
        }
        .v2-pgrid { display: grid; gap: 1.25rem; grid-template-columns: 1fr; }
        @media (min-width: 768px) { .v2-pgrid { grid-template-columns: repeat(3, 1fr); } }
        .v2-pc {
          padding: 2rem; border-radius: 16px;
          border: 1px solid rgba(240,236,228,0.1);
          background: rgba(240,236,228,0.03);
          display: flex; flex-direction: column; gap: 0.75rem;
          transition: border-color 0.2s, background 0.2s;
        }
        .v2-pc:hover { border-color: rgba(240,236,228,0.2); background: rgba(240,236,228,0.05); }
        .v2-pc--g { border-color: rgba(196,137,90,0.3); background: rgba(196,137,90,0.05); }
        .v2-pc--g:hover { border-color: rgba(196,137,90,0.5); background: rgba(196,137,90,0.08); }
        .v2-pc__tag {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #c4895a;
        }
        .v2-pc__h3 { font-size: 1.1rem; font-weight: 700; letter-spacing: -0.01em; }
        .v2-pc__body { font-size: 0.88rem; color: rgba(240,236,228,0.58); line-height: 1.65; flex: 1; }
        .v2-pc__link {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.8rem; font-weight: 600; color: #c4895a;
          text-decoration: none; margin-top: 0.5rem;
          transition: gap 0.2s;
        }
        .v2-pc__link:hover { gap: 0.6rem; }
        .v2-pc__icon { width: 0.82rem; height: 0.82rem; }

        /* ─── For ─── */
        .v2-fgrid { display: grid; gap: 1rem; margin-top: 2.5rem; grid-template-columns: 1fr; }
        @media (min-width: 640px)  { .v2-fgrid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .v2-fgrid { grid-template-columns: repeat(3, 1fr); } }
        .v2-fc {
          padding: 1.5rem; border-radius: 12px;
          border: 1px solid rgba(240,236,228,0.08);
          background: rgba(240,236,228,0.02);
          transition: border-color 0.2s, background 0.2s;
        }
        .v2-fc:hover { border-color: rgba(240,236,228,0.18); background: rgba(240,236,228,0.04); }
        .v2-fc__title { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.4rem; }
        .v2-fc__body { font-size: 0.82rem; color: rgba(240,236,228,0.52); line-height: 1.65; }

        /* ─── Dojo ─── */
        .v2-dojo-in { display: grid; gap: 4rem; grid-template-columns: 1fr; }
        @media (min-width: 1024px) { .v2-dojo-in { grid-template-columns: 1fr 1fr; align-items: start; } }
        .v2-dojo-h {
          font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 700;
          letter-spacing: -0.025em; line-height: 1.2; margin-bottom: 1.25rem;
        }
        .v2-dojo-p { font-size: 0.92rem; color: rgba(240,236,228,0.58); line-height: 1.72; }
        .v2-mt  { margin-top: 0.9rem; }
        .v2-mt2 { margin-top: 2rem; }
        .v2-dojo-feats { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }
        .v2-df {
          padding: 1.25rem; border-radius: 12px;
          border: 1px solid rgba(196,137,90,0.18);
          background: rgba(196,137,90,0.04);
        }
        .v2-df__t { font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem; color: #d4a574; }
        .v2-df__b { font-size: 0.78rem; color: rgba(240,236,228,0.52); line-height: 1.6; }

        /* ─── CTA ─── */
        .v2-cta-s { padding-bottom: 8rem; }
        .v2-cta-box {
          border: 1px solid rgba(240,236,228,0.1); border-radius: 20px;
          background: rgba(240,236,228,0.025);
          padding: 4rem 3rem; text-align: center;
        }
        @media (max-width: 640px) { .v2-cta-box { padding: 2.5rem 1.5rem; } }
        .v2-cta-h {
          font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 700;
          letter-spacing: -0.025em; line-height: 1.2; margin: 0.75rem 0 1rem;
        }
        .v2-cta-p {
          font-size: 0.95rem; color: rgba(240,236,228,0.52);
          max-width: 34rem; margin: 0 auto 2.25rem; line-height: 1.65;
        }
        .v2-cta-btns { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      `}</style>
    </div>
  );
}
