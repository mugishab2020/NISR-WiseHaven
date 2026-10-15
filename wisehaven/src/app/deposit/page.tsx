"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { formatRWF, parseRWF } from "@/lib/currency";
import { validateDeposit } from "@/lib/validation";
import { previewDeposit } from "@/lib/store";
import {
  AlertCircle, CheckCircle, ArrowRight, ChevronLeft, Plus, Shield
} from "lucide-react";

export default function DepositPage() {
  const router = useRouter();
  const { account, doDeposit, privacyMode } = useApp();

  const [amountInput, setAmountInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"form" | "review" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = parseRWF(amountInput);
  const preview = !isNaN(parsedAmount) && parsedAmount > 0
    ? previewDeposit(account, parsedAmount)
    : null;

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    const result = validateDeposit(amountInput);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
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
          <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
            <CheckCircle size={36} className="text-on-primary" />
          </div>
          <div className="text-center">
            <h2 className="font-geist font-semibold text-headline-sm text-primary">
              Deposit Recorded!
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              {privacyMode ? "••••••" : formatRWF(preview.depositAmount)} RWF has been added to your demo account.
            </p>
          </div>

          {/* Summary */}
          <div className="w-full rounded-xl bg-surface-container-low border border-surface-container p-4 flex flex-col gap-2">
            <div className="flex justify-between font-body-sm text-body-sm">
              <span className="text-outline">Deposited</span>
              <span className="text-primary-fixed font-semibold font-mono">
                +{formatRWF(preview.depositAmount)} RWF
              </span>
            </div>
            {preview.vaultSweepAmount > 0 && (
              <div className="flex justify-between font-body-sm text-body-sm">
                <span className="text-outline">Vault Sweep ({preview.sweepPercentage}%)</span>
                <span className="text-on-surface-variant font-mono">
                  -{formatRWF(preview.vaultSweepAmount)} RWF
                </span>
              </div>
            )}
            <div className="flex justify-between font-body-sm text-body-sm border-t border-surface-container pt-2 mt-1">
              <span className="text-on-surface font-medium">Available to Allocate</span>
              <span className="text-primary-fixed font-semibold font-mono">
                {formatRWF(preview.remainingAmount)} RWF
              </span>
            </div>
          </div>

          <p className="font-body-sm text-body-sm text-outline text-center">
            ⚠ This is simulated demo money only. No real funds were deposited.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => { setAmountInput(""); setStep("form"); }}
              className="flex-1 py-2.5 rounded bg-surface-container text-on-surface font-body-md font-medium hover:bg-surface-container-high border border-surface-container-high transition-colors"
            >
              Add More
            </button>
            <button
              onClick={() => router.push("/envelopes/new")}
              className="flex-1 py-2.5 rounded bg-primary-container text-on-primary font-body-md font-semibold hover:opacity-90 flex items-center justify-center gap-2"
            >
              Allocate Now
              <ArrowRight size={15} />
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
          className="flex items-center gap-1.5 text-outline hover:text-on-surface font-body-sm text-body-sm transition-colors mb-5"
        >
          <ChevronLeft size={16} />
          {step === "review" ? "Edit Amount" : "Back"}
        </button>

        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-2 text-primary-fixed mb-1">
            <Plus size={14} />
            <span className="font-label-sm text-label-sm uppercase tracking-widest">
              Simulated Deposit
            </span>
          </div>
          <h1 className="font-geist font-semibold text-headline-xl-mobile text-primary tracking-tight">
            Add Demo Money
          </h1>
          <div className="flex items-start gap-2 mt-1 p-2.5 rounded bg-surface-container border border-surface-container-high">
            <AlertCircle size={14} className="text-outline shrink-0 mt-0.5" />
            <p className="font-body-sm text-body-sm text-outline leading-relaxed">
              This adds simulated demo money only. No real bank transfer or Mobile
              Money transaction occurs. WiseHaven is a prototype.
            </p>
          </div>
        </div>

        {step === "form" ? (
          <form onSubmit={handleReview} noValidate className="flex flex-col gap-5">
            {/* Amount input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="deposit-amount" className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Deposit Amount (RWF)
              </label>
              <div className="relative">
                <input
                  id="deposit-amount"
                  type="text"
                  inputMode="numeric"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    if (errors.amount) setErrors({});
                  }}
                  className={`w-full h-14 px-4 pr-16 rounded bg-surface-container text-primary font-mono text-headline-sm font-bold border focus:outline-none focus:ring-1 transition-all ${errors.amount ? "border-error focus:ring-error" : "border-surface-container-high focus:border-primary-fixed focus:ring-primary-fixed"}`}
                  placeholder="0"
                  aria-describedby={errors.amount ? "deposit-err" : "deposit-hint"}
                  aria-invalid={!!errors.amount}
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-md text-label-md font-mono text-outline pointer-events-none">
                  RWF
                </span>
              </div>
              {errors.amount ? (
                <p id="deposit-err" className="flex items-center gap-1 font-body-sm text-body-sm text-error" role="alert">
                  <AlertCircle size={12} /> {errors.amount}
                </p>
              ) : (
                <p id="deposit-hint" className="font-body-sm text-body-sm text-outline">
                  Minimum deposit: 1,000 RWF
                </p>
              )}
            </div>

            {/* Quick amount presets */}
            <div className="grid grid-cols-3 gap-2">
              {[50000, 100000, 250000, 500000, 1000000, 2000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setAmountInput(formatRWF(preset)); setErrors({}); }}
                  className="py-2 rounded bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md font-mono transition-colors"
                >
                  {formatRWF(preset)}
                </button>
              ))}
            </div>

            {/* Live preview */}
            {preview && (
              <div className="rounded bg-surface-container border border-surface-container-high p-4 flex flex-col gap-2">
                <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider font-semibold">
                  Allocation Preview
                </span>
                <div className="h-2 w-full rounded bg-surface-container-high flex overflow-hidden mt-1">
                  <div
                    className="h-full bg-primary-fixed transition-all duration-300"
                    style={{ width: `${preview.sweepPercentage}%` }}
                  />
                  <div className="h-full bg-surface-bright flex-1" />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm font-mono text-outline mt-1">
                  <span className="text-primary-fixed">Vault ({preview.sweepPercentage}%) = {formatRWF(preview.vaultSweepAmount)} RWF</span>
                  <span>Allocatable ({100 - preview.sweepPercentage}%)</span>
                </div>
                <div className="flex items-center gap-2 mt-1 font-body-sm text-body-sm text-secondary">
                  <Shield size={12} className="text-primary-fixed" />
                  <span>
                    {formatRWF(preview.vaultSweepAmount)} RWF will go to Emergency Vault
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded bg-primary-container text-on-primary font-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Review Deposit
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* Review step */
          <div className="flex flex-col gap-5">
            <div className="rounded-xl bg-surface-container-low border border-surface-container p-4 flex flex-col gap-3">
              <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider font-semibold">
                Confirm Simulated Deposit
              </span>

              <div className="flex flex-col divide-y divide-surface-container">
                <div className="py-3 flex justify-between font-body-md text-body-md">
                  <span className="text-outline">Deposit Amount</span>
                  <span className="text-primary-fixed font-semibold font-mono">
                    +{formatRWF(preview!.depositAmount)} RWF
                  </span>
                </div>
                {preview!.vaultSweepAmount > 0 && (
                  <div className="py-3 flex justify-between font-body-md text-body-md">
                    <span className="text-outline flex items-center gap-1.5">
                      <Shield size={13} className="text-primary-fixed" />
                      Emergency Vault ({preview!.sweepPercentage}%)
                    </span>
                    <span className="text-on-surface-variant font-mono">
                      -{formatRWF(preview!.vaultSweepAmount)} RWF
                    </span>
                  </div>
                )}
                <div className="py-3 flex justify-between font-body-md text-body-md font-semibold">
                  <span className="text-on-surface">Available to Allocate</span>
                  <span className="text-primary-fixed font-mono">
                    {formatRWF(preview!.remainingAmount)} RWF
                  </span>
                </div>
              </div>

              <p className="font-label-sm text-label-sm text-outline text-center">
                ⚠ Simulated demo deposit only. No real money is moved.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 py-3 rounded bg-surface-container text-on-surface font-body-md font-medium hover:bg-surface-container-high border border-surface-container-high transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded bg-primary-container text-on-primary font-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
