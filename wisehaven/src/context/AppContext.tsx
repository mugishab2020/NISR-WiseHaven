"use client";

// ============================================================
// WiseHaven — Global App State Context
// Wraps the entire client tree. Provides demo account state
// and mutation functions to all client components.
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import Image from "next/image";
import type { DemoAccount, Envelope } from "@/types";
import {
  loadAccount,
  saveAccount,
  resetAccount,
  applyDeposit,
  allocateEnvelope,
  confirmPayment,
  updateVaultSettings,
  computeAvailableFunds,
  computeLockedTotal,
  computeEnvelopeStatus,
  newTxId,
} from "@/lib/store";

// ── Context shape ──────────────────────────────────────────

interface AppContextValue {
  account: DemoAccount;
  availableFunds: number;
  lockedTotal: number;
  isLoading: boolean;
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  doDeposit: (amount: number) => void;
  doAllocateEnvelope: (
    envelope: Omit<Envelope, "id" | "status" | "createdAt">
  ) => void;
  doConfirmPayment: (envelopeId: string) => void;
  doUpdateVaultSettings: (
    settings: Partial<DemoAccount["vaultSettings"]>
  ) => void;
  doReset: () => void;
  refreshStatuses: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount (client only)
  useEffect(() => {
    const loaded = loadAccount();
    // Refresh envelope statuses on load
    const refreshed = {
      ...loaded,
      envelopes: loaded.envelopes.map((e) => ({
        ...e,
        status: computeEnvelopeStatus(e),
      })),
    };
    setAccount(refreshed);
    setIsLoading(false);
  }, []);

  // Persist whenever account changes
  useEffect(() => {
    if (account) saveAccount(account);
  }, [account]);

  // Periodically refresh envelope statuses (every 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      setAccount((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          envelopes: prev.envelopes.map((e) => ({
            ...e,
            status: computeEnvelopeStatus(e),
          })),
        };
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const mutate = useCallback((updater: (prev: DemoAccount) => DemoAccount) => {
    setAccount((prev) => {
      if (!prev) return prev;
      return updater(prev);
    });
  }, []);

  const togglePrivacyMode = useCallback(() => {
    mutate((prev) => ({ ...prev, privacyMode: !prev.privacyMode }));
  }, [mutate]);

  const doDeposit = useCallback(
    (amount: number) => {
      mutate((prev) => applyDeposit(prev, amount, newTxId()));
    },
    [mutate]
  );

  const doAllocateEnvelope = useCallback(
    (envelope: Omit<Envelope, "id" | "status" | "createdAt">) => {
      mutate((prev) => allocateEnvelope(prev, envelope, newTxId()));
    },
    [mutate]
  );

  const doConfirmPayment = useCallback(
    (envelopeId: string) => {
      mutate((prev) => confirmPayment(prev, envelopeId, newTxId()));
    },
    [mutate]
  );

  const doUpdateVaultSettings = useCallback(
    (settings: Partial<DemoAccount["vaultSettings"]>) => {
      mutate((prev) => updateVaultSettings(prev, settings));
    },
    [mutate]
  );

  const doReset = useCallback(() => {
    const fresh = resetAccount();
    setAccount(fresh);
  }, []);

  const refreshStatuses = useCallback(() => {
    mutate((prev) => ({
      ...prev,
      envelopes: prev.envelopes.map((e) => ({
        ...e,
        status: computeEnvelopeStatus(e),
      })),
    }));
  }, [mutate]);

  // Show an animated splash screen until hydrated to avoid SSR mismatch
  if (isLoading || !account) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center gap-8 px-6">

        {/* ── Logo with pulse ring ── */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulse ring */}
          <span className="absolute w-32 h-32 rounded-full border border-[#BEF532]/20 animate-ping" />
          {/* Mid ring */}
          <span className="absolute w-24 h-24 rounded-full border border-[#BEF532]/10" />
          {/* Logo container */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(190,245,50,0.15)]">
            <Image
              src="/WiseHaven Logo.jpg"
              alt="WiseHaven"
              fill
              sizes="80px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* ── Brand name ── */}
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-white font-bold text-2xl tracking-tight"
              style={{ fontFamily: "Geist, Inter, sans-serif" }}>
            WiseHaven
          </h1>
          <p className="text-[#8D937B] text-xs uppercase tracking-[0.2em]"
             style={{ fontFamily: "Inter, sans-serif" }}>
            Give Every Franc a Purpose
          </p>
        </div>

        {/* ── Progress bar ── */}
        <div className="w-48 h-0.5 rounded-full bg-[#201f1f] overflow-hidden">
          <div className="h-full bg-[#BEF532] rounded-full origin-left animate-[loading-bar_1.4s_ease-in-out_infinite]" />
        </div>

        {/* ── Status label ── */}
        <p className="text-[#8D937B] text-[11px] uppercase tracking-[0.18em]"
           style={{ fontFamily: "Inter, sans-serif" }}>
          Initialising secure wallet…
        </p>

      </div>
    );
  }

  const availableFunds = computeAvailableFunds(account);
  const lockedTotal = computeLockedTotal(account);

  return (
    <AppContext.Provider
      value={{
        account,
        availableFunds,
        lockedTotal,
        isLoading,
        privacyMode: account.privacyMode,
        togglePrivacyMode,
        doDeposit,
        doAllocateEnvelope,
        doConfirmPayment,
        doUpdateVaultSettings,
        doReset,
        refreshStatuses,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
