"use client";

import {
  TrendingUp,
  Settings,
  RotateCw,
  MessageSquare,
  ChevronRight,
  Users,
  Sparkles,
  Tv,
  Award,
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
    <div className="pb-24 pt-6 px-5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-white">
      {/* Header with Profile Card */}
      <header className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight text-white">My Profile</h1>
          <button
            onClick={handleSync}
            className="p-2 bg-neutral-900 rounded-full border border-neutral-800 active:rotate-180 transition-transform duration-500"
          >
            <RotateCw size={18} className="text-neutral-400" />
          </button>
        </div>

        {user && (
          <div className="relative group overflow-hidden bg-neutral-900 border border-neutral-800 p-5 rounded-[2.5rem] shadow-2xl">
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
                   <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                     Creator
                   </span>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-2xl transition-all active:scale-95 border border-neutral-700"
              >
                <Settings size={20} className="text-neutral-300" />
              </button>
            </div>
            {/* Background pattern */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
          </div>
        )}
      </header>

      {/* Wallet Setup Section */}
      <WalletSection userId={user?.id} savedWallet={user?.wallet_address} />

      {/* Creator Analytics Section */}
      {creatorAnalytics && (
        <section className="space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> Creator Overview
            </h3>
            <span className="text-[10px] text-neutral-500 font-medium">Updated live</span>
          </div>
          
          <div className="space-y-3">
            {/* Total Earnings Card */}
            <div className="bg-gradient-to-br from-blue-600/10 via-neutral-900 to-neutral-900 border border-blue-500/20 p-5 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
               <div className="flex justify-between items-start mb-2">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                   <Sparkles size={24} />
                 </div>
                 <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                   Confirmed Payout
                 </span>
               </div>
               <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Total Earned Revenue</p>
               <div className="flex items-baseline gap-2 mb-2">
                 <p className="text-3xl font-black text-white tracking-tight">{fromNanoTON(creatorAnalytics.revenue_confirmed)}</p>
                 <span className="text-sm font-black text-blue-400 uppercase tracking-widest">TON</span>
               </div>
               <p className="text-xs text-neutral-500 font-medium">Funds successfully processed across all your subscription tiers.</p>
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
            </div>

            {/* Grid for Subscribers & Channels */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-[2rem] shadow-lg relative overflow-hidden hover:border-neutral-700 transition-all flex flex-col justify-between">
                 <div>
                   <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300 mb-3">
                     <Users size={20} />
                   </div>
                   <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Total Audience</p>
                   <p className="text-2xl font-black text-white mb-2">{creatorAnalytics.total_subscribers}</p>
                 </div>
                 <p className="text-[10px] text-neutral-500 leading-tight font-medium">Active paying members.</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-[2rem] shadow-lg relative overflow-hidden hover:border-neutral-700 transition-all flex flex-col justify-between">
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
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Platform Analytics (Admin only) */}
      {platformAnalytics && (
        <section className="space-y-4 animate-in fade-in duration-500 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={16} className="text-purple-400" /> Platform Stats
              </h3>
              <span className="text-[8px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-black border border-purple-500/20 uppercase tracking-widest">Admin</span>
            </div>
            <span className="text-[10px] text-purple-400/80 font-semibold uppercase tracking-wider">System Core</span>
          </div>

          <div className="bg-gradient-to-br from-purple-900/10 via-neutral-900 to-neutral-900 border border-purple-500/20 p-5 rounded-[2rem] space-y-4 shadow-xl">
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
          </div>
        </section>
      )}

      {/* Transaction History Section */}
      <section className="space-y-4 animate-in fade-in duration-500 pb-8">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <History size={16} className="text-emerald-500" /> Payment History
          </h3>
          <span className="text-[10px] text-neutral-500 font-medium">Last 10 transactions</span>
        </div>

        <div className="space-y-3">
          {paymentHistory.length > 0 ? (
            paymentHistory.map((sub, i) => (
              <div 
                key={sub.subscription_id || i}
                className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between group hover:border-emerald-500/20 transition-all"
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
                  <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                    Confirmed
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-neutral-900/50 border border-neutral-800 border-dashed rounded-2xl p-6 text-center">
               <p className="text-xs text-neutral-500 italic">No payments found in your history.</p>
            </div>
          )}
        </div>
      </section>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto pt-12 pb-24">
          <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative">
             <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
                <Settings className="animate-spin-slow" size={24} />
             </button>
             <h3 className="text-2xl font-black mb-8">Edit Profile</h3>
             <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">First Name</label>
                   <input
                     required
                     className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                     value={profileForm.first_name}
                     onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Last Name</label>
                   <input
                     className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                     value={profileForm.last_name}
                     onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                   />
                </div>

                <button
                  disabled={isUpdatingProfile}
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black transition-all shadow-[0_10px_20px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50"
                >
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
