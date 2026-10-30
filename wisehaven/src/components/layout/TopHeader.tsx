"use client";

import { Eye, EyeOff, Bell, Search, Plus, ArrowDownToLine } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function TopHeader() {
  const { privacyMode, togglePrivacyMode, state } = useApp();

  const envelopes = state.envelopes.filter((e) => !e.is_emergency_vault);
  const pendingCount = envelopes.filter(
    (e) => e.temporal_lock?.status === "RELEASED"
  ).length;

  return (
    <header
      className="fixed left-64 right-0 h-14 z-40 flex items-center justify-between px-6"
      style={{
        top: "32px", // offset below the 32px demo banner
        background: "rgba(10,10,10,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #242424",
      }}
    >
      {/* Search */}
      <div className="relative w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#808080" }} />
        <input
          className="w-full h-9 pl-9 pr-3 rounded-lg font-body-sm text-body-sm text-white placeholder:text-[#808080] focus:outline-none transition-all"
          style={{ background: "#171717", border: "1px solid #242424" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#bef532"; e.currentTarget.style.boxShadow = "0 0 0 1px #bef532, 0 0 8px rgba(190,245,50,0.12)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "#242424"; e.currentTarget.style.boxShadow = "none"; }}
          placeholder="Search envelopes, transactions…"
          type="text"
          aria-label="Search"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button onClick={togglePrivacyMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-colors"
          style={{ background: "transparent", color: "#808080", border: "1px solid #242424" }}
          title={privacyMode ? "Show figures" : "Hide figures"}
          aria-label={privacyMode ? "Show figures" : "Hide figures"}>
          {privacyMode ? <EyeOff size={14} /> : <Eye size={14} />}
          <span className="hidden md:inline">{privacyMode ? "Show" : "Privacy"}</span>
        </button>

        <Link href="/notifications"
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: "#808080" }}
          aria-label="Notifications">
          <Bell size={18} />
          {pendingCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#bef532", boxShadow: "0 0 6px rgba(190,245,50,0.6)" }} />
          )}
        </Link>

        <Link href="/deposit"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body-sm text-body-sm font-medium transition-colors"
          style={{ background: "#171717", color: "#b5b5b5", border: "1px solid #242424" }}>
          <ArrowDownToLine size={14} style={{ color: "#bef532" }} />Add Demo Money
        </Link>

        <Link href="/envelopes/new"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-body-sm text-body-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#bef532", color: "#000000" }}>
          <Plus size={14} />Allocate
        </Link>
      </div>
    </header>
  );
}
