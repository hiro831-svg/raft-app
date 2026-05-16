import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../src/lib/supabase';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 32, 440);

// ── Toast ────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

function Toast({ toast }: { toast: ToastState }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast.visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2600),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [toast]);

  const bg =
    toast.type === 'success' ? '#14532D' :
    toast.type === 'error'   ? '#7F1D1D' : '#1C1917';
  const border =
    toast.type === 'success' ? '#16A34A' :
    toast.type === 'error'   ? '#DC2626' : '#44403C';
  const icon =
    toast.type === 'success' ? '✔' :
    toast.type === 'error'   ? '✖' : 'ℹ';

  return (
    <Animated.View style={[ts.wrap, { opacity, backgroundColor: bg, borderColor: border }]}>
      <Text style={ts.icon}>{icon}</Text>
      <Text style={ts.msg}>{toast.message}</Text>
    </Animated.View>
  );
}

const ts = StyleSheet.create({
  wrap: {
    position: 'absolute', top: 56, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1,
    maxWidth: 360, zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  icon: { color: '#fff', fontWeight: '700', fontSize: 13, marginRight: 8 },
  msg:  { color: '#fff', fontSize: 13, flex: 1, lineHeight: 18 },
});

// ── Input field ──────────────────────────────────────────────

function Field({
  label, value, onChangeText, placeholder, secureTextEntry,
  keyboardType, error, rightAction,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
  error?: string; rightAction?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <View style={[f.row, focused && f.rowFocused, !!error && f.rowError]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6B5B4B"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={f.input}
        />
        {rightAction}
      </View>
      {!!error && <Text style={f.err}>{error}</Text>}
    </View>
  );
}

const f = StyleSheet.create({
  wrap:      { marginBottom: 16 },
  label:     { color: '#C8A96E', fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 },
  row:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A1A0E', borderWidth: 1, borderColor: '#4A3020', borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'web' ? 12 : 0 },
  rowFocused:{ borderColor: '#d4af37' },
  rowError:  { borderColor: '#DC2626' },
  input:     { flex: 1, color: '#F5ECD7', fontSize: 15, height: 46 },
  err:       { color: '#F87171', fontSize: 11, marginTop: 4 },
});

// ── Main screen ──────────────────────────────────────────────

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode]           = useState<Mode>('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [toast, setToast]         = useState<ToastState>({ visible: false, message: '', type: 'info' });

  const tabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(tabAnim, {
      toValue: mode === 'login' ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [mode]);

  function showToast(message: string, type: ToastType = 'info') {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3200);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!email.includes('@') || !email.includes('.'))
      e.email = '正しいメールアドレスを入力してください';
    if (password.length < 6)
      e.password = 'パスワードは6文字以上で入力してください';
    if (mode === 'register' && password !== confirm)
      e.confirm = 'パスワードが一致しません';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || loading) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast('おかえりなさい！', 'success');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        showToast('登録完了！確認メールをご確認ください。', 'success');
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : '不明なエラーが発生しました';
      // Friendly Japanese messages
      const msg =
        raw.includes('Invalid login credentials') ? 'メールアドレスまたはパスワードが違います' :
        raw.includes('Email not confirmed')        ? 'メールアドレスの確認が完了していません' :
        raw.includes('already registered')         ? 'このメールアドレスはすでに登録されています' :
        raw.includes('Password should be')         ? 'パスワードは6文字以上にしてください' :
        raw;
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  const tabIndicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '51%'],
  });

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <Toast toast={toast} />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={s.logoArea}>
          <View style={s.logoRow}>
            <View style={s.logoMark} />
            <Text style={s.logoText}>Arte</Text>
          </View>
          <Text style={s.logoSub}>職人の手仕事とあなたのアイデアをつなぐ</Text>
        </View>

        {/* Card */}
        <View style={s.card}>

          {/* Tab switcher */}
          <View style={s.tabTrack}>
            <Animated.View style={[s.tabIndicator, { left: tabIndicatorLeft }]} />
            {(['login', 'register'] as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={s.tabBtn}
                onPress={() => { setMode(m); setErrors({}); }}
                activeOpacity={0.8}
              >
                <Text style={[s.tabLabel, mode === m && s.tabLabelActive]}>
                  {m === 'login' ? 'ログイン' : '新規登録'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Headline */}
          <Text style={s.headline}>
            {mode === 'login' ? 'アカウントにサインイン' : '無料でアカウント作成'}
          </Text>

          {/* Fields */}
          <Field
            label="メールアドレス"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <Field
            label="パスワード"
            value={password}
            onChangeText={setPassword}
            placeholder={mode === 'login' ? '••••••••' : '6文字以上'}
            secureTextEntry={!showPass}
            error={errors.password}
            rightAction={
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 8 }}>
                <Text style={{ color: '#8B7355', fontSize: 12 }}>{showPass ? '非表示' : '表示'}</Text>
              </TouchableOpacity>
            }
          />
          {mode === 'register' && (
            <Field
              label="パスワード（確認）"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="もう一度入力"
              secureTextEntry={!showPass}
              error={errors.confirm}
            />
          )}

          {/* Submit button */}
          <TouchableOpacity
            style={[s.submitBtn, loading && s.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#1a0f0a" size="small" />
              : <Text style={s.submitLabel}>
                  {mode === 'login' ? 'ログイン' : 'アカウントを作成'}
                </Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divText}>または</Text>
            <View style={s.divLine} />
          </View>

          {/* Switch mode */}
          <View style={s.switchRow}>
            <Text style={s.switchText}>
              {mode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
            </Text>
            <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}>
              <Text style={s.switchLink}>
                {mode === 'login' ? '新規登録' : 'ログイン'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Footer note */}
        <Text style={s.footNote}>
          ご登録いただくと、利用規約およびプライバシーポリシーに同意したことになります。
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ───────────────────────────────────────────────────

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#1a0f0a' },
  scroll: { flexGrow: 1, alignItems: 'center', paddingVertical: 48, paddingHorizontal: 16 },

  // Logo
  logoArea:  { alignItems: 'center', marginBottom: 36 },
  logoRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logoMark:  { width: 6, height: 28, backgroundColor: '#d4af37', borderRadius: 3, marginRight: 10 },
  logoText:  { color: '#FFD966', fontSize: 30, fontWeight: '800', letterSpacing: 3 },
  logoSub:   { color: '#8B7355', fontSize: 13, letterSpacing: 0.5 },

  // Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#231309',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#3D2510',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },

  // Tabs
  tabTrack: {
    flexDirection: 'row',
    backgroundColor: '#1a0f0a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    position: 'relative',
    height: 44,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4, bottom: 4,
    width: '47%',
    backgroundColor: '#d4af37',
    borderRadius: 9,
  },
  tabBtn:        { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  tabLabel:      { color: '#8B7355', fontSize: 14, fontWeight: '600' },
  tabLabelActive:{ color: '#1a0f0a' },

  headline: {
    color: '#F5ECD7',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 22,
    textAlign: 'center',
  },

  // Submit
  submitBtn: {
    backgroundColor: '#d4af37',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitLabel: { color: '#1a0f0a', fontSize: 16, fontWeight: '800' },

  // Divider
  divider:  { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divLine:  { flex: 1, height: 1, backgroundColor: '#3D2510' },
  divText:  { color: '#6B5B4B', fontSize: 12, marginHorizontal: 12 },

  // Switch
  switchRow:  { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 4 },
  switchText: { color: '#8B7355', fontSize: 13 },
  switchLink: { color: '#d4af37', fontSize: 13, fontWeight: '700' },

  footNote: {
    color: '#4A3020',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    maxWidth: 320,
    lineHeight: 17,
  },
});
