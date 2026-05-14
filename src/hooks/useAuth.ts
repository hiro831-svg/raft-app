import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, db } from '../lib/supabase';
import type { Profile } from '../lib/types';

export interface AuthState {
  session: Session | null;
  user:    User | null;
  profile: Profile | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) fetchProfile(s.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        if (s?.user) fetchProfile(s.user.id);
        else { setProfile(null); setLoading(false); }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const p = await db.getProfile(userId);
      setProfile(p);
    } catch (_) {
      // profile may not exist yet (new user)
    } finally {
      setLoading(false);
    }
  }

  return { session, user: session?.user ?? null, profile, loading };
}
