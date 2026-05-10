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
  reviews: (chatId: number) => ['reviews', chatId] as const,
  privateChatSettings: (chatId: number) => ['privateChatSettings', chatId] as const,
  dialogs: (chatId: number) => ['dialogs', chatId] as const,
  dialogMessages: (chatId: number, dialogId: number) => ['dialogMessages', chatId, dialogId] as const,
  broadcasts: (chatId: number) => ['broadcasts', chatId] as const,
  broadcastDeliveries: (chatId: number, broadcastId: number) => ['broadcastDeliveries', chatId, broadcastId] as const,
  chatAnalytics: (chatId: number) => ['chatAnalytics', chatId] as const,
  creatorAnalytics: ['creatorAnalytics'] as const,
  platformAnalytics: ['platformAnalytics'] as const,
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
export const useUserProfile = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => requests.getUserProfile(),
    enabled: options?.enabled,
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

export const useLinkUserWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: T.LinkWalletRequest) => requests.linkUserWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
};

// --- Chat Hooks ---
export const useChats = (params?: requests.GetChatsParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.chats, params],
    queryFn: () => requests.getChats(params),
    enabled: options?.enabled,
  });
};

export const useChatCategories = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => requests.getChatCategories(),
    enabled: options?.enabled,
  });
};

export const useChatById = (chatId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.chat(chatId),
    queryFn: () => requests.getChatById(chatId),
    enabled: options?.enabled,
  });
};

export const useUpdateChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: number; data: T.UpdateChatReq }) => 
      requests.updateChat(chatId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat(variables.chatId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    },
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
    mutationFn: ({ planId, data, chatId }: { planId: number; data: T.UpdateSubscriptionPlanReq; chatId?: number }) => 
      requests.updatePlan(planId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plan(variables.planId) });
      if (variables.chatId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.plans(variables.chatId) });
      }
    },
  });
};

// --- Creator Subscriptions Hooks ---
export const useChatSubscriptions = (chatId: number, params?: requests.GetChatSubscriptionsParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.chatSubscriptions(chatId), params],
    queryFn: () => requests.getChatSubscriptions(chatId, params),
    enabled: options?.enabled,
  });
};

export const useChatSubscriptionStats = (chatId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.chatStats(chatId),
    queryFn: () => requests.getChatSubscriptionStats(chatId),
    enabled: options?.enabled,
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

export const useSubscriptionEvents = (chatId: number, subscriptionId: number, params?: requests.GetSubscriptionEventsParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.subscriptionEvents(chatId, subscriptionId), params],
    queryFn: () => requests.getSubscriptionEvents(chatId, subscriptionId, params),
    enabled: options?.enabled,
  });
};

// --- User Subscriptions Hooks ---
export const useMySubscriptions = (params?: requests.GetMySubscriptionsParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.mySubscriptions, params],
    queryFn: () => requests.getMySubscriptions(params),
    enabled: options?.enabled,
  });
};

export const useInviteLink = (chatId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.invite(chatId),
    queryFn: () => requests.getInviteLink(chatId),
    enabled: options?.enabled,
  });
};

export const useInitSubscribePayment = () => {
  return useMutation({
    mutationFn: ({ chatId, planId }: { chatId: number; planId: number }) => 
      requests.initSubscribePayment(chatId, planId),
  });
};

export const useSubscribeToPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, planId, data }: { chatId: number; planId: number; data: T.SubscribeWithTONReq }) => 
      requests.subscribeToPlan(chatId, planId, data),
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

// --- Review Hooks ---
export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: number; data: T.SubmitReviewReq }) => 
      requests.submitReview(chatId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews(variables.chatId) });
    },
  });
};

export const usePublicReviews = (chatId: number, params?: { limit?: number; offset?: number }, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.reviews(chatId), params],
    queryFn: () => requests.getPublicReviews(chatId, params),
    enabled: options?.enabled,
  });
};

// --- Private Chat Hooks ---
export const usePrivateChatSettings = (chatId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.privateChatSettings(chatId),
    queryFn: () => requests.getPrivateChatSettings(chatId),
    enabled: options?.enabled,
  });
};

export const useUpdatePrivateChatSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: number; data: T.UpdatePrivateChatSettingsReq }) => 
      requests.updatePrivateChatSettings(chatId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.privateChatSettings(variables.chatId) });
    },
  });
};

export const useDialogs = (chatId: number, params?: requests.GetDialogsParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.dialogs(chatId), params],
    queryFn: () => requests.getDialogs(chatId, params),
    enabled: options?.enabled,
  });
};

export const useUpdateDialogStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, dialogId, data }: { chatId: number; dialogId: number; data: T.UpdateDialogStatusReq }) => 
      requests.updateDialogStatus(chatId, dialogId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dialogs(variables.chatId) });
    },
  });
};

export const useDialogMessages = (chatId: number, dialogId: number, params?: { limit?: number; offset?: number }, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.dialogMessages(chatId, dialogId), params],
    queryFn: () => requests.getDialogMessages(chatId, dialogId, params),
    enabled: options?.enabled,
  });
};

export const useSendMessageToDialog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, dialogId, data }: { chatId: number; dialogId: number; data: T.SendMessageReq }) => 
      requests.sendMessage(chatId, dialogId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dialogMessages(variables.chatId, variables.dialogId) });
    },
  });
};

// --- Broadcast Hooks ---
export const useCreateBroadcast = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: number; data: T.CreateBroadcastReq }) => 
      requests.createBroadcast(chatId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.broadcasts(variables.chatId) });
    },
  });
};

export const useBroadcasts = (chatId: number, params?: { status?: string; limit?: number; offset?: number }, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.broadcasts(chatId), params],
    queryFn: () => requests.listBroadcasts(chatId, params),
    enabled: options?.enabled,
  });
};

export const useSendBroadcast = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, broadcastId }: { chatId: number; broadcastId: number }) => 
      requests.sendBroadcast(chatId, broadcastId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.broadcasts(variables.chatId) });
    },
  });
};

export const useBroadcastDeliveries = (chatId: number, broadcastId: number, params?: { limit?: number; offset?: number }, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.broadcastDeliveries(chatId, broadcastId), params],
    queryFn: () => requests.listBroadcastDeliveries(chatId, broadcastId, params),
    enabled: options?.enabled,
  });
};

// --- Gift & Promo Hooks ---
export const useCreateGift = () => {
  return useMutation({
    mutationFn: ({ planId, data }: { planId: number; data: T.CreateGiftReq }) => 
      requests.createGift(planId, data),
  });
};

export const useRedeemGift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (giftId: number) => requests.redeemGift(giftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mySubscriptions });
    },
  });
};

export const useCreatePromoCode = () => {
  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: number; data: T.CreatePromoCodeReq }) => 
      requests.createPromoCode(chatId, data),
  });
};

export const usePreviewPromoCode = () => {
  return useMutation({
    mutationFn: ({ planId, data }: { planId: number; data: T.PromoCodePreviewReq }) => 
      requests.previewPromoCode(planId, data),
  });
};

export const useApplyPromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }: { planId: number; data: T.ApplyPromoCodeReq }) => 
      requests.applyPromoCode(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mySubscriptions });
    },
  });
};

// --- Analytics Hooks ---
export const useChatAnalytics = (chatId: number, params?: T.AnalyticsFilter, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.chatAnalytics(chatId), params],
    queryFn: () => requests.getChatAnalytics(chatId, params),
    enabled: options?.enabled,
  });
};

export const useCreatorAnalytics = (params?: T.AnalyticsFilter, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.creatorAnalytics, params],
    queryFn: () => requests.getCreatorAnalytics(params),
    enabled: options?.enabled,
  });
};

export const usePlatformAnalytics = (params?: T.AnalyticsFilter, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.platformAnalytics, params],
    queryFn: () => requests.getPlatformAnalytics(params),
    enabled: options?.enabled,
  });
};
