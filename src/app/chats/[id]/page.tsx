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
  useMySubscriptions,
} from "@/api/hooks";
import { useTonConnectUI, useTonAddress, TonConnectButton } from "@tonconnect/ui-react";
import { Cell, beginCell, Address } from "@ton/core";
import {
  CheckCircle2,
  ArrowLeft,
  Share2,
  MessageCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { fromNanoTON } from "@/utils/ton";
import { useAuthContext } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import ReviewSection from "@/components/ReviewSection";
import { Avatar } from "@/components/ui/Avatar";

export default function ChatSubscriptionPage() {
  const { id } = useParams();
  const chatId = Number(id);
  const { userId, isAuthenticated } = useAuthContext();
  const toast = useToast();

  const { data: chatRes, isLoading: chatLoading, error: chatError } = useChatById(chatId, { enabled: !!chatId });
  const chat = chatRes?.data;

  const { data: plansRes, isLoading: plansLoading } = useChatPlans(chatId, { enabled: !!chatId });
  const plans = plansRes?.data || [];

  const { data: subsRes } = useMySubscriptions({}, { enabled: isAuthenticated });
  const isSubscribed = subsRes?.data?.items?.some(s => s.chat_id === chatId && s.status === "active") || false;



  const { mutateAsync: subscribe, isPending: isSubscribing } = useSubscribeToPlan();
  const { isPending: isApplyingPromo } = useApplyPromoCode();
  const { mutateAsync: initPayment } = useInitSubscribePayment();

  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();

  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);
  const [paymentStep, setPaymentStep] = useState<"init" | "wallet" | "verifying" | null>(null);
  const [successData, setSuccessData] = useState<{ invite_link?: string; amount?: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoPreview, setPromoPreview] = useState<{
    original_amount?: number;
    final_amount?: number;
    discount_amount?: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const { mutateAsync: previewPromo, isPending: isPreviewing } = usePreviewPromoCode();

  const handleSubscribe = async (planId: number, price?: number) => {
    if (!isAuthenticated) { setErrorMsg("Log in via Telegram to subscribe."); return; }
    if (!tonAddress) {
      setErrorMsg("Connect your TON wallet first.");
      try { await tonConnectUI.openModal(); } catch {}
      return;
    }

    setLoadingPlanId(planId);
    setErrorMsg(null);
    try {
      setPaymentStep("init");
      const initRes = await initPayment({ chatId, planId, promoCode: promoCode || undefined });
      const { contract_address, amount_nanoton, owner_wallet } = initRes.data;

      const targetOwnerWallet = owner_wallet || "0QDppW-l8POjdWhZSUy8PsJCVqFVl7sF4QelVi_DroaJRPPH";
      const payloadCell = beginCell()
        .storeUint(0x5375624F, 32)
        .storeAddress(Address.parse(targetOwnerWallet))
        .storeUint(BigInt(Math.abs(chatId)), 64)
        .storeUint(BigInt(planId), 64)
        .storeUint(BigInt(userId || 0), 64)
        .endCell();

      const payloadBase64 = payloadCell.toBoc().toString("base64");
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [{ address: contract_address, amount: amount_nanoton.toString(), payload: payloadBase64 }],
      };

      setPaymentStep("wallet");
      const txResult = await tonConnectUI.sendTransaction(transaction);
      if (!txResult?.boc) throw new Error("Transaction cancelled.");

      const cell = Cell.fromBase64(txResult.boc);
      const hashBytes = cell.hash();
      const txHash = Array.from(hashBytes).map(b => b.toString(16).padStart(2, "0")).join("");

      setPaymentStep("verifying");
      const res = await subscribe({ chatId, planId, data: { tx_hash: txHash, wallet_address: tonAddress, promo_code: promoCode } });
      setSuccessData({ invite_link: res.data?.invite_link, amount: fromNanoTON(price) });
    } catch (e) {
      toast.handleError(e);
      setErrorMsg(e instanceof Error ? e.message : "Subscription failed.");
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
    } catch (err) {
      toast.handleError(err);
      setPromoError(err instanceof Error ? err.message : "Invalid promo code.");
      setPromoPreview(null);
    }
  };

  /* ── Loading skeleton ─────────────────────────────────────────────────── */
  if (chatLoading || plansLoading) {
    return (
      <div className="pb-24 animate-pulse px-5 pt-6 space-y-4">
        <div className="h-5 w-24 rounded-lg" style={{ background: "var(--bg-muted)" }} />
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl shrink-0" style={{ background: "var(--bg-muted)" }} />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded-lg" style={{ background: "var(--bg-muted)" }} />
            <div className="h-3 w-24 rounded-lg" style={{ background: "var(--bg-muted)" }} />
          </div>
        </div>
        <div className="h-12 rounded-xl" style={{ background: "var(--bg-muted)" }} />
        {[1, 2].map(i => (
          <div key={i} className="h-28 rounded-xl" style={{ background: "var(--bg-muted)" }} />
        ))}
      </div>
    );
  }

  if (chatError || !chat) {
    return <div className="p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>Channel not found.</div>;
  }

  /* ── Success screen ───────────────────────────────────────────────────── */
  if (successData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center space-y-5 animate-in fade-in duration-300">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "var(--bg-muted)" }}
        >
          <CheckCircle2 size={28} style={{ color: "var(--text-primary)" }} />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>You&apos;re in.</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Subscribed to <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{chat.title}</span>.
          </p>
        </div>

        <div
          className="w-full p-4 rounded-xl border space-y-3"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Your invite link:</p>
          {successData.invite_link ? (
            <a
              href={successData.invite_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
              style={{ background: "var(--accent)", color: "var(--text-inverse)" }}
            >
              <MessageCircle size={16} />
              Join Channel
            </a>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Failed to generate link. Contact support.
            </p>
          )}
        </div>

        <Link href="/" className="text-sm" style={{ color: "var(--text-muted)" }}>
          Back to subscriptions
        </Link>
      </div>
    );
  }

  /* ── Main page ────────────────────────────────────────────────────────── */
  return (
    <div className="pb-24" style={{ color: "var(--text-primary)" }}>

      {/* Nav row */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Link
          href="/explore"
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={16} />
          Explore
        </Link>
        <button
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ title: chat.title, url }).catch(() => {
                navigator.clipboard.writeText(url);
                toast.success("Link copied");
              });
            } else {
              navigator.clipboard.writeText(url);
              toast.success("Link copied");
            }
          }}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <Share2 size={17} />
        </button>
      </div>

      {/* Channel header */}
      <div
        className="mx-5 p-4 rounded-xl border flex items-center gap-4"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-subtle)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <Avatar text={chat.title} src={chat.avatar} size="lg" />
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-base truncate" style={{ color: "var(--text-primary)" }}>
            {chat.title}
          </h1>
          <p className="text-xs mt-0.5 capitalize" style={{ color: "var(--text-muted)" }}>
            {chat.category || chat.type}
          </p>
        </div>
      </div>

      {/* Description */}
      {chat.description && (
        <div className="mx-5 mt-3">
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
            {chat.description}
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="mx-5 my-5 border-t" style={{ borderColor: "var(--border)" }} />

      {/* Plans section */}
      <div className="px-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
            Choose a plan
          </h2>
          <TonConnectButton />
        </div>

        {/* Error */}
        {errorMsg && (
          <div
            className="p-3 rounded-lg text-sm border"
            style={{
              background: "#fef2f2",
              borderColor: "#fecaca",
              color: "#dc2626",
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Promo code */}
        {plans.length > 0 && (
          <div
            className="p-3 rounded-xl border space-y-2"
            style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
          >
            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Promo code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoPreview(null); setPromoError(null); }}
                placeholder="ENTER CODE"
                className="flex-1 rounded-lg px-3 py-2 text-sm font-mono border focus:outline-none transition-colors"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              {promoCode && !promoPreview && (
                <button
                  type="button"
                  onClick={() => plans[0]?.id && handlePreviewPromo(plans[0].id)}
                  disabled={isPreviewing}
                  className="px-3 py-2 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  {isPreviewing ? "…" : "Apply"}
                </button>
              )}
            </div>
            {promoPreview && (
              <div className="text-sm flex items-center gap-2">
                <span className="line-through" style={{ color: "var(--text-muted)" }}>
                  {fromNanoTON(promoPreview.original_amount)} TON
                </span>
                <span>→</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {fromNanoTON(promoPreview.final_amount)} TON
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  (–{fromNanoTON(promoPreview.discount_amount)} TON)
                </span>
              </div>
            )}
            {promoError && (
              <p className="text-xs" style={{ color: "#dc2626" }}>{promoError}</p>
            )}
          </div>
        )}

        {/* Plan cards */}
        {plans.length > 0 ? (
          <div className="space-y-3">
            {plans.map(tier => (
              <div
                key={tier.id}
                className="p-4 rounded-xl border"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-subtle)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {tier.title}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {!tier.duration_days ? "Lifetime access" : `${tier.duration_days} days`}
                      {tier.trial_days ? ` · ${tier.trial_days}-day free trial` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {fromNanoTON(tier.price_nanoton)}
                    </span>
                    <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>TON</span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <CheckCircle2 size={13} style={{ color: "var(--text-muted)" }} />
                    Access to private {chat.type}
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <CheckCircle2 size={13} style={{ color: "var(--text-muted)" }} />
                    Direct channel access
                  </div>
                </div>

                <button
                  onClick={() => handleSubscribe(tier.id!, tier.price_nanoton)}
                  disabled={isSubscribed || loadingPlanId !== null || isSubscribing || isApplyingPromo}
                  className="w-full py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: isSubscribed ? "var(--bg-muted)" : "var(--accent)", color: isSubscribed ? "var(--text-muted)" : "var(--text-inverse)" }}
                  onMouseEnter={e => !(isSubscribed || loadingPlanId !== null) && ((e.currentTarget as HTMLButtonElement).style.background = "var(--accent-hover)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = isSubscribed ? "var(--bg-muted)" : "var(--accent)")}
                >
                  {isSubscribed ? (
                    "Subscribed"
                  ) : loadingPlanId === tier.id || isSubscribing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      {paymentStep === "init" && "Initializing..."}
                      {paymentStep === "wallet" && "Confirm in wallet..."}
                      {paymentStep === "verifying" && "Verifying..."}
                      {!paymentStep && "Processing..."}
                    </span>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="p-6 text-center rounded-xl border"
            style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No plans available yet.</p>
          </div>
        )}
      </div>



      {/* Divider */}
      <div className="mx-5 my-6 border-t" style={{ borderColor: "var(--border)" }} />

      {/* Reviews */}
      <ReviewSection chatId={chatId} />
    </div>
  );
}
