import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings,
  Package,
  Heart,
  Star,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react-native';
import { supabase, db } from '../lib/supabase';
import { OrderCard } from '../components/orders/OrderCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RatingStars } from '../components/common/RatingStars';
import { COLORS } from '../constants/theme';
import type { Profile, Order, Favorite } from '../lib/types';

type Tab = 'orders' | 'favorites';

interface ProfileScreenProps {
  userId: string;
  onOrderPress: (order: Order) => void;
  onFavoritePress: (ideaId: string) => void;
}

export function ProfileScreen({ userId, onOrderPress, onFavoritePress }: ProfileScreenProps) {
  const [profile, setProfile]       = useState<Profile | null>(null);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [favorites, setFavorites]   = useState<Favorite[]>([]);
  const [tab, setTab]               = useState<Tab>('orders');
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchAll() {
    try {
      const [prof, ords, favs] = await Promise.all([
        db.getProfile(userId),
        db.listOrders(userId),
        db.listFavorites(userId),
      ]);
      setProfile(prof);
      setOrders(ords);
      setFavorites(favs);
    } catch (_) {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchAll(); }, [userId]);

  async function handleLogout() {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }

  if (loading) return <LoadingSpinner fullScreen message="読み込み中..." />;

  const completedOrders = orders.filter((o) => o.status === 'delivered').length;
  const avgRating = orders
    .filter((o) => o.review)
    .reduce((acc, o) => acc + (o.review?.rating ?? 0), 0) /
    (orders.filter((o) => o.review).length || 1);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAll(); }}
            tintColor={COLORS.brand.primary}
          />
        }
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <View className="bg-brand-900 px-6 pt-4 pb-8">
          <View className="flex-row justify-between mb-5">
            <Text className="text-white text-xl font-bold">マイページ</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity className="w-9 h-9 bg-white/10 rounded-full items-center justify-center">
                <Settings size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                className="w-9 h-9 bg-white/10 rounded-full items-center justify-center"
              >
                <LogOut size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Avatar + info */}
          <View className="flex-row items-center">
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                className="w-16 h-16 rounded-full border-2 border-gold-400"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-white/20 border-2 border-gold-400 items-center justify-center">
                <User size={28} color={COLORS.gold.light} />
              </View>
            )}
            <View className="ml-4 flex-1">
              <Text className="text-white text-xl font-bold">
                {profile?.display_name ?? profile?.username ?? '---'}
              </Text>
              <Text className="text-neutral-300 text-sm">@{profile?.username}</Text>
              {profile?.bio ? (
                <Text className="text-neutral-400 text-xs mt-1" numberOfLines={2}>
                  {profile.bio}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Stats row */}
          <View className="flex-row mt-5 gap-3">
            {[
              { label: '注文数',     value: orders.length },
              { label: '完了',       value: completedOrders },
              { label: 'お気に入り', value: favorites.length },
            ].map((stat) => (
              <View key={stat.label} className="flex-1 bg-white/10 rounded-2xl py-3 items-center">
                <Text className="text-white font-bold text-xl">{stat.value}</Text>
                <Text className="text-neutral-300 text-xs mt-0.5">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Tabs ────────────────────────────────────────────── */}
        <View className="flex-row bg-white border-b border-neutral-200">
          {([
            { id: 'orders' as Tab,    label: '注文履歴', icon: Package },
            { id: 'favorites' as Tab, label: 'お気に入り', icon: Heart },
          ] as const).map(({ id, label, icon: Icon }) => (
            <TouchableOpacity
              key={id}
              onPress={() => setTab(id)}
              className={[
                'flex-1 flex-row items-center justify-center py-3.5 border-b-2',
                tab === id ? 'border-brand-500' : 'border-transparent',
              ].join(' ')}
            >
              <Icon
                size={16}
                color={tab === id ? COLORS.brand.primary : COLORS.neutral[400]}
              />
              <Text
                className={[
                  'ml-1.5 font-semibold text-sm',
                  tab === id ? 'text-brand-500' : 'text-neutral-400',
                ].join(' ')}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Content ─────────────────────────────────────────── */}
        <View className="p-4">
          {tab === 'orders' ? (
            orders.length === 0 ? (
              <View className="items-center py-16">
                <Package size={48} color={COLORS.neutral[300]} />
                <Text className="text-neutral-400 mt-3">注文履歴がありません</Text>
              </View>
            ) : (
              orders.map((order) => (
                <OrderCard key={order.id} order={order} onPress={onOrderPress} />
              ))
            )
          ) : (
            favorites.length === 0 ? (
              <View className="items-center py-16">
                <Heart size={48} color={COLORS.neutral[300]} />
                <Text className="text-neutral-400 mt-3">お気に入りがありません</Text>
              </View>
            ) : (
              favorites.map((fav) => fav.idea && (
                <TouchableOpacity
                  key={fav.id}
                  onPress={() => onFavoritePress(fav.idea_id)}
                  className="flex-row items-center bg-white rounded-2xl p-3 mb-2 shadow-sm"
                >
                  {fav.idea.image_urls[0] ? (
                    <Image
                      source={{ uri: fav.idea.image_urls[0] }}
                      className="w-14 h-14 rounded-xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-14 h-14 rounded-xl bg-neutral-100" />
                  )}
                  <View className="flex-1 ml-3">
                    <Text className="text-neutral-900 font-semibold" numberOfLines={1}>
                      {fav.idea.title}
                    </Text>
                    <Text className="text-brand-500 font-bold text-sm mt-0.5">
                      ¥{fav.idea.price.toLocaleString()}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={COLORS.neutral[400]} />
                </TouchableOpacity>
              ))
            )
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
