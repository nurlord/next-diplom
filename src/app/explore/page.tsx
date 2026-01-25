"use client";

import { Search, Users, ArrowUpRight, Filter } from "lucide-react";
import Link from "next/link";
import { useRef, useState, MouseEvent } from "react";

const CATEGORIES = ["All", "Crypto", "Design", "Fitness", "Music", "Tech"];

const CREATORS = [
  {
    id: 1,
    name: "Defi Wizard",
    handle: "@defi_wiz",
    category: "Crypto",
    subscribers: "24K",
    price: "5 TON",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    trending: true,
  },
  {
    id: 2,
    name: "Anna Yoga",
    handle: "@anna_moves",
    category: "Fitness",
    subscribers: "8.2K",
    price: "3 TON",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
    trending: false,
  },
  {
    id: 3,
    name: "Rust Lang Tips",
    handle: "@rust_master",
    category: "Tech",
    subscribers: "12K",
    price: "8 TON",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    trending: false,
  },
  {
    id: 4,
    name: "BeatMaker Pro",
    handle: "@beats_by_dre",
    category: "Music",
    subscribers: "45K",
    price: "2 TON",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
    trending: true,
  },
];

export default function ExplorePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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
        // I replaced the <style> tag with these 3 Tailwind arbitrary classes:
        className={`flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 cursor-grab 
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        ${isDragging ? "cursor-grabbing select-none" : ""}`}
      >
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors pointer-events-none sm:pointer-events-auto
              ${
                i === 0
                  ? "bg-white text-black"
                  : "bg-neutral-800 text-neutral-400 border border-neutral-700"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured / Trending */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
          Trending Now
        </h2>
        <div className="space-y-3">
          {CREATORS.map((creator) => (
            <Link href="/" key={creator.id}>
              <div className="bg-neutral-800/40 border border-neutral-800 p-3 rounded-xl flex items-center gap-4 hover:bg-neutral-800 transition-colors cursor-pointer mb-3">
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="w-12 h-12 rounded-full bg-neutral-700"
                />

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white">{creator.name}</h3>
                    {creator.trending && (
                      <span className="bg-orange-500/10 text-orange-400 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <ArrowUpRight size={10} /> Hot
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">{creator.category}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-neutral-400 justify-end mb-1">
                    <Users size={12} /> {creator.subscribers}
                  </div>
                  <div className="bg-blue-600/20 text-blue-400 text-xs font-bold px-2 py-1 rounded-lg border border-blue-600/20">
                    {creator.price}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
