---
name: Disciplined Precision Dark
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c3c9ae'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8d937b'
  outline-variant: '#434934'
  surface-tint: '#a3d800'
  primary: '#ffffff'
  on-primary: '#263500'
  primary-container: '#bef532'
  on-primary-container: '#516d00'
  inverse-primary: '#4c6700'
  secondary: '#c8c6c5'
  on-secondary: '#303030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#303030'
  tertiary-container: '#e4e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#bef532'
  primary-fixed-dim: '#a3d800'
  on-primary-fixed: '#151f00'
  on-primary-fixed-variant: '#394d00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The visual identity is anchored in disciplined capital preservation, intelligent automation, and financial calm. Developed for the Rwandan digital financial ecosystem, it projects institutional security, architectural clarity, and empowering modern fintech aesthetics. 

The aesthetic is a high-precision, technical dark mode blending strict minimalism with subtle ambient depth. A deep pitch-black environment eliminates visual distraction, elevating focused user deliberation. High-contrast Electric Lime accents punctuate critical milestones, lock states, and progression metrics, creating an unmistakable, luminous focal point against layered industrial surfaces.

## Colors

The palette leverages a technical deep-black base paired with a hyper-vibrant Electric Lime signature accent.

- **Background Canvas**: `#000000` serves as the absolute baseline.
- **Surface Hierarchy**:
  - Primary Surface: `#101010` (Sidebar, persistent navigation containers)
  - Secondary Surface: `#171717` (Cards, envelope modules, structural sections)
  - Elevated Surface: `#202020` (Modals, popovers, active overlays)
  - Input Background: `#141414` (Form controls, currency entry fields)
  - Disabled Surface: `#191919` (Inactive states, locked non-interactive containers)
- **Border & Hairline Geometry**:
  - Structural Border: `#242424` (Separators, section boundaries)
  - Interactive / Highlight Border: `#303030` (Card outlines, hover states)
- **Text Layers**:
  - Primary Text: `#FFFFFF` (High emphasis headlines, critical numeric metrics)
  - Secondary Text: `#B5B5B5` (Labels, supporting body copy, helper descriptions)
  - Muted Text: `#808080` (Timestamps, lock metadata, non-critical units)
- **Semantic Lock Statuses**:
  - *Locked*: `#BEF532` glyphs over `rgba(190, 245, 50, 0.08)` fill with `#242424` container structure.
  - *Unlocking Soon*: Amber-gold tone `#FFB800` indicator for envelopes within a 48-hour release horizon.
  - *Ready to Pay*: Electric Lime `#BEF532` solid badge with jet black typography.
  - *Completed*: Subtle muted state with `#808080` text and `#202020` base.

## Typography

Typography establishes an engineering-grade financial hierarchy. 

- **Geist** handles display and headline roles, delivering clean tracking and structural balance.
- **Inter** supports long-form descriptions, instruction prompts, and account contexts, ensuring maximum legibility at compact sizes.
- **JetBrains Mono** governs numeric metrics, lock timers, timestamps, account hashes, and currency amounts in Rwandan Francs (RWF). Tabular figures (`tnum`) and slashed zeros (`zero`) must be enforced globally for all monetary readouts to preserve strict column alignment across ledger tables and cards.

## Layout & Spacing

The layout is built on a responsive 12-column grid system designed around a persistent structural sidebar on desktop and bottom-sheet touch execution on mobile.

- **Desktop (>= 1200px)**: 12-column fluid grid. A fixed 260px navigation sidebar anchors to `#101010` on the left, while the central canvas adheres to a maximum content width of 1440px with a 32px (`2rem`) outer margin and 24px (`1.5rem`) gutters.
- **Tablet (768px - 1199px)**: Collapses the sidebar to an 80px rail, adjusting outer margin to 24px (`1.5rem`) and column count to 8.
- **Mobile (< 768px)**: 4-column layout with 16px (`1rem`) outer margins and 16px (`1rem`) gutters. Desktop navigation transitions to a fixed high-contrast bottom navigation bar and draggable bottom sheets for envelope interactions.

Density follows an intentional 4px base rhythm. Metrics, countdown timers, and financial headers favor tight spatial alignment with deliberate empty gutters between card systems.

## Elevation & Depth

Depth is established through low-contrast border definition and strict surface-container tiers rather than heavy visual drop shadows.

- **Level 0 (Canvas)**: Background canvas (`#000000`).
- **Level 1 (Cards & Primary Panels)**: Background `#171717` bordered by a 1px solid `#242424` outline. Zero blur shadows.
- **Level 2 (Interactive Modules & Hovered Envelopes)**: Background `#202020` bordered by `#303030`. Subtle radial Electric Lime back-glow (`0 0 24px rgba(190, 245, 50, 0.04)`) on hover or selected states.
- **Level 3 (Modals, Overlays & Drawers)**: Surface `#202020` bordered by `#303030` accompanied by an ambient occluding shadow (`0 20px 40px rgba(0, 0, 0, 0.8)`).
- **Glassmorphism Rule**: Limited strictly to sticky sub-navigation bars and contextual action floating headers (`rgba(16, 16, 16, 0.85)` with `16px` backdrop-blur and 1px border `#242424`).

## Shapes

The platform adopts a soft-geometry standard (`roundedness: 1`), conveying structural integrity, technical precision, and modern software design.

- **Base Radius (0.25rem / 4px)**: Checkboxes, inline code badges, mini progress segments, status indicators.
- **Container Radius (0.5rem / 8px)**: Standard buttons, input text fields, filter chips, dropdown menus.
- **Surface Radius (0.75rem / 12px)**: Envelope cards, metrics containers, transaction rows, modal dialogs.
- **Full Pill (`9999px`)**: Status pills (Locked, Unlocking, Ready), step index markers, active tab indicators.

## Components

### Buttons
- **Primary**: Solid Electric Lime (`#BEF532`) background, deep black text (`#000000`), weight 600. Focus ring: 2px offset with `#BEF532`. Hover state: 90% opacity.
- **Secondary**: Surface `#202020`, 1px border `#303030`, white text (`#FFFFFF`). Hover state: border color changes to `#B5B5B5`.
- **Destructive / Emergency Unlock**: Background `rgba(255, 68, 68, 0.1)`, border `rgba(255, 68, 68, 0.3)`, text `#FF6B6B`.

### Envelope Cards
- Composed on `#171717` with a 1px `#242424` border. Includes:
  - Top slot: Envelope moniker with category tag and lock icon.
  - Center slot: Large tabular RWF balance (e.g., `RWF 450,000`) styled with `headline-md` and `JetBrains Mono`.
  - Bottom slot: Time-lock countdown indicator featuring a monospace timer (`14d : 08h : 42m`) alongside a 4px high segmented lock progress track using `#BEF532` for locked duration and `#242424` for remaining.

### Financial Summary Cards
- Surfaces rendered in `#171717`. Labels in `#808080` uppercase with `label-sm`. Currency values set in tabular figures (`headline-lg` on desktop, `headline-lg-mobile` on mobile). Delta trends display positive gains in `#BEF532` with directional micro-arrows.

### Chips & Badges
- **Status Badges**: Capsule-shaped (`9999px`), padding `2px 8px`.
  - *Locked*: Background `rgba(190, 245, 50, 0.1)`, text `#BEF532`, 1px border `rgba(190, 245, 50, 0.2)`.
  - *Unlocking*: Background `rgba(255, 184, 0, 0.1)`, text `#FFB800`, 1px border `rgba(255, 184, 0, 0.2)`.
  - *Ready*: Solid `#BEF532`, text `#000000`.

### Form Inputs & Currency Fields
- Background `#141414`, border 1px solid `#242424`, height 48px, text `#FFFFFF`. Placeholder in `#808080`.
- On focus: Border transitions to `#BEF532` with a subtle `0 0 0 1px #BEF532` glow ring. Integrated RWF currency affix anchored to the right in `JetBrains Mono`.

### Stepper Indicators
- Visual lock configuration flows (e.g., Time selection, Release triggers, Guardian setup):
  - Numbered 24px circular nodes connected by a 2px hairline (`#242424`).
  - Active steps use `#BEF532` background with `#000000` text; completed steps transition to `#171717` with `#BEF532` checkmarks.

### Transaction History Rows
- Interactive list elements set on `#101010` with bottom border `#1A1A1A`. 
- Left slot: Directional icon inside a 36px `#171717` container.
- Center slot: Counterparty / purpose description in `body-md` white with timestamp in `body-sm` muted `#808080`.
- Right slot: Net RWF movement aligned via tabular numerals (`JetBrains Mono`).

### Emergency Vault Progress
- Radial or horizontal meter displaying locked-to-liquid liquidity ratios. Background track `#202020`, foreground value fill `#BEF532`, with unlock penalty indicator displayed in `#FF6B6B`.