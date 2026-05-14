import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary:   { container: 'bg-brand-500 active:bg-brand-600', text: 'text-white font-semibold' },
  secondary: { container: 'bg-gold-500 active:bg-gold-600',   text: 'text-brand-900 font-semibold' },
  outline:   { container: 'border border-brand-500 bg-transparent active:bg-brand-50', text: 'text-brand-500 font-semibold' },
  ghost:     { container: 'bg-transparent active:bg-neutral-100', text: 'text-brand-500 font-semibold' },
  danger:    { container: 'bg-error active:opacity-80', text: 'text-white font-semibold' },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-3 py-2 rounded-xl',    text: 'text-sm' },
  md: { container: 'px-5 py-3 rounded-2xl',   text: 'text-base' },
  lg: { container: 'px-6 py-4 rounded-2xl',   text: 'text-lg' },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center',
        v.container,
        s.container,
        fullWidth ? 'w-full' : 'self-start',
        isDisabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" className="mr-2" />
      ) : icon ? (
        <View className="mr-2">{icon}</View>
      ) : null}
      <Text className={[v.text, s.text].join(' ')}>{label}</Text>
    </TouchableOpacity>
  );
}
