"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "What is WiseHaven?",
    a: "WiseHaven is a smart envelope budgeting wallet designed for the Rwandan economic landscape. It lets you pre-allocate your income into named containers — called Envelopes — each locked until a date you choose. It acts as a behavioral commitment device: money you allocate cannot be accessed before its maturity date, preventing impulsive early-month spending.",
  },
  {
    q: "What is a smart envelope?",
    a: "A smart envelope is a named allocation container. When you create one, you specify the purpose (e.g., Rent), the amount, the intended recipient (e.g., a landlord's MoMo code), and the maturity date. The envelope locks those funds away from general spending until the date arrives. It is a structural commitment, not a mental reminder.",
  },
  {
    q: "Can I spend money in a locked envelope?",
    a: "No. A locked envelope cannot be drawn on for any other purpose while the lock is active. The funds are unavailable for impulse spending, partial withdrawals, or reallocation. This is the core behavioral mechanism — not a limitation, but a protection you chose for yourself at income receipt time.",
  },
  {
    q: "What happens when an envelope matures?",
    a: "When the maturity date is reached, the envelope status changes to Ready. This means the funds are now eligible for the next step — but nothing transfers automatically. You must open the envelope, verify the recipient details (the landlord's MoMo code, meter number, etc.), and explicitly confirm the payment. Maturity creates eligibility; your confirmation authorizes the transfer.",
  },
  {
    q: "What is the Emergency Vault?",
    a: "The Emergency Vault is a protected savings reserve that is automatically funded before any envelopes are created. When you deposit income, a configurable percentage (default 10%, range 1–50%) is swept into the vault first. Vault funds cannot be spent on routine expenses — they require a two-step confirmation to access, and are intended for genuine emergency use only.",
  },
  {
    q: "Does the current demo move real money?",
    a: "No. The current version of WiseHaven is a functional prototype using simulated data only. No real deposits, withdrawals, Mobile Money transactions, or financial custody of any kind occurs. All amounts shown are illustrative. The prototype runs entirely in your browser's localStorage. No backend, no bank, no real money.",
  },
  {
    q: "Why does WiseHaven exist?",
    a: "Data from the Rwanda FinScope 2020 survey shows 51.9% of adults run out of money before month-end, 55.1% have zero emergency savings, and 60.2% borrowed money in the past 12 months. WiseHaven addresses these structural patterns by converting passive budgeting intentions into active software enforcement — making it structurally harder to spend money that was already committed.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-[#060606]" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[#BEF532] text-[11px] font-mono uppercase tracking-widest mb-3">FAQ</p>
          <h2
            id="faq-heading"
            className="text-[36px] sm:text-[44px] font-bold leading-[1.1] tracking-[-0.025em] text-white"
            style={{ fontFamily: "Geist, Inter, sans-serif" }}
          >
            Common questions.
          </h2>
        </div>

        {/* Accordion */}
        <div className="flex flex-col divide-y divide-[#1a1a1a]" role="list">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} role="listitem">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#BEF532] focus-visible:outline-offset-2 rounded-sm"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span
                    className={`text-[15px] font-medium leading-snug transition-colors ${isOpen ? "text-white" : "text-[#A3A3A3] group-hover:text-white"}`}
                    style={{ fontFamily: "Geist, Inter, sans-serif" }}
                  >
                    {faq.q}
                  </span>
                  <span className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200 ${isOpen ? "border-[#BEF532] bg-[#BEF532]/10 text-[#BEF532]" : "border-[#303030] text-[#606060] group-hover:border-[#505050]"}`}>
                    {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                  </span>
                </button>
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[400px] pb-5" : "max-h-0"}`}
                  aria-hidden={!isOpen}
                >
                  <p className="text-[#A3A3A3] text-[14px] leading-relaxed pr-8">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
