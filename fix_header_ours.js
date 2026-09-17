const fs = require('fs');
let c = fs.readFileSync('herramienta-nutricion/src/components/Header.jsx', 'utf8');

c = c.replace(
  "currentUser,",
  "currentUser,\n  isAdmin,"
);

c = c.replace(
  "if (currentView === 'chef')",
  "if (isAdmin) return { label: 'Administrador', color: '#7C3AED', bg: '#F5F3FF' };\n    if (currentView === 'chef')"
);

c = c.replace(
  "{onServiceProfileChange && (",
  `{isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '3px', borderRadius: '10px', border: '1px solid #CBD5E1', gap: '3px', marginRight: '0.5rem' }}>
            <button type="button" onClick={() => setCurrentView('nutriologa')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: currentView === 'nutriologa' ? '#FFFFFF' : 'transparent', color: currentView === 'nutriologa' ? '#2563EB' : '#64748B', fontWeight: currentView === 'nutriologa' ? '800' : '600', fontSize: '0.78rem', cursor: 'pointer' }}>
              <HeartPulse size={14} /> Nutrióloga
            </button>
            <button type="button" onClick={() => setCurrentView('chef')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: currentView === 'chef' ? '#FFFFFF' : 'transparent', color: currentView === 'chef' ? 'var(--green-dark)' : '#64748B', fontWeight: currentView === 'chef' ? '800' : '600', fontSize: '0.78rem', cursor: 'pointer' }}>
              <ChefHat size={14} /> Chef
            </button>
            <button type="button" onClick={() => setCurrentView('participant')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: currentView === 'participant' ? '#FFFFFF' : 'transparent', color: currentView === 'participant' ? 'var(--primary)' : '#64748B', fontWeight: currentView === 'participant' ? '800' : '600', fontSize: '0.78rem', cursor: 'pointer' }}>
              <User size={14} /> Empleado
            </button>
          </div>
        )}\n        {onServiceProfileChange && (`
);

fs.writeFileSync('herramienta-nutricion/src/components/Header.jsx', c);
