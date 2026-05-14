import React from 'react';
import { View, Text } from 'react-native';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../constants/theme';
import type { OrderStatus } from '../../lib/types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const color = ORDER_STATUS_COLORS[status] ?? '#78716C';
  const label = ORDER_STATUS_LABELS[status] ?? status;

  return (
    <View
      style={{ backgroundColor: `${color}20`, borderColor: `${color}50` }}
      className="px-3 py-1 rounded-full border"
    >
      <View className="flex-row items-center">
        <View
          style={{ backgroundColor: color }}
          className="w-1.5 h-1.5 rounded-full mr-1.5"
        />
        <Text style={{ color }} className="text-xs font-semibold">
          {label}
        </Text>
      </View>
    </View>
  );
}
