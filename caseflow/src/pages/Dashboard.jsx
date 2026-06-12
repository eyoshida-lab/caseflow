import { useState, useEffect } from 'react';
import { DashboardAPI, CaseAPI } from '../api.js';
import s from './Dashboard.module.css';

const STATUS_BADGE = {
  '新規':     { bg: '#EEEDFE', color: '#3C3489' },
  '対応中':   { bg: '#E1F5EE', color: '#085041' },
  '承認待ち': { bg: '#FAEEDA', color: '#633806' },
  '期限超過': { bg: '#FCEBEB', color: '#791F1F' },
  '完了':     { bg: '#F0F0F0', color: '#666' },
};

export default function Dashboard({ user, nav }) {
  const [stats, setStats]   = useState(null);
  const [cases, setCases]   = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      DashboardAPI.get(user.user_id),
      CaseAPI.getAll(),
    ]).then(([st, cs]) => {
      setStats(st);
      setCases(cs);
    }).finally(() => setLoading(false));
  }, []);

  const today = new Date(); today.setHours(0,0,0,0);
  const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);

  const filtered = cases.filter(c => {
    if (filter === 'mine')   return c.owner_user_id === user.user_id;
    if (filter === 'week')   { const d = new Date(c.due_date); return d >= today && d <= weekEnd && c.status !== '完了'; }
    if (filter === 'overdue') return new Date(c.due_date) < today && c.status !== '完了';
    return c.status !== '完了';
  });

  const formatDate = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return `${dt.getMonth()+1}/${dt.getDate()}`;
  };
  const isOverdue = (d) => d && new Date(d) < today;
  const isThisWeek = (d) => { if (!d) return false; const dt = new Date(d); return dt >= today && dt <= weekEnd; };

  if (loading) return <div className={s.loading}>読み込み中...</div>;

  return (
    <div>
      <div className={s.header}>
        <div>
          <div className={s.title}>ダッシュボード</div>
          <div className={s.sub}>{new Date().toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric', weekday:'short' })}</div>
        </div>
        <button className="primary" onClick={() => nav('cases')}>
          <i className="ti ti-plus" /> 新規案件
        </button>
      </div>

      {/* メトリクス */}
      <div className={s.metrics}>
        <div className={s.metric}>
          <div className={s.metricLabel}>対応中案件</div>
          <div className={s.metricVal}>{stats?.total_active ?? '-'}</div>
          <div className={s.metricSub}>今週期限 {stats?.this_week_due ?? 0}件</div>
        </div>
        <div className={s.metric}>
          <div className={s.metricLabel}>期限超過</div>
          <div className={s.metricVal} style={{ color: '#B91C1C' }}>{stats?.overdue_count ?? '-'}</div>
          <div className={s.metricSub} style={{ color: '#B91C1C' }}>{stats?.overdue_count > 0 ? '要対応' : '問題なし'}</div>
        </div>
        <div className={s.metric}>
          <div className={s.metricLabel}>担当未設定</div>
          <div className={s.metricVal} style={{ color: stats?.no_owner_count > 0 ? '#BA7517' : '#1A1A1A' }}>{stats?.no_owner_count ?? '-'}</div>
          <div className={s.metricSub} style={{ color: '#BA7517' }}>{stats?.no_owner_count > 0 ? 'アサイン待ち' : ''}</div>
        </div>
        <div className={s.metric}>
          <div className={s.metricLabel}>今週完了</div>
          <div className={s.metricVal}>{stats?.done_this_week ?? '-'}</div>
          <div className={s.metricSub} style={{ color: '#085041' }}>直近7日間</div>
        </div>
      </div>

      {/* アラート */}
      {(stats?.overdue_cases?.length > 0 || stats?.no_owner_cases?.length > 0) && (
        <div className={s.alerts}>
          {stats.overdue_cases.map(c => (
            <div key={c.case_id} className={`${s.alert} ${s.alertDanger}`} onClick={() => nav('detail', { caseId: c.case_id })}>
              <i className="ti ti-clock" />
              <span>{c.title} が期限を超過しています</span>
              <span className={s.alertLink}>詳細 →</span>
            </div>
          ))}
          {stats.no_owner_cases.map(c => (
            <div key={c.case_id} className={`${s.alert} ${s.alertWarn}`} onClick={() => nav('detail', { caseId: c.case_id })}>
              <i className="ti ti-user" />
              <span>「{c.title}」に担当者が未設定です</span>
              <span className={s.alertLink}>アサイン →</span>
            </div>
          ))}
        </div>
      )}

      {/* 案件一覧 */}
      <div className={s.listHeader}>
        <div className={s.listTitle}>案件一覧</div>
        <div className={s.filters}>
          {[['all','すべて'],['mine','自分'],['week','今週'],['overdue','超過']].map(([k,l]) => (
            <button key={k} className={filter === k ? s.chipOn : s.chip} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className={s.table}>
        <div className={s.tableHead}>
          <span>案件 / 顧客</span><span>ステータス</span><span>担当者</span><span>期限</span><span>進捗</span>
        </div>
        {filtered.length === 0 && <div className={s.empty}>該当する案件はありません</div>}
        {filtered.map(c => {
          const badge = STATUS_BADGE[c.status] || STATUS_BADGE['新規'];
          const over  = isOverdue(c.due_date);
          const soon  = isThisWeek(c.due_date);
          return (
            <div key={c.case_id} className={s.row} onClick={() => nav('detail', { caseId: c.case_id })}>
              <div>
                <div className={s.caseName}>{c.title}</div>
                <div className={s.caseClient}>{c.customer_id}</div>
              </div>
              <div><span className={s.badge} style={{ background: badge.bg, color: badge.color }}>{c.status}</span></div>
              <div className={s.assignee}>{c.owner_user_id || <span style={{color:'#CCC'}}>未設定</span>}</div>
              <div className={s.due} style={{ color: over ? '#B91C1C' : soon ? '#BA7517' : '#888', fontWeight: over ? 600 : 400 }}>
                {formatDate(c.due_date)}{over ? ' !' : ''}
              </div>
              <div className={s.progress}>
                <div className={s.progressBar}>
                  <div className={s.progressFill} style={{ width: `${c.progress || 0}%`, background: over ? '#E24B4A' : '#1D9E75' }} />
                </div>
                <span className={s.progressPct}>{c.progress || 0}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
