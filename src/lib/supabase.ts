import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import type { Profile, Idea, Order, Favorite, Review } from './types';

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL  ?? '';
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Use AsyncStorage on native; Supabase defaults to localStorage on web.
function buildAuthStorage() {
  if (Platform.OS === 'web') return undefined;
  // Lazy require to avoid importing the native module on web.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return AsyncStorage;
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage:          buildAuthStorage(),
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// ── Connection health-check ──────────────────────────────────

export type ConnectionStatus = 'checking' | 'ok' | 'error';

/** Lightweight ping: calls getSession() — no DB table required. */
export async function checkConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    if (!supabaseUrl || !supabaseAnon) {
      return { ok: false, message: '環境変数が設定されていません' };
    }
    const { error } = await supabase.auth.getSession();
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: 'Supabase に正常に接続できました' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '不明なエラー';
    return { ok: false, message: msg };
  }
}

// ── Database helpers ─────────────────────────────────────────

export const db = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase
      .from('profiles').select('*').eq('id', userId).single();
    return data;
  },

  async upsertProfile(profile: Partial<Profile> & { id: string }) {
    return supabase.from('profiles').upsert(profile);
  },

  async listIdeas(opts: { material?: string; limit?: number; offset?: number } = {}) {
    let q = supabase
      .from('ideas')
      .select('*, seller:profiles(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (opts.material) q = q.eq('material', opts.material);
    if (opts.limit)    q = q.limit(opts.limit);
    if (opts.offset)   q = q.range(opts.offset, (opts.offset ?? 0) + (opts.limit ?? 20) - 1);
    const { data, error } = await q;
    if (error) throw error;
    return data as Idea[];
  },

  async createOrder(payload: Omit<Order, 'id' | 'buyer_id' | 'status' | 'payment_status' | 'stripe_payment_intent_id' | 'tracking_number' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('orders').insert({ ...payload, buyer_id: user!.id }).select().single();
    if (error) throw error;
    return data as Order;
  },

  async listOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, idea:ideas(*), review:reviews(*)')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Order[];
  },

  async toggleFavorite(ideaId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: existing } = await supabase
      .from('favorites').select('id').eq('user_id', user!.id).eq('idea_id', ideaId).single();
    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id);
      return false;
    }
    await supabase.from('favorites').insert({ user_id: user!.id, idea_id: ideaId });
    return true;
  },

  async listFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites').select('*, idea:ideas(*)').eq('user_id', userId);
    if (error) throw error;
    return data as Favorite[];
  },

  async uploadImage(
    bucket: 'order-images' | 'idea-images' | 'avatars',
    uri: string,
    fileName: string,
  ): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();
    const { data, error } = await supabase.storage
      .from(bucket).upload(fileName, blob, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  },
};
