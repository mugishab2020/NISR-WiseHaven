"use client";

import Link from "next/link";

export default function HeroSection() {
  function scrollTo(id: string) {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div style={{ background: "#000", color: "#f7f8f3", fontFamily: "Inter, sans-serif" }}>

      {/* ── Nav ───────────────────────────────────────────── */}
      <nav
        className="w-full flex items-center justify-between px-6 lg:px-12"
        style={{ minHeight: "88px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-3 no-underline"
          style={{ color: "#ffffff", fontSize: "19px", fontWeight: 750, letterSpacing: "-0.04em", fontFamily: "Geist, Inter, sans-serif" }}
          aria-label="WiseHaven home"
        >
          <span
            className="flex items-center justify-center font-black shrink-0"
            style={{ width: "34px", height: "34px", background: "#bef532", color: "#080a04", borderRadius: "10px 10px 10px 3px", fontSize: "19px" }}
            aria-hidden="true"
          >
            W
          </span>
          WiseHaven
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "How it works",    id: "#how-it-works" },
            { label: "Smart envelopes", id: "#envelopes"    },
            { label: "Emergency vault", id: "#vault"        },
          ].map(({ label, id }) => (
            <a
              key={label}
              href={id}
              onClick={(e) => { e.preventDefault(); scrollTo(id); }}
              style={{ color: "#b7b8b1", fontSize: "13px", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#bef532"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#b7b8b1"; }}
            >
              {label}
            </a>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 no-underline"
          style={{ background: "#bef532", color: "#090b04", fontSize: "13px", fontWeight: 750, padding: "12px 18px", borderRadius: "6px", transition: "transform 0.2s ease, background 0.2s ease" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.background = "#d0ff65"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.background = "#bef532"; }}
        >
          Get started <span aria-hidden="true">↗</span>
        </Link>
      </nav>

      {/* ── Hero — two columns ────────────────────────────── */}
      <section
        className="w-full flex flex-col lg:flex-row items-center"
        style={{ minHeight: "calc(100svh - 88px)", maxWidth: "1500px", margin: "0 auto", padding: "0 clamp(20px, 5vw, 80px)" }}
        aria-labelledby="wh-headline"
      >
        {/* ── LEFT — Copy ────────────────────────────────── */}
        <div
          className="flex flex-col justify-center flex-1 py-16 lg:py-0"
          style={{ maxWidth: "520px", zIndex: 2 }}
        >
          {/* Headline */}
          <h1
            id="wh-headline"
            style={{
              fontFamily: "Geist, Inter, sans-serif",
              fontSize: "clamp(48px, 6vw, 88px)",
              fontWeight: 720,
              letterSpacing: "-0.075em",
              lineHeight: 0.97,
              color: "#ffffff",
              margin: 0,
            }}
          >
            Give Every
            <br />
            Franc a
            <br />
            <span style={{ color: "#bef532" }}>Purpose.</span>
          </h1>

          {/* Description */}
          <p
            style={{
              marginTop: "24px",
              maxWidth: "400px",
              color: "#a6a79f",
              fontSize: "clamp(15px, 1.3vw, 18px)",
              lineHeight: 1.85,
            }}
          >
            Lock in your priorities before you spend them.
            <br />
            Unlock financial peace of mind — one envelope at a time.
          </p>

          {/* CTAs */}
          <div className="flex items-center flex-wrap gap-6 mt-9">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 no-underline"
              style={{ background: "#bef532", color: "#090b04", fontSize: "14px", fontWeight: 750, minHeight: "52px", padding: "0 24px", borderRadius: "8px", transition: "transform 0.2s ease, background 0.2s ease" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.background = "#d0ff65"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.background = "#bef532"; }}
            >
              Explore WiseHaven <span aria-hidden="true">↗</span>
            </Link>

            <a
              href="#how-it-works"
              onClick={(e) => { e.preventDefault(); scrollTo("#how-it-works"); }}
              className="flex items-center gap-2"
              style={{ color: "#b7b8b1", fontSize: "13px", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#bef532"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#b7b8b1"; }}
            >
              See how it works <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Trust note */}
          <div className="flex items-center gap-2.5 mt-12" style={{ color: "#777970", fontSize: "11px" }}>
            <span
              className="flex items-center justify-center w-5 h-5 rounded-full shrink-0"
              style={{ border: "1px solid rgba(190,245,50,0.40)", color: "#bef532", fontSize: "9px" }}
            >
              ✓
            </span>
            Built for intentional money habits. Demo prototype — no real money.
          </div>
        </div>

        {/* ── RIGHT — Video ───────────────────────────────── */}
        <div
          className="relative flex-1 w-full lg:w-auto shrink-0"
          style={{
            minHeight: "360px",
            maxHeight: "680px",
            height: "clamp(360px, 55vh, 680px)",
            maxWidth: "680px",
            width: "100%",
          }}
          aria-hidden="true"
        >
          {/* Video container — borderless, slow-grow animation */}
          <style>{`
            @keyframes wh-video-grow {
              0%   { transform: scale(1);    }
              50%  { transform: scale(1.06); }
              100% { transform: scale(1);    }
            }
            .wh-video-grow {
              animation: wh-video-grow 8s ease-in-out infinite;
            }
          `}</style>
          <div
            className="w-full h-full relative overflow-hidden wh-video-grow"
            style={{
              borderRadius: "16px",
              boxShadow: "0 0 80px rgba(190,245,50,0.06), 0 32px 64px rgba(0,0,0,0.60)",
            }}
          >
            <video
              className="w-full h-full"
              style={{ objectFit: "cover", objectPosition: "center", display: "block" }}
              src="/BG video-muted.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />

            {/* Subtle left-edge fade — blends into black page behind copy */}
            <div
              className="absolute inset-y-0 left-0"
              style={{
                width: "40%",
                background: "linear-gradient(to right, rgba(0,0,0,0.55), transparent)",
                pointerEvents: "none",
              }}
            />

            {/* Bottom-edge fade — merges into page */}
            <div
              className="absolute inset-x-0 bottom-0"
              style={{
                height: "30%",
                background: "linear-gradient(to top, rgba(0,0,0,0.60), transparent)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Ambient lime glow behind the video */}
          <div
            className="absolute -z-10"
            style={{
              inset: "-40px",
              background: "radial-gradient(ellipse at center, rgba(190,245,50,0.06) 0%, transparent 70%)",
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />
        </div>
      </section>

      {/* ── Bottom tagline marquee ─────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "relative",
        }}
      >
        <style>{`
          @keyframes wh-marquee {
            0%   { transform: translateX(100vw); opacity: 1; }
            85%  { opacity: 1; }
            100% { transform: translateX(-100%); opacity: 0; }
          }
          .wh-marquee-track {
            display: inline-flex;
            align-items: center;
            animation: wh-marquee 20s linear infinite;
          }
        `}</style>
        <div className="wh-marquee-track" style={{ color: "#555", fontSize: "9px", letterSpacing: "1.8px", padding: "20px 0" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0" }}>
            <span>PLAN WITH INTENTION</span>
            <span style={{ width: "28px", height: "1px", background: "#2a2a2a", display: "inline-block", margin: "0 20px" }} />
            <span>SPEND WITH CLARITY</span>
            <span style={{ width: "28px", height: "1px", background: "#2a2a2a", display: "inline-block", margin: "0 20px" }} />
            <span>BUILD YOUR HAVEN</span>
          </span>
        </div>
      </div>
    </div>
  );
}
