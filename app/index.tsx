import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import type { Session } from '@supabase/supabase-js';
import { supabase, checkConnection, type ConnectionStatus } from '../src/lib/supabase';

const { width } = Dimensions.get('window');
const isWeb = width > 600;

// ── Mock data ────────────────────────────────────────────────
const PICKUP_IDEAS = [
  {
    id: '1',
    title: 'ヴィンテージ風レザーウォレット',
    seller: 'craftsman_kenji',
    price: 4800,
    material: '革',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    tags: ['財布', 'ヴィンテージ'],
  },
  {
    id: '2',
    title: '真鍮製イニシャルキーホルダー',
    seller: 'metal_artisan',
    price: 3200,
    material: '金属',
    image: 'https://images.unsplash.com/photo-1611010344444-5f9e4d86a6c8?w=400&q=80',
    tags: ['真鍮', 'キーホルダー'],
  },
  {
    id: '3',
    title: 'ハンドステッチ名刺入れ',
    seller: 'leather_works',
    price: 5500,
    material: '革',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
    tags: ['名刺入れ', '手縫い'],
  },
  {
    id: '4',
    title: 'スチールカービング表札',
    seller: 'forge_studio',
    price: 12000,
    material: '金属',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    tags: ['表札', '彫刻'],
  },
  {
    id: '5',
    title: 'レザーブックカバー（文庫版）',
    seller: 'craftsman_kenji',
    price: 3800,
    material: '革',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80',
    tags: ['本', 'ブックカバー'],
  },
  {
    id: '6',
    title: '銅板エッチングアート',
    seller: 'copper_lab',
    price: 8900,
    material: '金属',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    tags: ['銅', 'アート'],
  },
];

const MATERIAL_COLOR: Record<string, string> = {
  '革':   '#C05A00',
  '金属': '#57534E',
};

// ── Sub-components ───────────────────────────────────────────

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

function HeroSection({ onOrder }: { onOrder: () => void }) {
  return (
    <View style={s.hero}>
      {/* Background texture overlay */}
      <View style={s.heroOverlay} />

      <View style={s.heroContent}>
        <Text style={s.heroEyebrow}>CRAFTSMANSHIP × CREATIVITY</Text>
        <Text style={s.heroTitle}>
          職人の手仕事と{'\n'}あなたのアイデアを{'\n'}つなぐ
        </Text>
        <Text style={s.heroSub}>
          革・金属加工の職人に直接依頼。{'\n'}あなただけの一点ものを作ろう。
        </Text>

        <View style={s.heroBtns}>
          <TouchableOpacity style={s.primaryBtn} onPress={onOrder} activeOpacity={0.85}>
            <Text style={s.primaryBtnText}>加工を依頼する</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.outlineBtn} activeOpacity={0.85}>
            <Text style={s.outlineBtnText}>アイデアを見る</Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            { value: '1,200+', label: '職人' },
            { value: '8,500+', label: '作品' },
            { value: '4.9',    label: '平均評価' },
          ].map((stat) => (
            <View key={stat.label} style={s.statItem}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function IdeaCard({ idea }: { idea: typeof PICKUP_IDEAS[number] }) {
  const [imgError, setImgError] = useState(false);

  return (
    <TouchableOpacity style={s.card} activeOpacity={0.88}>
      {/* Image */}
      <View style={s.cardImgWrap}>
        {!imgError ? (
          <Image
            source={{ uri: idea.image }}
            style={s.cardImg}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={[s.cardImg, s.cardImgPlaceholder]}>
            <Text style={s.cardImgPlaceholderText}>✦</Text>
          </View>
        )}
        {/* Material badge */}
        <View style={[s.materialBadge, { backgroundColor: MATERIAL_COLOR[idea.material] ?? '#57534E' }]}>
          <Text style={s.materialBadgeText}>{idea.material}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={s.cardBody}>
        <Text style={s.cardTitle} numberOfLines={2}>{idea.title}</Text>
        <Text style={s.cardSeller}>by {idea.seller}</Text>

        <View style={s.cardFooter}>
          <Text style={s.cardPrice}>¥{idea.price.toLocaleString()}</Text>
          <TouchableOpacity style={s.cardOrderBtn} activeOpacity={0.8}>
            <Text style={s.cardOrderBtnText}>依頼</Text>
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={s.tagRow}>
          {idea.tags.map((tag) => (
            <View key={tag} style={s.tag}>
              <Text style={s.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PickupSection() {
  const cardWidth = isWeb ? Math.min(280, (width - 80) / 3) : width - 48;

  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <View style={s.sectionAccent} />
          <Text style={s.sectionTitle}>ピックアップ アイデア</Text>
        </View>
        <TouchableOpacity>
          <Text style={s.sectionMore}>すべて見る →</Text>
        </TouchableOpacity>
      </View>

      <View style={[s.cardGrid, isWeb && s.cardGridWeb]}>
        {PICKUP_IDEAS.map((idea) => (
          <View key={idea.id} style={[s.cardWrapper, isWeb && { width: cardWidth }]}>
            <IdeaCard idea={idea} />
          </View>
        ))}
      </View>
    </View>
  );
}

function FeatureStrip() {
  const features = [
    { icon: '🔨', title: '職人に直接依頼',  desc: '熟練した職人に\n直接オーダーメイド' },
    { icon: '💡', title: 'アイデアを売買',   desc: 'あなたのデザインを\n販売・共有できる' },
    { icon: '⭐', title: '品質保証',         desc: '完成品に満足できなければ\n全額返金対応' },
  ];
  return (
    <View style={s.featureStrip}>
      {features.map((f) => (
        <View key={f.title} style={s.featureItem}>
          <Text style={s.featureIcon}>{f.icon}</Text>
          <Text style={s.featureTitle}>{f.title}</Text>
          <Text style={s.featureDesc}>{f.desc}</Text>
        </View>
      ))}
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer}>
      <Text style={s.footerLogo}>CraftShare</Text>
      <Text style={s.footerSub}>職人の技とあなたのアイデアをつなぐプラットフォーム</Text>
      <Text style={s.footerCopy}>© 2025 CraftShare. All rights reserved.</Text>
    </View>
  );
}

// ── Connection status banner ─────────────────────────────────

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
    <View style={[sb.bar, { backgroundColor: bg }]}>
      {status === 'checking' && (
        <ActivityIndicator size="small" color="#D6D3D1" style={{ marginRight: 8 }} />
      )}
      {icon && <Text style={[sb.icon, { color }]}>{icon}</Text>}
      <Text style={[sb.text, { color }]}>{message}</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  bar:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  icon: { fontSize: 13, fontWeight: '700', marginRight: 7 },
  text: { fontSize: 13 },
});

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
        <HeroSection onOrder={() => {}} />
        <FeatureStrip />
        <PickupSection />
        <Footer />
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────

const BROWN  = '#1A0A00';
const BROWN2 = '#3A1500';
const BROWN3 = '#C05A00';
const GOLD   = '#D4A017';
const GOLD_L = '#FFD966';
const CREAM  = '#FFF8F0';
const GRAY   = '#78716C';
const GRAY_L = '#E7E5E4';
const WHITE  = '#FFFFFF';

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BROWN },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: BROWN,
    borderBottomWidth: 1,
    borderBottomColor: BROWN2,
  },
  logoRow:   { flexDirection: 'row', alignItems: 'center' },
  logoMark:  { width: 8, height: 24, backgroundColor: GOLD, borderRadius: 2, marginRight: 10 },
  logoText:  { color: GOLD_L, fontSize: 22, fontWeight: '700', letterSpacing: 2 },
  headerRight:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userEmail:      { color: GOLD_L, fontSize: 12, maxWidth: 100 },
  loginBtn:       { borderWidth: 1, borderColor: GOLD, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  loginBtnText:   { color: GOLD, fontSize: 13, fontWeight: '600' },
  logoutBtn:      { backgroundColor: 'rgba(212,160,23,0.15)', borderWidth: 1, borderColor: GOLD, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  logoutBtnText:  { color: GOLD, fontSize: 12, fontWeight: '600' },

  // Hero
  hero:        { backgroundColor: BROWN, paddingBottom: 48 },
  heroOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  heroContent: { paddingHorizontal: isWeb ? 64 : 28, paddingTop: isWeb ? 72 : 48 },
  heroEyebrow: { color: GOLD, fontSize: 11, fontWeight: '700', letterSpacing: 4, marginBottom: 16 },
  heroTitle:   {
    color: WHITE,
    fontSize: isWeb ? 52 : 34,
    fontWeight: '800',
    lineHeight: isWeb ? 68 : 46,
    marginBottom: 20,
  },
  heroSub:  { color: '#D6D3D1', fontSize: isWeb ? 18 : 15, lineHeight: 26, marginBottom: 36 },
  heroBtns: { flexDirection: isWeb ? 'row' : 'column', gap: 12, marginBottom: 48 },
  primaryBtn: {
    backgroundColor: GOLD,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  primaryBtnText: { color: BROWN, fontSize: 16, fontWeight: '700' },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  outlineBtnText: { color: WHITE, fontSize: 16, fontWeight: '600' },

  // Stats
  statsRow:  { flexDirection: 'row', gap: isWeb ? 48 : 32, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  statItem:  { alignItems: 'flex-start' },
  statValue: { color: GOLD_L, fontSize: isWeb ? 28 : 22, fontWeight: '800' },
  statLabel: { color: '#A8A29E', fontSize: 12, marginTop: 2 },

  // Feature strip
  featureStrip: {
    flexDirection: isWeb ? 'row' : 'column',
    backgroundColor: BROWN2,
    paddingVertical: 36,
    paddingHorizontal: isWeb ? 64 : 24,
    gap: isWeb ? 0 : 28,
  },
  featureItem: { flex: isWeb ? 1 : undefined, alignItems: 'center', paddingHorizontal: isWeb ? 24 : 0 },
  featureIcon:  { fontSize: 32, marginBottom: 12 },
  featureTitle: { color: GOLD_L, fontSize: 15, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  featureDesc:  { color: '#A8A29E', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Pickup section
  section: { backgroundColor: CREAM, paddingTop: 48, paddingBottom: 56 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isWeb ? 64 : 24,
    marginBottom: 28,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionAccent:   { width: 4, height: 24, backgroundColor: BROWN3, borderRadius: 2, marginRight: 12 },
  sectionTitle:    { color: BROWN, fontSize: isWeb ? 24 : 20, fontWeight: '800' },
  sectionMore:     { color: BROWN3, fontSize: 14, fontWeight: '600' },
  cardGrid:        { paddingHorizontal: isWeb ? 64 : 16, gap: 20 },
  cardGridWeb:     { flexDirection: 'row', flexWrap: 'wrap' },
  cardWrapper:     { marginBottom: 4 },

  // Card
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: BROWN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  cardImgWrap:         { width: '100%', height: 200, position: 'relative' },
  cardImg:             { width: '100%', height: '100%' },
  cardImgPlaceholder:  { backgroundColor: '#E7E5E4', alignItems: 'center', justifyContent: 'center' },
  cardImgPlaceholderText: { fontSize: 40, color: '#A8A29E' },
  materialBadge: {
    position: 'absolute', top: 12, left: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  materialBadgeText: { color: WHITE, fontSize: 11, fontWeight: '700' },
  cardBody:      { padding: 16 },
  cardTitle:     { color: '#1C1917', fontSize: 15, fontWeight: '700', lineHeight: 22, marginBottom: 4 },
  cardSeller:    { color: GRAY, fontSize: 12, marginBottom: 12 },
  cardFooter:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardPrice:     { color: BROWN3, fontSize: 18, fontWeight: '800' },
  cardOrderBtn:  { backgroundColor: BROWN3, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  cardOrderBtnText: { color: WHITE, fontSize: 12, fontWeight: '700' },
  tagRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:           { backgroundColor: '#F5F5F4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText:       { color: GRAY, fontSize: 11 },

  // Footer
  footer: {
    backgroundColor: BROWN,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 8,
  },
  footerLogo: { color: GOLD_L, fontSize: 20, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  footerSub:  { color: '#78716C', fontSize: 13, textAlign: 'center' },
  footerCopy: { color: '#44403C', fontSize: 11, marginTop: 8 },
});
