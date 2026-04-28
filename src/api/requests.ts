import { apiClient } from "./client";
import * as T from "./types";

// Auth
export const auth = (data: T.AuthRequest) =>
  apiClient
    .post("auth", { json: data })
    .json<T.ResponseEnvelope<T.AuthResponse>>();

export const refreshToken = (data: T.RefreshTokenRequest) =>
  apiClient
    .post("auth/refresh", { json: data })
    .json<T.ResponseEnvelope<T.AuthResponse>>();

// User
export const getUserProfile = () =>
  apiClient.get("api/user").json<T.ResponseEnvelope<T.User>>();

export const updateUserProfile = (data: T.UpdateUserRequest) =>
  apiClient
    .patch("api/user", { json: data })
    .json<T.ResponseEnvelope<T.User>>();

export const deleteUserProfile = () => apiClient.delete("api/user").text(); // 204 No Content

// Chats
export interface GetChatsParams {
  owner_id?: number;
  category_id?: number;
  is_premium?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export const getChats = (params?: GetChatsParams) =>
  apiClient
    .get("api/chats", { searchParams: params as any })
    .json<T.ResponseEnvelope<T.PaginationData<T.ListChatsItem>>>();

export const getChatCategories = () =>
  apiClient
    .get("api/chats/categories")
    .json<T.ResponseEnvelope<T.Category[]>>();

export const getChatById = (chat_id: number) =>
  apiClient.get(`api/chats/${chat_id}`).json<T.ResponseEnvelope<T.Chat>>();

export const updateChat = (chat_id: number, data: T.UpdateChatReq) =>
  apiClient
    .patch(`api/chats/${chat_id}`, { json: data })
    .json<T.ResponseEnvelope<T.Chat>>();

// Plans
export const getChatPlans = (chat_id: number) =>
  apiClient
    .get(`api/chats/${chat_id}/plans`)
    .json<T.ResponseEnvelope<T.SubscriptionPlan[]>>();

export const createChatPlan = (
  chat_id: number,
  data: T.CreateSubscriptionPlanReq,
) =>
  apiClient
    .post(`api/chats/${chat_id}/plans`, { json: data })
    .json<T.ResponseEnvelope<{ subscription_plan_id: number }>>();

export const getPlanById = (plan_id: number) =>
  apiClient
    .get(`api/plans/${plan_id}`)
    .json<T.ResponseEnvelope<T.SubscriptionPlan>>();

export const updatePlan = (
  plan_id: number,
  data: T.UpdateSubscriptionPlanReq,
) =>
  apiClient
    .patch(`api/plans/${plan_id}`, { json: data })
    .json<T.ResponseEnvelope<T.SubscriptionPlan>>();

// Creator Subscriptions
export interface GetChatSubscriptionsParams {
  status?: string;
  created_from?: string;
  created_to?: string;
  limit?: number;
  cursor?: string;
}

export const getChatSubscriptions = (
  chat_id: number,
  params?: GetChatSubscriptionsParams,
) =>
  apiClient
    .get(`api/chats/${chat_id}/subscriptions`, { searchParams: params as any })
    .json<T.ResponseEnvelope<T.PaginationData<T.ChatSubscription>>>();

export const getChatSubscriptionStats = (chat_id: number) =>
  apiClient
    .get(`api/chats/${chat_id}/subscriptions/stats`)
    .json<T.ResponseEnvelope<T.ChatSubscriptionStats>>();

export const getChatSubscriptionById = (
  chat_id: number,
  subscription_id: number,
) =>
  apiClient
    .get(`api/chats/${chat_id}/subscriptions/${subscription_id}`)
    .json<T.ResponseEnvelope<T.ChatSubscription>>();

export const updateChatSubscriptionStatus = (
  chat_id: number,
  subscription_id: number,
  data: T.UpdateChatSubscriptionStatusReq,
) =>
  apiClient
    .patch(`api/chats/${chat_id}/subscriptions/${subscription_id}`, {
      json: data,
    })
    .text(); // 204 No Content

export interface GetSubscriptionEventsParams {
  event_type?: string;
  created_from?: string;
  created_to?: string;
  limit?: number;
  cursor?: string;
}

export const getSubscriptionEvents = (
  chat_id: number,
  subscription_id: number,
  params?: GetSubscriptionEventsParams,
) =>
  apiClient
    .get(`api/chats/${chat_id}/subscriptions/${subscription_id}/events`, {
      searchParams: params as any,
    })
    .json<T.ResponseEnvelope<T.PaginationData<T.SubscriptionEvent>>>();

// User Subscriptions
export interface GetMySubscriptionsParams {
  status?: string;
  created_from?: string;
  created_to?: string;
  limit?: number;
  cursor?: string;
}

export const getMySubscriptions = (params?: GetMySubscriptionsParams) =>
  apiClient
    .get("api/subscriptions/me", { searchParams: params as any })
    .json<T.ResponseEnvelope<T.PaginationData<T.Subscription>>>();

export const getInviteLink = (chat_id: number) =>
  apiClient
    .get(`api/subscriptions/${chat_id}/invite`)
    .json<T.ResponseEnvelope<{ invite_link: string }>>();

export const subscribeToPlan = (chat_id: number, plan_id: number) =>
  apiClient
    .post(`api/subscriptions/${chat_id}/${plan_id}`)
    .json<
      T.ResponseEnvelope<{ invite_link: string; subscription_id: number }>
    >();

export const cancelSubscription = (subscription_id: number) =>
  apiClient.delete(`api/subscriptions/${subscription_id}`).text();

// --- Reviews ---
export const submitReview = (chat_id: number, data: T.SubmitReviewReq) =>
  apiClient
    .post(`api/chats/${chat_id}/reviews`, { json: data })
    .json<T.ResponseEnvelope<T.Review>>();

export const getPublicReviews = (
  chat_id: number,
  params?: { limit?: number; offset?: number },
) =>
  apiClient
    .get(`api/chats/${chat_id}/reviews`, { searchParams: params as any })
    .json<T.ResponseEnvelope<T.ReviewListResponse>>();

// --- Private Chat ---
export const getPrivateChatSettings = (chat_id: number) =>
  apiClient
    .get(`api/chats/${chat_id}/private-chat/settings`)
    .json<T.ResponseEnvelope<T.PrivateChatSettings>>();

export const updatePrivateChatSettings = (
  chat_id: number,
  data: T.UpdatePrivateChatSettingsReq,
) =>
  apiClient
    .patch(`api/chats/${chat_id}/private-chat/settings`, { json: data })
    .text();

export interface GetDialogsParams {
  status?: string;
  limit?: number;
  offset?: number;
}

export const getDialogs = (chat_id: number, params?: GetDialogsParams) =>
  apiClient
    .get(`api/chats/${chat_id}/private-chat/dialogs`, {
      searchParams: params as any,
    })
    .json<
      T.ResponseEnvelope<{ items: T.Dialog[]; limit: number; offset: number }>
    >();

export const updateDialogStatus = (
  chat_id: number,
  dialog_id: number,
  data: T.UpdateDialogStatusReq,
) =>
  apiClient
    .patch(`api/chats/${chat_id}/private-chat/dialogs/${dialog_id}`, {
      json: data,
    })
    .text();

export const getDialogMessages = (
  chat_id: number,
  dialog_id: number,
  params?: { limit?: number; offset?: number },
) =>
  apiClient
    .get(`api/chats/${chat_id}/private-chat/dialogs/${dialog_id}/messages`, {
      searchParams: params as any,
    })
    .json<
      T.ResponseEnvelope<{
        items: T.DialogMessage[];
        limit: number;
        offset: number;
      }>
    >();

export const sendMessage = (
  chat_id: number,
  dialog_id: number,
  data: T.SendMessageReq,
) =>
  apiClient
    .post(`api/chats/${chat_id}/private-chat/dialogs/${dialog_id}/messages`, {
      json: data,
    })
    .json<T.ResponseEnvelope<T.DialogMessage>>();

// --- Broadcasts ---
export const createBroadcast = (chat_id: number, data: T.CreateBroadcastReq) =>
  apiClient
    .post(`api/chats/${chat_id}/broadcasts`, { json: data })
    .json<T.ResponseEnvelope<T.Broadcast>>();

export const listBroadcasts = (
  chat_id: number,
  params?: { status?: string; limit?: number; offset?: number },
) =>
  apiClient
    .get(`api/chats/${chat_id}/broadcasts`, { searchParams: params as any })
    .json<
      T.ResponseEnvelope<{
        items: T.Broadcast[];
        limit: number;
        offset: number;
      }>
    >();

export const sendBroadcast = (chat_id: number, broadcast_id: number) =>
  apiClient
    .post(`api/chats/${chat_id}/broadcasts/${broadcast_id}/send`)
    .json<T.ResponseEnvelope<T.BroadcastSendResult>>();

export const listBroadcastDeliveries = (
  chat_id: number,
  broadcast_id: number,
  params?: { limit?: number; offset?: number },
) =>
  apiClient
    .get(`api/chats/${chat_id}/broadcasts/${broadcast_id}/deliveries`, {
      searchParams: params as any,
    })
    .json<
      T.ResponseEnvelope<{
        items: T.BroadcastDelivery[];
        limit: number;
        offset: number;
      }>
    >();

// --- Gifts & Promo Codes ---
export const createGift = (plan_id: number, data: T.CreateGiftReq) =>
  apiClient
    .post(`api/plans/${plan_id}/gifts`, { json: data })
    .json<T.ResponseEnvelope<T.Gift>>();

export const redeemGift = (gift_id: number) =>
  apiClient
    .post(`api/gifts/${gift_id}/redeem`)
    .json<T.ResponseEnvelope<T.Gift>>();

export const createPromoCode = (chat_id: number, data: T.CreatePromoCodeReq) =>
  apiClient
    .post(`api/chats/${chat_id}/promo-codes`, { json: data })
    .json<T.ResponseEnvelope<T.PromoCode>>();

export const previewPromoCode = (
  plan_id: number,
  data: T.PromoCodePreviewReq,
) =>
  apiClient
    .post(`api/plans/${plan_id}/promo-codes/preview`, { json: data })
    .json<T.ResponseEnvelope<T.PromoCodePreview>>();

export const applyPromoCode = (plan_id: number, data: T.ApplyPromoCodeReq) =>
  apiClient
    .post(`api/plans/${plan_id}/promo-codes/apply`, { json: data })
    .json<T.ResponseEnvelope<T.PromoCodeApplyResult>>();

// --- Analytics ---
export const getChatAnalytics = (chat_id: number, params?: T.AnalyticsFilter) =>
  apiClient
    .get(`api/chats/${chat_id}/analytics`, { searchParams: params as any })
    .json<T.ResponseEnvelope<T.ChatMetrics>>();

export const getCreatorAnalytics = (params?: T.AnalyticsFilter) =>
  apiClient
    .get("api/analytics/creator", { searchParams: params as any })
    .json<T.ResponseEnvelope<T.CreatorMetrics>>();

export const getPlatformAnalytics = (params?: T.AnalyticsFilter) =>
  apiClient
    .get("api/analytics/platform", { searchParams: params as any })
    .json<T.ResponseEnvelope<T.PlatformMetrics>>();
