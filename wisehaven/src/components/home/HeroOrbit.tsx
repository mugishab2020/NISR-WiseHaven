"use client";

/**
 * HeroOrbit — WiseHaven hero background visual.
 *
 * Technique: SVG orbital rings + CSS keyframe animations + single RAF
 * pointer-parallax. No Three.js, no canvas, no per-frame React state.
 *
 * Layers (back → front):
 *   0. Pure black base
 *   1. Ambient radial lime glow (CSS, pointer-events: none)
 *   2. Dot grid (CSS background-image)
 *   3. SVG scene: orbital rings + envelope fragments + central emblem
 *   4. Pointer-parallax wrapper (transforms only, RAF-driven)
 */

import { useEffect, useRef } from "react";
import Image from "next/image";

// ── Orbital ring SVG paths ────────────────────────────────────────────────────
// We define three rings at different tilts / radii.
// They are drawn as stroked ellipses so they scale perfectly.

function OrbitalRings() {
  return (
    <svg
      viewBox="0 0 800 800"
      className="absolute inset-0 w-full h-full"
      style={{ overflow: "visible" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Lime gradient stroke */}
        <linearGradient id="ring-lime-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BEF532" stopOpacity="0" />
          <stop offset="35%" stopColor="#BEF532" stopOpacity="0.5" />
          <stop offset="65%" stopColor="#BEF532" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#BEF532" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ring-lime-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#BEF532" stopOpacity="0" />
          <stop offset="40%" stopColor="#BEF532" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#BEF532" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ring-white-1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Glow filter for the central emblem */}
        <filter id="lime-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Soft glow for ring highlights */}
        <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── Outermost ring — large, gently tilted ── */}
      <ellipse
        cx="400" cy="400"
        rx="340" ry="130"
        fill="none"
        stroke="url(#ring-lime-1)"
        strokeWidth="0.8"
        transform="rotate(-20 400 400)"
        className="orbit-ring-1"
      />

      {/* ── Middle ring — tighter tilt ── */}
      <ellipse
        cx="400" cy="400"
        rx="250" ry="90"
        fill="none"
        stroke="url(#ring-lime-2)"
        strokeWidth="0.6"
        transform="rotate(15 400 400)"
        className="orbit-ring-2"
      />

      {/* ── Inner ring — nearly flat ── */}
      <ellipse
        cx="400" cy="400"
        rx="170" ry="55"
        fill="none"
        stroke="url(#ring-white-1)"
        strokeWidth="0.5"
        transform="rotate(-5 400 400)"
        className="orbit-ring-3"
      />

      {/* ── Orbital dot travelling outer ring ── */}
      <circle r="3" fill="#BEF532" opacity="0.9" filter="url(#ring-glow)">
        <animateMotion
          dur="14s"
          repeatCount="indefinite"
          calcMode="linear"
        >
          <mpath href="#outer-ring-path" />
        </animateMotion>
      </circle>
      <path
        id="outer-ring-path"
        d="M 740,400 A 340,130 0 1,1 739.99,400"
        fill="none"
        transform="rotate(-20 400 400)"
        stroke="none"
      />

      {/* ── Second dot on middle ring, opposite phase ── */}
      <circle r="2" fill="#BEF532" opacity="0.5" filter="url(#ring-glow)">
        <animateMotion
          dur="20s"
          repeatCount="indefinite"
          calcMode="linear"
          keyPoints="0.5;1;0.5"
          keyTimes="0;0.5;1"
        >
          <mpath href="#mid-ring-path" />
        </animateMotion>
      </circle>
      <path
        id="mid-ring-path"
        d="M 650,400 A 250,90 0 1,1 649.99,400"
        fill="none"
        transform="rotate(15 400 400)"
        stroke="none"
      />

      {/* ── Central emblem glow halo ── */}
      <circle
        cx="400" cy="400" r="72"
        fill="#BEF532"
        opacity="0.04"
        filter="url(#lime-glow)"
      />
      <circle
        cx="400" cy="400" r="52"
        fill="#BEF532"
        opacity="0.06"
      />
    </svg>
  );
}

// ── Floating envelope fragments ────────────────────────────────────────────────
// Minimal geometric shapes evocative of envelopes / protected compartments.

function EnvelopeFragment({
  x, y, size, rotation, delay, opacity,
}: {
  x: string; y: string; size: number; rotation: number; delay: string; opacity: number;
}) {
  const w = size;
  const h = size * 0.72;
  const hw = w / 2;
  const hh = h / 2;

  return (
    <div
      className="absolute pointer-events-none orbit-fragment"
      style={{
        left: x, top: y,
        width: w, height: h,
        transform: `rotate(${rotation}deg)`,
        animationDelay: delay,
        opacity,
      }}
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ overflow: "visible" }}>
        {/* Envelope body */}
        <rect
          x="0" y="0" width={w} height={h}
          rx="3" ry="3"
          fill="none"
          stroke="#BEF532"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />
        {/* Envelope flap chevron */}
        <polyline
          points={`0,0 ${hw},${hh * 0.85} ${w},0`}
          fill="none"
          stroke="#BEF532"
          strokeWidth="0.8"
          strokeOpacity="0.3"
        />
        {/* Lock dot */}
        <circle
          cx={hw} cy={h * 0.65}
          r="2"
          fill="#BEF532"
          fillOpacity="0.5"
        />
      </svg>
    </div>
  );
}

// ── Central logo emblem ────────────────────────────────────────────────────────
function CentralEmblem() {
  return (
    <div
      className="absolute pointer-events-none orbit-emblem"
      style={{
        left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 96, height: 96,
      }}
      aria-hidden="true"
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-[-20px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(190,245,50,0.10) 0%, transparent 70%)",
        }}
      />
      {/* Mid ring */}
      <div
        className="absolute inset-[-6px] rounded-2xl border border-[#BEF532]/20"
        style={{ borderRadius: "22px" }}
      />
      {/* Logo container */}
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden border border-[#BEF532]/30"
        style={{
          boxShadow: "0 0 32px rgba(190,245,50,0.15), inset 0 0 20px rgba(190,245,50,0.05)",
        }}
      >
        <Image
          src="/WiseHaven Logo.jpg"
          alt=""
          fill
          sizes="96px"
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}

// ── Parallax container ─────────────────────────────────────────────────────────
// Uses a single RAF loop writing CSS transform directly on DOM refs.
// No React state = no rerenders on every pointer move.

export function useParallax(containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Skip touch-only devices
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    // Layers indexed in DOM order inside the orbit container
    const layers = container.querySelectorAll<HTMLElement>("[data-parallax]");

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function tick() {
      currentX = lerp(currentX, targetX, 0.06);
      currentY = lerp(currentY, targetY, 0.06);

      layers.forEach((el) => {
        const strength = parseFloat(el.dataset.parallax ?? "1");
        el.style.transform = `translate(${currentX * strength}px, ${currentY * strength}px)`;
      });

      rafId = requestAnimationFrame(tick);
    }

    function onMove(e: MouseEvent) {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX = (e.clientX - cx) / rect.width * 18;
      targetY = (e.clientY - cy) / rect.height * 12;
    }

    function onLeave() {
      targetX = 0;
      targetY = 0;
    }

    rafId = requestAnimationFrame(tick);
    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [containerRef]);
}

// ── Main HeroOrbit component ───────────────────────────────────────────────────
export default function HeroOrbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  useParallax(containerRef as React.RefObject<HTMLElement>);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* ── Layer 0: pure black base ── */}
      <div className="absolute inset-0 bg-[#000000]" />

      {/* ── Layer 1: ambient lime glow pools ── */}
      <div
        data-parallax="0.4"
        className="absolute pointer-events-none"
        style={{
          right: "5%", top: "15%",
          width: "55%", height: "70%",
          background: "radial-gradient(ellipse at 60% 40%, rgba(190,245,50,0.055) 0%, transparent 65%)",
          filter: "blur(1px)",
        }}
      />
      <div
        data-parallax="0.25"
        className="absolute pointer-events-none"
        style={{
          left: "0%", bottom: "0%",
          width: "40%", height: "50%",
          background: "radial-gradient(ellipse at 30% 80%, rgba(190,245,50,0.025) 0%, transparent 70%)",
        }}
      />

      {/* ── Layer 2: dot grid ── */}
      <div
        data-parallax="0.1"
        className="absolute inset-0 hero-grid pointer-events-none"
        style={{ opacity: 0.028 }}
      />

      {/* ── Layer 3: orbital ring SVG ── */}
      {/* Desktop: right half. Mobile: centered behind content */}
      <div
        data-parallax="0.6"
        className="
          absolute pointer-events-none
          right-[-8%] top-[50%] -translate-y-1/2
          w-[520px] h-[520px]
          lg:w-[640px] lg:h-[640px]
          xl:w-[720px] xl:h-[720px]
          hidden sm:block
        "
        style={{ opacity: 0.9 }}
      >
        <OrbitalRings />
        <CentralEmblem />
      </div>

      {/* Mobile: smaller centered scene */}
      <div
        className="
          absolute pointer-events-none
          left-1/2 -translate-x-1/2
          top-[55%] -translate-y-1/2
          w-[300px] h-[300px]
          sm:hidden
        "
        style={{ opacity: 0.35 }}
      >
        <OrbitalRings />
        <CentralEmblem />
      </div>

      {/* ── Layer 4: floating envelope fragments (desktop only) ── */}
      <div
        data-parallax="1.1"
        className="absolute inset-0 hidden lg:block pointer-events-none"
      >
        <EnvelopeFragment
          x="62%" y="18%"
          size={52} rotation={-18} delay="0s" opacity={0.55}
        />
        <EnvelopeFragment
          x="78%" y="68%"
          size={38} rotation={12} delay="1.2s" opacity={0.40}
        />
        <EnvelopeFragment
          x="52%" y="72%"
          size={30} rotation={-6} delay="2.5s" opacity={0.30}
        />
      </div>

      {/* ── Layer 5: fine accent lines — structural geometry ── */}
      <div
        data-parallax="0.3"
        className="absolute inset-0 hidden lg:block pointer-events-none"
      >
        <svg
          className="absolute right-0 top-0 w-full h-full"
          viewBox="0 0 1200 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* Diagonal accent line from top-right */}
          <line
            x1="1100" y1="0"
            x2="700" y2="900"
            stroke="#BEF532"
            strokeWidth="0.4"
            strokeOpacity="0.08"
          />
          {/* Horizontal rule at midpoint */}
          <line
            x1="550" y1="450"
            x2="1200" y2="450"
            stroke="#BEF532"
            strokeWidth="0.3"
            strokeOpacity="0.06"
          />
          {/* Corner bracket — top right */}
          <path
            d="M 1150,20 L 1180,20 L 1180,60"
            fill="none"
            stroke="#BEF532"
            strokeWidth="0.6"
            strokeOpacity="0.15"
          />
          {/* Corner bracket — bottom right */}
          <path
            d="M 1150,880 L 1180,880 L 1180,840"
            fill="none"
            stroke="#BEF532"
            strokeWidth="0.6"
            strokeOpacity="0.12"
          />
        </svg>
      </div>

      {/* ── Layer 6: subtle lime pointer highlight (follows parallax root) ── */}
      {/* Rendered via CSS only — reacts to hover on the section naturally */}
      <div
        data-parallax="0.8"
        className="absolute hidden lg:block pointer-events-none"
        style={{
          right: "8%", top: "50%", transform: "translateY(-50%)",
          width: 320, height: 320,
          background: "radial-gradient(circle, rgba(190,245,50,0.04) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
