"use client";

import { Search, Filter, X, Star } from "lucide-react";
import Link from "next/link";
import { useRef, useState, MouseEvent } from "react";
import { useChats, useChatCategories } from "@/api/hooks";
import { useAuthContext } from "@/providers/AuthProvider";

const CHAT_TYPES = ["channel", "group", "bot"];

export default function ExplorePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isPremiumOnly, setIsPremiumOnly] = useState<boolean | undefined>();
  const [selectedType, setSelectedType] = useState<string | undefined>();

  const activeFilterCount = (isPremiumOnly ? 1 : 0) + (selectedType ? 1 : 0);

  const { data: categoriesRes } = useChatCategories({ enabled: isAuthenticated });
  const categories = categoriesRes?.data || [];

  const { data: chatsRes, isLoading: chatsLoading } = useChats({
    category_id: selectedCategory,
    is_premium: isPremiumOnly,
    type: selectedType,
  }, { enabled: isAuthenticated });

  const chats = chatsRes?.data?.items || [];

  const filteredChats = chats.filter(c =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => setIsDragging(false);

  const clearFilters = () => {
    setIsPremiumOnly(undefined);
    setSelectedType(undefined);
  };

  return (
    <div className="pb-14 pt-6 px-5 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Discover</h1>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`relative p-2 rounded-full border transition-colors ${
            showFilters || activeFilterCount > 0
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-neutral-800 border-neutral-700 text-neutral-400"
          }`}
        >
          <Filter size={18} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Filters</p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          {/* Premium toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-orange-400" />
              <span className="text-sm text-neutral-300">Premium only</span>
            </div>
            <button
              onClick={() => setIsPremiumOnly(v => v ? undefined : true)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${isPremiumOnly ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]" : "bg-neutral-700 shadow-inner"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${isPremiumOnly ? "translate-x-6" : "translate-x-1"}`}>
                {isPremiumOnly && <Star size={10} className="text-orange-500 fill-orange-500" />}
              </span>
            </button>
          </div>

          {/* Type filter */}
          <div>
            <p className="text-xs text-neutral-500 mb-2">Channel Type</p>
            <div className="flex gap-2 flex-wrap">
              {CHAT_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(v => v === t ? undefined : t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors border ${
                    selectedType === t
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={18} className="text-neutral-500" />
        </div>
        <input
          type="text"
          placeholder="Find creators or channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600"
        />
      </div>

      {/* Categories Horizontal Scroll */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUpOrLeave}
        onMouseUp={handleMouseUpOrLeave}
        onMouseMove={handleMouseMove}
        className={`flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 cursor-grab
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        ${isDragging ? "cursor-grabbing select-none" : ""}`}
      >
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
            ${selectedCategory === undefined ? "bg-white text-black" : "bg-neutral-800 text-neutral-300 border border-neutral-700"}
          `}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
              ${selectedCategory === cat.id ? "bg-white text-black" : "bg-neutral-800 text-neutral-300 border border-neutral-700"}
            `}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Channels List */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
          {searchQuery ? "Search Results" : isPremiumOnly ? "Premium Channels" : selectedType ? `${selectedType}s`.replace(/ss$/, "ses") : "Trending Now"}
        </h2>

        {authLoading || chatsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-neutral-800/40 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredChats.length > 0 ? (
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <Link href={`/chats/${chat.id}`} key={chat.id}>
                <div className="bg-neutral-800/40 border border-neutral-800 p-3 rounded-xl flex items-center gap-4 hover:bg-neutral-800 transition-colors cursor-pointer mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
                    {chat.title?.[0] || "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-white truncate">{chat.title}</h3>
                      {chat.is_premium && (
                        <span className="shrink-0 bg-orange-500/10 text-orange-400 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Star size={8} className="fill-orange-400" /> Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 capitalize">{chat.category || chat.type}</p>
                  </div>

                  <div className="shrink-0">
                    <div className="bg-blue-600/20 text-blue-400 text-xs font-bold px-2 py-1 rounded-lg border border-blue-600/20">
                      View Plans
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 text-center py-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            No channels found.
          </p>
        )}
      </div>
    </div>
  );
}
