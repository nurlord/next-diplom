'use client';

import { retrieveLaunchParams } from '@telegram-apps/sdk';

// This executes at the module scope on the client side, running *before* Next.js 
// can execute hydration and before the Next.js router might wipe out the URL hash.
// 
// @telegram-apps/sdk's retrieveLaunchParams() will automatically check the URL hash 
// (#tgWebAppData=...) and cache it safely inside sessionStorage ('____twa____') 
// if it successfully parses the data.
if (typeof window !== 'undefined') {
  try {
    retrieveLaunchParams();
  } catch {
    // If we're not inside Telegram, retrieveLaunchParams throws an error. We can safely ignore it.
  }
}

export function TelegramInit() {
  return null;
}
