"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import HeroVisual from "./HeroVisual";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  function scrollTo(href: string) {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#000000]"
      aria-labelledby="hero-headline"
      style={{ paddingTop: "64px" /* navbar height */ }}
    >
      {/* ── Full-bleed black base ── */}
      <div className="absolute inset-0 bg-[#000000]" aria-hidden="true" />

      {/* ── Very subtle ambient radial — left side stays dark ── */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          right: 0, top: "10%",
          width: "55%", height: "80%",
          background: "radial-gradient(ellipse at 70% 45%, rgba(190,245,50,0.04) 0%, transparent 65%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[45fr_55fr] gap-8 lg:gap-0 items-center min-h-[calc(100vh-64px)] py-16 lg:py-0">

          {/* ════ LEFT — editorial copy ════ */}
          <div className="flex flex-col gap-8 hero-enter lg:pr-10 xl:pr-16">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 self-start">
              <span className="w-5 h-px bg-[#BEF532]" />
              <span
                className="text-[#BEF532] text-[11px] tracking-[0.18em] uppercase font-medium"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                Smart envelope wallet
              </span>
            </div>

            {/* Headline */}
            <h1
              id="hero-headline"
              className="text-[48px] sm:text-[58px] lg:text-[60px] xl:text-[72px] font-bold leading-[1.0] tracking-[-0.035em] text-white"
              style={{ fontFamily: "Geist, Inter, sans-serif" }}
            >
              Give Every Franc<br />
              <span className="text-[#BEF532]">a Purpose.</span>
            </h1>

            {/* Supporting copy */}
            <p className="text-[#A3A3A3] text-[16px] sm:text-[17px] leading-[1.75] max-w-[420px]">
              Lock in your priorities. Unlock financial peace of mind.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#BEF532] text-[#0a1200] text-[15px] font-bold hover:bg-[#ceff3f] active:scale-[0.97] transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BEF532]"
                style={{ boxShadow: "0 0 28px rgba(190,245,50,0.25)" }}
              >
                Explore WiseHaven
                <ArrowRight size={15} />
              </Link>
              <button
                onClick={() => scrollTo("#how-it-works")}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[#2a2a2a] text-[#A3A3A3] text-[15px] font-medium hover:border-[#404040] hover:text-white transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BEF532]"
              >
                See how it works
              </button>
            </div>

            {/* Trust line */}
            <p
              className="text-[#3a3a3a] text-[12px] tracking-wide"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              Prototype · Simulated money only · No real financial product
            </p>
          </div>

          {/* ════ RIGHT — Protected Orbit visual ════ */}
          <div
            className="relative flex items-center justify-center hero-enter"
            style={{ animationDelay: "0.15s", minHeight: "440px" }}
          >
            <HeroVisual sectionRef={sectionRef} />
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none" aria-hidden="true">
        <div className="w-px h-10 bg-gradient-to-b from-[#2a2a2a] to-transparent" />
        <span
          className="text-[#2a2a2a] text-[9px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          Scroll
        </span>
      </div>
    </section>
  );
}
