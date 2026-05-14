"use client";

import {
  Settings,
  RotateCw,
  ChevronRight,
  Users,
  Sparkles,
  Tv,
  Activity,
  Layers,
  History,
  ArrowDownRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/providers/AuthProvider";
import {
  queryKeys,
  useUserProfile,
  useUpdateUserProfile,
  useCreatorAnalytics,
  usePlatformAnalytics,
  useChats,
  useMySubscriptions,
} from "@/api/hooks";
import { WalletSection } from "@/components/profile/WalletSection";
import Link from "next/link";
import { fromNanoTON } from "@/utils/ton";
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
} from "@/components/ui";

export default function ProfilePage() {
  const { userId, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();
  const queryClient = useQueryClient();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const { data: userRes, isLoading: isUserLoading } = useUserProfile({
    enabled: isAuthenticated,
  });
  const user = userRes?.data;

  const { data: creatorAnalyticsRes } = useCreatorAnalytics(undefined, {
    enabled: isAuthenticated,
  });
  const creatorAnalytics = creatorAnalyticsRes?.data;

  const { data: platformAnalyticsRes } = usePlatformAnalytics(undefined, {
    enabled: isAuthenticated,
  });
  const platformAnalytics = platformAnalyticsRes?.data;

  const { data: chatsRes } = useChats(
    userId ? { owner_id: userId } : undefined,
    { enabled: !!userId }
  );
  const chats = chatsRes?.data?.items || [];

  const { data: mySubsRes } = useMySubscriptions({ limit: 10 }, { enabled: !!userId });
  const paymentHistory = (mySubsRes?.data?.items || [])
    .sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());

  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      });
    }
  }, [user]);

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useUpdateUserProfile();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setShowProfileModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSync = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.user });
    await queryClient.invalidateQueries({ queryKey: queryKeys.creatorAnalytics });
  };

  if (isAuthLoading || isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RotateCw className="animate-spin text-blue-500" size={32} />
          <p className="text-neutral-500 text-sm animate-pulse font-medium">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper className="space-y-8">
      {/* Header with Profile Card */}
      <header className="space-y-6">
        <PageHeader
          title="My Profile"
          action={
            <button
              onClick={handleSync}
              className="p-2 bg-neutral-900 rounded-full border border-neutral-800 active:rotate-180 transition-transform duration-500"
            >
              <RotateCw size={18} className="text-neutral-400" />
            </button>
          }
        />

        {user && (
          <Card className="!rounded-[2.5rem] !shadow-2xl">
            <div className="flex items-center gap-5 relative z-10">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-2xl font-black shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                  {user.first_name?.[0] || user.username?.[0] || "?"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-neutral-900 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-sm text-neutral-500 truncate">@{user.username}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="blue">Creator</Badge>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Settings}
                onClick={() => setShowProfileModal(true)}
                className="!rounded-2xl !p-3"
              />
            </div>
            {/* Background glow */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
          </Card>
        )}
      </header>

      {/* Wallet Setup Section */}
      <WalletSection userId={user?.id} savedWallet={user?.wallet_address} />

      {/* Creator Analytics Section */}
      {creatorAnalytics && (
        <section className="space-y-4 animate-in fade-in duration-500">
          <SectionHeader
            title="Creator Overview"
            icon={Activity}
            iconColor="text-blue-500"
            action={<span className="text-[10px] text-neutral-500 font-medium">Updated live</span>}
          />
          
          <div className="space-y-3">
            {/* Total Earnings Card */}
            <Card className="!bg-gradient-to-br !from-blue-600/10 !via-neutral-900 !to-neutral-900 !border-blue-500/20 group hover:!border-blue-500/40">
               <div className="flex justify-between items-start mb-2">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                   <Sparkles size={24} />
                 </div>
                 <Badge variant="blue">Confirmed Payout</Badge>
               </div>
               <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Total Earned Revenue</p>
               <div className="flex items-baseline gap-2 mb-2">
                 <p className="text-3xl font-black text-white tracking-tight">{fromNanoTON(creatorAnalytics.revenue_confirmed)}</p>
                 <span className="text-sm font-black text-blue-400 uppercase tracking-widest">TON</span>
               </div>
               <p className="text-xs text-neutral-500 font-medium">Funds successfully processed across all your subscription tiers.</p>
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
            </Card>

            {/* Grid for Subscribers & Channels */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Total Audience"
                value={creatorAnalytics.total_subscribers}
                icon={Users}
              />
              <Card className="flex flex-col justify-between">
                 <div>
                   <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300 mb-3">
                     <Tv size={20} />
                   </div>
                   <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Empire Size</p>
                   <p className="text-2xl font-black text-white mb-2">{chats.length}</p>
                 </div>
                 <Link href="/chats">
                   <p className="text-[10px] text-blue-400 font-bold hover:underline inline-flex items-center gap-1">
                     Manage channels <ChevronRight size={10} />
                   </p>
                 </Link>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Platform Analytics (Admin only) */}
      {platformAnalytics && (
        <section className="space-y-4 animate-in fade-in duration-500 pt-2">
          <SectionHeader
            title="Platform Stats"
            icon={Layers}
            iconColor="text-purple-400"
            action={
              <div className="flex items-center gap-2">
                <Badge variant="purple">Admin</Badge>
              </div>
            }
          />

          <Card className="!bg-gradient-to-br !from-purple-900/10 !via-neutral-900 !to-neutral-900 !border-purple-500/20 space-y-4">
             <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-800">
               <div>
                 <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Total Platform Subs</p>
                 <p className="text-xl font-black text-white">{platformAnalytics.total_subscribers ?? 0}</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Active Subs Rate</p>
                 <div className="flex items-baseline gap-1.5">
                   <p className="text-xl font-black text-purple-400">{platformAnalytics.active_subscribers ?? 0}</p>
                   <span className="text-xs text-neutral-500 font-bold">/ {platformAnalytics.total_subscribers ?? 0}</span>
                 </div>
               </div>
             </div>

             {/* Progress bar for Active Subs */}
             <div className="space-y-1.5">
               <div className="flex justify-between text-[10px] font-bold">
                 <span className="text-neutral-400">Subscriber Retention</span>
                 <span className="text-purple-400">
                   {Math.round(((platformAnalytics.active_subscribers ?? 0) / (platformAnalytics.total_subscribers || 1)) * 100)}% Active
                 </span>
               </div>
               <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden p-0.5 border border-neutral-700/50">
                 <div 
                   className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-1000" 
                   style={{ width: `${Math.min(100, ((platformAnalytics.active_subscribers ?? 0) / (platformAnalytics.total_subscribers || 1)) * 100)}%` }} 
                 />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 pt-2">
               <div className="bg-neutral-800/40 p-3 rounded-2xl border border-neutral-800">
                 <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">New Subscriptions</p>
                 <p className="text-lg font-black text-white">{platformAnalytics.new_subscriptions ?? 0}</p>
               </div>
               <div className="bg-neutral-800/40 p-3 rounded-2xl border border-purple-500/10">
                 <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Platform Revenue</p>
                 <p className="text-lg font-black text-purple-400">{fromNanoTON(platformAnalytics.revenue_confirmed)} <span className="text-xs text-neutral-500 font-bold">TON</span></p>
               </div>
             </div>
          </Card>
        </section>
      )}

      {/* Transaction History Section */}
      <section className="space-y-4 animate-in fade-in duration-500 pb-8">
        <SectionHeader
          title="Payment History"
          icon={History}
          iconColor="text-emerald-500"
          action={<span className="text-[10px] text-neutral-500 font-medium">Last 10 transactions</span>}
        />

        <div className="space-y-3">
          {paymentHistory.length > 0 ? (
            paymentHistory.map((sub, i) => (
              <Card
                key={sub.subscription_id || i}
                padding="sm"
                glow="green"
                className="!rounded-2xl !p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10 group-hover:bg-emerald-500/20 transition-all">
                    <ArrowDownRight size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{sub.chat_title}</p>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">
                      {sub.plan_title} • {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : "Unknown Date"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-white">
                    {fromNanoTON(sub.price_nanoton || 0)} <span className="text-[10px] text-neutral-500">TON</span>
                  </p>
                  <Badge variant="green" className="!text-[9px]">Confirmed</Badge>
                </div>
              </Card>
            ))
          ) : (
            <div className="bg-neutral-900/50 border border-neutral-800 border-dashed rounded-2xl p-6 text-center">
               <p className="text-xs text-neutral-500 italic">No payments found in your history.</p>
            </div>
          )}
        </div>
      </section>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Edit Profile"
        icon={Settings}
      >
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <FormField label="First Name">
            <Input
              required
              value={profileForm.first_name}
              onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
            />
          </FormField>
          <FormField label="Last Name">
            <Input
              value={profileForm.last_name}
              onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
            />
          </FormField>
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isUpdatingProfile}
          >
            {isUpdatingProfile ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Modal>
    </PageWrapper>
  );
}
