"use client";

import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import BottomNav from "./BottomNav";
import { useApp } from "@/context/AppContext";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { privacyMode, togglePrivacyMode } = useApp();

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Desktop top header */}
      <div className="hidden lg:block">
        <TopHeader />
      </div>

      {/* Mobile top bar */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 pt-safe"
        style={{
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
            RW
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

      {/* Main content */}
      <main className="min-h-screen lg:pl-64 lg:pt-14 pt-14 pb-20 lg:pb-0">
        <div className="w-full px-4 lg:px-6 py-5 lg:py-6 max-w-[1440px]">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
