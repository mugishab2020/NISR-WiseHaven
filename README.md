# WiseHaven — Give Every Franc a Purpose

> **WiseHaven** is a smart, commitment-driven digital envelope budgeting wallet built for the Rwandan economic landscape. It converts passive budgeting intentions into active software enforcement — transforming lump-sum income into purpose-locked allocations that cannot be accessed before their maturity date.

![WiseHaven — Dark fintech UI, lime accent](https://img.shields.io/badge/WiseHaven-v0.1.0--demo-BEF532?style=for-the-badge&labelColor=000000&color=BEF532)
![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-06B6D4?style=for-the-badge&logo=tailwindcss)
![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Features](#3-features)
4. [Screenshots & Design System](#4-screenshots--design-system)
5. [Architecture](#5-architecture)
6. [Tech Stack](#6-tech-stack)
7. [Getting Started](#7-getting-started)
8. [Project Structure](#8-project-structure)
9. [Demo Data & Financial Model](#9-demo-data--financial-model)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Roadmap](#11-roadmap)
12. [Strategic Impact](#12-strategic-impact)
13. [Contributing](#13-contributing)
14. [License](#14-license)

---

## 1. Project Overview

WiseHaven acts as an **automated behavioral commitment device**. Rather than functioning as a standard liquid wallet where money can be spent at any time, it allows users to pre-allocate lump-sum earnings — salaries, harvest payouts, or business revenues — into categorized **Envelopes** (e.g., Rent, Food, Utilities, Education) bound by programmatic temporal locks.

Funds locked within an envelope cannot be withdrawn or diverted for impulse spending prior to maturity. On the designated release date, the envelope unlocks, notifies the user, and presents a notification-gated payment interface. The user then inputs or verifies the target recipient details — such as a landlord's MoMo Merchant code, EUCL meter number, or WASAC bill ID — and authorizes the transfer directly from the unlocked envelope.

```
Income Arrives
      │
      ▼
┌─────────────────────────┐
│  Emergency Vault Sweep  │  ← 10% auto-deducted first (configurable)
│  (Pay Yourself First)   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Envelope Allocation   │  ← User splits remaining income into
│   (Pre-commitment)      │    named, time-locked containers
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Temporal Lock Phase   │  ← Funds frozen until maturity date
│   (No early access)     │    Envelope status: Locked → Unlocking → Ready
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Notification-Gated     │  ← User reviews, confirms recipient details,
│  Payment Authorisation  │    and initiates the payment on release
└─────────────────────────┘
```

**This milestone** is a functional browser prototype using **simulated money only**. No real deposits, withdrawals, Mobile Money transactions, or real financial custody occur.

---

## 2. Problem Statement

Data from the **Rwanda FinScope 2020 Survey** reveals severe structural challenges in household cash-flow management across both urban and rural populations:

| Statistic | Finding | Source |
|---|---|---|
| Mid-month liquidity collapse | **51.9%** of adults run out of money for basic expenses before month-end | H3 |
| No consistent budgeting | **58.4%** do not maintain monthly budget tracking | EF7 |
| Distress borrowing | **60.2%** borrowed in the past 12 months | H2A |
| Borrowed for food/bills | **30.3%** borrowed specifically to buy food or pay overdue bills | H1_3, H1_5 |
| Zero emergency savings | **55.1%** maintain no emergency savings reserve | EF9 |

WiseHaven addresses each of these directly by converting passive budgeting advice into active software enforcement:

- **51.9% liquidity collapse** → Temporal locks prevent early-month over-spending of bill allocations
- **58.4% no budgeting** → Forced pre-commitment at income deposit time, eliminating "mental accounting" drift
- **60.2% distress borrowing** → Guaranteed bill funds cannot be raided before due dates
- **55.1% no emergency savings** → Automated first-sweep vault builds reserves without requiring manual discipline

---

## 3. Features

### ✦ Feature 1 — Smart Envelope Budgeting & Income Split

Upon income receipt, the system prompts the user (via USSD or Mobile App) to configure an allocation plan. Income is distributed across customizable expense containers (e.g., 50,000 RWF for Rent, 20,000 RWF for Internet/Utilities, 60,000 RWF for Food).

Each envelope carries:
- A **locked allocation amount** in Rwandan Francs (RWF)
- A **maturity date** after which payment is permitted
- A **designated recipient** (landlord MoMo code, EUCL meter, WASAC bill ID, or school portal)
- A real-time **lock progress tracker** showing elapsed time toward maturity

**Behavioral purpose:** Forces pre-commitment when liquidity is highest, eliminating the mental-accounting drift that leads to early-month overspending.

### ✦ Feature 2 — Programmatic Temporal Locks & Notification-Gated Disbursement

Three lock states enforce behavioural commitment:

| Status | Meaning | UI Behaviour |
|---|---|---|
| 🔒 **Locked** | Maturity date not yet reached | Payment action disabled; countdown shown |
| ⚡ **Unlocking Soon** | Maturity within 48 hours | Amber alert, animated badge, prepare payment CTA |
| ✅ **Ready to Pay** | Maturity date passed | Green CTA activated; user confirms payment |
| ✓ **Paid** | Simulated payment confirmed | Archived with timestamp |

The disbursement flow:
1. **Lock Phase** — Each envelope is bound by a strict maturity timestamp. The backend strictly blocks early micro-withdrawals.
2. **Release & Alert** — On the exact release date, the envelope unlocks and triggers an instant SMS or Push Notification.
3. **User-Initiated Payment** — The user taps "Pay Bill", enters or confirms merchant details, and approves the payment.

**Behavioral purpose:** Neutralizes present bias and impulse spending prior to the due date, while preserving user control, verification accuracy, and agency at payout time.

### ✦ Feature 3 — Automated "First-Sweep" Emergency Reserve Vault

Before any envelope allocation, the wallet enforces an automated **Pay Yourself First** rule by sweeping a configurable percentage (default **10%**, range 5–20%) of each deposit into a protected Emergency Vault. This vault:

- Is **non-spendable** for routine expenses
- Requires **two-step confirmation** to unlock
- Tracks progress toward a user-set savings target (default **100,000 RWF**)
- Earns future real yield when connected to a regulated savings partner (roadmap)

**Behavioral purpose:** Systematically builds liquid household buffer reserves without requiring manual user discipline, directly addressing the national emergency savings deficit.

### ✦ Feature 4 — Simulated Deposit Flow

Users can add demo money and observe the full allocation lifecycle:

1. Enter amount → preview vault sweep → review remaining → confirm
2. Activity ledger records every operation
3. All balances update atomically from a single source of truth

### ✦ Feature 5 — Privacy Mode

One-tap toggle masks all financial figures with `••••••` for screen privacy.

### ✦ Feature 6 — Demo Reset

A clearly labelled "Reset Demo Data" action in Settings restores original seed state after confirmation.

---

## 4. Screenshots & Design System

The UI is implemented from Google Stitch high-fidelity prototypes located in:

```
stitch_finlock_budgeting_app_design_system/
├── disciplined_precision_dark/       ← Full design token specification
├── finlock_overview_dashboard/       ← Desktop dashboard reference
├── finlock_overview_dashboard_refined_desktop/
├── finlock_overview_dashboard_mobile/
├── finlock_envelopes_overview/       ← Envelopes list reference
├── finlock_emergency_vault_1/        ← Vault page reference
├── finlock_emergency_vault_2/
├── finlock_digital_vault_financial_planning/
└── finlock_authentication/           ← Auth screen reference (future)
```

**Design identity:**

| Token | Value |
|---|---|
| Background | `#000000` / `#131313` |
| Primary Accent (Electric Lime) | `#BEF532` |
| Primary Text | `#FFFFFF` |
| Secondary Text | `#C8C6C5` |
| Muted / Outline | `#8D937B` |
| Error | `#FFB4AB` |
| Headline font | Geist |
| Body font | Inter |
| Numeric / Label font | JetBrains Mono (tabular figures, slashed zeros) |

---

## 5. Architecture

### Current prototype (this repo)

```
Browser
  └── Next.js 14 App Router (TypeScript, Tailwind CSS)
        ├── AppContext (React Context + localStorage)
        ├── Immutable state mutations (store.ts)
        ├── Financial validation layer (validation.ts)
        ├── Currency & date utilities (currency.ts, dates.ts)
        └── No external services — all simulated
```

### Production target architecture

```
+-------------------------------------------------------------------------+
|                     User Interfaces & Access Points                     |
|     - USSD Gateway (*182*...#) for Feature Phones (Rural / Offline)     |
|     - React Native / Mobile App for Smartphones (Urban / Internet)      |
|     - Next.js PWA (web)                                                 |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                   Core Backend Engine (FastAPI / Python)                |
|  - Envelope Allocation & Logic Controller                               |
|  - Temporal Lock Engine (Timestamp Verification & Freeze Enforcement)  |
|  - Emergency First-Sweep Rule Processor                                 |
|  - Celery + Redis task queue for maturity monitoring & notifications    |
|  - Audit Ledger & Reconciliation Engine                                 |
+------------------------------------+------------------------------------+
                                     |
        +----------------------------+----------------------------+
        |                                                         |
        v                                                         v
+----------------------------------+      +-----------------------------------+
| PostgreSQL / Supabase Data Store |      | Telco / MoMo API Gateway          |
| - Ledger & Ledger Auditing       |      | (MTN Rwanda / Airtel Money)        |
| - User Lock Schedules & Payees   |      | - Notification & SMS Push Gateway  |
| - Payee Registry                 |      | - On-Demand MoMo Merchant Payouts  |
+----------------------------------+      | - EUCL / WASAC bill APIs           |
                                          +-----------------------------------+
                                                        |
                                          +-----------------------------------+
                                          | Regulated Escrow                  |
                                          | (SACCO / Commercial Bank vault)   |
                                          | Locked fund custody + micro-yield |
                                          +-----------------------------------+
```

**Planned integrations:**
- **MTN MoMo API** / **Airtel Money API** — disbursement on envelope maturity
- **Africa's Talking** — USSD gateway (`*182*...#`) for feature-phone access (rural coverage)
- **REG / EUCL API** — direct Cashpower top-up on unlock
- **WASAC** — water bill direct payment
- **BNR Open Banking** — regulatory reporting and compliance

**Security & Escrow:** Locked funds are held in regulated partner trust accounts (SACCO or commercial bank escrow vaults), earning micro-yields while preventing unauthorized early access.

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 with custom design tokens |
| Icons | Lucide React |
| State | React Context + localStorage |
| Fonts | Geist · Inter · JetBrains Mono (Google Fonts) |
| Linting | ESLint (next/core-web-vitals) |
| Type checking | TypeScript `tsc --noEmit` |
| CI/CD | GitHub Actions |
| Hosting (planned) | Vercel (preview) / AWS (production) |

---

## 7. Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# Clone the repository
git clone git@github.com:mugishab2020/NISR-WiseHaven.git
cd NISR-WiseHaven/wisehaven

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available commands

```bash
npm run dev        # Development server with hot reload
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npx tsc --noEmit   # TypeScript type check
```

### Demo account

The app loads with a pre-seeded demo account (no sign-in required):

| Item | Value |
|---|---|
| Total funds | 250,000 RWF |
| Emergency Vault | 25,000 RWF |
| Rent envelope | 100,000 RWF · matures in 9 days |
| Food envelope | 20,000 RWF · matures in 3 days |
| Utilities envelope | 15,000 RWF · unlocking soon (1 day) |
| Education envelope | 25,000 RWF · matures in 14 days |
| Available (unallocated) | 65,000 RWF |

> ⚠️ **All figures are simulated demo data.** No real money exists or is at risk.

To reset the demo back to defaults: **Settings → Reset Demo Data**.

---

## 8. Project Structure

```
NISR-WiseHaven/
├── wisehaven/                          ← Next.js application
│   ├── src/
│   │   ├── app/                        ← App Router pages
│   │   │   ├── page.tsx                ← Dashboard (/)
│   │   │   ├── layout.tsx              ← Root layout + providers
│   │   │   ├── globals.css             ← Tailwind + design tokens
│   │   │   ├── envelopes/
│   │   │   │   ├── page.tsx            ← Envelope list (/envelopes)
│   │   │   │   ├── new/page.tsx        ← Create envelope (/envelopes/new)
│   │   │   │   └── [id]/page.tsx       ← Envelope detail (/envelopes/:id)
│   │   │   ├── vault/page.tsx          ← Emergency Vault (/vault)
│   │   │   ├── deposit/page.tsx        ← Add money (/deposit)
│   │   │   ├── activity/page.tsx       ← Transaction history (/activity)
│   │   │   ├── notifications/page.tsx  ← Alerts (/notifications)
│   │   │   └── settings/page.tsx       ← Settings + reset (/settings)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx        ← Main layout wrapper
│   │   │   │   ├── Sidebar.tsx         ← Desktop navigation (256px)
│   │   │   │   ├── TopHeader.tsx       ← Desktop top bar
│   │   │   │   └── BottomNav.tsx       ← Mobile bottom navigation
│   │   │   └── ui/
│   │   │       ├── CurrencyDisplay.tsx ← RWF amount with privacy mode
│   │   │       ├── EnvelopeStatusBadge.tsx
│   │   │       ├── ConfirmDialog.tsx   ← Modal confirmation
│   │   │       ├── EmptyState.tsx
│   │   │       └── Toast.tsx           ← Toast notification system
│   │   ├── context/
│   │   │   └── AppContext.tsx          ← Global state + localStorage
│   │   ├── lib/
│   │   │   ├── store.ts                ← State mutations & demo data
│   │   │   ├── currency.ts             ← RWF formatting utilities
│   │   │   ├── dates.ts                ← Maturity & countdown logic
│   │   │   └── validation.ts           ← Input validation
│   │   └── types/
│   │       └── index.ts                ← Shared TypeScript types
│   ├── tailwind.config.ts              ← Full design token map
│   ├── package.json
│   └── next.config.mjs
├── stitch_finlock_budgeting_app_design_system/  ← Google Stitch design exports
│   ├── disciplined_precision_dark/DESIGN.md
│   └── */code.html + screen.png
└── .github/
    └── workflows/
        ├── ci.yml                      ← Lint + type check + build on PR/push
        └── deploy.yml                  ← Deploy to Vercel on merge to main
```

---

## 9. Demo Data & Financial Model

All financial state is stored in browser `localStorage` under the key `wisehaven_demo_v1`.

### Balance invariant

The following equation must always hold:

```
totalFunds = vaultBalance + Σ(active envelope amounts) + availableFunds
```

Example with seed data:

```
250,000 = 25,000 (vault)
        + 100,000 (Rent)
        + 20,000 (Food)
        + 15,000 (Utilities)
        + 25,000 (Education)
        + 65,000 (Available)
✓ Balanced
```

### Key financial rules

1. **Vault sweep applied once** — only on confirmed deposit, never on preview
2. **Locked funds are non-spendable** — `confirmPayment()` throws if `!isMatured()`
3. **No floating point** — all RWF amounts are integers
4. **Single source of truth** — balances are derived from `DemoAccount`, never hardcoded in UI
5. **Atomic mutations** — deposit, allocation, and payment each produce a new immutable state object

### ⚠️ Prototype limitations

- State exists only in your browser's `localStorage` — not synced across devices or tabs
- No authentication — anyone with browser access can view the demo
- Maturity timers use the client's local clock — accurate within the device's timezone
- No real money, no real bank, no real payment API
- These safeguards must be enforced server-side before any production deployment

---

## 10. CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and deployment.

### CI (`ci.yml`) — runs on every push and pull request to `main` / `develop`

```
Push / PR
    │
    ├── Lint (ESLint)        ← next/core-web-vitals ruleset
    ├── Type Check (tsc)     ← strict, noEmit
    └── Build (next build)   ← production build, Node 20
              │
              └── Upload build artifact (retained 3 days)
```

All three jobs run on `ubuntu-latest` with Node.js 20 and npm cache enabled. The `build` job only runs after both `lint` and `typecheck` pass.

### Deploy (`deploy.yml`) — runs on push to `main` or manual `workflow_dispatch`

```
Push to main / Manual trigger
    │
    └── CI Gate (lint + typecheck + build)
              │
              ├── deploy-preview  ← every main push → Vercel preview URL
              │   └── Posts preview URL as a commit comment
              │
              └── deploy-production  ← manual trigger only (environment: production)
```

**Required GitHub Secrets:**

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel team/org ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

Production deployments are intentionally **manual-trigger-only** to prevent accidental promotions. Every push to `main` automatically produces a preview deployment with its URL posted as a commit comment.

---

## 11. Roadmap

### Milestone 1 — Current ✅
- [x] Next.js prototype with full UI from Stitch designs
- [x] Simulated envelope budgeting with temporal locks
- [x] Emergency Vault with first-sweep automation
- [x] Simulated deposit and payment confirmation flows
- [x] localStorage persistence + demo reset
- [x] Mobile-first responsive design
- [x] GitHub Actions CI/CD pipeline (lint → typecheck → build → Vercel deploy)

### Milestone 2 — Backend & Auth
- [ ] FastAPI (Python) backend with PostgreSQL ledger
- [ ] JWT authentication (phone number + PIN)
- [ ] Real envelope lock enforcement server-side
- [ ] Celery + Redis task queue for maturity notifications and SMS triggers

### Milestone 3 — Payment Integrations
- [ ] MTN MoMo Disbursements API
- [ ] Airtel Money Disbursements API
- [ ] EUCL / REG direct Cashpower top-up
- [ ] WASAC water bill payment integration

### Milestone 4 — USSD & Accessibility
- [ ] Africa's Talking USSD gateway (`*182*...#`)
- [ ] Feature phone support for rural users
- [ ] SMS notification on envelope maturity

### Milestone 5 — Production & Compliance
- [ ] BNR regulatory compliance review
- [ ] Partner SACCO / commercial bank escrow integration (regulated fund custody)
- [ ] PWA manifest + service worker for offline support
- [ ] Fraud detection, rate limiting, and audit trails

---

## 12. Strategic Impact

### Alignment with NST2 (National Strategy for Transformation 2)

WiseHaven directly supports Rwanda's national goals for digital economy transformation by:

- **Deepening formal financial inclusion** — providing a structured savings and payment tool accessible on both smartphones and feature phones via USSD
- **Raising national domestic savings rates** — automating the "Pay Yourself First" emergency reserve sweep
- **Reducing credit risk for financial institutions** — time-collateralized deposit float provides banks and telecom operators with predictable liquidity and improved forecasting

### Impact on Rwandan Citizens

| Challenge | WiseHaven Response |
|---|---|
| End-of-month food insecurity cycles | Food envelope funds locked until grocery day; cannot be diverted |
| Utility disconnection (electricity / water) | EUCL and WASAC envelopes mature on bill due date; direct payment on unlock |
| Eviction risk | Rent envelope locked until landlord payment date |
| Distress borrowing for daily expenses | Pre-committed envelopes eliminate the need to borrow for predictable bills |
| Zero household emergency buffer | Automated vault sweep builds reserves incrementally from every deposit |

### Value for Financial Institutions

- **Predictable deposit float** — locked envelopes behave like time deposits, improving liquidity forecasting
- **Reduced credit risk** — pre-funded bill envelopes eliminate the gap that triggers distress borrowing
- **New savings product distribution channel** — the Emergency Vault is a natural gateway to formal savings products and micro-insurance

---

## 13. Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes inside `wisehaven/`
4. Run all checks: `npm run lint && npx tsc --noEmit && npm run build`
5. Commit: `git commit -m "feat: your feature description"`
6. Push and open a Pull Request against `main`

The CI pipeline will automatically run lint, type check, and build on your PR.

---

## 14. License

MIT © 2026 WiseHaven / NISR Rwanda

---

<div align="center">
  <strong>WiseHaven · Give Every Franc a Purpose</strong><br>
  Built for Rwanda · Powered by commitment · Backed by discipline
</div>
