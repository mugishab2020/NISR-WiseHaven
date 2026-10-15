"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

function fmt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export default function EmergencyVaultFeature() {
  const [sweep, setSweep] = useState(10);
  const income = 250000;
  const vaultAmount = Math.round((income * sweep) / 100);
  const remaining = income - vaultAmount;
  const progress = Math.round((vaultAmount / 100000) * 100);

  return (
    <section className="py-24 bg-[#060606]" aria-labelledby="vault-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: copy ── */}
          <div className="flex flex-col gap-6">
            <p className="text-[#BEF532] text-[11px] font-mono uppercase tracking-widest">Emergency Vault</p>
            <h2
              id="vault-heading"
              className="text-[36px] sm:text-[44px] font-bold leading-[1.1] tracking-[-0.025em] text-white"
              style={{ fontFamily: "Geist, Inter, sans-serif" }}
            >
              Prepare for the<br />
              <span className="text-[#BEF532]">unexpected.</span>
            </h2>
            <p className="text-[#A3A3A3] text-[16px] leading-relaxed max-w-[440px]">
              Set aside a portion of every incoming amount for the moments you
              cannot plan for. The Emergency Vault sweeps automatically — before
              envelopes are created, before the rest is spent.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { title: "Swept first", desc: "Before you allocate envelopes, the vault takes its share — pay yourself first." },
                { title: "Non-spendable by default", desc: "Vault funds are protected from routine spending. Accessing them requires a two-step confirmation." },
                { title: "Builds incrementally", desc: "Every deposit grows your buffer. No discipline required — the structure does the work." },
              ].map((f) => (
                <div key={f.title} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#BEF532] mt-2 shrink-0" />
                  <div>
                    <p className="text-white text-[14px] font-semibold mb-0.5" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
                      {f.title}
                    </p>
                    <p className="text-[#606060] text-[13px] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[#404040] text-[12px] font-mono border-t border-[#1a1a1a] pt-4">
              ↳ No interest is earned in the current prototype. This feature is illustrative only.
            </p>
          </div>

          {/* ── Right: vault card ── */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#111111] border border-[#242424] rounded-2xl overflow-hidden">
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-[#BEF532]/50 via-[#BEF532] to-[#BEF532]/50" />

              <div className="p-6 flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#BEF532]/10 flex items-center justify-center">
                      <Shield size={16} className="text-[#BEF532]" />
                    </div>
                    <div>
                      <p className="text-white text-[14px] font-semibold" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
                        Emergency Vault
                      </p>
                      <p className="text-[#606060] text-[11px]">First-sweep reserve</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#BEF532]/10 border border-[#BEF532]/20 text-[#BEF532] text-[10px] font-mono font-semibold uppercase">
                    Protected
                  </span>
                </div>

                {/* Balance */}
                <div className="bg-[#0e0e0e] rounded-xl p-4 border border-[#1e1e1e]">
                  <p className="text-[#606060] text-[10px] font-mono uppercase tracking-wider mb-1">
                    Vault balance (illustrative)
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-bold text-[32px] text-[#BEF532] tabular-nums transition-all duration-300">
                      {fmt(vaultAmount)}
                    </span>
                    <span className="text-[#BEF532]/60 font-mono text-[14px]">RWF</span>
                  </div>

                  {/* Progress toward 100k goal */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[#606060] text-[10px] font-mono">Progress to 100,000 RWF goal</span>
                      <span className="text-[#BEF532] text-[10px] font-mono font-bold">
                        {Math.min(100, progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#1e1e1e] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#BEF532] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sweep config */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-[13px] font-medium" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
                        First-sweep percentage
                      </p>
                      <p className="text-[#606060] text-[11px]">Applied before any envelope allocation</p>
                    </div>
                    <span className="font-mono font-bold text-[#BEF532] text-[20px]">{sweep}%</span>
                  </div>

                  {/* Slider */}
                  <div className="relative h-2 bg-[#1e1e1e] rounded-full">
                    <div
                      className="absolute left-0 top-0 h-full bg-[#BEF532] rounded-full transition-all duration-150"
                      style={{ width: `${((sweep - 1) / 49) * 100}%` }}
                    />
                    <input
                      type="range"
                      min={1}
                      max={50}
                      step={1}
                      value={sweep}
                      onChange={(e) => setSweep(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Emergency vault sweep percentage"
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[#BEF532] bg-[#0a1200] shadow-lg pointer-events-none transition-all duration-150"
                      style={{ left: `${((sweep - 1) / 49) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[#404040] text-[10px] font-mono">
                    <span>1%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Result */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0e0e0e] rounded-xl p-3 border border-[#1e1e1e]">
                    <p className="text-[#606060] text-[10px] font-mono uppercase tracking-wider mb-1">To vault</p>
                    <p className="font-mono font-bold text-[#BEF532] text-[16px] tabular-nums transition-all duration-300">
                      {fmt(vaultAmount)}
                    </p>
                    <p className="text-[#404040] text-[10px] font-mono">RWF</p>
                  </div>
                  <div className="bg-[#0e0e0e] rounded-xl p-3 border border-[#1e1e1e]">
                    <p className="text-[#606060] text-[10px] font-mono uppercase tracking-wider mb-1">To envelopes</p>
                    <p className="font-mono font-bold text-white text-[16px] tabular-nums transition-all duration-300">
                      {fmt(remaining)}
                    </p>
                    <p className="text-[#404040] text-[10px] font-mono">RWF</p>
                  </div>
                </div>
                <p className="text-[#404040] text-center text-[11px] font-mono">
                  Based on illustrative income of {fmt(income)} RWF
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
