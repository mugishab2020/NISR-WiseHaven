"use client";

/**
 * HeroVisual — "The Protected Orbit"
 *
 * One dominant sculptural form: a folded-ribbon loop made from CSS
 * clip-path + SVG. Two thin orbital ellipses. Two small envelope
 * fragments. Controlled lime rim lighting. RAF pointer parallax.
 *
 * All decorative — pointer-events: none throughout.
 * prefers-reduced-motion: all animations stop, composition holds.
 */

import { useEffect } from "react";

// ── Pointer-parallax hook ─────────────────────────────────────
function useParallax(sectionRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const layers = section.querySelectorAll<HTMLElement>("[data-depth]");

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      cx = lerp(cx, tx, 0.055);
      cy = lerp(cy, ty, 0.055);
      layers.forEach((el) => {
        const d = parseFloat(el.dataset.depth ?? "1");
        el.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
      });
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      if (!section) return;
      const r = section.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 20;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 14;
    };
    const onLeave = () => { tx = 0; ty = 0; };

    raf = requestAnimationFrame(tick);
    section.addEventListener("mousemove", onMove, { passive: true });
    section.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, [sectionRef]);
}

// ── SVG orbital rings ─────────────────────────────────────────
function OrbitalRings() {
  return (
    <svg
      viewBox="0 0 560 560"
      width="100%"
      height="100%"
      className="absolute inset-0"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hv-ring-a" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#BEF532" stopOpacity="0" />
          <stop offset="40%" stopColor="#BEF532" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#BEF532" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#BEF532" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hv-ring-b" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a4a4a" stopOpacity="0" />
          <stop offset="45%" stopColor="#4a4a4a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4a4a4a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer ring — lime, tilted 20° */}
      <ellipse
        cx="280" cy="280"
        rx="240" ry="88"
        fill="none"
        stroke="url(#hv-ring-a)"
        strokeWidth="0.9"
        transform="rotate(-20 280 280)"
        className="hv-ring-outer"
      />

      {/* Inner ring — graphite, counter-tilt */}
      <ellipse
        cx="280" cy="280"
        rx="160" ry="54"
        fill="none"
        stroke="url(#hv-ring-b)"
        strokeWidth="0.65"
        transform="rotate(12 280 280)"
        className="hv-ring-inner"
      />

      {/* Travelling lime dot on outer ring */}
      <circle r="2.5" fill="#BEF532" opacity="0.85">
        <animateMotion dur="16s" repeatCount="indefinite" calcMode="linear">
          <mpath href="#hv-outer-path" />
        </animateMotion>
      </circle>
      <path
        id="hv-outer-path"
        d="M 520,280 A 240,88 0 1,1 519.99,280"
        fill="none" stroke="none"
        transform="rotate(-20 280 280)"
      />
    </svg>
  );
}

// ── Sculptural central form — "the folded ribbon loop" ────────
// Built from layered CSS shapes + SVG clip-path so it scales
// perfectly without images.
function SculpturalForm() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      {/* Outermost ambient glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "72%", height: "72%",
          background: "radial-gradient(circle, rgba(190,245,50,0.055) 0%, transparent 65%)",
        }}
      />

      {/* Main ribbon — SVG path, the signature geometric form */}
      <svg
        viewBox="0 0 320 320"
        className="absolute hv-orbit-form"
        style={{ width: "68%", height: "68%" }}
        aria-hidden="true"
      >
        <defs>
          {/* Lime rim gradient */}
          <linearGradient id="hv-form-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a2600" />
            <stop offset="45%" stopColor="#263600" />
            <stop offset="100%" stopColor="#0e1800" />
          </linearGradient>
          <linearGradient id="hv-form-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BEF532" stopOpacity="0" />
            <stop offset="30%" stopColor="#BEF532" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#BEF532" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#BEF532" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hv-form-rim2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#BEF532" stopOpacity="0" />
            <stop offset="40%" stopColor="#BEF532" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#BEF532" stopOpacity="0" />
          </linearGradient>
          {/* Inner glow filter */}
          <filter id="hv-inner-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shadow/depth layer — slightly offset filled shape */}
        <path
          d="M 160,40
             C 220,40 270,80 270,140
             C 270,185 245,215 210,230
             C 240,235 270,255 270,285
             C 270,310 245,325 215,325
             L 215,325
             C 185,325 160,305 145,280
             C 130,305 105,325 75,325
             L 75,325
             C 45,325 20,310 20,285
             C 20,255 50,235 80,230
             C 45,215 20,185 20,140
             C 20,80 70,40 130,40
             Z"
          fill="#0a0a0a"
          opacity="0.6"
          transform="translate(3,4)"
        />

        {/* Main filled body — dark obsidian */}
        <path
          d="M 160,40
             C 220,40 270,80 270,140
             C 270,185 245,215 210,230
             C 240,235 270,255 270,285
             C 270,310 245,325 215,325
             L 215,325
             C 185,325 160,305 145,280
             C 130,305 105,325 75,325
             L 75,325
             C 45,325 20,310 20,285
             C 20,255 50,235 80,230
             C 45,215 20,185 20,140
             C 20,80 70,40 130,40
             Z"
          fill="url(#hv-form-fill)"
        />

        {/* Rim stroke — primary lime highlight */}
        <path
          d="M 160,40
             C 220,40 270,80 270,140
             C 270,185 245,215 210,230
             C 240,235 270,255 270,285
             C 270,310 245,325 215,325
             L 215,325
             C 185,325 160,305 145,280
             C 130,305 105,325 75,325
             L 75,325
             C 45,325 20,310 20,285
             C 20,255 50,235 80,230
             C 45,215 20,185 20,140
             C 20,80 70,40 130,40
             Z"
          fill="none"
          stroke="url(#hv-form-rim)"
          strokeWidth="1.5"
        />

        {/* Rim stroke — secondary counter-gradient */}
        <path
          d="M 160,40
             C 220,40 270,80 270,140
             C 270,185 245,215 210,230
             C 240,235 270,255 270,285
             C 270,310 245,325 215,325
             L 215,325
             C 185,325 160,305 145,280
             C 130,305 105,325 75,325
             L 75,325
             C 45,325 20,310 20,285
             C 20,255 50,235 80,230
             C 45,215 20,185 20,140
             C 20,80 70,40 130,40
             Z"
          fill="none"
          stroke="url(#hv-form-rim2)"
          strokeWidth="0.8"
        />

        {/* Interior highlight arc — convex top surface */}
        <path
          d="M 90,75 C 120,58 200,58 230,75"
          fill="none"
          stroke="#BEF532"
          strokeWidth="0.6"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />

        {/* Centre waist connector — geometric cross-section */}
        <line
          x1="80" y1="232" x2="240" y2="228"
          stroke="#BEF532"
          strokeWidth="0.5"
          strokeOpacity="0.2"
          strokeLinecap="round"
        />

        {/* Lock glyph at centre — simple padlock geometry */}
        <g transform="translate(148, 148)">
          {/* Shackle arc */}
          <path
            d="M 6,10 L 6,5 A 6,6 0 0 1 18,5 L 18,10"
            fill="none"
            stroke="#BEF532"
            strokeWidth="1.4"
            strokeOpacity="0.55"
            strokeLinecap="round"
          />
          {/* Body */}
          <rect
            x="2" y="10" width="20" height="14"
            rx="2.5"
            fill="#BEF532"
            fillOpacity="0.08"
            stroke="#BEF532"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          {/* Keyhole */}
          <circle cx="12" cy="17" r="2" fill="#BEF532" fillOpacity="0.5" />
        </g>
      </svg>

      {/* Lime inner glow overlay */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "35%", height: "35%",
          background: "radial-gradient(circle, rgba(190,245,50,0.09) 0%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}

// ── Minimal envelope fragments ────────────────────────────────
function EnvelopeFragments() {
  const frags = [
    { x: "74%", y: "18%", w: 44, r: -14, delay: "0s",   opacity: 0.5 },
    { x: "76%", y: "68%", w: 32, r:  10, delay: "1.8s", opacity: 0.35 },
  ];

  return (
    <>
      {frags.map((f, i) => {
        const h = f.w * 0.7;
        const hw = f.w / 2;
        return (
          <div
            key={i}
            className="absolute pointer-events-none hv-fragment"
            style={{
              left: f.x, top: f.y,
              width: f.w, height: h,
              transform: `rotate(${f.r}deg)`,
              animationDelay: f.delay,
              opacity: f.opacity,
            }}
            aria-hidden="true"
          >
            <svg viewBox={`0 0 ${f.w} ${h}`} width={f.w} height={h} style={{ overflow: "visible" }}>
              <rect x="0" y="0" width={f.w} height={h} rx="2.5"
                fill="none" stroke="#BEF532" strokeWidth="0.75" strokeOpacity="0.5" />
              <polyline points={`0,0 ${hw},${h * 0.8} ${f.w},0`}
                fill="none" stroke="#BEF532" strokeWidth="0.6" strokeOpacity="0.3" />
              <circle cx={hw} cy={h * 0.62} r="1.5"
                fill="#BEF532" fillOpacity="0.45" />
            </svg>
          </div>
        );
      })}
    </>
  );
}

// ── Structural accent lines ───────────────────────────────────
function AccentLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 600 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Fine diagonal — upper right */}
      <line x1="520" y1="30" x2="320" y2="580"
        stroke="#BEF532" strokeWidth="0.35" strokeOpacity="0.07" />
      {/* Horizontal rule */}
      <line x1="60" y1="300" x2="580" y2="300"
        stroke="#BEF532" strokeWidth="0.25" strokeOpacity="0.05" />
      {/* Corner bracket — top right */}
      <path d="M 555,25 L 580,25 L 580,55"
        fill="none" stroke="#BEF532" strokeWidth="0.7" strokeOpacity="0.18" />
      {/* Corner bracket — bottom left */}
      <path d="M 45,575 L 20,575 L 20,545"
        fill="none" stroke="#BEF532" strokeWidth="0.7" strokeOpacity="0.12" />
    </svg>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function HeroVisual({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement>;
}) {
  useParallax(sectionRef);

  return (
    <div
      className="relative w-full h-full min-h-[400px] sm:min-h-[500px]"
      aria-hidden="true"
    >
      {/* Layer 0 — accent lines (slowest parallax) */}
      <div data-depth="0.25" className="absolute inset-0 hidden lg:block pointer-events-none">
        <AccentLines />
      </div>

      {/* Layer 1 — orbital rings */}
      <div data-depth="0.55" className="absolute inset-0 pointer-events-none">
        <OrbitalRings />
      </div>

      {/* Layer 2 — sculptural form (medium depth) */}
      <div data-depth="0.8" className="absolute inset-0 pointer-events-none">
        <SculpturalForm />
      </div>

      {/* Layer 3 — envelope fragments (nearest, most parallax) */}
      <div data-depth="1.2" className="absolute inset-0 hidden sm:block pointer-events-none">
        <EnvelopeFragments />
      </div>
    </div>
  );
}
