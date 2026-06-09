'use client';

import { useEffect } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk';

// This executes at the module scope on the client side, running *before* Next.js 
// can execute hydration and before the Next.js router might wipe out the URL hash.
// 
// @tma.js/sdk's retrieveLaunchParams() will automatically check the URL hash 
// (#tgWebAppData=...) and cache it safely inside sessionStorage ('____twa____') 
// if it successfully parses the data.
if (typeof window !== 'undefined') {
  try {
    retrieveLaunchParams();
  } catch {
    // If we're not inside Telegram, retrieveLaunchParams throws an error. We can safely ignore it.
  }
}

interface TelegramWebApp {
  expand: () => void;
  ready: () => void;
}

export function TelegramInit() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Attempt to expand the webapp to full height
        const telegram = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram;
        if (telegram?.WebApp) {
          telegram.WebApp.expand();
          telegram.WebApp.ready();
        }
      } catch (e) {
        console.error('Failed to expand Telegram WebApp', e);
      }
    }
  }, []);
  return null;
}
