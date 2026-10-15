"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Our approach", href: "#approach" },
  { label: "FAQ", href: "#faq" },
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setMenuOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href.startsWith("#")) {
      e.preventDefault();
      setMenuOpen(false);
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0e0e0e]/90 backdrop-blur-xl border-b border-[#242424]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Brand ── */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="WiseHaven home">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-[#303030] group-hover:ring-[#BEF532] transition-all duration-200">
                <Image
                  src="/WiseHaven Logo.jpg"
                  alt=""
                  fill
                  sizes="32px"
                  className="object-cover"
                  priority
                />
              </div>
              <span className="font-semibold text-white text-[15px] tracking-tight" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
                WiseHaven
              </span>
              <span className="hidden sm:inline text-[10px] font-mono text-[#BEF532] bg-[#BEF532]/10 px-1.5 py-0.5 rounded-full border border-[#BEF532]/20 tracking-wider uppercase">
                RW
              </span>
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="px-3.5 py-2 text-[13px] text-[#A3A3A3] hover:text-white rounded-md hover:bg-white/5 transition-all duration-150 font-medium"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* ── Desktop actions ── */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-[13px] font-medium text-[#A3A3A3] hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#BEF532] text-[#0a1200] text-[13px] font-semibold hover:bg-[#ceff3f] active:scale-[0.97] transition-all duration-150"
              >
                Get started
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* ── Mobile menu button ── */}
            <button
              className="lg:hidden p-2 rounded-md text-[#A3A3A3] hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>
      </header>

      {/* ── Mobile menu panel ── */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
        {/* Panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-72 bg-[#111111] border-l border-[#242424] flex flex-col transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-[#242424]">
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 rounded overflow-hidden">
                <Image src="/WiseHaven Logo.jpg" alt="" fill sizes="24px" className="object-cover" />
              </div>
              <span className="text-white font-semibold text-sm" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
                WiseHaven
              </span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-1.5 rounded text-[#A3A3A3] hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          {/* Nav links */}
          <nav className="flex flex-col gap-1 p-4 flex-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="px-4 py-3 text-[14px] text-[#A3A3A3] hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>
          {/* Mobile actions */}
          <div className="p-4 border-t border-[#242424] flex flex-col gap-2.5">
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="w-full py-2.5 px-4 rounded-lg border border-[#303030] text-center text-[14px] font-medium text-white hover:bg-white/5 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="w-full py-2.5 px-4 rounded-lg bg-[#BEF532] text-center text-[14px] font-semibold text-[#0a1200] hover:bg-[#ceff3f] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
