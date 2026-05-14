"use client";

import {
  TrendingUp,
  Users,
  ArrowUpRight,
  ChevronDown,
  MessageSquare,
  History,
  CheckCheck,
  Truck,
  RotateCw,
  Plus,
  ShieldCheck,
  Settings,
} from "lucide-react";

function EditPlanModal({ isOpen, onClose, form, setForm, onSubmit, isLoading }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto pt-12 pb-24">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[3rem] w-full max-w-sm relative shadow-2xl">
        <header className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
            <Settings className="text-blue-500 animate-spin-slow" size={32} />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">Edit Plan</h3>
          <p className="text-xs text-neutral-500 font-medium mt-1 uppercase tracking-widest">{form.title}</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Plan Status</label>
            <select 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white"
              value={form.status}
              onChange={e => setForm({...form, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1 flex items-center gap-1">
               Price <span className="text-[8px] text-blue-500 font-black tracking-tighter">(TON)</span>
            </label>
            <input
              required
              type="number"
              step="0.1"
              placeholder="0.0"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white"
              value={form.price}
              onChange={e => setForm({...form, price: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-bold rounded-2xl text-xs transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              disabled={isLoading}
              type="submit"
              className="flex-[1.5] py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";
import {
  queryKeys,
  useChats,
  useChatSubscriptionStats,
  useChatPlans,
  useCreateChatPlan,
  useChatAnalytics,
  useChatSubscriptions,
  useUpdateChatSubscriptionStatus,
  useBroadcasts,
  useCreateBroadcast,
  useSendBroadcast,
  useCreatePromoCode,
  useDialogs,
  useDialogMessages,
  useUpdateChat,
  useChatById,
  usePublicReviews,
  useUpdatePlan,
  useChatCategories,
} from "@/api/hooks";
import { useToast } from "@/providers/ToastProvider";
import { toNanoTON, fromNanoTON } from "@/utils/ton";
import Link from "next/link";

export default function AdminDashboard() {
  const {
    userId,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuthContext();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlChatId = searchParams.get("chatId");

  const toast = useToast();
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleSync = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    if (myChat?.id) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chatAnalytics(myChat.id),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.plans(myChat.id),
      });
    }
  };

  // Fetch all managed chats to identify the selected one
  const { data: chatsRes, isLoading: chatsLoading } = useChats(
    userId ? { owner_id: userId } : undefined,
    { enabled: !!userId },
  );
  const chats = chatsRes?.data?.items || [];

  // Determine active chat from URL
  const activeChatId = urlChatId ? parseInt(urlChatId) : null;
  const myChat =
    chats.find((c) => c.id === activeChatId) ||
    (chats.length > 0 ? chats[0] : null);

  // Detail queries
  const { data: plansRes } = useChatPlans(myChat?.id || 0, {
    enabled: !!myChat?.id,
  });
  const plans = plansRes?.data || [];
  const hasPlans = plans && plans.length > 0;

  const { data: analyticsRes } = useChatAnalytics(myChat?.id || 0, undefined, {
    enabled: !!myChat?.id,
  });
  const analytics = analyticsRes?.data;

  const [activeTab, setActiveTab] = useState<
    | "plans"
    | "subscribers"
    | "broadcasts"
    | "private-chat"
    | "promo"
    | "reviews"
    | "settings"
  >("plans");

  // Plan management
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const [newPlan, setNewPlan] = useState({
    title: "",
    price: "0",
    plan_type: "periodic",
    duration_days: "30",
  });

  const { mutateAsync: createPlan, isPending: isCreatingPlan } =
    useCreateChatPlan();
  const { mutateAsync: updatePlan, isPending: isUpdatingPlan } = useUpdatePlan();

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myChat?.id) return;
    try {
      const payload = {
        title: newPlan.title,
        plan_type: newPlan.plan_type,
        price_nanoton: toNanoTON(newPlan.price).toString(),
        duration_days:
          newPlan.plan_type === "lifetime"
            ? undefined
            : parseInt(newPlan.duration_days) || 30,
        trial_days: 0,
      };
      await createPlan({ chatId: myChat.id, data: payload as any });
      setShowPlanModal(false);
      toast.success("Plan created successfully");
    } catch (err) {
      toast.handleError(err);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !myChat?.id) return;
    try {
      await updatePlan({
        planId: editingPlan.id,
        chatId: myChat.id,
        data: {
          price_nanoton: toNanoTON(editingPlan.price).toString(),
          trial_days: 0,
          status: editingPlan.status,
        },
      });
      setShowEditPlanModal(false);
      toast.success("Plan updated successfully");
    } catch (err) {
      toast.handleError(err);
    }
  };

  if (isAuthLoading || chatsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <RotateCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-black min-h-screen text-white">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/chats"
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors group"
        >
          <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 group-hover:border-neutral-700">
            <ChevronDown className="rotate-90" size={18} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">
            Dashboard
          </span>
        </Link>
        <button
          onClick={handleSync}
          className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 active:rotate-180 transition-transform duration-500"
        >
          <RotateCw size={18} className="text-neutral-400" />
        </button>
      </div>

      {/* Selected Chat Header */}
      {myChat ? (
        <div className="relative overflow-hidden bg-neutral-900 border border-neutral-800 p-6 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-2xl font-black shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              {myChat.title?.[0] || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black truncate">{myChat.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                  {myChat.type || "Channel"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-widest">
                  Live
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
        </div>
      ) : (
        <div className="bg-neutral-900/50 border border-dashed border-neutral-800 p-10 rounded-[2.5rem] text-center">
          <p className="text-neutral-500 mb-6 font-medium">
            No channel selected for management.
          </p>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-blue-600/20"
          >
            Register New Channel
          </button>
        </div>
      )}

      {/* Analytics Summary */}
      {myChat && analytics && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
            <Users
              className="absolute -right-2 -bottom-2 text-blue-500/10"
              size={60}
            />
            <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">
              Subscribers
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-white">
                {analytics.total_subscribers || 0}
              </p>
              <div className={`flex items-center text-[10px] font-black ${analytics.new_subscriptions >= analytics.expired_subscriptions ? 'text-green-500' : 'text-red-500'}`}>
                {analytics.new_subscriptions >= analytics.expired_subscriptions ? '↑' : '↓'}
                {Math.abs(analytics.new_subscriptions - analytics.expired_subscriptions)}
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 text-blue-500/10 font-black text-3xl">
              TON
            </div>
            <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">
              Revenue
            </p>
            <p className="text-2xl font-black text-blue-400">
              {fromNanoTON(analytics.revenue_confirmed)}
            </p>
          </div>
        </div>
      )}

      {/* Tabs System */}
      {myChat && (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {[
              { id: "plans", label: "Plans", icon: TrendingUp },
              { id: "subscribers", label: "Subscribers", icon: Users },
              { id: "broadcasts", label: "Broadcasts", icon: Truck },
              { id: "private-chat", label: "Support", icon: MessageSquare },
              { id: "promo", label: "Promo", icon: History },
              { id: "reviews", label: "Reviews", icon: CheckCheck },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap border ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20"
                    : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            {activeTab === "plans" && (
              <PlansSection
                plans={plans}
                hasPlans={hasPlans}
                onAddPlan={() => setShowPlanModal(true)}
                onEditPlan={(plan: any) => {
                  setEditingPlan({ ...plan, price: fromNanoTON(plan.price_nanoton).toString() });
                  setShowEditPlanModal(true);
                }}
              />
            )}
            {activeTab === "subscribers" && (
              <SubscribersSection chatId={myChat.id!} />
            )}
            {activeTab === "broadcasts" && (
              <BroadcastSection chatId={myChat.id!} />
            )}
            {activeTab === "private-chat" && (
              <PrivateChatSection chatId={myChat.id!} userId={userId!} />
            )}
            {activeTab === "promo" && (
              <PromoSection chatId={myChat.id!} plans={plans} />
            )}
            {activeTab === "reviews" && (
              <ReviewsSection chatId={myChat.id!} />
            )}
            {activeTab === "settings" && (
              <ChatSettingsSection chat={myChat} />
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddPlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        form={newPlan}
        setForm={setNewPlan}
        onSubmit={handleCreatePlan}
        isLoading={isCreatingPlan}
      />

      <EditPlanModal
        isOpen={showEditPlanModal}
        onClose={() => setShowEditPlanModal(false)}
        form={editingPlan}
        setForm={setEditingPlan}
        onSubmit={handleUpdatePlan}
        isLoading={isUpdatingPlan}
      />

      <RegisterChatModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </div>
  );
}

// --- Component Parts ---

function PlansSection({ plans, hasPlans, onAddPlan, onEditPlan }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
          Active Plans
        </h4>
        <button
          onClick={onAddPlan}
          className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1"
        >
          <Plus size={14} /> New Plan
        </button>
      </div>
      <div className="space-y-3">
        {plans.map((plan: any) => (
          <div
            key={plan.id}
            className="bg-neutral-900 border border-neutral-800 p-5 rounded-[2.5rem] flex items-center justify-between group hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black">
                {plan.plan_type === 'lifetime' ? '∞' : 'D'}
              </div>
              <div>
                <h5 className="font-black text-white">{plan.title}</h5>
                <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mt-0.5">
                  {plan.plan_type === "lifetime"
                    ? "Lifetime Access"
                    : `${plan.duration_days} Days Billing`}
                  {plan.trial_days > 0 && ` • ${plan.trial_days}d Trial`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-black text-blue-400 leading-none">
                  {fromNanoTON(plan.price_nanoton)}{" "}
                  <span className="text-[10px] font-normal text-neutral-500">
                    TON
                  </span>
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPlan({ ...plan, status: plan.status === 'active' ? 'archived' : 'active' });
                  }}
                  className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border transition-colors mt-1 ${
                    plan.status === 'active' 
                      ? 'bg-green-500/10 text-green-400 border-green-500/10 hover:bg-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/10 hover:bg-red-500/20'
                  }`}
                >
                  {plan.status}
                </button>
              </div>
              <button
                onClick={() => onEditPlan(plan)}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-2xl transition-all active:scale-95 border border-neutral-700"
              >
                <Settings size={16} className="text-neutral-400" />
              </button>
            </div>
          </div>
        ))}
        {!plans.length && (
          <div className="text-center py-10 bg-neutral-900/50 rounded-[2.5rem] border border-dashed border-neutral-800 text-neutral-500 text-sm">
            No plans created yet.
          </div>
        )}
      </div>
    </div>
  );
}

function SubscribersSection({ chatId }: { chatId: number }) {
  const { data: subsRes, isLoading } = useChatSubscriptions(chatId, {
    limit: 50,
  });
  const subscribers = subsRes?.data?.items || [];
  const { mutateAsync: updateStatus } = useUpdateChatSubscriptionStatus();

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-1">
        Subscribers
      </h4>
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden divide-y divide-neutral-800">
        {subscribers.map((sub: any) => (
          <div
            key={sub.subscription_id}
            className="p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-xs">
                {sub.username?.[0] || "?"}
              </div>
              <div>
                <p className="text-sm font-bold">
                  {sub.username || `User #${sub.user_id}`}
                </p>
                <p className="text-[10px] text-neutral-500 uppercase font-black">
                  {sub.status}
                </p>
              </div>
            </div>
            <select
              value={sub.status}
              onChange={(e) =>
                updateStatus({
                  chatId,
                  subscriptionId: sub.subscription_id,
                  data: { status: e.target.value },
                })
              }
              className="bg-neutral-800 text-[10px] font-bold px-2 py-1 rounded-lg border border-neutral-700 outline-none"
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        ))}
        {!subscribers.length && (
          <div className="p-10 text-center text-sm text-neutral-500">
            No subscribers found.
          </div>
        )}
      </div>
    </div>
  );
}

function BroadcastSection({ chatId }: { chatId: number }) {
  const { data: bRes } = useBroadcasts(chatId);
  const broadcasts = bRes?.data?.items || [];
  const { mutateAsync: createB } = useCreateBroadcast();
  const { mutateAsync: sendB } = useSendBroadcast();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
          Broadcasts
        </h4>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs text-blue-400 font-bold hover:underline"
        >
          + New Broadcast
        </button>
      </div>
      <div className="space-y-3">
        {broadcasts.map((b: any) => (
          <div
            key={b.id}
            className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl"
          >
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-bold text-sm">{b.title || "Untitled"}</h5>
              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                {b.status}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-4">{b.body}</p>
            {b.status === "draft" && (
              <button
                onClick={() => sendB({ chatId, broadcastId: b.id })}
                className="w-full py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase"
              >
                Send Now
              </button>
            )}
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-12 pb-24">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-[2rem] w-full max-w-sm relative">
            <h3 className="text-lg font-black mb-4">New Broadcast</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createB({ chatId, data: form });
                setShowModal(false);
                setForm({ title: "", body: "" });
              }}
              className="space-y-4"
            >
              <div className="space-y-4">
                <input
                  placeholder="Title"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <textarea
                  required
                  placeholder="Message..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm min-h-[120px] focus:border-blue-500 outline-none transition-all"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                />
              </div>

              {/* Preview Pane */}
              {(form.title || form.body) && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Live Preview</p>
                  <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl shadow-inner">
                    <h5 className="font-bold text-sm text-white mb-1">{form.title || "Untitled"}</h5>
                    <p className="text-xs text-neutral-400 whitespace-pre-wrap">{form.body || "Message body will appear here..."}</p>
                    <div className="mt-3 pt-3 border-t border-neutral-900 flex justify-between items-center opacity-50">
                       <span className="text-[9px] font-bold text-neutral-600">Jazylym Broadcast Service</span>
                       <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">J</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-neutral-800 rounded-xl text-xs font-bold hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!form.body}
                  className="flex-1 py-3 bg-blue-600 rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                  Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PrivateChatSection({
  chatId,
  userId,
}: {
  chatId: number;
  userId: number;
}) {
  const { data: dialogsRes } = useDialogs(chatId);
  const dialogs = dialogsRes?.data?.items || [];
  const [activeDialogId, setActiveDialogId] = useState<number | null>(null);
  const { data: msgsRes } = useDialogMessages(
    chatId,
    activeDialogId || 0,
    undefined,
    { enabled: !!activeDialogId },
  );
  const messages = msgsRes?.data?.items || [];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-1">
        Support Sessions
      </h4>
      {!activeDialogId ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden divide-y divide-neutral-800">
          {dialogs.map((d: any) => (
            <div
              key={d.id}
              onClick={() => setActiveDialogId(d.id)}
              className="p-4 flex items-center justify-between hover:bg-neutral-800/50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-blue-400">
                  {d.subscriber_username?.[0] || "?"}
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {d.subscriber_username || `User #${d.subscriber_id}`}
                  </p>
                  <p className="text-[10px] text-neutral-500 uppercase font-black">
                    {d.status}
                  </p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-neutral-700" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[350px]">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/20">
            <button
              onClick={() => setActiveDialogId(null)}
              className="text-xs text-blue-400 font-bold"
            >
              ← Back
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Private Chat
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {messages.map((m: any) => (
              <div
                key={m.id}
                className={`max-w-[85%] p-3 rounded-2xl text-xs ${m.sender_user_id === userId ? "bg-blue-600 ml-auto rounded-tr-none" : "bg-neutral-800 rounded-tl-none"}`}
              >
                {m.body}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-neutral-800">
            <input
              disabled
              placeholder="Reply via Telegram Bot..."
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-2 text-xs opacity-50 cursor-not-allowed"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PromoSection({ chatId, plans }: any) {
  const { mutateAsync: createPromo } = useCreatePromoCode();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percent",
    discount_value: 10,
    plan_id: plans[0]?.id,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
          Promo Codes
        </h4>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs text-blue-400 font-bold hover:underline"
        >
          + New Code
        </button>
      </div>
      <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl text-center text-xs text-neutral-500">
        Promo codes active on this channel
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-[2rem] w-full max-w-sm">
            <h3 className="text-lg font-black mb-4">New Promo</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createPromo({
                  chatId,
                  data: {
                    ...form,
                    discount_value: Number(form.discount_value),
                    plan_id: Number(form.plan_id),
                  },
                });
                setShowModal(false);
              }}
              className="space-y-4"
            >
              <input
                required
                placeholder="CODE"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              <select
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm"
                value={form.plan_id}
                onChange={(e) =>
                  setForm({ ...form, plan_id: e.target.value as any })
                }
              >
                {plans.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Discount Type</label>
                <select
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm"
                  value={form.discount_type}
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                >
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed (TON)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Discount Value</label>
                <input
                  type="number"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm"
                  value={form.discount_value}
                  onChange={(e) =>
                    setForm({ ...form, discount_value: e.target.value as any })
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 rounded-xl text-xs font-bold"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-neutral-800 rounded-xl text-xs font-bold mt-2"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatSettingsSection({ chat }: { chat: any }) {
  const { data: catRes } = useChatCategories();
  const categories = catRes?.data || [];
  const { mutateAsync: updateChat, isPending } = useUpdateChat();
  const [form, setForm] = useState({
    title: chat.title || "",
    description: chat.description || "",
    category_id: chat.category_id || 0,
    is_active: chat.is_active ?? true,
  });

  const toast = useToast();

  useEffect(() => {
    setForm({
      title: chat.title || "",
      description: chat.description || "",
      category_id: chat.category_id || 0,
      is_active: chat.is_active ?? true,
    });
  }, [chat.id, chat.title, chat.description, chat.category_id, chat.is_active]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateChat({
        chatId: chat.id,
        data: {
          ...form,
          category_id: Number(form.category_id) || undefined,
        },
      });
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error("Failed to update settings. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
          Channel Settings
        </h4>
      </div>

      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-6 rounded-[2.5rem] space-y-6 shadow-xl">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Title</label>
          <input
            required
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Description</label>
          <textarea
            rows={3}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Category</label>
          <select
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white"
            value={form.category_id}
            onChange={e => setForm({...form, category_id: Number(e.target.value)})}
          >
            <option value={0}>Uncategorized</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.category}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
           <div className="space-y-0.5">
             <p className="text-xs font-black text-white">Active Status</p>
             <p className="text-[9px] text-neutral-500 uppercase font-black">Visible in Explore</p>
           </div>
           <button
             type="button"
             onClick={() => setForm({...form, is_active: !form.is_active})}
             className={`w-12 h-6 rounded-full transition-all relative ${form.is_active ? "bg-green-600" : "bg-neutral-800"}`}
           >
             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_active ? "left-7" : "left-1"}`}></div>
           </button>
        </div>

        <button
          disabled={isPending}
          type="submit"
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </form>

      <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2.5rem] space-y-3">
        <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest px-1">Danger Zone</h5>
        <p className="text-[10px] text-neutral-500 leading-relaxed px-1">
          To delete this channel, you must remove our bot from the channel administrators in Telegram.
        </p>
      </div>
    </div>
  );
}

function ReviewsSection({ chatId }: { chatId: number }) {
  const { data: revRes } = usePublicReviews(chatId, { limit: 20 });
  const reviews = revRes?.data?.items || [];
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-1">
        Community Reviews
      </h4>
      <div className="space-y-3">
        {reviews.map((r: any) => (
          <div
            key={r.id}
            className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-white">
                {r.username || "User"}
              </span>
            </div>
            <p className="text-xs text-neutral-400">{r.review_text}</p>
          </div>
        ))}
        {!reviews.length && (
          <div className="p-10 text-center text-xs text-neutral-500">
            No reviews found.
          </div>
        )}
      </div>
    </div>
  );
}

function AddPlanModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  isLoading,
}: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto pt-12 pb-24">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[3rem] w-full max-w-sm relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Decorative Background */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10">
          <header className="mb-8 text-center">
            <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
              <TrendingUp className="text-blue-500" size={32} />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">
              Create Plan
            </h3>
            <p className="text-xs text-neutral-500 font-medium mt-1 uppercase tracking-widest">
              Configure your offering
            </p>
          </header>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Plan Type Selection (Segmented Control) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">
                Billing Type
              </label>
              <div className="flex p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, plan_type: "periodic" })}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                    form.plan_type === "periodic"
                      ? "bg-neutral-800 text-white shadow-lg"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  Periodic
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, plan_type: "lifetime" })}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                    form.plan_type === "lifetime"
                      ? "bg-neutral-800 text-white shadow-lg"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  Lifetime
                </button>
              </div>
              <p className="text-[9px] text-neutral-600 px-1 italic">
                {form.plan_type === "periodic"
                  ? "• Subscribers billed every interval"
                  : "• One-time payment for eternal access"}
              </p>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">
                Plan Name
              </label>
              <div className="relative">
                <input
                  required
                  placeholder="e.g. Premium Monthly"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-white placeholder:text-neutral-700"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
            </div>

            {/* Price & Duration Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1 flex items-center gap-1">
                  Price{" "}
                  <span className="text-[8px] text-blue-500 font-black tracking-tighter">
                    (TON)
                  </span>
                </label>
                <input
                  required
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-neutral-700"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>

              {form.plan_type === "periodic" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">
                    Duration{" "}
                    <span className="text-[8px] text-neutral-600 font-black tracking-tighter">
                      (DAYS)
                    </span>
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="30"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-neutral-700"
                    value={form.duration_days}
                    onChange={(e) =>
                      setForm({ ...form, duration_days: e.target.value })
                    }
                  />
                </div>
              )}
            </div>



            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-bold rounded-2xl text-xs transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                disabled={isLoading}
                type="submit"
                className="flex-[1.5] py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Create Plan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function RegisterChatModal({ isOpen, onClose }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto pt-12 pb-24">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[2.5rem] w-full max-w-sm text-center">
        <ShieldCheck size={48} className="text-blue-500 mx-auto mb-4" />
        <h3 className="text-2xl font-black mb-2">Register Channel</h3>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          Add our bot as an administrator to your Telegram channel first.
        </p>
        <button
          onClick={() => window.open("https://t.me/ton_jazylym_bot", "_blank")}
          className="w-full py-4 bg-blue-600 rounded-2xl text-sm font-black mb-2"
        >
          Open Bot
        </button>
        <button
          onClick={onClose}
          className="w-full py-4 bg-neutral-800 rounded-2xl text-sm font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
