"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { useChats, useMySubscriptions } from "@/api/hooks";
import Link from "next/link";
import { MessageSquare, Star, Plus, ShieldCheck, ChevronRight, RotateCw } from "lucide-react";

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
      <div className="flex h-screen items-center justify-center bg-black">
        <RotateCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-5 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-black min-h-screen text-white">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter">My Chats</h1>
        <p className="text-sm text-neutral-500 font-medium">Manage your empire and active subs</p>
      </header>

      {/* Managed Channels Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-500" /> Managed Channels
          </h2>
          <Link href="/admin">
            <span className="text-xs text-blue-400 font-black flex items-center gap-1 hover:underline">
              <Plus size={14} /> New
            </span>
          </Link>
        </div>

        {managedLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-neutral-900 rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : managedChats.length > 0 ? (
          <div className="space-y-3">
            {managedChats.map((chat) => (
              <Link href={`/admin?chatId=${chat.id}`} key={chat.id}>
                <div className="group relative overflow-hidden bg-neutral-900 border border-neutral-800 p-5 rounded-[2rem] flex items-center gap-5 hover:border-blue-500/50 transition-all active:scale-95">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-all">
                    {chat.title?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white truncate">{chat.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/10 uppercase">
                         {chat.type || "Channel"}
                       </span>
                       <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Manage Dashboard</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-neutral-700 group-hover:text-white transition-colors" />
                  
                  {/* Subtle background glow on hover */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-all"></div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900/50 border border-dashed border-neutral-800 p-10 rounded-[2.5rem] text-center">
            <p className="text-sm text-neutral-500 mb-6 font-medium">You haven&apos;t registered any channels yet.</p>
            <Link href="/admin">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-xs font-black transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 mx-auto active:scale-95">
                <Plus size={16} /> Register Channel
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* Subscriptions Section */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
          <Star size={14} className="text-orange-500" /> Active Subscriptions
        </h2>

        {subsLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-neutral-900 rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <Link href={`/chats/${sub.chat_id}`} key={sub.subscription_id}>
                <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-[2rem] flex items-center gap-5 hover:border-orange-500/30 transition-all active:scale-95">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-white shadow-xl shadow-orange-600/20">
                    {sub.chat_title?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-black text-white truncate">{sub.chat_title}</h3>
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/10 uppercase tracking-widest">
                        {sub.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-neutral-400 font-bold">{sub.plan_title}</span>
                       <div className="w-1 h-1 bg-neutral-700 rounded-full"></div>
                       <span className="text-[9px] text-neutral-600 font-medium">Valid until {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'Forever'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900/50 border border-neutral-800 p-10 rounded-[2.5rem] text-center">
            <div className="w-16 h-16 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-800 shadow-inner">
              <MessageSquare size={24} className="text-neutral-700" />
            </div>
            <p className="text-sm text-neutral-500 font-medium">No active subscriptions found.</p>
            <Link href="/explore">
              <button className="mt-4 text-blue-400 text-xs font-black uppercase tracking-widest hover:underline">
                Discover Channels
              </button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
