import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/home/HeroSection";

// Three.js references browser globals (WebGLRenderingContext, window, etc.)
// at module-evaluation time — it must never run on the server.
// ssr:false tells the Next.js bundler to skip this module during SSR entirely.
const FlowWaveBackground = dynamic(
  () => import("@/components/home/FlowWaveBackground"),
  { ssr: false, loading: () => null }
);
import BudgetSimulator from "@/components/home/BudgetSimulator";
import EnvelopeShowcase from "@/components/home/EnvelopeShowcase";
import HowItWorks from "@/components/home/HowItWorks";
import EmergencyVaultFeature from "@/components/home/EmergencyVaultFeature";
import WhyItMatters from "@/components/home/WhyItMatters";
import FAQSection from "@/components/home/FAQSection";
import FinalCTA from "@/components/home/FinalCTA";
import Footer from "@/components/home/Footer";

export const metadata: Metadata = {
  title: "WiseHaven — Give Every Franc a Purpose",
  description:
    "WiseHaven is a smart, time-locked envelope budgeting wallet for Rwanda. Allocate your income, protect your priorities, and build an emergency reserve — one envelope at a time.",
};

export default function HomePage() {
  return (
    <>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded focus:bg-[#BEF532] focus:text-[#0a1200] focus:font-semibold focus:text-sm"
      >
        Skip to main content
      </a>

      {/* ── Three.js Flow Wave — fixed full-bleed underlay ─────────── */}
      {/* Renders at z-index 0, pointer-events none — sits behind everything */}
      <FlowWaveBackground />

      {/* ── Scroll host — gives the camera dive its 620 vh of travel ── */}
      {/* position: relative + z-index: 1 stacks all page content above canvas */}
      <div id="scroll-host" style={{ position: "relative", zIndex: 1 }}>

        {/* Hero — transparent background so the wave bleeds through */}
        <HeroSection />

        <div id="main-content">
          {/* All content sections sit on top of the wave canvas.
              Each section keeps its own bg so content is readable;
              the hero area above is intentionally transparent to let
              the Three.js scene show through at full opacity. */}
          <BudgetSimulator />
          <EnvelopeShowcase />
          <HowItWorks />
          <EmergencyVaultFeature />
          <WhyItMatters />
          <FAQSection />
          <FinalCTA />
        </div>

        <Footer />
      </div>

    </>
  );
}
