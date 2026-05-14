"use client";

import {
  TrendingUp,
  Users,
  ChevronDown,
  MessageSquare,
  RotateCw,
  Plus,
  ShieldCheck,
  Settings,
  Activity,
  Zap,
  Tag,
  Star,
  Layers,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/providers/AuthProvider";
import {
  queryKeys,
  useChats,
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
} from "@/api/hooks";
import { useToast } from "@/providers/ToastProvider";
import { fromNanoTON, toNanoTON } from "@/utils/ton";
import {
  PageWrapper,
  PageHeader,
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
  const { userId, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlChatId = searchParams.get("chatId");
  const toast = useToast();

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "plans"
    | "subscribers"
    | "broadcasts"
    | "promo"
    | "reviews"
    | "settings"
  >("plans");

  // Fetch all managed chats
  const { data: chatsRes, isLoading: chatsLoading } = useChats(
    userId ? { owner_id: userId } : undefined,
    { enabled: !!userId }
  );
  const chats = chatsRes?.data?.items || [];

  // Determine active chat
  const activeChatId = urlChatId ? parseInt(urlChatId) : null;
  const myChat = chats.find((c) => c.id === activeChatId) || (chats.length > 0 ? chats[0] : null);

  const handleSync = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    if (myChat?.id) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chatAnalytics(myChat.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.plans(myChat.id) });
    }
    toast.success("Data synchronized");
  };

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

  const { mutateAsync: createPlan, isPending: isCreatingPlan } = useCreateChatPlan();
  const { mutateAsync: updatePlan, isPending: isUpdatingPlan } = useUpdatePlan();

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
          duration_days: newPlan.plan_type === "lifetime" ? undefined : parseInt(newPlan.duration_days) || 30,
          trial_days: 0,
        } as any,
      });
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
      <div className="flex h-screen items-center justify-center">
        <RotateCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <PageWrapper>
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link href="/chats" className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors group">
          <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 group-hover:border-neutral-700">
            <ChevronDown className="rotate-90" size={18} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">Dashboard</span>
        </Link>
        <Button variant="secondary" size="sm" icon={RotateCw} onClick={handleSync} className="!rounded-2xl" />
      </div>

      {/* Selected Chat Header */}
      {myChat ? (
        <Card className="!rounded-[2.5rem] !shadow-2xl">
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-2xl font-black shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              {myChat.title?.[0] || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black truncate">{myChat.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="blue">{myChat.type || "Channel"}</Badge>
                <Badge variant="green">Live</Badge>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
        </Card>
      ) : (
        <Card className="!bg-neutral-900/50 !border-dashed text-center !p-10 !rounded-[2.5rem]">
          <p className="text-neutral-500 mb-6 font-medium">No channel selected for management.</p>
          <Button icon={Plus} onClick={() => setShowRegisterModal(true)}>Register New Channel</Button>
        </Card>
      )}

      {/* Analytics Summary */}
      {myChat?.id && <AnalyticsSummary chatId={myChat.id} />}

      {/* Tab Navigation */}
      {myChat?.id && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "plans", label: "Plans", icon: Layers },
            { id: "subscribers", label: "Subs", icon: Users },
            { id: "broadcasts", label: "Feed", icon: Zap },
            { id: "promo", label: "Promo", icon: Tag },
            { id: "reviews", label: "Reviews", icon: Star },
            { id: "settings", label: "Config", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20"
                  : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-white"
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
              onEditPlan={(plan: any) => {
                setEditingPlan({
                  ...plan,
                  price: fromNanoTON(plan.price_nanoton),
                });
                setShowEditPlanModal(true);
              }}
            />
          )}
          {activeTab === "subscribers" && <SubscribersSection chatId={myChat.id} />}
          {activeTab === "broadcasts" && <BroadcastSection chatId={myChat.id} />}
          {activeTab === "promo" && <PromoSection chatId={myChat.id} />}
          {activeTab === "reviews" && <ReviewsSection chatId={myChat.id} />}
          {activeTab === "settings" && <SettingsSection chat={myChat} />}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} title="Create Plan" icon={TrendingUp}>
        <form onSubmit={handleCreatePlan} className="space-y-6">
          <FormField label="Billing Type">
            <div className="flex p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setNewPlan({ ...newPlan, plan_type: "periodic" })}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  newPlan.plan_type === "periodic" ? "bg-neutral-800 text-white shadow-lg" : "text-neutral-500"
                }`}
              >
                Periodic
              </button>
              <button
                type="button"
                onClick={() => setNewPlan({ ...newPlan, plan_type: "lifetime" })}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  newPlan.plan_type === "lifetime" ? "bg-neutral-800 text-white shadow-lg" : "text-neutral-500"
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
              onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price (TON)">
              <Input
                required
                type="number"
                step="0.1"
                value={newPlan.price}
                onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
              />
            </FormField>
            {newPlan.plan_type === "periodic" && (
              <FormField label="Duration (Days)">
                <Input
                  required
                  type="number"
                  value={newPlan.duration_days}
                  onChange={(e) => setNewPlan({ ...newPlan, duration_days: e.target.value })}
                />
              </FormField>
            )}
          </div>
          <Button type="submit" fullWidth size="lg" loading={isCreatingPlan}>Create Plan</Button>
        </form>
      </Modal>

      <Modal isOpen={showEditPlanModal} onClose={() => setShowEditPlanModal(false)} title="Edit Plan" icon={Settings}>
        {editingPlan && (
          <form onSubmit={handleUpdatePlan} className="space-y-6">
            <FormField label="Status">
              <Select value={editingPlan.status} onChange={(e) => setEditingPlan({ ...editingPlan, status: e.target.value })}>
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
                onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
              />
            </FormField>
            <Button type="submit" fullWidth size="lg" loading={isUpdatingPlan}>Save Changes</Button>
          </form>
        )}
      </Modal>

      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register" icon={ShieldCheck}>
        <div className="text-center space-y-4">
          <p className="text-sm text-neutral-500 leading-relaxed">
            Add our bot as an administrator to your Telegram channel first.
          </p>
          <Button fullWidth onClick={() => window.open("https://t.me/ton_jazylym_bot", "_blank")}>Open Bot</Button>
          <Button variant="secondary" fullWidth onClick={() => setShowRegisterModal(false)}>Close</Button>
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
      <StatCard label="Subscribers" value={analytics.total_subscribers} icon={Users} />
      <StatCard label="Earnings" value={fromNanoTON(analytics.revenue_confirmed)} suffix="TON" icon={Activity} />
    </div>
  );
}

function PlansSection({ chatId, onAddPlan, onEditPlan }: any) {
  const { data: plansRes } = useChatPlans(chatId);
  const plans = plansRes?.data || [];

  return (
    <div className="space-y-4">
      <SectionHeader title="Active Plans" action={<Button variant="ghost" size="sm" icon={Plus} onClick={onAddPlan} className="!text-blue-400">New Plan</Button>} />
      <div className="space-y-3">
        {plans.map((plan: any) => (
          <Card key={plan.id} interactive className="group" padding="sm" onClick={() => onEditPlan(plan)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black">
                  {plan.plan_type === "lifetime" ? "∞" : "D"}
                </div>
                <div>
                  <h5 className="font-black text-white">{plan.title}</h5>
                  <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mt-0.5">
                    {plan.plan_type === "lifetime" ? "Lifetime Access" : `${plan.duration_days} Days Billing`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-blue-400 leading-none">
                  {fromNanoTON(plan.price_nanoton)} <span className="text-[10px] font-normal text-neutral-500">TON</span>
                </p>
                <Badge variant={plan.status === "active" ? "green" : "red"} className="mt-1">{plan.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
        {!plans.length && <Card className="!bg-neutral-900/50 !border-dashed text-center !p-10">No plans created yet.</Card>}
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
      <Card padding="none" className="overflow-hidden divide-y divide-neutral-800 !rounded-3xl">
        {subscribers.map((sub: any) => (
          <div key={sub.subscription_id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-xs uppercase">
                {sub.username?.[0] || "?"}
              </div>
              <div>
                <p className="text-sm font-bold">{sub.username || `User #${sub.user_id}`}</p>
                <Badge variant={sub.status === "active" ? "green" : "neutral"} className="!text-[8px]">{sub.status}</Badge>
              </div>
            </div>
            <Select
              className="!w-auto !py-1 !px-2 !text-[10px] !rounded-lg"
              value={sub.status}
              onChange={(e) => updateStatus({ chatId, subscriptionId: sub.subscription_id, data: { status: e.target.value } })}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </Select>
          </div>
        ))}
        {!subscribers.length && <div className="p-10 text-center text-sm text-neutral-500">No subscribers found.</div>}
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
      <SectionHeader title="Broadcasts" action={<Button variant="ghost" size="sm" icon={Plus} onClick={() => setShowModal(true)} className="!text-blue-400">New Post</Button>} />
      <div className="space-y-3">
        {broadcasts.map((b: any) => (
          <Card key={b.id} padding="md" className="space-y-3">
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-sm">{b.title || "Untitled"}</h5>
              <Badge variant={b.status === "sent" ? "green" : "blue"}>{b.status}</Badge>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">{b.body}</p>
            {b.status === "draft" && (
              <Button fullWidth size="sm" loading={isSending} onClick={() => sendB({ chatId, broadcastId: b.id })}>Send Now</Button>
            )}
          </Card>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Broadcast" icon={Zap}>
        <form onSubmit={handleCreate} className="space-y-6">
          <FormField label="Post Title">
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Catchy headline" />
          </FormField>
          <FormField label="Content Body">
            <TextArea required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="What's happening?" />
          </FormField>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Live Preview</p>
            <Card padding="sm" className="!bg-neutral-950 !border-blue-500/20">
              <p className="font-bold text-sm text-white">{form.title || "Post Title"}</p>
              <p className="text-xs text-neutral-400 mt-1">{form.body || "Post content will appear here..."}</p>
            </Card>
          </div>
          <Button type="submit" fullWidth size="lg" loading={isCreating}>Create Draft</Button>
        </form>
      </Modal>
    </div>
  );
}

function PromoSection({ chatId }: { chatId: number }) {
  const [form, setForm] = useState({ code: "", discount_nanoton: "100000000", max_uses: 10 });
  const { mutateAsync: createPromo, isPending } = useCreatePromoCode();
  const toast = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPromo({ chatId, data: { ...form, discount_nanoton: toNanoTON(form.discount_nanoton).toString() } as any });
      setForm({ code: "", discount_nanoton: "0.1", max_uses: 10 });
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
            <Input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER2024" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Discount (TON)">
              <Input required type="number" step="0.01" value={form.discount_nanoton} onChange={(e) => setForm({ ...form, discount_nanoton: e.target.value })} />
            </FormField>
            <FormField label="Max Uses">
              <Input required type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: parseInt(e.target.value) })} />
            </FormField>
          </div>
          <Button type="submit" fullWidth loading={isPending}>Generate Code</Button>
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
        {reviews.map((r: any) => (
          <Card key={r.id} padding="sm" className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">{r.username || "Anonymous"}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={10} className={s <= (r.rating || 0) ? "fill-yellow-500 text-yellow-500" : "text-neutral-700"} />
                ))}
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">{r.review_text}</p>
          </Card>
        ))}
        {!reviews.length && <Card className="!bg-neutral-900/50 !border-dashed text-center !p-10">No reviews found.</Card>}
      </div>
    </div>
  );
}

function SettingsSection({ chat }: { chat: any }) {
  const { data: catsRes } = useChatCategories();
  const categories = catsRes?.data || [];
  const { mutateAsync: updateChat, isPending } = useUpdateChat();
  const [form, setForm] = useState({
    title: chat.title,
    description: chat.description || "",
    category_id: chat.category_id || 0,
    is_active: chat.is_active,
  });
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateChat({ chatId: chat.id, data: form });
      toast.success("Settings updated");
    } catch (err) {
      toast.handleError(err);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Channel Configuration" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Channel Title">
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </FormField>
          <FormField label="Description">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <FormField label="Category">
            <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}>
              <option value={0}>Uncategorized</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.category}</option>
              ))}
            </Select>
          </FormField>
          <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
            <div>
              <p className="text-xs font-black text-white">Public Visibility</p>
              <p className="text-[9px] text-neutral-500 uppercase font-black">Visible in Explore</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`w-12 h-6 rounded-full transition-all relative ${form.is_active ? "bg-green-600" : "bg-neutral-800"}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_active ? "left-7" : "left-1"}`}></div>
            </button>
          </div>
          <Button type="submit" fullWidth loading={isPending}>Save Configuration</Button>
        </form>
      </Card>
      
      <Card className="!bg-red-500/5 !border-red-500/10">
        <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Danger Zone</h5>
        <p className="text-[10px] text-neutral-500 leading-relaxed">
          To delete this channel, remove our bot from administrators in Telegram.
        </p>
      </Card>
    </div>
  );
}
