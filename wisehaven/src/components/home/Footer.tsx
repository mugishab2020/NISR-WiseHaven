"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Smart envelopes", href: "#features" },
  { label: "Emergency Vault", href: "#features" },
];

const APP_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Envelopes", href: "/envelopes" },
  { label: "Vault", href: "/vault" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

function scrollTo(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative bg-[#000000] overflow-hidden"
      role="contentinfo"
    >
      {/* ── Top separator — a single fine lime line ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#BEF532]/30 to-transparent" />

      {/* ── Closing message block ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">

          <h2
            className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold leading-[1.1] tracking-[-0.03em] text-white"
            style={{ fontFamily: "Geist, Inter, sans-serif" }}
          >
            Make room for a better<br />
            relationship with{" "}
            <span className="text-[#BEF532]">money.</span>
          </h2>

          <p className="text-[#606060] text-[15px] leading-relaxed max-w-[440px]">
            Build intentional habits, protect your priorities, and give every franc a purpose.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#BEF532] text-[#0a1200] text-[15px] font-bold hover:bg-[#ceff3f] active:scale-[0.97] transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BEF532]"
            style={{ boxShadow: "0 0 32px rgba(190,245,50,0.22)" }}
          >
            Start with WiseHaven
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* ── Wordmark Horizon ── */}
      {/*
        The oversized "WiseHaven" wordmark is the defining visual element.
        It sits below the closing CTA as a background typographic landmark.
        Uses a mix of:
          - Very dark charcoal fill (#1a1a1a) for most letters
          - One section with a subtle lime treatment for "Wise"
        overflow: hidden on the footer clips letters at viewport edge
        intentionally on mobile — this is a deliberate graphic choice.
      */}
      <div
        className="relative z-10 w-full overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Subtle lime horizon line under the wordmark */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #BEF532 30%, #BEF532 70%, transparent 100%)",
            opacity: 0.15,
          }}
        />

        <div
          className="flex items-end justify-center leading-none tracking-[-0.04em] font-black whitespace-nowrap pb-0"
          style={{
            fontFamily: "Geist, Inter, sans-serif",
            fontSize: "clamp(72px, 16vw, 220px)",
            lineHeight: 0.88,
          }}
        >
          {/* "Wise" — subtle lime outline treatment */}
          <span
            style={{
              color: "transparent",
              WebkitTextStroke: "1px #BEF532",
              opacity: 0.18,
            }}
          >
            Wise
          </span>
          {/* "Haven" — dark charcoal fill */}
          <span
            style={{
              color: "#1c1c1c",
            }}
          >
            Haven
          </span>
        </div>
      </div>

      {/* ── Compact footer row — sits over the wordmark ── */}
      <div className="relative z-20 border-t border-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

            {/* Brand */}
            <div className="flex flex-col gap-1.5">
              <Link
                href="/"
                className="text-white text-[15px] font-semibold tracking-tight hover:text-[#BEF532] transition-colors"
                style={{ fontFamily: "Geist, Inter, sans-serif" }}
              >
                WiseHaven
              </Link>
              <p className="text-[#3a3a3a] text-[12px]">
                Give Every Franc a Purpose.
              </p>
            </div>

            {/* Nav + legal */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {/* Page links */}
              <div className="flex items-center gap-5">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={(e) => { e.preventDefault(); scrollTo(l.href); }}
                    className="text-[#4a4a4a] text-[12px] hover:text-[#A3A3A3] transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
              </div>

              {/* App links */}
              <div className="flex items-center gap-5">
                {APP_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-[#4a4a4a] text-[12px] hover:text-[#A3A3A3] transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              {/* Legal */}
              <div className="flex items-center gap-5">
                {LEGAL_LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={(e) => e.preventDefault()}
                    className="text-[#333333] text-[12px] hover:text-[#4a4a4a] transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom line */}
          <div className="mt-6 pt-5 border-t border-[#0e0e0e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p
              className="text-[#252525] text-[11px]"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              © {year} WiseHaven · NISR Rwanda · MIT License
            </p>
            <p
              className="text-[#1e1e1e] text-[11px]"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              Prototype · All figures simulated · No real financial product
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
