import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  Package,
  Users,
  ShoppingBag,
  ChevronRight,
  CheckCircle,
  Truck,
  Clock,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Card } from '../components/common/Card';
import { formatPrice } from '../lib/stripe';
import { COLORS, ORDER_STATUS_LABELS } from '../constants/theme';
import type { Order, OrderStatus } from '../lib/types';

const STATUS_FLOW: OrderStatus[] = [
  'pending', 'accepted', 'in_progress', 'shipped', 'delivered',
];

interface AdminDashboardScreenProps {
  onBack?: () => void;
}

export function AdminDashboardScreen({ onBack }: AdminDashboardScreenProps) {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState<OrderStatus | 'all'>('all');

  async function fetchOrders() {
    try {
      // Admin: fetch all orders (requires service-role key on backend; here we query as authenticated artisan)
      const { data, error } = await supabase
        .from('orders')
        .select('*, buyer:profiles(*), idea:ideas(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data ?? []);
    } catch (_) {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchOrders(); }, []);

  async function advanceStatus(order: Order) {
    const currentIdx = STATUS_FLOW.indexOf(order.status);
    if (currentIdx === -1 || currentIdx >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[currentIdx + 1];
    Alert.alert(
      'ステータス更新',
      `「${ORDER_STATUS_LABELS[nextStatus]}」に変更しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '更新',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('orders')
                .update({ status: nextStatus })
                .eq('id', order.id);
              if (error) throw error;
              setOrders((prev) =>
                prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)),
              );
            } catch (err: unknown) {
              Alert.alert('エラー', (err as Error).message);
            }
          },
        },
      ],
    );
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((acc, o) => acc + o.total_price, 0);

  const statusCounts: Partial<Record<OrderStatus, number>> = {};
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  }

  if (loading) return <LoadingSpinner fullScreen message="読み込み中..." />;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchOrders(); }}
            tintColor={COLORS.brand.primary}
          />
        }
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <View className="bg-brand-900 px-6 pt-4 pb-8">
          <Text className="text-gold-400 text-xs font-semibold tracking-widest uppercase mb-1">
            管理者
          </Text>
          <Text className="text-white text-2xl font-bold">ダッシュボード</Text>

          {/* KPI cards */}
          <View className="flex-row mt-5 gap-3">
            {[
              { label: '総売上',    value: formatPrice(totalRevenue), icon: TrendingUp },
              { label: '総注文数',  value: `${orders.length}件`,       icon: Package },
              { label: '受付中',    value: `${statusCounts.pending ?? 0}件`, icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <View key={label} className="flex-1 bg-white/10 rounded-2xl p-3 items-center">
                <Icon size={18} color={COLORS.gold.light} />
                <Text className="text-white font-bold text-base mt-1">{value}</Text>
                <Text className="text-neutral-300 text-xs">{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Filter ──────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}
        >
          {(['all', ...STATUS_FLOW] as const).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setFilter(s)}
              className={[
                'mr-2 px-4 py-2 rounded-full border',
                filter === s ? 'bg-brand-500 border-brand-500' : 'bg-white border-neutral-200',
              ].join(' ')}
            >
              <Text
                className={[
                  'text-sm font-semibold',
                  filter === s ? 'text-white' : 'text-neutral-600',
                ].join(' ')}
              >
                {s === 'all' ? 'すべて' : ORDER_STATUS_LABELS[s]}
                {s !== 'all' && statusCounts[s] ? ` (${statusCounts[s]})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Orders list ─────────────────────────────────────── */}
        <View className="px-4 pt-2 pb-8">
          {filtered.length === 0 ? (
            <View className="items-center py-12">
              <Package size={40} color={COLORS.neutral[300]} />
              <Text className="text-neutral-400 mt-3">注文がありません</Text>
            </View>
          ) : (
            filtered.map((order) => (
              <Card key={order.id} className="mb-3 p-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-neutral-900 font-semibold" numberOfLines={1}>
                      {order.title}
                    </Text>
                    <Text className="text-neutral-400 text-xs mt-0.5">
                      {(order as any).buyer?.display_name ?? (order as any).buyer?.username ?? '---'}
                    </Text>
                  </View>
                  <Text className="text-brand-500 font-bold ml-2">
                    {formatPrice(order.total_price)}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <OrderStatusBadge status={order.status} />

                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <TouchableOpacity
                      onPress={() => advanceStatus(order)}
                      className="flex-row items-center bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-xl"
                    >
                      <Truck size={14} color={COLORS.brand.primary} />
                      <Text className="text-brand-500 text-xs font-semibold ml-1">
                        次のステップへ
                      </Text>
                    </TouchableOpacity>
                  )}

                  {order.status === 'delivered' && (
                    <View className="flex-row items-center">
                      <CheckCircle size={16} color={COLORS.success} />
                      <Text className="text-success text-xs font-semibold ml-1">完了</Text>
                    </View>
                  )}
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
