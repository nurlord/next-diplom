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
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`relative p-2 rounded-full border transition-colors ${
            showFilters || activeFilterCount > 0
              ? "bg-gray-900 border-gray-900 text-white"
              : "bg-white border-gray-200 text-gray-500 hover:text-gray-900"
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
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
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
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-black text-[10px]">Sort By</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "newest" as const, label: "Newest First" },
                { id: "oldest" as const, label: "Oldest First" },
                { id: "alpha_asc" as const, label: "Alphabet (A-Z)" },
                { id: "alpha_desc" as const, label: "Alphabet (Z-A)" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 border text-center ${
                    sortBy === option.id
                      ? "bg-gray-900 border-gray-900 text-white shadow-md shadow-gray-900/10"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Channel Type</p>
            <div className="flex gap-2 flex-wrap">
              {CHAT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setSelectedType((v) => (v === t ? undefined : t))
                  }
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors border ${
                    selectedType === t
                      ? "bg-gray-900 border-gray-900 text-white"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
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
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Find creators or channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400"
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
          className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border
            ${selectedCategory === undefined ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}
          `}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border
              ${selectedCategory === cat.id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}
            `}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Channels List */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
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
                <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-xl flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer mb-3">
                  <Avatar text={chat.title} src={chat.avatar} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {chat.title}
                      </h3>
                      {chat.is_premium && (
                        <span className="shrink-0 bg-orange-50 text-orange-600 border border-orange-100 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Star size={8} className="fill-orange-500" /> Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 capitalize">
                      {chat.category || chat.type}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <div className="bg-gray-100 text-gray-900 text-xs font-bold px-2 py-1 rounded-lg border border-gray-200">
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
