"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Lock,
  Zap,
  Gem,
  Users,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";

// --- MOCK DATA ---
const CREATOR = {
  name: "Alex Design_Lab",
  handle: "@alex_ui_ux",
  bio: "Ex-Spotify Designer sharing exclusive figma resources, tutorials, and career advice.",
  subscribers: "14.2K",
  posts: 128,
  avatar:
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
};

const TIERS = [
  {
    id: 1,
    name: "Supporter",
    price: 2, // TON
    period: "month",
    color: "from-blue-500 to-cyan-500",
    benefits: [
      "Access to private Telegram Channel",
      "Weekly design tips",
      "Community chat access",
    ],
  },
  {
    id: 2,
    name: "Pro Mentor",
    price: 10, // TON
    period: "month",
    popular: true,
    color: "from-purple-500 to-pink-500",
    benefits: [
      "Everything in Supporter",
      "Source Figma files",
      "1 Monthly portfolio review",
      "Direct DM access",
    ],
  },
];

const FEED_PREVIEW = [
  {
    id: 1,
    title: "How to price your work in 2026",
    date: "2 hours ago",
    locked: true,
  },
  {
    id: 2,
    title: "Free UI Kit: Neo-Brutalism",
    date: "Yesterday",
    locked: true,
  },
  {
    id: 3,
    title: "My switch to Framer (Public)",
    date: "3 days ago",
    locked: false,
  },
];

export default function Home() {
  const [loading, setLoading] = useState<number | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  // Simulate Payment Process
  const handleSubscribe = (tierId: number) => {
    setLoading(tierId);
    setTimeout(() => {
      setLoading(null);
      setSubscribed(true);
    }, 2000); // 2 second fake delay
  };

  if (subscribed) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-neutral-400">
            You have sent{" "}
            <span className="text-white font-semibold">10 TON</span> to{" "}
            {CREATOR.name}.
          </p>
        </div>

        {/* The "Super App" Magic: Auto-invite */}
        <div className="w-full bg-neutral-800 p-4 rounded-xl border border-neutral-700">
          <p className="text-sm text-neutral-400 mb-3">
            Your Private Invite Link:
          </p>
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all">
            <MessageCircle size={18} />
            Join Private Channel
          </button>
        </div>

        <button
          onClick={() => setSubscribed(false)}
          className="text-sm text-neutral-500 underline mt-4"
        >
          Back to prototype
        </button>
      </div>
    );
  }

  return (
    <div className="">
      {/* --- HERO SECTION --- */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-32 w-full bg-linear-to-r from-neutral-800 to-neutral-700"></div>

        <div className="px-5">
          {/* Avatar */}
          <div className="relative -mt-12 mb-3">
            <Image
              src={CREATOR.avatar}
              width="96"
              height="96"
              unoptimized
              alt="Creator"
              className="w-24 h-24 rounded-full border-4 border-neutral-900 bg-white"
            />
            <div className="absolute bottom-1 right-1 bg-blue-500 p-1 rounded-full border-2 border-neutral-900">
              <CheckCircle2 size={12} className="text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                {CREATOR.name}
              </h1>
              <p className="text-sm text-neutral-400">{CREATOR.handle}</p>
            </div>
            {/* Social Proof Badge */}
            <div className="bg-neutral-800 px-3 py-1 rounded-full text-xs font-medium border border-neutral-700 flex items-center gap-1.5">
              <Users size={12} className="text-blue-400" />
              {CREATOR.subscribers}
            </div>
          </div>

          <p className="mt-3 text-neutral-300 text-sm leading-relaxed">
            {CREATOR.bio}
          </p>
        </div>
      </div>

      <hr className="border-neutral-800 my-6" />

      {/* --- TIERS SECTION --- */}
      <div className="px-5 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Choose Plan</h3>
          <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
            Pay via TON
          </span>
        </div>

        <div className="grid gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative p-5 rounded-2xl border ${tier.popular ? "border-purple-500/50 bg-neutral-800/80" : "border-neutral-800 bg-neutral-800/40"}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 right-4 bg-linear-to-r from-purple-500 to-pink-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Best Value
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">{tier.name}</h4>
                  <div className="flex items-end gap-1 mt-1">
                    <span className="text-2xl font-bold text-white flex items-center gap-1">
                      <Gem
                        size={20}
                        className="text-blue-400 fill-blue-400/20"
                      />
                      {tier.price}
                    </span>
                    <span className="text-sm text-neutral-500 mb-1">
                      TON / {tier.period}
                    </span>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {tier.benefits.map((benefit, i) => (
                  <li
                    key={i}
                    className="text-sm text-neutral-300 flex items-start gap-2"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-neutral-500 mt-0.5 shrink-0"
                    />
                    {benefit}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(tier.id)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2
                  ${
                    tier.popular
                      ? "bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/20"
                      : "bg-neutral-700 hover:bg-neutral-600 text-white"
                  }`}
              >
                {loading === tier.id ? (
                  <span className="animate-pulse">Processing TON...</span>
                ) : (
                  <>
                    Subscribe with Wallet{" "}
                    <Zap size={16} className="fill-white" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-neutral-800 my-8" />

      {/* --- LOCKED CONTENT PREVIEW (THE "BOOSTY" PART) --- */}
      <div className="px-5">
        <h3 className="font-semibold text-lg mb-4">Recent Posts</h3>
        <div className="space-y-4">
          {FEED_PREVIEW.map((post) => (
            <div
              key={post.id}
              className="bg-neutral-800/50 border border-neutral-800 rounded-xl overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-neutral-500">{post.date}</span>
                  {post.locked ? (
                    <Lock size={14} className="text-neutral-500" />
                  ) : (
                    <span className="text-xs text-green-500">Free</span>
                  )}
                </div>
                <h4 className="font-medium">{post.title}</h4>
              </div>

              {/* Locked State Blur */}
              {post.locked && (
                <div className="relative h-24 bg-neutral-900/50 p-4 flex items-center justify-center">
                  <div className="absolute inset-0 backdrop-blur-md flex items-center justify-center bg-black/20">
                    <div className="bg-neutral-900/80 px-4 py-2 rounded-lg flex items-center gap-2 border border-neutral-700">
                      <Lock size={14} />
                      <span className="text-xs font-medium">
                        Subscribers only
                      </span>
                    </div>
                  </div>
                  {/* Fake text to look like blurred content */}
                  <p className="text-neutral-700 select-none blur-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- FLOATING SECURE BADGE --- */}
      <div className="flex justify-center mt-10 mb-4 opacity-50">
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 uppercase tracking-widest">
          <ShieldCheck size={12} />
          Secured by TON
        </div>
      </div>
    </div>
  );
}
