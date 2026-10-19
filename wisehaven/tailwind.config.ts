import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Core canvas & surfaces ────────────────────────
        surface: "#0a0a0a",                    // absolute canvas
        "surface-dim": "#0a0a0a",
        "surface-bright": "#2a2a2a",
        "surface-container-lowest": "#000000", // pure black for hero cards
        "surface-container-low": "#101010",    // sidebar / nav
        "surface-container": "#171717",        // cards, envelope modules
        "surface-container-high": "#202020",   // modals, overlays, inputs
        "surface-container-highest": "#2a2a2a",// hover surfaces

        // ── Borders ───────────────────────────────────────
        "border-hairline": "#242424",          // structural 1px borders
        "border-interactive": "#303030",       // hover / focus borders
        outline: "#808080",                    // muted text / timestamps
        "outline-variant": "#3a3a3a",

        // ── Text ──────────────────────────────────────────
        "on-surface": "#ffffff",               // primary text
        "on-surface-variant": "#b5b5b5",       // secondary text
        "inverse-surface": "#e5e2e1",
        "inverse-on-surface": "#313030",

        // ── Primary — Electric Lime ────────────────────────
        primary: "#ffffff",
        "on-primary": "#000000",
        "primary-container": "#bef532",        // lime CTA bg
        "on-primary-container": "#000000",
        "inverse-primary": "#4c6700",
        "primary-fixed": "#bef532",            // lime accent
        "primary-fixed-dim": "#a3d800",
        "on-primary-fixed": "#000000",
        "on-primary-fixed-variant": "#1a2600",
        "surface-tint": "#a3d800",

        // ── Amber — Unlocking Soon ─────────────────────────
        amber: "#ffb800",
        "amber-dim": "#e6a600",
        "amber-container": "rgba(255,184,0,0.10)",
        "on-amber": "#000000",

        // ── Secondary ─────────────────────────────────────
        secondary: "#b5b5b5",
        "on-secondary": "#1a1a1a",
        "secondary-container": "#2a2a2a",
        "on-secondary-container": "#b5b5b5",
        "secondary-fixed": "#e5e2e1",
        "secondary-fixed-dim": "#c8c6c5",
        "on-secondary-fixed": "#1b1c1c",
        "on-secondary-fixed-variant": "#474746",

        // ── Tertiary ──────────────────────────────────────
        tertiary: "#ffffff",
        "on-tertiary": "#303030",
        "tertiary-container": "#e4e2e1",
        "on-tertiary-container": "#656464",
        "tertiary-fixed": "#e4e2e1",
        "tertiary-fixed-dim": "#c8c6c6",
        "on-tertiary-fixed": "#1b1c1c",
        "on-tertiary-fixed-variant": "#474747",

        // ── Error ─────────────────────────────────────────
        error: "#ff6b6b",
        "on-error": "#ffffff",
        "error-container": "rgba(255,68,68,0.10)",
        "on-error-container": "#ff6b6b",

        // ── Background ────────────────────────────────────
        background: "#0a0a0a",
        "on-background": "#ffffff",
        "surface-variant": "#242424",
      },

      borderRadius: {
        DEFAULT: "0.25rem",   // 4px  — badges, mini elements
        sm: "0.125rem",       // 2px
        md: "0.375rem",       // 6px
        lg: "0.5rem",         // 8px  — buttons, inputs, chips
        xl: "0.75rem",        // 12px — cards, modals
        "2xl": "1rem",        // 16px — hero cards
        full: "9999px",       // pills
      },

      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        gutter: "1.5rem",
        "gutter-mobile": "1rem",
        margin: "2rem",
        "margin-mobile": "1rem",
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        geist: ["Geist", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        "jetbrains-mono": ["JetBrains Mono", "monospace"],
        "body-sm": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-sm": ["Geist", "sans-serif"],
        "headline-md": ["Geist", "sans-serif"],
        "headline-lg": ["Geist", "sans-serif"],
        "headline-xl": ["Geist", "sans-serif"],
        "headline-lg-mobile": ["Geist", "sans-serif"],
        "headline-xl-mobile": ["Geist", "sans-serif"],
        "label-sm": ["JetBrains Mono", "monospace"],
        "label-md": ["JetBrains Mono", "monospace"],
        "label-lg": ["JetBrains Mono", "monospace"],
      },

      fontSize: {
        "body-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "500" }],
        "headline-md": ["22px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "500" }],
        "headline-lg": ["30px", { lineHeight: "38px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-xl-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "label-sm": ["10px", { lineHeight: "14px", letterSpacing: "0.05em", fontWeight: "500" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "500" }],
        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "500" }],
      },

      boxShadow: {
        // Lime glow — hover on cards
        "glow-lime": "0 0 24px rgba(190,245,50,0.06)",
        "glow-lime-md": "0 0 32px rgba(190,245,50,0.10)",
        "glow-lime-lg": "0 0 48px rgba(190,245,50,0.15)",
        // Amber glow — unlocking soon
        "glow-amber": "0 0 24px rgba(255,184,0,0.08)",
        // Modal shadow
        "overlay": "0 20px 40px rgba(0,0,0,0.80)",
        // Card elevation
        "card": "0 1px 3px rgba(0,0,0,0.40)",
      },
    },
  },
  plugins: [],
};

export default config;
