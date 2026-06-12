// CaseFlow — Sheets テンプレート自動生成スクリプト
// Google Apps Script エディタに貼り付けて実行してください
// 実行前に: スプレッドシートを新規作成し、そのエディタで実行する

function setupCaseFlow() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.rename('CaseFlow マスター');

  // ① まず新しいシートを1枚作成（削除用の捨て石）
  const tempSheet = ss.insertSheet('__temp__');

  // ② 既存シートをすべて削除（__temp__ 以外）
  ss.getSheets().forEach(s => {
    if (s.getName() !== '__temp__') ss.deleteSheet(s);
  });

  // ③ 各シートを作成
  createUsersSheet(ss);
  createCustomersSheet(ss);
  createCasesSheet(ss);
  createLogsSheet(ss);
  createIssuesSheet(ss);
  createHandoffSheet(ss);
  createStakeholdersSheet(ss);

  // ④ 捨て石シートを削除
  ss.deleteSheet(tempSheet);

  SpreadsheetApp.getUi().alert('✅ CaseFlow のシートを作成しました！');
}

// =============================
// ① ユーザーマスター
// =============================
function createUsersSheet(ss) {
  const sh = ss.insertSheet('ユーザーマスター');
  const headers = [
    'user_id', 'name', 'initial', 'is_admin', 'is_active', 'avatar_color', 'created_at'
  ];
  const labels = [
    'ユーザーID', '氏名', 'イニシャル', '管理者フラグ', '有効フラグ', 'アバターカラー', '作成日'
  ];
  setHeaders(sh, headers, labels, '#4A4080');

  // サンプルデータ
  const rows = [
    ['U001', '中村 太郎', '中', true,  true,  'blue',   new Date()],
    ['U002', '田中 誠',   '田', false, true,  'teal',   new Date()],
    ['U003', '山本 花子', '山', false, true,  'purple', new Date()],
    ['U004', '佐藤 一郎', '佐', false, true,  'amber',  new Date()],
    ['U005', '木村 さくら','木', false, true,  'coral',  new Date()],
    ['U006', '林 健二',   '林', false, true,  'green',  new Date()],
  ];
  sh.getRange(3, 1, rows.length, rows[0].length).setValues(rows);
  formatSheet(sh, headers.length);
}

// =============================
// ② 顧客マスター
// =============================
function createCustomersSheet(ss) {
  const sh = ss.insertSheet('顧客マスター');
  const headers = [
    'customer_id', 'name', 'industry', 'owner_user_id', 'drive_folder_url', 'notes', 'created_at'
  ];
  const labels = [
    '顧客ID', '顧客名', '業種', '主担当ユーザーID', 'Driveフォルダ', '備考', '作成日'
  ];
  setHeaders(sh, headers, labels, '#1D6B50');

  const rows = [
    ['C001', '株式会社マルフク',      '製造業', 'U002', '', '契約更新は毎年6月', new Date()],
    ['C002', '田中商事',              '商社',   'U004', '', '',                  new Date()],
    ['C003', '東京メディア株式会社',  'メディア','U003', '', '',                  new Date()],
    ['C004', '株式会社ひので',        '小売',   '',     '', '新規顧客',           new Date()],
    ['C005', 'グローバルテック',      'IT',     'U002', '', '',                  new Date()],
  ];
  sh.getRange(3, 1, rows.length, rows[0].length).setValues(rows);
  formatSheet(sh, headers.length);
}

// =============================
// ③ 案件
// =============================
function createCasesSheet(ss) {
  const sh = ss.insertSheet('案件');
  const headers = [
    'case_id', 'title', 'customer_id', 'status', 'priority', 'category',
    'owner_user_id', 'support_user_ids', 'due_date', 'progress',
    'description', 'drive_folder_url', 'issue_sheet_id', 'created_at', 'closed_at'
  ];
  const labels = [
    '案件ID', '案件名', '顧客ID', 'ステータス', '優先度', '案件種別',
    '主担当ID', 'サポート担当IDs', '期限日', '進捗率(%)',
    '概要', 'Driveフォルダ', '外部課題SSのID', '作成日', '完了日'
  ];
  setHeaders(sh, headers, labels, '#7B5C00');

  const rows = [
    ['K001', '契約更新対応',        'C001', '期限超過', '高', '契約更新', 'U002', 'U003', new Date('2026-06-09'), 60, '年間保守契約更新', '', '', new Date('2026-05-28'), ''],
    ['K002', '障害対応レポート提出', 'C002', '期限超過', '高', '障害対応', 'U004', '',     new Date('2026-06-10'), 40, '障害報告書の提出', '', '', new Date('2026-06-01'), ''],
    ['K003', '年間保守契約 更新提案','C003', '対応中',   '中', '契約更新', 'U003', 'U002,U004', new Date('2026-06-13'), 80, '', '', '', new Date('2026-05-20'), ''],
    ['K004', '初期設定サポート',    'C004', '新規',     '中', '新規導入', '',     '',     new Date('2026-06-20'),  5, '', '', '', new Date('2026-06-10'), ''],
    ['K005', 'Q3レビュー資料作成',  'C005', '承認待ち', '低', 'レポート', 'U002', '',     new Date('2026-06-25'), 95, '', '', '', new Date('2026-06-05'), ''],
  ];
  sh.getRange(3, 1, rows.length, rows[0].length).setValues(rows);
  formatSheet(sh, headers.length);

  // ステータスの入力規則
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['新規', '対応中', '承認待ち', '期限超過', '完了'], true)
    .build();
  sh.getRange(3, 4, 100).setDataValidation(statusRule);

  // 優先度の入力規則
  const priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['高', '中', '低'], true)
    .build();
  sh.getRange(3, 5, 100).setDataValidation(priorityRule);
}

// =============================
// ④ 日報ログ
// =============================
function createLogsSheet(ss) {
  const sh = ss.insertSheet('日報ログ');
  const headers = [
    'log_id', 'case_id', 'user_id', 'log_date', 'content', 'next_action', 'tag', 'created_at'
  ];
  const labels = [
    '日報ID', '案件ID', 'ユーザーID', '記録日', '対応内容', 'ネクストアクション', 'タグ', '作成日時'
  ];
  setHeaders(sh, headers, labels, '#8B2010');

  const rows = [
    ['L001', 'K001', 'U002', new Date('2026-06-10'), '先方へメール送信。鈴木部長が不在とのこと、6/16以降に面談打診中。', '6/16以降の面談日程確定', '要フォロー', new Date('2026-06-10')],
    ['L002', 'K001', 'U003', new Date('2026-06-08'), '契約書ドラフト完成。社内稟議回付。', '山田部長の承認を待つ', '完了', new Date('2026-06-08')],
    ['L003', 'K001', 'U002', new Date('2026-06-05'), '旧担当・佐々木氏より引き継ぎ完了。鈴木部長の連絡先を入手。', '鈴木部長へ挨拶メール送付', '完了', new Date('2026-06-05')],
  ];
  sh.getRange(3, 1, rows.length, rows[0].length).setValues(rows);
  formatSheet(sh, headers.length);

  // タグの入力規則
  const tagRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['完了', '要フォロー', '懸念', '情報共有', ''], true)
    .build();
  sh.getRange(3, 7, 500).setDataValidation(tagRule);
}

// =============================
// ⑤ 課題管理
// =============================
function createIssuesSheet(ss) {
  const sh = ss.insertSheet('課題管理');
  const headers = [
    'issue_id', 'case_id', 'title', 'status', 'user_id', 'created_at', 'resolved_at'
  ];
  const labels = [
    '課題ID', '案件ID', '課題タイトル', 'ステータス', '担当ユーザーID', '起票日', '解決日'
  ];
  setHeaders(sh, headers, labels, '#0D4D7A');

  const rows = [
    ['I001', 'K001', '新任担当者（鈴木部長）との面談未調整', '未対応',  'U002', new Date('2026-06-05'), ''],
    ['I002', 'K001', '社内稟議書の最終承認待ち（山田部長）', '確認待ち', 'U003', new Date('2026-06-08'), ''],
    ['I003', 'K002', '障害原因の最終確認が取れていない',       '対応中',  'U004', new Date('2026-06-09'), ''],
  ];
  sh.getRange(3, 1, rows.length, rows[0].length).setValues(rows);
  formatSheet(sh, headers.length);

  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['未対応', '対応中', '確認待ち', '対応済み'], true)
    .build();
  sh.getRange(3, 4, 200).setDataValidation(statusRule);
}

// =============================
// ⑥ 引き継ぎサマリー
// =============================
function createHandoffSheet(ss) {
  const sh = ss.insertSheet('引き継ぎサマリー');
  const headers = [
    'case_id', 'current_status', 'open_issues', 'key_person',
    'next_action', 'handoff_memo', 'from_user_id', 'to_user_id', 'updated_at'
  ];
  const labels = [
    '案件ID', '現在の対応状況', '未解決の課題', '顧客キーパーソン',
    '次のアクション', '引き継ぎメモ', '旧担当ID', '新担当ID', '更新日時'
  ];
  setHeaders(sh, headers, labels, '#2D6A00');

  const rows = [
    [
      'K001',
      '担当者交代により面談調整が遅延中。契約書ドラフトv2は完成済み、稟議承認待ち。',
      '①鈴木部長との面談未調整 ②社内稟議承認待ち',
      '鈴木部長（新任）/ 佐々木氏（旧担当・参照用）',
      '6/16以降の面談日程確定が最優先',
      '鈴木部長はメールより電話の方がレスが早い。前回の契約時に値引き交渉あり。',
      'U002', 'U003', new Date()
    ],
  ];
  sh.getRange(3, 1, rows.length, rows[0].length).setValues(rows);
  formatSheet(sh, headers.length);
}

// =============================
// ⑦ 関係者
// =============================
function createStakeholdersSheet(ss) {
  const sh = ss.insertSheet('関係者');
  const headers = [
    'stakeholder_id', 'case_id', 'name', 'role', 'contact', 'notes'
  ];
  const labels = [
    '関係者ID', '案件ID', '氏名', '役職・立場', '連絡先', '備考'
  ];
  setHeaders(sh, headers, labels, '#4A4A4A');

  const rows = [
    ['S001', 'K001', '鈴木 部長',  '先方新任担当・意思決定者', 'suzuki@marufuku.co.jp', '電話の方が返信が早い'],
    ['S002', 'K001', '佐々木 氏',  '旧担当（参照用）',         'sasaki@marufuku.co.jp', '退職済み、参照用のみ'],
    ['S003', 'K002', '山田 課長',  '先方担当者',               'yamada@tanakashouji.co.jp', ''],
  ];
  sh.getRange(3, 1, rows.length, rows[0].length).setValues(rows);
  formatSheet(sh, headers.length);
}

// =============================
// 共通ユーティリティ
// =============================
function setHeaders(sh, headers, labels, color) {
  const numCols = headers.length;

  // 1行目: 日本語ラベル
  const labelRow = sh.getRange(1, 1, 1, numCols);
  labelRow.setValues([labels]);
  labelRow.setBackground(color);
  labelRow.setFontColor('#FFFFFF');
  labelRow.setFontWeight('bold');
  labelRow.setFontSize(11);

  // 2行目: キー名
  const keyRow = sh.getRange(2, 1, 1, numCols);
  keyRow.setValues([headers]);
  keyRow.setBackground('#F5F5F5');
  keyRow.setFontColor('#888888');
  keyRow.setFontSize(10);
  keyRow.setFontFamily('Courier New');

  // 行を固定
  sh.setFrozenRows(2);
}

function formatSheet(sh, numCols) {
  // 列幅を自動調整
  for (let i = 1; i <= numCols; i++) {
    sh.autoResizeColumn(i);
  }
  // 最小列幅を確保
  for (let i = 1; i <= numCols; i++) {
    if (sh.getColumnWidth(i) < 80) sh.setColumnWidth(i, 80);
  }
  // 枠線
  const dataRange = sh.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true, '#DDDDDD',
    SpreadsheetApp.BorderStyle.SOLID);
}
