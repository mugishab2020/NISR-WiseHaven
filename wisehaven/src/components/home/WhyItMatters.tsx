export default function WhyItMatters() {
  return (
    <section id="approach" className="py-24 bg-[#0a0a0a]" aria-labelledby="why-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <p className="text-[#BEF532] text-[11px] font-mono uppercase tracking-widest mb-3">Our approach</p>
            <h2
              id="why-heading"
              className="text-[36px] sm:text-[44px] font-bold leading-[1.1] tracking-[-0.025em] text-white"
              style={{ fontFamily: "Geist, Inter, sans-serif" }}
            >
              Discipline built<br />into the structure.
            </h2>
          </div>
          <div className="flex flex-col gap-3 pt-2 lg:pt-8">
            <p className="text-[#A3A3A3] text-[15px] leading-relaxed">
              WiseHaven is not a budgeting app that asks you to remember.
              It is a commitment structure that removes the need to resist temptation by
              making early spending structurally impossible.
            </p>
            <p className="text-[#606060] text-[14px] leading-relaxed">
              Based on behavioral research: the hardest moment to protect money is when
              liquidity is highest. WiseHaven turns that moment into a commitment.
            </p>
          </div>
        </div>

        {/* Principles — asymmetric grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#1a1a1a]">
          {[
            {
              num: "I",
              title: "Purposeful allocation",
              body: "Every franc has a named destination before it can be touched. Uncommitted money is not free money — it is a signal to allocate.",
              accent: true,
            },
            {
              num: "II",
              title: "Time-based commitment",
              body: "Lock periods are not arbitrary friction. They exist because the person who receives a salary and the person who faces a bill two weeks later are behaviorally different. The lock bridges that gap.",
              accent: false,
            },
            {
              num: "III",
              title: "Clear visibility",
              body: "You always see exactly how much is locked, how much is available, and how much is in the vault. No hidden balances. No opaque pooled accounts. Total transparency.",
              accent: false,
            },
            {
              num: "IV",
              title: "Explicit authorization",
              body: "No automatic payments. No silent transfers. Every disbursement requires you to review the recipient details and confirm. Maturity creates eligibility, not obligation.",
              accent: true,
            },
          ].map((p) => (
            <div
              key={p.num}
              className={`relative p-8 flex flex-col gap-4 ${p.accent ? "bg-[#111111]" : "bg-[#0e0e0e]"}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-[#BEF532]/40 font-mono font-bold text-[40px] leading-none select-none">{p.num}</span>
                <div className="flex flex-col gap-2 pt-2">
                  <h3
                    className="text-white text-[18px] font-semibold leading-tight"
                    style={{ fontFamily: "Geist, Inter, sans-serif" }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-[#A3A3A3] text-[14px] leading-relaxed">{p.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats callout */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { stat: "51.9%", label: "of Rwandan adults run short of money before month-end", source: "FinScope 2020 · H3" },
            { stat: "58.4%", label: "do not maintain monthly budget tracking", source: "FinScope 2020 · EF7" },
            { stat: "55.1%", label: "hold zero emergency savings reserves", source: "FinScope 2020 · EF9" },
          ].map((s) => (
            <div key={s.stat} className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-5">
              <p className="font-mono font-bold text-[#BEF532] text-[36px] leading-none mb-2">{s.stat}</p>
              <p className="text-[#A3A3A3] text-[13px] leading-relaxed mb-2">{s.label}</p>
              <p className="text-[#404040] text-[10px] font-mono">{s.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
