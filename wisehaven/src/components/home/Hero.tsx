"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, Shield, Zap } from "lucide-react";
import HeroOrbit from "./HeroOrbit";

// ── Dashboard mockup ─────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="relative w-full select-none" aria-hidden="true">

      {/* Main dashboard card */}
      <div className="relative bg-[#111111]/90 border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl hero-float backdrop-blur-sm"
        style={{ boxShadow: "0 0 0 1px rgba(190,245,50,0.06), 0 32px 64px rgba(0,0,0,0.7)" }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#BEF532]/6 blur-3xl pointer-events-none" />

        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-5 rounded overflow-hidden">
              <Image src="/WiseHaven Logo.jpg" alt="" fill sizes="20px" className="object-cover" />
            </div>
            <span className="text-white text-[11px] font-semibold" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
              WiseHaven
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BEF532] animate-pulse" />
            <span className="text-[#BEF532] text-[9px] font-mono uppercase tracking-wider">Protected</span>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {/* Balance row */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[#808080] text-[9px] font-mono uppercase tracking-widest mb-0.5">Total Reconciled</p>
              <p className="text-white text-[22px] font-bold font-mono tabular-nums leading-none" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
                250,000
              </p>
              <p className="text-[#BEF532] text-[11px] font-mono">RWF</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="px-2 py-1 rounded-full bg-[#BEF532]/10 border border-[#BEF532]/20 flex items-center gap-1">
                <Zap size={8} className="text-[#BEF532]" />
                <span className="text-[#BEF532] text-[9px] font-mono font-semibold">65,000 available</span>
              </div>
            </div>
          </div>

          {/* Allocation bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#808080] text-[9px] font-mono uppercase tracking-wider">Allocation</span>
              <span className="text-[#808080] text-[9px] font-mono">64% locked · 10% vault</span>
            </div>
            <div className="h-1.5 w-full bg-[#242424] rounded-full overflow-hidden flex gap-0.5">
              <div className="h-full bg-[#BEF532] rounded-full" style={{ width: "64%" }} />
              <div className="h-full bg-[#474746]" style={{ width: "26%" }} />
              <div className="h-full bg-[#353534] rounded-full" style={{ width: "10%" }} />
            </div>
          </div>

          {/* Mini envelope list */}
          <div className="flex flex-col gap-1.5">
            {[
              { name: "Rent", amount: "100,000", days: "9d left", pct: 75 },
              { name: "Food", amount: "20,000", days: "3d left", pct: 90 },
              { name: "Utilities", amount: "15,000", days: "1d left", pct: 98 },
            ].map((e) => (
              <div key={e.name} className="flex items-center justify-between bg-[#171717] rounded-lg px-3 py-2 border border-[#1e1e1e]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#BEF532]/10 flex items-center justify-center">
                    <Lock size={9} className="text-[#BEF532]" />
                  </div>
                  <span className="text-white text-[10px] font-medium">{e.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-[#242424] rounded-full overflow-hidden">
                    <div className="h-full bg-[#BEF532]" style={{ width: `${e.pct}%` }} />
                  </div>
                  <span className="text-[#808080] text-[9px] font-mono">{e.days}</span>
                  <span className="text-[#BEF532] text-[9px] font-mono font-bold">{e.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating vault card */}
      <div
        className="absolute -bottom-4 -left-4 bg-[#171717]/90 border border-[#2a2a2a] rounded-xl p-3 w-36 shadow-xl hero-float backdrop-blur-sm"
        style={{ animationDelay: "0.4s", boxShadow: "0 0 0 1px rgba(190,245,50,0.08), 0 16px 32px rgba(0,0,0,0.6)" }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Shield size={10} className="text-[#BEF532]" />
          <span className="text-[#808080] text-[9px] font-mono uppercase tracking-wider">Vault</span>
        </div>
        <p className="text-white font-bold text-[14px] font-mono tabular-nums">25,000</p>
        <p className="text-[#BEF532] text-[9px] font-mono mb-1.5">RWF saved</p>
        <div className="w-full bg-[#242424] h-1 rounded-full overflow-hidden">
          <div className="h-full bg-[#BEF532] rounded-full" style={{ width: "25%" }} />
        </div>
        <p className="text-[#808080] text-[9px] font-mono mt-1">25% of 100k goal</p>
      </div>

      {/* Floating status badge */}
      <div
        className="absolute -top-3 -right-3 bg-[#BEF532] rounded-xl px-3 py-2 shadow-xl hero-float"
        style={{ animationDelay: "0.7s", boxShadow: "0 0 24px rgba(190,245,50,0.35)" }}
      >
        <p className="text-[#0a1200] text-[10px] font-bold font-mono">4 envelopes</p>
        <p className="text-[#0a1200]/70 text-[9px]">actively locked</p>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────
export default function Hero() {
  function handleScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <section
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      aria-labelledby="hero-headline"
      style={{ backgroundColor: "#000000" }}
    >
      {/* ── Orbit background — fully behind content ── */}
      <HeroOrbit />

      {/* ── Content layer ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-0 min-h-[calc(100vh-4rem)] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">

          {/* ── Left: Copy ── */}
          <div className="flex flex-col gap-6 hero-enter">

            {/* Headline */}
            <h1
              id="hero-headline"
              className="text-[44px] sm:text-[56px] lg:text-[60px] xl:text-[68px] font-bold leading-[1.05] tracking-[-0.03em] text-white"
              style={{ fontFamily: "Geist, Inter, sans-serif" }}
            >
              Your money.<br />
              Your{" "}
              <span className="text-[#BEF532]">priorities.</span>
              <br />
              Your future.
            </h1>

            {/* Body */}
            <p className="text-[#A3A3A3] text-[16px] sm:text-[17px] leading-[1.7] max-w-[480px]">
              Give every franc a purpose. Set aside money for what matters, protect
              your priorities, and build a stronger financial future — one envelope
              at a time.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#BEF532] text-[#0a1200] text-[15px] font-bold hover:bg-[#ceff3f] active:scale-[0.97] transition-all duration-150"
                style={{ boxShadow: "0 0 32px rgba(190,245,50,0.30), 0 0 64px rgba(190,245,50,0.12)" }}
              >
                Explore WiseHaven
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                onClick={(e) => handleScroll(e, "#how-it-works")}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[#303030] text-white text-[15px] font-medium hover:border-[#505050] hover:bg-white/3 transition-all duration-150"
              >
                See how it works
              </a>
            </div>

            {/* Trust caption */}
            <p className="text-[#505050] text-[12px] font-mono flex items-center gap-2">
              <span className="w-4 h-px bg-[#303030]" />
              Built around intentional saving, not impulsive spending.
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-6 pt-4 border-t border-[#1a1a1a]">
              {[
                { val: "51.9%", label: "face mid-month shortfalls" },
                { val: "55.1%", label: "have zero emergency savings" },
                { val: "100%", label: "simulated — safe to explore" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span className="text-[#BEF532] text-[18px] font-bold font-mono">{s.val}</span>
                  <span className="text-[#606060] text-[10px] leading-tight max-w-[90px]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Dashboard mockup ── */}
          <div
            className="relative flex items-center justify-center hero-enter"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative w-full max-w-[420px] mx-auto">
              <DashboardMockup />
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 pointer-events-none">
        <span className="text-[#606060] text-[10px] font-mono uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-[#606060] to-transparent" />
      </div>
    </section>
  );
}
