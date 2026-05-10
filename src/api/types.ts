export interface Category {
  category?: string;
  id?: number;
}

export interface Chat {
  category?: string;
  category_id?: number;
  created_at?: string;
  description?: string;
  id?: number;
  is_active?: boolean;
  is_premium?: boolean;
  owner_id?: number;
  title?: string;
  type?: string;
  updated_at?: string;
  username?: string;
}

export interface ChatSubscription {
  created_at?: string;
  expires_at?: string;
  plan_id?: number;
  plan_title?: string;
  status?: string;
  subscription_id?: number;
  user_id?: number;
  username?: string;
}

export interface ChatSubscriptionStats {
  active?: number;
  active_lifetime_count?: number;
  active_periodic_count?: number;
  active_revenue_hint?: number;
  canceled?: number;
  chat_id?: number;
  disabled?: number;
  total?: number;
}

export interface Subscription {
  chat_id?: number;
  chat_title?: string;
  created_at?: string;
  expires_at?: string;
  plan_id?: number;
  plan_title?: string;
  price?: number;
  status?: string;
  subscription_id?: number;
}

export interface SubscriptionEvent {
  actor_role?: string;
  actor_user_id?: number;
  chat_id?: number;
  created_at?: string;
  event_type?: string;
  from_status?: string;
  id?: number;
  note?: string;
  subscription_id?: number;
  to_status?: string;
}

export interface SubscriptionPlan {
  chat_id?: number;
  created_at?: string;
  duration_days?: number;
  id?: number;
  plan_type?: string;
  price?: number;
  status?: string;
  title?: string;
  trial_days?: number;
  updated_at?: string;
}

export interface User {
  bio?: string;
  created_at?: string;
  earned?: number;
  first_name?: string;
  id?: number; // telegram_user_id
  last_name?: string;
  status?: string;
  username?: string;
}

export interface AuthRequest {
  initData: string;
}

export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  user_id?: number;
}

export interface CreateSubscriptionPlanReq {
  duration_days?: number;
  plan_type: string; // 'periodic' or 'lifetime'
  price: number;
  title: string;
  trial_days: number;
}

export interface ListChatsItem {
  category?: string;
  id?: number;
  is_premium?: boolean;
  title?: string;
  type?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UpdateChatSubscriptionStatusReq {
  status: string; // 'active', 'disabled', 'canceled'
}

export interface UpdateSubscriptionPlanReq {
  price?: number;
  status?: string; // 'active', 'archived', 'disabled'
  trial_days?: number;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface LinkWalletRequest {
  wallet_address: string;
}

export interface UpdateChatReq {
  category_id?: number;
  title?: string;
  description?: string;
  is_active?: boolean;
}

// Envelope responses definition
export interface ErrorResponse {
  code?: string;
  fields?: Record<string, any>;
  message?: string;
  request_id?: string;
}

export interface ResponseEnvelope<T> {
  data: T;
  request_id?: string;
}

export interface PaginationData<T> {
  items: T[];
  limit?: number;
  offset?: number;
  total?: number;
  next_cursor?: string;
}

// --- Reviews ---
export interface SubmitReviewReq {
  rating: number; // 1-5
  review_text?: string;
}

export interface Review {
  id?: number;
  chat_id?: number;
  user_id?: number;
  username?: string;
  rating?: number;
  review_text?: string;
  created_at?: string;
}

export interface ReviewSummary {
  average_rating: number;
  count: number;
}

export interface ReviewListResponse {
  summary?: ReviewSummary;
  items: Review[];
  limit: number;
  offset: number;
  total?: number;
}

// --- Private Chat ---
export interface PrivateChatSettings {
  chat_id?: number;
  is_enabled?: boolean;
}

export interface UpdatePrivateChatSettingsReq {
  is_enabled: boolean;
}

export interface Dialog {
  id?: number;
  chat_id?: number;
  subscriber_id?: number;
  subscriber_username?: string;
  creator_id?: number;
  status?: string;
  created_at?: string;
  closed_at?: string;
}

export interface UpdateDialogStatusReq {
  status: string; // 'open', 'closed', etc.
}

export interface DialogMessage {
  id?: number;
  dialog_id?: number;
  sender_user_id?: number;
  sender_role?: string;
  body?: string;
  created_at?: string;
}

export interface SendMessageReq {
  text: string;
}

// --- Broadcasts ---
export interface CreateBroadcastReq {
  title?: string;
  body: string;
  scheduled_at?: string;
}

export interface Broadcast {
  id?: number;
  chat_id?: number;
  title?: string;
  body?: string;
  status?: string;
  sent_at?: string;
  created_at?: string;
}

export interface BroadcastDelivery {
  id?: number;
  broadcast_id?: number;
  user_id?: number;
  status?: string;
  delivered_at?: string;
}

export interface BroadcastSendResult {
  total?: number;
  sent?: number;
  failed?: number;
}

// --- Gifts & Promo Codes ---
export interface CreateGiftReq {
  recipient_user_id?: number;
  payment_id?: number;
  message?: string;
  expires_at?: string;
}

export interface Gift {
  id?: number;
  plan_id?: number;
  sender_user_id?: number;
  recipient_user_id?: number;
  status?: string;
  message?: string;
  expires_at?: string;
  created_at?: string;
}

export interface CreatePromoCodeReq {
  plan_id?: number;
  code: string;
  discount_type: string; // 'percent' | 'fixed'
  discount_value: number;
  max_redemptions?: number;
  per_user_limit?: number;
  starts_at?: string;
  ends_at?: string;
  is_active?: boolean;
}

export interface PromoCode {
  id?: number;
  code?: string;
  discount_type?: string;
  discount_value?: number;
  max_redemptions?: number;
  per_user_limit?: number;
  redemption_count?: number;
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
  created_at?: string;
}

export interface PromoCodePreviewReq {
  code: string;
}

export interface PromoCodePreview {
  promo_code_id?: number;
  code?: string;
  discount_amount?: number;
  original_amount?: number;
  final_amount?: number;
}

export interface ApplyPromoCodeReq {
  code: string;
  payment_id?: number;
}

export interface PromoCodeApplyResult {
  promo_code_id?: number;
  code?: string;
  discount_amount?: number;
  original_amount?: number;
  final_amount?: number;
}

// --- Analytics ---
export interface AnalyticsFilter {
  from?: string;
  to?: string;
}

export interface AnalyticsMetrics {
  scope: string;
  chat_id?: number;
  creator_id?: number;
  period_from?: string;
  period_to?: string;
  total_subscribers: number;
  active_subscribers: number;
  new_subscriptions: number;
  renewals: number;
  expired_subscriptions: number;
  invite_issued: number;
  invite_used: number;
  removed_subscribers: number;
  revenue_confirmed: number;
}

export interface ChatMetrics extends AnalyticsMetrics {}
export interface CreatorMetrics extends AnalyticsMetrics {}

export interface PlatformMetrics {
  total_subscribers?: number;
  active_subscribers?: number;
  new_subscriptions?: number;
  renewals?: number;
  expired_subscriptions?: number;
  revenue_confirmed?: number;
}

export interface SubscribeInitResponse {
  contract_address: string;
  amount_nanoton: number;
  owner_wallet: string;
  admin_wallet: string;
  payload: string;
}

export interface SubscribeWithTONReq {
  tx_hash: string;
  wallet_address: string;
}

