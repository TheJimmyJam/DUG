"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight } from "lucide-react";

// ─── Intersection-based scroll reveals (no GSAP needed) ─────────────────────
function useScrollReveal() {
  useEffect(() => {
    const ro = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute("data-vis", ""); ro.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    const wo = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("wg-vis"); wo.unobserve(e.target); } }),
      { threshold: 0.2 }
    );
    document.querySelectorAll("[data-rev]").forEach((el) => ro.observe(el));
    document.querySelectorAll("[data-wg]").forEach((el) => wo.observe(el));
    return () => { ro.disconnect(); wo.disconnect(); };
  }, []);
}

// ─── GSAP scroll animations ──────────────────────────────────────────────────
function useGsapAnimations() {
  useEffect(() => {
    let ctx: { revert: () => void } | null = null;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {

        // ── Effect 1: Scale-up panel ──────────────────────────────────────
        // The inner card starts small + rounded, scales to full-screen as you scroll
        gsap.fromTo(
          "#scalePanel",
          { scale: 0.42, borderRadius: "24px" },
          {
            scale: 1,
            borderRadius: "0px",
            ease: "none",
            scrollTrigger: {
              trigger: "#scaleWrap",
              start: "top top",
              end: "+=900",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
            },
          }
        );

        // ── Effect 2: KPI cards fly in from Digger's side (right → left) ──
        // Section pins; Digger stands on the right as cards slide in past him
        const kpiTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#kpiSection",
            start: "top top",
            end: "+=1100",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });
        // Cards start off-screen right (from Digger's side) and land on the left
        kpiTl
          .from("#kpi1", { x: 700, opacity: 0, duration: 1 }, 0)
          .from("#kpi2", { x: 700, opacity: 0, duration: 1 }, 0.22)
          .from("#kpi3", { x: 700, opacity: 0, duration: 1 }, 0.44)
          .from("#kpi4", { x: 700, opacity: 0, duration: 1 }, 0.66);

        // Digger himself does a subtle entrance — rises up slightly as section pins
        gsap.from("#diggerImg", {
          y: 40, opacity: 0, duration: 1.2, ease: "power2.out",
          scrollTrigger: {
            trigger: "#kpiSection",
            start: "top 80%",
            end: "top 20%",
            scrub: 0.8,
          },
        });

        // ── Effect 3: Problem section slides up over the scale panel ──────
        // The problem section has a solid background that covers the pinned panel
        gsap.from("#problemSection", {
          y: 60,
          opacity: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#problemSection",
            start: "top 85%",
            end: "top 40%",
            scrub: 0.5,
          },
        });

      });
    };

    init();
    return () => ctx?.revert();
  }, []);
}

// ─── Word-by-word reveal ─────────────────────────────────────────────────────
function WordReveal({ text, className = "", base = 0 }: { text: string; className?: string; base?: number }) {
  return (
    <span data-wg className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="wr" style={{ "--wd": `${base + i * 0.045}s` } as React.CSSProperties}>
          {w}{" "}
        </span>
      ))}
    </span>
  );
}

// ─── Slide-text button ───────────────────────────────────────────────────────
function SlideBtn({ children, href, gold = false }: { children: React.ReactNode; href: string; gold?: boolean }) {
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
  useGsapAnimations();

  const kpis = [
    { id: "kpi1", num: "$4.2T",  label: "US P&C premium written annually", sub: "The market that independent underwriting expertise serves." },
    { id: "kpi2", num: "40K+",   label: "Underwriter roles disrupted by automation", sub: "The talent didn't disappear. It just has nowhere to go." },
    { id: "kpi3", num: "Zero",   label: "Major platforms for independent consultants", sub: "Until now. DUG is the first network built for this gap." },
    { id: "kpi4", num: "3",      label: "Ways DUG turns expertise into income", sub: "Community reputation. Dojo record. Marketplace engagements." },
  ] as const;

  const pillars = [
    { tag: "Community", title: "Credibility you earn in public.", body: "Debate real risks, challenge peers, and build a reputation that travels with you. When someone with 200 Dojo completions and a 4.9 rating weighs in, it carries weight.", href: "/community", cta: "Explore discussions", gold: false },
    { tag: "The Dojo",  title: "Reps before the paycheck.",    body: "Practice on curated risk scenarios, get scored, compete in timed contests. Your Dojo record feeds your public profile before you ever claim a paid engagement.", href: "/dojo",      cta: "Start training",    gold: true  },
    { tag: "Marketplace", title: "Advisory work on your terms.", body: "Claim consulting assignments — second looks, audits, renewal reviews, complex risk analysis. Your reputation from community and Dojo follows you here.", href: "/engagements", cta: "Browse engagements", gold: false },
  ] as const;

  const audience = [
    ["Senior veterans",    "Mentor, moderate, and take the occasional engagement. Stay sharp without going back to a carrier seat."],
    ["Claims adjusters",   "You understand loss. The Dojo teaches you to price it. Cross the aisle on your schedule."],
    ["Hungry juniors",     "See 10× more risk across more lines than any carrier will show you. Build your book in public."],
    ["Between jobs",       "Keep sharp, build visibility, and earn consulting income while you figure out the next move."],
    ["Subject matter experts", "Deep expertise in cannabis, BESS, cyber, ag? The market needs your brain. DUG gives you the reps."],
    ["Premium auditors",   "Risk data fluency is half the job. The other half is right here."],
  ] as const;

  const dojoFeatures = [
    ["Practice cases",      "Curated scenarios across lines. Submit an analysis, get scored, see how you compare."],
    ["Contests",            "Timed challenges with live leaderboards. Compete for recognition, not just reps."],
    ["Public record",       "Your training history lives on your profile. Strong Dojo record = instant credibility."],
    ["Blinded carrier data","Eventually: real submissions, anonymized. The closest thing to live reps outside a carrier seat."],
  ] as const;

  return (
    <div className="v2" data-theme="dark">
      <SiteHeader />
      <main>

        {/* ── 1. HERO ───────────────────────────────────────────────────── */}
        <section className="v2-s v2-hero">
          <div className="v2-w">
            <p className="v2-eye" data-rev>THE NETWORK FOR INDEPENDENT UNDERWRITING</p>
            <h1 className="v2-h1" data-rev style={{ "--d": "0.1s" } as React.CSSProperties}>
              Underwriting talent<br />is distributed.<br />
              <span className="v2-h1--em">Now it&apos;s deployable.</span>
            </h1>
            <p className="v2-sub" data-rev style={{ "--d": "0.2s" } as React.CSSProperties}>
              DUG is the platform where independent underwriters build reputation,
              sharpen their edge, and take on consulting work — on their own terms.
            </p>
            <div className="v2-ctas" data-rev style={{ "--d": "0.3s" } as React.CSSProperties}>
              <SlideBtn href="/signup" gold>Join the Network</SlideBtn>
              <SlideBtn href="/dojo">Enter the Dojo</SlideBtn>
            </div>
            <p className="v2-fn" data-rev style={{ "--d": "0.4s" } as React.CSSProperties}>
              Free to join. No carrier affiliation required.{" "}
              <Link href="/manifesto" className="v2-a">Read the manifesto →</Link>
            </p>
          </div>
        </section>

        {/* ── 2. SCALE-UP PANEL (GSAP Effect 1) ────────────────────────── */}
        {/* Outer wrapper: tall so GSAP has scroll distance to work with    */}
        {/* Inner panel: starts small + rounded, scales to full-screen      */}
        <div id="scaleWrap" className="v2-scale-wrap">
          <div id="scalePanel" className="v2-scale-panel">
            {/* Ambient grid overlay */}
            <div className="v2-scale-grid" aria-hidden="true" />
            {/* Content centered inside the panel */}
            <div className="v2-scale-content">
              <p className="v2-eye v2-eye--g" style={{ marginBottom: "1.5rem" }}>
                THE UNDERWRITING MARKET
              </p>
              <h2 className="v2-scale-h">
                The industry automated the seats.<br />
                <span style={{ color: "#c4895a" }}>The talent is still here.</span>
              </h2>
              <p className="v2-scale-sub">
                DUG is the infrastructure the independent underwriting market has been missing.
              </p>
            </div>
            {/* Decorative bottom fade */}
            <div className="v2-scale-fade" aria-hidden="true" />
          </div>
        </div>

        {/* ── 3. DIGGER + KPI CARDS (GSAP Effect 2) ────────────────────── */}
        {/* Light cream section — deliberate contrast break in the dark page  */}
        {/* Digger stands on the right; KPI cards fly in from his side        */}
        <section id="kpiSection" className="v2-kpi-section">
          <div className="v2-kpi-inner">

            {/* Left column — KPI content */}
            <div className="v2-kpi-left">
              <p className="v2-eye v2-eye--amber" style={{ marginBottom: "1rem" }}>
                THE OPPORTUNITY
              </p>
              <p className="v2-kpi-label">The numbers that make the case.</p>
              <div className="v2-kpi-grid">
                {kpis.map((k) => (
                  <div key={k.id} id={k.id} className="v2-kpi-card">
                    <div className="v2-kpi-num">{k.num}</div>
                    <div className="v2-kpi-title">{k.label}</div>
                    <p className="v2-kpi-body">{k.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — Digger, large, bottom-anchored */}
            <div className="v2-kpi-right">
              <Image
                id="diggerImg"
                src="/dug-mole.png"
                alt="Digger — DUG mascot"
                width={600}
                height={750}
                className="v2-digger-img"
                priority
              />
            </div>

          </div>
        </section>

        {/* ── 4. PROBLEM ESCALATION (slides up over scale panel) ───────── */}
        <section id="problemSection" className="v2-s v2-problem">
          <div className="v2-w">
            <p className="v2-eye" data-rev>THE UNDERWRITING TALENT GAP</p>
            <h2 className="v2-stat-h">
              <WordReveal text="The insurance industry spent a decade automating underwriter seats. The talent didn't disappear." />
              <WordReveal text="It just has nowhere to go." className="v2-stat-em" base={0.65} />
            </h2>
            <div className="v2-probs">
              {([
                ["Carriers need expert second opinions",       "but their internal bench is thin and getting thinner."],
                ["Independent consultants have deep expertise","but no platform, no pipeline, and no way to prove it."],
                ["Emerging talent has the instincts",          "but no track record, no reps, and no way in."],
                ["Brokers need verified risk experts",         "but have no way to find or vet independent underwriters."],
              ] as const).map(([bold, rest], i) => (
                <div key={i} className="v2-prob" data-rev style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}>
                  <span className="v2-prob__n">0{i + 1}</span>
                  <span><strong>{bold}</strong> {rest}</span>
                </div>
              ))}
            </div>
            <div className="v2-contrast" data-rev>
              <p className="v2-contrast__a">Without a network, underwriting talent is invisible.</p>
              <p className="v2-contrast__b">With DUG, it&apos;s deployable.</p>
            </div>
          </div>
        </section>

        {/* ── 5. PLATFORM ───────────────────────────────────────────────── */}
        <section className="v2-s v2-platform">
          <div className="v2-w">
            <p className="v2-eye" data-rev>INFRASTRUCTURE FOR INDEPENDENT UNDERWRITING</p>
            <h2 className="v2-sh2" data-rev style={{ "--d": "0.1s" } as React.CSSProperties}>The DUG Platform</h2>
            <div className="v2-pgrid">
              {pillars.map((p, i) => (
                <div key={p.tag} className={`v2-pc${p.gold ? " v2-pc--g" : ""}`} data-rev style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}>
                  <p className="v2-pc__tag">{p.tag}</p>
                  <h3 className="v2-pc__h3">{p.title}</h3>
                  <p className="v2-pc__body">{p.body}</p>
                  <Link href={p.href} className="v2-pc__link">{p.cta}<ArrowRight className="v2-pc__icon" /></Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. WHO IT'S FOR ───────────────────────────────────────────── */}
        <section className="v2-s v2-for">
          <div className="v2-w">
            <p className="v2-eye" data-rev>BUILT FOR</p>
            <h2 className="v2-sh2" data-rev style={{ "--d": "0.1s" } as React.CSSProperties}>
              One network.<br />Every underwriter.
            </h2>
            <div className="v2-fgrid">
              {audience.map(([title, body], i) => (
                <div key={title as string} className="v2-fc" data-rev style={{ "--d": `${i * 0.07}s` } as React.CSSProperties}>
                  <p className="v2-fc__title">{title}</p>
                  <p className="v2-fc__body">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. DOJO SPOTLIGHT ─────────────────────────────────────────── */}
        <section className="v2-s v2-dojo">
          <div className="v2-w">
            <div className="v2-dojo-in">
              <div data-rev>
                <p className="v2-eye v2-eye--g">THE DOJO</p>
                <h2 className="v2-dojo-h">The path from insider<br />to underwriter.</h2>
                <p className="v2-dojo-p">An Uber driver isn&apos;t a professional driver — but they can become one. The Dojo is the vessel. Claims adjusters, premium auditors, subject matter experts, and career changers get structured reps on real risk scenarios instead of waiting for a carrier to sweep them up and train them.</p>
                <p className="v2-dojo-p v2-mt">Practice submissions are scored. Contests rank participants in real time. Your Dojo record feeds your public profile — before you ever claim a paid engagement.</p>
                <div className="v2-mt2"><SlideBtn href="/dojo" gold>Enter the Dojo</SlideBtn></div>
              </div>
              <div className="v2-dojo-feats">
                {dojoFeatures.map(([t, b], i) => (
                  <div key={t as string} className="v2-df" data-rev style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}>
                    <p className="v2-df__t">{t}</p>
                    <p className="v2-df__b">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. FINAL CTA ──────────────────────────────────────────────── */}
        <section className="v2-s v2-cta-s">
          <div className="v2-w">
            <div className="v2-cta-box" data-rev>
              <p className="v2-eye v2-eye--g">READY TO BUILD YOUR REPUTATION?</p>
              <h2 className="v2-cta-h">Your expertise is already here.<br />The reps aren&apos;t.</h2>
              <p className="v2-cta-p">Join the community. Hit the Dojo. Take an engagement when you&apos;re ready. Your profile builds the whole time.</p>
              <div className="v2-cta-btns">
                <SlideBtn href="/signup" gold>Create your profile</SlideBtn>
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
        .v2-eye { font-size:.68rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:rgba(240,236,228,.38); margin-bottom:1.25rem; }
        .v2-eye--g { color: rgba(196,137,90,.75); }

        /* ─── Scroll reveal ─── */
        [data-rev] { opacity:0; transform:translateY(22px); transition:opacity .65s ease,transform .65s ease; transition-delay:var(--d,0s); }
        [data-rev][data-vis] { opacity:1; transform:translateY(0); }

        /* ─── Word reveal ─── */
        .wr { display:inline; opacity:0; filter:blur(4px); transition:none; }
        .wg-vis .wr { animation:wFade .5s ease forwards; animation-delay:var(--wd,0s); }
        @keyframes wFade { from{opacity:0;filter:blur(4px);} to{opacity:1;filter:blur(0);} }

        /* ─── Slide button ─── */
        .sb { display:inline-flex; align-items:center; overflow:hidden; border-radius:9999px; padding:.72rem 1.6rem; font-size:.78rem; font-weight:700; letter-spacing:.07em; text-transform:uppercase; text-decoration:none; border:1px solid rgba(240,236,228,.2); color:rgba(240,236,228,.8); transition:border-color .2s; }
        .sb:hover { border-color:rgba(240,236,228,.45); }
        .sb--gold { background:#c4895a; color:#1a1410; border-color:transparent; }
        .sb--gold:hover { background:#d4a574; border-color:transparent; }
        .sb__track { display:flex; flex-direction:column; height:1em; line-height:1em; transition:transform .28s cubic-bezier(.4,0,.2,1); }
        .sb:hover .sb__track { transform:translateY(-1em); }
        .sb__txt { display:block; height:1em; white-space:nowrap; }

        /* ─── Hero ─── */
        .v2-hero { min-height:92vh; display:flex; align-items:center; padding-top:8rem; padding-bottom:5rem; position:relative; overflow:hidden; }
        .v2-hero::before { content:""; position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse 70% 55% at 15% 55%,rgba(196,137,90,.09) 0%,transparent 65%); }
        .v2-hero .v2-w { position:relative; z-index:1; }
        .v2-h1 { font-size:clamp(2.6rem,7.5vw,5.5rem); font-weight:700; letter-spacing:-.03em; line-height:1.06; margin-bottom:1.5rem; }
        .v2-h1--em { color:#c4895a; }
        .v2-sub { font-size:clamp(.95rem,2vw,1.2rem); color:rgba(240,236,228,.6); max-width:40rem; line-height:1.65; margin-bottom:2rem; }
        .v2-ctas { display:flex; gap:.75rem; flex-wrap:wrap; margin-bottom:1.25rem; }
        .v2-fn { font-size:.78rem; color:rgba(240,236,228,.38); }
        .v2-a { color:rgba(240,236,228,.55); text-decoration:underline; text-underline-offset:3px; }
        .v2-a:hover { color:rgba(240,236,228,.8); }

        /* ─── Scale-up panel ─── */
        /* The wrap is tall so GSAP has scroll distance. The panel is position:absolute  */
        /* inside a sticky container so it stays centered while you scroll.              */
        .v2-scale-wrap {
          position: relative;
          height: 250vh; /* scroll distance for the scale animation */
          background: #0d0b08;
        }
        .v2-scale-panel {
          /* GSAP will pin this via ScrollTrigger pin on the outer wrapper.       */
          /* Starts at scale(0.42) — appears as a card. Grows to scale(1) = full. */
          width: 100vw;
          height: 100vh;
          background: #0d0b08;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          /* Subtle warm radial gradient so it reads as a distinct "scene" */
          background: radial-gradient(ellipse 90% 80% at 50% 50%, #1a1208 0%, #0d0b08 70%);
          transform-origin: center center;
          will-change: transform, border-radius;
        }
        /* Subtle grid lines — give the panel a "data/tech" feel */
        .v2-scale-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(196,137,90,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(196,137,90,.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .v2-scale-content {
          position: relative; z-index: 2;
          text-align: center; max-width: 52rem; padding: 0 2rem;
        }
        .v2-scale-h {
          font-size: clamp(2rem, 5vw, 4rem); font-weight: 700;
          letter-spacing: -.03em; line-height: 1.15; margin-bottom: 1.25rem;
        }
        .v2-scale-sub {
          font-size: clamp(.9rem, 1.5vw, 1.1rem);
          color: rgba(240,236,228,.55); line-height: 1.65;
        }
        /* Bottom fade so it blends into next section */
        .v2-scale-fade {
          position: absolute; bottom: 0; left: 0; right: 0; height: 30vh;
          background: linear-gradient(to bottom, transparent, #0d0b08);
          pointer-events: none; z-index: 3;
        }

        /* ─── KPI / Digger section ─── */
        /* Cream background — deliberate light contrast break in the dark page */
        .v2-kpi-section {
          background: #faf7f2;
          padding: 0;
          position: relative;
          overflow: hidden;
          color: #1c1410;
        }
        .v2-kpi-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          align-items: center;
          max-width: 72rem;
          margin: 0 auto;
          padding: 0 2rem;
        }
        @media (max-width: 768px) {
          .v2-kpi-inner { grid-template-columns: 1fr; padding: 4rem 1.5rem; }
        }
        .v2-kpi-left { padding: 5rem 2rem 5rem 0; position: relative; z-index: 2; }
        @media (max-width: 768px) { .v2-kpi-left { padding: 2rem 0; } }

        /* Digger — right column, bottom-anchored, large */
        .v2-kpi-right {
          position: relative; height: 100vh;
          display: flex; align-items: flex-end; justify-content: center;
          overflow: visible;
        }
        @media (max-width: 768px) { .v2-kpi-right { height: 50vw; } }
        .v2-digger-img {
          height: 88vh; width: auto;
          object-fit: contain; object-position: bottom center;
          position: absolute; bottom: 0;
          /* Subtle drop shadow so he pops off the cream bg */
          filter: drop-shadow(0 8px 40px rgba(28,20,16,0.18));
          will-change: transform, opacity;
        }
        @media (max-width: 768px) { .v2-digger-img { height: 50vw; position: relative; } }

        /* eyebrow override for cream bg */
        .v2-eye--amber { color: #7b4f28; opacity: 0.7; }

        .v2-kpi-label {
          font-size: clamp(1.1rem, 2.5vw, 1.6rem); font-weight: 700;
          letter-spacing: -.02em; margin-bottom: 2.5rem; color: #1c1410;
        }
        .v2-kpi-grid { display: flex; flex-direction: column; gap: .9rem; }
        .v2-kpi-card {
          display: grid;
          grid-template-columns: 6rem 1fr;
          gap: .5rem 1.25rem;
          align-items: start;
          padding: 1.25rem 1.5rem;
          border: 1px solid rgba(28,20,16,0.1);
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 2px 12px rgba(28,20,16,0.06);
          will-change: transform, opacity;
        }
        .v2-kpi-num {
          font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 700;
          letter-spacing: -.03em; color: #7b4f28;
          grid-row: span 2; display: flex; align-items: center;
        }
        .v2-kpi-title { font-size: .85rem; font-weight: 700; line-height: 1.4; color: #1c1410; }
        .v2-kpi-body { font-size: .78rem; color: #7a6b5d; line-height: 1.55; }

        /* ─── Problem ─── */
        .v2-problem { background: #0d0b08; }
        .v2-stat-h { font-size:clamp(1.5rem,4vw,2.8rem); font-weight:700; letter-spacing:-.025em; line-height:1.35; max-width:52rem; margin-bottom:3.5rem; }
        .v2-stat-em { display:block; color:#c4895a; margin-top:.25rem; }
        .v2-probs { display:flex; flex-direction:column; gap:1rem; margin-bottom:3.5rem; }
        .v2-prob { display:flex; gap:1.25rem; align-items:baseline; padding:1.25rem 1.5rem; border:1px solid rgba(240,236,228,.08); border-radius:12px; background:rgba(240,236,228,.025); font-size:.95rem; line-height:1.65; color:rgba(240,236,228,.68); }
        .v2-prob strong { color:#f0ece4; }
        .v2-prob__n { font-size:.65rem; font-weight:700; letter-spacing:.08em; color:#c4895a; min-width:1.5rem; flex-shrink:0; padding-top:.15rem; }
        .v2-contrast { padding-top:1rem; }
        .v2-contrast__a { font-size:clamp(1.1rem,3vw,2rem); font-weight:700; letter-spacing:-.02em; color:rgba(240,236,228,.38); line-height:1.3; margin-bottom:.2rem; }
        .v2-contrast__b { font-size:clamp(1.1rem,3vw,2rem); font-weight:700; letter-spacing:-.02em; color:#f0ece4; line-height:1.3; }

        /* ─── Platform ─── */
        .v2-sh2 { font-size:clamp(1.8rem,4vw,3rem); font-weight:700; letter-spacing:-.025em; line-height:1.2; margin-bottom:2.5rem; }
        .v2-pgrid { display:grid; gap:1.25rem; grid-template-columns:1fr; }
        @media(min-width:768px){.v2-pgrid{grid-template-columns:repeat(3,1fr);}}
        .v2-pc { padding:2rem; border-radius:16px; border:1px solid rgba(240,236,228,.1); background:rgba(240,236,228,.03); display:flex; flex-direction:column; gap:.75rem; transition:border-color .2s,background .2s; }
        .v2-pc:hover { border-color:rgba(240,236,228,.2); background:rgba(240,236,228,.05); }
        .v2-pc--g { border-color:rgba(196,137,90,.3); background:rgba(196,137,90,.05); }
        .v2-pc--g:hover { border-color:rgba(196,137,90,.5); background:rgba(196,137,90,.08); }
        .v2-pc__tag { font-size:.65rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#c4895a; }
        .v2-pc__h3 { font-size:1.1rem; font-weight:700; letter-spacing:-.01em; }
        .v2-pc__body { font-size:.88rem; color:rgba(240,236,228,.58); line-height:1.65; flex:1; }
        .v2-pc__link { display:inline-flex; align-items:center; gap:.35rem; font-size:.8rem; font-weight:600; color:#c4895a; text-decoration:none; margin-top:.5rem; transition:gap .2s; }
        .v2-pc__link:hover { gap:.6rem; }
        .v2-pc__icon { width:.82rem; height:.82rem; }

        /* ─── For ─── */
        .v2-fgrid { display:grid; gap:1rem; margin-top:2.5rem; grid-template-columns:1fr; }
        @media(min-width:640px){.v2-fgrid{grid-template-columns:repeat(2,1fr);}}
        @media(min-width:1024px){.v2-fgrid{grid-template-columns:repeat(3,1fr);}}
        .v2-fc { padding:1.5rem; border-radius:12px; border:1px solid rgba(240,236,228,.08); background:rgba(240,236,228,.02); transition:border-color .2s,background .2s; }
        .v2-fc:hover { border-color:rgba(240,236,228,.18); background:rgba(240,236,228,.04); }
        .v2-fc__title { font-size:.9rem; font-weight:700; margin-bottom:.4rem; }
        .v2-fc__body { font-size:.82rem; color:rgba(240,236,228,.52); line-height:1.65; }

        /* ─── Dojo ─── */
        .v2-dojo-in { display:grid; gap:4rem; grid-template-columns:1fr; }
        @media(min-width:1024px){.v2-dojo-in{grid-template-columns:1fr 1fr;align-items:start;}}
        .v2-dojo-h { font-size:clamp(1.8rem,4vw,3rem); font-weight:700; letter-spacing:-.025em; line-height:1.2; margin-bottom:1.25rem; }
        .v2-dojo-p { font-size:.92rem; color:rgba(240,236,228,.58); line-height:1.72; }
        .v2-mt { margin-top:.9rem; }
        .v2-mt2 { margin-top:2rem; }
        .v2-dojo-feats { display:grid; gap:1rem; grid-template-columns:1fr 1fr; }
        .v2-df { padding:1.25rem; border-radius:12px; border:1px solid rgba(196,137,90,.18); background:rgba(196,137,90,.04); }
        .v2-df__t { font-size:.85rem; font-weight:700; margin-bottom:.35rem; color:#d4a574; }
        .v2-df__b { font-size:.78rem; color:rgba(240,236,228,.52); line-height:1.6; }

        /* ─── CTA ─── */
        .v2-cta-s { padding-bottom:8rem; }
        .v2-cta-box { border:1px solid rgba(240,236,228,.1); border-radius:20px; background:rgba(240,236,228,.025); padding:4rem 3rem; text-align:center; }
        @media(max-width:640px){.v2-cta-box{padding:2.5rem 1.5rem;}}
        .v2-cta-h { font-size:clamp(1.8rem,4vw,3rem); font-weight:700; letter-spacing:-.025em; line-height:1.2; margin:.75rem 0 1rem; }
        .v2-cta-p { font-size:.95rem; color:rgba(240,236,228,.52); max-width:34rem; margin:0 auto 2.25rem; line-height:1.65; }
        .v2-cta-btns { display:flex; gap:.75rem; justify-content:center; flex-wrap:wrap; }
      `}</style>
    </div>
  );
}
