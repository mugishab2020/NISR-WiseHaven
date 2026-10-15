"use client";

import { Eye, EyeOff, Bell, Search, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function TopHeader() {
  const { privacyMode, togglePrivacyMode } = useApp();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/85 backdrop-blur-xl z-40 px-gutter flex items-center justify-between border-b border-surface-container">
      {/* Search */}
      <div className="flex items-center gap-space-md w-96">
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            className="w-full h-10 pl-9 pr-3 rounded bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary-fixed transition-all"
            placeholder="Search envelopes, transactions…"
            type="text"
            aria-label="Search"
          />
        </div>
        <span className="hidden xl:inline-flex items-center px-2 py-1 rounded bg-surface-container font-label-sm text-label-sm text-outline whitespace-nowrap">
          Africa/Kigali
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-space-md">
        {/* Privacy toggle */}
        <button
          onClick={togglePrivacyMode}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          title={privacyMode ? "Show figures" : "Hide sensitive figures"}
          aria-label={privacyMode ? "Show figures" : "Hide figures"}
        >
          {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
          <span className="font-label-sm text-label-sm hidden md:inline">
            {privacyMode ? "Show" : "Privacy Mode"}
          </span>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-fixed" />
        </button>

        {/* Quick CTAs */}
        <div className="flex items-center gap-space-sm">
          <Link
            href="/deposit"
            className="px-space-md py-2 rounded bg-surface-container text-on-surface font-body-md text-body-md hover:bg-surface-container-high transition-colors flex items-center gap-1"
          >
            <Plus size={14} />
            Add Money
          </Link>
          <Link
            href="/envelopes/new"
            className="px-space-md py-2 rounded bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:opacity-90 transition-opacity"
          >
            Allocate Income
          </Link>
        </div>
      </div>
    </header>
  );
}
