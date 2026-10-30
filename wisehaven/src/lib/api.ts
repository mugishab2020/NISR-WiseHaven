/**
 * WiseHaven API Client
 *
 * Single source of truth for all backend communication.
 * Automatically attaches the Clerk Bearer token to every request.
 * All financial figures are DEMO money — no real funds are involved.
 *
 * Usage (in client components):
 *   const { getToken } = useAuth();
 *   const wallet = await walletApi.getBalance(getToken);
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const DEFAULT_TIMEOUT_MS = 15_000;

// ─── Token helper ────────────────────────────────────────────────────────────

type GetToken = () => Promise<string | null>;

async function buildHeaders(getToken?: GetToken): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (getToken) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ─── Error type ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Core request ────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  getToken?: GetToken,
  body?: unknown,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: await buildHeaders(getToken),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    // 204 No Content
    if (res.status === 204) return undefined as unknown as T;

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const detail =
        typeof data === "object" && data !== null
          ? (data as Record<string, unknown>).detail
          : data;
      const message =
        typeof detail === "string"
          ? detail
          : `API error ${res.status}: ${res.statusText}`;
      throw new ApiError(res.status, message, data);
    }

    return data as T;
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(0, "Request timed out. Please try again.");
    }
    throw new ApiError(0, "Network error. Please check your connection.");
  }
}

// ─── Types matching FastAPI response schemas ─────────────────────────────────

export interface WalletResponse {
  id: string;
  user_id: string;
  balance: number;
  total_deposited: number;
  total_allocated: number;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface FundingResponse {
  success: boolean;
  message: string;
  wallet: WalletResponse;
  transaction_id: string;
}

export interface TemporalLockResponse {
  id: string;
  envelope_id: string;
  maturity_timestamp: string;
  status: "LOCKED" | "RELEASED";
  created_at: string;
}

export interface AllowanceScheduleResponse {
  id: string;
  envelope_id: string;
  release_amount: number;
  frequency: "DAILY" | "WEEKLY";
  next_release_at: string;
  is_active: boolean;
}

export interface EnvelopeResponse {
  id: string;
  name: string;
  category: string;
  description: string | null;
  balance: number;
  locked_balance: number;
  is_active: boolean;
  is_emergency_vault: boolean;
  created_at: string;
  updated_at: string;
  temporal_lock: TemporalLockResponse | null;
  allowance_schedule: AllowanceScheduleResponse | null;
}

export interface EnvelopeListResponse {
  envelopes: EnvelopeResponse[];
}

export interface FundEnvelopeResponse {
  envelope_id: string;
  envelope_name: string;
  amount: number;
  new_envelope_balance: number;
  new_wallet_balance: number;
  transaction_id: string;
}

export interface AllocationDetail {
  envelope_id: string;
  envelope_name: string;
  amount: number;
}

export interface DepositResponse {
  transaction_id: string;
  total_amount: number;
  first_sweep_amount: number;
  remaining_amount: number;
  allocations: AllocationDetail[];
  timestamp: string;
}

export interface TransactionResponse {
  id: string;
  timestamp: string;
  transaction_type: string;
  amount: number;
  envelope_id: string | null;
  envelope_name: string | null;
  payee_id: string | null;
  payee_name: string | null;
  description: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface TransactionListResponse {
  transactions: TransactionResponse[];
  pagination: Pagination;
}

export interface BalanceResponse {
  envelope_id: string;
  envelope_name: string;
  balance: number;
  is_emergency_vault: boolean;
  temporal_lock_status: "LOCKED" | "RELEASED" | null;
  maturity_timestamp: string | null;
}

export interface BalanceListResponse {
  balances: BalanceResponse[];
  total_balance: number;
}

export interface AllocationPlanItem {
  envelope_id: string;
  envelope_name: string;
  percentage: number;
}

export interface AllocationPlanResponse {
  id: string;
  name: string;
  is_active: boolean;
  items: AllocationPlanItem[];
  created_at: string;
  updated_at: string;
}

export interface PayeeResponse {
  id: string;
  name: string;
  phone_number: string | null;
  account_identifier: string | null;
  payee_type: string;
  linked_envelopes: { envelope_id: string; envelope_name: string }[];
  created_at: string;
  updated_at: string;
}

export interface DisbursementResponse {
  transaction_id: string;
  envelope_id: string;
  envelope_name: string;
  amount: number;
  previous_balance: number;
  new_balance: number;
  payee_id: string | null;
  description: string;
  timestamp: string;
  status: string;
}

export interface EmergencyWithdrawalResponse {
  request_id: string;
  amount: number;
  justification: string;
  status: string;
  requested_at: string | null;
  approved_at: string | null;
  can_approve_at: string | null;
  transaction_id: string | null;
  message: string | null;
}

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string | null;
  phone_number: string | null;
  first_sweep_percentage: number;
  preferred_notification: string;
  emergency_contact: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── API namespaces ──────────────────────────────────────────────────────────

export const healthApi = {
  ping: () => request<{ status: string }>("GET", "/health"),
};

export const walletApi = {
  getWallet: (getToken: GetToken) =>
    request<WalletResponse>("GET", "/wallet/", getToken),

  getBalance: (getToken: GetToken) =>
    request<WalletResponse>("GET", "/wallet/balance", getToken),

  /** Add simulated demo funds (no real money) */
  deposit: (
    getToken: GetToken,
    amount: number,
    description = "Demo deposit",
    idempotencyKey?: string,
  ) =>
    request<FundingResponse>("POST", "/wallet/deposit", getToken, {
      amount,
      description,
      idempotency_key: idempotencyKey,
    }),
};

export const envelopeApi = {
  list: (getToken: GetToken) =>
    request<EnvelopeListResponse>("GET", "/envelopes", getToken),

  get: (getToken: GetToken, envelopeId: string) =>
    request<EnvelopeResponse>("GET", `/envelopes/${envelopeId}`, getToken),

  create: (
    getToken: GetToken,
    data: { name: string; category: string; description?: string },
  ) => request<EnvelopeResponse>("POST", "/envelopes", getToken, data),

  update: (
    getToken: GetToken,
    envelopeId: string,
    data: { name?: string; description?: string; is_active?: boolean },
  ) =>
    request<EnvelopeResponse>(
      "PATCH",
      `/envelopes/${envelopeId}`,
      getToken,
      data,
    ),

  createLock: (
    getToken: GetToken,
    envelopeId: string,
    maturityTimestamp: string,
  ) =>
    request<TemporalLockResponse>(
      "POST",
      `/envelopes/${envelopeId}/lock`,
      getToken,
      { maturity_timestamp: maturityTimestamp },
    ),

  createAllowance: (
    getToken: GetToken,
    envelopeId: string,
    data: {
      release_amount: number;
      frequency: "DAILY" | "WEEKLY";
      first_release_at: string;
    },
  ) =>
    request<AllowanceScheduleResponse>(
      "POST",
      `/envelopes/${envelopeId}/allowance`,
      getToken,
      data,
    ),

  /** Allocate funds from the wallet into an envelope */
  fund: (
    getToken: GetToken,
    envelopeId: string,
    amount: number,
    description?: string,
  ) =>
    request<FundEnvelopeResponse>(
      "POST",
      `/envelopes/${envelopeId}/fund`,
      getToken,
      { amount, description },
    ),
};

export const transactionApi = {
  /** Distribute wallet funds to envelopes per active allocation plan */
  distribute: (
    getToken: GetToken,
    amount: number,
    description: string,
  ) =>
    request<DepositResponse>("POST", "/transactions/deposit", getToken, {
      amount,
      description,
    }),

  list: (
    getToken: GetToken,
    opts: {
      envelope_id?: string;
      start_date?: string;
      end_date?: string;
      page?: number;
      page_size?: number;
    } = {},
  ) => {
    const params = new URLSearchParams();
    if (opts.envelope_id) params.set("envelope_id", opts.envelope_id);
    if (opts.start_date) params.set("start_date", opts.start_date);
    if (opts.end_date) params.set("end_date", opts.end_date);
    if (opts.page) params.set("page", String(opts.page));
    if (opts.page_size) params.set("page_size", String(opts.page_size));
    const qs = params.toString();
    return request<TransactionListResponse>(
      "GET",
      `/transactions${qs ? `?${qs}` : ""}`,
      getToken,
    );
  },

  balances: (getToken: GetToken) =>
    request<BalanceListResponse>("GET", "/transactions/balances", getToken),
};

export const allocationApi = {
  list: (getToken: GetToken) =>
    request<{ plans: AllocationPlanResponse[] }>(
      "GET",
      "/allocation-plans",
      getToken,
    ),

  create: (
    getToken: GetToken,
    data: { name: string; items: { envelope_id: string; percentage: number }[] },
  ) =>
    request<AllocationPlanResponse>("POST", "/allocation-plans", getToken, data),

  get: (getToken: GetToken, planId: string) =>
    request<AllocationPlanResponse>(
      "GET",
      `/allocation-plans/${planId}`,
      getToken,
    ),

  activate: (getToken: GetToken, planId: string) =>
    request<AllocationPlanResponse>(
      "POST",
      `/allocation-plans/${planId}/activate`,
      getToken,
    ),
};

export const payeeApi = {
  list: (getToken: GetToken) =>
    request<{ payees: PayeeResponse[] }>("GET", "/payees", getToken),

  create: (
    getToken: GetToken,
    data: {
      name: string;
      payee_type: string;
      phone_number?: string;
      account_identifier?: string;
      envelope_ids?: string[];
    },
  ) => request<PayeeResponse>("POST", "/payees", getToken, data),

  get: (getToken: GetToken, payeeId: string) =>
    request<PayeeResponse>("GET", `/payees/${payeeId}`, getToken),

  update: (
    getToken: GetToken,
    payeeId: string,
    data: { name?: string; phone_number?: string; account_identifier?: string },
  ) =>
    request<PayeeResponse>("PATCH", `/payees/${payeeId}`, getToken, data),

  delete: (getToken: GetToken, payeeId: string) =>
    request<void>("DELETE", `/payees/${payeeId}`, getToken),
};

export const disbursementApi = {
  /** Simulate a payment from an envelope to a payee */
  disburse: (
    getToken: GetToken,
    data: {
      envelope_id: string;
      amount: number;
      description: string;
      payee_id?: string;
    },
  ) =>
    request<DisbursementResponse>("POST", "/disbursements", getToken, data),

  requestEmergencyWithdrawal: (
    getToken: GetToken,
    data: { amount: number; justification: string },
  ) =>
    request<EmergencyWithdrawalResponse>(
      "POST",
      "/disbursements/emergency-vault",
      getToken,
      data,
    ),

  getEmergencyWithdrawals: (getToken: GetToken) =>
    request<{ requests: EmergencyWithdrawalResponse[] }>(
      "GET",
      "/disbursements/emergency-vault",
      getToken,
    ),

  approveEmergencyWithdrawal: (getToken: GetToken, requestId: string) =>
    request<EmergencyWithdrawalResponse>(
      "POST",
      `/disbursements/emergency-vault/${requestId}/approve`,
      getToken,
    ),
};

export const userApi = {
  me: (getToken: GetToken) =>
    request<UserProfile>("GET", "/users/me", getToken),

  update: (
    getToken: GetToken,
    data: {
      first_sweep_percentage?: number;
      preferred_notification?: string;
      emergency_contact?: string;
    },
  ) => request<UserProfile>("PATCH", "/users/me", getToken, data),
};

// ─── Notification types ──────────────────────────────────────────────────────

export interface NotificationResponse {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  status: string;
  is_read: boolean;
  sent_at: string;
  metadata: Record<string, unknown> | null;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  total_count: number;
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export const notificationApi = {
  /** List all in-app notifications, newest first */
  list: (
    getToken: GetToken,
    opts: { limit?: number; offset?: number } = {},
  ) => {
    const params = new URLSearchParams();
    if (opts.limit)  params.set("limit",  String(opts.limit));
    if (opts.offset) params.set("offset", String(opts.offset));
    const qs = params.toString();
    return request<NotificationListResponse>(
      "GET",
      `/notifications${qs ? `?${qs}` : ""}`,
      getToken,
    );
  },

  /** Fast badge count only */
  unreadCount: (getToken: GetToken) =>
    request<UnreadCountResponse>("GET", "/notifications/unread-count", getToken),

  /** Mark all as read */
  markAllRead: (getToken: GetToken) =>
    request<{ marked_read: number }>("POST", "/notifications/read-all", getToken),

  /** Mark a single notification as read */
  markRead: (getToken: GetToken, notificationId: string) =>
    request<NotificationResponse>(
      "POST",
      `/notifications/${notificationId}/read`,
      getToken,
    ),
};

// ─── Legacy compat export (kept for any existing imports) ────────────────────
export const api = {
  get: <T>(path: string, getToken?: GetToken) =>
    request<T>("GET", path, getToken),
  post: <T>(path: string, body: unknown, getToken?: GetToken) =>
    request<T>("POST", path, getToken, body),
  patch: <T>(path: string, body: unknown, getToken?: GetToken) =>
    request<T>("PATCH", path, getToken, body),
  delete: <T>(path: string, getToken?: GetToken) =>
    request<T>("DELETE", path, getToken),
};
