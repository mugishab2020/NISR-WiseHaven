"use client";

// ============================================================
// WiseHaven — Global App State Context (Backend-Authoritative)
//
// Financial data comes from the FastAPI backend (PostgreSQL).
// localStorage is used ONLY for UI preferences (privacyMode).
// All demo balances are simulated — no real money involved.
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
import { useAuth } from "@clerk/nextjs";
import {
  walletApi,
  envelopeApi,
  transactionApi,
  notificationApi,
  type WalletResponse,
  type EnvelopeResponse,
  type TransactionResponse,
  type UserProfile,
  type BalanceResponse,
  type NotificationResponse,
  ApiError,
} from "@/lib/api";

// ── Types ──────────────────────────────────────────────────

export interface AppState {
  wallet: WalletResponse | null;
  envelopes: EnvelopeResponse[];
  transactions: TransactionResponse[];
  balances: BalanceResponse[];
  notifications: NotificationResponse[];
  unreadCount: number;
  userProfile: UserProfile | null;
  /** Available wallet balance (wallet.balance) */
  availableBalance: number;
  /** Sum of all envelope balances */
  totalInEnvelopes: number;
  /** Emergency vault balance */
  vaultBalance: number;
  /** Emergency vault envelope */
  vaultEnvelope: EnvelopeResponse | null;
}

interface AppContextValue {
  state: AppState;
  isLoading: boolean;
  /** True while a mutation is in flight */
  isMutating: boolean;
  error: string | null;
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  /** Re-fetch wallet + envelopes + transactions + notifications from backend */
  refresh: () => Promise<void>;
  /** Re-fetch notifications only (lightweight for badge polling) */
  refreshNotifications: () => Promise<void>;
  /** Clear the error state */
  clearError: () => void;
}

const EMPTY_STATE: AppState = {
  wallet: null,
  envelopes: [],
  transactions: [],
  balances: [],
  notifications: [],
  unreadCount: 0,
  userProfile: null,
  availableBalance: 0,
  totalInEnvelopes: 0,
  vaultBalance: 0,
  vaultEnvelope: null,
};

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded: clerkLoaded, isSignedIn } = useAuth();

  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Privacy mode lives in localStorage (pure UI preference, no financial data)
  const [privacyMode, setPrivacyMode] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("wisehaven_privacy_mode");
      if (stored === "true") setPrivacyMode(true);
    } catch {}
  }, []);
  const togglePrivacyMode = useCallback(() => {
    setPrivacyMode((prev) => {
      const next = !prev;
      try { localStorage.setItem("wisehaven_privacy_mode", String(next)); } catch {}
      return next;
    });
  }, []);

  // ── Data fetching ────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    if (!clerkLoaded || !isSignedIn) return;

    try {
      setError(null);
      const token = () => getToken();

      // Fetch in parallel
      const [walletRes, envelopesRes, txRes, balancesRes, notifRes] = await Promise.all([
        walletApi.getWallet(token),
        envelopeApi.list(token),
        transactionApi.list(token, { page_size: 50 }),
        transactionApi.balances(token),
        notificationApi.list(token, { limit: 50 }).catch(() => ({ notifications: [], total_count: 0, unread_count: 0 })),
      ]);

      const envelopes = envelopesRes.envelopes;
      const vaultEnvelope = envelopes.find((e) => e.is_emergency_vault) ?? null;
      const vaultBalance = vaultEnvelope ? Number(vaultEnvelope.balance) : 0;
      const totalInEnvelopes = envelopes
        .filter((e) => !e.is_emergency_vault)
        .reduce((s, e) => s + Number(e.balance), 0);

      setState({
        wallet: walletRes,
        envelopes,
        transactions: txRes.transactions,
        balances: balancesRes.balances,
        notifications: notifRes.notifications,
        unreadCount: notifRes.unread_count,
        userProfile: null, // fetched lazily in profile pages
        availableBalance: Number(walletRes.balance),
        totalInEnvelopes,
        vaultBalance,
        vaultEnvelope,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load data. Please refresh the page.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [clerkLoaded, isSignedIn, getToken]);

  /** Lightweight notification-only refresh used by the notifications page */
  const refreshNotifications = useCallback(async () => {
    if (!clerkLoaded || !isSignedIn) return;
    try {
      const token = () => getToken();
      const notifRes = await notificationApi.list(token, { limit: 50 });
      setState((prev) => ({
        ...prev,
        notifications: notifRes.notifications,
        unreadCount: notifRes.unread_count,
      }));
    } catch {
      // non-fatal — don't surface a global error for badge refresh
    }
  }, [clerkLoaded, isSignedIn, getToken]);

  // Initial load
  useEffect(() => {
    if (clerkLoaded && isSignedIn) {
      setIsLoading(true);
      fetchAll();
    } else if (clerkLoaded && !isSignedIn) {
      setIsLoading(false);
    }
  }, [clerkLoaded, isSignedIn, fetchAll]);

  const refresh = useCallback(async () => {
    setIsMutating(true);
    try {
      await fetchAll();
    } finally {
      setIsMutating(false);
    }
  }, [fetchAll]);

  const clearError = useCallback(() => setError(null), []);

  // ── Loading splash ───────────────────────────────────────
  // Show the splash whenever:
  //   1. Clerk hasn't initialised yet (SSR / first paint)
  //   2. User is signed in but we don't have wallet data yet
  //      (still fetching OR fetch failed before wallet was populated)
  // We deliberately do NOT show the splash when the user is not signed in —
  // the Clerk middleware will redirect them to /sign-in before any app page
  // is served, so that case is handled externally.

  const waitingForData = isSignedIn && !state.wallet;
  if (!clerkLoaded || waitingForData) {
    // If we have an error and no wallet data, show an error screen instead
    // of spinning forever so users know the backend is unreachable.
    if (clerkLoaded && isSignedIn && !isLoading && error) {
      return (
        <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,180,171,0.12)", border: "1px solid rgba(255,180,171,0.25)" }}>
            <span className="text-[22px]">⚠</span>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-white font-semibold text-lg" style={{ fontFamily: "Geist, sans-serif" }}>
              Could not load your wallet
            </h2>
            <p className="text-[13px] max-w-xs" style={{ color: "#b5b5b5" }}>{error}</p>
          </div>
          <button
            onClick={() => { clearError(); fetchAll(); }}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
            style={{ background: "#BEF532", color: "#000" }}
          >
            Retry
          </button>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center gap-8 px-6">
        <div className="relative flex items-center justify-center">
          <span className="absolute w-32 h-32 rounded-full border border-[#BEF532]/20 animate-ping" />
          <span className="absolute w-24 h-24 rounded-full border border-[#BEF532]/10" />
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
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-white font-bold text-2xl tracking-tight" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
            WiseHaven
          </h1>
          <p className="text-[#8D937B] text-xs uppercase tracking-[0.2em]" style={{ fontFamily: "Inter, sans-serif" }}>
            Give Every Franc a Purpose
          </p>
        </div>
        <div className="w-48 h-0.5 rounded-full bg-[#201f1f] overflow-hidden">
          <div className="h-full bg-[#BEF532] rounded-full origin-left animate-[loading-bar_1.4s_ease-in-out_infinite]" />
        </div>
        <p className="text-[#8D937B] text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: "Inter, sans-serif" }}>
          Loading your demo wallet…
        </p>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        state,
        isLoading,
        isMutating,
        error,
        privacyMode,
        togglePrivacyMode,
        refresh,
        refreshNotifications,
        clearError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  // Guard: ensure state is never undefined (defensive against hot-reload
  // or SSR hydration edge cases where context value may be partially stale)
  if (ctx.state === undefined) {
    return { ...ctx, state: EMPTY_STATE };
  }
  return ctx;
}
