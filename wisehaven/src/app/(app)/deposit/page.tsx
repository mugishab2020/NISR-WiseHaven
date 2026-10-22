"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { formatRWF, parseRWF } from "@/lib/currency";
import { validateDeposit } from "@/lib/validation";
import { previewDeposit } from "@/lib/store";
import { AlertCircle, CheckCircle, ArrowRight, ChevronLeft, Shield } from "lucide-react";

const INPUT: React.CSSProperties = {
  width: "100%", background: "#141414", color: "#ffffff",
  border: "1px solid #242424", borderRadius: "8px",
  fontFamily: "JetBrains Mono, monospace",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};
const focusOn  = (el: HTMLInputElement) => { el.style.borderColor = "#bef532"; el.style.boxShadow = "0 0 0 1px #bef532, 0 0 8px rgba(190,245,50,0.12)"; };
const focusOff = (el: HTMLInputElement) => { el.style.borderColor = "#242424"; el.style.boxShadow = "none"; };

const CARD: React.CSSProperties = { background: "#171717", border: "1px solid #242424", borderRadius: "12px" };

export default function DepositPage() {
  const router = useRouter();
  const { account, doDeposit, privacyMode } = useApp();

  const [amountInput, setAmountInput]   = useState("");
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [step, setStep]                 = useState<"form" | "review" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = parseRWF(amountInput);
  const preview = !isNaN(parsedAmount) && parsedAmount > 0
    ? previewDeposit(account, parsedAmount)
    : null;

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    const result = validateDeposit(amountInput);
    if (!result.valid) { setErrors(result.errors); return; }
    setErrors({});
    setStep("review");
  }

  function handleConfirm() {
    if (!preview) return;
    setIsSubmitting(true);
    try {
      doDeposit(preview.depositAmount);
      setStep("success");
    } catch (err) {
      setErrors({ amount: err instanceof Error ? err.message : "Deposit failed." });
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === "success" && preview) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto flex flex-col items-center justify-center py-16 gap-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#bef532" }}>
            <CheckCircle size={36} style={{ color: "#000000" }} />
          </div>
          <div className="text-center">
            <h2 className="font-geist font-semibold text-[20px] text-white">Deposit Recorded!</h2>
            <p className="font-body-md text-body-md mt-2" style={{ color: "#b5b5b5" }}>
              {privacyMode ? "••••••" : formatRWF(preview.depositAmount)} RWF added to your demo account.
            </p>
          </div>
          <div className="w-full p-4 rounded-xl flex flex-col gap-2" style={CARD}>
            {[
              { label: "Deposited", value: `+${formatRWF(preview.depositAmount)} RWF`, highlight: true },
              ...(preview.vaultSweepAmount > 0
                ? [{ label: `Vault Sweep (${preview.sweepPercentage}%)`, value: `-${formatRWF(preview.vaultSweepAmount)} RWF`, highlight: false }]
                : []),
              { label: "Available to Allocate", value: `${formatRWF(preview.remainingAmount)} RWF`, highlight: true },
            ].map(({ label, value, highlight }, i, arr) => (
              <div
                key={label}
                className="flex justify-between font-body-sm text-body-sm py-2"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid #1a1a1a" : "none" }}
              >
                <span style={{ color: "#808080" }}>{label}</span>
                <span className="font-mono font-semibold" style={{ color: highlight ? "#bef532" : "#b5b5b5" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
          <p className="font-body-sm text-body-sm text-center" style={{ color: "#808080" }}>
            ⚠ Simulated demo money only. No real funds deposited.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => { setAmountInput(""); setStep("form"); }}
              className="flex-1 py-2.5 rounded-lg font-body-md text-body-md font-medium transition-colors"
              style={{ background: "#171717", color: "#b5b5b5", border: "1px solid #242424" }}
            >
              Add More
            </button>
            <button
              onClick={() => router.push("/envelopes/new")}
              className="flex-1 py-2.5 rounded-lg font-body-md text-body-md font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: "#bef532", color: "#000000" }}
            >
              Allocate Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-md mx-auto pb-6">
        <button
          onClick={() => step === "review" ? setStep("form") : router.back()}
          className="flex items-center gap-1.5 font-body-sm text-body-sm mb-5 transition-colors"
          style={{ color: "#808080" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#808080"; }}
        >
          <ChevronLeft size={16} />
          {step === "review" ? "Edit Amount" : "Back"}
        </button>

        <div className="flex flex-col gap-1 mb-6">
          <h1 className="font-geist font-semibold text-[28px] text-white tracking-tight">Add Demo Money</h1>
          <div
            className="flex items-start gap-2 mt-2 p-3 rounded-lg"
            style={{ background: "#171717", border: "1px solid #242424" }}
          >
            <AlertCircle size={13} className="shrink-0 mt-0.5" style={{ color: "#808080" }} />
            <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>
              This adds simulated demo money only. No real bank transfer or MoMo transaction occurs.
            </p>
          </div>
        </div>

        {step === "form" ? (
          <form onSubmit={handleReview} noValidate className="flex flex-col gap-5">
            {/* Amount */}
            <div className="flex flex-col gap-2">
              <label htmlFor="deposit-amount" className="font-label-sm text-label-sm uppercase tracking-wider" style={{ color: "#808080" }}>
                Deposit Amount (RWF)
              </label>
              <div className="relative">
                <input
                  id="deposit-amount"
                  type="text" inputMode="numeric"
                  value={amountInput}
                  onChange={(e) => { setAmountInput(e.target.value); if (errors.amount) setErrors({}); }}
                  style={{
                    ...INPUT, height: "56px", padding: "0 56px 0 16px",
                    fontSize: "24px", fontWeight: "700",
                    ...(errors.amount ? { borderColor: "rgba(255,107,107,0.6)" } : {}),
                  }}
                  placeholder="0"
                  onFocus={(e) => focusOn(e.currentTarget)}
                  onBlur={(e)  => focusOff(e.currentTarget)}
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-md text-label-md font-mono pointer-events-none" style={{ color: "#808080" }}>
                  RWF
                </span>
              </div>
              {errors.amount ? (
                <p className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: "#ff6b6b" }}>
                  <AlertCircle size={12} /> {errors.amount}
                </p>
              ) : (
                <p className="font-body-sm text-body-sm" style={{ color: "#808080" }}>Minimum: 1,000 RWF</p>
              )}
            </div>

            {/* Quick presets */}
            <div className="grid grid-cols-3 gap-2">
              {[50000, 100000, 250000, 500000, 1000000, 2000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setAmountInput(formatRWF(preset)); setErrors({}); }}
                  className="py-2 rounded-lg font-label-sm text-label-sm font-mono transition-colors"
                  style={{ background: "#202020", color: "#b5b5b5", border: "1px solid #303030" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2a2a2a"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#202020"; (e.currentTarget as HTMLElement).style.color = "#b5b5b5"; }}
                >
                  {formatRWF(preset)}
                </button>
              ))}
            </div>

            {/* Live preview */}
            {preview && (
              <div className="p-4 rounded-xl flex flex-col gap-2" style={{ background: "rgba(190,245,50,0.03)", border: "1px solid rgba(190,245,50,0.15)" }}>
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold" style={{ color: "#bef532" }}>
                  Allocation Preview
                </span>
                <div className="w-full h-[4px] rounded-full flex gap-[2px] overflow-hidden" style={{ background: "#242424" }}>
                  <div className="h-full rounded-l-full transition-all duration-300" style={{ width: `${preview.sweepPercentage}%`, background: "#bef532" }} />
                  <div className="h-full flex-1" style={{ background: "#303030" }} />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm font-mono" style={{ color: "#808080" }}>
                  <span style={{ color: "#bef532" }}>Vault ({preview.sweepPercentage}%) = {formatRWF(preview.vaultSweepAmount)} RWF</span>
                  <span>Free ({100 - preview.sweepPercentage}%)</span>
                </div>
                <div className="flex items-center gap-1.5 font-body-sm text-body-sm" style={{ color: "#b5b5b5" }}>
                  <Shield size={11} style={{ color: "#bef532" }} />
                  {formatRWF(preview.vaultSweepAmount)} RWF → Emergency Vault
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-lg font-body-md text-body-md font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#bef532", color: "#000000" }}
            >
              Review Deposit <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* Review step */
          <div className="flex flex-col gap-5">
            <div className="p-4 rounded-xl flex flex-col gap-3" style={CARD}>
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold" style={{ color: "#bef532" }}>
                Confirm Simulated Deposit
              </span>
              {[
                { label: "Deposit Amount", value: `+${formatRWF(preview!.depositAmount)} RWF`, hl: true },
                ...(preview!.vaultSweepAmount > 0
                  ? [{ label: `Emergency Vault (${preview!.sweepPercentage}%)`, value: `-${formatRWF(preview!.vaultSweepAmount)} RWF`, hl: false }]
                  : []),
                { label: "Available to Allocate", value: `${formatRWF(preview!.remainingAmount)} RWF`, hl: true },
              ].map(({ label, value, hl }, i, arr) => (
                <div
                  key={label}
                  className="flex justify-between font-body-md text-body-md py-2.5"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid #1a1a1a" : "none" }}
                >
                  <span style={{ color: "#808080" }}>{label}</span>
                  <span className="font-mono font-semibold" style={{ color: hl ? "#bef532" : "#b5b5b5" }}>{value}</span>
                </div>
              ))}
              <p className="font-label-sm text-label-sm text-center" style={{ color: "#808080" }}>
                ⚠ Simulated demo deposit only. No real money moves.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 py-3 rounded-lg font-body-md text-body-md font-medium transition-colors"
                style={{ background: "#171717", color: "#b5b5b5", border: "1px solid #242424" }}
              >
                Edit
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-lg font-body-md text-body-md font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: "#bef532", color: "#000000" }}
              >
                <CheckCircle size={16} />
                {isSubmitting ? "Processing…" : "Confirm Deposit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
