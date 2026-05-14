import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  editable?: boolean;
  onChange?: (value: number) => void;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 20,
  editable = false,
  onChange,
}: RatingStarsProps) {
  return (
    <View className="flex-row">
      {Array.from({ length: maxRating }).map((_, i) => {
        const filled = i < rating;
        const star = (
          <Star
            key={i}
            size={size}
            color={filled ? COLORS.gold.accent : COLORS.neutral[300]}
            fill={filled ? COLORS.gold.accent : 'transparent'}
          />
        );
        return editable ? (
          <TouchableOpacity key={i} onPress={() => onChange?.(i + 1)} className="mr-1">
            {star}
          </TouchableOpacity>
        ) : (
          <View key={i} className="mr-1">{star}</View>
        );
      })}
    </View>
  );
}
