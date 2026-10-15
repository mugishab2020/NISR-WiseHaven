// ============================================================
// WiseHaven — Validation Utilities
// ============================================================

import { computeAvailableFunds } from "./store";
import type { DemoAccount } from "@/types";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface NewEnvelopeFields {
  name: string;
  description: string;
  category: string;
  amount: string;
  recipient: string;
  maturityDate: string;
}

export function validateNewEnvelope(
  fields: NewEnvelopeFields,
  account: DemoAccount,
  editingId?: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!fields.name.trim()) {
    errors.name = "Envelope name is required.";
  } else if (fields.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (fields.name.trim().length > 60) {
    errors.name = "Name must be 60 characters or fewer.";
  }

  if (!fields.category) {
    errors.category = "Please select a category.";
  }

  const parsedAmount = parseInt(fields.amount.replace(/[,\s]/g, ""), 10);
  if (isNaN(parsedAmount)) {
    errors.amount = "Enter a valid RWF amount.";
  } else if (parsedAmount <= 0) {
    errors.amount = "Amount must be greater than 0 RWF.";
  } else if (parsedAmount < 100) {
    errors.amount = "Minimum allocation is 100 RWF.";
  } else {
    const available = computeAvailableFunds(account);
    // When editing, add back the envelope's current amount
    const editingEnvelope = editingId
      ? account.envelopes.find((e) => e.id === editingId)
      : undefined;
    const effectiveAvailable = editingEnvelope
      ? available + editingEnvelope.amount
      : available;

    if (parsedAmount > effectiveAvailable) {
      errors.amount = `Amount exceeds available funds (${effectiveAvailable.toLocaleString()} RWF).`;
    }
  }

  if (!fields.recipient.trim()) {
    errors.recipient = "Recipient or purpose is required.";
  }

  if (!fields.maturityDate) {
    errors.maturityDate = "Maturity date is required.";
  } else {
    const maturity = new Date(fields.maturityDate);
    const now = new Date();
    if (isNaN(maturity.getTime())) {
      errors.maturityDate = "Enter a valid date and time.";
    } else if (maturity <= now) {
      errors.maturityDate = "Maturity date must be in the future.";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateDeposit(amount: string): ValidationResult {
  const errors: Record<string, string> = {};
  const parsed = parseInt(amount.replace(/[,\s]/g, ""), 10);

  if (!amount.trim()) {
    errors.amount = "Enter a deposit amount.";
  } else if (isNaN(parsed)) {
    errors.amount = "Enter a valid RWF amount.";
  } else if (parsed <= 0) {
    errors.amount = "Deposit must be greater than 0 RWF.";
  } else if (parsed < 1000) {
    errors.amount = "Minimum deposit is 1,000 RWF.";
  } else if (parsed > 10000000) {
    errors.amount = "Maximum single deposit is 10,000,000 RWF.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateVaultSettings(
  sweepPercentage: number,
  targetAmount: number
): ValidationResult {
  const errors: Record<string, string> = {};

  if (sweepPercentage < 1 || sweepPercentage > 50) {
    errors.sweepPercentage = "Sweep percentage must be between 1% and 50%.";
  }

  if (targetAmount < 1000) {
    errors.targetAmount = "Target must be at least 1,000 RWF.";
  } else if (targetAmount > 100000000) {
    errors.targetAmount = "Target must be 100,000,000 RWF or less.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
