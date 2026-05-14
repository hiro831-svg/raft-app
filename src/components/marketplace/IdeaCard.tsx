import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Heart, ShoppingBag } from 'lucide-react-native';
import { Card } from '../common/Card';
import { RatingStars } from '../common/RatingStars';
import { COLORS, MATERIAL_LABELS } from '../../constants/theme';
import { formatPrice } from '../../lib/stripe';
import type { Idea } from '../../lib/types';

interface IdeaCardProps {
  idea: Idea;
  onPress: (idea: Idea) => void;
  onFavorite: (idea: Idea) => void;
  onOrder: (idea: Idea) => void;
}

export function IdeaCard({ idea, onPress, onFavorite, onOrder }: IdeaCardProps) {
  const thumbnail = idea.image_urls[0];

  return (
    <TouchableOpacity onPress={() => onPress(idea)} activeOpacity={0.92}>
      <Card className="mb-4 mx-1">
        {/* Image */}
        {thumbnail ? (
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-48"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-48 bg-neutral-100 items-center justify-center">
            <ShoppingBag size={40} color={COLORS.neutral[300]} />
          </View>
        )}

        {/* Material badge */}
        <View className="absolute top-3 left-3">
          <View className="bg-brand-900/80 px-2 py-1 rounded-lg">
            <Text className="text-gold-400 text-xs font-semibold">
              {MATERIAL_LABELS[idea.material] ?? idea.material}
            </Text>
          </View>
        </View>

        {/* Favorite button */}
        <TouchableOpacity
          onPress={() => onFavorite(idea)}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full items-center justify-center"
        >
          <Heart
            size={18}
            color={idea.is_favorited ? COLORS.error : COLORS.neutral[400]}
            fill={idea.is_favorited ? COLORS.error : 'transparent'}
          />
        </TouchableOpacity>

        {/* Content */}
        <View className="p-4">
          <Text className="text-neutral-900 font-semibold text-base leading-snug" numberOfLines={2}>
            {idea.title}
          </Text>

          {idea.seller ? (
            <Text className="text-neutral-400 text-xs mt-1">
              by {idea.seller.display_name ?? idea.seller.username}
            </Text>
          ) : null}

          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-brand-500 text-lg font-bold">
              {formatPrice(idea.price)}
            </Text>

            <TouchableOpacity
              onPress={() => onOrder(idea)}
              className="flex-row items-center bg-brand-500 active:bg-brand-600 px-3 py-2 rounded-xl"
            >
              <ShoppingBag size={14} color="#fff" />
              <Text className="text-white text-xs font-semibold ml-1">依頼する</Text>
            </TouchableOpacity>
          </View>

          {idea.tags.length > 0 ? (
            <View className="flex-row flex-wrap mt-2 gap-1">
              {idea.tags.slice(0, 3).map((tag) => (
                <View key={tag} className="bg-neutral-100 px-2 py-0.5 rounded-lg">
                  <Text className="text-neutral-500 text-xs">#{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
