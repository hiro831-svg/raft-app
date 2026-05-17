import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

// ── Constants ────────────────────────────────────────────────

const { width } = Dimensions.get('window');
const NUM_COLS  = width > 1100 ? 4 : width > 700 ? 3 : 2;
const H_PAD     = width > 700 ? 48 : 16;
const CARD_GAP  = 14;
const CARD_W    = Math.floor((width - H_PAD * 2 - CARD_GAP * (NUM_COLS - 1)) / NUM_COLS);

const BG      = '#F5F0E8';
const BG_ALT  = '#EDE8DF';
const CARD    = '#FFFFFF';
const BORDER  = '#DDD5C8';
const TEXT    = '#1C1917';
const TEXT_2  = '#57534E';
const TEXT_3  = '#A8A29E';
const ACCENT  = '#C05A00';
const ACCENT_D = '#A34E00';

// ── Product data ─────────────────────────────────────────────

type Category = '金属' | 'セラミック';

interface Product {
  id: string;
  category: Category;
  material: string;
  type: string;
  detail: string;
  cost: number;
  seed: string;
}

const PRODUCTS: Product[] = [
  { id: '1', category: '金属',     material: 'アルミニウム', type: 'プレート', detail: 'ミニプレート',       cost: 333,  seed: 'aluminium-plate-mini'  },
  { id: '2', category: '金属',     material: 'ステンレス',   type: 'カップ',  detail: 'タンブラー(250ml)', cost: 2297, seed: 'stainless-tumbler-250'  },
  { id: '3', category: '金属',     material: 'ステンレス',   type: 'カップ',  detail: 'タンブラー(350ml)', cost: 2630, seed: 'stainless-tumbler-350'  },
  { id: '4', category: '金属',     material: 'ステンレス',   type: 'カップ',  detail: 'タンブラー(430ml)', cost: 2930, seed: 'stainless-tumbler-430'  },
  { id: '5', category: 'セラミック', material: 'セラミック',  type: '食器',   detail: '深皿(白、20cm)',    cost: 495,  seed: 'ceramic-deep-plate-20' },
  { id: '6', category: 'セラミック', material: 'セラミック',  type: '食器',   detail: '深皿(白、15cm)',    cost: 495,  seed: 'ceramic-deep-plate-15' },
  { id: '7', category: 'セラミック', material: 'セラミック',  type: '食器',   detail: '平皿(白、19cm)',    cost: 495,  seed: 'ceramic-flat-plate-19' },
  { id: '8', category: 'セラミック', material: 'セラミック',  type: '食器',   detail: '平皿(白、25cm)',    cost: 495,  seed: 'ceramic-flat-plate-25' },
];

const CAT_COLORS: Record<Category, { color: string; bg: string; border: string }> = {
  '金属':     { color: '#475569', bg: '#F1F5F9', border: '#CBD5E1' },
  'セラミック': { color: '#0369A1', bg: '#F0F9FF', border: '#BAE6FD' },
};

// ── Shared hover hook ────────────────────────────────────────

function useHover() {
  const [hovered, setHovered] = useState(false);
  const webHandlers: any = Platform.OS === 'web' ? {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  } : {};
  const webT: any = Platform.OS === 'web' ? {
    transitionProperty: 'background-color, color, box-shadow',
    transitionDuration: '250ms',
    transitionTimingFunction: 'ease',
  } : {};
  return { hovered, webHandlers, webT };
}

// ── Product card ─────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const scale   = useRef(new Animated.Value(1)).current;
  const shadow  = useRef(new Animated.Value(0)).current;
  const { hovered, webHandlers: _wh } = useHover();

  const webHandlers: any = Platform.OS === 'web' ? {
    onMouseEnter: () => {
      Animated.spring(scale, { toValue: 1.07, useNativeDriver: true, friction: 7, tension: 140 }).start();
    },
    onMouseLeave: () => {
      Animated.spring(scale, { toValue: 1.0, useNativeDriver: true, friction: 7, tension: 140 }).start();
    },
  } : {};

  const catStyle = CAT_COLORS[product.category];

  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.88}
      {...webHandlers}
    >
      {/* Image with spring scale on hover */}
      <View style={s.imageWrap}>
        <Animated.View style={[s.imageInner, { transform: [{ scale }] }]}>
          <Image
            source={{ uri: `https://picsum.photos/seed/${product.seed}/400/300` }}
            style={s.productImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Category badge overlaid on image */}
        <View style={[s.catBadge, { backgroundColor: catStyle.bg, borderColor: catStyle.border }]}>
          <Text style={[s.catBadgeText, { color: catStyle.color }]}>{product.category}</Text>
        </View>
      </View>

      {/* Card content */}
      <View style={s.cardBody}>
        <Text style={s.cardType}>{product.type}</Text>
        <Text style={s.cardName} numberOfLines={2}>
          {product.material}　{product.detail}
        </Text>
        <View style={s.cardFooter}>
          <Text style={s.cardCostLabel}>ベース価格</Text>
          <Text style={s.cardCost}>¥{product.cost.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Filter chip ──────────────────────────────────────────────

function FilterChip({
  label, active, onPress, color, bg,
}: {
  label: string; active: boolean;
  onPress: () => void; color: string; bg: string;
}) {
  const { hovered, webHandlers, webT } = useHover();
  const highlighted = active || hovered;
  return (
    <TouchableOpacity
      style={[s.filterChip, highlighted && { borderColor: color, backgroundColor: bg }, webT]}
      onPress={onPress}
      activeOpacity={0.8}
      {...webHandlers}
    >
      <Text style={[s.filterChipText, highlighted && { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Screen ───────────────────────────────────────────────────

export default function CatalogScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Category | 'すべて'>('すべて');

  const filtered = activeFilter === 'すべて'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeFilter);

  const filters: Array<{ label: Category | 'すべて'; color: string; bg: string }> = [
    { label: 'すべて',    color: ACCENT,    bg: '#FFF7ED' },
    { label: '金属',      color: '#475569', bg: '#F1F5F9' },
    { label: 'セラミック', color: '#0369A1', bg: '#F0F9FF' },
  ];

  return (
    <View style={s.root}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <ArrowLeft size={20} color={TEXT} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>ベースアイテムを選ぶ</Text>
          <Text style={s.headerSub}>デザインを施す素材・アイテムを選択してください</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero band */}
        <View style={s.heroBand}>
          <View style={s.heroAccentLine} />
          <Text style={s.heroTitle}>全{PRODUCTS.length}アイテム</Text>
          <Text style={s.heroDesc}>
            Arteが彫刻・加工に対応しているベースアイテムの一覧です。{'\n'}
            選んだアイテムにあなたのデザインを刻みます。
          </Text>
        </View>

        {/* Filter row */}
        <View style={s.filterRow}>
          {filters.map((f) => (
            <FilterChip
              key={f.label}
              label={f.label}
              active={activeFilter === f.label}
              onPress={() => setActiveFilter(f.label)}
              color={f.color}
              bg={f.bg}
            />
          ))}
        </View>

        {/* Grid */}
        <View style={s.grid}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>

        {/* Footer note */}
        <Text style={s.footerNote}>
          ※ ベース価格は製造原価です。クリエイターが利益マージンを上乗せして販売価格を設定します。
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: H_PAD,
    paddingTop: 8,
    paddingBottom: 0,
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: CARD,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { color: TEXT, fontSize: 17, fontWeight: '800' },
  headerSub:    { color: TEXT_3, fontSize: 11, marginTop: 2 },

  // Hero band
  heroBand: {
    paddingVertical: 28,
    borderBottomWidth: 1, borderBottomColor: BORDER,
    marginBottom: 20,
  },
  heroAccentLine: {
    width: 36, height: 3, backgroundColor: ACCENT,
    borderRadius: 2, marginBottom: 12,
  },
  heroTitle: { color: TEXT, fontSize: 22, fontWeight: '900', marginBottom: 8 },
  heroDesc:  { color: TEXT_2, fontSize: 14, lineHeight: 22 },

  // Filters
  filterRow: {
    flexDirection: 'row', gap: 10, flexWrap: 'wrap',
    marginBottom: 24,
  },
  filterChip: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: BORDER,
    backgroundColor: CARD,
  },
  filterChipText: { color: TEXT_2, fontSize: 13, fontWeight: '600' },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: 24,
  },

  // Card
  card: {
    width: CARD_W,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  imageWrap: {
    width: CARD_W,
    height: Math.round(CARD_W * 0.7),
    overflow: 'hidden',
    position: 'relative',
  },
  imageInner: {
    width: '100%',
    height: '100%',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },

  // Category badge on image
  catBadge: {
    position: 'absolute', top: 10, left: 10,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
  },
  catBadgeText: { fontSize: 11, fontWeight: '700' },

  // Card body
  cardBody: {
    padding: 14,
  },
  cardType: {
    color: TEXT_3, fontSize: 11, fontWeight: '600',
    marginBottom: 4, letterSpacing: 0.4,
  },
  cardName: {
    color: TEXT, fontSize: 13, fontWeight: '800',
    lineHeight: 19, marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1, borderTopColor: BORDER,
  },
  cardCostLabel: { color: TEXT_3, fontSize: 11 },
  cardCost:      { color: ACCENT, fontSize: 15, fontWeight: '900' },

  footerNote: {
    color: TEXT_3, fontSize: 11, lineHeight: 17,
    textAlign: 'center', marginBottom: 8,
  },
});
