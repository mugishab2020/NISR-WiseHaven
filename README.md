# WiseHaven — Give Every Franc a Purpose

> **WiseHaven helps Rwandan households make income last until the next payday.** It turns a budget into an actionable plan: allocate simulated funds to bills and goals, lock money until its intended date, or release a controlled daily/weekly allowance. The Next.js app is backed by an authenticated FastAPI and PostgreSQL service.

![WiseHaven — Dark fintech UI, lime accent](https://img.shields.io/badge/WiseHaven-v0.1.0--demo-BEF532?style=for-the-badge&labelColor=000000&color=BEF532)
![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-06B6D4?style=for-the-badge&logo=tailwindcss)
![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## At a glance

| | |
|---|---|
| **Who it is for** | People managing household bills, savings goals, and irregular income |
| **The problem** | Money intended for later expenses can be spent early, leaving predictable bills unfunded |
| **The approach** | Purpose-based envelopes, time locks, scheduled allowances, and an emergency savings vault |
| **What runs today** | Web app, Clerk sign-in, FastAPI API, PostgreSQL data model, wallet/envelope/activity/notification flows |
| **Money status** | Simulated funds only; no real deposits, custody, yields, or payment settlement |

### Try WiseHaven

- **Web app:** [nisr-wise-haven.vercel.app](https://nisr-wise-haven.vercel.app)
- **Backend health:** [nisr-wisehaven.onrender.com/health](https://nisr-wisehaven.onrender.com/health)
- **API documentation:** [nisr-wisehaven.onrender.com/docs](https://nisr-wisehaven.onrender.com/docs)
- **Browser walkthrough:** [Watch the WiseHaven web demo](https://drive.google.com/file/d/1zrHV24Dxa-rXcBPAVxW6lBvbN-HcxMWA/view)
- **Phone view:** [Watch the WiseHaven mobile demo](https://drive.google.com/file/d/1-qZriRrtHVzTeT2XB3AVSnsFZJ7bLo0U/view?usp=sharing)

The web app requires sign-in. Use your own account; this project does not publish shared demo credentials. All balances and transactions are simulated.

### A household use case

Imagine a household receives **300,000 RWF**. They reserve a portion for emergency savings, allocate rent and utilities to separate envelopes, then schedule a weekly food allowance. The app shows available and reserved balances separately, records each change in the activity ledger, and releases only the configured allowance when due. This makes the plan visible and harder to casually spend ahead of its purpose.

> **Hackathon prototype:** WiseHaven demonstrates budgeting and commitment behavior with simulated money. Payment-provider, biller, USSD, multilingual, and AI-coach integrations are future ideas in the roadmap.

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

**Current implementation:** a deployed web application with a Next.js frontend and authenticated FastAPI/PostgreSQL backend. Financial operations use **simulated money only**. No real deposits, withdrawals, Mobile Money transactions, or financial custody occur.

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

| Capability | Status in this repository |
|---|---|
| Sign-in and per-user API access | Implemented with Clerk |
| Wallet, envelopes, activity, and in-app notifications | Implemented with simulated balances and backend persistence |
| Envelope maturity locks | Implemented as application rules; funds are not held by a financial institution |
| Daily/weekly allowance schedule | Implemented as a release schedule processed by the running API service |
| Deposit and payment settlement | Simulated only |
| MTN/Airtel transfers, utility payments, USSD/SMS, French/Kinyarwanda, AI coach | Roadmap ideas; not implemented |

### ✦ Feature 1 — Smart Envelope Budgeting & Income Split

Upon income receipt, the system prompts the user (via USSD or Mobile App) to configure an allocation plan. Income is distributed across customizable expense containers (e.g., 50,000 RWF for Rent, 20,000 RWF for Internet/Utilities, 60,000 RWF for Food).

An envelope can carry a **name**, category, balance, and (where configured) a maturity lock or allowance schedule. Recipient registration and real bill payment integrations are future work.

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

### Current implementation

```
User's browser
  └── Next.js 14 / TypeScript web app
        ├── Clerk sign-in and protected app routes
        └── API client sends authenticated requests
              │ HTTPS + Bearer token
              ▼
        FastAPI / Python API
        ├── Authenticated, user-scoped routes
        ├── Wallet, envelopes, allocations, transactions, notifications
        ├── Lock and allowance business rules
        └── Scheduled allowance release task while service is running
              │ Prisma Client Python
              ▼
        PostgreSQL
        └── Users, wallets, envelopes, schedules, transactions, notifications
```

Balances and transaction records are persisted by the backend database. The frontend `AppContext` loads and refreshes API data; local storage is not the authoritative financial ledger. The current scheduler runs in the API process and is not a managed distributed job system.

### Future architecture ideas

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

**Potential integrations (not implemented):**
- **MTN MoMo API** / **Airtel Money API** — disbursement on envelope maturity
- **Africa's Talking** — USSD gateway (`*182*...#`) for feature-phone access (rural coverage)
- **REG / EUCL API** — direct Cashpower top-up on unlock
- **WASAC** — water bill direct payment
- **BNR Open Banking** — regulatory reporting and compliance

**Real-money custody and settlement are not implemented.** Any future escrow, yield, bank, telco, biller, or open-banking integration would require authorized partners, legal review, security controls, and operational readiness.

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 with custom design tokens |
| Icons | Lucide React |
| Frontend state | React Context + authenticated API data |
| Backend | FastAPI (Python) |
| Database / ORM | PostgreSQL / Prisma Client Python |
| Authentication | Clerk (frontend sign-in and backend token validation) |
| Background work | In-process scheduled allowance release loop |
| Fonts | Geist · Inter · JetBrains Mono (Google Fonts) |
| Linting | ESLint (next/core-web-vitals) |
| Type checking | TypeScript `tsc --noEmit` |
| CI/CD | GitHub Actions |
| Hosting | Vercel (web) / Render (API, as configured) |

---

## 7. Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Python 3.11 for the backend
- PostgreSQL database
- Clerk application keys for authenticated local use

### Frontend

```bash
# Clone the repository
git clone git@github.com:mugishab2020/NISR-WiseHaven.git
cd NISR-WiseHaven/wisehaven

# Install dependencies
npm install

# Configure the frontend environment (see wisehaven/.env.example if present)
# Set NEXT_PUBLIC_API_URL and the Clerk publishable/secret keys

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend

In a second terminal, configure the backend environment with a PostgreSQL `DATABASE_URL`, `CLERK_SECRET_KEY`, and `ALLOWED_ORIGINS` containing `http://localhost:3000`. Then:

```bash
cd backend/wisehaven_backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
prisma generate --schema models/schema.prisma
prisma migrate deploy --schema models/schema.prisma
python -m uvicorn main:app --reload --port 8000
```

Set the frontend `NEXT_PUBLIC_API_URL` to `http://localhost:8000`. Clerk frontend and backend keys must belong to the same Clerk application/environment.

### Available commands

```bash
npm run dev        # Development server with hot reload
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npx tsc --noEmit   # TypeScript type check
```

### First run

Sign in with the configured Clerk account, then use the deposit flow to add **simulated** funds to your account. Create envelopes, allocate funds, and explore lock/allowance behavior. No shared credentials or preloaded cross-user balances are provided.

> ⚠️ Every amount is simulated demo money. No real funds exist or are at risk.

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

The backend PostgreSQL database is the source of truth for authenticated wallet and envelope balances and transaction records. The frontend fetches this data through the API; React context holds the current client-side view. Do not treat browser local storage as the authoritative ledger.

### Balance invariant

The following equation must always hold:

```
totalFunds = vaultBalance + Σ(active envelope amounts) + availableFunds
```

Example balance breakdown (illustrative simulated data):

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

1. **Backend validation** — wallet and envelope operations are validated server-side.
2. **Locked balance separation** — scheduled allowance funds are reserved separately from currently available envelope funds.
3. **Ledger records** — financial actions are represented by persisted transaction records.
4. **Database transactions and guarded updates** — critical balance updates use transactional and concurrency protections where implemented.
5. **Simulated value only** — ledger entries do not represent claims on real money.

### ⚠️ Current limitations

- Deposits and payments are simulated; there is no real payment or custody integration.
- Scheduled allowance releases are processed by a background loop in the API process; this is not a durable, independently operated job queue.
- Notification delivery is in-app; SMS/USSD delivery is not implemented.
- Some UI copy or design references may describe future integrations; use the feature status and roadmap as the source of truth.
- Production use with real funds would require additional compliance, security, partner, reconciliation, support, and reliability work.

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

The roadmap is grouped into product versions. **Version 1 contains the four foundational milestones** that define WiseHaven's core budgeting experience. Later versions below are a broad idea bank for discussion; they are possibilities, not committed scope or claims that integrations are already available.

### Version 1 — WiseHaven foundations

#### Milestone 1 — Purpose-based envelope budgeting
- [x] Create named envelopes for expenses and savings goals
- [x] Allocate available wallet balance across envelopes
- [x] View envelope balances and activity
- [ ] Allocation templates for common Rwanda household budgets
- [ ] Recurring income and one-tap monthly budget setup

#### Milestone 2 — Commitment tools and scheduled allowances
- [x] Protect funds with envelope maturity locks
- [x] Release a configured daily or weekly allowance from a reserved envelope balance
- [x] Show available and locked amounts separately
- [ ] Flexible lock rules, grace periods, and user-defined release schedules
- [ ] Clear recovery flow for mistaken locks and account access problems

#### Milestone 3 — Emergency savings vault
- [x] Dedicated Emergency Vault envelope
- [x] First-sweep savings behavior in the budgeting experience
- [ ] User-configurable savings percentage, target, and pause controls
- [ ] Progress milestones and opt-in reminders
- [ ] Regulated savings partner exploration before offering real custody or yield

#### Milestone 4 — Secure account and money activity experience
- [x] Authenticated accounts and per-user data isolation
- [x] Backend wallet, envelopes, transaction history, and notifications
- [x] Server-side financial validation and security controls
- [ ] Production-grade reliability, observability, and incident response
- [ ] Independent security review and operational readiness before real-money use

**Version 1 boundary:** WiseHaven is currently a simulated-money product. Real deposits, custody, transfers, bill settlement, and financial returns require additional technical, partner, legal, and regulatory work.

### Version 2 — Local languages, access, and financial confidence (ideas)

- [ ] Add French and Kinyarwanda alongside English
- [ ] Translate onboarding, navigation, notifications, error messages, help content, and financial education—not only labels
- [ ] Let users choose a language and remember that preference across devices
- [ ] Review translations with native speakers and test financial terms for clarity
- [ ] Improve accessibility: screen-reader labels, keyboard navigation, contrast, text scaling, and reduced motion
- [ ] Design low-bandwidth pages and graceful retry behavior for unreliable connections
- [ ] Add optional SMS and USSD journeys for users without smartphones or mobile data
- [ ] Support feature-phone friendly account recovery and notification preferences
- [ ] Offer plain-language explanations of envelope locks, fees, and scheduled releases
- [ ] Add configurable reminders for bills, income dates, savings goals, and upcoming releases
- [ ] Explore household mode with explicit invitations, permissions, and shared goals
- [ ] Add downloadable statements and user-controlled data export

### Version 3 — Personal AI money coach (ideas)

- [ ] Add an opt-in AI assistant that explains spending patterns and helps users plan budgets
- [ ] Suggest envelope amounts from user-approved income, bills, goals, and past activity
- [ ] Explain trade-offs in simple language: for example, how changing a savings amount affects the rent or food envelope
- [ ] Let users ask questions in English, French, or Kinyarwanda
- [ ] Provide bill-calendar summaries and identify likely shortfalls before due dates
- [ ] Suggest realistic savings targets and small adjustments, with the user making the final choice
- [ ] Explain why each recommendation was made and which data informed it
- [ ] Make recommendations optional, editable, and easy to dismiss; never move money without user approval
- [ ] Set privacy controls for AI features, including opt-in, data retention choices, and deletion
- [ ] Evaluate advice for bias, hallucinations, safety, and local financial context before release
- [ ] Clearly distinguish educational guidance from regulated financial advice

### Version 4 — Payments and trusted financial partnerships (ideas)

- [ ] Evaluate MTN MoMo and Airtel Money integrations with authorized partners
- [ ] Explore utility and bill payment workflows for electricity, water, education, and other recurring obligations
- [ ] Add verified recipient details, payment previews, explicit confirmation, and receipts
- [ ] Design idempotent payment requests, reconciliation, refunds, and support workflows
- [ ] Assess regulated partner custody, escrow, or savings products; do not hold real customer funds without the required authorization
- [ ] Publish transparent fees, limits, settlement timelines, and failure handling
- [ ] Conduct legal and regulatory review for Rwanda and any future operating markets
- [ ] Complete partner security reviews and end-to-end payment testing before enabling live transactions

### Version 5 — USSD, SMS, and inclusive reach (ideas)

- [ ] Pilot a USSD menu with a licensed or authorized gateway provider
- [ ] Check balances, review envelopes, receive reminders, and confirm supported actions from feature phones
- [ ] Use short, accessible Kinyarwanda, French, and English menu flows
- [ ] Add SMS notices for due dates, releases, security events, and payment outcomes
- [ ] Make sensitive actions require appropriate authentication and confirmation
- [ ] Design for session timeouts, interrupted requests, shared phones, and limited literacy
- [ ] Test with users in rural and urban communities before expanding availability

### Version 6 — Goals, household planning, and resilience (ideas)

- [ ] Create goal journeys for school fees, rent, healthcare, agriculture inputs, and major purchases
- [ ] Add seasonal and irregular-income budgeting for farmers, traders, and gig workers
- [ ] Provide a bill calendar with recurring due dates and income events
- [ ] Let users model “what if” budgets without changing real balances
- [ ] Add configurable buffers for price changes and unexpected expenses
- [ ] Support multiple budgets or wallets where the product and partners permit
- [ ] Explore household collaboration with role-based access and private personal envelopes
- [ ] Add voluntary financial education in short, locally relevant lessons

### Version 7 — Trust, safety, and platform maturity (ideas)

- [ ] Add stronger account security options, session management, and recovery protections
- [ ] Create clear audit history for sign-ins, profile changes, allocations, and payment actions
- [ ] Add user-configurable transaction alerts and suspicious-activity reporting
- [ ] Establish data minimization, retention, export, and deletion policies
- [ ] Add service health monitoring, backups, disaster recovery, and tested restoration procedures
- [ ] Build operational dashboards for delivery failures, reconciliation, and support cases
- [ ] Perform independent penetration testing and remediate findings
- [ ] Publish uptime, support, privacy, and security practices appropriate to the service maturity

### Version 8 — Ecosystem and expansion (ideas)

- [ ] Explore integrations with SACCOs, banks, employers, cooperatives, and community organizations
- [ ] Enable employer or cooperative budgeting tools only with clear consent and separation of personal data
- [ ] Offer documented APIs and partner sandbox environments after the core platform is stable
- [ ] Research additional local currencies, countries, and language needs before expansion
- [ ] Measure outcomes such as bill readiness, savings consistency, and user-reported financial confidence
- [ ] Publish transparent impact reporting without exposing individual financial data

### Principles for future versions

1. **Users stay in control:** recommendations and scheduled actions are transparent, revocable where feasible, and confirmed by the user.
2. **Protect privacy:** collect only necessary data and explain how each feature uses it.
3. **Build for local realities:** validate language, connectivity, income patterns, and payment workflows with the people who will use them.
4. **Earn trust before handling real money:** partner authorization, compliance, security, support, and reconciliation come before live financial integrations.
5. **Ship through evidence:** each version should be shaped by user research, partner readiness, and measurable outcomes.

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
