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
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { supabase, db } from '../../lib/supabase';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { COLORS } from '../../constants/theme';

interface RegisterScreenProps {
  onNavigateLogin: () => void;
  onSuccess: () => void;
}

export function RegisterScreen({ onNavigateLogin, onSuccess }: RegisterScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!username.trim())   e.username = 'ユーザー名を入力してください';
    else if (username.length < 3) e.username = '3文字以上のユーザー名を入力してください';
    if (!email.includes('@'))    e.email    = '正しいメールアドレスを入力してください';
    if (password.length < 8)     e.password = '8文字以上のパスワードを入力してください';
    if (password !== confirm)    e.confirm  = 'パスワードが一致しません';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user) {
        await db.upsertProfile({
          id: data.user.id,
          username,
          display_name: username,
        });
      }
      Alert.alert(
        '登録完了',
        'メールを確認して、アカウントを有効化してください。',
        [{ text: 'OK', onPress: onSuccess }],
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登録に失敗しました';
      Alert.alert('エラー', msg);
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
            <Text className="text-neutral-300 mt-2 text-sm">
              今すぐ始めましょう
            </Text>
          </View>

          {/* Form */}
          <View className="flex-1 px-6 pt-8">
            <Text className="text-2xl font-bold text-neutral-900 mb-1">新規登録</Text>
            <Text className="text-neutral-500 mb-6">アカウントを作成してください</Text>

            <Input
              label="ユーザー名"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="craftmaster"
              error={errors.username}
              leftIcon={<User size={18} color={COLORS.neutral[400]} />}
            />

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
              placeholder="8文字以上"
              error={errors.password}
              leftIcon={<Lock size={18} color={COLORS.neutral[400]} />}
              rightIcon={
                showPass
                  ? <EyeOff size={18} color={COLORS.neutral[400]} />
                  : <Eye    size={18} color={COLORS.neutral[400]} />
              }
              onRightIconPress={() => setShowPass(!showPass)}
            />

            <Input
              label="パスワード（確認）"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showPass}
              placeholder="もう一度入力"
              error={errors.confirm}
              leftIcon={<Lock size={18} color={COLORS.neutral[400]} />}
            />

            <Button
              label="アカウントを作成"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              size="lg"
              className="mt-2"
            />

            <View className="flex-row justify-center mt-6">
              <Text className="text-neutral-500">すでにアカウントをお持ちの方は </Text>
              <TouchableOpacity onPress={onNavigateLogin}>
                <Text className="text-brand-500 font-semibold">ログイン</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
