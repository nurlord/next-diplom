"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { useChats, useMySubscriptions } from "@/api/hooks";
import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Plus, ChevronRight, RotateCw, X, Settings, CreditCard } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

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
        <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
        <p className="text-sm text-gray-500">Manage your channels and subscriptions</p>
      </header>

      {/* Managed Channels Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1 mb-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Managed Channels
          </h2>
          <button 
            onClick={() => setShowInstructions(true)}
            className="text-xs text-gray-600 font-medium flex items-center gap-1 hover:text-gray-900 transition-colors"
          >
            <Plus size={14} /> New
          </button>
        </div>

        {managedLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-white border border-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : managedChats.length > 0 ? (
          <div className="space-y-3">
            {managedChats.map((chat) => (
              <Link href={`/admin?chatId=${chat.id}`} key={chat.id}>
                <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-xl flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer mb-3">
                  <Avatar text={chat.title} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{chat.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-xs text-gray-500 capitalize">
                         {chat.type || "Channel"}
                       </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Settings</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 p-8 rounded-xl text-center">
            <p className="text-sm text-gray-500 mb-4">You haven&apos;t registered any channels yet.</p>
            <button 
              onClick={() => setShowInstructions(true)}
              className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 mx-auto"
            >
              <Plus size={16} /> Register Channel
            </button>
          </div>
        )}
      </section>

      {/* Subscriptions Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider px-1">
          Active Subscriptions
        </h2>

        {subsLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-white border border-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <Link href={`/chats/${sub.chat_id}`} key={sub.subscription_id}>
                <div className="bg-white shadow-sm border border-gray-100 p-3 rounded-xl flex items-center gap-4 hover:bg-gray-50 transition-colors mb-3">
                  <Avatar text={sub.chat_title} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="font-semibold text-gray-900 truncate">{sub.chat_title}</h3>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-transparent">
                        {sub.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-xs text-gray-900 font-medium">{sub.plan_title}</span>
                       <span className="text-xs text-gray-400">•</span>
                       <span className="text-xs text-gray-500">Valid until {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'Forever'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200 shadow-sm">
              <MessageSquare size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-3">No active subscriptions found.</p>
            <Link href="/explore">
              <button className="text-sm text-gray-900 font-medium hover:underline">
                Discover Channels
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-100 p-6 rounded-xl w-full max-w-sm relative shadow-xl">
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>
            
            <header className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Connect Channel</h3>
              <p className="text-sm text-gray-500 mt-1">Follow these steps to add your channel</p>
            </header>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200">1</div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Start the Bot</p>
                  <p className="text-xs text-gray-500">Search for <span className="font-semibold text-gray-900">@ton_jazylym_bot</span> on Telegram.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200">2</div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Add to Channel</p>
                  <p className="text-xs text-gray-500">Add the bot as an admin with <span className="font-semibold text-gray-900">Post Messages</span> permissions.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200">3</div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Done</p>
                  <p className="text-xs text-gray-500">Return here and refresh. Your channel will appear.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <a 
                  href="https://t.me/ton_jazylym_bot" 
                  target="_blank"
                  className="w-full py-2 bg-gray-900 hover:bg-black text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                   Open Telegram
                </a>
                <button 
                  onClick={() => setShowInstructions(false)}
                  className="w-full py-2 text-gray-500 font-medium text-sm hover:text-gray-900 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
