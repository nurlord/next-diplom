"use client";

import {
  TrendingUp,
  Users,
  Settings,
  ArrowUpRight,
  X,
  CheckCheck,
  Pencil,
  History,
  Truck,
  RotateCw,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/providers/AuthProvider";
import { queryKeys, useUserProfile, useChats, useChatSubscriptionStats, useChatPlans, useCreateChatPlan, useUpdateUserProfile, useChatAnalytics, useChatSubscriptions, useUpdateChatSubscriptionStatus, useBroadcasts, useCreateBroadcast, useSendBroadcast, useCreateGift, useCreatePromoCode, usePrivateChatSettings, useUpdatePrivateChatSettings, useDialogs, useDialogMessages, useSendMessageToDialog, useUpdateDialogStatus, useUpdatePlan, useBroadcastDeliveries, useSubscriptionEvents, useCreatorAnalytics, useDeleteUserProfile, usePlatformAnalytics, useChatCategories, useUpdateChat, useChatById } from "@/api/hooks";

export default function AdminDashboard() {
  const { userId, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const queryClient = useQueryClient();

  // Debug log for troubleshooting registration
  useEffect(() => {
    if (userId) {
      console.log("AdminDashboard: Current UserId:", userId);
    }
  }, [userId]);
  
  const handleSync = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    await queryClient.invalidateQueries({ queryKey: queryKeys.user });
  };
  
  const { data: userRes, isLoading: isUserLoading } = useUserProfile({ enabled: isAuthenticated });
  const user = userRes?.data;

  // Assume the user owns chats. Fetch them.
  const { data: chatsRes } = useChats(
    userId ? { owner_id: userId } : undefined,
    { enabled: !!userId }
  );
  
  // For MVP, just pick the first chat they own for the dashboard
  const myChat = chatsRes?.data?.items?.[0];

  const { data: statsRes } = useChatSubscriptionStats(myChat?.id || 0, { enabled: !!myChat?.id });
  const stats = statsRes?.data;

  const { data: chatDetailRes } = useChatById(myChat?.id || 0, { enabled: !!myChat?.id });

  const { data: plansRes } = useChatPlans(myChat?.id || 0, { enabled: !!myChat?.id });
  const plans = plansRes?.data;

  const { data: analyticsRes } = useChatAnalytics(myChat?.id || 0, {}, { enabled: !!myChat?.id });
  const analytics = analyticsRes?.data;

  const { data: subsRes } = useChatSubscriptions(myChat?.id || 0, { limit: 10 }, { enabled: !!myChat?.id });
  const subscribers = subsRes?.data?.items || [];
  const { mutateAsync: updateSubStatus } = useUpdateChatSubscriptionStatus();

  const handleUpdateStatus = async (subId: number, status: string) => {
    if (!myChat?.id) return;
    try {
      await updateSubStatus({ chatId: myChat.id, subscriptionId: subId, data: { status } });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Create Plan Form State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: "",
    price: "0",
    plan_type: "periodic",
    duration_days: "30",
    trial_days: "0",
  });
  const { mutateAsync: createPlan, isPending: isCreatingPlan } = useCreateChatPlan();

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myChat?.id) return;
    try {
      const payload = {
        ...newPlan,
        price: parseFloat(newPlan.price) || 0,
        duration_days: newPlan.plan_type === 'lifetime' ? 0 : (parseInt(newPlan.duration_days) || 30),
        trial_days: parseInt(newPlan.trial_days) || 0,
      };
      await createPlan({ chatId: myChat.id, data: payload });
      setShowPlanModal(false);
      setNewPlan({ title: "", price: "0", plan_type: "periodic", duration_days: "30", trial_days: "0" });
    } catch (err) {
      console.error("Failed to create plan", err);
      alert("Failed to create plan. Check console.");
    }
  };

  // Profile Edit State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
  });
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateUserProfile();
  const { mutateAsync: deleteProfile, isPending: isDeletingProfile } = useDeleteUserProfile();

  const openProfileModal = () => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
      });
      setShowProfileModal(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setShowProfileModal(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile.");
    }
  };

  const handleDeleteProfile = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await deleteProfile();
        setShowProfileModal(false);
      } catch (err) {
        console.error("Failed to delete profile", err);
        alert("Failed to delete account.");
      }
    }
  };

  // Broadcast State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const { data: broadcastsRes } = useBroadcasts(myChat?.id || 0, { limit: 5 }, { enabled: !!myChat?.id });
  const broadcasts = broadcastsRes?.data?.items || [];
  const { mutateAsync: createBroadcast, isPending: isCreatingBroadcast } = useCreateBroadcast();
  const { mutateAsync: sendBroadcast, isPending: isSendingBroadcast } = useSendBroadcast();

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myChat?.id) return;
    try {
      await createBroadcast({ chatId: myChat.id, data: { body: broadcastText } });
      setShowBroadcastModal(false);
      setBroadcastText("");
    } catch (err) {
      console.error("Failed to create broadcast", err);
    }
  };

  const handleSendBroadcast = async (broadcastId: number) => {
    if (!myChat?.id) return;
    if (confirm("Send this broadcast to all active subscribers?")) {
      try {
        await sendBroadcast({ chatId: myChat.id, broadcastId: broadcastId });
        alert("Broadcast sent successfully!");
      } catch (err) {
        console.error("Failed to send broadcast", err);
      }
    }
  };

  // Gift & Promo State
  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftCreated, setGiftCreated] = useState<{ id: number } | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(10);
  const [maxRedemptions, setMaxRedemptions] = useState(100);

  const { mutateAsync: createGift, isPending: isCreatingGift } = useCreateGift();
  const { mutateAsync: createPromo, isPending: isCreatingPromo } = useCreatePromoCode();

  const handleCreateGift = async () => {
    if (!activePlanId) return;
    try {
      const res = await createGift({ planId: activePlanId, data: {} });
      setGiftCreated({ id: res.data?.id ?? 0 });
    } catch (err) {
      console.error("Failed to create gift", err);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myChat?.id || !activePlanId) return;
    try {
      await createPromo({ 
        chatId: myChat.id, 
        data: { 
          code: promoCode, 
          discount_type: discountType,
          discount_value: discountValue, 
          max_redemptions: maxRedemptions, 
          plan_id: activePlanId 
        } 
      });
      setPromoSuccess(true);
      setPromoCode("");
    } catch (err) {
      console.error("Failed to create promo", err);
    }
  };

  // Private Chat State
  const { data: pcSettingsRes } = usePrivateChatSettings(myChat?.id || 0, { enabled: !!myChat?.id });
  const pcSettings = pcSettingsRes?.data;
  const { mutateAsync: updatePCSettings, isPending: isUpdatingPCSettings } = useUpdatePrivateChatSettings();
  
  const { data: dialogsRes } = useDialogs(myChat?.id || 0, { limit: 5 }, { enabled: !!myChat?.id });
  const dialogs = dialogsRes?.data?.items || [];

  const handleTogglePrivateChat = async () => {
    if (!myChat?.id) return;
    try {
      await updatePCSettings({ chatId: myChat.id, data: { is_enabled: !pcSettings?.is_enabled } });
    } catch (err) {
      console.error("Failed to toggle private chat", err);
    }
  };

  const [activeDialogId, setActiveDialogId] = useState<number | null>(null);
  const { data: messagesRes } = useDialogMessages(myChat?.id || 0, activeDialogId || 0, {}, { enabled: !!activeDialogId });
  const messages = messagesRes?.data?.items || [];
  const { mutateAsync: sendMessage, isPending: isSendingMessage } = useSendMessageToDialog();
  const { mutateAsync: updateDialogStatus, isPending: isClosingDialog } = useUpdateDialogStatus();
  const [replyText, setReplyText] = useState("");

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myChat?.id || !activeDialogId || !replyText.trim()) return;
    try {
      await sendMessage({ chatId: myChat.id, dialogId: activeDialogId, data: { text: replyText } });
      setReplyText("");
    } catch (err) {
      console.error("Failed to send reply", err);
    }
  };

  const handleCloseDialog = async () => {
    if (!myChat?.id || !activeDialogId) return;
    if (confirm("Mark this dialog as closed/resolved?")) {
      try {
        await updateDialogStatus({ chatId: myChat.id, dialogId: activeDialogId, data: { status: "closed" } });
        setActiveDialogId(null);
      } catch (err) {
        console.error("Failed to close dialog", err);
      }
    }
  };

  // Edit plan state
  const [editingPlan, setEditingPlan] = useState<{ id: number; price: string; status: string; trial_days: string } | null>(null);
  const { mutateAsync: updatePlan, isPending: isUpdatingPlan } = useUpdatePlan();

  const handleEditPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !myChat?.id) return;
    try {
      await updatePlan({ 
        planId: editingPlan.id, 
        chatId: myChat.id,
        data: { 
          price: parseFloat(editingPlan.price) || 0, 
          status: editingPlan.status, 
          trial_days: parseInt(editingPlan.trial_days) || 0 
        } 
      });
      setEditingPlan(null);
    } catch (err) {
      console.error("Failed to update plan", err);
      alert("Failed to update plan.");
    }
  };

  // Chat/Channel Settings State
  const [showChatModal, setShowChatModal] = useState(false);
  const { data: catRes } = useChatCategories({ enabled: isAuthenticated });
  const categories = catRes?.data || [];
  const [chatForm, setChatForm] = useState({
    category_id: 0,
    description: "",
  });
  const { mutateAsync: updateChat, isPending: isUpdatingChat } = useUpdateChat();

  const openChatModal = () => {
    const chatDetail = chatDetailRes?.data;
    if (chatDetail) {
      setChatForm({
        category_id: chatDetail.categoryID || 0,
        description: chatDetail.description || "",
      });
      setShowChatModal(true);
    }
  };

  const handleUpdateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myChat?.id) return;
    try {
      await updateChat({ chatId: myChat.id, data: chatForm });
      setShowChatModal(false);
    } catch (err) {
      console.error("Failed to update chat", err);
      alert("Failed to update channel settings.");
    }
  };

  // Broadcast deliveries state
  const [deliveryBroadcastId, setDeliveryBroadcastId] = useState<number | null>(null);
  const { data: deliveriesRes } = useBroadcastDeliveries(myChat?.id || 0, deliveryBroadcastId || 0, {}, { enabled: !!deliveryBroadcastId });
  const deliveries = deliveriesRes?.data?.items || [];

  // Subscription events state
  const [activeSubId, setActiveSubId] = useState<number | null>(null);
  const { data: eventsRes } = useSubscriptionEvents(myChat?.id || 0, activeSubId || 0, {}, { enabled: !!activeSubId });
  const subEvents = eventsRes?.data?.items || [];

  // Creator analytics
  const { data: creatorAnalyticsRes } = useCreatorAnalytics({}, { enabled: !!myChat?.id });
  const creatorAnalytics = creatorAnalyticsRes?.data;

  // Platform analytics (super-admin level)
  const { data: platformAnalyticsRes } = usePlatformAnalytics({}, { enabled: isAuthenticated });
  const platformAnalytics = platformAnalyticsRes?.data;

  if (isAuthLoading || isUserLoading) {
    return <div className="p-8 text-center text-neutral-500 animate-pulse">Loading profile...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="p-8 text-center text-neutral-500">Please open this app from Telegram to login.</div>;
  }

  return (
    <div className="pb-24 pt-6 px-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <Image
            unoptimized
            width={40}
            height={40}
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.first_name}&backgroundColor=b6e3f4`}
            className="w-10 h-10 rounded-full border border-neutral-700 bg-neutral-800"
            alt="Profile"
          />
          <div>
            <h1 className="text-sm font-bold text-neutral-200">
              {user.first_name} {user.last_name}
            </h1>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              {myChat ? myChat.title : "No Active Channel"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {myChat && (
            <button 
              onClick={openChatModal}
              className="p-2 bg-neutral-800 rounded-full border border-neutral-700"
              title="Channel Settings"
            >
              <Users size={18} className="text-neutral-400" />
            </button>
          )}
          <button 
            onClick={handleSync}
            className="p-2 bg-neutral-800 rounded-full border border-neutral-700 active:rotate-180 transition-transform duration-500"
            title="Sync data"
          >
            <RotateCw size={18} className="text-neutral-400" />
          </button>
          <button 
            onClick={openProfileModal}
            className="p-2 bg-neutral-800 rounded-full border border-neutral-700"
            title="Profile Settings"
          >
            <Settings size={18} className="text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Balance Card (The "Wallet") */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-2xl shadow-xl shadow-blue-900/20 text-white relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -right-5 -top-5 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

        <p className="text-blue-100 text-sm font-medium mb-1">Earned via Subscriptions</p>
        <h2 className="text-4xl font-bold mb-4 flex items-baseline gap-1">
          {user.earned || 0} <span className="text-lg font-normal text-blue-200">$ (Demo)</span>
        </h2>

        <div className="flex gap-3">
          <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            <ArrowUpRight size={16} /> Withdraw
          </button>
          <button className="flex-1 bg-black/20 hover:bg-black/30 backdrop-blur-sm py-2 rounded-lg text-sm font-semibold transition-colors">
            History
          </button>
        </div>
      </div>

      {/* Creator Overview Analytics */}
      {creatorAnalytics && (
        <div className="space-y-3">
          <h3 className="font-semibold text-md px-1">Creator Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
              <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Total Channels</p>
              <p className="text-2xl font-bold">{creatorAnalytics.total_chats || 0}</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
              <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Total Subs</p>
              <p className="text-2xl font-bold text-blue-400">{creatorAnalytics.total_subscribers || 0}</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
              <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Active Subs</p>
              <p className="text-2xl font-bold text-green-400">{creatorAnalytics.active_subscribers || 0}</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
              <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-bold text-orange-400">{creatorAnalytics.total_revenue || 0} TON</p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Analytics (super-admin — only shown if backend grants access) */}
      {platformAnalytics && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <h3 className="font-semibold text-md">Platform Overview</h3>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">Admin</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900 border border-purple-500/10 p-4 rounded-2xl">
              <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Total Users</p>
              <p className="text-2xl font-bold text-purple-400">{platformAnalytics.total_users || 0}</p>
            </div>
            <div className="bg-neutral-900 border border-purple-500/10 p-4 rounded-2xl">
              <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Total Channels</p>
              <p className="text-2xl font-bold text-purple-400">{platformAnalytics.total_chats || 0}</p>
            </div>
            <div className="bg-neutral-900 border border-purple-500/10 p-4 rounded-2xl">
              <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Subscriptions</p>
              <p className="text-2xl font-bold text-purple-400">{platformAnalytics.total_subscriptions || 0}</p>
            </div>
            <div className="bg-neutral-900 border border-purple-500/10 p-4 rounded-2xl">
              <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Platform Revenue</p>
              <p className="text-2xl font-bold text-purple-400">{platformAnalytics.total_revenue || 0} TON</p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics & Stats */}
      {myChat && (
        <div className="space-y-3">
          <h3 className="font-semibold text-md px-1">Performance & Stats</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity text-purple-500">
                <Users size={64} />
              </div>
              <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Active Subs</p>
              <p className="text-2xl font-bold">{stats?.active || 0}</p>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity text-orange-500">
                <TrendingUp size={64} />
              </div>
              <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Revenue Hint</p>
              <p className="text-2xl font-bold text-orange-400">{stats?.active_revenue_hint || 0}</p>
            </div>
          </div>

          {analytics && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
                  <p className="text-[10px] text-neutral-500 font-bold mb-1 uppercase tracking-tighter">New (30d)</p>
                  <p className="text-xl font-bold text-green-400">+{analytics.new_subscribers || 0}</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
                  <p className="text-[10px] text-neutral-500 font-bold mb-1 uppercase tracking-tighter">Churn (30d)</p>
                  <p className="text-xl font-bold text-red-400">-{analytics.churned_subscribers || 0}</p>
                </div>
              </div>
              
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between shadow-inner bg-gradient-to-r from-neutral-900 to-neutral-800/50">
                <div>
                  <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Total Real Revenue</p>
                  <p className="text-xl font-bold text-white tracking-tight">{analytics.revenue || 0} TON</p>
                </div>
                <div className="h-10 w-24 bg-neutral-800 rounded-lg flex items-end gap-1 px-2 pb-2 border border-neutral-700/50">
                  <div className="flex-1 bg-blue-500/20 h-1/2 rounded-t-[2px]"></div>
                  <div className="flex-1 bg-blue-500/40 h-2/3 rounded-t-[2px]"></div>
                  <div className="flex-1 bg-blue-500/60 h-3/4 rounded-t-[2px]"></div>
                  <div className="flex-1 bg-blue-500 h-full rounded-t-[2px]"></div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {!myChat && (
        <div className="bg-neutral-800/50 border border-neutral-800 p-6 rounded-xl text-center">
          <p className="text-sm text-neutral-400 mb-3">You don&apos;t have any registered chats.</p>
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            Register a Channel
          </button>
        </div>
      )}

      {/* Private Chat Support */}
      {myChat && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-semibold text-md">Subscriber Support</h3>
            <button 
              onClick={handleTogglePrivateChat}
              disabled={isUpdatingPCSettings}
              className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all border
                ${pcSettings?.is_enabled 
                  ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                  : 'bg-neutral-800 text-neutral-500 border-neutral-700'}`}
            >
              {isUpdatingPCSettings ? '...' : pcSettings?.is_enabled ? 'SUPPORT ON' : 'SUPPORT OFF'}
            </button>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800">
            {dialogs.length > 0 ? (
              dialogs.map((d) => (
                <div 
                  key={d.id} 
                  onClick={() => d.id && setActiveDialogId(d.id)}
                  className="p-4 flex items-center justify-between hover:bg-neutral-800/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-blue-400">
                      {d.username?.[0] || d.user_id?.toString()[0] || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{d.username || `User #${d.user_id}`}</p>
                      <p className="text-[10px] text-neutral-500">Status: <span className="text-neutral-400 font-bold uppercase tracking-widest">{d.status}</span></p>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-neutral-600 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-neutral-900">
                <p className="text-xs text-neutral-500">No active support dialogs.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Broadcasts Section ... */}
      {myChat && (
        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <h3 className="font-semibold text-md">Broadcasts</h3>
            <button onClick={() => setShowBroadcastModal(true)} className="text-xs text-blue-400 font-medium">New Message</button>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800">
            {broadcasts.length > 0 ? (
              broadcasts.map((b) => (
                <div key={b.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-neutral-400">Created {b.created_at ? new Date(b.created_at).toLocaleDateString() : ''}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight
                      ${b.status === 'sent' ? 'bg-blue-500/10 text-blue-400' : 'bg-neutral-800 text-neutral-500'}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2 text-neutral-200">{b.body}</p>
                  <div className="flex items-center gap-3">
                    {b.status === 'pending' && (
                      <button 
                        onClick={() => b.id && handleSendBroadcast(b.id)}
                        disabled={isSendingBroadcast}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        Process & Send Now &rarr;
                      </button>
                    )}
                    {b.status === 'sent' && b.id && (
                      <button
                        onClick={() => setDeliveryBroadcastId(b.id!)}
                        className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1"
                      >
                        <Truck size={12} /> View Report
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-neutral-500">No broadcasts found.</div>
            )}
          </div>
        </div>
      )}

      {/* Subscriber Management Section ... */}
      {myChat && (
        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <h3 className="font-semibold text-md">Recent Subscribers</h3>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            {subscribers.length > 0 ? (
              <div className="divide-y divide-neutral-800">
                {subscribers.map((sub) => (
                  <div key={sub.subscription_id} className="p-4 flex items-center justify-between hover:bg-neutral-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold">
                        {sub.username?.[0] || sub.user_id?.toString()[0] || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{sub.username || `User #${sub.user_id}`}</p>
                        <p className="text-[10px] text-neutral-500">Joined {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => sub.subscription_id && setActiveSubId(sub.subscription_id)}
                        className="p-1.5 text-neutral-500 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        title="View history"
                      >
                        <History size={14} />
                      </button>
                      <select 
                        value={sub.status}
                        onChange={(e) => sub.subscription_id && handleUpdateStatus(sub.subscription_id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border appearance-none focus:outline-none transition-colors
                          ${sub.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            sub.status === 'expired' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                            'bg-neutral-800 text-neutral-400 border-neutral-700'}`}
                      >
                        <option value="active">ACTIVE</option>
                        <option value="expired">EXPIRED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-xs text-neutral-500">No subscribers found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Plans Section ... */}
      {myChat && (
        <div>
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-semibold text-md">Your Plans</h3>
            <button onClick={() => setShowPlanModal(true)} className="text-xs text-blue-400 font-medium">Add Plan</button>
          </div>

          {plans && plans.length > 0 ? (
            <div className="grid gap-3">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{plan.title}</p>
                      <p className="text-xs text-neutral-500 flex gap-2">
                        <span>{plan.price} TON</span>
                        <span>•</span>
                        <span>{plan.plan_type}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPlan({ id: plan.id!, price: String(plan.price || 0), status: plan.status || 'active', trial_days: String(plan.trial_days || 0) })}
                        className="p-1.5 text-neutral-500 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Edit plan"
                      >
                        <Pencil size={14} />
                      </button>
                      <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase ${plan.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-neutral-800 text-neutral-400'}`}>
                        {plan.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-neutral-800/50">
                    <button 
                      onClick={() => { setActivePlanId(plan.id!); setShowGiftModal(true); }}
                      className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold rounded-lg border border-neutral-700 transition-colors"
                    >
                      GENERATE GIFT
                    </button>
                    <button 
                      onClick={() => { setActivePlanId(plan.id!); setShowPromoModal(true); }}
                      className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold rounded-lg border border-neutral-700 transition-colors"
                    >
                      ADD PROMO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 text-center py-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              No plans created yet.
            </p>
          )}
        </div>
      )}

      {/* Create Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setShowPlanModal(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4">Create New Plan</h3>
            
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Plan Title</label>
                <input 
                  required
                  type="text" 
                  value={newPlan.title}
                  onChange={e => setNewPlan({...newPlan, title: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="e.g. VIP Access" 
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-neutral-400 mb-1">Price (TON)</label>
                  <input 
                    required
                    type="text" 
                    value={newPlan.price}
                    onChange={e => setNewPlan({...newPlan, price: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                    placeholder="0.0" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-neutral-400 mb-1">Type</label>
                  <select 
                    value={newPlan.plan_type}
                    onChange={e => setNewPlan({...newPlan, plan_type: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 appearance-none"
                  >
                    <option value="periodic">Periodic</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>

              {newPlan.plan_type === 'periodic' && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-400 mb-1">Duration (Days)</label>
                    <input 
                      required
                      type="text" 
                      value={newPlan.duration_days}
                      onChange={e => setNewPlan({...newPlan, duration_days: e.target.value})}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-400 mb-1">Trial (Days)</label>
                    <input 
                      type="text" 
                      value={newPlan.trial_days}
                      onChange={e => setNewPlan({...newPlan, trial_days: e.target.value})}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isCreatingPlan}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isCreatingPlan ? "Creating..." : "Create Plan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        form={profileForm}
        setForm={setProfileForm}
        onSubmit={handleUpdateProfile}
        onDelete={handleDeleteProfile}
        isLoading={isUpdatingProfile}
        isDeleting={isDeletingProfile}
      />

      <RegistrationModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />

      {/* Gift Creation Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => { setShowGiftModal(false); setGiftCreated(null); }} className="absolute top-4 right-4 text-neutral-500">
              <X size={20} />
            </button>

            {giftCreated ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCheck size={28} className="text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Gift Created!</h3>
                  <p className="text-sm text-neutral-400 mt-1">Share the gift ID with the recipient.</p>
                </div>
                <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-3 font-mono text-lg font-bold tracking-widest text-center">
                  #{giftCreated.id}
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(String(giftCreated.id)); }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors"
                >
                  Copy Gift ID
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-2">Create Gift Link</h3>
                <p className="text-sm text-neutral-400 mb-6">Generating a gift will activate a subscription for anyone who redeems it.</p>
                <button 
                  onClick={handleCreateGift}
                  disabled={isCreatingGift}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isCreatingGift ? "Generating..." : "Generate Gift"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Promo Code Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => { setShowPromoModal(false); setPromoSuccess(false); }} className="absolute top-4 right-4 text-neutral-500">
              <X size={20} />
            </button>

            {promoSuccess ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCheck size={28} className="text-green-400" />
                </div>
                <h3 className="text-lg font-bold">Promo Code Created!</h3>
                <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-3 font-mono text-lg font-bold tracking-widest text-center">
                  {promoCode || "—"}
                </div>
                <button
                  onClick={() => { setPromoSuccess(false); setShowPromoModal(false); }}
                  className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 rounded-xl text-sm font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-4">New Promo Code</h3>
                <form onSubmit={handleCreatePromo} className="space-y-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Promo Code</label>
                    <input 
                      required type="text" 
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                      placeholder="e.g. SUMMER50" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Discount Type</label>
                    <div className="flex gap-2">
                      {(["percentage", "fixed"] as const).map(t => (
                        <button
                          key={t} type="button"
                          onClick={() => setDiscountType(t)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize border transition-colors ${
                            discountType === t ? "bg-blue-600 border-blue-500 text-white" : "bg-neutral-800 border-neutral-700 text-neutral-400"
                          }`}
                        >
                          {t === "percentage" ? "% Percent" : "TON Fixed"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                      {discountType === "percentage" ? "Discount (%)" : "Discount (TON)"}
                    </label>
                    <input 
                      required type="number" 
                      min="1" max={discountType === "percentage" ? 100 : undefined}
                      value={discountValue}
                      onChange={e => setDiscountValue(parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Max Redemptions</label>
                    <input 
                      type="number" min="1"
                      value={maxRedemptions}
                      onChange={e => setMaxRedemptions(parseInt(e.target.value) || 1)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isCreatingPromo}
                    className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isCreatingPromo ? "Creating..." : "Create Promo Code"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setShowBroadcastModal(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4">New Broadcast</h3>
            
            <form onSubmit={handleCreateBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={broadcastText}
                  onChange={e => setBroadcastText(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="Type your message to all subscribers..." 
                />
              </div>

              <button 
                type="submit" 
                disabled={isCreatingBroadcast}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isCreatingBroadcast ? "Creating..." : "Save Draft"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setEditingPlan(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4">Edit Plan</h3>
            <form onSubmit={handleEditPlan} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Price (TON)</label>
                <input
                  required type="text"
                  value={editingPlan.price}
                  onChange={e => setEditingPlan({ ...editingPlan, price: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Trial Days</label>
                <input
                  type="text"
                  value={editingPlan.trial_days}
                  onChange={e => setEditingPlan({ ...editingPlan, trial_days: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Status</label>
                <select
                  value={editingPlan.status}
                  onChange={e => setEditingPlan({ ...editingPlan, status: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <button type="submit" disabled={isUpdatingPlan}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                {isUpdatingPlan ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Events Modal */}
      {activeSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative max-h-[80vh] flex flex-col">
            <button onClick={() => setActiveSubId(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4">Subscription History</h3>
            <div className="overflow-y-auto space-y-2 flex-1">
              {subEvents.length > 0 ? subEvents.map(ev => (
                <div key={ev.id} className="bg-neutral-800 rounded-xl p-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-blue-400 uppercase text-[10px] tracking-wider">{ev.event_type}</span>
                    <span className="text-[10px] text-neutral-500">{ev.created_at ? new Date(ev.created_at).toLocaleDateString() : ''}</span>
                  </div>
                  {ev.from_status && ev.to_status && (
                    <p className="text-xs text-neutral-400 mt-1">{ev.from_status} → {ev.to_status}</p>
                  )}
                  {ev.note && <p className="text-xs text-neutral-500 mt-1">{ev.note}</p>}
                </div>
              )) : (
                <p className="text-xs text-neutral-500 text-center py-6">No events found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Deliveries Modal */}
      {deliveryBroadcastId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative max-h-[80vh] flex flex-col">
            <button onClick={() => setDeliveryBroadcastId(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4">Delivery Report</h3>
            <div className="overflow-y-auto space-y-2 flex-1">
              {deliveries.length > 0 ? deliveries.map(d => (
                <div key={d.id} className="bg-neutral-800 rounded-xl p-3 text-sm flex items-center justify-between">
                  <span className="text-neutral-300">User #{d.user_id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    d.status === 'delivered' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>{d.status}</span>
                </div>
              )) : (
                <p className="text-xs text-neutral-500 text-center py-6">No delivery data yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messaging Modal */}
      {activeDialogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm h-[80vh] flex flex-col shadow-2xl relative">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/20">
              <h3 className="font-bold">Chat Support</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCloseDialog}
                  disabled={isClosingDialog}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <CheckCheck size={12} /> Resolve
                </button>
                <button onClick={() => setActiveDialogId(null)} className="text-neutral-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-950/30">
              {messages.length > 0 ? (
                messages.map((m) => (
                  <div 
                    key={m.id} 
                    className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                      m.sender_user_id === userId 
                        ? 'bg-blue-600 text-white ml-auto rounded-tr-none' 
                        : 'bg-neutral-800 text-neutral-200 rounded-tl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                    <p className="text-[8px] opacity-70 text-right mt-1">
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString() : ''}
                    </p>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-500 text-xs italic">
                  No messages yet.
                </div>
              )}
            </div>

            <form onSubmit={handleSendReply} className="p-4 border-t border-neutral-800 flex gap-2">
              <input 
                autoFocus
                type="text" 
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type a reply..."
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500" 
              />
              <button 
                type="submit"
                disabled={isSendingMessage || !replyText.trim()}
                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white disabled:opacity-50"
              >
                <ArrowUpRight size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
      <ChatModal 
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        form={chatForm}
        setForm={setChatForm}
        onSubmit={handleUpdateChat}
        isLoading={isUpdatingChat}
        categories={categories}
      />
    </div>
  );
}

function RegistrationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-4">Register your Channel</h3>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <p className="font-semibold text-sm">Add our Bot</p>
              <p className="text-xs text-neutral-500 mt-1">Add the project bot to your Telegram Channel or Group as a member.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <p className="font-semibold text-sm">Promote to Admin</p>
              <p className="text-xs text-neutral-500 mt-1">Give the bot Administrative permissions (specifically permission to manage chat and invite users).</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <p className="font-semibold text-sm">Automatic Detection</p>
              <p className="text-xs text-neutral-500 mt-1">Once promoted, the system will detect the bot and automatically register your channel here.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={async () => {
            onClose();
            // Invalidate queries instead of full reload for better DX
            window.location.reload();
          }}
          className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
        >
          Check Registration Status
        </button>
      </div>
    </div>
  );
}

function ProfileModal({ 
  isOpen, 
  onClose, 
  form, 
  setForm, 
  onSubmit, 
  onDelete,
  isLoading,
  isDeleting,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  form: { first_name: string; last_name: string; username: string }; 
  setForm: React.Dispatch<React.SetStateAction<{ first_name: string; last_name: string; username: string }>>; 
  onSubmit: (e: React.FormEvent) => void;
  onDelete: () => void;
  isLoading: boolean;
  isDeleting: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-4">Edit Profile</h3>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">First Name</label>
            <input 
              required
              type="text" 
              value={form.first_name}
              onChange={e => setForm({...form, first_name: e.target.value})}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Last Name</label>
            <input 
              type="text" 
              value={form.last_name}
              onChange={e => setForm({...form, last_name: e.target.value})}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Username</label>
            <input 
              type="text" 
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
              placeholder="@username"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
function ChatModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  isLoading,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  form: { category_id: number; description: string };
  setForm: React.Dispatch<React.SetStateAction<{ category_id: number; description: string }>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  categories: any[];
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
          <Users size={20} className="text-blue-400" />
          Channel Settings
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Category</label>
            <div className="relative">
              <select
                required
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: parseInt(e.target.value) || 0 })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 appearance-none text-white"
              >
                <option value={0}>Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-500">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white resize-none"
              placeholder="Tell users about your channel..."
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 text-white flex items-center justify-center gap-2"
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
