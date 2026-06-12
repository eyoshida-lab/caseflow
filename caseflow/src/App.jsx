import { useState, useEffect } from 'react';
import { Session } from './api.js';
import LoginPage   from './pages/LoginPage.jsx';
import AppShell    from './components/AppShell.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = Session.load();
    if (saved) setUser(saved);
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!user) {
    return <LoginPage onLogin={(u) => { Session.save(u); setUser(u); }} />;
  }

  return (
    <AppShell
      user={user}
      onSwitchUser={(u) => { Session.save(u); setUser(u); }}
      onLogout={() => { Session.clear(); setUser(null); }}
    />
  );
}
