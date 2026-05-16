import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import {
  ArrowLeft, Upload, CheckSquare, Square,
  ChevronRight, ImageIcon,
} from 'lucide-react-native';

// ── Constants ────────────────────────────────────────────────

const { width } = Dimensions.get('window');
const isWeb   = width > 700;

const BG      = '#F5F0E8';
const CARD    = '#FFFFFF';
const BORDER  = '#DDD5C8';
const TEXT    = '#1C1917';
const TEXT_2  = '#57534E';
const TEXT_3  = '#A8A29E';
const ACCENT  = '#C05A00';
const ACCENT_D = '#A34E00';
const GOLD_L  = '#D4A017';
const SUCCESS = '#166534';
const ERR     = '#991B1B';

const COST_BASE = 3000; // fixed manufacturing cost

const MATERIALS = ['金属', '革', 'ガラス'] as const;
type Material = typeof MATERIALS[number];

// ── Shared hover hook ────────────────────────────────────────

function useHover() {
  const [hovered, setHovered] = useState(false);
  const webHandlers: any = Platform.OS === 'web' ? {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  } : {};
  const webT: any = Platform.OS === 'web' ? {
    transitionProperty: 'background-color, color, border-color, opacity',
    transitionDuration: '250ms',
    transitionTimingFunction: 'ease',
  } : {};
  return { hovered, webHandlers, webT };
}

// ── Toast ────────────────────────────────────────────────────

type ToastType = 'success' | 'error';

function Toast({ message, type, visible }: { message: string; type: ToastType; visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2400),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const bg     = type === 'success' ? '#14532D' : '#7F1D1D';
  const border = type === 'success' ? '#16A34A' : '#DC2626';
  const icon   = type === 'success' ? '✔' : '✖';

  return (
    <Animated.View style={[ts.wrap, { opacity, backgroundColor: bg, borderColor: border }]}>
      <Text style={ts.icon}>{icon}</Text>
      <Text style={ts.msg}>{message}</Text>
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
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 8,
  },
  icon: { color: '#fff', fontWeight: '700', fontSize: 13, marginRight: 8 },
  msg:  { color: '#fff', fontSize: 13, flex: 1, lineHeight: 18 },
});

// ── Step header ──────────────────────────────────────────────

function StepHeader({ num, title }: { num: number; title: string }) {
  return (
    <View style={sh.row}>
      <View style={sh.badge}>
        <Text style={sh.badgeText}>{num}</Text>
      </View>
      <Text style={sh.title}>{title}</Text>
    </View>
  );
}
const sh = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  badge:     { width: 28, height: 28, borderRadius: 14, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  badgeText: { color: CARD, fontSize: 13, fontWeight: '800' },
  title:     { color: TEXT, fontSize: 17, fontWeight: '800' },
});

// ── Field component ──────────────────────────────────────────

function Field({
  label, value, onChangeText, placeholder, multiline, keyboardType, required,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; multiline?: boolean;
  keyboardType?: 'default' | 'numeric'; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fi.wrap}>
      <Text style={fi.label}>
        {label}{required && <Text style={{ color: ERR }}> *</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={TEXT_3}
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          fi.input,
          focused && fi.inputFocused,
          multiline && fi.inputMulti,
        ]}
      />
    </View>
  );
}
const fi = StyleSheet.create({
  wrap:        { marginBottom: 18 },
  label:       { color: TEXT_2, fontSize: 12, fontWeight: '700', marginBottom: 6, letterSpacing: 0.4 },
  input: {
    backgroundColor: CARD, borderWidth: 1.5, borderColor: BORDER,
    borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    color: TEXT, fontSize: 15,
    height: Platform.OS === 'web' ? 'auto' as any : 46,
  },
  inputFocused: { borderColor: ACCENT },
  inputMulti:   { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
});

// ── Checkbox ─────────────────────────────────────────────────

function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <TouchableOpacity style={ck.row} onPress={onToggle} activeOpacity={0.75}>
      {checked
        ? <CheckSquare size={22} color={ACCENT} />
        : <Square size={22} color={BORDER} />
      }
      <Text style={ck.label}>{label}</Text>
    </TouchableOpacity>
  );
}
const ck = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  label: { color: TEXT_2, fontSize: 13, lineHeight: 20, flex: 1 },
});

// ── Submit button with hover ─────────────────────────────────

function SubmitButton({ onPress, loading, disabled }: {
  onPress: () => void; loading: boolean; disabled: boolean;
}) {
  const { hovered, webHandlers, webT } = useHover();
  const active = !disabled && !loading;
  return (
    <TouchableOpacity
      style={[
        sb.btn,
        disabled && sb.btnDisabled,
        !disabled && hovered && sb.btnHovered,
        webT,
      ]}
      onPress={active ? onPress : undefined}
      activeOpacity={0.85}
      disabled={disabled || loading}
      {...(!disabled ? webHandlers : {})}
    >
      {loading
        ? <ActivityIndicator color={CARD} size="small" />
        : <Text style={[sb.label, disabled && { color: TEXT_3 }]}>出品する</Text>
      }
    </TouchableOpacity>
  );
}
const sb = StyleSheet.create({
  btn: {
    backgroundColor: ACCENT,
    borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btnDisabled: { backgroundColor: BORDER, shadowOpacity: 0 },
  btnHovered:  { backgroundColor: ACCENT_D },
  label:       { color: CARD, fontSize: 17, fontWeight: '800' },
});

// ── Main screen ───────────────────────────────────────────────

export default function CreateScreen() {
  const router = useRouter();

  // form state
  const [imageUri, setImageUri]   = useState<string | null>(null);
  const [title, setTitle]         = useState('');
  const [material, setMaterial]   = useState<Material | null>(null);
  const [desc, setDesc]           = useState('');
  const [tags, setTags]           = useState('');
  const [profit, setProfit]       = useState('');
  const [agree1, setAgree1]       = useState(false);
  const [agree2, setAgree2]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const profitNum   = parseInt(profit.replace(/[^\d]/g, ''), 10) || 0;
  const finalPrice  = COST_BASE + profitNum;
  const canSubmit   = !!imageUri && !!title.trim() && profitNum > 0 && agree1 && agree2;

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('ライブラリへのアクセスを許可してください', 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3200);
  }

  async function handleSubmit() {
    if (!canSubmit || loading) return;
    setLoading(true);
    // Dummy submit — real Supabase insert will be added later
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    showToast('出品が完了しました！', 'success');
    setTimeout(() => router.replace('/'), 1800);
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <ArrowLeft size={20} color={TEXT} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>作品を出品する</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── STEP 1: Image upload ── */}
        <View style={s.card}>
          <StepHeader num={1} title="デザインのアップロード" />

          <TouchableOpacity
            style={[s.imagePicker, !!imageUri && s.imagePickerFilled]}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={s.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={s.imagePlaceholder}>
                <Upload size={36} color={TEXT_3} />
                <Text style={s.imagePlaceholderText}>タップしてデザイン画像をアップロード</Text>
                <Text style={s.imagePlaceholderSub}>JPG / PNG · 最大 10MB</Text>
              </View>
            )}
          </TouchableOpacity>

          {imageUri && (
            <TouchableOpacity onPress={pickImage} style={s.rePickBtn} activeOpacity={0.75}>
              <Text style={s.rePickText}>画像を変更する</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── STEP 2: Product info ── */}
        <View style={s.card}>
          <StepHeader num={2} title="作品の情報を入力" />

          <Field
            label="商品名"
            value={title}
            onChangeText={setTitle}
            placeholder="例：レザーウォレット（名入れ刻印）"
            required
          />

          {/* Material selector */}
          <View style={fi.wrap}>
            <Text style={fi.label}>素材カテゴリー</Text>
            <View style={s.materialRow}>
              {MATERIALS.map((m) => {
                const sel = material === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[s.matChip, sel && s.matChipActive]}
                    onPress={() => setMaterial(sel ? null : m)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.matChipText, sel && s.matChipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Field
            label="商品説明"
            value={desc}
            onChangeText={setDesc}
            placeholder="素材の質感、使用シーン、カスタマイズの範囲などを記載してください。"
            multiline
          />

          <Field
            label="ハッシュタグ（最大5つ・カンマ区切り）"
            value={tags}
            onChangeText={setTags}
            placeholder="#刻印, #革財布, #名入れ"
          />
        </View>

        {/* ── STEP 3: Pricing simulator ── */}
        <View style={s.card}>
          <StepHeader num={3} title="価格の設定" />

          {/* Cost row */}
          <View style={s.priceRow}>
            <View style={s.priceLeft}>
              <Text style={s.priceLabel}>製造原価（固定）</Text>
              <Text style={s.priceSub}>Arteが製造・発送を担当</Text>
            </View>
            <Text style={s.priceFixed}>¥{COST_BASE.toLocaleString()}</Text>
          </View>

          {/* Profit input */}
          <View style={s.priceRow}>
            <View style={s.priceLeft}>
              <Text style={s.priceLabel}>あなたの利益 <Text style={{ color: ERR }}>*</Text></Text>
              <Text style={s.priceSub}>自由に設定できます</Text>
            </View>
            <View style={s.profitInputWrap}>
              <Text style={s.profitCurrency}>¥</Text>
              <TextInput
                value={profit}
                onChangeText={(v) => setProfit(v.replace(/[^\d]/g, ''))}
                placeholder="0"
                placeholderTextColor={TEXT_3}
                keyboardType="numeric"
                style={s.profitInput}
              />
            </View>
          </View>

          {/* Divider */}
          <View style={s.priceDivider} />

          {/* Final price */}
          <View style={s.finalRow}>
            <Text style={s.finalLabel}>最終販売価格</Text>
            <Text style={s.finalPrice}>¥{finalPrice.toLocaleString()}</Text>
          </View>
          <Text style={s.priceCap}>製造原価 ＋ あなたの利益 がそのまま販売価格になります。</Text>
        </View>

        {/* ── STEP 4: Agreement ── */}
        <View style={s.card}>
          <StepHeader num={4} title="権利と規約の同意" />

          <Checkbox
            checked={agree1}
            onToggle={() => setAgree1(!agree1)}
            label="このデザインの著作権が私（自身または自社）に帰属することを保証します"
          />
          <Checkbox
            checked={agree2}
            onToggle={() => setAgree2(!agree2)}
            label="Arteのクリエイター利用規約に同意します"
          />
        </View>

        {/* ── Submit ── */}
        <View style={s.submitArea}>
          {!canSubmit && (
            <Text style={s.submitHint}>
              画像・商品名・利益額を入力し、両方の規約に同意すると出品できます
            </Text>
          )}
          <SubmitButton onPress={handleSubmit} loading={loading} disabled={!canSubmit} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ───────────────────────────────────────────────────

const CONTENT_MAX = 680;

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: BG },
  scroll:  { flex: 1 },
  content: {
    paddingHorizontal: isWeb ? Math.max((width - CONTENT_MAX) / 2, 24) : 16,
    paddingTop: 20, paddingBottom: 0, alignItems: 'stretch',
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: TEXT, fontSize: 17, fontWeight: '800' },

  // Cards
  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },

  // Image picker
  imagePicker: {
    borderWidth: 2, borderColor: BORDER, borderStyle: 'dashed',
    borderRadius: 16, overflow: 'hidden',
    minHeight: 200, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FAFAF9',
  },
  imagePickerFilled: { borderStyle: 'solid', borderColor: ACCENT },
  imagePlaceholder:  { alignItems: 'center', padding: 32 },
  imagePlaceholderText: { color: TEXT_2, fontSize: 14, fontWeight: '600', marginTop: 14, textAlign: 'center' },
  imagePlaceholderSub:  { color: TEXT_3, fontSize: 12, marginTop: 6 },
  previewImage: { width: '100%', height: 260 },
  rePickBtn:    { marginTop: 10, alignSelf: 'flex-end' },
  rePickText:   { color: ACCENT, fontSize: 13, fontWeight: '600' },

  // Material chips
  materialRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  matChip: {
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5, borderColor: BORDER,
    backgroundColor: CARD,
  },
  matChipActive:     { borderColor: ACCENT, backgroundColor: '#FFF7ED' },
  matChipText:       { color: TEXT_2, fontSize: 14, fontWeight: '600' },
  matChipTextActive: { color: ACCENT },

  // Pricing
  priceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceLeft:  { flex: 1 },
  priceLabel: { color: TEXT, fontSize: 14, fontWeight: '700' },
  priceSub:   { color: TEXT_3, fontSize: 11, marginTop: 2 },
  priceFixed: { color: TEXT_2, fontSize: 16, fontWeight: '700' },

  profitInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: BORDER,
    borderRadius: 10, backgroundColor: CARD,
    paddingHorizontal: 10, paddingVertical: 6,
    minWidth: 110,
  },
  profitCurrency: { color: TEXT_2, fontSize: 15, fontWeight: '700', marginRight: 4 },
  profitInput: {
    color: TEXT, fontSize: 17, fontWeight: '800',
    flex: 1, minWidth: 60,
    height: Platform.OS === 'web' ? 'auto' as any : 36,
  },

  priceDivider: { height: 1, backgroundColor: BORDER, marginBottom: 16 },

  finalRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  finalLabel:{ color: TEXT, fontSize: 15, fontWeight: '800' },
  finalPrice:{ color: ACCENT, fontSize: 28, fontWeight: '900' },
  priceCap:  { color: TEXT_3, fontSize: 11, lineHeight: 16 },

  // Submit
  submitArea: { marginBottom: 8 },
  submitHint: { color: TEXT_3, fontSize: 12, textAlign: 'center', marginBottom: 14, lineHeight: 18 },
});
