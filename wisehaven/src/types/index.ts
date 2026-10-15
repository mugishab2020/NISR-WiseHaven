// ============================================================
// WiseHaven — Shared TypeScript Types
// DEMO ONLY: No real money, no real financial custody.
// ============================================================

export type EnvelopeStatus =
  | "locked"
  | "unlocking_soon"
  | "ready_to_pay"
  | "paid"
  | "cancelled";

export type TransactionType =
  | "deposit"
  | "vault_sweep"
  | "envelope_allocation"
  | "envelope_payment"
  | "envelope_cancelled"
  | "vault_withdrawal";

export type EnvelopeCategory =
  | "shelter"
  | "food"
  | "utilities"
  | "education"
  | "transport"
  | "healthcare"
  | "family"
  | "business"
  | "custom";

export interface Envelope {
  id: string;
  name: string;
  description: string;
  category: EnvelopeCategory;
  categoryLabel: string;
  icon: string;
  amount: number; // integer RWF
  recipient: string;
  maturityDate: string; // ISO 8601 string
  status: EnvelopeStatus;
  createdAt: string; // ISO 8601 string
  paidAt?: string; // ISO 8601 string — set when status becomes "paid"
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // integer RWF, always positive
  direction: "in" | "out" | "neutral";
  description: string;
  subDescription: string;
  envelopeId?: string;
  envelopeName?: string;
  timestamp: string; // ISO 8601 string
}

export interface EmergencyVaultSettings {
  sweepPercentage: number; // 1–100
  targetAmount: number; // integer RWF
  isAutoSweepEnabled: boolean;
}

export interface DemoAccount {
  // All amounts are integer RWF
  totalFunds: number;
  vaultBalance: number;
  envelopes: Envelope[];
  transactions: Transaction[];
  vaultSettings: EmergencyVaultSettings;
  privacyMode: boolean;
  lastUpdated: string;
}

export interface DepositPreview {
  depositAmount: number;
  vaultSweepAmount: number;
  remainingAmount: number;
  sweepPercentage: number;
}

export interface PaymentPreview {
  envelope: Envelope;
  amount: number;
  recipient: string;
}
