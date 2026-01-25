"use client";

import {
  TrendingUp,
  Users,
  Plus,
  Settings,
  ArrowUpRight,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";

export default function AdminDashboard() {
  return (
    <div className="pb-24 pt-6 px-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <Image
            unoptimized
            width={40}
            height="40"
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4"
            className="w-10 h-10 rounded-full border border-neutral-700"
            alt="Profile"
          />
          <div>
            <h1 className="text-sm font-bold text-neutral-200">
              Alex Design_Lab
            </h1>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Wallet Connected
            </div>
          </div>
        </div>
        <button className="p-2 bg-neutral-800 rounded-full border border-neutral-700">
          <Settings size={18} className="text-neutral-400" />
        </button>
      </div>

      {/* Balance Card (The "Wallet") */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-2xl shadow-xl shadow-blue-900/20 text-white relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -right-5 -top-5 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

        <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
        <h2 className="text-4xl font-bold mb-4 flex items-baseline gap-1">
          452.5 <span className="text-lg font-normal text-blue-200">TON</span>
        </h2>

        <div className="flex gap-3">
          <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            <ArrowUpRight size={16} /> Withdraw
          </button>
          <button className="flex-1 bg-black/20 hover:bg-black/30 backdrop-blur-sm py-2 rounded-lg text-sm font-semibold transition-colors">
            History
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-800/50 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-start justify-between mb-2">
            <Users size={18} className="text-purple-400" />
            <span className="text-xs text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
              +12%
            </span>
          </div>
          <p className="text-2xl font-bold">1,204</p>
          <p className="text-xs text-neutral-500">Active Subscribers</p>
        </div>
        <div className="bg-neutral-800/50 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-start justify-between mb-2">
            <TrendingUp size={18} className="text-orange-400" />
            <span className="text-xs text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
              +5%
            </span>
          </div>
          <p className="text-2xl font-bold">$2.4k</p>
          <p className="text-xs text-neutral-500">Monthly Revenue</p>
        </div>
      </div>

      {/* Recent Subscribers */}
      <div>
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-semibold text-md">Recent Transactions</h3>
          <button className="text-xs text-blue-400">See all</button>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl divide-y divide-neutral-800">
          {[
            {
              user: "User_9921",
              time: "2m ago",
              amount: "+10 TON",
              tier: "Pro",
            },
            {
              user: "Alice.ton",
              time: "15m ago",
              amount: "+2 TON",
              tier: "Supporter",
            },
            {
              user: "Bob_Crypto",
              time: "1h ago",
              amount: "+10 TON",
              tier: "Pro",
            },
          ].map((tx, i) => (
            <div key={i} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-xs font-bold text-neutral-500">
                  {tx.user[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.user}</p>
                  <p className="text-xs text-neutral-500">
                    {tx.tier} Tier • {tx.time}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-green-400">
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Performance */}
      <div>
        <h3 className="font-semibold text-md mb-3">Post Performance</h3>
        <div className="space-y-3">
          <div className="bg-neutral-800/30 border border-neutral-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1 truncate w-48">
                How to price your work in 2026
              </p>
              <div className="flex gap-3 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Eye size={10} /> 1.2k
                </span>
                <span>• 24 Comments</span>
              </div>
            </div>
            <MoreHorizontal size={16} className="text-neutral-500" />
          </div>
        </div>
      </div>

      {/* FAB (Floating Action Button) for New Post */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg shadow-blue-900/40 flex items-center justify-center text-white transition-transform active:scale-90">
        <Plus size={28} />
      </button>
    </div>
  );
}
