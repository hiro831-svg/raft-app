import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, Plus } from 'lucide-react-native';
import { IdeaCard } from '../components/marketplace/IdeaCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { db } from '../lib/supabase';
import { COLORS } from '../constants/theme';
import type { Idea, MaterialType } from '../lib/types';

const FILTERS: { id: MaterialType | 'all'; label: string }[] = [
  { id: 'all',     label: 'すべて' },
  { id: 'leather', label: '革' },
  { id: 'metal',   label: '金属' },
  { id: 'other',   label: 'その他' },
];

interface MarketplaceScreenProps {
  onNavigateIdeaDetail: (idea: Idea) => void;
  onNavigateOrderForm:  (idea?: Idea) => void;
  onNavigateCreateIdea: () => void;
}

export function MarketplaceScreen({
  onNavigateIdeaDetail,
  onNavigateOrderForm,
  onNavigateCreateIdea,
}: MarketplaceScreenProps) {
  const [ideas, setIdeas]             = useState<Idea[]>([]);
  const [filter, setFilter]           = useState<MaterialType | 'all'>('all');
  const [searchText, setSearchText]   = useState('');
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const fetchIdeas = useCallback(async () => {
    try {
      const data = await db.listIdeas({
        material: filter !== 'all' ? filter : undefined,
        limit: 30,
      });
      setIdeas(data);
    } catch (_) {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  async function handleFavorite(idea: Idea) {
    await db.toggleFavorite(idea.id);
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === idea.id ? { ...i, is_favorited: !i.is_favorited } : i,
      ),
    );
  }

  const filtered = ideas.filter((i) =>
    searchText.trim() === '' ||
    i.title.toLowerCase().includes(searchText.toLowerCase()) ||
    i.tags.some((t) => t.toLowerCase().includes(searchText.toLowerCase())),
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* ── Header ──────────────────────────────────────────── */}
      <View className="bg-brand-900 px-6 pt-4 pb-5">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-2xl font-bold">マーケットプレイス</Text>
          <TouchableOpacity
            onPress={onNavigateCreateIdea}
            className="flex-row items-center bg-gold-500 px-3 py-2 rounded-xl"
          >
            <Plus size={16} color={COLORS.brand.background} />
            <Text className="text-brand-900 font-semibold text-sm ml-1">出品</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-white/10 rounded-2xl px-4 py-2.5">
          <Search size={16} color={COLORS.neutral[400]} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="タイトル・タグで検索..."
            placeholderTextColor={COLORS.neutral[400]}
            className="flex-1 text-white ml-2"
          />
        </View>
      </View>

      {/* ── Filter chips ────────────────────────────────────── */}
      <View className="flex-row px-4 pt-3 pb-1">
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFilter(f.id)}
            className={[
              'mr-2 px-4 py-2 rounded-full border',
              filter === f.id
                ? 'bg-brand-500 border-brand-500'
                : 'bg-white border-neutral-200',
            ].join(' ')}
          >
            <Text
              className={[
                'text-sm font-semibold',
                filter === f.id ? 'text-white' : 'text-neutral-600',
              ].join(' ')}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ────────────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner fullScreen message="アイデアを読み込み中..." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <IdeaCard
              idea={item}
              onPress={onNavigateIdeaDetail}
              onFavorite={handleFavorite}
              onOrder={onNavigateOrderForm}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchIdeas(); }}
              tintColor={COLORS.brand.primary}
            />
          }
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">🔍</Text>
              <Text className="text-neutral-500 text-base">
                {searchText ? '検索結果がありません' : 'まだアイデアがありません'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
