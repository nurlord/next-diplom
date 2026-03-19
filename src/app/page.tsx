"use client";

import { useMySubscriptions } from "@/api/hooks";
import { MessageCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/providers/AuthProvider";

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { data: subsRes, isLoading: subsLoading } = useMySubscriptions(
    { limit: 20 },
  );

  const subscriptions = subsRes?.data?.items || [];

  if (authLoading || subsLoading) {
    return <div className="p-8 text-center text-neutral-500 animate-pulse">Loading subscriptions...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
        <h2 className="text-xl font-bold mb-2">Welcome!</h2>
        <p className="text-neutral-400">Please open this Mini App from Telegram to log in.</p>
      </div>
    );
  }

  return (
    <div className="pb-14 pt-6 px-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Subscriptions</h1>
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
                <Link
                  href={`/chats/${sub.chat_id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-neutral-700/50 hover:bg-neutral-700 rounded-xl transition-colors"
                >
                  <ExternalLink size={16} /> Details
                </Link>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                  <MessageCircle size={16} /> Open Chat
                </button>
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
            <h3 className="text-lg font-bold mb-1">No Active Subscriptions</h3>
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
    </div>
  );
}
