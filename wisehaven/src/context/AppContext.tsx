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

  // Show a loading skeleton until hydrated to avoid SSR mismatch
  if (isLoading || !account) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin" />
          <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
            Loading WiseHaven…
          </span>
        </div>
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
