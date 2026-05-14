import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Package, ChevronRight } from 'lucide-react-native';
import { Card } from '../common/Card';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatPrice } from '../../lib/stripe';
import { COLORS, MATERIAL_LABELS } from '../../constants/theme';
import type { Order } from '../../lib/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  return (
    <TouchableOpacity onPress={() => onPress(order)} activeOpacity={0.92}>
      <Card className="mb-3 mx-1 p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-brand-50 rounded-2xl items-center justify-center mr-3">
              <Package size={20} color={COLORS.brand.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-neutral-900 font-semibold" numberOfLines={1}>
                {order.title}
              </Text>
              <Text className="text-neutral-400 text-xs mt-0.5">
                {MATERIAL_LABELS[order.material]} · 数量 {order.quantity}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={COLORS.neutral[400]} />
        </View>

        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-neutral-100">
          <OrderStatusBadge status={order.status} />
          <View className="items-end">
            <Text className="text-brand-500 font-bold">
              {formatPrice(order.total_price)}
            </Text>
            <Text className="text-neutral-400 text-xs">
              {format(new Date(order.created_at), 'yyyy/MM/dd', { locale: ja })}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
