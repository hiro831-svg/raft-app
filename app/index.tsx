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
  Search, Lightbulb, Hammer, ShoppingBag,
  Star, Pencil,
} from 'lucide-react-native';
import { supabase, checkConnection, type ConnectionStatus } from '../src/lib/supabase';

// ── Constants ────────────────────────────────────────────────

const { width } = Dimensions.get('window');
const isWeb = width > 700;

const BG       = '#F5F0E8';
const BG_ALT   = '#EDE8DF';
const CARD     = '#FFFFFF';
const BORDER   = '#DDD5C8';
const TEXT     = '#1C1917';
const TEXT_2   = '#57534E';
const TEXT_3   = '#A8A29E';
const ACCENT   = '#C05A00';
const ACCENT_D = '#A34E00';   // darker accent for hover fill
const GOLD     = '#B8860B';
const GOLD_L   = '#D4A017';
const SUCCESS  = '#166534';
const SUCCESS_D = '#0D4A25';  // darker green for hover fill

const SQ_LARGE = 340;
const SQ_SMALL = 250;

// ── Shared hover hook ────────────────────────────────────────

function useHover() {
  const [hovered, setHovered] = useState(false);
  const webHandlers: any = Platform.OS === 'web' ? {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  } : {};
  const webT: any = Platform.OS === 'web' ? {
    transitionProperty: 'background-color, color, border-color',
    transitionDuration: '250ms',
    transitionTimingFunction: 'ease',
  } : {};
  return { hovered, webHandlers, webT };
}

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

  const bg    = status === 'ok' ? '#DCFCE7' : status === 'error' ? '#FEE2E2' : '#F5F5F4';
  const color = status === 'ok' ? '#166534' : status === 'error' ? '#991B1B' : '#78716C';
  const icon  = status === 'ok' ? '✔' : status === 'error' ? '✖' : null;

  return (
    <View style={[cb.bar, { backgroundColor: bg }]}>
      {status === 'checking' && <ActivityIndicator size="small" color="#78716C" style={{ marginRight: 8 }} />}
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

// ── Header buttons ───────────────────────────────────────────

function HeaderLoginBtn({ onPress }: { onPress: () => void }) {
  const { hovered, webHandlers, webT } = useHover();
  return (
    <TouchableOpacity onPress={onPress} {...webHandlers}>
      <Text style={[s.headerLink, hovered && { color: ACCENT }, webT as any]}>ログイン</Text>
    </TouchableOpacity>
  );
}

function HeaderSignupBtn({ onPress }: { onPress: () => void }) {
  const { hovered, webHandlers, webT } = useHover();
  return (
    <TouchableOpacity
      style={[s.headerSignup, hovered && { backgroundColor: ACCENT_D }, webT]}
      onPress={onPress}
      {...webHandlers}
    >
      <Text style={s.headerSignupText}>無料で始める</Text>
    </TouchableOpacity>
  );
}

function HeaderLogoutBtn({ onPress }: { onPress: () => void }) {
  const { hovered, webHandlers, webT } = useHover();
  return (
    <TouchableOpacity
      style={[s.logoutBtn, hovered && { borderColor: ACCENT, backgroundColor: '#FFF7ED' }, webT]}
      onPress={onPress}
      {...webHandlers}
    >
      <Text style={[s.logoutBtnText, hovered && { color: ACCENT }]}>ログアウト</Text>
    </TouchableOpacity>
  );
}

function Header({ session }: { session: Session | null }) {
  const router = useRouter();
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/auth');
  }
  return (
    <View style={s.header}>
      <TouchableOpacity style={s.logoRow} activeOpacity={0.85}>
        <View style={s.logoAccent} />
        <Text style={s.logoText}>Arte</Text>
        <View style={s.logoDot} />
      </TouchableOpacity>

      {session ? (
        <View style={s.headerRight}>
          <Text style={s.userLabel}>{session.user.email?.split('@')[0]}</Text>
          <HeaderLogoutBtn onPress={handleLogout} />
        </View>
      ) : (
        <View style={s.headerRight}>
          <HeaderLoginBtn onPress={() => router.replace('/auth')} />
          <HeaderSignupBtn onPress={() => router.replace('/auth')} />
        </View>
      )}
    </View>
  );
}

// ── CTA button (outline → fill on hover) ────────────────────

function CtaButton({
  label,
  Icon,
  onPress,
}: {
  label: string;
  Icon: React.ComponentType<{ size: number; color: string; style?: any }>;
  onPress?: () => void;
}) {
  const { hovered, webHandlers, webT } = useHover();
  return (
    <TouchableOpacity
      style={[s.ctaBtn, hovered && s.ctaBtnHovered, webT]}
      activeOpacity={0.8}
      onPress={onPress}
      {...webHandlers}
    >
      <Icon size={17} color={hovered ? CARD : ACCENT} style={{ marginRight: 8 }} />
      <Text style={[s.ctaBtnText, hovered && { color: CARD }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Search button (fill, darken on hover) ───────────────────

function SearchBtn() {
  const { hovered, webHandlers, webT } = useHover();
  return (
    <TouchableOpacity
      style={[s.searchBtn, hovered && { backgroundColor: ACCENT_D }, webT]}
      activeOpacity={0.85}
      {...webHandlers}
    >
      <Text style={s.searchBtnText}>検索</Text>
    </TouchableOpacity>
  );
}

// ── Hero ─────────────────────────────────────────────────────

function HeroSection() {
  const [query, setQuery] = useState('');

  return (
    <View style={s.hero}>
      <Text style={s.heroTitle}>
        {'世界にまだないデザインを作る\n他のどこにもないデザインを見つける'}
      </Text>

      <Text style={s.heroSub}>
        クリエイターとカスタマーをデザインがつなぐプラットフォーム
      </Text>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <Search size={18} color={TEXT_3} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="商品名やハッシュタグで検索"
          placeholderTextColor={TEXT_3}
          style={s.searchInput}
          returnKeyType="search"
        />
        <SearchBtn />
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
        <CtaButton label="商品を作る"  Icon={Pencil}      />
        <CtaButton label="商品を探す"  Icon={ShoppingBag} />
      </View>
    </View>
  );
}

// ── Diagram CTA buttons ──────────────────────────────────────

function DiagCtaCreator() {
  const { hovered, webHandlers, webT } = useHover();
  return (
    <TouchableOpacity
      style={[s.diagCtaCreator, hovered && { backgroundColor: ACCENT, borderColor: ACCENT }, webT]}
      activeOpacity={0.85}
      {...webHandlers}
    >
      <Text style={[s.diagCtaText, { color: hovered ? CARD : GOLD }]}>出品を始める →</Text>
    </TouchableOpacity>
  );
}

function DiagCtaCustomer() {
  const { hovered, webHandlers, webT } = useHover();
  return (
    <TouchableOpacity
      style={[s.diagCtaCustomer, hovered && { backgroundColor: SUCCESS_D, borderColor: SUCCESS_D }, webT]}
      activeOpacity={0.85}
      {...webHandlers}
    >
      <Text style={[s.diagCtaText, { color: hovered ? CARD : SUCCESS }]}>商品を探す →</Text>
    </TouchableOpacity>
  );
}

// ── How it works ─────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <View style={s.howSection}>
      <View style={s.howHeader}>
        <View style={s.sectionAccentLine} />
        <Text style={s.howTitle}>Arteとは</Text>
      </View>

      <View style={[s.diagram, isWeb && s.diagramWeb]}>

        {/* ── Creator ── */}
        <View style={[s.diagBox, s.diagCreator]}>
          <View style={[s.diagIconWrap, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <Lightbulb size={22} color="#92400E" />
          </View>
          <Text style={[s.diagRole, { color: '#92400E' }]}>Creator</Text>
          <Text style={[s.diagRoleJp, { color: '#B45309' }]}>クリエイター</Text>
          <View style={[s.diagDivider, { borderColor: '#FDE68A' }]} />
          <Text style={[s.diagMainLine, { color: '#78350F' }]}>
            世界にまだないデザインを実現してあなたの商品に。
          </Text>
          <Text style={s.diagBullet}>・デザインをアップロード。</Text>
          <Text style={s.diagBullet}>・販売価格を設定。</Text>
          <DiagCtaCreator />
        </View>

        <View style={isWeb ? s.connectorH : s.connectorV} />

        {/* ── Arte (center) ── */}
        <View style={[s.diagBox, s.diagCraft]}>
          <View style={[s.diagIconWrap, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
            <Hammer size={20} color={ACCENT} />
          </View>
          <Text style={[s.diagRole, { color: ACCENT, fontSize: 15 }]}>Arte</Text>
          <View style={[s.diagDivider, { borderColor: '#FED7AA' }]} />
          <Text style={[s.craftDesc, { color: '#9A3412' }]}>
            洗練されたレーザー彫刻・加工でデザインを実現
          </Text>
        </View>

        <View style={isWeb ? s.connectorH : s.connectorV} />

        {/* ── Customer ── */}
        <View style={[s.diagBox, s.diagCustomer]}>
          <View style={[s.diagIconWrap, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <ShoppingBag size={22} color={SUCCESS} />
          </View>
          <Text style={[s.diagRole, { color: SUCCESS }]}>Customer</Text>
          <Text style={[s.diagRoleJp, { color: '#15803D' }]}>カスタマー</Text>
          <View style={[s.diagDivider, { borderColor: '#BBF7D0' }]} />
          <Text style={[s.diagMainLine, { color: '#14532D' }]}>
            他のどこにもないデザインをあなたのものに。
          </Text>
          <Text style={s.diagBullet}>・最高のオリジナル商品を探し、購入。</Text>
          <Text style={s.diagBullet}>・レビューをクリエイターに届ける</Text>
          <DiagCtaCustomer />
        </View>

      </View>

      <Text style={s.diagramCaption}>
        クリエイターの売上はArteが自動で精算。面倒な製造・発送はすべて当社が担当します。
      </Text>
    </View>
  );
}

// ── Category card with hover ─────────────────────────────────

const CATEGORIES = [
  { id: 'all',     label: 'すべて',  emoji: '✦',  color: GOLD,      bg: '#FDF8EC' },
  { id: 'metal',   label: '金属',    emoji: '⚙️',  color: '#475569', bg: '#F1F5F9' },
  { id: 'leather', label: '革',      emoji: '🪵',  color: ACCENT,    bg: '#FFF7ED' },
  { id: 'glass',   label: 'ガラス',  emoji: '💎',  color: '#0369A1', bg: '#F0F9FF' },
];

function CategoryCard({
  cat, isActive, onPress,
}: {
  cat: typeof CATEGORIES[0];
  isActive: boolean;
  onPress: () => void;
}) {
  const { hovered, webHandlers, webT } = useHover();
  const highlighted = isActive || hovered;
  return (
    <TouchableOpacity
      style={[
        s.catCard,
        highlighted && { borderColor: cat.color, borderWidth: 2, backgroundColor: cat.bg },
        webT,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      {...webHandlers}
    >
      <View style={[s.catIconWrap, { backgroundColor: cat.bg }]}>
        <Text style={s.catEmoji}>{cat.emoji}</Text>
      </View>
      <Text style={[s.catLabel, highlighted && { color: cat.color }]}>{cat.label}</Text>
    </TouchableOpacity>
  );
}

function CategorySection() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <View style={s.catSection}>
      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <View style={s.sectionAccentBar} />
          <Text style={s.sectionTitle}>カテゴリーから探す</Text>
        </View>
      </View>
      <View style={s.catGrid}>
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            isActive={active === cat.id}
            onPress={() => setActive(active === cat.id ? null : cat.id)}
          />
        ))}
      </View>
    </View>
  );
}

// ── Pickup placeholder ───────────────────────────────────────

function PlaceholderShopBtn() {
  const { hovered, webHandlers, webT } = useHover();
  return (
    <TouchableOpacity
      style={[s.placeholderBtn, hovered && { backgroundColor: ACCENT_D }, webT]}
      activeOpacity={0.85}
      {...webHandlers}
    >
      <Search size={15} color={CARD} style={{ marginRight: 6 }} />
      <Text style={s.placeholderBtnText}>商品を探す</Text>
    </TouchableOpacity>
  );
}

function PickupSection() {
  return (
    <View style={s.pickupSection}>
      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <View style={s.sectionAccentBar} />
          <Text style={s.sectionTitle}>注目のアイテム</Text>
        </View>
      </View>

      <View style={s.placeholder}>
        <View style={s.placeholderIcon}>
          <Search size={40} color={TEXT_3} />
        </View>
        <Text style={s.placeholderTitle}>作品を検索して見つけよう</Text>
        <Text style={s.placeholderSub}>
          クリエイターたちのユニークなデザインが{'\n'}近日公開予定です。
        </Text>
        <PlaceholderShopBtn />
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

// ── Footer link with hover ────────────────────────────────────

function FooterLink({ label }: { label: string }) {
  const { hovered, webHandlers, webT } = useHover();
  return (
    <TouchableOpacity
      style={[{ marginHorizontal: 8, marginVertical: 4 }, webT]}
      {...webHandlers}
    >
      <Text style={[s.footerLink, hovered && { color: GOLD_L }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Footer() {
  return (
    <View style={s.footer}>
      <View style={s.footerLogoRow}>
        <View style={[s.logoAccent, { backgroundColor: GOLD_L }]} />
        <Text style={[s.logoText, { fontSize: 20, color: BG }]}>Arte</Text>
        <View style={[s.logoDot, { backgroundColor: GOLD_L }]} />
      </View>
      <Text style={s.footerSub}>
        クリエイターとカスタマーをデザインがつなぐプラットフォーム
      </Text>
      <View style={s.footerLinks}>
        {['利用規約', 'プライバシーポリシー', 'お問い合わせ', 'クリエイターガイド'].map((link) => (
          <FooterLink key={link} label={link} />
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
      <StatusBar style="dark" />
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
  root:          { flex: 1, backgroundColor: BG },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16,
    backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  logoRow:    { flexDirection: 'row', alignItems: 'center' },
  logoAccent: { width: 4, height: 24, backgroundColor: GOLD_L, borderRadius: 3, marginRight: 8 },
  logoText:   { color: TEXT, fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  logoDot:    { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD_L, marginLeft: 3, marginTop: 10 },
  footerLogoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userLabel:     { color: TEXT_2, fontSize: 12 },
  headerLink:    { color: TEXT_2, fontSize: 13, fontWeight: '600' },
  headerSignup:  { backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  headerSignupText: { color: CARD, fontSize: 13, fontWeight: '700' },
  logoutBtn:     { borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  logoutBtnText: { color: TEXT_2, fontSize: 12 },

  // Hero
  hero: {
    backgroundColor: BG,
    paddingHorizontal: isWeb ? 72 : 24,
    paddingTop: isWeb ? 80 : 52,
    paddingBottom: 60,
  },
  heroTitle: {
    color: TEXT,
    fontSize: isWeb ? 52 : 30,
    fontWeight: '900',
    lineHeight: isWeb ? 68 : 44,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  heroSub: {
    color: TEXT_2,
    fontSize: isWeb ? 18 : 14,
    lineHeight: 28,
    marginBottom: 36,
    maxWidth: 700,
    ...(Platform.OS === 'web' ? { whiteSpace: 'nowrap' } as any : {}),
  },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD,
    borderWidth: 1.5, borderColor: BORDER,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'web' ? 14 : 10,
    marginBottom: 12,
    maxWidth: 600,
    gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchInput: {
    flex: 1, color: TEXT, fontSize: 15,
    height: Platform.OS === 'web' ? 'auto' as any : 36,
  },
  searchBtn: {
    backgroundColor: ACCENT, borderRadius: 10,
    paddingHorizontal: 18, paddingVertical: 8,
  },
  searchBtnText: { color: CARD, fontWeight: '800', fontSize: 14 },

  // Search hints
  searchHints: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32, maxWidth: 600,
  },
  hintChip: {
    borderWidth: 1, borderColor: BORDER,
    backgroundColor: CARD,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  hintText: { color: TEXT_2, fontSize: 12 },

  // CTA
  ctaRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 14,
    alignItems: isWeb ? 'center' : 'stretch',
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: ACCENT,
    backgroundColor: 'transparent',
    paddingHorizontal: 36, paddingVertical: 17,
    borderRadius: 16, alignSelf: isWeb ? 'auto' : 'stretch',
  },
  ctaBtnHovered: { backgroundColor: ACCENT },
  ctaBtnText:    { color: ACCENT, fontSize: 16, fontWeight: '700' },

  // Section commons
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: isWeb ? 64 : 20, marginBottom: 24,
  },
  sectionTitleRow:  { flexDirection: 'row', alignItems: 'center' },
  sectionAccentBar: { width: 4, height: 22, backgroundColor: ACCENT, borderRadius: 2, marginRight: 12 },
  sectionTitle:     { color: TEXT, fontSize: isWeb ? 22 : 19, fontWeight: '800' },

  // Category
  catSection: { backgroundColor: BG_ALT, paddingTop: 48, paddingBottom: 40 },
  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    paddingHorizontal: isWeb ? 64 : 20,
  },
  catCard: {
    flex: isWeb ? undefined : 1,
    width: isWeb ? 140 : undefined,
    minWidth: 70,
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 20,
    paddingVertical: 18, paddingHorizontal: 12,
    borderWidth: 1.5, borderColor: BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  catIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  catEmoji: { fontSize: 22 },
  catLabel: { color: TEXT, fontSize: 13, fontWeight: '700' },

  // How it works
  howSection: {
    backgroundColor: BG,
    paddingTop: 56, paddingBottom: 64,
    borderTopWidth: 1, borderTopColor: BORDER,
  },
  howHeader: {
    paddingHorizontal: isWeb ? 64 : 20,
    marginBottom: 40,
  },
  sectionAccentLine: {
    width: 40, height: 3, backgroundColor: GOLD_L,
    borderRadius: 2, marginBottom: 16,
  },
  howTitle: {
    color: TEXT, fontSize: isWeb ? 28 : 22,
    fontWeight: '900', marginBottom: 8,
  },
  howSubtitle: { color: TEXT_2, fontSize: 14 },

  // Diagram
  diagram:    { paddingHorizontal: isWeb ? 24 : 16 },
  diagramWeb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  diagramCaption: {
    color: TEXT_3, fontSize: 12, textAlign: 'center',
    marginTop: 28, paddingHorizontal: isWeb ? 64 : 24, lineHeight: 18,
  },

  connectorH: { width: 56, height: 2, backgroundColor: BORDER, flexShrink: 0 },
  connectorV: { width: 2, height: 32, backgroundColor: BORDER, alignSelf: 'center' },

  diagBox: {
    borderRadius: 20, padding: 24, borderWidth: 1.5, overflow: 'hidden',
  },
  diagCreator: {
    width: isWeb ? SQ_LARGE : undefined,
    height: isWeb ? SQ_LARGE : undefined,
    backgroundColor: '#FFFBEB', borderColor: '#FDE68A',
  },
  diagCraft: {
    width: isWeb ? SQ_SMALL : undefined,
    height: isWeb ? SQ_SMALL : undefined,
    backgroundColor: '#FFF7ED', borderColor: '#FED7AA',
  },
  diagCustomer: {
    width: isWeb ? SQ_LARGE : undefined,
    height: isWeb ? SQ_LARGE : undefined,
    backgroundColor: '#F0FDF4', borderColor: '#BBF7D0',
  },

  diagIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, borderWidth: 1,
  },
  diagRole:    { fontSize: 18, fontWeight: '900', marginBottom: 2 },
  diagRoleJp:  { fontSize: 11, marginBottom: 10 },
  diagDivider: { borderTopWidth: 1, marginBottom: 12 },
  diagMainLine:{ fontSize: 12, lineHeight: 18, marginBottom: 8, fontWeight: '600' },
  diagBullet:  { color: TEXT_2, fontSize: 12, lineHeight: 19 },

  // Diagram CTA buttons (separate styles for creator vs customer)
  diagCtaCreator: {
    marginTop: 10,
    borderWidth: 1, borderColor: GOLD_L + '60',
    backgroundColor: '#FDF8EC',
    paddingVertical: 7, borderRadius: 8,
    alignItems: 'center',
  },
  diagCtaCustomer: {
    marginTop: 10,
    borderWidth: 1, borderColor: SUCCESS + '40',
    backgroundColor: SUCCESS + '12',
    paddingVertical: 7, borderRadius: 8,
    alignItems: 'center',
  },
  diagCtaText: { fontSize: 11, fontWeight: '700' },
  craftDesc:   { fontSize: 11, lineHeight: 17 },

  // Pickup
  pickupSection: { backgroundColor: BG_ALT, paddingTop: 48, paddingBottom: 64 },
  placeholder: {
    marginHorizontal: isWeb ? 64 : 20,
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderStyle: 'dashed',
  },
  placeholderIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: BG_ALT,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderTitle: { color: TEXT, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  placeholderSub: {
    color: TEXT_2, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  placeholderBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: ACCENT,
    paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12,
    marginBottom: 24,
  },
  placeholderBtnText: { color: CARD, fontWeight: '800', fontSize: 15 },
  placeholderTags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  placeholderTag: {
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  placeholderTagText: { color: TEXT_2, fontSize: 12 },

  // Footer
  footer: {
    backgroundColor: TEXT, alignItems: 'center',
    paddingVertical: 48, paddingHorizontal: 24, gap: 10,
  },
  footerSub:   { color: TEXT_3, fontSize: 13, textAlign: 'center' },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  footerLink:  { color: TEXT_3, fontSize: 12 },
  footerCopy:  { color: '#44403C', fontSize: 11, marginTop: 4 },
});
