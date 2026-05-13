"use client";

import { Search, Filter, X, Star } from "lucide-react";
import Link from "next/link";
import { useRef, useState, MouseEvent } from "react";
import { useChats, useChatCategories } from "@/api/hooks";
import { useAuthContext } from "@/providers/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

const CHAT_TYPES = ["channel", "group", "supergroup"];

export default function ExplorePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alpha_asc" | "alpha_desc">("newest");

  const activeFilterCount = (selectedType ? 1 : 0) + (sortBy !== "newest" ? 1 : 0);

  const { data: categoriesRes } = useChatCategories({
    enabled: isAuthenticated,
  });
  const categories = categoriesRes?.data || [];

  const { data: chatsRes, isLoading: chatsLoading } = useChats(
    {
      category_id: selectedCategory,
      type: selectedType,
    },
    { enabled: isAuthenticated },
  );

  const chats = chatsRes?.data?.items || [];

  const filteredChats = chats
    .filter((c) => c.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "alpha_asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "alpha_desc") {
        return (b.title || "").localeCompare(a.title || "");
      }
      const idA = a.id || 0;
      const idB = b.id || 0;
      if (sortBy === "oldest") {
        return idA - idB;
      }
      // default: newest
      return idB - idA;
    });

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
    setSelectedType(undefined);
    setSortBy("newest");
  };

  return (
    <div className="pb-14 pt-6 px-5 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Discover</h1>
        <button
          onClick={() => setShowFilters((v) => !v)}
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
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Filters
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          {/* Sort By Option */}
          <div>
            <p className="text-xs text-neutral-500 mb-2 uppercase tracking-widest font-black text-[10px]">Sort By</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "newest", label: "Newest First" },
                { id: "oldest", label: "Oldest First" },
                { id: "alpha_asc", label: "Alphabet (A-Z)" },
                { id: "alpha_desc", label: "Alphabet (Z-A)" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 border text-center ${
                    sortBy === option.id
                      ? "bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                      : "bg-neutral-900 border-neutral-850 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter */}
          <div>
            <p className="text-xs text-neutral-500 mb-2">Channel Type</p>
            <div className="flex gap-2 flex-wrap">
              {CHAT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setSelectedType((v) => (v === t ? undefined : t))
                  }
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
          {searchQuery
            ? "Search Results"
            : selectedType
              ? `${selectedType}s`.replace(/ss$/, "ses")
              : "Trending Now"}
        </h2>

        {authLoading || chatsLoading ? (
          <LoadingState count={4} height="h-[84px]" />
        ) : filteredChats.length > 0 ? (
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <Link href={`/chats/${chat.id}`} key={chat.id}>
                <div className="bg-neutral-800/40 border border-neutral-800 p-3 rounded-xl flex items-center gap-4 hover:bg-neutral-800 transition-colors cursor-pointer mb-3">
                  <Avatar text={chat.title} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-white truncate">
                        {chat.title}
                      </h3>
                      {chat.is_premium && (
                        <span className="shrink-0 bg-orange-500/10 text-orange-400 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Star size={8} className="fill-orange-400" /> Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 capitalize">
                      {chat.category || chat.type}
                    </p>
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
          <EmptyState 
            icon={Search} 
            subtitle="No channels found matching your filters." 
            className="!p-6 !rounded-xl" 
          />
        )}
      </div>
    </div>
  );
}
