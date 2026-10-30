"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { envelopeApi, ApiError } from "@/lib/api";
import { formatRWF } from "@/lib/currency";
import type { EnvelopeCategory } from "@/types";
import {
  Lock, ChevronLeft, Home, ShoppingBasket, Zap, School,
  Truck, Heart, Users, Briefcase, AlertCircle, Check, Loader2,
} from "lucide-react";

const CATEGORIES: {
  value: EnvelopeCategory;
  backendValue: string;
  label: string;
  iconComp: typeof Lock;
}[] = [
  { value: "shelter",    backendValue: "Rent",       label: "Shelter / Rent",      iconComp: Home           },
  { value: "food",       backendValue: "Food",       label: "Food & Groceries",    iconComp: ShoppingBasket },
  { value: "utilities",  backendValue: "Utilities",  label: "Utilities & Bills",   iconComp: Zap            },
  { value: "education",  backendValue: "Education",  label: "Education & Tuition", iconComp: School         },
  { value: "transport",  backendValue: "Transport",  label: "Transport",           iconComp: Truck          },
  { value: "healthcare", backendValue: "Healthcare", label: "Healthcare",          iconComp: Heart          },
  { value: "family",     backendValue: "Custom",     label: "Family & Remittance", iconComp: Users          },
  { value: "business",   backendValue: "Custom",     label: "Business Expenses",   iconComp: Briefcase      },
  { value: "custom",     backendValue: "Custom",     label: "Custom",              iconComp: Lock           },
];

const INPUT: React.CSSProperties = {
  width: "100%", height: "48px", padding: "0 16px",
  background: "#141414", color: "#ffffff",
  border: "1px solid #242424", borderRadius: "8px",
  fontSize: "14px", fontFamily: "Inter, sans-serif",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};
const FOCUS_ON  = (el: HTMLInputElement | HTMLTextAreaElement) => { el.style.borderColor = "#bef532"; el.style.boxShadow = "0 0 0 1px #bef532, 0 0 8px rgba(190,245,50,0.12)"; };
const FOCUS_OFF = (el: HTMLInputElement | HTMLTextAreaElement) => { el.style.borderColor = "#242424"; el.style.boxShadow = "none"; };

// Minimum future datetime: 1 hour from now
function defaultMaturity(): string {
  const d = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}

function defaultFirstRelease(): string {
  const d = new Date(Date.now() + 24 * 3600 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function NewEnvelopePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { state, refresh } = useApp();
  const availableFunds = state.availableBalance;

  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]       = useState<EnvelopeCategory | "">("");
  const [maturityDate, setMaturityDate] = useState(defaultMaturity());
  const [releaseFrequency, setReleaseFrequency] = useState<"NONE" | "DAILY" | "WEEKLY">("NONE");
  const [releaseAmount, setReleaseAmount] = useState("");
  const [firstReleaseAt, setFirstReleaseAt] = useState(defaultFirstRelease());
  const [amount, setAmount]           = useState("");
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);


  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim())  e.name = "Name is required";
    if (!category)     e.category = "Category is required";
    if (releaseFrequency === "NONE") {
      if (!maturityDate) e.maturityDate = "Maturity date is required";
      else if (new Date(maturityDate).getTime() <= Date.now() + 60000) e.maturityDate = "Maturity date must be at least 1 minute in the future";
    }
    const parsedAmount = parseInt(amount.replace(/,/g, ""), 10);
    if (!amount.trim()) e.amount = "Amount is required";
    else if (isNaN(parsedAmount) || parsedAmount <= 0) e.amount = "Enter a valid amount";
    else if (parsedAmount > availableFunds) e.amount = `Exceeds available balance (${formatRWF(availableFunds)} RWF)`;
    if (releaseFrequency !== "NONE") {
      const parsedRelease = parseInt(releaseAmount.replace(/,/g, ""), 10);
      if (!releaseAmount.trim() || isNaN(parsedRelease) || parsedRelease <= 0) {
        e.releaseAmount = "Enter a valid release amount";
      } else if (!isNaN(parsedAmount) && parsedRelease > parsedAmount) {
        e.releaseAmount = "Release amount cannot exceed the total envelope amount";
      }
      if (!firstReleaseAt || new Date(firstReleaseAt).getTime() <= Date.now() + 60000) {
        e.firstReleaseAt = "Choose a first release time at least 1 minute in the future";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const cat = CATEGORIES.find((c) => c.value === category)!;
    const parsedAmount = parseInt(amount.replace(/,/g, ""), 10);

    try {
      // 1. Create the envelope
      const envelope = await envelopeApi.create(() => getToken(), {
        name: name.trim(),
        category: cat.backendValue,
        description: description.trim() || undefined,
      });

      // 2. Allocate the amount from wallet into the envelope
      await envelopeApi.fund(
        () => getToken(),
        envelope.id,
        parsedAmount,
        `Initial allocation — ${name.trim()}`,
      );

      if (releaseFrequency === "NONE") {
        await envelopeApi.createLock(
          () => getToken(),
          envelope.id,
          new Date(maturityDate).toISOString(),
        );
      } else {
        await envelopeApi.createAllowance(() => getToken(), envelope.id, {
          release_amount: parseInt(releaseAmount.replace(/,/g, ""), 10),
          frequency: releaseFrequency,
          first_release_at: new Date(firstReleaseAt).toISOString(),
        });
      }

      setSubmitted(true);
      await refresh();
      setTimeout(() => router.push("/envelopes"), 1500);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to create envelope. Please try again.";
      setErrors({ submit: msg });
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#bef532" }}>
            <Check size={28} style={{ color: "#000000" }} />
          </div>
          <div className="text-center">
            <h2 className="font-geist font-semibold text-[20px] text-white">Envelope Created!</h2>
            <p className="font-body-md text-body-md mt-1" style={{ color: "#b5b5b5" }}>{releaseFrequency === "NONE" ? "Temporal lock applied." : "Scheduled allowance created."} Redirecting…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto pb-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 font-body-sm text-body-sm mb-5 transition-colors"
          style={{ color: "#808080" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#808080"; }}>
          <ChevronLeft size={16} /> Back to Envelopes
        </button>

        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-2">
            <Lock size={13} style={{ color: "#bef532" }} />
            <span className="font-label-sm text-label-sm uppercase tracking-[0.18em]" style={{ color: "#bef532" }}>{releaseFrequency === "NONE" ? "New Time-Lock" : "Scheduled Allowance"}</span>
          </div>
          <h1 className="font-geist font-semibold text-[28px] text-white tracking-tight">Create Envelope</h1>
          <p className="font-body-md text-body-md" style={{ color: "#b5b5b5" }}>Give this envelope a purpose and choose when its funds become available.</p>
        </div>

        {/* Available funds */}
        <div className="mb-5 p-3 rounded-lg flex items-center justify-between" style={{ background: "#171717", border: "1px solid #242424" }}>
          <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>Available Demo Balance</span>
          <span className="font-mono font-semibold text-[14px]" style={{ color: "#bef532" }}>{formatRWF(availableFunds)} RWF</span>
        </div>

        {errors.submit && (
          <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>
            <AlertCircle size={13} style={{ color: "#ff6b6b" }} />
            <p className="font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-name" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Envelope Name <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <input id="env-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              style={{ ...INPUT, ...(errors.name ? { borderColor: "rgba(255,107,107,0.6)" } : {}) }}
              placeholder="e.g. Monthly Rent, Semester Tuition…" maxLength={60}
              onFocus={(e) => FOCUS_ON(e.currentTarget)} onBlur={(e) => FOCUS_OFF(e.currentTarget)}
            />
            {errors.name && <p className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}><AlertCircle size={12} /> {errors.name}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-desc" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>Description (optional)</label>
            <textarea id="env-desc" value={description} onChange={(e) => setDescription(e.target.value)}
              style={{ ...INPUT, height: "auto", padding: "12px 16px", resize: "none" }}
              placeholder="Brief description…" rows={2}
              onFocus={(e) => FOCUS_ON(e.currentTarget)} onBlur={(e) => FOCUS_OFF(e.currentTarget)}
            />
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-amount" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              {releaseFrequency === "NONE" ? "Amount to Allocate (RWF)" : "Total Amount to Lock (RWF)"} <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <div className="relative">
              <input
                id="env-amount"
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ ...INPUT, paddingRight: "56px", fontFamily: "JetBrains Mono, monospace", ...(errors.amount ? { borderColor: "rgba(255,107,107,0.6)" } : {}) }}
                placeholder="e.g. 50000"
                onFocus={(e) => FOCUS_ON(e.currentTarget)}
                onBlur={(e) => FOCUS_OFF(e.currentTarget)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-sm text-label-sm pointer-events-none" style={{ color: "#808080" }}>RWF</span>
            </div>
            {errors.amount
              ? <p className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}><AlertCircle size={12} /> {errors.amount}</p>
              : amount && !isNaN(parseInt(amount)) && (
                  <p className="font-body-sm text-body-sm" style={{ color: "#bef532" }}>
                    = {formatRWF(parseInt(amount))} RWF · Remaining: {formatRWF(Math.max(0, availableFunds - parseInt(amount)))} RWF
                  </p>
                )
            }
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Category <span style={{ color: "#ff6b6b" }}>*</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const sel = category === cat.value;
                return (
                  <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                    className="flex items-center gap-2 p-3 rounded-lg text-left transition-all"
                    style={{ background: sel ? "rgba(190,245,50,0.08)" : "#171717", border: `1px solid ${sel ? "#bef532" : "#242424"}`, color: sel ? "#bef532" : "#b5b5b5" }}>
                    <cat.iconComp size={14} />
                    <span className="font-body-sm text-body-sm font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && <p className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}><AlertCircle size={12} /> {errors.category}</p>}
          </div>

          {/* Choose a fixed maturity or periodic allowance releases */}
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>How should this money become available?</span>
            <div className="grid grid-cols-3 gap-2">
              {([
                ["NONE", "All at once"],
                ["DAILY", "Daily amount"],
                ["WEEKLY", "Weekly amount"],
              ] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setReleaseFrequency(value)}
                  className="rounded-lg px-2 py-3 font-body-sm text-body-sm font-medium"
                  style={{ background: releaseFrequency === value ? "rgba(190,245,50,0.08)" : "#171717", border: `1px solid ${releaseFrequency === value ? "#bef532" : "#242424"}`, color: releaseFrequency === value ? "#bef532" : "#b5b5b5" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Maturity date */}
          {releaseFrequency === "NONE" ? <div className="flex flex-col gap-1.5">
            <label htmlFor="env-maturity" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
              Maturity Date & Time <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <input id="env-maturity" type="datetime-local" value={maturityDate} onChange={(e) => setMaturityDate(e.target.value)}
              style={{ ...INPUT, fontFamily: "JetBrains Mono, monospace", ...(errors.maturityDate ? { borderColor: "rgba(255,107,107,0.6)" } : {}) }}
              onFocus={(e) => FOCUS_ON(e.currentTarget)} onBlur={(e) => FOCUS_OFF(e.currentTarget)}
            />
            {errors.maturityDate
              ? <p className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}><AlertCircle size={12} /> {errors.maturityDate}</p>
              : <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>Funds will be locked until this date.</p>
            }
          </div> : <div className="flex flex-col gap-4 rounded-lg p-4" style={{ background: "#141414", border: "1px solid #242424" }}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="env-release-amount" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                Amount released {releaseFrequency === "DAILY" ? "each day" : "each week"} (RWF) <span style={{ color: "#ff6b6b" }}>*</span>
              </label>
              <input id="env-release-amount" type="number" min={1} step={1} value={releaseAmount}
                onChange={(e) => setReleaseAmount(e.target.value)} style={INPUT} placeholder="e.g. 2000" />
              {errors.releaseAmount && <p className="font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>{errors.releaseAmount}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="env-first-release" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>First release</label>
              <input id="env-first-release" type="datetime-local" value={firstReleaseAt} onChange={(e) => setFirstReleaseAt(e.target.value)} style={INPUT} />
              {errors.firstReleaseAt
                ? <p className="font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>{errors.firstReleaseAt}</p>
                : <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>The rest stays locked. Missed days do not accumulate into a larger release.</p>}
            </div>
          </div>}

          <p className="font-body-sm text-body-sm text-center" style={{ color: "#808080" }}>
            ⚠ This is simulated demo money only. No real funds are moved.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={() => router.back()} disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg font-body-md text-body-md font-medium"
              style={{ background: "#171717", color: "#b5b5b5", border: "1px solid #242424" }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg font-body-md text-body-md font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: "#bef532", color: "#000000" }}>
              {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : <><Lock size={15} /> Create Envelope</>}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
