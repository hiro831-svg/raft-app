# CraftShare

**革・金属加工の受注＆アイデアマーケットプレイス**

> 職人の手仕事とあなたのアイデアをつなぐプラットフォーム

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React Native (Expo) + TypeScript |
| スタイリング | NativeWind (Tailwind CSS) |
| バックエンド / DB | Supabase (Auth, PostgreSQL, Storage) |
| 決済 | Stripe API (テストモード) |

---

## 機能一覧 (MVP)

- **ユーザー認証** — Supabase Auth による会員登録・ログイン
- **加工依頼フォーム** — 画像・テキストのアップロード、素材選択（革 / 金属）、Stripe 決済
- **C2Cマーケットプレイス** — デザインアイデアの出品・購入・依頼
- **お気に入り** — アイデアのブックマーク機能
- **レビュー** — 注文完了後の評価投稿
- **注文ステータス管理** — 受付 → 受注確認 → 製作中 → 発送済み → 配達完了

---

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を開いて以下を設定してください：

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 3. Supabase スキーマの適用

Supabase ダッシュボードの SQL エディタで `supabase/schema.sql` を実行してください。

### 4. アプリの起動

```bash
# 開発サーバー起動
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

---

## ディレクトリ構成

```
craftshare/
├── App.tsx                          # エントリーポイント
├── app.json                         # Expo 設定
├── tailwind.config.js               # テーマカラー定義
├── supabase/
│   └── schema.sql                   # DB スキーマ (RLS 含む)
└── src/
    ├── constants/
    │   └── theme.ts                 # カラー・ラベル定数
    ├── lib/
    │   ├── supabase.ts              # Supabase クライアント & DB ヘルパー
    │   ├── stripe.ts                # Stripe 決済フック
    │   └── types.ts                 # 型定義
    ├── hooks/
    │   ├── useAuth.ts               # 認証状態フック
    │   └── useMarketplace.ts        # マーケットプレイス データフック
    ├── navigation/
    │   └── AppNavigator.tsx         # ルーティング (認証ゲート込み)
    ├── components/
    │   ├── common/                  # 汎用コンポーネント
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Input.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   └── RatingStars.tsx
    │   ├── marketplace/
    │   │   └── IdeaCard.tsx         # アイデアカード
    │   └── orders/
    │       ├── OrderCard.tsx        # 注文カード
    │       └── OrderStatusBadge.tsx # ステータスバッジ
    └── screens/
        ├── auth/
        │   ├── LoginScreen.tsx
        │   └── RegisterScreen.tsx
        ├── HomeScreen.tsx
        ├── MarketplaceScreen.tsx
        ├── OrderFormScreen.tsx
        ├── CreateIdeaScreen.tsx
        ├── ProfileScreen.tsx
        └── AdminDashboardScreen.tsx
```

---

## データベース設計

```
profiles          — ユーザープロフィール (auth.users に連携)
ideas             — C2Cアイデア出品
orders            — 加工依頼注文
favorites         — お気に入り
reviews           — レビュー
idea_purchases    — アイデア購入履歴
```

全テーブルに Row Level Security (RLS) を適用済み。

---

## ライセンス

MIT
