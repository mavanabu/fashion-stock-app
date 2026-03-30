import { useState } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Orders from './components/Orders';
import Options from './components/Options';
import Analytics from './components/Analytics';

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fashion_user')); } catch { return null; }
  });
  const [page, setPage] = useState('orders');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogin = (u) => setUser(u);

  const handleLogout = () => {
    localStorage.removeItem('fashion_token');
    localStorage.removeItem('fashion_user');
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar current={page} onNavigate={setPage} user={user} onLogout={handleLogout} open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {page === 'orders' && <Orders />}
        {page === 'analytics' && <Analytics />}
        {page === 'options' && <Options />}
      </main>
    </div>
  );
}
