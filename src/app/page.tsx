"use client";

import { useMySubscriptions, useCancelSubscription, useRedeemGift, useInviteLink } from "@/api/hooks";
import { MessageCircle, ExternalLink, Trash2, Gift, X, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthContext } from "@/providers/AuthProvider";

function OpenChatButton({ chatId }: { chatId: number }) {
  const [enabled, setEnabled] = useState(false);
  const { data, isLoading } = useInviteLink(chatId, { enabled });
  const openedRef = useRef(false);

  const link = data?.data?.invite_link;

  useEffect(() => {
    if (enabled && link && !openedRef.current) {
      openedRef.current = true;
      window.open(link, '_blank');
    }
  }, [enabled, link]);

  return (
    <button
      onClick={() => {
        if (link) {
          window.open(link, '_blank');
        } else {
          openedRef.current = false;
          setEnabled(true);
        }
      }}
      disabled={isLoading}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-60"
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
      Open Chat
    </button>
  );
}


export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading, authError } = useAuthContext();
  const { data: subsRes, isLoading: subsLoading } = useMySubscriptions(
    { limit: 20 },
    { enabled: isAuthenticated }
  );
  const { mutateAsync: cancelSub } = useCancelSubscription();

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [giftId, setGiftId] = useState("");
  const { mutateAsync: redeemGift, isPending: isRedeeming } = useRedeemGift();

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!giftId) return;
      await redeemGift(parseInt(giftId));
      alert("Gift redeemed successfully!");
      setShowRedeemModal(false);
      setGiftId("");
    } catch (err) {
      console.error("Failed to redeem gift", err);
      alert("Invalid Gift ID or already redeemed.");
    }
  };

  const handleCancel = async (id: number) => {
    if (confirm("Are you sure you want to cancel this subscription? You will lose access immediately.")) {
      try {
        await cancelSub(id);
      } catch (err) {
        console.error("Failed to cancel subscription", err);
        alert("Failed to cancel. Please try again.");
      }
    }
  };

  const subscriptions = subsRes?.data?.items || [];

  if (authLoading || subsLoading) {
    return <div className="p-8 text-center text-neutral-500 animate-pulse">Loading subscriptions...</div>;
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
          <p className="text-neutral-400">Please open this Mini App from Telegram to log in.</p>
        )}
      </div>
    );
  }

  return (
    <div className="pb-14 pt-6 px-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">My Subscriptions</h1>
        <button 
          onClick={() => setShowRedeemModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-colors"
        >
          <Gift size={14} /> REDEEM
        </button>
      </div>

      {subscriptions.length > 0 ? (
        <div className="space-y-4 shadow-xl">
          {subscriptions.map((sub) => (
            <div
              key={sub.subscription_id}
              className="bg-neutral-800/60 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-lg shadow-inner">
                  {sub.chat_title?.[0] || "?"}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg leading-tight">{sub.chat_title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {sub.plan_title}
                    </span>
                    <span className="text-xs text-neutral-400">
                      Active until {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'Forever'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-700/50 flex gap-2">
                <button 
                  onClick={() => sub.subscription_id && handleCancel(sub.subscription_id)}
                  className="p-2.5 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <Link
                  href={`/chats/${sub.chat_id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-neutral-700/50 hover:bg-neutral-700 rounded-xl transition-colors"
                >
                  <ExternalLink size={16} /> Details
                </Link>
                <OpenChatButton chatId={sub.chat_id!} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl space-y-4">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-500 border border-neutral-700 shadow-inner">
            <MessageCircle size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">No Active Subscriptions</h3>
            <p className="text-sm text-neutral-400">
              Discover amazing creators and premium channels on the Explore page.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-block mt-2 px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors shadow-lg active:scale-95"
          >
            Start Exploring
          </Link>
        </div>
      )}

      {/* Redeem Gift Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setShowRedeemModal(false)} className="absolute top-4 right-4 text-neutral-500">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Gift className="text-blue-400" size={20} /> Redeem Gift
            </h3>
            
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Enter Gift ID</label>
                <input 
                  required
                  type="number" 
                  value={giftId}
                  onChange={e => setGiftId(e.target.value)}
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
