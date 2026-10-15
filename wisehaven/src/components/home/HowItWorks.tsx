"use client";

import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Receive",
    body: "Start with the money you have available. Deposit your salary, harvest payout, or business revenue — and begin with a clear picture of what you have.",
    detail: "No impulse decisions. No invisible spending drift. Just a clear starting number.",
  },
  {
    num: "02",
    title: "Allocate",
    body: "Give each amount a clear purpose, from rent to everyday essentials. Assign how much goes where — and lock it in before the temptation to spend arrives.",
    detail: "Pre-commitment when liquidity is highest is the moment behavioral discipline matters most.",
  },
  {
    num: "03",
    title: "Unlock intentionally",
    body: "Keep your priorities protected until the date you choose. When an envelope matures, review the recipient details and authorize the next step — nothing moves without your confirmation.",
    detail: "Maturity does not mean automatic payment. You remain in control at every step.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#0a0a0a]" aria-labelledby="hiw-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-xl mb-16">
          <p className="text-[#BEF532] text-[11px] font-mono uppercase tracking-widest mb-3">How it works</p>
          <h2
            id="hiw-heading"
            className="text-[36px] sm:text-[44px] font-bold leading-[1.1] tracking-[-0.025em] text-white mb-4"
            style={{ fontFamily: "Geist, Inter, sans-serif" }}
          >
            Three steps to financial<br />clarity.
          </h2>
          <p className="text-[#A3A3A3] text-[16px] leading-relaxed">
            WiseHaven does not ask you to change your habits overnight.
            It changes the structure money moves through.
          </p>
        </div>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-transparent via-[#303030] to-transparent" aria-hidden="true" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex flex-col gap-5">
                {/* Mobile connector */}
                {i < STEPS.length - 1 && (
                  <div className="lg:hidden absolute left-5 top-16 bottom-0 w-px bg-[#242424]" aria-hidden="true" />
                )}

                {/* Step node */}
                <div className="flex items-center gap-4 lg:flex-col lg:items-start">
                  <div className="relative z-10 w-12 h-12 rounded-full bg-[#0e0e0e] border border-[#303030] flex items-center justify-center shrink-0">
                    <span className="font-mono font-bold text-[#BEF532] text-[13px]">{step.num}</span>
                  </div>
                  <h3 className="lg:hidden text-white text-[20px] font-bold" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
                    {step.title}
                  </h3>
                </div>

                {/* Content */}
                <div className="lg:mt-2">
                  <h3 className="hidden lg:block text-white text-[22px] font-bold mb-3" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
                    {step.title}
                  </h3>
                  <p className="text-[#A3A3A3] text-[15px] leading-relaxed mb-3">
                    {step.body}
                  </p>
                  <p className="text-[#BEF532] text-[12px] font-mono leading-relaxed border-l-2 border-[#BEF532]/30 pl-3">
                    {step.detail}
                  </p>
                </div>

                {/* Mobile arrow connector */}
                {i < STEPS.length - 1 && (
                  <div className="lg:hidden flex items-center ml-6 mt-1" aria-hidden="true">
                    <ArrowRight size={14} className="text-[#303030]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-16 p-6 bg-[#111111] border border-[#242424] rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white font-semibold text-[15px] mb-1" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
                Payments require your explicit confirmation.
              </p>
              <p className="text-[#606060] text-[13px]">
                Maturity unlocks the ability to pay — it does not automatically transfer money.
                You review, verify the recipient, and authorize. Always.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-[#BEF532]/10 border border-[#BEF532]/20 text-[#BEF532] text-[11px] font-mono font-semibold uppercase tracking-wider whitespace-nowrap">
              User-authorized only
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
