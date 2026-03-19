"use client";

import {
  TrendingUp,
  Users,
  Settings,
  ArrowUpRight,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { useUserProfile, useChats, useChatSubscriptionStats, useChatPlans, useCreateChatPlan } from "@/api/hooks";

export default function AdminDashboard() {
  const { userId, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();
  
  const { data: userRes, isLoading: isUserLoading } = useUserProfile();
  const user = userRes?.data;

  // Assume the user owns chats. Fetch them.
  const { data: chatsRes, isLoading: isChatsLoading } = useChats(
    userId ? { owner_id: userId } : undefined
  );
  
  // For MVP, just pick the first chat they own for the dashboard
  const myChat = chatsRes?.data?.items?.[0];

  const { data: statsRes } = useChatSubscriptionStats(myChat?.id || 0);
  const stats = statsRes?.data;

  const { data: plansRes } = useChatPlans(myChat?.id || 0);
  const plans = plansRes?.data;

  // Create Plan Form State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: "",
    price: 0,
    plan_type: "periodic",
    duration_days: 30,
    trial_days: 0,
  });
  const { mutateAsync: createPlan, isPending: isCreatingPlan } = useCreateChatPlan();

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myChat?.id) return;
    try {
      await createPlan({ chatId: myChat.id, data: newPlan });
      setShowPlanModal(false);
      setNewPlan({ title: "", price: 0, plan_type: "periodic", duration_days: 30, trial_days: 0 });
    } catch (err) {
      console.error("Failed to create plan", err);
      alert("Failed to create plan. Check console.");
    }
  };

  if (isAuthLoading || isUserLoading) {
    return <div className="p-8 text-center text-neutral-500 animate-pulse">Loading profile...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="p-8 text-center text-neutral-500">Please open this app from Telegram to login.</div>;
  }

  return (
    <div className="pb-24 pt-6 px-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <Image
            unoptimized
            width={40}
            height={40}
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.first_name}&backgroundColor=b6e3f4`}
            className="w-10 h-10 rounded-full border border-neutral-700 bg-neutral-800"
            alt="Profile"
          />
          <div>
            <h1 className="text-sm font-bold text-neutral-200">
              {user.first_name} {user.last_name}
            </h1>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              {myChat ? myChat.title : "No Active Channel"}
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

        <p className="text-blue-100 text-sm font-medium mb-1">Earned via Subscriptions</p>
        <h2 className="text-4xl font-bold mb-4 flex items-baseline gap-1">
          {user.earned || 0} <span className="text-lg font-normal text-blue-200">$ (Demo)</span>
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
      {myChat ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-800/50 border border-neutral-800 p-4 rounded-xl">
            <div className="flex items-start justify-between mb-2">
              <Users size={18} className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold">{stats?.active || 0}</p>
            <p className="text-xs text-neutral-500">Active Subscribers</p>
          </div>
          <div className="bg-neutral-800/50 border border-neutral-800 p-4 rounded-xl">
            <div className="flex items-start justify-between mb-2">
              <TrendingUp size={18} className="text-orange-400" />
            </div>
            <p className="text-2xl font-bold">{stats?.active_revenue_hint || 0}</p>
            <p className="text-xs text-neutral-500">Monthly Revenue Hint</p>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-800/50 border border-neutral-800 p-6 rounded-xl text-center">
          <p className="text-sm text-neutral-400 mb-3">You don't have any registered chats.</p>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
            Register a Channel
          </button>
        </div>
      )}

      {/* Subscription Plans */}
      {myChat && (
        <div>
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-semibold text-md">Your Plans</h3>
            <button onClick={() => setShowPlanModal(true)} className="text-xs text-blue-400 font-medium">Add Plan</button>
          </div>

          {plans && plans.length > 0 ? (
            <div className="grid gap-3">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{plan.title}</p>
                    <p className="text-xs text-neutral-500 flex gap-2">
                      <span>{plan.price} TON</span>
                      <span>•</span>
                      <span>{plan.plan_type}</span>
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md ${plan.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-800 text-neutral-400'}`}>
                    {plan.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 text-center py-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              No plans created yet.
            </p>
          )}
        </div>
      )}

      {/* Create Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setShowPlanModal(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4">Create New Plan</h3>
            
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Plan Title</label>
                <input 
                  required
                  type="text" 
                  value={newPlan.title}
                  onChange={e => setNewPlan({...newPlan, title: e.target.value})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="e.g. VIP Access" 
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-neutral-400 mb-1">Price (TON)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    step="0.1"
                    value={newPlan.price || ""}
                    onChange={e => setNewPlan({...newPlan, price: parseFloat(e.target.value) || 0})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                    placeholder="0.0" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-neutral-400 mb-1">Type</label>
                  <select 
                    value={newPlan.plan_type}
                    onChange={e => setNewPlan({...newPlan, plan_type: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 appearance-none"
                  >
                    <option value="periodic">Periodic</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>

              {newPlan.plan_type === 'periodic' && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-400 mb-1">Duration (Days)</label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      value={newPlan.duration_days || ""}
                      onChange={e => setNewPlan({...newPlan, duration_days: parseInt(e.target.value) || 30})}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-400 mb-1">Trial (Days)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={newPlan.trial_days || ""}
                      onChange={e => setNewPlan({...newPlan, trial_days: parseInt(e.target.value) || 0})}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isCreatingPlan}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isCreatingPlan ? "Creating..." : "Create Plan"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
