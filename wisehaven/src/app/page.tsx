import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
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

      {/* Hero — includes its own nav */}
      <HeroSection />

      <div id="main-content">
        {/* Budget Simulator */}
        <BudgetSimulator />

        {/* Envelope Showcase */}
        <EnvelopeShowcase />

        {/* How It Works */}
        <HowItWorks />

        {/* Emergency Vault Feature */}
        <EmergencyVaultFeature />

        {/* Why It Matters */}
        <WhyItMatters />

        {/* FAQ */}
        <FAQSection />

        {/* Final CTA */}
        <FinalCTA />
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
