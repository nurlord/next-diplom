import { Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { useTonAddress, TonConnectButton } from "@tonconnect/ui-react";
import { useState } from "react";
import { useLinkUserWallet } from "@/api/hooks";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/ui";

export function WalletSection({ savedWallet }: { savedWallet?: string }) {
  const tonAddress = useTonAddress();
  const [linkedWallet, setLinkedWallet] = useState<string | null>(savedWallet || null);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [prevTonAddress, setPrevTonAddress] = useState<string>(tonAddress);
  const [prevSavedWallet, setPrevSavedWallet] = useState<string | undefined>(savedWallet);

  if (tonAddress !== prevTonAddress) {
    setPrevTonAddress(tonAddress);
    setWalletError(null);
  }

  if (savedWallet !== prevSavedWallet) {
    setPrevSavedWallet(savedWallet);
    if (savedWallet) {
      setLinkedWallet(savedWallet);
    }
  }

  const { mutateAsync: linkWallet, isPending: isLinkingWallet } = useLinkUserWallet();
  const toast = useToast();

  const handleLinkWallet = async () => {
    if (!tonAddress) return;
    setWalletError(null);
    try {
      await linkWallet({ wallet_address: tonAddress });
      setLinkedWallet(tonAddress);
      toast.success("Payout wallet linked!");
    } catch (err) {
      console.error("Failed to link wallet:", err);
      toast.handleError(err);
      setWalletError(err instanceof Error ? err.message : "Failed to link wallet.");
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
        Payout Wallet
      </h2>
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
              <Wallet size={16} className="text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900">TON Wallet</h4>
              <p className="text-xs text-gray-500">
                {tonAddress ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <div className="scale-90 origin-right">
            <TonConnectButton />
          </div>
        </div>

        {tonAddress && (
          <div className="border-t border-gray-100 pt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Connected Address</p>
              <p className="text-xs font-mono text-gray-700 break-all">{tonAddress}</p>
            </div>

            {linkedWallet === tonAddress ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 rounded-lg p-3 text-xs font-medium">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Linked as default payout wallet</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  fullWidth
                  loading={isLinkingWallet}
                  onClick={handleLinkWallet}
                >
                  {isLinkingWallet ? "Linking..." : "Set as Payout Wallet"}
                </Button>
                {walletError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-lg p-3 text-xs font-medium">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{walletError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
