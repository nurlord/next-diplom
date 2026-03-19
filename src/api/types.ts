export interface Category {
  category?: string;
  id?: number;
}

export interface Chat {
  category?: string;
  categoryID?: number;
  createdAt?: string;
  description?: string;
  id?: number;
  isActive?: boolean;
  isPremium?: boolean;
  ownerID?: number;
  title?: string;
  type?: string;
  updatedAt?: string;
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
  next_cursor?: string;
}
