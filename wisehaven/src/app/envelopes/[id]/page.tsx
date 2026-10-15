"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import EnvelopeStatusBadge from "@/components/ui/EnvelopeStatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatRWF } from "@/lib/currency";
import { formatCountdown, formatDate, calcElapsedFraction, formatActivityDate } from "@/lib/dates";
import {
  ChevronLeft, Lock, CheckCircle, AlertCircle,
  Home, ShoppingBasket, Zap, School, Truck, Heart, Users, Briefcase
} from "lucide-react";

const ICON_MAP: Record<string, typeof Lock> = {
  home_work: Home,
  shopping_basket: ShoppingBasket,
  bolt: Zap,
  school: School,
  truck: Truck,
  heart: Heart,
  users: Users,
  briefcase: Briefcase,
};

export default function EnvelopeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { account, doConfirmPayment, privacyMode } = useApp();

  const [showConfirm, setShowConfirm] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const envelope = account.envelopes.find((e) => e.id === params.id);

  if (!envelope) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle size={40} className="text-outline" />
          <h2 className="font-geist font-semibold text-headline-sm text-primary">Envelope not found</h2>
          <button
            onClick={() => router.push("/envelopes")}
            className="px-4 py-2.5 rounded bg-surface-container text-on-surface font-body-md hover:bg-surface-container-high transition-colors"
          >
            Back to Envelopes
          </button>
        </div>
      </AppShell>
    );
  }

  const Icon = ICON_MAP[envelope.icon] ?? Lock;
  const elapsed = calcElapsedFraction(envelope.createdAt, envelope.maturityDate);
  const countdown = formatCountdown(envelope.maturityDate);
  const isPaid = envelope.status === "paid";

  const relatedTx = account.transactions.filter(
    (tx) => tx.envelopeId === envelope.id
  );

  function handleConfirmPayment() {
    try {
      doConfirmPayment(envelope!.id);
      setPaid(true);
      setShowConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
      setShowConfirm(false);
    }
  }

  if (paid) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center">
            <CheckCircle size={28} className="text-on-primary" />
          </div>
          <div className="text-center">
            <h2 className="font-geist font-semibold text-headline-sm text-primary">Payment Confirmed!</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Demo payment of {formatRWF(envelope.amount)} RWF recorded.
            </p>
            <p className="font-body-sm text-body-sm text-outline mt-1">
              ⚠ This is a simulated payment. No real money was transferred.
            </p>
          </div>
          <button
            onClick={() => router.push("/envelopes")}
            className="px-4 py-2.5 rounded bg-primary-container text-on-primary font-body-md font-semibold hover:opacity-90"
          >
            Back to Envelopes
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto pb-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-outline hover:text-on-surface font-body-sm text-body-sm transition-colors mb-5"
        >
          <ChevronLeft size={16} />
          Back to Envelopes
        </button>

        {/* Hero card */}
        <div className={`relative rounded-xl p-5 overflow-hidden border mb-5 ${envelope.status === "unlocking_soon" || envelope.status === "ready_to_pay" ? "bg-surface-container-high border-primary-fixed/30" : "bg-surface-container-low border-surface-container"}`}>
          {(envelope.status === "unlocking_soon" || envelope.status === "ready_to_pay") && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-fixed" />
          )}
          <div className="absolute -right-8 -bottom-8 text-surface-container-highest/20 pointer-events-none">
            <Icon size={100} />
          </div>

          <div className="relative z-10 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded flex items-center justify-center ${envelope.status === "unlocking_soon" || envelope.status === "ready_to_pay" ? "bg-primary-container text-on-primary" : "bg-surface-container-highest text-primary-fixed"}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h1 className="font-geist font-semibold text-headline-sm text-primary">
                    {envelope.name}
                  </h1>
                  <p className="font-label-sm text-label-sm text-outline mt-0.5">
                    {envelope.categoryLabel}
                  </p>
                </div>
              </div>
              <EnvelopeStatusBadge status={envelope.status} />
            </div>

            {/* Amount */}
            <div>
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Secured Capital
              </span>
              <div className="mt-1">
                <CurrencyDisplay amount={envelope.amount} size="lg" className={envelope.status === "ready_to_pay" ? "text-primary-fixed" : undefined} />
              </div>
            </div>

            {/* Progress */}
            {!isPaid && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-outline font-mono">Lock Progress</span>
                  <span className={`font-mono font-bold ${envelope.status === "unlocking_soon" || envelope.status === "ready_to_pay" ? "text-primary-fixed" : "text-primary"}`}>
                    {countdown}
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden flex gap-0.5">
                  <div
                    className="h-full bg-primary-fixed rounded-l-full transition-all duration-500"
                    style={{ width: `${Math.round(elapsed * 100)}%` }}
                  />
                  <div className="h-full bg-surface-variant flex-1" />
                </div>
                <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
                  <span>Created {formatDate(envelope.createdAt)}</span>
                  <span className="text-on-surface font-medium">{formatDate(envelope.maturityDate)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="rounded-xl bg-surface-container-low border border-surface-container p-4 flex flex-col gap-3 mb-5">
          <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
            Envelope Details
          </span>
          <div className="flex flex-col divide-y divide-surface-container">
            {[
              { label: "Recipient", value: envelope.recipient },
              { label: "Maturity Date", value: formatDate(envelope.maturityDate) },
              { label: "Created", value: formatDate(envelope.createdAt) },
              { label: "Category", value: envelope.categoryLabel },
              ...(envelope.description ? [{ label: "Notes", value: envelope.description }] : []),
              ...(envelope.paidAt ? [{ label: "Paid At", value: formatDate(envelope.paidAt) }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="py-2.5 flex items-start justify-between gap-3">
                <span className="font-label-sm text-label-sm text-outline whitespace-nowrap">{label}</span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        {relatedTx.length > 0 && (
          <div className="rounded-xl bg-surface-container-low border border-surface-container p-4 flex flex-col gap-3 mb-5">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Activity
            </span>
            <div className="flex flex-col gap-2">
              {relatedTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <p className="font-body-md text-body-md text-on-surface font-medium">{tx.description}</p>
                    <p className="font-body-sm text-body-sm text-outline">{formatActivityDate(tx.timestamp)}</p>
                  </div>
                  <span className={`font-label-md text-label-md font-semibold font-mono ${tx.direction === "out" ? "text-on-surface-variant" : "text-primary-fixed"}`}>
                    {tx.direction === "in" ? "+" : "-"}
                    {privacyMode ? "••••••" : formatRWF(tx.amount)} RWF
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded bg-error-container/20 border border-error/20 flex items-center gap-2">
            <AlertCircle size={16} className="text-error" />
            <p className="font-body-sm text-body-sm text-error">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {envelope.status === "ready_to_pay" && !isPaid && (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-3.5 rounded bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Confirm Simulated Payment
            </button>
          )}

          {envelope.status === "unlocking_soon" && (
            <div className="w-full py-3 rounded border-2 border-primary-fixed/40 text-primary-fixed font-body-md text-body-md font-medium flex items-center justify-center gap-2 bg-primary-container/5">
              <Lock size={16} className="animate-pulse" />
              Unlocking Soon — {countdown}
            </div>
          )}

          {envelope.status === "locked" && (
            <div className="w-full py-3 rounded bg-surface-container border border-surface-container-high text-on-surface-variant font-body-md text-body-md flex items-center justify-center gap-2">
              <Lock size={16} />
              Locked until {formatDate(envelope.maturityDate)}
            </div>
          )}

          {isPaid && (
            <div className="w-full py-3 rounded bg-surface-container border border-surface-container-high text-outline font-body-md text-body-md flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              Payment Completed on {envelope.paidAt ? formatDate(envelope.paidAt) : "–"}
            </div>
          )}

          <button
            onClick={() => router.push("/envelopes")}
            className="w-full py-2.5 rounded bg-surface-container text-on-surface font-body-md text-body-md hover:bg-surface-container-high border border-surface-container-high transition-colors"
          >
            Back to Envelopes
          </button>
        </div>

        {/* Confirm dialog */}
        <ConfirmDialog
          isOpen={showConfirm}
          title="Confirm Simulated Payment"
          description={`This will simulate a payment of ${formatRWF(envelope.amount)} RWF to ${envelope.recipient}. This is demo money only — no real transfer occurs.`}
          confirmLabel="Confirm Payment"
          cancelLabel="Cancel"
          onConfirm={handleConfirmPayment}
          onCancel={() => setShowConfirm(false)}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-body-sm text-body-sm">
              <span className="text-outline">Amount</span>
              <span className="text-primary-fixed font-semibold font-mono">{formatRWF(envelope.amount)} RWF</span>
            </div>
            <div className="flex justify-between font-body-sm text-body-sm">
              <span className="text-outline">To</span>
              <span className="text-on-surface font-medium">{envelope.recipient}</span>
            </div>
            <p className="font-label-sm text-label-sm text-outline mt-1">
              ⚠ Simulated demo payment only. No real money moves.
            </p>
          </div>
        </ConfirmDialog>
      </div>
    </AppShell>
  );
}
