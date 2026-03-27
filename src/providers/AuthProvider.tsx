'use client';

import { init, mockTelegramEnv, retrieveRawInitData } from '@telegram-apps/sdk';
import { useEffect, useState, createContext, useContext } from 'react';
import { useAuth } from '@/api/hooks';


if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Only inject mock environment if we're not running inside real Telegram
  const isInsideTelegram = window.location.hash.includes('tgWebAppData') || window.location.search.includes('tgWebAppData');
  if (!isInsideTelegram) {
    try {
      mockTelegramEnv({
        launchParams: {
          tgWebAppThemeParams: {
            accent_text_color: '#6ab2f2',
            bg_color: '#17212b',
            button_color: '#5288c1',
            button_text_color: '#ffffff',
            destructive_text_color: '#ec3942',
            header_bg_color: '#17212b',
            hint_color: '#708499',
            link_color: '#6ab3f3',
            secondary_bg_color: '#232e3c',
            section_bg_color: '#17212b',
            section_header_text_color: '#6ab3f3',
            subtitle_text_color: '#708499',
            text_color: '#f5f5f5',
          },
          tgWebAppData: new URLSearchParams([
            ['user', JSON.stringify({
              id: 99281932,
              first_name: 'Andrew',
              last_name: 'Rogue',
              username: 'rogue',
              language_code: 'en',
              is_premium: true,
              allows_write_to_pm: true,
            })],
            ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
            ['auth_date', '1716922846'],
            ['start_param', 'debug'],
            ['chat_type', 'sender'],
            ['chat_instance', '8428209589180549439'],
          ]).toString(),
          tgWebAppVersion: '8',
          tgWebAppPlatform: 'tdesktop',
        }
      });
      console.log('TG Mock Environment Initialized');
    } catch (e) {
      // Ignore if already mocked
    }
  }
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: number | null;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  authError: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      init();
    } catch (e) {
      console.warn('Failed to initialize Telegram SDK', e);
    }
  }, []);

  const { mutateAsync: authenticate } = useAuth();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      let initDataRaw = '';
      
      try {
        // retrieveRawInitData() returns the raw tgWebAppData query string
        // that the backend expects for signature verification.
        // NOTE: retrieveLaunchParams().initDataRaw does NOT exist in SDK v3 —
        // the parsed object has tgWebAppData as a nested object, not a raw string.
        initDataRaw = retrieveRawInitData() || '';
      } catch (e) {
        console.warn("Could not retrieve init data:", e);
      }

      if (!initDataRaw) {
        console.warn("No Telegram init data found. Not inside Telegram?");
        setAuthError("Please open from Telegram. No initData found.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await authenticate({ initData: initDataRaw });
        
        if (response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
        }
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        
        setIsAuthenticated(true);
        setUserId(response.data.user_id ?? null);
        setAuthError(null);
      } catch (error: any) {
        console.error("Authentication failed", error);
        setAuthError(error?.message || "Authentication logic failed");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [authenticate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userId, authError }}>
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center bg-neutral-950 text-white">
          <p>Loading app...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
