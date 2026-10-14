"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, UserRole } from '@/store/useAuthStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setRole, setProfile, setIsLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user && mounted) {
          setUser(user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile && mounted) {
            setProfile(profile);
            setRole(profile.role as UserRole);
          }
        } else if (mounted) {
          clearAuth();
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        clearAuth();
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        const currentUser = session.user;
        setUser(currentUser);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (profile && mounted) {
          setProfile(profile);
          setRole(profile.role as UserRole);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [setUser, setRole, setProfile, setIsLoading, clearAuth]);

  return <>{children}</>;
}
