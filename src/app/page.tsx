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
  Clock,
  ArrowRight,
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
  Modal,
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
      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-lg transition-colors disabled:opacity-60"
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
  return (
    <div className="flex flex-col pt-8 px-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Logo mark */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-5">
          <span className="text-white font-bold text-lg">J</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Jazylym
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Subscribe to Telegram channels and groups using TON.
        </p>
      </div>

      {/* Simple feature list */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">Log in with Telegram</p>
            <p className="text-xs text-gray-500 mt-0.5">No passwords or email required.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">Browse channels</p>
            <p className="text-xs text-gray-500 mt-0.5">Find creators and communities to support.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">Pay with TON</p>
            <p className="text-xs text-gray-500 mt-0.5">Fast, low-fee crypto payments.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/explore"
        className="flex items-center justify-between w-full py-3 px-4 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-black transition-colors"
      >
        <span>Browse channels</span>
        <ArrowRight size={16} />
      </Link>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Your subscriptions will appear here after joining a channel.
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

  const [optimisticCancelRequested, setOptimisticCancelRequested] = useState<number[]>([]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!giftId) return;
      await redeemGift(parseInt(giftId));
      await queryClient.invalidateQueries({ queryKey: queryKeys.mySubscriptions });
      toast.success("Gift redeemed!");
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      setShowRedeemModal(false);
      setGiftId("");
    } catch (err) {
      toast.handleError(err);
    }
  };

  const handleCancel = async (id: number) => {
    if (
      confirm("Request cancellation for this subscription? The creator will review your request.")
    ) {
      setOptimisticCancelRequested(prev => [...prev, id]);
      try {
        await cancelSub(id);
        await queryClient.invalidateQueries({ queryKey: queryKeys.mySubscriptions });
        toast.success("Cancellation requested");
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch (err) {
        setOptimisticCancelRequested(prev => prev.filter(oid => oid !== id));
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome!</h2>
        {authError ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mt-4 max-w-sm">
            <p className="text-red-600 text-sm">{authError}</p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            Open this app from Telegram to continue.
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="pb-14 pt-6 px-5 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full">
      {/* Pull to refresh indicator */}
      {isRefreshing && (
        <div className="flex justify-center -mt-2 mb-1 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
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
              <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
              {urgentCount > 0 && (
                <p className="text-xs text-orange-600 font-medium mt-0.5 flex items-center gap-1">
                  <Clock size={11} />
                  {urgentCount} expiring soon
                </p>
              )}
            </div>
            <button
              onClick={() => setShowRedeemModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Gift size={14} />
              Redeem
            </button>
          </div>

          <div className="space-y-3">
            {subscriptions.map((sub) => {
              const badge = getExpiryBadge(sub.expires_at);
              return (
                <div
                  key={sub.subscription_id}
                  className={`bg-white border rounded-xl p-3 shadow-sm ${
                    badge.urgent ? "border-orange-200" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar text={sub.chat_title} src={sub.chat_avatar} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {sub.chat_title}
                        </h3>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ml-2 ${badge.bg} ${badge.color} ${badge.border}`}>
                          {badge.urgent && <Clock size={9} />}
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-900 font-medium">
                          {sub.plan_title}
                        </span>
                        {sub.expires_at && (
                          <span className="text-xs text-gray-400">
                            · Until {new Date(sub.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-gray-100 pt-3">
                    {sub.cancel_requested_at || optimisticCancelRequested.includes(sub.subscription_id!) ? (
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                        Cancel pending
                      </div>
                    ) : (
                      <button
                        onClick={() => sub.subscription_id && handleCancel(sub.subscription_id)}
                        className="px-3 py-2 text-xs font-medium text-red-500 bg-white hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center shrink-0 border border-gray-200 hover:border-red-200"
                        title="Request cancellation"
                      >
                        Cancel
                      </button>
                    )}
                    <Link
                      href={`/chats/${sub.chat_id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ExternalLink size={15} /> Details
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
      <Modal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        title="Redeem Gift"
        icon={Gift}
        scrollable={false}
      >
        <form onSubmit={handleRedeem} className="space-y-4">
          <FormField label="Gift ID">
            <Input
              required
              type="number"
              value={giftId}
              onChange={(e) => setGiftId(e.target.value)}
              placeholder="Enter gift ID"
            />
          </FormField>
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isRedeeming}
          >
            {isRedeeming ? "Redeeming..." : "Redeem"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
