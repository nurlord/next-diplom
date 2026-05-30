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
import {
  Button,
  Card,
  Badge,
  Modal,
  PageWrapper,
  PageHeader,
  Input,
  FormField,
} from "@/components/ui";

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
      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-xl shadow-md shadow-gray-900/10 transition-all active:scale-95 disabled:opacity-60"
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
    <div className="flex flex-col pt-4 px-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Hero */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
          <Sparkles className="text-white" size={28} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">
          Welcome to Jazylym
        </h1>
        <p className="text-gray-500 text-xs leading-relaxed max-w-xs mx-auto">
          The first TON-powered creator subscription platform built inside Telegram.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-6">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3.5 rounded-[1.25rem] border bg-white border-gray-100 shadow-sm`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${step.bg}`}>
                <Icon size={18} className={step.color} />
              </div>
              <div>
                <p className="font-bold text-[13px] text-gray-900">{step.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Link
        href="/explore"
        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(99,102,241,0.35)] active:scale-95 transition-all"
      >
        <Compass size={16} />
        Start Exploring Channels
      </Link>

      <p className="text-center text-[10px] text-gray-500 mt-3">
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

  const [optimisticCancelled, setOptimisticCancelled] = useState<number[]>([]);

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
      setOptimisticCancelled(prev => [...prev, id]);
      try {
        await cancelSub(id);
        await queryClient.invalidateQueries({ queryKey: queryKeys.mySubscriptions });
        toast.success("Subscription canceled successfully");
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch (err) {
        setOptimisticCancelled(prev => prev.filter(oid => oid !== id));
        toast.handleError(err);
      }
    }
  };

  const subscriptions = (subsRes?.data?.items || []).filter(
    (s) => s.status === "active" && !optimisticCancelled.includes(s.subscription_id!),
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome!</h2>
        {authError ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mt-4 max-w-sm">
            <p className="text-red-600 text-sm">{authError}</p>
          </div>
        ) : (
          <p className="text-gray-500">
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
              <h1 className="text-2xl font-bold text-gray-900">My Subscriptions</h1>
              {urgentCount > 0 && (
                <p className="text-xs text-orange-600 font-medium mt-0.5 flex items-center gap-1">
                  <Clock size={11} />
                  {urgentCount} subscription{urgentCount > 1 ? "s" : ""} expiring soon
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={Gift}
              onClick={() => setShowRedeemModal(true)}
              className="!bg-gray-100 !text-gray-900 !border !border-gray-200 !hover:bg-gray-200"
            >
              REDEEM
            </Button>
          </div>

          <div className="space-y-4">
            {subscriptions.map((sub) => {
              const badge = getExpiryBadge(sub.expires_at);
              return (
                <Card
                  key={sub.subscription_id}
                  padding="sm"
                  className={`!rounded-2xl !p-4 flex flex-col gap-4 ${
                    badge.urgent ? "!border-orange-200 bg-orange-50/50" : ""
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
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-transparent">
                          {sub.plan_title}
                        </span>
                        {sub.expires_at && (
                          <span className="text-xs text-gray-500">
                            Until {new Date(sub.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => sub.subscription_id && handleCancel(sub.subscription_id)}
                      className="!p-2.5"
                    />
                    <Link
                      href={`/chats/${sub.chat_id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <ExternalLink size={16} /> Details
                    </Link>
                    <OpenChatButton chatId={sub.chat_id!} />
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Redeem Gift Modal */}
      <Modal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        title="Redeem Gift"
        icon={Gift}
        scrollable={false}
      >
        <form onSubmit={handleRedeem} className="space-y-4">
          <FormField label="Enter Gift ID">
            <Input
              required
              type="number"
              value={giftId}
              onChange={(e) => setGiftId(e.target.value)}
              placeholder="Gift Identification Number"
            />
          </FormField>
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isRedeeming}
          >
            {isRedeeming ? "Redeeming..." : "Redeem Now"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
