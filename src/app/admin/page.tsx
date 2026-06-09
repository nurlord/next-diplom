"use client";

import {
  TrendingUp,
  Users,
  ChevronDown,
  RotateCw,
  Plus,
  ShieldCheck,
  Settings,
  Activity,
  Zap,
  Tag,
  Star,
  Layers,
  Upload,
  X,
} from "lucide-react";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import * as T from "@/api/types";
import { useAuthContext } from "@/providers/AuthProvider";
import {
  queryKeys,
  useChats,
  useChatById,
  useChatPlans,
  useCreateChatPlan,
  useChatAnalytics,
  useChatSubscriptions,
  useUpdateChatSubscriptionStatus,
  useBroadcasts,
  useCreateBroadcast,
  useSendBroadcast,
  useUpdatePlan,
  useChatCategories,
  useUpdateChat,
  usePublicReviews,
  useCreatePromoCode,
  useArchiveChat,
} from "@/api/hooks";
import { useToast } from "@/providers/ToastProvider";
import { fromNanoTON, toNanoTON } from "@/utils/ton";
import { Avatar } from "@/components/ui/Avatar";
import {
  PageWrapper,
  Card,
  Badge,
  Button,
  SectionHeader,
  StatCard,
  Modal,
  FormField,
  Input,
  Select,
  TextArea,
} from "@/components/ui";

export default function AdminDashboard() {
  const { userId, isLoading: isAuthLoading } = useAuthContext();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const urlChatId = searchParams.get("chatId");
  const toast = useToast();

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "plans"
    | "subscribers"
    | "cancel-requests"
    | "broadcasts"
    | "promo"
    | "reviews"
    | "settings"
  >("plans");

  // Fetch all managed chats
  const { data: chatsRes, isLoading: chatsLoading } = useChats(
    userId ? { owner_id: userId } : undefined,
    { enabled: !!userId },
  );
  const chats = chatsRes?.data?.items || [];

  // Determine active chat
  const activeChatId = urlChatId ? parseInt(urlChatId) : null;
  const myChat =
    chats.find((c) => c.id === activeChatId) ||
    (chats.length > 0 ? chats[0] : null);

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
    toast.success("Data synchronized");
  };

  // Plan management
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<(T.SubscriptionPlan & { price?: string }) | null>(null);
  const [newPlan, setNewPlan] = useState({
    title: "",
    price: "0",
    plan_type: "periodic",
    duration_days: "30",
  });

  const { mutateAsync: createPlan, isPending: isCreatingPlan } =
    useCreateChatPlan();
  const { mutateAsync: updatePlan, isPending: isUpdatingPlan } =
    useUpdatePlan();

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myChat?.id) return;
    try {
      await createPlan({
        chatId: myChat.id,
        data: {
          title: newPlan.title,
          plan_type: newPlan.plan_type,
          price_nanoton: toNanoTON(newPlan.price).toString(),
          duration_days:
            newPlan.plan_type === "lifetime"
              ? undefined
              : parseInt(newPlan.duration_days) || 30,
          trial_days: 0,
        } as T.CreateSubscriptionPlanReq,
      });
      setShowPlanModal(false);
      toast.success("Plan created successfully");
    } catch (err) {
      toast.handleError(err);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan.id || !myChat?.id) return;
    try {
      await updatePlan({
        planId: editingPlan.id,
        chatId: myChat.id,
        data: {
          price_nanoton: toNanoTON(editingPlan.price || "0").toString(),
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

  const tabs = [
    { id: "plans" as const, label: "Plans", icon: Layers },
    { id: "subscribers" as const, label: "Subs", icon: Users },
    { id: "cancel-requests" as const, label: "Cancel Reqs", icon: Settings }, // reusing an icon
    { id: "broadcasts" as const, label: "Feed", icon: Zap },
    { id: "promo" as const, label: "Promo", icon: Tag },
    { id: "reviews" as const, label: "Reviews", icon: Star },
    { id: "settings" as const, label: "Config", icon: Settings },
  ];

  if (isAuthLoading || chatsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RotateCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <PageWrapper>
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/chats"
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <div className="p-2 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border)] group-hover:border-[var(--border-subtle)]">
            <ChevronDown className="rotate-90" size={18} />
          </div>
          <span className="text-sm font-semibold tracking-wide">Dashboard</span>
        </Link>
        <Button
          variant="secondary"
          size="sm"
          icon={RotateCw}
          onClick={handleSync}
        />
      </div>

      {/* Selected Chat Header */}
      {myChat ? (
        <Card>
          <div className="flex items-center gap-4">
            <Avatar text={myChat.title} src={myChat.avatar} size="lg" />
            <div className="flex-1 min-w-0">
              <h2
                className="text-base font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {myChat.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="blue">{myChat.type || "Channel"}</Badge>
                <Badge variant="green">Live</Badge>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div
          className="p-8 rounded-xl border border-dashed text-center"
          style={{
            background: "var(--bg-subtle)",
            borderColor: "var(--border-dashed)",
          }}
        >
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            No channel selected.
          </p>
          <Button icon={Plus} onClick={() => setShowRegisterModal(true)}>
            Register Channel
          </Button>
        </div>
      )}

      {/* Analytics Summary */}
      {myChat?.id && <AnalyticsSummary chatId={myChat.id} />}

      {/* Tab Navigation */}
      {myChat?.id && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
                activeTab === tab.id
                  ? "bg-[var(--text-primary)] text-[var(--bg-card)] border-[var(--text-primary)] shadow-sm"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      {myChat?.id && (
        <div className="space-y-6 pb-10">
          {activeTab === "plans" && (
            <PlansSection
              chatId={myChat.id}
              onAddPlan={() => setShowPlanModal(true)}
              onEditPlan={(plan: T.SubscriptionPlan) => {
                setEditingPlan({
                  ...plan,
                  price: fromNanoTON(plan.price_nanoton || 0).toString(),
                });
                setShowEditPlanModal(true);
              }}
            />
          )}
          {activeTab === "subscribers" && (
            <SubscribersSection chatId={myChat.id} />
          )}
          {activeTab === "cancel-requests" && (
            <CancelRequestsSection chatId={myChat.id} />
          )}
          {activeTab === "broadcasts" && (
            <BroadcastSection chatId={myChat.id} />
          )}
          {activeTab === "promo" && <PromoSection chatId={myChat.id} />}
          {activeTab === "reviews" && <ReviewsSection chatId={myChat.id} />}
          {activeTab === "settings" && <SettingsSection chat={myChat} />}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title="Create Plan"
        icon={TrendingUp}
      >
        <form onSubmit={handleCreatePlan} className="space-y-6">
          <FormField label="Billing Type">
            <div className="flex p-1 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() =>
                  setNewPlan({ ...newPlan, plan_type: "periodic" })
                }
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  newPlan.plan_type === "periodic"
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Periodic
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewPlan({ ...newPlan, plan_type: "lifetime" })
                }
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  newPlan.plan_type === "lifetime"
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Lifetime
              </button>
            </div>
          </FormField>
          <FormField label="Plan Name">
            <Input
              required
              placeholder="e.g. Premium Monthly"
              value={newPlan.title}
              onChange={(e) =>
                setNewPlan({ ...newPlan, title: e.target.value })
              }
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price (TON)">
              <Input
                required
                type="number"
                step="0.1"
                value={newPlan.price}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, price: e.target.value })
                }
              />
            </FormField>
            {newPlan.plan_type === "periodic" && (
              <FormField label="Duration (Days)">
                <Input
                  required
                  type="number"
                  value={newPlan.duration_days}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, duration_days: e.target.value })
                  }
                />
              </FormField>
            )}
          </div>
          <Button type="submit" fullWidth size="lg" loading={isCreatingPlan}>
            Create Plan
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={showEditPlanModal}
        onClose={() => setShowEditPlanModal(false)}
        title="Edit Plan"
        icon={Settings}
      >
        {editingPlan && (
          <form onSubmit={handleUpdatePlan} className="space-y-6">
            <FormField label="Status">
              <Select
                value={editingPlan.status}
                onChange={(e) =>
                  setEditingPlan({ ...editingPlan, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
                <option value="archived">Archived</option>
              </Select>
            </FormField>
            <FormField label="Price (TON)">
              <Input
                required
                type="number"
                step="0.1"
                value={editingPlan.price}
                onChange={(e) =>
                  setEditingPlan({ ...editingPlan, price: e.target.value })
                }
              />
            </FormField>
            <Button type="submit" fullWidth size="lg" loading={isUpdatingPlan}>
              Save Changes
            </Button>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register"
        icon={ShieldCheck}
      >
        <div className="text-center space-y-4">
          <p className="text-sm text-neutral-500 leading-relaxed">
            Add our bot as an administrator to your Telegram channel first.
          </p>
          <Button
            fullWidth
            onClick={() =>
              window.open("https://t.me/ton_jazylym_bot", "_blank")
            }
          >
            Open Bot
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowRegisterModal(false)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
}

// --- SUB-COMPONENTS ---

function AnalyticsSummary({ chatId }: { chatId: number }) {
  const { data: analyticsRes } = useChatAnalytics(chatId);
  const analytics = analyticsRes?.data;
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        label="Subscribers"
        value={analytics.total_subscribers}
        icon={Users}
      />
      <StatCard
        label="Earnings"
        value={fromNanoTON(analytics.revenue_confirmed)}
        suffix="TON"
        icon={Activity}
      />
    </div>
  );
}

interface PlansSectionProps {
  chatId: number;
  onAddPlan: () => void;
  onEditPlan: (plan: T.SubscriptionPlan) => void;
}

function PlansSection({ chatId, onAddPlan, onEditPlan }: PlansSectionProps) {
  const { data: plansRes } = useChatPlans(chatId);
  const plans = plansRes?.data || [];

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Active Plans"
        action={
          <Button
            variant="ghost"
            size="sm"
            icon={Plus}
            onClick={onAddPlan}
            className="!text-blue-400"
          >
            New Plan
          </Button>
        }
      />
      <div className="space-y-3">
        {plans.map((plan: T.SubscriptionPlan) => (
          <Card
            key={plan.id}
            interactive
            className="group"
            padding="sm"
            onClick={() => onEditPlan(plan)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center font-bold">
                  {plan.plan_type === "lifetime" ? "∞" : "D"}
                </div>
                <div>
                  <h5 className="font-semibold text-[var(--text-primary)]">
                    {plan.title}
                  </h5>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                    {plan.plan_type === "lifetime"
                      ? "Lifetime Access"
                      : `${plan.duration_days} Days Billing`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-[var(--text-primary)] leading-none">
                  {fromNanoTON(plan.price_nanoton)}{" "}
                  <span className="text-[10px] font-normal text-[var(--text-muted)]">
                    TON
                  </span>
                </p>
                <Badge
                  variant={plan.status === "active" ? "green" : "red"}
                  className="mt-1"
                >
                  {plan.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
        {!plans.length && (
          <Card className="!bg-[var(--bg-subtle)] !border-dashed text-center !p-10 text-[var(--text-secondary)]">
            No plans created yet.
          </Card>
        )}
      </div>
    </div>
  );
}

function SubscribersSection({ chatId }: { chatId: number }) {
  const { data: subsRes } = useChatSubscriptions(chatId, { limit: 50 });
  const subscribers = subsRes?.data?.items || [];
  const { mutateAsync: updateStatus } = useUpdateChatSubscriptionStatus();

  return (
    <div className="space-y-4">
      <SectionHeader title="Subscribers" />
      <Card
        padding="none"
        className="overflow-hidden divide-y divide-[var(--border)] !rounded-2xl border-[var(--border)]"
      >
        {subscribers.map((sub: T.ChatSubscription) => (
          <div
            key={sub.subscription_id}
            className="p-4 flex items-center justify-between border-[var(--border)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center font-semibold text-sm uppercase">
                {sub.username?.[0] || "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {sub.username || `User #${sub.user_id}`}
                </p>
                <Badge
                  variant={sub.status === "active" ? "green" : "neutral"}
                  className="!text-[10px]"
                >
                  {sub.status}
                </Badge>
              </div>
            </div>
            <Select
              className="!w-auto !py-1 !px-2 !text-xs !rounded-lg"
              value={sub.status}
              onChange={(e) =>
                updateStatus({
                  chatId,
                  subscriptionId: sub.subscription_id!,
                  data: { status: e.target.value },
                })
              }
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </Select>
          </div>
        ))}
        {!subscribers.length && (
          <div className="p-10 text-center text-sm text-[var(--text-secondary)]">
            No subscribers found.
          </div>
        )}
      </Card>
    </div>
  );
}

function CancelRequestsSection({ chatId }: { chatId: number }) {
  const { data: subsRes } = useChatSubscriptions(chatId, {
    status: "active",
    cancel_requested: true,
    limit: 50,
  });
  const requests = subsRes?.data?.items || [];
  const { mutateAsync: updateStatus, isPending } =
    useUpdateChatSubscriptionStatus();
  const toast = useToast();

  const handleApprove = async (subId: number) => {
    try {
      await updateStatus({
        chatId,
        subscriptionId: subId,
        data: { status: "canceled" },
      });
      toast.success("Subscription canceled successfully.");
    } catch (e) {
      toast.handleError(e);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Cancellation Requests" />
      <Card
        padding="none"
        className="overflow-hidden divide-y divide-[var(--border)] !rounded-2xl border-[var(--border)]"
      >
        {requests.map((sub: T.ChatSubscription) => (
          <div
            key={sub.subscription_id}
            className="p-4 flex items-center justify-between border-[var(--border)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center font-semibold text-sm uppercase">
                {sub.username?.[0] || "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {sub.username || `User #${sub.user_id}`}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Requested cancellation
                </p>
              </div>
            </div>
            <Button
              size="sm"
              loading={isPending}
              onClick={() => handleApprove(sub.subscription_id!)}
            >
              Approve Cancel
            </Button>
          </div>
        ))}
        {!requests.length && (
          <div className="p-10 text-center text-sm text-[var(--text-secondary)]">
            No pending requests.
          </div>
        )}
      </Card>
    </div>
  );
}

function BroadcastSection({ chatId }: { chatId: number }) {
  const { data: bRes } = useBroadcasts(chatId);
  const broadcasts = bRes?.data?.items || [];
  const { mutateAsync: createB, isPending: isCreating } = useCreateBroadcast();
  const { mutateAsync: sendB, isPending: isSending } = useSendBroadcast();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const toast = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createB({ chatId, data: form });
      setShowModal(false);
      setForm({ title: "", body: "" });
      toast.success("Broadcast created as draft");
    } catch (err) {
      toast.handleError(err);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Broadcasts"
        action={
          <Button
            variant="ghost"
            size="sm"
            icon={Plus}
            onClick={() => setShowModal(true)}
            className="!text-blue-400"
          >
            New Post
          </Button>
        }
      />
      <div className="space-y-3">
        {broadcasts.map((b: T.Broadcast) => (
          <Card key={b.id} padding="md" className="space-y-3">
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-sm">{b.title || "Untitled"}</h5>
              <Badge variant={b.status === "sent" ? "green" : "blue"}>
                {b.status}
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {b.body}
            </p>
            {b.status === "draft" && (
              <Button
                fullWidth
                size="sm"
                loading={isSending}
                onClick={() => sendB({ chatId, broadcastId: b.id! })}
              >
                Send Now
              </Button>
            )}
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Broadcast"
        icon={Zap}
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <FormField label="Post Title">
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Catchy headline"
            />
          </FormField>
          <FormField label="Content Body">
            <TextArea
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="What's happening?"
            />
          </FormField>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">
              Live Preview
            </p>
            <Card
              padding="sm"
              className="!bg-[var(--bg-subtle)] !border-[var(--border)]"
            >
              <p className="font-bold text-sm text-[var(--text-primary)]">
                {form.title || "Post Title"}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {form.body || "Post content will appear here..."}
              </p>
            </Card>
          </div>
          <Button type="submit" fullWidth size="lg" loading={isCreating}>
            Create Draft
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function PromoSection({ chatId }: { chatId: number }) {
  const [form, setForm] = useState({
    code: "",
    discount_type: "fixed" as "fixed" | "percent",
    discount_value: "0.1",
    max_redemptions: 10,
  });
  const { mutateAsync: createPromo, isPending } = useCreatePromoCode();
  const toast = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPromo({
        chatId,
        data: {
          code: form.code,
          discount_type: form.discount_type,
          discount_value:
            form.discount_type === "fixed"
              ? toNanoTON(form.discount_value)
              : parseInt(form.discount_value),
          max_redemptions: form.max_redemptions,
          is_active: true,
        },
      });
      setForm({
        code: "",
        discount_type: "fixed",
        discount_value: "0.1",
        max_redemptions: 10,
      });
      toast.success("Promo code created");
    } catch (err) {
      toast.handleError(err);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Promo Codes" />
      <Card>
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Code Name">
            <Input
              required
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              placeholder="SUMMER2024"
            />
          </FormField>

          <FormField label="Discount Type">
            <div className="flex p-1 bg-[var(--bg-subtle)] rounded-2xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setForm({ ...form, discount_type: "fixed" })}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  form.discount_type === "fixed"
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-lg"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                Fixed (TON)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, discount_type: "percent" })}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  form.discount_type === "percent"
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-lg"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                Percent (%)
              </button>
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={
                form.discount_type === "fixed"
                  ? "Discount (TON)"
                  : "Discount (%)"
              }
            >
              <Input
                required
                type="number"
                step={form.discount_type === "fixed" ? "0.01" : "1"}
                value={form.discount_value}
                onChange={(e) =>
                  setForm({ ...form, discount_value: e.target.value })
                }
              />
            </FormField>
            <FormField label="Max Redemptions">
              <Input
                required
                type="number"
                value={form.max_redemptions}
                onChange={(e) =>
                  setForm({
                    ...form,
                    max_redemptions: parseInt(e.target.value),
                  })
                }
              />
            </FormField>
          </div>
          <Button type="submit" fullWidth loading={isPending} icon={Plus}>
            Generate Promo Code
          </Button>
        </form>
      </Card>
    </div>
  );
}

function ReviewsSection({ chatId }: { chatId: number }) {
  const { data: revRes } = usePublicReviews(chatId, { limit: 20 });
  const reviews = revRes?.data?.items || [];

  return (
    <div className="space-y-4">
      <SectionHeader title="Community Reviews" />
      <div className="space-y-3">
        {reviews.map((r: T.Review) => (
          <Card key={r.id} padding="sm" className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {r.username || "Anonymous"}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={10}
                    className={
                      s <= (r.rating || 0)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-[var(--text-muted)]"
                    }
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {r.review_text}
            </p>
          </Card>
        ))}
        {!reviews.length && (
          <Card className="!bg-[var(--bg-subtle)] !border-dashed text-center !p-10 text-[var(--text-secondary)]">
            No reviews found.
          </Card>
        )}
      </div>
    </div>
  );
}

function SettingsSection({ chat }: { chat: T.Chat }) {
  const { data: catsRes } = useChatCategories();
  const categories = catsRes?.data || [];
  const { mutateAsync: updateChat, isPending } = useUpdateChat();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: chatDetailRes } = useChatById(chat.id!);
  const chatDetail = chatDetailRes?.data || chat;

  const [form, setForm] = useState({
    title: chatDetail.title,
    description: chatDetail.description || "",
    category_id: chatDetail.category_id || 0,
    is_active: chatDetail.is_active,
  });

  const [prevChatDetail, setPrevChatDetail] = useState<T.Chat | null>(null);

  if (chatDetailRes?.data && chatDetailRes.data !== prevChatDetail) {
    setPrevChatDetail(chatDetailRes.data);
    setForm({
      title: chatDetailRes.data.title || chat.title,
      description: chatDetailRes.data.description || "",
      category_id: chatDetailRes.data.category_id || 0,
      is_active: chatDetailRes.data.is_active ?? chat.is_active,
    });
  }

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    chat.avatar || null,
  );
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const toast = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 512 * 1024) {
      setAvatarError("Image must be smaller than 512 KB.");
      return;
    }
    setAvatarError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    try {
      await updateChat({ chatId: chat.id!, data: { avatar: "" } });
      setAvatarPreview(null);
      setAvatarBase64(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
      toast.success("Avatar removed");
    } catch (err) {
      toast.handleError(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData = {
        title: form.title,
        description: form.description,
        category_id: form.category_id,
      };
      await updateChat({
        chatId: chat.id!,
        data: {
          ...updateData,
          ...(avatarBase64 !== null ? { avatar: avatarBase64 } : {}),
        },
      });
      setAvatarBase64(null); // clear pending upload after save
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
      toast.success("Settings saved");
    } catch (err) {
      toast.handleError(err);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Channel Settings" />

      {/* Avatar Upload */}
      <Card>
        <p
          className="text-xs font-medium mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Channel Avatar
        </p>
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div
            className="w-16 h-16 rounded-xl overflow-hidden border flex items-center justify-center shrink-0"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-muted)",
            }}
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="text-xl font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                {chat.title?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <Upload size={13} /> Upload image
            </button>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "#fecaca",
                  color: "#dc2626",
                }}
              >
                <X size={13} /> Remove
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        {avatarError && (
          <p className="text-xs mt-2" style={{ color: "#dc2626" }}>
            {avatarError}
          </p>
        )}
        {avatarBase64 && (
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            New avatar selected — save settings to apply.
          </p>
        )}
      </Card>

      {/* Channel Info */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Channel Title">
            <Input
              required
              disabled
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormField>
          <FormField label="Description">
            <TextArea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </FormField>
          <FormField label="Category">
            <Select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: Number(e.target.value) })
              }
            >
              <option value={0}>Uncategorized</option>
              {categories.map((cat: T.Category) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Removed Visibility toggle */}

          <Button type="submit" fullWidth loading={isPending}>
            Save Settings
          </Button>
        </form>
      </Card>

      {/* Danger zone */}
      <div
        className="p-4 rounded-xl border flex flex-col items-start gap-4"
        style={{ background: "#fff5f5", borderColor: "#fecaca" }}
      >
        <div>
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: "#dc2626" }}
          >
            Archive Chat
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Archiving will disable new subscriptions, gifts, and promos. Active
            subscriptions become disabled.
          </p>
        </div>
        <ArchiveChatButton chatId={chat.id!} />
      </div>
    </div>
  );
}

function ArchiveChatButton({ chatId }: { chatId: number }) {
  const { mutateAsync: archive, isPending } = useArchiveChat();
  const toast = useToast();

  const handleArchive = async () => {
    if (
      confirm(
        "Are you sure you want to archive this chat? This cannot be undone from the app.",
      )
    ) {
      try {
        await archive(chatId);
        toast.success("Chat archived successfully.");
      } catch (e) {
        toast.handleError(e);
      }
    }
  };

  return (
    <button
      onClick={handleArchive}
      disabled={isPending}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
    >
      {isPending ? "Archiving..." : "Archive Chat"}
    </button>
  );
}
