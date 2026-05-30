"use client";

import {
  RotateCw,
  ChevronRight,
  Users,
  TrendingUp,
  Hash,
  History,
  ArrowDownLeft,
  RefreshCw,
  Settings,
  Layers,
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
import { Avatar } from "@/components/ui/Avatar";
import {
  Modal,
  FormField,
  Input,
  Button,
  Badge,
} from "@/components/ui";
import { X } from "lucide-react";

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
        <RotateCw className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-gray-900">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500">Manage your account</p>
        </div>
        <button
          onClick={handleSync}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Profile Card */}
      {user && (
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex items-center gap-4">
          <Avatar text={user.first_name || user.username} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-sm text-gray-500 truncate">@{user.username}</p>
            <div className="flex gap-2 mt-1.5">
              <Badge variant="blue">Creator</Badge>
            </div>
          </div>
          <button
            onClick={() => setShowProfileModal(true)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      )}

      {/* Wallet */}
      <WalletSection userId={user?.id} savedWallet={user?.wallet_address} />

      {/* Creator Analytics */}
      {creatorAnalytics && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
            Creator Overview
          </h2>

          {/* Revenue Card */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-bold text-gray-900">
                {fromNanoTON(creatorAnalytics.revenue_confirmed)}
              </p>
              <span className="text-sm font-medium text-gray-500">TON</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all subscription tiers</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} className="text-gray-400" />
                <p className="text-xs text-gray-500">Subscribers</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {creatorAnalytics.total_subscribers}
              </p>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash size={14} className="text-gray-400" />
                <p className="text-xs text-gray-500">Channels</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{chats.length}</p>
              <Link href="/chats">
                <p className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-0.5 mt-1 transition-colors">
                  Manage <ChevronRight size={10} />
                </p>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Platform Analytics (Admin only) */}
      {platformAnalytics && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Platform Stats
            </h2>
            <Badge variant="purple">Admin</Badge>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Subscribers</p>
                <p className="text-xl font-bold text-gray-900">{platformAnalytics.total_subscribers ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Active</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-bold text-gray-900">{platformAnalytics.active_subscribers ?? 0}</p>
                  <span className="text-xs text-gray-400">/ {platformAnalytics.total_subscribers ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Retention</span>
                <span>
                  {Math.round(((platformAnalytics.active_subscribers ?? 0) / (platformAnalytics.total_subscribers || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gray-900 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, ((platformAnalytics.active_subscribers ?? 0) / (platformAnalytics.total_subscribers || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">New Subs</p>
                <p className="text-lg font-bold text-gray-900">{platformAnalytics.new_subscriptions ?? 0}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Revenue</p>
                <p className="text-lg font-bold text-gray-900">
                  {fromNanoTON(platformAnalytics.revenue_confirmed)}{" "}
                  <span className="text-xs font-normal text-gray-500">TON</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Payment History */}
      <section className="space-y-3 pb-8">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Payment History
          </h2>
          <span className="text-xs text-gray-400">Last 10</span>
        </div>

        <div className="space-y-3">
          {paymentHistory.length > 0 ? (
            paymentHistory.map((sub, i) => (
              <div
                key={sub.subscription_id || i}
                className="bg-white border border-gray-100 shadow-sm p-3 rounded-xl flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <ArrowDownLeft size={16} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{sub.chat_title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {sub.plan_title} · {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {fromNanoTON(sub.price_nanoton || 0)}
                    <span className="text-xs font-normal text-gray-500 ml-1">TON</span>
                  </p>
                  <span className="text-[10px] text-green-600 font-medium">confirmed</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl text-center">
              <p className="text-sm text-gray-500">No payment history yet.</p>
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
        <form onSubmit={handleUpdateProfile} className="space-y-4">
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
    </div>
  );
}
