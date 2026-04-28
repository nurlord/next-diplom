"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, UserCircle, MessageSquare } from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Explore",
      href: "/explore",
      icon: Compass,
    },
    {
      name: "Chats",
      href: "/chats",
      icon: MessageSquare,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: UserCircle,
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

              {/* Active Pill Background (Optional - Subtle) */}
              <div
                className={`absolute inset-0 rounded-2xl transition-colors duration-300 ${
                  isActive ? "bg-blue-500/10" : "group-hover:bg-white/5"
                }`}
              />

              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className={`relative z-10 transition-colors duration-300 ${
                  isActive
                    ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    : "text-neutral-500 group-hover:text-neutral-300"
                }`}
              />

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
