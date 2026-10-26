"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const QUOTES = [
  { text: "Victory favors the prepared.", author: null },
  { text: "The future belongs to those who prepare for it today.", author: "Malcolm X" },
  { text: "Tomorrow's success is built on today's preparation.", author: null },
  { text: "Preparation is the key that unlocks the door to tomorrow.", author: null },
  { text: "Opportunity meets the prepared; the future rewards them.", author: null },
];

export default function HeroSection() {
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Rotate quotes every 4 seconds with a fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 400);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  function scrollTo(id: string) {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div style={{ color: "#f7f8f3", fontFamily: "Inter, sans-serif", position: "relative" }}>

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav
        className="w-full flex items-center justify-between px-6 lg:px-12"
        style={{
          minHeight: "72px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(0,0,0,0.50)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline"
          style={{
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: 750,
            letterSpacing: "-0.04em",
            fontFamily: "Geist, Inter, sans-serif",
          }}
          aria-label="WiseHaven home"
        >
          <span
            className="flex items-center justify-center font-black shrink-0"
            style={{
              width: "32px",
              height: "32px",
              background: "#bef532",
              color: "#080a04",
              borderRadius: "9px 9px 9px 3px",
              fontSize: "18px",
            }}
            aria-hidden="true"
          >
            W
          </span>
          WiseHaven
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {[
            { label: "How it works",    id: "#how-it-works" },
            { label: "Smart envelopes", id: "#envelopes"    },
            { label: "Emergency vault", id: "#vault"        },
          ].map(({ label, id }) => (
            <a
              key={label}
              href={id}
              className="wh-nav-link"
              onClick={(e) => { e.preventDefault(); scrollTo(id); }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Nav CTA */}
        <Link
          href="/dashboard"
          className="wh-nav-cta flex items-center gap-2 no-underline"
          style={{
            background: "#bef532",
            color: "#090b04",
            fontSize: "13px",
            fontWeight: 750,
            padding: "10px 16px",
            borderRadius: "6px",
          }}
        >
          <span className="hidden sm:inline">Get started</span>
          <span className="sm:hidden">Open app</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </nav>

      {/* ── HERO BODY ─────────────────────────────────────── */}
      <section
        style={{
          minHeight: "calc(100svh - 72px)",
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
        aria-labelledby="wh-headline"
      >
        <div className="wh-hero-inner">

          {/* ── Single card ─────────────────────────────────── */}
          <div className="wh-hero-copy wh-fade-up" style={{ animationDelay: "0.05s", width: "100%" }}>
            <div className="wh-copy-clay" style={{ display: "flex", flexDirection: "column", gap: 0 }}>

              {/* ── Top: text left + video right ─────────── */}
              <div style={{ display: "flex", gap: "clamp(20px, 3vw, 40px)", alignItems: "stretch" }}>

                {/* Text side */}
                <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column" }}>

                  {/* Floating quotes card */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      background: "rgba(190,245,50,0.05)",
                      border: "1px solid rgba(190,245,50,0.15)",
                      borderRadius: "14px",
                      padding: "14px 18px",
                      marginBottom: "28px",
                      maxWidth: "360px",
                      alignSelf: "flex-start",
                      transition: "opacity 0.4s ease",
                      opacity: visible ? 1 : 0,
                    }}
                  >
                    {/* Quote mark */}
                    <span
                      style={{
                        fontFamily: "Geist, Georgia, serif",
                        fontSize: "32px",
                        lineHeight: 1,
                        color: "#bef532",
                        opacity: 0.5,
                        flexShrink: 0,
                        marginTop: "-4px",
                      }}
                      aria-hidden="true"
                    >
                      "
                    </span>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "#c8c9c2",
                          fontSize: "12px",
                          lineHeight: 1.7,
                          fontStyle: "italic",
                        }}
                      >
                        {QUOTES[quoteIndex].text}
                      </p>
                      {QUOTES[quoteIndex].author && (
                        <p
                          style={{
                            margin: "6px 0 0",
                            color: "#bef532",
                            fontSize: "10px",
                            letterSpacing: "1.5px",
                            fontFamily: "JetBrains Mono, monospace",
                            textTransform: "uppercase" as const,
                          }}
                        >
                          — {QUOTES[quoteIndex].author}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Headline */}
                  <h1
                    id="wh-headline"
                    style={{
                      fontFamily: "Geist, Inter, sans-serif",
                      fontSize: "clamp(32px, 4vw, 68px)",
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

                  {/* Body */}
                  <p
                    style={{
                      marginTop: "24px",
                      color: "#8a8b85",
                      fontSize: "clamp(13px, 1vw, 15px)",
                      lineHeight: 1.9,
                    }}
                  >
                    Lock in your priorities before you spend them.
                    Unlock financial peace of mind — one envelope at a time.
                  </p>

                  {/* CTAs */}
                  <div
                    className="wh-cta-row flex flex-wrap items-center gap-3"
                    style={{ marginTop: "28px" }}
                  >
                    <Link
                      href="/dashboard"
                      className="wh-cta-primary flex items-center gap-2 no-underline"
                      style={{
                        background: "#bef532",
                        color: "#090b04",
                        fontSize: "13px",
                        fontWeight: 750,
                        minHeight: "46px",
                        padding: "0 22px",
                        borderRadius: "8px",
                      }}
                    >
                      Explore WiseHaven <span aria-hidden="true">↗</span>
                    </Link>

                    <a
                      href="#how-it-works"
                      className="wh-cta-secondary flex items-center gap-2"
                      onClick={(e) => { e.preventDefault(); scrollTo("#how-it-works"); }}
                      style={{ color: "#b7b8b1", fontSize: "12px", textDecoration: "none" }}
                    >
                      See how it works <span aria-hidden="true">→</span>
                    </a>
                  </div>

                </div>{/* /text side */}

                {/* Video side — locked to native 16:9, self-contained */}
                <div
                  className="hidden md:flex"
                  style={{
                    flex: "0 0 clamp(200px, 42%, 440px)",
                    alignSelf: "center",
                    borderRadius: "12px",
                    overflow: "hidden",
                    aspectRatio: "16 / 9",
                  }}
                >
                  <video
                    src="/BG video-muted.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-label="WiseHaven app walkthrough preview"
                    style={{ width: "100%", height: "100%", display: "block", objectFit: "fill" }}
                  />
                </div>

              </div>{/* /top row */}

              {/* ── Bottom strip: trust + stats ──────────── */}
              <div
                style={{
                  marginTop: "32px",
                  paddingTop: "24px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                {/* Trust note */}
                <div
                  className="wh-trust flex items-center gap-2"
                  style={{ color: "#3e3f3a", fontSize: "11px", marginRight: "8px" }}
                >
                  <span
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: "1px solid rgba(190,245,50,0.30)",
                      color: "#bef532",
                      fontSize: "9px",
                    }}
                  >
                    ✓
                  </span>
                  Demo prototype — simulated money only. No real funds at risk.
                </div>

                {/* Divider */}
                <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.07)", flexShrink: 0 }} className="hidden sm:block" />

                {/* Stats */}
                {[
                  { value: "51.9%", label: "run out mid-month" },
                  { value: "55.1%", label: "no emergency savings" },
                  { value: "60.2%", label: "borrowed last 12 mo." },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col gap-0.5" style={{ minWidth: 0 }}>
                    <span
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "clamp(13px, 1.2vw, 17px)",
                        fontWeight: 700,
                        color: "#bef532",
                        lineHeight: 1,
                      }}
                    >
                      {value}
                    </span>
                    <span style={{ fontSize: "9px", color: "#484943", lineHeight: 1.4 }}>{label}</span>
                  </div>
                ))}
              </div>{/* /bottom strip */}

            </div>{/* /wh-copy-clay */}
          </div>

        </div>{/* /wh-hero-inner */}

        {/* Scroll hint — absolute inside the hero section, scrolls away with it */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            color: "rgba(190,245,50,0.45)",
            fontSize: "10px",
            letterSpacing: "2.5px",
            fontFamily: "JetBrains Mono, monospace",
            textTransform: "uppercase",
            pointerEvents: "none",
            animation: "wh-hint-fade 1.8s ease 1.4s both",
            whiteSpace: "nowrap",
          }}
        >
          scroll ↓
        </div>

        {/* Bottom fade into next section */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "160px",
            background: "linear-gradient(to bottom, transparent, rgba(8,8,8,0.97))",
            pointerEvents: "none",
          }}
        />
      </section>

      {/* ── MARQUEE STRIP ─────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "relative",
          background: "rgba(0,0,0,0.60)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div
          className="wh-marquee-track"
          style={{ color: "#3a3b36", fontSize: "9px", letterSpacing: "2px", padding: "18px 0" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <span>PLAN WITH INTENTION</span>
            <span style={{ width: "28px", height: "1px", background: "#222", display: "inline-block", margin: "0 24px" }} />
            <span>SPEND WITH CLARITY</span>
            <span style={{ width: "28px", height: "1px", background: "#222", display: "inline-block", margin: "0 24px" }} />
            <span>BUILD YOUR HAVEN</span>
            <span style={{ width: "28px", height: "1px", background: "#222", display: "inline-block", margin: "0 24px" }} />
            <span>GIVE EVERY FRANC A PURPOSE</span>
            <span style={{ width: "28px", height: "1px", background: "#222", display: "inline-block", margin: "0 24px" }} />
          </span>
        </div>
      </div>

    </div>
  );
}
