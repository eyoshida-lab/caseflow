// CaseFlow — フロントエンド API クライアント
// GitHub Pages の src/api.js として配置する
// GAS WebApp の URL を GAS_URL に設定する

const GAS_URL = 'https://script.google.com/a/macros/open.co.jp/s/AKfycbxUBMofkV2tphDfvhEmWQ3Ly9ByUugP_IgK2t-mYvWz9WJH90DqBBpvnUfzb_ZHqv5NAQ/exec';

// =============================
// 低レベルリクエスト
// =============================
async function gasGet(action, params = {}) {
  const query = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${GAS_URL}?${query}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API Error');
  return json.data;
}

async function gasPost(action, body = {}) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API Error');
  return json;
}

// =============================
// ユーザー
// =============================
export const UserAPI = {
  // 全有効ユーザー取得（ログイン画面で使用）
  getAll: () => gasGet('getUsers'),

  // ユーザー追加（管理者画面）
  add: (data) => gasPost('addUser', data),

  // ユーザー更新（権限変更・無効化）
  update: (data) => gasPost('updateUser', data),

  // 無効化ショートカット
  deactivate: (userId) => gasPost('updateUser', { user_id: userId, is_active: false }),

  // 管理者フラグ変更
  setAdmin: (userId, isAdmin) => gasPost('updateUser', { user_id: userId, is_admin: isAdmin }),
};

// =============================
// 顧客
// =============================
export const CustomerAPI = {
  getAll: () => gasGet('getCustomers'),
  add:    (data) => gasPost('addCustomer', data),
  update: (data) => gasPost('updateCustomer', data),
};

// =============================
// 案件
// =============================
export const CaseAPI = {
  // 全案件取得
  getAll: () => gasGet('getCases'),

  // 自分の担当案件のみ
  getMyCases: (userId) => gasGet('getCases', { user_id: userId }),

  // 期限超過のみ
  getOverdue: () => gasGet('getCases', { overdue: 'true' }),

  // ステータス絞り込み
  getByStatus: (status) => gasGet('getCases', { status }),

  // 1件取得
  get: (caseId) => gasGet('getCase', { case_id: caseId }),

  // 新規登録
  add: (data) => gasPost('addCase', data),

  // 更新（ステータス変更・進捗更新など）
  update: (data) => gasPost('updateCase', data),

  // ステータス変更ショートカット
  setStatus: (caseId, status) => gasPost('updateCase', { case_id: caseId, status }),

  // 完了にする
  close: (caseId) => gasPost('updateCase', { case_id: caseId, status: '完了' }),
};

// =============================
// 日報ログ
// =============================
export const LogAPI = {
  // 案件の日報一覧（新しい順）
  getByCase: (caseId) => gasGet('getLogs', { case_id: caseId }),

  // 日報追加
  add: (data) => gasPost('addLog', data),
};

// =============================
// 課題管理
// =============================
export const IssueAPI = {
  // 未完了の課題のみ（デフォルト: 案件詳細画面）
  getOpen: (caseId) => gasGet('getIssues', { case_id: caseId, filter: 'open' }),

  // 全課題（完了済み含む）
  getAll: (caseId) => gasGet('getIssues', { case_id: caseId, filter: 'all' }),

  // 課題追加
  add: (data) => gasPost('addIssue', data),

  // ステータス更新
  update: (data) => gasPost('updateIssue', data),

  // 対応済みにする
  resolve: (issueId) => gasPost('updateIssue', { issue_id: issueId, status: '対応済み' }),
};

// =============================
// 引き継ぎ
// =============================
export const HandoffAPI = {
  // 引き継ぎサマリー取得
  get: (caseId) => gasGet('getHandoff', { case_id: caseId }),

  // 保存（新規 or 上書き）
  save: (data) => gasPost('saveHandoff', data),
};

// =============================
// 関係者
// =============================
export const StakeholderAPI = {
  getByCase: (caseId) => gasGet('getStakeholders', { case_id: caseId }),
  add:    (data) => gasPost('addStakeholder', data),
  update: (data) => gasPost('updateStakeholder', data),
};

// =============================
// ダッシュボード集計
// =============================
export const DashboardAPI = {
  // ダッシュボード用集計データ一括取得
  get: (userId) => gasGet('getDashboard', userId ? { user_id: userId } : {}),
};

// =============================
// ローカルストレージ（ユーザーセッション）
// =============================
export const Session = {
  KEY: 'caseflow_user',

  // ログイン状態を保存
  save: (user) => localStorage.setItem(Session.KEY, JSON.stringify(user)),

  // 保存済みユーザーを取得（null = 未ログイン）
  load: () => {
    try {
      return JSON.parse(localStorage.getItem(Session.KEY));
    } catch {
      return null;
    }
  },

  // ログアウト（ユーザー選択画面に戻す）
  clear: () => localStorage.removeItem(Session.KEY),

  // 管理者かどうか
  isAdmin: () => {
    const u = Session.load();
    return u && u.is_admin === true;
  },
};
