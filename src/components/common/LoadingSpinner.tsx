import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { COLORS } from '../../constants/theme';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View
      className={[
        'items-center justify-center',
        fullScreen ? 'flex-1 bg-neutral-50' : 'py-8',
      ].join(' ')}
    >
      <ActivityIndicator size="large" color={COLORS.brand.primary} />
      {message ? (
        <Text className="mt-3 text-neutral-500 text-sm">{message}</Text>
      ) : null}
    </View>
  );
}
