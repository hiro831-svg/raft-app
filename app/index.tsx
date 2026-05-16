import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import type { Session } from '@supabase/supabase-js';
import {
  Search, ChevronRight, Lightbulb, Hammer, Truck,
  Star, Heart, Package,
} from 'lucide-react-native';
import { supabase, checkConnection, type ConnectionStatus } from '../src/lib/supabase';

// ── Constants ────────────────────────────────────────────────

const { width } = Dimensions.get('window');
const isWeb     = width > 700;

const BROWN  = '#1a0f0a';
const BROWN2 = '#2A1508';
const BROWN3 = '#3D2010';
const ACCENT = '#C05A00';
const GOLD   = '#D4A017';
const GOLD_L = '#FFD966';
const CREAM  = '#FFF8F0';
const CREAM2 = '#F5ECD7';
const GRAY   = '#78716C';
const GRAY_L = '#E7E5E4';
const WHITE  = '#FFFFFF';

// ── Mock product data ────────────────────────────────────────

const PRODUCTS = [
  {
    id: '1',
    title: 'イニシャル刻印レザーウォレット',
    creator: 'leather_works',
    price: 6800,
    category: '革',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    tags: ['ウォレット', 'ギフト'],
    rating: 4.9,
    sold: 128,
  },
  {
    id: '2',
    title: '真鍮製ネームプレート（彫刻入り）',
    creator: 'metal_forge',
    price: 4500,
    category: '金属',
    image: 'https://images.unsplash.com/photo-1611010344444-5f9e4d86a6c8?w=400&q=80',
    tags: ['表札', 'オフィス'],
    rating: 4.8,
    sold: 94,
  },
  {
    id: '3',
    title: 'エッチングガラスフォトフレーム',
    creator: 'glass_studio',
    price: 5200,
    category: 'ガラス',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&q=80',
    tags: ['フォトフレーム', 'インテリア'],
    rating: 4.7,
    sold: 56,
  },
  {
    id: '4',
    title: 'スチールキーホルダー（家紋彫刻）',
    creator: 'metal_forge',
    price: 2800,
    category: '金属',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    tags: ['キーホルダー', '家紋'],
    rating: 5.0,
    sold: 203,
  },
  {
    id: '5',
    title: 'ハンドステッチ名刺入れ（イニシャル刻印）',
    creator: 'artisan_kei',
    price: 5800,
    category: '革',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
    tags: ['名刺入れ', 'ビジネス'],
    rating: 4.9,
    sold: 77,
  },
  {
    id: '6',
    title: '彫刻入りクリスタルグラス（ペア）',
    creator: 'glass_studio',
    price: 9800,
    category: 'ガラス',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    tags: ['グラス', 'ペアギフト'],
    rating: 4.8,
    sold: 41,
  },
];

const CATEGORIES = [
  { id: 'all',    label: 'すべて',  emoji: '✦', color: GOLD,    bg: '#3D2A00' },
  { id: 'metal',  label: '金属',    emoji: '⚙️', color: '#94A3B8', bg: '#1E293B' },
  { id: 'leather',label: '革',      emoji: '🪵', color: ACCENT,  bg: '#2A1508' },
  { id: 'glass',  label: 'ガラス',  emoji: '💎', color: '#67E8F9', bg: '#0C4A6E' },
];

const CATEGORY_COLOR: Record<string, string> = {
  '金属': '#64748B',
  '革':   ACCENT,
  'ガラス':'#0EA5E9',
};

// ── Sub-components ───────────────────────────────────────────

/** Supabase connection status banner */
function ConnectionBanner() {
  const [status, setStatus]   = useState<ConnectionStatus>('checking');
  const [message, setMessage] = useState('Supabase 接続確認中...');

  useEffect(() => {
    checkConnection().then(({ ok, message: msg }) => {
      setStatus(ok ? 'ok' : 'error');
      setMessage(msg);
    });
  }, []);

  const bg    = status === 'ok' ? '#14532D' : status === 'error' ? '#7F1D1D' : '#1C1917';
  const color = status === 'ok' ? '#86EFAC' : status === 'error' ? '#FCA5A5' : '#D6D3D1';
  const icon  = status === 'ok' ? '✔' : status === 'error' ? '✖' : null;

  return (
    <View style={[cb.bar, { backgroundColor: bg }]}>
      {status === 'checking' && <ActivityIndicator size="small" color="#D6D3D1" style={{ marginRight: 8 }} />}
      {icon && <Text style={[cb.icon, { color }]}>{icon}</Text>}
      <Text style={[cb.text, { color }]}>{message}</Text>
    </View>
  );
}
const cb = StyleSheet.create({
  bar:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 9 },
  icon: { fontSize: 12, fontWeight: '700', marginRight: 6 },
  text: { fontSize: 12 },
});

/** Header */
function Header({ session }: { session: Session | null }) {
  const router = useRouter();
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/auth');
  }
  return (
    <View style={s.header}>
      <View style={s.logoRow}>
        <View style={s.logoMark} />
        <Text style={s.logoText}>CraftShare</Text>
      </View>
      {session ? (
        <View style={s.headerRight}>
          <Text style={s.userEmail} numberOfLines={1}>
            {session.user.email?.split('@')[0]}
          </Text>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={s.logoutBtnText}>ログアウト</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.loginBtn} onPress={() => router.replace('/auth')} activeOpacity={0.8}>
          <Text style={s.loginBtnText}>ログイン</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/** Hero section */
function HeroSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  return (
    <View style={s.hero}>
      {/* Eyebrow */}
      <Text style={s.heroEyebrow}>CRAFTED BY CREATORS · MADE BY CRAFTSMEN</Text>

      {/* Main headline */}
      <Text style={s.heroTitle}>
        あなたのデザインが、{'\n'}一生モノのアイテムに。
      </Text>

      {/* Sub-copy */}
      <Text style={s.heroSub}>
        クリエイターの独自デザインが刻まれた、{'\n'}こだわりの金属・革・ガラス製品を見つけよう。
      </Text>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <Search size={18} color={GRAY} style={{ marginRight: 10 }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="商品名やハッシュタグで検索"
          placeholderTextColor={GRAY}
          style={s.searchInput}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            style={s.searchBtn}
            activeOpacity={0.85}
            onPress={() => {}}
          >
            <Text style={s.searchBtnText}>検索</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CTA buttons */}
      <View style={s.ctaRow}>
        <TouchableOpacity style={s.ctaPrimary} activeOpacity={0.88}>
          <Text style={s.ctaPrimaryText}>商品を探す</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ctaOutline} activeOpacity={0.88}>
          <Text style={s.ctaOutlineText}>デザインを出品する</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { value: '2,400+', label: 'クリエイター' },
          { value: '18,000+', label: '商品数' },
          { value: '4.9',    label: '平均評価' },
        ].map((stat) => (
          <View key={stat.label} style={s.statItem}>
            <Text style={s.statValue}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Category nav */
function CategorySection() {
  const [active, setActive] = useState('all');
  return (
    <View style={s.catSection}>
      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <View style={s.sectionAccent} />
          <Text style={s.sectionTitle}>カテゴリーから探す</Text>
        </View>
      </View>
      <View style={s.catGrid}>
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[s.catCard, isActive && { borderColor: cat.color, borderWidth: 2 }]}
              onPress={() => setActive(cat.id)}
              activeOpacity={0.85}
            >
              <View style={[s.catIconWrap, { backgroundColor: cat.bg }]}>
                <Text style={s.catEmoji}>{cat.emoji}</Text>
              </View>
              <Text style={[s.catLabel, isActive && { color: cat.color }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/** How it Works */
const HOW_STEPS = [
  {
    num: '01',
    icon: Lightbulb,
    title: 'Idea',
    color: GOLD,
    bg: '#2C1F00',
    desc: 'クリエイターがデザインをアップロードし、利益マージンを設定。販売価格は製造コスト＋マージンで自動計算されます。',
  },
  {
    num: '02',
    icon: Hammer,
    title: 'Craft',
    color: ACCENT,
    bg: '#2A1200',
    desc: '当社の職人チームが金属・革・ガラスへ高品質な彫刻・加工を施し、丁寧に製造します。',
  },
  {
    num: '03',
    icon: Truck,
    title: 'Deliver',
    color: '#22C55E',
    bg: '#052E16',
    desc: 'バイヤーの元へ、世界に一つのアイテムを安全・迅速にお届け。クリエイターには利益が自動入金されます。',
  },
];

function HowItWorksSection() {
  return (
    <View style={s.howSection}>
      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <View style={[s.sectionAccent, { backgroundColor: GOLD }]} />
          <Text style={[s.sectionTitle, { color: CREAM2 }]}>CraftShareの仕組み</Text>
        </View>
        <Text style={s.howSubtitle}>3ステップで、アイデアが一生モノに</Text>
      </View>

      <View style={[s.howSteps, isWeb && s.howStepsWeb]}>
        {HOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <View key={step.num} style={[s.howStep, isWeb && s.howStepWeb]}>
              {/* Connector line */}
              {idx < HOW_STEPS.length - 1 && isWeb && (
                <View style={s.connector} />
              )}
              {/* Icon circle */}
              <View style={[s.howIconCircle, { backgroundColor: step.bg, borderColor: step.color }]}>
                <Icon size={28} color={step.color} />
              </View>
              {/* Number */}
              <Text style={[s.howNum, { color: step.color }]}>{step.num}</Text>
              <Text style={s.howTitle}>{step.title}</Text>
              <Text style={s.howDesc}>{step.desc}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Product card */
function ProductCard({ product }: { product: typeof PRODUCTS[number] }) {
  const [liked, setLiked]       = useState(false);
  const [imgError, setImgError] = useState(false);
  const catColor = CATEGORY_COLOR[product.category] ?? GRAY;

  return (
    <TouchableOpacity style={s.card} activeOpacity={0.9}>
      {/* Image */}
      <View style={s.cardImgWrap}>
        {!imgError ? (
          <Image
            source={{ uri: product.image }}
            style={s.cardImg}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={[s.cardImg, s.cardImgFallback]}>
            <Package size={36} color={GRAY} />
          </View>
        )}
        {/* Category badge */}
        <View style={[s.catBadge, { backgroundColor: catColor + '30', borderColor: catColor + '60' }]}>
          <Text style={[s.catBadgeText, { color: catColor }]}>{product.category}</Text>
        </View>
        {/* Like button */}
        <TouchableOpacity
          style={s.likeBtn}
          onPress={() => setLiked(!liked)}
          activeOpacity={0.8}
        >
          <Heart
            size={16}
            color={liked ? '#F87171' : '#A8A29E'}
            fill={liked ? '#F87171' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={s.cardBody}>
        <Text style={s.cardTitle} numberOfLines={2}>{product.title}</Text>
        <Text style={s.cardCreator}>by {product.creator}</Text>

        {/* Rating + sold */}
        <View style={s.cardMeta}>
          <Star size={12} color={GOLD} fill={GOLD} />
          <Text style={s.cardRating}>{product.rating}</Text>
          <Text style={s.cardSold}>· {product.sold}件販売</Text>
        </View>

        <View style={s.cardFooter}>
          <Text style={s.cardPrice}>¥{product.price.toLocaleString()}</Text>
          <TouchableOpacity style={s.cardOrderBtn} activeOpacity={0.85}>
            <Text style={s.cardOrderBtnText}>購入する</Text>
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={s.tagRow}>
          {product.tags.map((tag) => (
            <View key={tag} style={s.tag}>
              <Text style={s.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/** Pickup products section */
function PickupSection() {
  const cardW = isWeb ? Math.min(300, (width - 160) / 3) : width - 40;
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <View style={s.sectionAccent} />
          <Text style={s.sectionTitle}>注目のアイテム</Text>
        </View>
        <TouchableOpacity style={s.moreBtn}>
          <Text style={s.moreBtnText}>すべて見る</Text>
          <ChevronRight size={14} color={ACCENT} />
        </TouchableOpacity>
      </View>

      <View style={[s.cardGrid, isWeb && s.cardGridWeb]}>
        {PRODUCTS.map((p) => (
          <View key={p.id} style={[s.cardWrap, isWeb && { width: cardW }]}>
            <ProductCard product={p} />
          </View>
        ))}
      </View>
    </View>
  );
}

/** Footer */
function Footer() {
  return (
    <View style={s.footer}>
      <View style={s.logoRow}>
        <View style={s.logoMark} />
        <Text style={[s.logoText, { fontSize: 20 }]}>CraftShare</Text>
      </View>
      <Text style={s.footerSub}>
        クリエイターの独自デザインが職人の技で形に。{'\n'}世界に一つのアイテムをあなたの元へ。
      </Text>
      <View style={s.footerLinks}>
        {['利用規約', 'プライバシーポリシー', 'お問い合わせ', 'クリエイターガイド'].map((link) => (
          <TouchableOpacity key={link} style={{ marginHorizontal: 8, marginVertical: 4 }}>
            <Text style={s.footerLink}>{link}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.footerCopy}>© 2025 CraftShare Inc. All rights reserved.</Text>
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────

export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <Header session={session} />
      <ConnectionBanner />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <HeroSection />
        <CategorySection />
        <HowItWorksSection />
        <PickupSection />
        <Footer />
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: BROWN },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16,
    backgroundColor: BROWN,
    borderBottomWidth: 1, borderBottomColor: BROWN3,
  },
  logoRow:   { flexDirection: 'row', alignItems: 'center' },
  logoMark:  { width: 5, height: 26, backgroundColor: GOLD, borderRadius: 3, marginRight: 10 },
  logoText:  { color: GOLD_L, fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userEmail:     { color: GOLD_L, fontSize: 12, maxWidth: 100 },
  loginBtn:      { borderWidth: 1, borderColor: GOLD, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  loginBtnText:  { color: GOLD, fontSize: 13, fontWeight: '600' },
  logoutBtn:     { borderWidth: 1, borderColor: BROWN3, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  logoutBtnText: { color: GRAY, fontSize: 12, fontWeight: '600' },

  // Hero
  hero: {
    backgroundColor: BROWN,
    paddingHorizontal: isWeb ? 72 : 24,
    paddingTop: isWeb ? 72 : 48,
    paddingBottom: 56,
  },
  heroEyebrow: {
    color: GOLD, fontSize: 10, fontWeight: '700',
    letterSpacing: 3, marginBottom: 18,
  },
  heroTitle: {
    color: WHITE,
    fontSize: isWeb ? 56 : 34,
    fontWeight: '800',
    lineHeight: isWeb ? 70 : 46,
    marginBottom: 18,
  },
  heroSub: {
    color: '#C8B8A8',
    fontSize: isWeb ? 18 : 15,
    lineHeight: 28,
    marginBottom: 32,
    maxWidth: 560,
  },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2A1508',
    borderWidth: 1, borderColor: '#4A3020',
    borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'web' ? 12 : 8,
    marginBottom: 28,
    maxWidth: 560,
  },
  searchInput: {
    flex: 1, color: WHITE, fontSize: 15,
    height: Platform.OS === 'web' ? 'auto' : 36,
  },
  searchBtn: {
    backgroundColor: GOLD, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 6, marginLeft: 8,
  },
  searchBtnText: { color: BROWN, fontWeight: '700', fontSize: 13 },

  // CTA
  ctaRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 12, marginBottom: 44,
    alignItems: isWeb ? 'center' : 'stretch',
  },
  ctaPrimary: {
    backgroundColor: GOLD,
    paddingHorizontal: 36, paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    alignSelf: isWeb ? 'auto' : 'stretch',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  ctaPrimaryText: { color: BROWN, fontSize: 16, fontWeight: '800' },
  ctaOutline: {
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 36, paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    alignSelf: isWeb ? 'auto' : 'stretch',
  },
  ctaOutlineText: { color: WHITE, fontSize: 16, fontWeight: '600' },

  // Stats
  statsRow: {
    flexDirection: 'row', gap: isWeb ? 48 : 24,
    paddingTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  statItem:  { alignItems: 'flex-start' },
  statValue: { color: GOLD_L, fontSize: isWeb ? 28 : 22, fontWeight: '800' },
  statLabel: { color: '#8B7355', fontSize: 12, marginTop: 2 },

  // Section commons
  sectionHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: isWeb ? 64 : 20, marginBottom: 24,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionAccent:   { width: 4, height: 24, backgroundColor: ACCENT, borderRadius: 2, marginRight: 12 },
  sectionTitle:    { color: BROWN, fontSize: isWeb ? 22 : 19, fontWeight: '800' },
  moreBtn:         { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreBtnText:     { color: ACCENT, fontSize: 13, fontWeight: '600' },

  // Categories
  catSection: {
    backgroundColor: CREAM, paddingTop: 44, paddingBottom: 40,
  },
  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    paddingHorizontal: isWeb ? 64 : 20,
  },
  catCard: {
    flex: isWeb ? undefined : 1,
    width: isWeb ? 140 : undefined,
    minWidth: 70,
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1.5, borderColor: GRAY_L,
    shadowColor: BROWN, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  catIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  catEmoji: { fontSize: 24 },
  catLabel: { color: BROWN, fontSize: 14, fontWeight: '700' },

  // How it works
  howSection: {
    backgroundColor: BROWN2,
    paddingTop: 56, paddingBottom: 60,
  },
  howSubtitle: {
    color: '#8B7355', fontSize: 13,
    paddingHorizontal: isWeb ? 64 : 20,
    marginTop: -16, marginBottom: 36,
  },
  howSteps: {
    paddingHorizontal: isWeb ? 64 : 20,
    gap: 20,
  },
  howStepsWeb: { flexDirection: 'row', alignItems: 'flex-start' },
  howStep: {
    flex: isWeb ? 1 : undefined,
    backgroundColor: '#1a0f0a',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1, borderColor: BROWN3,
    position: 'relative',
  },
  howStepWeb: { marginHorizontal: 8 },
  connector: {
    position: 'absolute', top: 40, right: -16, width: 32, height: 1,
    backgroundColor: BROWN3, zIndex: 2,
  },
  howIconCircle: {
    width: 60, height: 60, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  howNum:   { color: GRAY, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  howTitle: { color: WHITE, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  howDesc:  { color: '#8B7355', fontSize: 13, lineHeight: 21 },

  // Products section
  section: { backgroundColor: CREAM, paddingTop: 48, paddingBottom: 56 },
  cardGrid: { paddingHorizontal: isWeb ? 64 : 16, gap: 20 },
  cardGridWeb: { flexDirection: 'row', flexWrap: 'wrap' },
  cardWrap: { marginBottom: 4 },

  // Card
  card: {
    backgroundColor: WHITE, borderRadius: 20, overflow: 'hidden',
    shadowColor: BROWN, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 4,
  },
  cardImgWrap:    { width: '100%', height: 200, position: 'relative' },
  cardImg:        { width: '100%', height: '100%' },
  cardImgFallback:{ backgroundColor: GRAY_L, alignItems: 'center', justifyContent: 'center' },
  catBadge: {
    position: 'absolute', top: 12, left: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  likeBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody:      { padding: 16 },
  cardTitle:     { color: '#1C1917', fontSize: 15, fontWeight: '700', lineHeight: 22, marginBottom: 2 },
  cardCreator:   { color: GRAY, fontSize: 11, marginBottom: 8 },
  cardMeta:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  cardRating:    { color: GOLD, fontSize: 12, fontWeight: '700' },
  cardSold:      { color: GRAY, fontSize: 11 },
  cardFooter:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardPrice:     { color: ACCENT, fontSize: 18, fontWeight: '800' },
  cardOrderBtn:  { backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  cardOrderBtnText: { color: WHITE, fontSize: 12, fontWeight: '700' },
  tagRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:           { backgroundColor: '#F5F5F4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText:       { color: GRAY, fontSize: 11 },

  // Footer
  footer: {
    backgroundColor: BROWN, alignItems: 'center',
    paddingVertical: 48, paddingHorizontal: 24, gap: 12,
  },
  footerSub:   { color: '#6B5B4B', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 },
  footerLink:  { color: '#6B5B4B', fontSize: 12 },
  footerCopy:  { color: '#3D2510', fontSize: 11, marginTop: 8 },
});
