import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as requests from './requests';
import * as T from './types';

export const queryKeys = {
  user: ['user'] as const,
  chats: ['chats'] as const,
  chat: (id: number) => ['chats', id] as const,
  categories: ['categories'] as const,
  plans: (chatId: number) => ['plans', chatId] as const,
  plan: (planId: number) => ['plan', planId] as const,
  chatSubscriptions: (chatId: number) => ['chatSubscriptions', chatId] as const,
  chatStats: (chatId: number) => ['chatStats', chatId] as const,
  subscriptionEvents: (chatId: number, subId: number) => ['events', chatId, subId] as const,
  mySubscriptions: ['mySubscriptions'] as const,
  invite: (chatId: number) => ['invite', chatId] as const,
};

// --- Auth Hooks ---
export const useAuth = () => {
  return useMutation({
    mutationFn: (data: T.AuthRequest) => requests.auth(data),
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (data: T.RefreshTokenRequest) => requests.refreshToken(data),
  });
};

// --- User Hooks ---
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => requests.getUserProfile(),
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: T.UpdateUserRequest) => requests.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
};

export const useDeleteUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => requests.deleteUserProfile(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
};

// --- Chat Hooks ---
export const useChats = (params?: requests.GetChatsParams) => {
  return useQuery({
    queryKey: [...queryKeys.chats, params],
    queryFn: () => requests.getChats(params),
  });
};

export const useChatCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => requests.getChatCategories(),
  });
};

export const useChatById = (chatId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.chat(chatId),
    queryFn: () => requests.getChatById(chatId),
    enabled: options?.enabled,
  });
};

// --- Plan Hooks ---
export const useChatPlans = (chatId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.plans(chatId),
    queryFn: () => requests.getChatPlans(chatId),
    enabled: options?.enabled,
  });
};

export const useCreateChatPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: number; data: T.CreateSubscriptionPlanReq }) => 
      requests.createChatPlan(chatId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans(variables.chatId) });
    },
  });
};

export const usePlanById = (planId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.plan(planId),
    queryFn: () => requests.getPlanById(planId),
    enabled: options?.enabled,
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }: { planId: number; data: T.UpdateSubscriptionPlanReq }) => 
      requests.updatePlan(planId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plan(variables.planId) });
    },
  });
};

// --- Creator Subscriptions Hooks ---
export const useChatSubscriptions = (chatId: number, params?: requests.GetChatSubscriptionsParams) => {
  return useQuery({
    queryKey: [...queryKeys.chatSubscriptions(chatId), params],
    queryFn: () => requests.getChatSubscriptions(chatId, params),
  });
};

export const useChatSubscriptionStats = (chatId: number) => {
  return useQuery({
    queryKey: queryKeys.chatStats(chatId),
    queryFn: () => requests.getChatSubscriptionStats(chatId),
  });
};

export const useUpdateChatSubscriptionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, subscriptionId, data }: { chatId: number; subscriptionId: number; data: T.UpdateChatSubscriptionStatusReq }) => 
      requests.updateChatSubscriptionStatus(chatId, subscriptionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatSubscriptions(variables.chatId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatStats(variables.chatId) });
    },
  });
};

export const useSubscriptionEvents = (chatId: number, subscriptionId: number, params?: requests.GetSubscriptionEventsParams) => {
  return useQuery({
    queryKey: [...queryKeys.subscriptionEvents(chatId, subscriptionId), params],
    queryFn: () => requests.getSubscriptionEvents(chatId, subscriptionId, params),
  });
};

// --- User Subscriptions Hooks ---
export const useMySubscriptions = (params?: requests.GetMySubscriptionsParams) => {
  return useQuery({
    queryKey: [...queryKeys.mySubscriptions, params],
    queryFn: () => requests.getMySubscriptions(params),
  });
};

export const useInviteLink = (chatId: number) => {
  return useQuery({
    queryKey: queryKeys.invite(chatId),
    queryFn: () => requests.getInviteLink(chatId),
  });
};

export const useSubscribeToPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, planId }: { chatId: number; planId: number }) => 
      requests.subscribeToPlan(chatId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mySubscriptions });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: number) => requests.cancelSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mySubscriptions });
    },
  });
};
