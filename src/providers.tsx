import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSettingsStore } from '@/store/settings.store';
import { useAuthStore } from '@/store/auth.store';
import api from '@/utils/api';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false
      }
    }
  }));

  const { setSettings, setIsLoading } = useSettingsStore();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    // 1. Fetch website settings
    api.get('/settings')
      .then((res) => {
        setSettings(res.data.data);
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // 2. Initial Auth Sync from Token
    const localToken = localStorage.getItem('velora_token');
    if (localToken) {
      api.get('/auth/profile')
        .then((res) => {
          setAuth(res.data.data, localToken);
        })
        .catch(() => {
          localStorage.removeItem('velora_token');
          setAuth(null, null);
        });
    }

    // 3. Listen to global logout event
    const handleLogout = () => {
      setAuth(null, null);
    };
    window.addEventListener('velora_logout', handleLogout);
    return () => {
      window.removeEventListener('velora_logout', handleLogout);
    };
  }, [setSettings, setIsLoading, setAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
