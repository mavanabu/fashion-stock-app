const NAV = [
  { key: 'orders', label: 'Orders', icon: '📦' },
  { key: 'analytics', label: 'Analytics', icon: '📊' },
  { key: 'options', label: 'Options', icon: '⚙️' },
];

export default function Sidebar({ current, onNavigate, user, onLogout, open, onToggle }) {
  return (
    <aside style={{
      width: open ? 230 : 60,
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      flexShrink: 0,
      transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
      position: 'relative',
    }}>

      {/* Top glow */}
      <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{
        padding: '18px 14px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        justifyContent: open ? 'space-between' : 'center',
        minHeight: 70, position: 'relative',
      }}>
        {open && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
              boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
            }}>👗</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '-0.2px' }}>Fashion Stock</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 1 }}>Delivery Management</div>
            </div>
          </div>
        )}
        <button onClick={onToggle} title={open ? 'Collapse' : 'Expand'} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
          padding: 7, borderRadius: 8, display: 'flex', flexDirection: 'column',
          gap: 4, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'background 0.15s',
        }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: 'block', width: open ? 14 : 14, height: 2,
              background: 'rgba(255,255,255,0.5)', borderRadius: 2,
              width: i === 1 && open ? 10 : 14,
              transition: 'width 0.2s',
            }} />
          ))}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {open && (
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>
            Menu
          </div>
        )}
        {NAV.map(n => {
          const active = current === n.key;
          return (
            <button key={n.key} onClick={() => onNavigate(n.key)} title={!open ? n.label : ''} style={{
              display: 'flex', alignItems: 'center',
              justifyContent: open ? 'flex-start' : 'center',
              gap: 10, width: '100%',
              padding: open ? '10px 12px' : '10px 0',
              borderRadius: 10, border: 'none',
              background: active
                ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(124,58,237,0.2))'
                : 'transparent',
              color: active ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
              fontSize: 13, fontWeight: active ? 600 : 400,
              cursor: 'pointer', textAlign: 'left',
              whiteSpace: 'nowrap', overflow: 'hidden',
              boxShadow: active ? 'inset 0 0 0 1px rgba(139,92,246,0.3)' : 'none',
              transition: 'all 0.15s',
              position: 'relative',
            }}>
              {active && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 3px 3px 0',
                  background: 'linear-gradient(to bottom, #a78bfa, #7c3aed)',
                }} />
              )}
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              {open && <span>{n.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {open && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
            background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: 8,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0,
            }}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
        )}
        <button onClick={onLogout} title="Sign Out" style={{
          width: '100%', padding: '8px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, color: 'rgba(255,255,255,0.4)',
          fontSize: open ? 12 : 16, cursor: 'pointer',
          transition: 'background 0.15s',
          whiteSpace: 'nowrap',
        }}>
          {open ? '↪ Sign Out' : '↪'}
        </button>
      </div>
    </aside>
  );
}
