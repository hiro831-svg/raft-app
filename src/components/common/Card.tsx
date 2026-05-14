import React from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  elevated?: boolean;
  className?: string;
}

export function Card({ elevated = true, className = '', children, ...props }: CardProps) {
  return (
    <View
      {...props}
      className={[
        'bg-white rounded-3xl overflow-hidden',
        elevated ? 'shadow-md' : '',
        className,
      ].join(' ')}
      style={[
        elevated
          ? {
              shadowColor: '#1A0A00',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }
          : {},
        props.style as object,
      ]}
    >
      {children}
    </View>
  );
}
