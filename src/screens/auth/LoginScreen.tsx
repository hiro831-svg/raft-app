import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { COLORS } from '../../constants/theme';

interface LoginScreenProps {
  onNavigateRegister: () => void;
  onSuccess: () => void;
}

export function LoginScreen({ onNavigateRegister, onSuccess }: LoginScreenProps) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email.trim())         e.email    = 'メールアドレスを入力してください';
    else if (!email.includes('@')) e.email = '正しいメールアドレスを入力してください';
    if (!password)             e.password = 'パスワードを入力してください';
    else if (password.length < 6) e.password = '6文字以上のパスワードを入力してください';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ログインに失敗しました';
      Alert.alert('ログインエラー', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-6 pt-12 pb-8 bg-brand-900">
            <Text className="text-gold-400 text-4xl font-bold tracking-wide">
              CraftShare
            </Text>
            <Text className="text-neutral-300 mt-2 text-sm leading-relaxed">
              職人の技とあなたのアイデアをつなぐ
            </Text>
          </View>

          {/* Form */}
          <View className="flex-1 px-6 pt-8">
            <Text className="text-2xl font-bold text-neutral-900 mb-1">ログイン</Text>
            <Text className="text-neutral-500 mb-6">アカウントにサインインしてください</Text>

            <Input
              label="メールアドレス"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="your@email.com"
              error={errors.email}
              leftIcon={<Mail size={18} color={COLORS.neutral[400]} />}
            />

            <Input
              label="パスワード"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password}
              leftIcon={<Lock size={18} color={COLORS.neutral[400]} />}
              rightIcon={
                showPass
                  ? <EyeOff size={18} color={COLORS.neutral[400]} />
                  : <Eye    size={18} color={COLORS.neutral[400]} />
              }
              onRightIconPress={() => setShowPass(!showPass)}
            />

            <Button
              label="ログイン"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
              className="mt-2"
            />

            <View className="flex-row justify-center mt-6">
              <Text className="text-neutral-500">アカウントをお持ちでない方は </Text>
              <TouchableOpacity onPress={onNavigateRegister}>
                <Text className="text-brand-500 font-semibold">新規登録</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
