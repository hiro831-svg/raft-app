import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type {
  Profile,
  Idea,
  Order,
  Favorite,
  Review,
  IdeaPurchase,
} from './types';

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL  ?? '';
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ── Database helpers ─────────────────────────────────────────

export const db = {
  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  },

  async upsertProfile(profile: Partial<Profile> & { id: string }) {
    return supabase.from('profiles').upsert(profile);
  },

  // Ideas
  async listIdeas(opts: { material?: string; limit?: number; offset?: number } = {}) {
    let query = supabase
      .from('ideas')
      .select('*, seller:profiles(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (opts.material) query = query.eq('material', opts.material);
    if (opts.limit)    query = query.limit(opts.limit);
    if (opts.offset)   query = query.range(opts.offset, (opts.offset ?? 0) + (opts.limit ?? 20) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data as Idea[];
  },

  async getIdea(id: string) {
    const { data, error } = await supabase
      .from('ideas')
      .select('*, seller:profiles(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Idea;
  },

  async createIdea(payload: Omit<Idea, 'id' | 'seller_id' | 'view_count' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('ideas')
      .insert({ ...payload, seller_id: user!.id })
      .select()
      .single();
    if (error) throw error;
    return data as Idea;
  },

  // Orders
  async listOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, idea:ideas(*), review:reviews(*)')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Order[];
  },

  async createOrder(payload: Omit<Order, 'id' | 'buyer_id' | 'status' | 'payment_status' | 'stripe_payment_intent_id' | 'tracking_number' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('orders')
      .insert({ ...payload, buyer_id: user!.id })
      .select()
      .single();
    if (error) throw error;
    return data as Order;
  },

  async updateOrderStatus(id: string, status: Order['status']) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  // Favorites
  async toggleFavorite(ideaId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user!.id)
      .eq('idea_id', ideaId)
      .single();

    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id);
      return false;
    }
    await supabase.from('favorites').insert({ user_id: user!.id, idea_id: ideaId });
    return true;
  },

  async listFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, idea:ideas(*)')
      .eq('user_id', userId);
    if (error) throw error;
    return data as Favorite[];
  },

  // Reviews
  async createReview(payload: Pick<Review, 'order_id' | 'rating' | 'comment'>) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('reviews')
      .insert({ ...payload, reviewer_id: user!.id })
      .select()
      .single();
    if (error) throw error;
    return data as Review;
  },

  // Storage
  async uploadImage(bucket: 'order-images' | 'idea-images' | 'avatars', uri: string, fileName: string): Promise<string> {
    const response = await fetch(uri);
    const blob     = await response.blob();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  },
};
