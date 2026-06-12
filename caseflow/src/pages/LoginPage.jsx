import { useState, useEffect } from 'react';
import { UserAPI } from '../api.js';
import styles from './LoginPage.module.css';

const AVATAR_COLORS = {
  teal:   { bg: '#E1F5EE', color: '#085041' },
  purple: { bg: '#EEEDFE', color: '#3C3489' },
  amber:  { bg: '#FAEEDA', color: '#633806' },
  blue:   { bg: '#E6F1FB', color: '#185FA5' },
  coral:  { bg: '#FAECE7', color: '#993C1D' },
  green:  { bg: '#EAF3DE', color: '#3B6D11' },
};

export default function LoginPage({ onLogin }) {
  const [users, setUsers]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    UserAPI.getAll()
      .then(setUsers)
      .catch(() => setError('ユーザー情報の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, []);

  const avatarStyle = (color) => {
    const c = AVATAR_COLORS[color] || AVATAR_COLORS.teal;
    return { background: c.bg, color: c.color };
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.icon}><i className="ti ti-layout-dashboard" /></div>
        <h1 className={styles.title}>CaseFlow</h1>
        <p className={styles.sub}>使用するアカウントを選択してください</p>

        {loading && <p className={styles.loading}>読み込み中...</p>}
        {error   && <p className={styles.error}>{error}</p>}

        {!loading && !error && (
          <div className={styles.grid}>
            {users.map(u => (
              <button
                key={u.user_id}
                className={`${styles.userBtn} ${selected?.user_id === u.user_id ? styles.selected : ''}`}
                onClick={() => setSelected(u)}
              >
                <div className={styles.avatar} style={avatarStyle(u.avatar_color)}>
                  {u.initial}
                </div>
                <div className={styles.name}>{u.name}</div>
                <div className={styles.role}>{u.is_admin === 'TRUE' || u.is_admin === true ? '管理者' : '担当者'}</div>
                {(u.is_admin === 'TRUE' || u.is_admin === true) && (
                  <div className={styles.adminBadge}><i className="ti ti-crown" /> 管理者</div>
                )}
              </button>
            ))}
          </div>
        )}

        <button
          className={`${styles.loginBtn} primary`}
          disabled={!selected}
          onClick={() => selected && onLogin(selected)}
        >
          {selected ? `${selected.name} でログイン` : 'アカウントを選択してください'}
        </button>
        <p className={styles.note}><i className="ti ti-device-floppy" /> 選択はブラウザに記憶されます</p>
      </div>
    </div>
  );
}
