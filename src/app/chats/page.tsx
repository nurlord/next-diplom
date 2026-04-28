"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { useChats, useMySubscriptions } from "@/api/hooks";
import Link from "next/link";
import { MessageSquare, Star, Plus, ShieldCheck, ChevronRight } from "lucide-react";

export default function ChatsPage() {
  const { userId, isAuthenticated, isLoading: authLoading } = useAuthContext();

  const { data: managedChatsRes, isLoading: managedLoading } = useChats(
    userId ? { owner_id: userId } : undefined,
    { enabled: !!userId }
  );
  const managedChats = managedChatsRes?.data?.items || [];

  const { data: subscriptionsRes, isLoading: subsLoading } = useMySubscriptions(
    {},
    { enabled: isAuthenticated }
  );
  const subscriptions = subscriptionsRes?.data?.items || [];

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center text-neutral-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="pb-14 pt-6 px-5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold text-white">My Chats</h1>
        <p className="text-sm text-neutral-500">Manage your channels and view your subscriptions</p>
      </header>

      {/* Managed Channels Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-500" /> Managed Channels
          </h2>
          <Link href="/admin">
            <span className="text-xs text-blue-400 font-medium flex items-center gap-1 hover:underline">
              <Plus size={14} /> Register
            </span>
          </Link>
        </div>

        {managedLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-neutral-800/40 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : managedChats.length > 0 ? (
          <div className="space-y-3">
            {managedChats.map((chat) => (
              <Link href={`/admin?chatId=${chat.id}`} key={chat.id}>
                <div className="bg-neutral-800/40 border border-neutral-800 p-4 rounded-2xl flex items-center gap-4 hover:bg-neutral-800 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-600/20">
                    {chat.title?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{chat.title}</h3>
                    <p className="text-xs text-neutral-500 capitalize">{chat.type || "Channel"}</p>
                  </div>
                  <ChevronRight size={18} className="text-neutral-600 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900/50 border border-dashed border-neutral-800 p-6 rounded-2xl text-center">
            <p className="text-sm text-neutral-500 mb-4">You haven&apos;t registered any channels yet.</p>
            <Link href="/admin">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 mx-auto">
                <Plus size={14} /> Register Channel
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* Subscriptions Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2 px-1">
          <Star size={16} className="text-orange-500" /> My Subscriptions
        </h2>

        {subsLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-neutral-800/40 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <Link href={`/chats/${sub.chat_id}`} key={sub.subscription_id}>
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center gap-4 hover:border-neutral-700 transition-all">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/10 shrink-0">
                    {sub.chat_title?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-white truncate">{sub.chat_title}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        sub.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-500'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">{sub.plan_title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-2xl text-center">
            <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={20} className="text-neutral-600" />
            </div>
            <p className="text-sm text-neutral-500">No active subscriptions found.</p>
            <Link href="/explore">
              <button className="mt-4 text-blue-400 text-xs font-bold hover:underline">
                Explore Channels
              </button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
