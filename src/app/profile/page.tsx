"use client";

import {
  TrendingUp,
  Settings,
  RotateCw,
  MessageSquare,
  ChevronRight,
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
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-1">
            Global Analytics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
               <TrendingUp className="absolute -right-2 -bottom-2 text-blue-500/10" size={60} />
               <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Total Subscribers</p>
               <p className="text-2xl font-black text-white">{creatorAnalytics.total_subscribers}</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
               <div className="absolute -right-2 -bottom-2 text-blue-500/10 flex items-center justify-center font-black text-4xl">TON</div>
               <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Total Revenue</p>
               <p className="text-2xl font-black text-blue-400">{fromNanoTON(creatorAnalytics.revenue_confirmed)} <span className="text-xs font-normal text-neutral-500">TON</span></p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl shadow-lg col-span-2 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Managed Channels</p>
                  <p className="text-xl font-black text-white">{chats.length}</p>
               </div>
             </div>
          </div>
        </section>
      )}

      {/* Platform Analytics (Admin only) */}
      {platformAnalytics && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Platform Stats</h3>
            <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-black border border-purple-500/20 uppercase">Core</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
             {[
               { label: "Total Subs", val: platformAnalytics.total_subscribers, color: "text-white" },
               { label: "Active Subs", val: platformAnalytics.active_subscribers, color: "text-white" },
               { label: "New Subs", val: platformAnalytics.new_subscriptions, color: "text-white" },
               { label: "Total Revenue", val: `${fromNanoTON(platformAnalytics.revenue_confirmed)} TON`, color: "text-purple-400" },
             ].map((stat, i) => (
               <div key={i} className="bg-neutral-900/50 border border-neutral-800/50 p-4 rounded-2xl">
                 <p className="text-[9px] font-bold text-neutral-500 uppercase mb-1">{stat.label}</p>
                 <p className={`text-lg font-black ${stat.color}`}>{stat.val ?? 0}</p>
               </div>
             ))}
          </div>
        </section>
      )}

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
