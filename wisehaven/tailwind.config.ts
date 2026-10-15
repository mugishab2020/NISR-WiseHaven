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
        // Core surfaces
        surface: "#131313",
        "surface-dim": "#131313",
        "surface-bright": "#3a3939",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1c1b1b",
        "surface-container": "#201f1f",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353534",
        // Text
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#c3c9ae",
        "inverse-surface": "#e5e2e1",
        "inverse-on-surface": "#313030",
        // Borders
        outline: "#8d937b",
        "outline-variant": "#434934",
        // Primary (lime accent)
        primary: "#ffffff",
        "on-primary": "#263500",
        "primary-container": "#bef532",
        "on-primary-container": "#516d00",
        "inverse-primary": "#4c6700",
        "primary-fixed": "#bef532",
        "primary-fixed-dim": "#a3d800",
        "on-primary-fixed": "#151f00",
        "on-primary-fixed-variant": "#394d00",
        "surface-tint": "#a3d800",
        // Secondary
        secondary: "#c8c6c5",
        "on-secondary": "#303030",
        "secondary-container": "#474746",
        "on-secondary-container": "#b7b5b4",
        "secondary-fixed": "#e5e2e1",
        "secondary-fixed-dim": "#c8c6c5",
        "on-secondary-fixed": "#1b1c1c",
        "on-secondary-fixed-variant": "#474746",
        // Tertiary
        tertiary: "#ffffff",
        "on-tertiary": "#303030",
        "tertiary-container": "#e4e2e1",
        "on-tertiary-container": "#656464",
        "tertiary-fixed": "#e4e2e1",
        "tertiary-fixed-dim": "#c8c6c6",
        "on-tertiary-fixed": "#1b1c1c",
        "on-tertiary-fixed-variant": "#474747",
        // Error
        error: "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        // Background
        background: "#131313",
        "on-background": "#e5e2e1",
        "surface-variant": "#353534",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        sm: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        "2xl": "0.75rem",
        full: "9999px",
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
        "headline-md": [
          "22px",
          { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "500" },
        ],
        "headline-lg": [
          "30px",
          { lineHeight: "38px", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        "headline-xl": [
          "40px",
          { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        "headline-lg-mobile": [
          "24px",
          { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        "headline-xl-mobile": [
          "32px",
          { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        "label-sm": [
          "10px",
          { lineHeight: "14px", letterSpacing: "0.05em", fontWeight: "500" },
        ],
        "label-md": [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "500" },
        ],
        "label-lg": [
          "14px",
          { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "500" },
        ],
      },
    },
  },
  plugins: [],
};

export default config;
