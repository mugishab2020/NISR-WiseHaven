"use client";

import Image from "next/image";
import Link from "next/link";

const SECTIONS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Our approach", href: "#approach" },
  { label: "FAQ", href: "#faq" },
];

const APP_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Envelopes", href: "/envelopes" },
  { label: "Emergency Vault", href: "/vault" },
  { label: "Activity", href: "/activity" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#060606] border-t border-[#1a1a1a]" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-[#303030] group-hover:ring-[#BEF532] transition-all">
                <Image
                  src="/WiseHaven Logo.jpg"
                  alt=""
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="font-semibold text-white text-[15px]" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
                WiseHaven
              </span>
            </Link>
            <p className="text-[#606060] text-[12px] leading-relaxed max-w-[200px]">
              Give Every Franc a Purpose.
            </p>
            <p className="text-[#404040] text-[11px] leading-relaxed max-w-[220px] font-mono">
              Built for Rwanda · Powered by commitment · Backed by discipline
            </p>
          </div>

          {/* Homepage sections */}
          <div className="flex flex-col gap-3">
            <p className="text-[#606060] text-[10px] font-mono uppercase tracking-widest mb-1">Sections</p>
            {SECTIONS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  if (l.href.startsWith("#")) {
                    e.preventDefault();
                    document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="text-[#808080] text-[13px] hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* App routes */}
          <div className="flex flex-col gap-3">
            <p className="text-[#606060] text-[10px] font-mono uppercase tracking-widest mb-1">App</p>
            {APP_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[#808080] text-[13px] hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Legal + demo note */}
          <div className="flex flex-col gap-3">
            <p className="text-[#606060] text-[10px] font-mono uppercase tracking-widest mb-1">Legal</p>
            {LEGAL_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[#808080] text-[13px] hover:text-white transition-colors"
                onClick={(e) => l.href === "#" && e.preventDefault()}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 p-3 bg-[#111111] border border-[#1e1e1e] rounded-xl">
              <p className="text-[#404040] text-[10px] font-mono leading-relaxed">
                ⚠ This prototype uses simulated demo data only. No real money, deposits, payments, or financial custody of any kind exists or is implied.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[#404040] text-[12px] font-mono">
            © 2026 WiseHaven / NISR Rwanda · MIT License
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BEF532]/50" />
            <p className="text-[#404040] text-[11px] font-mono">
              Prototype · All figures simulated · No real financial product
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
