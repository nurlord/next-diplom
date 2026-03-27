"use client";

import { Search, Users, ArrowUpRight, Filter } from "lucide-react";
import Link from "next/link";
import { useRef, useState, MouseEvent } from "react";
import { useChats, useChatCategories } from "@/api/hooks";
import { useAuthContext } from "@/providers/AuthProvider";

export default function ExplorePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categoriesRes } = useChatCategories({ enabled: isAuthenticated });
  const categories = categoriesRes?.data || [];

  const { data: chatsRes, isLoading: chatsLoading } = useChats({
    category_id: selectedCategory,
    // Add text search if API supports it, currently API swagger doesn't have a q/search param, so client side filter or just list
  }, { enabled: isAuthenticated });

  const chats = chatsRes?.data?.items || [];
  
  // Client-side quick filter since API doesn't seem to have a search text parameter
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

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="pb-14 pt-6 px-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Discover</h1>
        <div className="bg-neutral-800 p-2 rounded-full border border-neutral-700">
          <Filter size={18} className="text-neutral-400" />
        </div>
      </div>

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
          className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors pointer-events-none sm:pointer-events-auto
            ${selectedCategory === undefined ? "bg-white text-black" : "bg-neutral-800 text-neutral-400 border border-neutral-700"}
          `}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors pointer-events-none sm:pointer-events-auto
              ${selectedCategory === cat.id ? "bg-white text-black" : "bg-neutral-800 text-neutral-400 border border-neutral-700"}
            `}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Featured / Trending */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
          {searchQuery ? "Search Results" : "Trending Now"}
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-inner">
                    {chat.title?.[0] || "?"}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-white">{chat.title}</h3>
                      {chat.is_premium && (
                        <span className="bg-orange-500/10 text-orange-400 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                          <ArrowUpRight size={10} /> Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">{chat.category || chat.type}</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-neutral-400 justify-end mb-1">
                      <Users size={12} /> --
                    </div>
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
