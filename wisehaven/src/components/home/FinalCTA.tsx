"use client";

import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24 bg-[#0a0a0a] relative overflow-hidden" aria-labelledby="cta-heading">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[400px] rounded-full bg-[#BEF532]/4 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Icon */}
        <div className="inline-flex w-16 h-16 rounded-2xl bg-[#BEF532]/10 border border-[#BEF532]/20 items-center justify-center mb-8">
          <Shield size={28} className="text-[#BEF532]" />
        </div>

        {/* Headline */}
        <h2
          id="cta-heading"
          className="text-[40px] sm:text-[52px] lg:text-[60px] font-bold leading-[1.05] tracking-[-0.03em] text-white mb-6"
          style={{ fontFamily: "Geist, Inter, sans-serif" }}
        >
          Build a better<br />
          relationship with your<br />
          <span className="text-[#BEF532]">money.</span>
        </h2>

        <p className="text-[#A3A3A3] text-[17px] leading-relaxed max-w-xl mx-auto mb-10">
          Start with a purpose. Make a plan. Give your future room to grow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-[#BEF532] text-[#0a1200] text-[16px] font-bold hover:bg-[#ceff3f] active:scale-[0.97] transition-all duration-150 shadow-[0_0_48px_rgba(190,245,50,0.2)]"
          >
            Explore the demo
            <ArrowRight size={16} />
          </Link>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border border-[#303030] text-white text-[16px] font-medium hover:border-[#505050] hover:bg-white/3 transition-all duration-150"
          >
            Try the simulator
          </a>
        </div>

        <p className="mt-8 text-[#404040] text-[12px] font-mono">
          ⚠ Prototype only — all amounts are simulated. No real money moves.
        </p>
      </div>
    </section>
  );
}
