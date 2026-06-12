import { useState } from 'react';
import { Session } from '../api.js';
import Dashboard   from '../pages/Dashboard.jsx';
import MyPage      from '../pages/MyPage.jsx';
import CaseList    from '../pages/CaseList.jsx';
import CaseDetail  from '../pages/CaseDetail.jsx';
import CustomerList from '../pages/CustomerList.jsx';
import WeeklyReview from '../pages/WeeklyReview.jsx';
import HandoffPage from '../pages/HandoffPage.jsx';
import SearchPage  from '../pages/SearchPage.jsx';
import AdminUsers  from '../pages/admin/AdminUsers.jsx';
import AdminSettings from '../pages/admin/AdminSettings.jsx';
import AdminLogs   from '../pages/admin/AdminLogs.jsx';
import s from './AppShell.module.css';

const AVATAR_COLORS = {
  teal:   { bg: '#E1F5EE', color: '#085041' },
  purple: { bg: '#EEEDFE', color: '#3C3489' },
  amber:  { bg: '#FAEEDA', color: '#633806' },
  blue:   { bg: '#E6F1FB', color: '#185FA5' },
  coral:  { bg: '#FAECE7', color: '#993C1D' },
  green:  { bg: '#EAF3DE', color: '#3B6D11' },
};

export default function AppShell({ user, onSwitchUser, onLogout }) {
  const [page, setPage]         = useState('dashboard');
  const [pageParams, setPageParams] = useState({});
  const [showSwitch, setShowSwitch] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const isAdmin = user.is_admin === true || user.is_admin === 'TRUE';
  const avatarStyle = (() => {
    const c = AVATAR_COLORS[user.avatar_color] || AVATAR_COLORS.teal;
    return { background: c.bg, color: c.color };
  })();

  const nav = (p, params = {}) => { setPage(p); setPageParams(params); setShowSwitch(false); };

  const handleSwitchUser = (u) => { onSwitchUser(u); setShowSwitch(false); };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':  return <Dashboard user={user} nav={nav} />;
      case 'mypage':     return <MyPage    user={user} nav={nav} />;
      case 'cases':      return <CaseList  user={user} nav={nav} />;
      case 'detail':     return <CaseDetail user={user} caseId={pageParams.caseId} nav={nav} />;
      case 'customers':  return <CustomerList user={user} nav={nav} />;
      case 'weekly':     return <WeeklyReview user={user} nav={nav} />;
      case 'handoff':    return <HandoffPage user={user} caseId={pageParams.caseId} nav={nav} />;
      case 'search':     return <SearchPage user={user} nav={nav} />;
      case 'admin-users':    return <AdminUsers user={user} nav={nav} />;
      case 'admin-settings': return <AdminSettings user={user} nav={nav} />;
      case 'admin-logs':     return <AdminLogs user={user} nav={nav} />;
      default: return <Dashboard user={user} nav={nav} />;
    }
  };

  const NavItem = ({ icon, label, pageKey, badge }) => (
    <div
      className={`${s.navItem} ${page === pageKey ? s.active : ''}`}
      onClick={() => nav(pageKey)}
    >
      <i className={`ti ti-${icon}`} />
      <span>{label}</span>
      {badge > 0 && <span className={s.badge}>{badge}</span>}
    </div>
  );

  return (
    <div className={s.app}>
      {/* サイドバー */}
      <aside className={s.sidebar}>
        <div className={s.logo}>
          <div className={s.logoText}>CaseFlow</div>
          <div className={s.logoSub}>案件管理システム</div>
        </div>

        <nav className={s.nav}>
          <div className={s.navLabel}>メイン</div>
          <NavItem icon="layout-dashboard" label="ダッシュボード" pageKey="dashboard" />
          <NavItem icon="user"             label="マイページ"     pageKey="mypage" />
          <NavItem icon="file-description" label="案件一覧"       pageKey="cases" />
          <NavItem icon="building"         label="顧客一覧"       pageKey="customers" />

          <div className={s.navLabel} style={{ marginTop: 8 }}>管理</div>
          <NavItem icon="report-analytics" label="週次レビュー"   pageKey="weekly" />
          <NavItem icon="transfer"         label="引き継ぎ"       pageKey="handoff" />
          <NavItem icon="search"           label="横断検索"       pageKey="search" />

          {isAdmin && (
            <>
              <div className={s.navLabelAdmin}>
                <i className="ti ti-crown" style={{ fontSize: 11 }} /> 管理者
              </div>
              <NavItem icon="users"    label="ユーザー管理"    pageKey="admin-users" />
              <NavItem icon="settings" label="システム設定"    pageKey="admin-settings" />
              <NavItem icon="list"     label="操作ログ"        pageKey="admin-logs" />
            </>
          )}
        </nav>

        {/* ユーザー切り替え */}
        <div className={s.bottom}>
          {showSwitch && (
            <UserSwitchPanel
              currentUserId={user.user_id}
              onSelect={handleSwitchUser}
              onClose={() => setShowSwitch(false)}
            />
          )}
          <div className={s.currentUser} onClick={() => setShowSwitch(v => !v)}>
            <div className={s.userAvatar} style={avatarStyle}>{user.initial}</div>
            <div className={s.userInfo}>
              <div className={s.userName}>{user.name}</div>
              <div className={s.userRole}>{isAdmin ? '管理者' : '担当者'}</div>
            </div>
            <i className="ti ti-chevron-up" style={{ fontSize: 12, color: '#AAA' }} />
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className={s.main}>
        {renderPage()}
      </main>
    </div>
  );
}

// ユーザー切り替えパネル
function UserSwitchPanel({ currentUserId, onSelect, onClose }) {
  const [users, setUsers] = useState([]);
  const { UserAPI } = require('../api.js');

  useState(() => {
    import('../api.js').then(m => m.UserAPI.getAll().then(setUsers));
  }, []);

  const COLORS = AVATAR_COLORS;
  return (
    <div style={{ background: '#F7F7F8', border: '0.5px solid #E0DFD8', borderRadius: 8, padding: 10, marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
        <span><i className="ti ti-refresh" /> 切り替え</span>
        <span style={{ cursor: 'pointer' }} onClick={onClose}>✕</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        {users.map(u => {
          const c = COLORS[u.avatar_color] || COLORS.teal;
          return (
            <button
              key={u.user_id}
              onClick={() => onSelect(u)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '8px 4px', border: u.user_id === currentUserId ? '1.5px solid #7F77DD' : '0.5px solid #E0DFD8',
                borderRadius: 6, background: u.user_id === currentUserId ? '#EEEDFE' : '#fff',
                fontSize: 11, cursor: 'pointer',
              }}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, background: c.bg, color: c.color }}>
                {u.initial}
              </div>
              {u.name.split(' ')[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
