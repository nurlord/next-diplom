"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { useChats, useMySubscriptions } from "@/api/hooks";
import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Plus, ChevronRight, RotateCw, X } from "lucide-react";
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
  const subscriptions = (subscriptionsRes?.data?.items || []).filter(s => s.status === "active");

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RotateCw className="animate-spin" size={22} style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  return (
    <div
      className="pb-24 pt-6 px-5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ color: "var(--text-primary)" }}
    >
      {/* Header */}
      <header className="space-y-0.5">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Chats</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Your channels and subscriptions
        </p>
      </header>

      {/* ── Managed Channels ───────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Managed Channels
          </h2>
          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <Plus size={13} /> New
          </button>
        </div>

        {managedLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: "var(--bg-muted)" }}
              />
            ))}
          </div>
        ) : managedChats.length > 0 ? (
          <div className="flex flex-col gap-4">
            {managedChats.map(chat => (
              <Link href={`/admin?chatId=${chat.id}`} key={chat.id} className="block">
                <div
                  className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-subtle)",
                    boxShadow: "var(--shadow-card)",
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-subtle)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)")}
                >
                  <Avatar text={chat.title} src={chat.avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {chat.title}
                    </p>
                    <p
                      className="text-xs capitalize mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {chat.type || "Channel"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Settings</span>
                    <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="p-8 rounded-xl border border-dashed text-center"
            style={{ background: "var(--bg-subtle)", borderColor: "var(--border-dashed)" }}
          >
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              No channels registered yet.
            </p>
            <button
              onClick={() => setShowInstructions(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{
                background: "var(--accent)",
                color: "var(--text-inverse)",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "var(--accent-hover)")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "var(--accent)")}
            >
              <Plus size={15} /> Register Channel
            </button>
          </div>
        )}
      </section>

      {/* ── Active Subscriptions ───────────────────────────────────────── */}
      <section className="space-y-3">
        <h2
          className="text-xs font-semibold uppercase tracking-wider px-1"
          style={{ color: "var(--text-muted)" }}
        >
          Active Subscriptions
        </h2>

        {subsLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: "var(--bg-muted)" }}
              />
            ))}
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {subscriptions.map(sub => (
              <Link href={`/chats/${sub.chat_id}`} key={sub.subscription_id} className="block">
                <div
                  className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-subtle)",
                    boxShadow: "var(--shadow-card)",
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-subtle)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)")}
                >
                  <Avatar text={sub.chat_title} src={sub.chat_avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p
                        className="font-semibold truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {sub.chat_title}
                      </p>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 shrink-0"
                        style={{
                          background: "var(--bg-muted)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span style={{ color: "var(--text-primary)" }}>{sub.plan_title}</span>
                      <span style={{ color: "var(--text-muted)" }}>·</span>
                      <span style={{ color: "var(--text-muted)" }}>
                        Until {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : "Forever"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="p-8 rounded-xl border text-center"
            style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 border"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <MessageSquare size={18} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              No active subscriptions.
            </p>
            <Link
              href="/explore"
              className="text-sm font-medium transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              Browse channels
            </Link>
          </div>
        )}
      </section>

      {/* ── Connect Channel Modal ──────────────────────────────────────── */}
      {showInstructions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowInstructions(false); }}
        >
          <div
            className="w-full max-w-sm rounded-xl p-6 relative"
            style={{
              background: "var(--bg-card)",
              border: `1px solid var(--border-subtle)`,
              boxShadow: "var(--shadow-modal)",
            }}
          >
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")}
            >
              <X size={18} />
            </button>

            <header className="mb-5">
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                Connect Channel
              </h3>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Three steps to add your channel.
              </p>
            </header>

            <div className="space-y-4">
              {[
                {
                  n: "1",
                  title: "Start the Bot",
                  desc: (
                    <>
                      Search for{" "}
                      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        @ton_jazylym_bot
                      </span>{" "}
                      on Telegram.
                    </>
                  ),
                },
                {
                  n: "2",
                  title: "Add to Channel",
                  desc: (
                    <>
                      Make the bot an admin with{" "}
                      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        Post Messages
                      </span>{" "}
                      permission.
                    </>
                  ),
                },
                {
                  n: "3",
                  title: "Done",
                  desc: "Return here and refresh — your channel will appear.",
                },
              ].map(step => (
                <div key={step.n} className="flex gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border"
                    style={{
                      background: "var(--bg-muted)",
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {step.n}
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-3 flex flex-col gap-2">
                <a
                  href="https://t.me/ton_jazylym_bot"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 text-sm font-medium rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: "var(--accent)", color: "var(--text-inverse)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--accent-hover)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--accent)")}
                >
                  Open Telegram
                </a>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full py-2 text-sm transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")}
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
