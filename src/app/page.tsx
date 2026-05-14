"use client";

import {
  queryKeys,
  useMySubscriptions,
  useCancelSubscription,
  useRedeemGift,
  useInviteLink,
} from "@/api/hooks";
import {
  MessageCircle,
  ExternalLink,
  Trash2,
  Gift,
  X,
  Loader2,
  Compass,
  Sparkles,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useAuthContext } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { LoadingState } from "@/components/ui/LoadingState";
import { getExpiryBadge, daysUntil } from "@/utils/date";

function OpenChatButton({ chatId }: { chatId: number }) {
  const [enabled, setEnabled] = useState(false);
  const { data, isLoading } = useInviteLink(chatId, { enabled });
  const openedRef = useRef(false);

  const link = data?.data?.invite_link;

  useEffect(() => {
    if (enabled && link && !openedRef.current) {
      openedRef.current = true;
      window.open(link, "_blank");
    }
  }, [enabled, link]);

  return (
    <button
      onClick={() => {
        if (link) {
          window.open(link, "_blank");
        } else {
          openedRef.current = false;
          setEnabled(true);
        }
      }}
      disabled={isLoading}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-60"
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <MessageCircle size={16} />
      )}
      Open Chat
    </button>
  );
}

function OnboardingScreen() {
  const steps = [
    {
      icon: ShieldCheck,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      title: "Telegram-Powered Identity",
      desc: "Your Telegram account is your login — no password, no email.",
    },
    {
      icon: Compass,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      title: "Discover Premium Channels",
      desc: "Browse exclusive creator content across all categories.",
    },
    {
      icon: Sparkles,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
      title: "Pay with TON — Instantly",
      desc: "Subscribe in seconds with your TON wallet. No banks, no fees.",
    },
  ];

  return (
    <div className="flex flex-col min-h-[70vh] pt-8 px-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
          <Sparkles className="text-white" size={36} />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
          Welcome to Jazylym
        </h1>
        <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto">
          The first TON-powered creator subscription platform built inside Telegram.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-10">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-4 p-4 rounded-[1.5rem] border bg-neutral-900 border-neutral-800`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${step.bg}`}>
                <Icon size={20} className={step.color} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">{step.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Link
        href="/explore"
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(99,102,241,0.35)] active:scale-95 transition-all"
      >
        <Compass size={18} />
        Start Exploring Channels
      </Link>

      <p className="text-center text-xs text-neutral-600 mt-4">
        Your subscriptions will appear here once you join a channel.
      </p>
    </div>
  );
}

export default function HomePage() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    authError,
  } = useAuthContext();
  const { data: subsRes, isLoading: subsLoading } = useMySubscriptions(
    { limit: 20 },
    { enabled: isAuthenticated },
  );
  const queryClient = useQueryClient();
  const { mutateAsync: cancelSub } = useCancelSubscription();

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [giftId, setGiftId] = useState("");
  const toast = useToast();
  const { mutateAsync: redeemGift, isPending: isRedeeming } = useRedeemGift();

  // Pull-to-refresh
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = async (e: TouchEvent) => {
      const diff = e.changedTouches[0].clientY - touchStartY.current;
      if (diff > 80 && el.scrollTop === 0 && !isRefreshing) {
        setIsRefreshing(true);
        await queryClient.invalidateQueries({ queryKey: queryKeys.mySubscriptions });
        setTimeout(() => setIsRefreshing(false), 800);
      }
    };
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isRefreshing, queryClient]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!giftId) return;
      await redeemGift(parseInt(giftId));
      await queryClient.invalidateQueries({ queryKey: queryKeys.mySubscriptions });
      toast.success("Gift redeemed successfully!");
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      setShowRedeemModal(false);
      setGiftId("");
    } catch (err) {
      toast.handleError(err);
    }
  };

  const handleCancel = async (id: number) => {
    if (
      confirm("Are you sure you want to cancel this subscription? You will lose access immediately.")
    ) {
      try {
        await cancelSub(id);
        await queryClient.invalidateQueries({ queryKey: queryKeys.mySubscriptions });
        toast.success("Subscription canceled successfully");
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch (err) {
        toast.handleError(err);
      }
    }
  };

  const subscriptions = (subsRes?.data?.items || []).filter(
    (s) => s.status === "active",
  );

  const urgentCount = subscriptions.filter((s) => {
    const d = daysUntil(s.expires_at);
    return d !== null && d <= 7;
  }).length;

  if (authLoading || subsLoading) {
    return (
      <div className="p-5 pt-8">
        <LoadingState count={3} height="h-32" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
        <h2 className="text-xl font-bold text-white mb-2">Welcome!</h2>
        {authError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-4 max-w-sm">
            <p className="text-red-400 text-sm">{authError}</p>
          </div>
        ) : (
          <p className="text-neutral-400">
            Please open this Mini App from Telegram to log in.
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="pb-14 pt-6 px-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full">
      {/* Pull to refresh indicator */}
      {isRefreshing && (
        <div className="flex justify-center -mt-2 mb-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
            <Loader2 size={12} className="animate-spin" />
            Refreshing...
          </div>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <OnboardingScreen />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">My Subscriptions</h1>
              {urgentCount > 0 && (
                <p className="text-xs text-orange-400 font-medium mt-0.5 flex items-center gap-1">
                  <Clock size={11} />
                  {urgentCount} subscription{urgentCount > 1 ? "s" : ""} expiring soon
                </p>
              )}
            </div>
            <button
              onClick={() => setShowRedeemModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-colors"
            >
              <Gift size={14} /> REDEEM
            </button>
          </div>

          <div className="space-y-4">
            {subscriptions.map((sub) => {
              const badge = getExpiryBadge(sub.expires_at);
              return (
                <div
                  key={sub.subscription_id}
                  className={`bg-neutral-900 border rounded-2xl p-4 flex flex-col gap-4 shadow-lg transition-all ${
                    badge.urgent ? "border-orange-500/30 shadow-orange-900/10" : "border-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar text={sub.chat_title} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg leading-tight truncate">
                          {sub.chat_title}
                        </h3>
                        {/* Expiry Badge */}
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide flex items-center gap-1 shrink-0 ${badge.bg} ${badge.color} ${badge.border}`}>
                          {badge.urgent && <Clock size={9} />}
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {sub.plan_title}
                        </span>
                        {sub.expires_at && (
                          <span className="text-xs text-neutral-500">
                            Until {new Date(sub.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex gap-2">
                    <button
                      onClick={() => sub.subscription_id && handleCancel(sub.subscription_id)}
                      className="p-2.5 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <Link
                      href={`/chats/${sub.chat_id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
                    >
                      <ExternalLink size={16} /> Details
                    </Link>
                    <OpenChatButton chatId={sub.chat_id!} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Redeem Gift Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setShowRedeemModal(false)}
              className="absolute top-4 right-4 text-neutral-500"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Gift className="text-blue-400" size={20} /> Redeem Gift
            </h3>
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Enter Gift ID
                </label>
                <input
                  required
                  type="number"
                  value={giftId}
                  onChange={(e) => setGiftId(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Gift Identification Number"
                />
              </div>
              <button
                type="submit"
                disabled={isRedeeming}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isRedeeming ? "Redeeming..." : "Redeem Now"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
