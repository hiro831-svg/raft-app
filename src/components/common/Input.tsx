import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  type TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'border-error'
    : focused
    ? 'border-brand-500'
    : 'border-neutral-300';

  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-sm font-medium text-neutral-700 mb-1.5">{label}</Text>
      ) : null}

      <View
        className={`flex-row items-center bg-white border ${borderColor} rounded-2xl px-4 py-3`}
      >
        {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}

        <TextInput
          {...props}
          onFocus={(e) => { setFocused(true);  props.onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
          className="flex-1 text-base text-neutral-900"
          placeholderTextColor="#A8A29E"
        />

        {rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} className="ml-2">
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text className="text-error text-xs mt-1">{error}</Text>
      ) : hint ? (
        <Text className="text-neutral-500 text-xs mt-1">{hint}</Text>
      ) : null}
    </View>
  );
}
