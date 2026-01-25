import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TON Creator | Premium Access",
  description: "Support creators via TON",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        // 1. Lock the screen height to the viewport (100dvh for mobile browsers)
        // 2. Prevent default browser scrolling on the body (overflow-hidden)
        className={`${inter.className} bg-neutral-950 text-white h-dvh w-screen flex justify-center overflow-hidden`}
      >
        {/* Mobile Container Simulation */}
        {/* We use 'flex flex-col' to separate content from the bottom nav */}
        <div className="w-full max-w-lg bg-neutral-900 h-full flex flex-col shadow-2xl shadow-black border-x border-neutral-800 relative">
          {/* --- SCROLLABLE CONTENT AREA --- */}
          {/* - flex-1: Takes up all available space 
              - overflow-y-auto: Allows vertical scrolling
              - no-scrollbar utility classes: Hides the visual bar
          */}
          <main className="flex-1 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {children}

            {/* Add padding at bottom so content isn't hidden behind the floating nav if needed, 
                though in this layout nav is separate. 
                We add some generic padding-bottom for aesthetics. */}
            <div className="pb-24"></div>
          </main>

          {/* --- FIXED BOTTOM NAV --- */}
          {/* z-50 ensures it stays on top. shrink-0 prevents it from squishing. */}
          <div className="shrink-0 z-50 border-t border-neutral-800 bg-neutral-900/80 backdrop-blur-xl">
            <NavBar />
          </div>
        </div>
      </body>
    </html>
  );
}
