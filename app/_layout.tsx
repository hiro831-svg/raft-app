import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../src/lib/supabase';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const router   = useRouter();
  const segments = useSegments();

  // Subscribe to auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Route guard
  useEffect(() => {
    if (session === undefined) return; // still loading
    const inAuth = segments[0] === 'auth';
    if (!session && !inAuth) router.replace('/auth');
    else if (session && inAuth) router.replace('/');
  }, [session, segments]);

  // Splash while session is resolving
  if (session === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a0f0a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#d4af37" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}
