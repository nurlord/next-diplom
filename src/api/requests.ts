import { apiClient } from './client';
import * as T from './types';

// Auth
export const auth = (data: T.AuthRequest) => 
  apiClient.post('auth', { json: data }).json<T.ResponseEnvelope<T.AuthResponse>>();

export const refreshToken = (data: T.RefreshTokenRequest) => 
  apiClient.post('auth/refresh', { json: data }).json<T.ResponseEnvelope<T.AuthResponse>>();

// User
export const getUserProfile = () => 
  apiClient.get('api/user').json<T.ResponseEnvelope<T.User>>();

export const updateUserProfile = (data: T.UpdateUserRequest) => 
  apiClient.patch('api/user', { json: data }).json<T.ResponseEnvelope<T.User>>();

export const deleteUserProfile = () => 
  apiClient.delete('api/user').text(); // 204 No Content

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
  apiClient.get('api/chats', { searchParams: params as any }).json<T.ResponseEnvelope<T.PaginationData<T.ListChatsItem>>>();

export const getChatCategories = () => 
  apiClient.get('api/chats/categories').json<T.ResponseEnvelope<T.Category[]>>();

export const getChatById = (chat_id: number) => 
  apiClient.get(`api/chats/${chat_id}`).json<T.ResponseEnvelope<T.Chat>>();

// Plans
export const getChatPlans = (chat_id: number) => 
  apiClient.get(`api/chats/${chat_id}/plans`).json<T.ResponseEnvelope<T.SubscriptionPlan[]>>();

export const createChatPlan = (chat_id: number, data: T.CreateSubscriptionPlanReq) => 
  apiClient.post(`api/chats/${chat_id}/plans`, { json: data }).json<T.ResponseEnvelope<{ subscription_plan_id: number }>>();

export const getPlanById = (plan_id: number) => 
  apiClient.get(`api/plans/${plan_id}`).json<T.ResponseEnvelope<T.SubscriptionPlan>>();

export const updatePlan = (plan_id: number, data: T.UpdateSubscriptionPlanReq) => 
  apiClient.patch(`api/plans/${plan_id}`, { json: data }).json<T.ResponseEnvelope<T.SubscriptionPlan>>();

// Creator Subscriptions
export interface GetChatSubscriptionsParams {
  status?: string;
  created_from?: string;
  created_to?: string;
  limit?: number;
  cursor?: string;
}

export const getChatSubscriptions = (chat_id: number, params?: GetChatSubscriptionsParams) => 
  apiClient.get(`api/chats/${chat_id}/subscriptions`, { searchParams: params as any }).json<T.ResponseEnvelope<T.PaginationData<T.ChatSubscription>>>();

export const getChatSubscriptionStats = (chat_id: number) => 
  apiClient.get(`api/chats/${chat_id}/subscriptions/stats`).json<T.ResponseEnvelope<T.ChatSubscriptionStats>>();

export const updateChatSubscriptionStatus = (chat_id: number, subscription_id: number, data: T.UpdateChatSubscriptionStatusReq) => 
  apiClient.patch(`api/chats/${chat_id}/subscriptions/${subscription_id}`, { json: data }).text();

export interface GetSubscriptionEventsParams {
  event_type?: string;
  created_from?: string;
  created_to?: string;
  limit?: number;
  cursor?: string;
}

export const getSubscriptionEvents = (chat_id: number, subscription_id: number, params?: GetSubscriptionEventsParams) => 
  apiClient.get(`api/chats/${chat_id}/subscriptions/${subscription_id}/events`, { searchParams: params as any }).json<T.ResponseEnvelope<T.PaginationData<T.SubscriptionEvent>>>();

// User Subscriptions
export interface GetMySubscriptionsParams {
  status?: string;
  created_from?: string;
  created_to?: string;
  limit?: number;
  cursor?: string;
}

export const getMySubscriptions = (params?: GetMySubscriptionsParams) => 
  apiClient.get('api/subscriptions/me', { searchParams: params as any }).json<T.ResponseEnvelope<T.PaginationData<T.Subscription>>>();

export const getInviteLink = (chat_id: number) => 
  apiClient.get(`api/subscriptions/${chat_id}/invite`).json<T.ResponseEnvelope<{ invite_link: string }>>();

export const subscribeToPlan = (chat_id: number, plan_id: number) => 
  apiClient.post(`api/subscriptions/${chat_id}/${plan_id}`).json<T.ResponseEnvelope<{ invite_link: string; subscription_id: number }>>();

export const cancelSubscription = (subscription_id: number) => 
  apiClient.delete(`api/subscriptions/${subscription_id}`).text();
