# CaseFlow — セットアップガイド

## ファイル構成

```
caseflow/
├── setup.gs   # Sheetsテンプレート自動生成スクリプト
├── api.gs     # GAS プロキシAPI（バックエンド）
└── api.js     # フロントエンド用APIクライアント
```

---

## Step 1 — Sheetsテンプレートを作成する

1. Google スプレッドシートを新規作成
2. メニュー「拡張機能」→「Apps Script」を開く
3. `setup.gs` の内容を貼り付ける
4. `setupCaseFlow()` 関数を実行
5. 7つのシートが自動生成される
6. スプレッドシートのURL から **ID** をコピーする
   - URL例: `https://docs.google.com/spreadsheets/d/【ここがID】/edit`

---

## Step 2 — GAS プロキシAPIをデプロイする

1. 同じ Apps Script プロジェクトに `api.gs` の内容を追加（新しいファイルとして）
2. `api.gs` の1行目 `YOUR_SPREADSHEET_ID` を Step 1 でコピーした ID に変更
3. メニュー「デプロイ」→「新しいデプロイ」
4. 種類: **ウェブアプリ**
5. 設定:
   - 説明: CaseFlow API
   - 次のユーザーとして実行: **自分**
   - アクセスできるユーザー: **組織内の全員**（Google Workspace の場合）
6. デプロイ → **WebアプリのURL** をコピー

---

## Step 3 — フロントエンドと接続する

1. `api.js` の1行目 `YOUR_GAS_WEBAPP_URL` を Step 2 でコピーした URL に変更
2. GitHub リポジトリの `src/api.js` として配置
3. 各画面コンポーネントから import して使用する

```js
import { CaseAPI, DashboardAPI, Session } from './api.js';

// ダッシュボードデータ取得
const user = Session.load();
const dashboard = await DashboardAPI.get(user.user_id);

// 案件一覧取得
const cases = await CaseAPI.getAll();

// 案件更新
await CaseAPI.setStatus('K001', '対応中');
```

---

## API エンドポイント一覧

### ユーザー
| action | 方式 | 説明 |
|--------|------|------|
| getUsers | GET | 全有効ユーザー取得 |
| addUser | POST | ユーザー追加 |
| updateUser | POST | ユーザー更新（権限・無効化） |

### 顧客
| action | 方式 | 説明 |
|--------|------|------|
| getCustomers | GET | 全顧客取得 |
| addCustomer | POST | 顧客追加 |
| updateCustomer | POST | 顧客更新 |

### 案件
| action | 方式 | パラメータ | 説明 |
|--------|------|-----------|------|
| getCases | GET | user_id?, status?, overdue? | 案件一覧（フィルタ可） |
| getCase | GET | case_id | 案件1件取得 |
| addCase | POST | - | 案件登録 |
| updateCase | POST | - | 案件更新 |

### 日報ログ
| action | 方式 | パラメータ | 説明 |
|--------|------|-----------|------|
| getLogs | GET | case_id | 日報一覧（新しい順） |
| addLog | POST | - | 日報追加 |

### 課題
| action | 方式 | パラメータ | 説明 |
|--------|------|-----------|------|
| getIssues | GET | case_id, filter(open/all) | 課題一覧 |
| addIssue | POST | - | 課題追加 |
| updateIssue | POST | - | 課題更新 |

### 引き継ぎ
| action | 方式 | パラメータ | 説明 |
|--------|------|-----------|------|
| getHandoff | GET | case_id | 引き継ぎサマリー取得 |
| saveHandoff | POST | - | 保存（新規or上書き） |

### ダッシュボード
| action | 方式 | パラメータ | 説明 |
|--------|------|-----------|------|
| getDashboard | GET | user_id? | 集計データ一括取得 |

---

## 注意事項

- GAS WebApp は **キャッシュ** が効く場合があります。データが古い場合は再デプロイしてください
- `is_admin: true` のユーザーのみ管理者メニューが表示されます
- パスワード認証なしのため、**社内ネットワーク限定** での利用を推奨します
- Sheets API のレート制限（100リクエスト/100秒）に注意してください
