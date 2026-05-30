"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { useChats, useMySubscriptions } from "@/api/hooks";
import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Star, Plus, ShieldCheck, ChevronRight, RotateCw, X, Bot, CheckCircle2 } from "lucide-react";

export default function ChatsPage() {
  const { userId, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [showInstructions, setShowInstructions] = useState(false);

  const { data: managedChatsRes, isLoading: managedLoading } = useChats(
    userId ? { owner_id: userId } : undefined,
    { enabled: !!userId }
  );
  const managedChats = managedChatsRes?.data?.items || [];

  const { data: subscriptionsRes, isLoading: subsLoading } = useMySubscriptions(
    {},
    { enabled: isAuthenticated }
  );
  const subscriptions = (subscriptionsRes?.data?.items || []).filter(s => s.status === 'active');

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RotateCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-5 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-gray-900">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter">My Chats</h1>
        <p className="text-sm text-gray-500 font-medium">Manage your empire and active subs</p>
      </header>

      {/* Managed Channels Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck size={14} className="text-gray-900" /> Managed Channels
          </h2>
          <button 
            onClick={() => setShowInstructions(true)}
            className="text-xs text-gray-900 font-black flex items-center gap-1 hover:underline"
          >
            <Plus size={14} /> New
          </button>
        </div>

        {managedLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-white border border-gray-100 rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : managedChats.length > 0 ? (
          <div className="space-y-3">
            {managedChats.map((chat) => (
              <Link href={`/admin?chatId=${chat.id}`} key={chat.id}>
                <div className="group relative overflow-hidden bg-white border border-gray-100 shadow-sm p-5 rounded-[2rem] flex items-center gap-5 hover:border-gray-300 transition-all active:scale-95">
                  <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center font-black text-white text-xl shadow-md shadow-gray-900/10 group-hover:shadow-gray-900/20 transition-all">
                    {chat.title?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 truncate">{chat.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-transparent uppercase">
                         {chat.type || "Channel"}
                       </span>
                       <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Manage Dashboard</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                  
                  {/* Subtle background on hover */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 rounded-full group-hover:bg-gray-100 transition-all"></div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 p-10 rounded-[2.5rem] text-center">
            <p className="text-sm text-gray-500 mb-6 font-medium">You haven&apos;t registered any channels yet.</p>
            <button 
              onClick={() => setShowInstructions(true)}
              className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl text-xs font-black transition-all shadow-md shadow-gray-900/10 flex items-center gap-2 mx-auto active:scale-95"
            >
              <Plus size={16} /> Register Channel
            </button>
          </div>
        )}
      </section>

      {/* Subscriptions Section */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
          <Star size={14} className="text-gray-900" /> Active Subscriptions
        </h2>

        {subsLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-white border border-gray-100 rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <Link href={`/chats/${sub.chat_id}`} key={sub.subscription_id}>
                <div className="bg-white shadow-sm border border-gray-100 p-5 rounded-[2rem] flex items-center gap-5 hover:border-gray-300 transition-all active:scale-95">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-white shadow-md shadow-orange-600/20">
                    {sub.chat_title?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-black text-gray-900 truncate">{sub.chat_title}</h3>
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-transparent uppercase tracking-widest">
                        {sub.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-gray-900 font-bold">{sub.plan_title}</span>
                       <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                       <span className="text-[9px] text-gray-500 font-medium">Valid until {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'Forever'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 p-10 rounded-[2.5rem] text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-sm">
              <MessageSquare size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No active subscriptions found.</p>
            <Link href="/explore">
              <button className="mt-4 text-gray-900 text-xs font-black uppercase tracking-widest hover:underline">
                Discover Channels
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto pt-12 pb-24">
          <div className="bg-white border border-gray-100 p-8 rounded-[3rem] w-full max-w-sm relative shadow-xl">
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
            >
              <X size={24} />
            </button>
            
            <header className="mb-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <Bot className="text-gray-900" size={32} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-gray-900">Add Channel</h3>
              <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">3 simple steps to start</p>
            </header>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md shadow-gray-900/10">1</div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">Open our Bot</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Search for <span className="text-gray-900 font-bold">@ton_jazylym_bot</span> or click the button below.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-black text-xs shrink-0">2</div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">Add as Admin</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Add the bot to your channel/group with <span className="text-gray-900 font-bold">Post Messages</span> permissions.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-black text-xs shrink-0">3</div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">Sync & Manage</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Return here and refresh. Your channel will appear automatically!</p>
                </div>
              </div>

              <div className="pt-6">
                <a 
                  href="https://t.me/ton_jazylym_bot" 
                  target="_blank"
                  className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-gray-900/10 active:scale-95 transition-all"
                >
                   Go to @ton_jazylym_bot
                </a>
                <button 
                  onClick={() => setShowInstructions(false)}
                  className="w-full py-4 text-gray-500 font-bold text-xs mt-2 hover:text-gray-900 transition-colors"
                >
                  I've already added it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
