import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { QueryProvider } from "@/providers/QueryProvider";
import { DynamicAuthProvider } from "@/providers/DynamicAuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TON Creator | Premium Access",
  description: "Support creators via TON",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also good for PWAs/Mini Apps to prevent undesired rubber-banding if needed
  viewportFit: "cover",
};

// This inline script runs synchronously during HTML parsing — before ANY
// Next.js JavaScript bundles load. It grabs the Telegram launch params from
// the URL hash/query and stores them in sessionStorage under the key that
// @tma.js/bridge SDK expects ("tapps/launchParams").
// Without this, Next.js App Router strips the URL hash during hydration,
// and by the time our React code calls retrieveLaunchParams(), the data is gone.
const CAPTURE_TG_PARAMS_SCRIPT = `
(function(){
  try {
    var raw = location.href.replace(/^[^?#]*[?#]/, '').replace(/[?#]/g, '&');
    if (raw && raw.indexOf('tgWebAppData') !== -1) {
      sessionStorage.setItem('tapps/launchParams', JSON.stringify(raw));
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <Script
          id="tg-launch-params"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: CAPTURE_TG_PARAMS_SCRIPT }}
        />
        {/* Match light theme on all browsers/WebViews regardless of OS theme */}
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#f4f4f5" />
      </head>
      <body
        // 1. Lock the screen height to the viewport (100dvh for mobile browsers)
        // 2. Prevent default browser scrolling on the body (overflow-hidden)
        className={`${inter.className} bg-background text-foreground h-dvh w-screen flex justify-center overflow-hidden`}
      >
        <QueryProvider>
          <DynamicAuthProvider>
            <ToastProvider>
              {/* Mobile Container Simulation */}
              <div className="w-full max-w-lg bg-background h-full flex flex-col shadow-2xl shadow-black/10 border-x border-gray-200 relative">
                {/* --- SCROLLABLE CONTENT AREA --- */}
                <main className="flex-1 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-24">
                  {children}
                </main>

                {/* --- FIXED BOTTOM NAV --- */}
                <div className="shrink-0 z-50 border-t border-gray-200 bg-white/90 backdrop-blur-xl">
                  <NavBar />
                </div>
              </div>
            </ToastProvider>
          </DynamicAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
