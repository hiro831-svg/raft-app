import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, ChevronRight, Hammer, Lightbulb, Package } from 'lucide-react-native';
import { Card } from '../components/common/Card';
import { IdeaCard } from '../components/marketplace/IdeaCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { db } from '../lib/supabase';
import { COLORS, MATERIAL_LABELS } from '../constants/theme';
import type { Idea } from '../lib/types';

const CATEGORIES = [
  { id: 'leather', label: '革製品', icon: '🧥' },
  { id: 'metal',   label: '金属加工', icon: '⚙️' },
  { id: 'other',   label: 'その他', icon: '✨' },
];

interface HomeScreenProps {
  onNavigateMarketplace: () => void;
  onNavigateOrderForm:   (idea?: Idea) => void;
  onNavigateIdeaDetail:  (idea: Idea) => void;
  profile?: { display_name?: string | null; username?: string } | null;
}

export function HomeScreen({
  onNavigateMarketplace,
  onNavigateOrderForm,
  onNavigateIdeaDetail,
  profile,
}: HomeScreenProps) {
  const [ideas, setIdeas]           = useState<Idea[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchIdeas() {
    try {
      const data = await db.listIdeas({ limit: 6 });
      setIdeas(data);
    } catch (_) {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchIdeas(); }, []);

  async function handleFavorite(idea: Idea) {
    await db.toggleFavorite(idea.id);
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === idea.id ? { ...i, is_favorited: !i.is_favorited } : i,
      ),
    );
  }

  const displayName = profile?.display_name ?? profile?.username ?? 'ゲスト';

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchIdeas(); }}
            tintColor={COLORS.brand.primary}
          />
        }
      >
        {/* ── Hero header ─────────────────────────────────────── */}
        <View className="bg-brand-900 px-6 pt-4 pb-8">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-gold-400 text-xs font-semibold tracking-widest uppercase">
                CraftShare
              </Text>
              <Text className="text-white text-xl font-bold mt-1">
                こんにちは、{displayName} さん
              </Text>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
              <Bell size={20} color={COLORS.gold.light} />
            </TouchableOpacity>
          </View>

          {/* Search bar (decorative – tap goes to Marketplace) */}
          <TouchableOpacity
            onPress={onNavigateMarketplace}
            className="flex-row items-center bg-white/10 rounded-2xl px-4 py-3"
          >
            <Search size={18} color={COLORS.neutral[400]} />
            <Text className="text-neutral-400 ml-2">デザインやアイデアを探す...</Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick actions ────────────────────────────────────── */}
        <View className="flex-row px-4 pt-5 pb-2 gap-3">
          <TouchableOpacity
            onPress={() => onNavigateOrderForm()}
            className="flex-1 bg-brand-500 rounded-3xl p-4 items-center"
          >
            <Hammer size={28} color="#fff" />
            <Text className="text-white font-semibold mt-2 text-center text-sm">
              加工を依頼する
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNavigateMarketplace}
            className="flex-1 bg-gold-500 rounded-3xl p-4 items-center"
          >
            <Lightbulb size={28} color={COLORS.brand.background} />
            <Text className="text-brand-900 font-semibold mt-2 text-center text-sm">
              アイデアを探す
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNavigateMarketplace}
            className="flex-1 bg-neutral-800 rounded-3xl p-4 items-center"
          >
            <Package size={28} color={COLORS.gold.light} />
            <Text className="text-neutral-100 font-semibold mt-2 text-center text-sm">
              出品する
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Categories ───────────────────────────────────────── */}
        <View className="px-6 mt-6">
          <Text className="text-neutral-900 font-bold text-lg mb-3">カテゴリー</Text>
          <View className="flex-row gap-2">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={onNavigateMarketplace}
                className="flex-1 bg-white border border-neutral-200 rounded-2xl py-3 items-center shadow-sm"
              >
                <Text className="text-2xl">{cat.icon}</Text>
                <Text className="text-neutral-700 text-xs font-medium mt-1">{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Featured ideas ────────────────────────────────────── */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between px-6 mb-3">
            <Text className="text-neutral-900 font-bold text-lg">注目のアイデア</Text>
            <TouchableOpacity onPress={onNavigateMarketplace} className="flex-row items-center">
              <Text className="text-brand-500 text-sm font-semibold">すべて見る</Text>
              <ChevronRight size={16} color={COLORS.brand.primary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <LoadingSpinner message="読み込み中..." />
          ) : (
            <View className="px-4">
              {ideas.slice(0, 4).map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onPress={onNavigateIdeaDetail}
                  onFavorite={handleFavorite}
                  onOrder={onNavigateOrderForm}
                />
              ))}
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
