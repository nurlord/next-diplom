import React from "react";
import Image from "next/image";

interface AvatarProps {
  text?: string | null;
  src?: string | null;      // base64 or URL — renders as <img> when provided
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ text, src, size = "md", className = "" }: AvatarProps) {
  const sizeMap = {
    sm: { box: "w-8 h-8",   text: "text-[10px]" },
    md: { box: "w-12 h-12", text: "text-base" },
    lg: { box: "w-16 h-16", text: "text-xl" },
  };

  const { box, text: textSize } = sizeMap[size];

  // Deterministic bg color from text (no gradients — matches flat light theme)
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-indigo-100 text-indigo-700",
    "bg-orange-100 text-orange-700",
    "bg-emerald-100 text-emerald-700",
    "bg-pink-100 text-pink-700",
  ];
  const score = text ? text.split("").reduce((a, c) => a + c.charCodeAt(0), 0) : 0;
  const color = colors[score % colors.length];

  if (src) {
    return (
      <div className={`${box} rounded-xl overflow-hidden shrink-0 ${className}`}>
        <Image
          src={src}
          alt={text || "avatar"}
          width={64}
          height={64}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`${box} ${textSize} ${color} rounded-xl flex items-center justify-center font-semibold shrink-0 ${className}`}
    >
      {text?.[0]?.toUpperCase() || "?"}
    </div>
  );
}
