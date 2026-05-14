"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, UserCircle, MessageSquare } from "lucide-react";
import { useMySubscriptions } from "@/api/hooks";
import { useAuthContext } from "@/providers/AuthProvider";
import { daysUntil } from "@/utils/date";

export default function NavBar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthContext();
  const { data: subsRes } = useMySubscriptions({ limit: 20 }, { enabled: isAuthenticated });

  const urgentCount = (subsRes?.data?.items || [])
    .filter((s) => s.status === "active")
    .filter((s) => {
      const d = daysUntil(s.expires_at);
      return d !== null && d <= 7;
    }).length;

  const NAV_ITEMS = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      badge: urgentCount > 0 ? urgentCount : 0,
    },
    {
      name: "Explore",
      href: "/explore",
      icon: Compass,
      badge: 0,
    },
    {
      name: "Chats",
      href: "/chats",
      icon: MessageSquare,
      badge: 0,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: UserCircle,
      badge: 0,
    },
  ];

  return (
    <nav className="w-full bg-neutral-900/80 backdrop-blur-xl border-t border-white/5 pb-safe pt-2 px-6">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-14 gap-1 group transition-all active:scale-90"
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <div className="absolute -top-2 w-8 h-1 bg-blue-500 rounded-full blur-[6px] opacity-60 animate-in fade-in duration-500" />
              )}

              {/* Active Pill Background */}
              <div
                className={`absolute inset-0 rounded-2xl transition-colors duration-300 ${
                  isActive ? "bg-blue-500/10" : "group-hover:bg-white/5"
                }`}
              />

              {/* Icon container */}
              <div className="relative z-10">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-300 ${
                    isActive
                      ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      : "text-neutral-500 group-hover:text-neutral-300"
                  }`}
                />
                {/* Urgency Badge */}
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-in zoom-in duration-300">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>

              <span
                className={`relative z-10 text-[10px] font-medium transition-colors duration-300 ${
                  isActive ? "text-blue-400" : "text-neutral-500"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
