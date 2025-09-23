# AGENTS.md

このリポジトリで Warp (warp.dev) が作業する際のガイダンスです。

### 運用ルール
- 常に日本語で回答します。
- git の commit / push は Warp は行いません。

## クイックスタート: よく使うコマンド

- 依存関係のインストール
  - npm ci

- 開発サーバーの起動（ターミナルを2つ使用）
  - ターミナルA（Next.js フロントエンド, http://localhost:3000）:
    - npm run dev
  - ターミナルB（Cloudflare Worker API, http://localhost:8787）:
    - npm run worker
    - メモ: wrangler.worker.toml は .gitignore 済みです。ローカルで Cloudflare アカウント向けの wrangler.worker.toml を用意し、D1 バインディング名 DB を定義してください（Worker は env.DB を期待します）。

- マイグレーション生成
  - スキーマ変更から新しいマイグレーションを生成:
    - npm run db:generate

- Lint と整形
  - Lint（Biome）: npm run lint
  - 自動修正/整形（Biome）: npm run biome:fix

- ビルドとデプロイ
  - Cloudflare Pages（Next on Pages）向けビルド:
    - npm run build:cf
  - フロントエンドを Cloudflare Pages へデプロイ:
    - npm run deploy:pages:dev
    - npm run deploy:pages:prod
  - Worker API を Cloudflare Workers へデプロイ:
    - npm run deploy:worker:dev
    - npm run deploy:worker:prod

- テスト
  - 現時点でテストランナーは未設定です（テストスクリプトなし）。

## アーキテクチャ（俯瞰）

- フロントエンド: Next.js 14（App Router）
  - 配置: src/app（pages, layout, globals.css）
  - UIコンポーネント: src/components, src/components/ui（Radix UI ベース, Tailwind CSS, tailwindcss-animate）
  - TypeScript, パスエイリアス @/* -> ./src/*（tsconfig.json 参照）
  - スタイリング: tailwind.config.js のCSS変数ベースのトークン

- バックエンド/API: Cloudflare Worker + Hono
  - エントリ: src/worker/index.ts（Hono, CORS, /health, /api/leagues のマウント）
  - 主なルート: src/worker/routes/leagues.ts
    - POST /api/leagues: リーグ作成、選手/台の挿入、総当たり戦の生成、admin/view URL を返却
    - GET /api/leagues/:token: admin または view トークンに応じて、リーグ詳細（players, tables, matches, standings）を返却
    - PATCH /api/leagues/:token/matches: 試合のライフサイクル更新（playing で台割り当て、completed で勝者とセット数確定、pending へリセット）
  - 環境変数/バインディング: D1 バインディング DB を必須、BASE_URL は任意（戻りURLの組み立てに使用）

- データと永続化
- ORM: Drizzle ORM。サーバー側の実行環境に合わせてスキーマを2箇所に定義（同期を維持すること）
    - src/lib/db/schema.ts（マイグレーション生成用）
    - src/worker/db/schema.ts（Worker ランタイム用）
  - マイグレーション: migrations/（現行ベースライン 0000_exotic_lucky_pierre.sql）

- フロントエンド ↔ API 連携
  - API クライアント: src/lib/api.ts がブラウザのホスト名でベースURLを選択。開発時は http://localhost:8787 を既定とするため、Worker 側を 8787 で起動しておくこと。

- 設定/規約ハイライト
  - Biome（biome.json）: 推奨ルール、タブインデント、ダブルクオート
  - Tailwind（tailwind.config.js, postcss.config.js）: class-based dark mode、カスタムブレークポイント、tailwindcss-animate
  - TypeScript（tsconfig.json）: strict, noEmit, bundler moduleResolution, @/* エイリアス
- Drizzle（drizzle.config.ts）: sqlite, スキーマ src/lib/db/schema.ts, マイグレーション ./migrations
  - .gitignore: Cloudflare wrangler 設定とローカルDBを除外。wrangler.worker.toml は各自作成が必要。

## ドメインモデル（要点）
- leagues: id, admin_token, view_token, name, description, table_count, match_format, timestamps
- players: id, league_id, name, created_at
- tables: id, league_id, table_number, status(available/occupied), current_match_id, timestamps, unique(league_id, table_number)
- matches: id, league_id, player1_id, player2_id, table_id, status(pending/playing/completed), winner_id, sets_data, sets_won_player1, sets_won_player2, timestamps
- 順位（standings）は試合結果から算出。リーグ作成時に総当たり戦（round-robin）を生成。

## 運用ノート
- 開発時は Next.js(:3000) と Worker(:8787) の2プロセスが必要。デフォルトの API クライアントは :8787 を期待。
- wrangler.worker.toml は gitignore 対象。Cloudflare D1 の DB を DB バインディングとして紐付けないと npm run worker は失敗します。
- スキーマは src/lib/db/schema.ts と src/worker/db/schema.ts の重複定義。変更時は両者を更新。
- テストスイートは未設定。

## 参照
- package.json: dev/worker/build:cf/lint/biome:fix/db:*/deploy:* スクリプト
- biome.json: Lint/Format 設定
- tsconfig.json: TS 設定とパスエイリアス
- drizzle.config.ts, migrations/: DB 設定とマイグレーション
- src/app/*: Next.js App Router ページ
- src/components/*, src/components/ui/*: UI コンポーネント
- src/lib/api.ts: API ベースURL選択とHTTPヘルパ
- src/lib/db/schema.ts: スキーマ（マイグレーション生成用）
- src/worker/index.ts, src/worker/routes/leagues.ts, src/worker/db/schema.ts: Worker エントリ、ルート、D1 スキーマ
- docs/05_technical_architecture.md: 詳細なアーキテクチャとエンドポイント概要
