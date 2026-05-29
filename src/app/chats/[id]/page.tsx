"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useChatById,
  useChatPlans,
  useSubscribeToPlan,
  useInitSubscribePayment,
  useApplyPromoCode,
  usePreviewPromoCode,
  usePublicReviews,
  useBroadcasts,
  useMySubscriptions,
} from "@/api/hooks";
import { useTonConnectUI, useTonAddress, TonConnectButton } from "@tonconnect/ui-react";
import { Cell, beginCell, Address } from "@ton/core";
import {
  CheckCircle2,
  Lock,
  Zap,
  Gem,
  ShieldCheck,
  ArrowLeft,
  Star,
  Quote,
  Share2,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { fromNanoTON } from "@/utils/ton";
import { useAuthContext } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import ReviewSection from "@/components/ReviewSection";



export default function ChatSubscriptionPage() {
  const { id } = useParams();
  const chatId = Number(id);
  const { userId, isAuthenticated } = useAuthContext();
  const toast = useToast();

  const {
    data: chatRes,
    isLoading: chatLoading,
    error: chatError,
  } = useChatById(chatId, { enabled: !!chatId });
  const chat = chatRes?.data;

  const { data: plansRes, isLoading: plansLoading } = useChatPlans(chatId, {
    enabled: !!chatId,
  });
  const plans = plansRes?.data || [];

  const { data: subsRes } = useMySubscriptions({}, { enabled: isAuthenticated });
  const isSubscribed = subsRes?.data?.items?.some(s => s.chat_id === chatId && s.status === 'active') || false;

  const { data: broadcastsRes } = useBroadcasts(chatId, { limit: 5 }, { enabled: !!chatId });
  const broadcasts = broadcastsRes?.data?.items || [];

  const { data: reviewsRes } = usePublicReviews(chatId, { limit: 3 }, { enabled: !!chatId });
  const reviews = reviewsRes?.data?.items || [];
  const reviewsSummary = reviewsRes?.data?.summary;

  const { mutateAsync: subscribe, isPending: isSubscribing } =
    useSubscribeToPlan();
  const { mutateAsync: applyPromo, isPending: isApplyingPromo } =
    useApplyPromoCode();
  const { mutateAsync: initPayment } = useInitSubscribePayment();

  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();

  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);
  const [paymentStep, setPaymentStep] = useState<"init" | "wallet" | "verifying" | null>(null);
  const [successData, setSuccessData] = useState<{
    invite_link?: string;
    amount?: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoPreview, setPromoPreview] = useState<{
    original_amount?: number;
    final_amount?: number;
    discount_amount?: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const { mutateAsync: previewPromo, isPending: isPreviewing } =
    usePreviewPromoCode();

  const handleSubscribe = async (planId: number, price?: number) => {
    if (!isAuthenticated) {
      setErrorMsg("You must be logged in via Telegram to subscribe.");
      return;
    }

    if (!tonAddress) {
      setErrorMsg("Please connect your TON wallet first using the Connect Wallet button.");
      try {
        await tonConnectUI.openModal();
      } catch (err) {
        console.error("Failed to open TON Connect modal", err);
      }
      return;
    }

    setLoadingPlanId(planId);
    setErrorMsg(null);
    try {
      // Step 1: Initialize payment on backend
      setPaymentStep("init");
      const initRes = await initPayment({ 
        chatId, 
        planId, 
        promoCode: promoCode || undefined 
      });
      const { contract_address, amount_nanoton, owner_wallet } = initRes.data;

      // Step 2: Build the precise SubscriptionPayment cell body required by the Tact smart contract
      const targetOwnerWallet = owner_wallet || "0QDppW-l8POjdWhZSUy8PsJCVqFVl7sF4QelVi_DroaJRPPH";
      const payloadCell = beginCell()
        .storeUint(0x5375624F, 32) // op code ("SubO")
        .storeAddress(Address.parse(targetOwnerWallet))
        .storeUint(BigInt(Math.abs(chatId)), 64)
        .storeUint(BigInt(planId), 64)
        .storeUint(BigInt(userId || 0), 64)
        .endCell();

      const payloadBase64 = payloadCell.toBoc().toString("base64");

      // Step 3: Prepare transaction parameters for TON Connect UI
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes
        messages: [
          {
            address: contract_address,
            amount: amount_nanoton.toString(),
            payload: payloadBase64
          }
        ]
      };

      // Step 3: Trigger transaction in user wallet
      setPaymentStep("wallet");
      const txResult = await tonConnectUI.sendTransaction(transaction);
      if (!txResult || !txResult.boc) {
        throw new Error("Payment transaction canceled or failed.");
      }

      // Step 4: Calculate incoming message hash from BOC
      const cell = Cell.fromBase64(txResult.boc);
      const hashBytes = cell.hash();
      const txHash = Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join('');

      // Step 5: Subscribe to plan on backend by submitting tx details
      setPaymentStep("verifying");
      const res = await subscribe({
        chatId,
        planId,
        data: {
          tx_hash: txHash,
          wallet_address: tonAddress,
          promo_code: promoCode
        }
      });

      setSuccessData({ invite_link: res.data?.invite_link, amount: fromNanoTON(price) });
    } catch (e: any) {
      console.error(e);
      toast.handleError(e);
      setErrorMsg(e?.message || "Subscription failed. Please make sure the transaction was sent.");
    } finally {
      setLoadingPlanId(null);
      setPaymentStep(null);
    }
  };

  const handlePreviewPromo = async (planId: number) => {
    if (!promoCode) return;
    setPromoError(null);
    try {
      const res = await previewPromo({ planId, data: { code: promoCode } });
      setPromoPreview(res.data);
    } catch (err: any) {
      toast.handleError(err);
      setPromoError(err.message || "Invalid promo code.");
      setPromoPreview(null);
    }
  };

  if (chatLoading || plansLoading) {
    return (
      <div className="pb-24 animate-pulse">
        {/* Hero skeleton */}
        <div className="h-32 w-full bg-neutral-800/70" />

        <div className="px-5">
          {/* Avatar */}
          <div className="relative -mt-12 mb-3">
            <div className="w-24 h-24 rounded-[2rem] bg-neutral-800 border-4 border-neutral-900" />
          </div>

          {/* Title & meta */}
          <div className="mb-6 space-y-2">
            <div className="h-7 w-48 bg-neutral-800 rounded-xl" />
            <div className="h-4 w-24 bg-neutral-800/60 rounded-lg" />
            <div className="h-4 w-full bg-neutral-800/40 rounded-lg mt-2" />
            <div className="h-4 w-3/4 bg-neutral-800/40 rounded-lg" />
          </div>

          {/* Plan cards */}
          <div className="space-y-3 mt-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-neutral-800/50 rounded-[1.5rem] border border-neutral-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (chatError || !chat) {
    return (
      <div className="p-8 text-center text-red-500">Channel not found.</div>
    );
  }

  if (successData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Subscription Active!</h2>
          {successData.amount !== undefined && (
            <p className="text-neutral-400">
              You have successfully subscribed to{" "}
              <span className="text-white font-semibold">{chat.title}</span>.
            </p>
          )}
        </div>

        {/* The "Super App" Magic: Auto-invite */}
        <div className="w-full bg-neutral-800 p-4 rounded-xl border border-neutral-700">
          <p className="text-sm text-neutral-400 mb-3">
            Your Private Invite Link:
          </p>
          {successData.invite_link ? (
            <a
              href={successData.invite_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle size={18} />
              Join Private Channel
            </a>
          ) : (
            <p className="text-red-400 text-sm">
              Failed to generate invite link. Please contact support.
            </p>
          )}
        </div>

        <Link href="/" className="text-sm text-neutral-500 underline mt-4">
          Go to My Subscriptions
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Top Header Navigation */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/explore"
          className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({
                title: chat.title,
                text: chat.description,
                url: url,
              }).catch(() => {
                navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard!");
              });
            } else {
              navigator.clipboard.writeText(url);
              toast.success("Link copied to clipboard!");
            }
          }}
          className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* --- HERO SECTION --- */}
      <div className="relative">
        <div className="h-32 w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900"></div>

        <div className="px-5">
          {/* Avatar */}
          <div className="relative -mt-12 mb-3">
            <Image
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.title}&backgroundColor=b6e3f4`}
              width={96}
              height={96}
              unoptimized
              alt="Channel"
              className="w-24 h-24 rounded-full border-4 border-neutral-900 bg-white"
            />
            {chat.is_premium && (
              <div className="absolute bottom-1 right-1 bg-blue-500 p-1 rounded-full border-2 border-neutral-900">
                <CheckCircle2 size={12} className="text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                {chat.title}
              </h1>
              {/* <p className="text-sm text-neutral-400"> */}
              {/*   @ */}
              {/*   {chat.username || chat.title?.replace(/\s+/g, "").toLowerCase()} */}
              {/* </p> */}
            </div>
            {/* Category Badge */}
            <div className="bg-neutral-800 px-3 py-1 rounded-full text-xs font-medium border border-neutral-700 text-blue-400 flex items-center gap-1.5">
              {chat.category || chat.type}
            </div>
          </div>

          <p className="mt-3 text-neutral-300 text-sm leading-relaxed">
            {chat.description ||
              "The best premium content available on Telegram. Subscribe now to gain access."}
          </p>
        </div>
      </div>

      <hr className="border-neutral-800 my-6 mx-5" />

      {/* --- TIERS SECTION --- */}
      <div className="px-5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-white">Choose Plan</h3>
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded mt-1 inline-block uppercase tracking-wider font-semibold">
              Pay via TON
            </span>
          </div>
          <TonConnectButton />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
            {errorMsg}
          </div>
        )}

        {plans.length > 0 && (
          <div className="bg-neutral-800/40 border border-neutral-800 p-4 rounded-xl space-y-3">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">
              Have a promo code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoPreview(null);
                  setPromoError(null);
                }}
                placeholder="ENTER CODE"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors uppercase font-mono"
              />
              {promoCode && !promoPreview && (
                <button
                  type="button"
                  onClick={() => plans[0]?.id && handlePreviewPromo(plans[0].id)}
                  disabled={isPreviewing}
                  className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-xs font-bold rounded-lg border border-neutral-600 transition-colors disabled:opacity-50"
                >
                  {isPreviewing ? "…" : "Check"}
                </button>
              )}
            </div>
            {promoPreview && (
              <div className="text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-green-400">
                <span className="line-through text-neutral-500 mr-2">
                  {fromNanoTON(promoPreview.original_amount)} TON
                </span>
                →{" "}
                <span className="font-bold">{fromNanoTON(promoPreview.final_amount)} TON</span>{" "}
                (
                {fromNanoTON(promoPreview.discount_amount)} TON off
                )
              </div>
            )}
            {promoError && <p className="text-xs text-red-400">{promoError}</p>}
          </div>
        )}

        {plans.length > 0 ? (
          <div className="grid gap-4">
            {plans.map((tier, index) => {
              const isPopular = index === 0; // Just styling the first one as popular for UI sake
              return (
                <div
                  key={tier.id}
                  className={`relative p-5 rounded-2xl border ${isPopular ? "border-purple-500/50 bg-neutral-800/80" : "border-neutral-800 bg-neutral-800/40"}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white">
                      Best Value
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg">{tier.title}</h4>
                      <div className="flex items-end gap-1 mt-1">
                        <span className="text-2xl font-bold text-white flex items-center gap-1">
                          <Gem
                            size={20}
                            className="text-blue-400 fill-blue-400/20"
                          />
                          {fromNanoTON(tier.price_nanoton)}
                        </span>
                        <span className="text-sm text-neutral-500 mb-1">
                          TON /{" "}
                          {!tier.duration_days
                            ? "Lifetime"
                            : `${tier.duration_days} days`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-5">
                    <li className="text-sm text-neutral-300 flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-neutral-500 mt-0.5 shrink-0"
                      />
                      Access to private {chat.type}
                    </li>
                    <li className="text-sm text-neutral-300 flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-neutral-500 mt-0.5 shrink-0"
                      />
                      Direct interaction with creator
                    </li>
                    {tier.trial_days ? (
                      <li className="text-sm text-emerald-400 flex items-start gap-2">
                        <CheckCircle2
                          size={16}
                          className="text-emerald-500 mt-0.5 shrink-0"
                        />
                        Includes {tier.trial_days} days free trial
                      </li>
                    ) : null}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(tier.id!, tier.price_nanoton)}
                    disabled={
                      loadingPlanId !== null || isSubscribing || isApplyingPromo
                    }
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2
                      ${
                        isPopular
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/20"
                          : "bg-neutral-700 hover:bg-neutral-600 text-white"
                      }`}
                  >
                    {loadingPlanId === tier.id || isSubscribing ? (
                      <span className="animate-pulse">
                        {paymentStep === "init" && "Initializing..."}
                        {paymentStep === "wallet" && "Confirm in Wallet..."}
                        {paymentStep === "verifying" && "Verifying on Blockchain (up to 2m)..."}
                        {!paymentStep && "Processing..."}
                      </span>
                    ) : (
                      <>
                        Subscribe Now
                        <Zap size={16} className="fill-white" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center border border-neutral-800 rounded-xl bg-neutral-900">
            <p className="text-neutral-500">
              No subscription plans available yet.
            </p>
          </div>
        )}
      </div>

      <hr className="border-neutral-800 my-8 mx-5" />

      {/* --- DYNAMIC RECENT FEED --- */}
      <div className="px-5 mb-8">
        <h3 className="font-semibold text-lg text-white mb-4">Recent Feed</h3>
        {broadcasts.length > 0 ? (
          <div className="space-y-4">
            {broadcasts.map((post) => (
              <div
                key={post.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden group hover:border-blue-500/30 transition-all shadow-lg"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      {post.sent_at ? new Date(post.sent_at).toLocaleDateString() : "Recent Update"}
                    </span>
                    {isSubscribed ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <Lock size={14} className="text-neutral-600" />
                    )}
                  </div>
                  <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                    {post.title || "Untitled Post"}
                  </h4>
                </div>

                {!isSubscribed && (
                  <div className="relative h-20 bg-neutral-950/40 p-4 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 backdrop-blur-md flex items-center justify-center bg-black/40 z-10">
                      <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl">
                        <Lock size={12} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
                          Subscribers Only
                        </span>
                      </div>
                    </div>
                    <p className="text-neutral-800 select-none blur-[6px] text-xs leading-relaxed">
                      {post.body || "This content is exclusively available for active subscribers of this channel. Subscribe now to unlock full access."}
                    </p>
                  </div>
                )}
                
                {isSubscribed && post.body && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed">
                      {post.body}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900/50 border border-neutral-800 border-dashed rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="text-neutral-600" size={20} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No Posts Yet</h4>
            <p className="text-xs text-neutral-500">The creator hasn't posted anything here yet.</p>
          </div>
        )}
      </div>

      <hr className="border-neutral-800 my-8 mx-5" />

      {/* --- REVIEWS SECTION --- */}
      <ReviewSection chatId={chatId} />

      <div className="flex justify-center mt-10 mb-4 opacity-50">
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 uppercase tracking-widest">
          <ShieldCheck size={12} />
          Secured by TON
        </div>
      </div>
    </div>
  );
}
