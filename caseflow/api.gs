// CaseFlow — GAS プロキシ API
// Google Apps Script の「新しいデプロイ」→「Webアプリ」として公開する
// アクセス権: 自分のGoogleアカウントで実行 / アクセスできるユーザー: 組織内全員

const SHEET_ID = 'YOUR_SPREADSHEET_ID'; // ← スプレッドシートのIDに変更

// =============================
// エントリーポイント
// =============================
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const params = e.parameter || {};
    const body   = e.postData ? JSON.parse(e.postData.contents || '{}') : {};
    const action = params.action || body.action;
    const method = e.parameter ? 'GET' : 'POST';

    // CORS 対応ヘッダー
    const output = dispatch(action, params, body, method);
    return ContentService
      .createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function dispatch(action, params, body, method) {
  switch (action) {

    // ---- ユーザー ----
    case 'getUsers':        return getUsers();
    case 'addUser':         return addUser(body);
    case 'updateUser':      return updateUser(body);

    // ---- 顧客 ----
    case 'getCustomers':    return getCustomers();
    case 'addCustomer':     return addCustomer(body);
    case 'updateCustomer':  return updateCustomer(body);

    // ---- 案件 ----
    case 'getCases':        return getCases(params);
    case 'getCase':         return getCase(params.case_id);
    case 'addCase':         return addCase(body);
    case 'updateCase':      return updateCase(body);

    // ---- 日報 ----
    case 'getLogs':         return getLogs(params.case_id);
    case 'addLog':          return addLog(body);

    // ---- 課題 ----
    case 'getIssues':       return getIssues(params.case_id, params.filter);
    case 'addIssue':        return addIssue(body);
    case 'updateIssue':     return updateIssue(body);

    // ---- 引き継ぎ ----
    case 'getHandoff':      return getHandoff(params.case_id);
    case 'saveHandoff':     return saveHandoff(body);

    // ---- 関係者 ----
    case 'getStakeholders': return getStakeholders(params.case_id);
    case 'addStakeholder':  return addStakeholder(body);
    case 'updateStakeholder': return updateStakeholder(body);

    // ---- ダッシュボード集計 ----
    case 'getDashboard':    return getDashboard(params.user_id);

    default:
      return { ok: false, error: 'Unknown action: ' + action };
  }
}

// =============================
// 汎用シート操作ヘルパー
// =============================
function getSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error('シートが見つかりません: ' + name);
  return sh;
}

// シートのデータを {key: value} のオブジェクト配列で返す
// 1行目=日本語ラベル(無視), 2行目=キー名, 3行目以降=データ
function sheetToObjects(sheetName) {
  const sh   = getSheet(sheetName);
  const data = sh.getDataRange().getValues();
  if (data.length < 3) return [];
  const keys = data[1]; // 2行目がキー
  return data.slice(2).map(row => {
    const obj = {};
    keys.forEach((k, i) => { obj[k] = row[i]; });
    return obj;
  });
}

// 新しい行を追加
function appendRow(sheetName, obj, keys) {
  const sh  = getSheet(sheetName);
  const row = keys.map(k => obj[k] !== undefined ? obj[k] : '');
  sh.appendRow(row);
}

// 特定IDの行を更新
function updateRow(sheetName, idKey, idValue, updates, keys) {
  const sh   = getSheet(sheetName);
  const data = sh.getDataRange().getValues();
  const keyRow = data[1];
  const idCol  = keyRow.indexOf(idKey);
  if (idCol === -1) throw new Error('キーが見つかりません: ' + idKey);

  for (let i = 2; i < data.length; i++) {
    if (String(data[i][idCol]) === String(idValue)) {
      keys.forEach(k => {
        if (updates[k] !== undefined) {
          const col = keyRow.indexOf(k);
          if (col !== -1) sh.getRange(i + 1, col + 1).setValue(updates[k]);
        }
      });
      return { ok: true };
    }
  }
  return { ok: false, error: '行が見つかりません: ' + idValue };
}

// 次のIDを採番 (例: U001 → U002)
function nextId(sheetName, idKey, prefix, digits) {
  const rows = sheetToObjects(sheetName);
  if (rows.length === 0) return prefix + '001';
  const nums = rows.map(r => parseInt(String(r[idKey]).replace(prefix, '')) || 0);
  const next = Math.max(...nums) + 1;
  return prefix + String(next).padStart(digits || 3, '0');
}

// =============================
// ユーザー
// =============================
const USER_KEYS = ['user_id','name','initial','is_admin','is_active','avatar_color','created_at'];

function getUsers() {
  const users = sheetToObjects('ユーザーマスター').filter(u => u.is_active);
  return { ok: true, data: users };
}

function addUser(body) {
  body.user_id    = nextId('ユーザーマスター', 'user_id', 'U');
  body.is_active  = true;
  body.is_admin   = body.is_admin || false;
  body.created_at = new Date().toISOString();
  appendRow('ユーザーマスター', body, USER_KEYS);
  return { ok: true, user_id: body.user_id };
}

function updateUser(body) {
  return updateRow('ユーザーマスター', 'user_id', body.user_id, body, USER_KEYS);
}

// =============================
// 顧客
// =============================
const CUSTOMER_KEYS = ['customer_id','name','industry','owner_user_id','drive_folder_url','notes','created_at'];

function getCustomers() {
  return { ok: true, data: sheetToObjects('顧客マスター') };
}

function addCustomer(body) {
  body.customer_id = nextId('顧客マスター', 'customer_id', 'C');
  body.created_at  = new Date().toISOString();
  appendRow('顧客マスター', body, CUSTOMER_KEYS);
  return { ok: true, customer_id: body.customer_id };
}

function updateCustomer(body) {
  return updateRow('顧客マスター', 'customer_id', body.customer_id, body, CUSTOMER_KEYS);
}

// =============================
// 案件
// =============================
const CASE_KEYS = [
  'case_id','title','customer_id','status','priority','category',
  'owner_user_id','support_user_ids','due_date','progress',
  'description','drive_folder_url','issue_sheet_id','created_at','closed_at'
];

function getCases(params) {
  let cases = sheetToObjects('案件');

  // フィルタ: user_id（自分の担当）
  if (params.user_id) {
    cases = cases.filter(c =>
      c.owner_user_id === params.user_id ||
      String(c.support_user_ids).split(',').includes(params.user_id)
    );
  }
  // フィルタ: status
  if (params.status) {
    cases = cases.filter(c => c.status === params.status);
  }
  // フィルタ: overdue（期限超過のみ）
  if (params.overdue === 'true') {
    const today = new Date();
    cases = cases.filter(c => {
      const due = new Date(c.due_date);
      return due < today && c.status !== '完了';
    });
  }
  return { ok: true, data: cases };
}

function getCase(caseId) {
  const cases = sheetToObjects('案件');
  const found = cases.find(c => c.case_id === caseId);
  if (!found) return { ok: false, error: '案件が見つかりません' };
  return { ok: true, data: found };
}

function addCase(body) {
  body.case_id    = nextId('案件', 'case_id', 'K');
  body.status     = body.status || '新規';
  body.progress   = body.progress || 0;
  body.created_at = new Date().toISOString();
  body.closed_at  = '';
  appendRow('案件', body, CASE_KEYS);
  return { ok: true, case_id: body.case_id };
}

function updateCase(body) {
  // 完了時に closed_at を自動セット
  if (body.status === '完了' && !body.closed_at) {
    body.closed_at = new Date().toISOString();
  }
  return updateRow('案件', 'case_id', body.case_id, body, CASE_KEYS);
}

// =============================
// 日報ログ
// =============================
const LOG_KEYS = ['log_id','case_id','user_id','log_date','content','next_action','tag','created_at'];

function getLogs(caseId) {
  const logs = sheetToObjects('日報ログ')
    .filter(l => l.case_id === caseId)
    .sort((a, b) => new Date(b.log_date) - new Date(a.log_date)); // 新しい順
  return { ok: true, data: logs };
}

function addLog(body) {
  body.log_id     = nextId('日報ログ', 'log_id', 'L');
  body.log_date   = body.log_date || new Date().toISOString();
  body.created_at = new Date().toISOString();
  appendRow('日報ログ', body, LOG_KEYS);
  return { ok: true, log_id: body.log_id };
}

// =============================
// 課題管理
// =============================
const ISSUE_KEYS = ['issue_id','case_id','title','status','user_id','created_at','resolved_at'];

function getIssues(caseId, filter) {
  let issues = sheetToObjects('課題管理').filter(i => i.case_id === caseId);
  // filter=open のとき「対応済み」を除外（デフォルト動作）
  if (!filter || filter === 'open') {
    issues = issues.filter(i => i.status !== '対応済み');
  }
  return { ok: true, data: issues };
}

function addIssue(body) {
  body.issue_id   = nextId('課題管理', 'issue_id', 'I');
  body.status     = body.status || '未対応';
  body.created_at = new Date().toISOString();
  body.resolved_at = '';
  appendRow('課題管理', body, ISSUE_KEYS);
  return { ok: true, issue_id: body.issue_id };
}

function updateIssue(body) {
  // 対応済みにしたとき resolved_at を自動セット
  if (body.status === '対応済み' && !body.resolved_at) {
    body.resolved_at = new Date().toISOString();
  }
  return updateRow('課題管理', 'issue_id', body.issue_id, body, ISSUE_KEYS);
}

// =============================
// 引き継ぎサマリー
// =============================
const HANDOFF_KEYS = [
  'case_id','current_status','open_issues','key_person',
  'next_action','handoff_memo','from_user_id','to_user_id','updated_at'
];

function getHandoff(caseId) {
  const rows = sheetToObjects('引き継ぎサマリー');
  const found = rows.find(r => r.case_id === caseId);
  return { ok: true, data: found || null };
}

function saveHandoff(body) {
  body.updated_at = new Date().toISOString();
  const rows = sheetToObjects('引き継ぎサマリー');
  const exists = rows.some(r => r.case_id === body.case_id);
  if (exists) {
    return updateRow('引き継ぎサマリー', 'case_id', body.case_id, body, HANDOFF_KEYS);
  } else {
    appendRow('引き継ぎサマリー', body, HANDOFF_KEYS);
    return { ok: true };
  }
}

// =============================
// 関係者
// =============================
const STAKEHOLDER_KEYS = ['stakeholder_id','case_id','name','role','contact','notes'];

function getStakeholders(caseId) {
  const rows = sheetToObjects('関係者').filter(s => s.case_id === caseId);
  return { ok: true, data: rows };
}

function addStakeholder(body) {
  body.stakeholder_id = nextId('関係者', 'stakeholder_id', 'S');
  appendRow('関係者', body, STAKEHOLDER_KEYS);
  return { ok: true, stakeholder_id: body.stakeholder_id };
}

function updateStakeholder(body) {
  return updateRow('関係者', 'stakeholder_id', body.stakeholder_id, body, STAKEHOLDER_KEYS);
}

// =============================
// ダッシュボード集計
// =============================
function getDashboard(userId) {
  const cases  = sheetToObjects('案件');
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const active   = cases.filter(c => c.status !== '完了');
  const overdue  = active.filter(c => new Date(c.due_date) < today);
  const thisWeek = active.filter(c => {
    const d = new Date(c.due_date);
    return d >= today && d <= weekEnd;
  });
  const noOwner  = active.filter(c => !c.owner_user_id);
  const doneThisWeek = cases.filter(c => {
    if (c.status !== '完了' || !c.closed_at) return false;
    const d = new Date(c.closed_at);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    return d >= weekStart;
  });

  // 自分の担当案件（userId指定時）
  const myCases = userId
    ? active.filter(c =>
        c.owner_user_id === userId ||
        String(c.support_user_ids).split(',').includes(userId)
      )
    : [];

  return {
    ok: true,
    data: {
      total_active:     active.length,
      overdue_count:    overdue.length,
      no_owner_count:   noOwner.length,
      done_this_week:   doneThisWeek.length,
      this_week_due:    thisWeek.length,
      overdue_cases:    overdue.map(c => ({ case_id: c.case_id, title: c.title, due_date: c.due_date })),
      no_owner_cases:   noOwner.map(c => ({ case_id: c.case_id, title: c.title })),
      my_cases:         myCases,
    }
  };
}
