import { Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { useTonAddress, TonConnectButton } from "@tonconnect/ui-react";
import { useState, useEffect } from "react";
import { useLinkUserWallet } from "@/api/hooks";
import { useToast } from "@/providers/ToastProvider";

export function WalletSection({ userId, savedWallet }: { userId?: number; savedWallet?: string }) {
  const tonAddress = useTonAddress();
  const [linkedWallet, setLinkedWallet] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  const { mutateAsync: linkWallet, isPending: isLinkingWallet } = useLinkUserWallet();
  const toast = useToast();

  useEffect(() => {
    setWalletError(null);
  }, [tonAddress]);

  useEffect(() => {
    if (savedWallet) {
      setLinkedWallet(savedWallet);
    }
  }, [savedWallet]);

  const handleLinkWallet = async () => {
    if (!tonAddress) return;
    setWalletError(null);
    try {
      await linkWallet({ wallet_address: tonAddress });
      setLinkedWallet(tonAddress);
      toast.success("Payout wallet linked successfully!");
    } catch (err: any) {
      console.error("Failed to link wallet:", err);
      toast.handleError(err);
      setWalletError(err.message || "Failed to link payout wallet.");
    }
  };

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
      <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-1">
        Payout Wallet
      </h3>
      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl shadow-lg space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
              <Wallet size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">TON Wallet Connection</h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                {tonAddress ? "Wallet connected successfully" : "Connect your wallet for payouts"}
              </p>
            </div>
          </div>
          <div className="scale-90 origin-right">
            <TonConnectButton />
          </div>
        </div>

        {tonAddress && (
          <div className="pt-2 border-t border-neutral-800/60 space-y-3 relative z-10 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-black/40 rounded-2xl p-3.5 border border-neutral-800/40 space-y-1">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Connected Address</p>
              <p className="text-xs font-mono text-neutral-300 break-all">{tonAddress}</p>
            </div>

            {linkedWallet === tonAddress ? (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl p-4 text-xs font-medium">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Your default payout wallet is linked and active!</span>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  disabled={isLinkingWallet}
                  onClick={handleLinkWallet}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLinkingWallet ? "Linking Payout Wallet..." : "Set as Payout Wallet"}
                </button>
                {walletError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-3.5 text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle size={14} className="shrink-0 animate-bounce" />
                    <span>{walletError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl"></div>
      </div>
    </section>
  );
}
