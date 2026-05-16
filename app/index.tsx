import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import type { Session } from '@supabase/supabase-js';
import {
  Search, ChevronRight, Lightbulb, Hammer, ShoppingBag,
  Sparkles, Package, Heart, Star, Truck, ArrowRight,
  Pencil, DollarSign, Image as ImageIcon,
} from 'lucide-react-native';
import { supabase, checkConnection, type ConnectionStatus } from '../src/lib/supabase';

// ── Constants ────────────────────────────────────────────────

const { width } = Dimensions.get('window');
const isWeb     = width > 700;

const BROWN   = '#1a0f0a';
const BROWN2  = '#231309';
const BROWN3  = '#3D2010';
const ACCENT  = '#C05A00';
const GOLD    = '#D4A017';
const GOLD_L  = '#FFD966';
const CREAM   = '#FFF8F0';
const CREAM2  = '#F5ECD7';
const GRAY    = '#78716C';
const GRAY_L  = '#E7E5E4';
const WHITE   = '#FFFFFF';
const SUCCESS = '#16A34A';

// ── Connection banner ────────────────────────────────────────

function ConnectionBanner() {
  const [status, setStatus]   = useState<ConnectionStatus>('checking');
  const [message, setMessage] = useState('接続確認中...');

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

// ── Header ───────────────────────────────────────────────────

function Header({ session }: { session: Session | null }) {
  const router = useRouter();
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/auth');
  }
  return (
    <View style={s.header}>
      {/* Logo */}
      <TouchableOpacity style={s.logoRow} activeOpacity={0.85}>
        <View style={s.logoAccent} />
        <Text style={s.logoText}>Arte</Text>
        <View style={s.logoDot} />
      </TouchableOpacity>

      {/* Auth */}
      {session ? (
        <View style={s.headerRight}>
          <Text style={s.userLabel}>{session.user.email?.split('@')[0]}</Text>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <Text style={s.logoutBtnText}>ログアウト</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.headerRight}>
          <TouchableOpacity onPress={() => router.replace('/auth')}>
            <Text style={s.headerLink}>ログイン</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.headerSignup} onPress={() => router.replace('/auth')}>
            <Text style={s.headerSignupText}>無料で始める</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Hero ─────────────────────────────────────────────────────

function HeroSection() {
  const [query, setQuery] = useState('');

  return (
    <View style={s.hero}>
      {/* Tag line */}
      <View style={s.heroTag}>
        <Sparkles size={12} color={GOLD} style={{ marginRight: 6 }} />
        <Text style={s.heroTagText}>クリエイターと出会う、新しいEC体験</Text>
      </View>

      {/* Main headline */}
      <Text style={s.heroTitle}>
        どこにもないデザインを、{'\n'}あなたが作り{'\n'}あなたが使う
      </Text>

      {/* Sub copy */}
      <Text style={s.heroSub}>
        作り手と使い手を作品がつなぐプラットフォーム
      </Text>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <Search size={18} color={GRAY} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="商品名やハッシュタグで検索"
          placeholderTextColor="#6B5B4B"
          style={s.searchInput}
          returnKeyType="search"
        />
        <TouchableOpacity style={s.searchBtn} activeOpacity={0.88}>
          <Text style={s.searchBtnText}>検索</Text>
        </TouchableOpacity>
      </View>

      {/* Search hints */}
      <View style={s.searchHints}>
        {['#刻印', '#革財布', '#名入れ', '#ガラス彫刻', '#金属表札'].map((hint) => (
          <TouchableOpacity key={hint} style={s.hintChip} activeOpacity={0.8}>
            <Text style={s.hintText}>{hint}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA buttons */}
      <View style={s.ctaRow}>
        <TouchableOpacity style={s.ctaPrimary} activeOpacity={0.88}>
          <ShoppingBag size={18} color={BROWN} style={{ marginRight: 8 }} />
          <Text style={s.ctaPrimaryText}>商品を探す</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ctaSecondary} activeOpacity={0.88}>
          <Pencil size={16} color={GOLD_L} style={{ marginRight: 8 }} />
          <Text style={s.ctaSecondaryText}>デザインを出品する</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { value: '2,400+', label: 'クリエイター' },
          { value: '18,000+', label: '商品数' },
          { value: '4.9 ★',  label: '平均評価' },
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

// ── How it works ─────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <View style={s.howSection}>
      {/* Section header */}
      <View style={s.howHeader}>
        <View style={s.sectionAccentLine} />
        <Text style={s.howTitle}>Arteの仕組み</Text>
        <Text style={s.howSubtitle}>クリエイターとバイヤーを、職人の技がつなぐ</Text>
      </View>

      {/* Diagram */}
      <View style={[s.diagram, isWeb && s.diagramWeb]}>

        {/* ── Creator ── */}
        <View style={[s.diagBox, s.diagCreator]}>
          <View style={[s.diagIconWrap, { backgroundColor: '#1E1200', borderColor: GOLD }]}>
            <Lightbulb size={24} color={GOLD} />
          </View>
          <Text style={[s.diagRole, { color: GOLD }]}>Creator</Text>
          <Text style={s.diagRoleJp}>クリエイター</Text>
          <View style={s.diagDivider} />
          {[
            { Icon: ImageIcon,   text: 'デザインを投稿' },
            { Icon: DollarSign,  text: '利益マージンを設定' },
            { Icon: Star,        text: '作品を世界に公開' },
          ].map(({ Icon, text }) => (
            <View key={text} style={s.diagItem}>
              <Icon size={13} color={GOLD} style={{ marginRight: 6 }} />
              <Text style={s.diagItemText}>{text}</Text>
            </View>
          ))}
          <TouchableOpacity style={s.diagCta} activeOpacity={0.85}>
            <Text style={s.diagCtaText}>出品を始める →</Text>
          </TouchableOpacity>
        </View>

        {/* ── Arrow / connector ── */}
        {isWeb ? (
          <View style={s.arrowWrap}>
            <View style={s.arrowLine} />
            <ArrowRight size={20} color={GOLD} />
          </View>
        ) : (
          <View style={s.arrowDown}>
            <Text style={s.arrowDownText}>↓</Text>
          </View>
        )}

        {/* ── Arte Craft (center) ── */}
        <View style={[s.diagBox, s.diagCraft]}>
          <View style={s.craftBadge}>
            <Text style={s.craftBadgeText}>中心</Text>
          </View>
          <View style={[s.diagIconWrap, { backgroundColor: '#2A1200', borderColor: ACCENT, width: 64, height: 64 }]}>
            <Hammer size={30} color={ACCENT} />
          </View>
          <Text style={[s.diagRole, { color: ACCENT, fontSize: 20 }]}>Arte Craft</Text>
          <Text style={[s.diagRoleJp, { color: '#A87050' }]}>製造・発送</Text>
          <View style={[s.diagDivider, { borderColor: '#3D2010' }]} />

          {/* Material badges */}
          <View style={s.materialRow}>
            {[
              { label: '⚙️ 金属', color: '#94A3B8', bg: '#1E293B' },
              { label: '🪵 革',   color: ACCENT,    bg: '#2A1508' },
              { label: '💎 ガラス', color: '#67E8F9', bg: '#0C4A6E' },
            ].map((m) => (
              <View key={m.label} style={[s.matBadge, { backgroundColor: m.bg, borderColor: m.color + '60' }]}>
                <Text style={[s.matBadgeText, { color: m.color }]}>{m.label}</Text>
              </View>
            ))}
          </View>

          {[
            { Icon: Hammer,  text: '高品質な彫刻・加工' },
            { Icon: Package, text: '丁寧な梱包' },
            { Icon: Truck,   text: '全国発送対応' },
          ].map(({ Icon, text }) => (
            <View key={text} style={s.diagItem}>
              <Icon size={13} color={ACCENT} style={{ marginRight: 6 }} />
              <Text style={[s.diagItemText, { color: '#C8A96E' }]}>{text}</Text>
            </View>
          ))}
        </View>

        {/* ── Arrow / connector ── */}
        {isWeb ? (
          <View style={s.arrowWrap}>
            <View style={s.arrowLine} />
            <ArrowRight size={20} color={GOLD} />
          </View>
        ) : (
          <View style={s.arrowDown}>
            <Text style={s.arrowDownText}>↓</Text>
          </View>
        )}

        {/* ── Buyer ── */}
        <View style={[s.diagBox, s.diagBuyer]}>
          <View style={[s.diagIconWrap, { backgroundColor: '#052E16', borderColor: SUCCESS }]}>
            <ShoppingBag size={24} color={SUCCESS} />
          </View>
          <Text style={[s.diagRole, { color: SUCCESS }]}>Buyer</Text>
          <Text style={s.diagRoleJp}>バイヤー</Text>
          <View style={[s.diagDivider, { borderColor: '#1A3A25' }]} />
          {[
            { Icon: Search,   text: '作品を探す・購入する' },
            { Icon: Heart,    text: '世界に一つのアイテム' },
            { Icon: Star,     text: 'レビューでお礼を伝える' },
          ].map(({ Icon, text }) => (
            <View key={text} style={s.diagItem}>
              <Icon size={13} color={SUCCESS} style={{ marginRight: 6 }} />
              <Text style={s.diagItemText}>{text}</Text>
            </View>
          ))}
          <TouchableOpacity style={[s.diagCta, { borderColor: SUCCESS + '50', backgroundColor: SUCCESS + '15' }]} activeOpacity={0.85}>
            <Text style={[s.diagCtaText, { color: SUCCESS }]}>商品を探す →</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Flow caption */}
      <Text style={s.diagramCaption}>
        クリエイターの売上はArteが自動で精算。面倒な製造・発送はすべて当社が担当します。
      </Text>
    </View>
  );
}

// ── Category nav ─────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',     label: 'すべて',    emoji: '✦',  color: GOLD,      bg: '#2C1F00' },
  { id: 'metal',   label: '金属',      emoji: '⚙️',  color: '#94A3B8', bg: '#1E293B' },
  { id: 'leather', label: '革',        emoji: '🪵',  color: ACCENT,    bg: '#2A1508' },
  { id: 'glass',   label: 'ガラス',    emoji: '💎',  color: '#67E8F9', bg: '#0C4A6E' },
];

function CategorySection() {
  const [active, setActive] = useState('all');
  return (
    <View style={s.catSection}>
      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <View style={s.sectionAccentBar} />
          <Text style={s.sectionTitleDark}>カテゴリーから探す</Text>
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
              <Text style={[s.catLabel, isActive && { color: cat.color }]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Pickup placeholder ───────────────────────────────────────

function PickupSection() {
  return (
    <View style={s.pickupSection}>
      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <View style={s.sectionAccentBar} />
          <Text style={s.sectionTitleDark}>注目のアイテム</Text>
        </View>
      </View>

      {/* Placeholder */}
      <View style={s.placeholder}>
        <View style={s.placeholderIcon}>
          <Search size={40} color={GRAY} />
        </View>
        <Text style={s.placeholderTitle}>作品を検索して見つけよう</Text>
        <Text style={s.placeholderSub}>
          クリエイターたちのユニークなデザインが{'\n'}近日公開予定です。
        </Text>
        <TouchableOpacity style={s.placeholderBtn} activeOpacity={0.85}>
          <Search size={15} color={BROWN} style={{ marginRight: 6 }} />
          <Text style={s.placeholderBtnText}>商品を探す</Text>
        </TouchableOpacity>

        {/* Hint tags */}
        <View style={s.placeholderTags}>
          {['#刻印', '#名入れ', '#革財布', '#表札', '#ガラス彫刻'].map((tag) => (
            <View key={tag} style={s.placeholderTag}>
              <Text style={s.placeholderTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Footer ───────────────────────────────────────────────────

function Footer() {
  return (
    <View style={s.footer}>
      <View style={s.footerLogoRow}>
        <View style={s.logoAccent} />
        <Text style={[s.logoText, { fontSize: 20 }]}>Arte</Text>
        <View style={s.logoDot} />
      </View>
      <Text style={s.footerSub}>
        作り手と使い手を作品がつなぐプラットフォーム
      </Text>
      <View style={s.footerLinks}>
        {['利用規約', 'プライバシーポリシー', 'お問い合わせ', 'クリエイターガイド'].map((link) => (
          <TouchableOpacity key={link} style={{ marginHorizontal: 8, marginVertical: 4 }}>
            <Text style={s.footerLink}>{link}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.footerCopy}>© 2025 Arte Inc. All rights reserved.</Text>
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
    backgroundColor: BROWN, borderBottomWidth: 1, borderBottomColor: '#2A1508',
  },
  logoRow:    { flexDirection: 'row', alignItems: 'center' },
  logoAccent: { width: 4, height: 26, backgroundColor: GOLD, borderRadius: 3, marginRight: 8 },
  logoText:   { color: GOLD_L, fontSize: 26, fontWeight: '900', letterSpacing: 3, fontStyle: 'italic' },
  logoDot:    { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD, marginLeft: 3, marginTop: 10 },
  footerLogoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userLabel:     { color: GOLD_L, fontSize: 12 },
  headerLink:    { color: GRAY, fontSize: 13, fontWeight: '600' },
  headerSignup:  { backgroundColor: GOLD, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  headerSignupText: { color: BROWN, fontSize: 13, fontWeight: '700' },
  logoutBtn:     { borderWidth: 1, borderColor: '#3D2010', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  logoutBtnText: { color: GRAY, fontSize: 12 },

  // Hero
  hero: {
    backgroundColor: BROWN,
    paddingHorizontal: isWeb ? 72 : 24,
    paddingTop: isWeb ? 80 : 52,
    paddingBottom: 60,
  },
  heroTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2C1F00', borderWidth: 1, borderColor: '#4A3510',
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    marginBottom: 24,
  },
  heroTagText: { color: GOLD, fontSize: 11, fontWeight: '600' },
  heroTitle: {
    color: WHITE,
    fontSize: isWeb ? 58 : 34,
    fontWeight: '900',
    lineHeight: isWeb ? 74 : 48,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  heroSub: {
    color: '#C8B8A8',
    fontSize: isWeb ? 20 : 16,
    lineHeight: 30,
    marginBottom: 36,
    maxWidth: 500,
  },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#231309',
    borderWidth: 1.5, borderColor: '#4A3020',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'web' ? 14 : 10,
    marginBottom: 12,
    maxWidth: 600,
    gap: 10,
  },
  searchInput: {
    flex: 1, color: WHITE, fontSize: 15,
    height: Platform.OS === 'web' ? 'auto' as any : 36,
  },
  searchBtn: {
    backgroundColor: GOLD, borderRadius: 10,
    paddingHorizontal: 18, paddingVertical: 8,
  },
  searchBtnText: { color: BROWN, fontWeight: '800', fontSize: 14 },

  // Search hints
  searchHints: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32, maxWidth: 600,
  },
  hintChip: {
    borderWidth: 1, borderColor: '#4A3020',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  hintText: { color: '#8B7355', fontSize: 12 },

  // CTA
  ctaRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 14, marginBottom: 48,
    alignItems: isWeb ? 'center' : 'stretch',
  },
  ctaPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: 36, paddingVertical: 18,
    borderRadius: 16, alignSelf: isWeb ? 'auto' : 'stretch',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  ctaPrimaryText: { color: BROWN, fontSize: 16, fontWeight: '800' },
  ctaSecondary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(212,160,23,0.35)',
    paddingHorizontal: 36, paddingVertical: 18,
    borderRadius: 16, alignSelf: isWeb ? 'auto' : 'stretch',
  },
  ctaSecondaryText: { color: GOLD_L, fontSize: 16, fontWeight: '600' },

  // Stats
  statsRow: {
    flexDirection: 'row', gap: isWeb ? 56 : 28,
    paddingTop: 28,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
  },
  statItem:  { alignItems: 'flex-start' },
  statValue: { color: GOLD_L, fontSize: isWeb ? 28 : 22, fontWeight: '900' },
  statLabel: { color: '#6B5B4B', fontSize: 12, marginTop: 3 },

  // Section commons
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: isWeb ? 64 : 20, marginBottom: 24,
  },
  sectionTitleRow:  { flexDirection: 'row', alignItems: 'center' },
  sectionAccentBar: { width: 4, height: 22, backgroundColor: ACCENT, borderRadius: 2, marginRight: 12 },
  sectionTitleDark: { color: BROWN, fontSize: isWeb ? 22 : 19, fontWeight: '800' },

  // Category
  catSection: { backgroundColor: CREAM, paddingTop: 48, paddingBottom: 40 },
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
    paddingVertical: 18, paddingHorizontal: 12,
    borderWidth: 1.5, borderColor: GRAY_L,
    shadowColor: BROWN, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  catIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  catEmoji: { fontSize: 22 },
  catLabel: { color: BROWN, fontSize: 13, fontWeight: '700' },

  // How it works
  howSection: {
    backgroundColor: BROWN2,
    paddingTop: 56, paddingBottom: 64,
  },
  howHeader: {
    paddingHorizontal: isWeb ? 64 : 20,
    marginBottom: 40,
  },
  sectionAccentLine: {
    width: 40, height: 3, backgroundColor: GOLD,
    borderRadius: 2, marginBottom: 16,
  },
  howTitle: {
    color: CREAM2, fontSize: isWeb ? 28 : 22,
    fontWeight: '900', marginBottom: 8,
  },
  howSubtitle: { color: '#6B5B4B', fontSize: 14 },

  // Diagram
  diagram: {
    paddingHorizontal: isWeb ? 64 : 16,
    gap: 0,
  },
  diagramWeb: {
    flexDirection: 'row', alignItems: 'stretch',
  },
  diagramCaption: {
    color: '#4A3020', fontSize: 12, textAlign: 'center',
    marginTop: 28, paddingHorizontal: isWeb ? 64 : 24,
    lineHeight: 18,
  },

  // Diagram boxes
  diagBox: {
    flex: isWeb ? 1 : undefined,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    marginBottom: isWeb ? 0 : 0,
  },
  diagCreator: {
    backgroundColor: '#1C1200', borderColor: '#3D2E00',
  },
  diagCraft: {
    backgroundColor: '#1C0D00', borderColor: '#4A2000',
    flex: isWeb ? 1.3 : undefined,
    marginHorizontal: isWeb ? 8 : 0,
    marginVertical: isWeb ? 0 : 8,
  },
  diagBuyer: {
    backgroundColor: '#071A10', borderColor: '#0F3020',
  },
  craftBadge: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: ACCENT + '20', borderWidth: 1, borderColor: ACCENT + '40',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  craftBadgeText: { color: ACCENT, fontSize: 10, fontWeight: '700' },

  diagIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 1,
  },
  diagRole:   { color: WHITE, fontSize: 18, fontWeight: '900', marginBottom: 2 },
  diagRoleJp: { color: '#6B5B4B', fontSize: 12, marginBottom: 14 },
  diagDivider:{ borderTopWidth: 1, borderColor: '#2A1A00', marginBottom: 14 },
  diagItem:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  diagItemText:{ color: '#8B7355', fontSize: 13 },
  diagCta: {
    marginTop: 16,
    borderWidth: 1, borderColor: GOLD + '40',
    backgroundColor: GOLD + '15',
    paddingVertical: 10, borderRadius: 10,
    alignItems: 'center',
  },
  diagCtaText: { color: GOLD, fontSize: 13, fontWeight: '700' },

  materialRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 14 },
  matBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  matBadgeText: { fontSize: 12, fontWeight: '600' },

  // Arrows
  arrowWrap: {
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', paddingHorizontal: 4,
  },
  arrowLine: { flex: 1, height: 1, backgroundColor: '#3D2010' },
  arrowDown: { alignItems: 'center', paddingVertical: 8 },
  arrowDownText: { color: '#3D2010', fontSize: 24 },

  // Pickup / placeholder
  pickupSection: { backgroundColor: CREAM, paddingTop: 48, paddingBottom: 64 },
  placeholder: {
    marginHorizontal: isWeb ? 64 : 20,
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: GRAY_L,
    borderStyle: 'dashed',
  },
  placeholderIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#F5F5F4',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderTitle: {
    color: BROWN, fontSize: 18, fontWeight: '800', marginBottom: 10,
  },
  placeholderSub: {
    color: GRAY, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  placeholderBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12,
    marginBottom: 24,
  },
  placeholderBtnText: { color: BROWN, fontWeight: '800', fontSize: 15 },
  placeholderTags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  placeholderTag: {
    borderWidth: 1, borderColor: GRAY_L,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  placeholderTagText: { color: GRAY, fontSize: 12 },

  // Footer
  footer: {
    backgroundColor: BROWN, alignItems: 'center',
    paddingVertical: 48, paddingHorizontal: 24, gap: 10,
  },
  footerSub:   { color: '#4A3020', fontSize: 13, textAlign: 'center' },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  footerLink:  { color: '#4A3020', fontSize: 12 },
  footerCopy:  { color: '#2A1508', fontSize: 11, marginTop: 4 },
});
