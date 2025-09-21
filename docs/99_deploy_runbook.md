# デプロイ/運用ランブック（Local / Dev / Prod）

このドキュメントは、今回整備した Local（Miniflare）, Dev, Prod 向けのセットアップとデプロイ手順を、実行コマンド中心にまとめたものです。

## 前提
- アカウント確認
```bash path=null start=null
wrangler whoami
```
- wrangler 設定ファイル
  - wrangler.worker.toml（local/dev/prod の3環境を定義）
  - D1 バインディング名は DB で統一
- API（Worker）エントリ: src/worker/index.ts（Hono）
- フロント（Next on Pages）: npm run build:cf で .vercel/output を生成

---

## Local（Miniflare）
- D1 マイグレーション（初回またはスキーマ更新時）
```bash path=null start=null
wrangler d1 migrations apply rakuraku-league-local-db \
  --local \
  --config wrangler.worker.toml
```
- Worker 起動（API: http://localhost:8787）
```bash path=null start=null
npm run worker
```
- フロント起動（Next.js: http://localhost:3000）
```bash path=null start=null
npm run dev
```
- 動作確認（任意）
```bash path=null start=null
# ヘルスチェック
curl -sS http://localhost:8787/health

# リーグ作成（例）
curl -sS -X POST http://localhost:8787/api/leagues \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"ローカル動作確認",
    "description":"debug",
    "table_count":2,
    "match_format":"3_game",
    "participants":["A","B","C"]
  }'

# 返却された admin_url の末尾トークンで取得
curl -sS http://localhost:8787/api/leagues/<admin_token>
```

メモ:
- Local では BASE_URL を設定していないため、返却URLはリクエスト Origin（http://localhost:3000）を採用。
- Local の D1 実体は .wrangler/state/ 配下に保存。

---

## Dev（Cloudflare）
1) D1 を新規作成（今回の新規DB名とIDの例）
```bash path=null start=null
wrangler d1 create rakuraku-league-dev-db-new \
  --env dev \
  --config wrangler.worker.toml
# => database_name: rakuraku-league-dev-db-new
# => database_id: 8db32570-cfd8-4892-8370-c670ccb9d7fb（wrangler.worker.toml に反映済み）
```
2) マイグレーション適用（ローカル実行 or リモート実行の両方を例示）
```bash path=null start=null
# ローカル実行コンテキスト経由で適用
wrangler d1 migrations apply rakuraku-league-dev-db-new \
  --env dev \
  --config wrangler.worker.toml

# 直接リモートに適用
wrangler d1 migrations apply rakuraku-league-dev-db-new \
  --env dev \
  --remote \
  --config wrangler.worker.toml
```
3) Pages プロジェクト作成とデプロイ
```bash path=null start=null
# プロジェクト作成
wrangler pages project create rakuraku-league-dev-pages --production-branch main

# Next on Pages ビルド
npm run build:cf

# デプロイ
wrangler pages deploy .vercel/output/static \
  --project-name rakuraku-league-dev-pages
```
4) Worker の BASE_URL を dev Pages ドメインへ設定し、再デプロイ
- wrangler.worker.toml（一例）
```toml path=null start=null
[env.dev.vars]
ENVIRONMENT = "dev"
BASE_URL = "https://dev.rakuraku-league-dev-pages.pages.dev"
```
- デプロイ
```bash path=null start=null
wrangler deploy --env dev --config wrangler.worker.toml
```
5) 動作確認（任意）
```bash path=null start=null
# API ヘルス
curl -sS https://rakuraku-league-api-dev.tomra-3104.workers.dev/health

# 作成→返却URL（BASE_URL=dev Pages ドメイン）
curl -sS -X POST https://rakuraku-league-api-dev.tomra-3104.workers.dev/api/leagues \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"dev動作確認",
    "description":"debug",
    "table_count":2,
    "match_format":"3_game",
    "participants":["A","B","C"]
  }'
```

---

## Prod（Cloudflare）
1) D1 を新規作成（今回の新規DB名とIDの例）
```bash path=null start=null
wrangler d1 create rakuraku-league-prod-db-new \
  --env production \
  --config wrangler.worker.toml
# => database_name: rakuraku-league-prod-db-new
# => database_id: 259353d0-df1b-41a5-8efc-46b973fb6bd7（wrangler.worker.toml に反映済み）
```
2) マイグレーションをリモート適用
```bash path=null start=null
wrangler d1 migrations apply rakuraku-league-prod-db-new \
  --env production \
  --remote \
  --config wrangler.worker.toml
```
3) Pages プロジェクト作成とデプロイ
```bash path=null start=null
# プロジェクト作成
wrangler pages project create rakuraku-league-prod-pages --production-branch main

# Next on Pages ビルド
npm run build:cf

# デプロイ（main ブランチ/dirty 許可の例）
wrangler pages deploy .vercel/output/static \
  --project-name rakuraku-league-prod-pages \
  --branch main \
  --commit-dirty=true
```
4) Worker の BASE_URL を prod Pages ドメインへ設定し、デプロイ
- wrangler.worker.toml（一例）
```toml path=null start=null
[env.production.vars]
ENVIRONMENT = "production"
BASE_URL = "https://rakuraku-league-prod-pages.pages.dev"
```
- デプロイ
```bash path=null start=null
wrangler deploy --env production --config wrangler.worker.toml
```
5) 動作確認（任意）
```bash path=null start=null
# API ヘルス
curl -sS https://rakuraku-league-api-prod.tomra-3104.workers.dev/health

# 作成（返却URLは prod Pages ドメイン）
curl -sS -X POST https://rakuraku-league-api-prod.tomra-3104.workers.dev/api/leagues \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"prod動作確認",
    "description":"debug",
    "table_count":2,
    "match_format":"3_game",
    "participants":["A","B","C"]
  }'
```

---

## トラブルシュート
- ダッシュボードに Worker/Pages が表示されない
  - ダッシュボード右上のアカウントを、`wrangler whoami` の Account ID（例: 9d1c157176e20fe8c39e9ce0fd28c171）に切り替え。
- D1 のマイグレーションで table already exists
  - 既に適用済み。不要ならテーブルを DROP し直して再適用。
- Local の返却URLが Worker 側（:8787）になる
  - Local では BASE_URL を未設定とし、Origin（:3000）を使うのが推奨。
- Dev/Prod の返却URLを Pages に揃えたい
  - wrangler.worker.toml の BASE_URL を各環境の Pages ドメインに設定し、Worker を再デプロイ。

---

## 参考
- Worker（dev）
  - https://rakuraku-league-api-dev.tomra-3104.workers.dev
- Pages（dev）
  - https://dev.rakuraku-league-dev-pages.pages.dev
- Worker（prod）
  - https://rakuraku-league-api-prod.tomra-3104.workers.dev
- Pages（prod）
  - https://rakuraku-league-prod-pages.pages.dev
