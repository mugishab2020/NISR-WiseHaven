"use client";

import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import BottomNav from "./BottomNav";
import DemoModeBanner from "@/components/ui/DemoModeBanner";
import { useApp } from "@/context/AppContext";
import { AlertCircle, X, RefreshCw } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { privacyMode, togglePrivacyMode, error, clearError, refresh, isLoading } = useApp();

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Demo mode banner — always visible on authenticated pages */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <DemoModeBanner />
      </div>

      {/* Desktop sidebar (offset below banner) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Desktop top header */}
      <div className="hidden lg:block">
        <TopHeader />
      </div>

      {/* Mobile top bar */}
      <header
        className="lg:hidden fixed left-0 right-0 z-40 h-14 flex items-center justify-between px-4"
        style={{
          top: "32px", // below the 32px demo banner
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid #242424",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 flex items-center justify-center font-bold text-xs font-geist"
            style={{ background: "#bef532", color: "#000000", borderRadius: "7px 7px 7px 2px" }}
          >
            W
          </div>
          <span className="font-geist font-semibold text-[16px] tracking-tight text-white">
            WiseHaven
          </span>
          <span
            className="px-1.5 py-0.5 rounded font-label-sm text-[9px] font-semibold"
            style={{ background: "rgba(190,245,50,0.12)", color: "#bef532" }}
          >
            DEMO
          </span>
        </div>
        <button
          onClick={togglePrivacyMode}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "#808080", border: "1px solid #242424" }}
          aria-label={privacyMode ? "Show figures" : "Hide figures"}
        >
          <span className="text-[11px] font-mono">{privacyMode ? "SHOW" : "HIDE"}</span>
        </button>
      </header>

      {/* Global error toast */}
      {error && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl max-w-sm w-full mx-4"
          style={{
            top: "48px",
            background: "#1a0a0a",
            border: "1px solid rgba(255,107,107,0.3)",
          }}
          role="alert"
        >
          <AlertCircle size={16} style={{ color: "#ff6b6b", flexShrink: 0 }} />
          <p className="font-body-sm text-body-sm flex-1" style={{ color: "#ffb4ab" }}>
            {error}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { clearError(); refresh(); }}
              className="p-1 rounded transition-colors"
              style={{ color: "#808080" }}
              aria-label="Retry"
            >
              <RefreshCw size={13} />
            </button>
            <button
              onClick={clearError}
              className="p-1 rounded transition-colors"
              style={{ color: "#808080" }}
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Main content — offset top by banner (≈32px) + header (56px on mobile, 56px desktop) */}
      <main className="min-h-screen lg:pl-64 lg:pt-[calc(56px+32px)] pt-[calc(56px+32px)] pb-20 lg:pb-0">
        <div className="w-full px-4 lg:px-6 py-5 lg:py-6 max-w-[1440px]">
          {/* Loading overlay while refreshing */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#bef532", borderTopColor: "transparent" }}
              />
            </div>
          )}
          {!isLoading && children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
