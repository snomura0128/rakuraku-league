# 技術アーキテクチャ

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UI コンポーネント**: Headless UI または Radix UI
- **状態管理**: React Server Components + useState/useReducer
- **フォーム**: React Hook Form + Zod

### バックエンド
- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Next.js API Routes (Edge Runtime)
- **言語**: TypeScript
- **データベース**: Cloudflare D1 (SQLite)
- **ORM/クエリビルダー**: Drizzle ORM

### インフラ・デプロイ
- **ホスティング**: Cloudflare Pages
- **データベース**: Cloudflare D1
- **CDN**: Cloudflare CDN（自動）
- **ドメイン**: Cloudflare DNS
- **SSL**: Cloudflare SSL（自動）

### 開発ツール
- **パッケージマネージャー**: npm または pnpm
- **バージョン管理**: Git + GitHub
- **CI/CD**: GitHub Actions + Cloudflare Pages
- **リンター**: Biome
- **型チェック**: TypeScript

### 共有機能
- **Web Share API**: ブラウザのネイティブ共有機能
- **クリップボードAPI**: URLコピー機能
- **カスタム共有**: LINE、メール等の直接リンク生成

## アーキテクチャ概要

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Device   │───▶│ Cloudflare CDN  │───▶│ Cloudflare Pages│
│   (Browser)     │    │                 │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Cloudflare      │
                                               │ Workers         │
                                               │ (API Routes)    │
                                               └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Cloudflare D1   │
                                               │ (SQLite)        │
                                               └─────────────────┘
```

## データベース設計

### テーブル構成

```sql
-- leagues テーブル（リーグ戦）
CREATE TABLE leagues (
  id TEXT PRIMARY KEY,
  admin_token TEXT NOT NULL UNIQUE, -- 編集可能URL用トークン
  view_token TEXT NOT NULL UNIQUE,  -- 閲覧専用URL用トークン
  name TEXT NOT NULL,
  description TEXT,
  table_count INTEGER NOT NULL DEFAULT 2, -- 台数
  match_format TEXT NOT NULL DEFAULT '3_game', -- 試合形式: 1_game | 3_game | 5_game
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- players テーブル（参加者）
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- tables テーブル（台）
CREATE TABLE tables (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL, -- 台番号
  status TEXT NOT NULL DEFAULT 'available', -- available | occupied
  current_match_id TEXT REFERENCES matches(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(league_id, table_number)
);

-- matches テーブル（試合）
CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  player1_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player2_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  table_id TEXT REFERENCES tables(id), -- 使用台
  status TEXT NOT NULL DEFAULT 'pending', -- pending | playing | completed
  winner_id TEXT REFERENCES players(id),
  sets_data TEXT, -- JSON形式でセットスコア詳細を保存（任意): [{"p1_score":11,"p2_score":9}, ...]
  sets_won_player1 INTEGER DEFAULT 0, -- プレイヤー1の獲得セット数
  sets_won_player2 INTEGER DEFAULT 0, -- プレイヤー2の獲得セット数
  input_by TEXT,
  started_at TEXT,    -- 試合開始時刻
  completed_at TEXT,  -- 試合終了時刻
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_players_league_id ON players(league_id);
CREATE INDEX idx_tables_league_id ON tables(league_id);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_matches_league_id ON matches(league_id);
CREATE INDEX idx_matches_players ON matches(player1_id, player2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_table_id ON matches(table_id);
CREATE INDEX idx_leagues_admin_token ON leagues(admin_token);
CREATE INDEX idx_leagues_view_token ON leagues(view_token);
```

## API 設計

### エンドポイント構成

```
/api/
├── leagues/
│   ├── POST /              # リーグ戦作成
│   ├── [token]/            # admin_token または view_token でアクセス
│   │   ├── GET /           # リーグ戦詳細取得（権限に応じた情報）
│   │   ├── PUT /           # リーグ戦更新（admin_tokenのみ）
│   │   ├── players/
│   │   │   ├── POST /      # 参加者追加（admin_tokenのみ）
│   │   │   └── [playerId]/
│   │   │       └── DELETE / # 参加者削除（admin_tokenのみ）
│   │   ├── tables/
│   │   │   ├── GET /       # 台一覧取得
│   │   │   └── PUT /       # 台数更新（admin_tokenのみ）
│   │   ├── matches/
│   │   │   ├── GET /       # 試合一覧取得
│   │   │   └── POST /      # 試合開始（admin_tokenのみ）
│   │   ├── standings/
│   │   │   └── GET /       # 順位表取得
│   │   └── matrix/
│   │       └── GET /       # マトリクス表取得
├── matches/
│   └── [id]/
│       ├── PUT /           # 試合結果更新（admin_tokenのみ）
│       └── DELETE /        # 試合中止（admin_tokenのみ）
└── tables/
    └── [id]/
        └── PUT /           # 台状態更新（admin_tokenのみ）
```

### レスポンス形式

```typescript
// 共通レスポンス型
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// リーグ戦詳細
type LeagueDetail = {
  id: string;
  name: string;
  description?: string;
  table_count: number;      // 台数
  match_format: '1_game' | '3_game' | '5_game'; // 試合形式
  players: Player[];
  matches: Match[];
  tables: Table[];          // 台一覧
  created_at: string;
  updated_at: string;
  // 権限情報
  is_admin: boolean;        // admin_tokenでアクセスしているか
  admin_url?: string;       // 編集可能URL（admin権限の場合のみ）
  view_url?: string;        // 閲覧専用URL
};

// 順位表
type Standing = {
  rank: number;
  player: Player;
  wins: number;
  losses: number;
  matches_played: number;
  win_rate: number;
};

// 権限チェック用の型
type AccessLevel = 'admin' | 'view';

// トークン検証用の型
type TokenValidation = {
  league_id: string;
  access_level: AccessLevel;
  is_valid: boolean;
};

// 台の型
type Table = {
  id: string;
  league_id: string;
  table_number: number;
  status: 'available' | 'occupied';
  current_match_id?: string;
  current_players?: string[];  // 現在使用中のプレイヤー名
  started_at?: string;         // 使用開始時刻
  created_at: string;
  updated_at: string;
};

// セットスコアの型
type SetScore = {
  p1_score: number;
  p2_score: number;
};

// 試合の型（拡張版）
type Match = {
  id: string;
  league_id: string;
  player1_id: string;
  player2_id: string;
  table_id?: string;
  status: 'pending' | 'playing' | 'completed';
  winner_id?: string;
  sets_data?: SetScore[]; // 各セットのスコア詳細（任意）
  sets_won_player1: number; // プレイヤー1の獲得セット数
  sets_won_player2: number; // プレイヤー2の獲得セット数
  input_by?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
};
```

## フロントエンド設計

### ページ構成

```
/
├── page.tsx                 # トップページ
├── create/
│   └── page.tsx            # リーグ戦作成ページ
├── league/
│   └── [token]/            # admin_token または view_token
│       ├── page.tsx        # リーグ戦メインページ
│       ├── input/
│       │   └── page.tsx    # 結果入力ページ（admin権限のみ）
│       └── settings/
│           └── page.tsx    # 設定ページ（admin権限のみ）
└── api/                    # API Routes
```

### コンポーネント設計

```
components/
├── ui/                     # 基本UIコンポーネント
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Table.tsx
│   └── Modal.tsx
├── league/                 # リーグ戦関連コンポーネント
│   ├── CreateForm.tsx
│   ├── MatchMatrix.tsx      # インタラクティブマトリクス表
│   ├── StandingsTable.tsx
│   ├── TableList.tsx        # 台一覧コンポーネント
│   ├── TableSelector.tsx    # 台選択ダイアログ
│   ├── ResultInputModal.tsx # 結果入力モーダル
│   └── ShareUrls.tsx        # URL共有コンポーネント
└── layout/                 # レイアウトコンポーネント
    ├── Header.tsx
    ├── Footer.tsx
    └── Navigation.tsx
```

## セキュリティ考慮事項

### データアクセス制御
- **トークンベース認証**: admin_token/view_tokenによる権限管理
- **権限レベル分離**: 編集権限と閲覧権限の明確な分離
- **CSRF 対策**: Next.js の組み込み CSRF 保護を使用
- **XSS 対策**: React の自動エスケープ機能を活用

### データ保護
- **入力検証**: Zod による厳密な型検証
- **SQL インジェクション対策**: Drizzle ORM のクエリビルダー使用
- **レート制限**: Cloudflare の標準機能を活用
- **トークン管理**: 暗号学的に安全なランダムトークン生成
- **権限チェック**: 各API呼び出し時の権限検証

## パフォーマンス最適化

### フロントエンド最適化
- **Server Components**: サーバーサイドレンダリングの活用
- **Dynamic Import**: 必要な時にコンポーネントを読み込み
- **Image Optimization**: Next.js Image コンポーネントの使用
- **Bundle Splitting**: ページ毎の自動バンドル分割

### バックエンド最適化
- **Edge Computing**: Cloudflare Workers による低レイテンシ
- **データベースインデックス**: 効率的なクエリのためのインデックス
- **キャッシュ戦略**: Static Site Generation + ISR の活用

## 監視・運用

### ログ・監視
- **Cloudflare Analytics**: アクセス解析
- **Workers Analytics**: API パフォーマンス監視
- **Real User Monitoring**: 実際のユーザー体験測定

### デプロイメント
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/pages-action@v1
```

## 開発環境構築

### 必要なツール
- Node.js 18+
- npm または pnpm
- Git
- Cloudflare アカウント
- Wrangler CLI

### セットアップ手順
```bash
# プロジェクト初期化
npx create-next-app@latest rakuraku-league --typescript --tailwind --app

# Cloudflare関連パッケージ
npm install @cloudflare/next-on-pages drizzle-orm @cloudflare/d1

# 開発ツール
npm install -D wrangler drizzle-kit
```