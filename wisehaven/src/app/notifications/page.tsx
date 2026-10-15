"use client";

import AppShell from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { formatCountdown, formatDate } from "@/lib/dates";
import { formatRWF } from "@/lib/currency";
import Link from "next/link";
import { Bell, Lock, Unlock, Shield, ArrowRight } from "lucide-react";

export default function NotificationsPage() {
  const { account } = useApp();

  const unlockingSoon = account.envelopes.filter(
    (e) => e.status === "unlocking_soon"
  );
  const readyToPay = account.envelopes.filter(
    (e) => e.status === "ready_to_pay"
  );

  const notifications = [
    ...readyToPay.map((e) => ({
      id: e.id,
      type: "ready" as const,
      title: `${e.name} is ready to pay`,
      body: `${formatRWF(e.amount)} RWF matured. Confirm your simulated payment.`,
      href: `/envelopes/${e.id}`,
      icon: Unlock,
      accent: true,
    })),
    ...unlockingSoon.map((e) => ({
      id: e.id,
      type: "unlocking" as const,
      title: `${e.name} unlocking soon`,
      body: `Matures in ${formatCountdown(e.maturityDate)} (${formatDate(e.maturityDate)})`,
      href: `/envelopes/${e.id}`,
      icon: Lock,
      accent: false,
    })),
    {
      id: "vault_progress",
      type: "info" as const,
      title: "Emergency Vault Update",
      body: `Your vault is ${account.vaultBalance > 0 ? Math.round((account.vaultBalance / account.vaultSettings.targetAmount) * 100) : 0}% funded. Keep growing your safety net.`,
      href: "/vault",
      icon: Shield,
      accent: false,
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-6 max-w-2xl">
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-1">
            <Bell size={14} className="text-outline" />
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
              {notifications.length} Alerts
            </span>
          </div>
          <h1 className="font-geist font-semibold text-headline-xl-mobile text-primary tracking-tight">
            Notifications
          </h1>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Bell size={32} className="text-outline" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              All clear — no notifications right now.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                className={`p-4 rounded-xl flex items-center justify-between gap-4 border transition-colors group ${n.accent ? "bg-surface-container-high border-primary-fixed/30 hover:border-primary-fixed" : "bg-surface-container-low border-surface-container hover:bg-surface-container"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${n.accent ? "bg-primary-container text-on-primary" : "bg-surface-container-high text-outline"}`}>
                    <n.icon size={18} />
                  </div>
                  <div>
                    <p className={`font-body-md text-body-md font-semibold ${n.accent ? "text-primary-fixed" : "text-primary"}`}>
                      {n.title}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {n.body}
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-outline group-hover:text-on-surface transition-colors shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
