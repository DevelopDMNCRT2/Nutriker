import React from 'react';
import { Salad, Calendar, UtensilsCrossed, ShieldCheck, Building2, User, KeyRound, ChefHat, HeartPulse, Sparkles, Users, BarChart2 } from 'lucide-react';
import { getActiveServiceProfile } from '../data/mockData';

export default function Header({
  currentView,
  setCurrentView,
  selectedWeek,
  setSelectedWeek,
  currentUser,
  isAdmin,
  onOpenLogin,
  onLogout,
  serviceProfileKey = 'casa_nostra',
  onServiceProfileChange
}) {
  const activeProfile = getActiveServiceProfile(serviceProfileKey);

  const getRoleBadge = () => {
    if (currentView === 'administracion') return { label: 'Administración', color: '#B45309', bg: '#FEF3C7' };
    if (isAdmin) return { label: 'Administrador', color: '#7C3AED', bg: '#F5F3FF' };
    if (currentView === 'chef') return { label: 'Cocina', color: 'var(--green-dark)', bg: 'var(--green-light)' };
    if (currentView === 'nutriologa') return { label: 'Nutrióloga', color: '#2563EB', bg: '#EFF6FF' };
    return {
      label: activeProfile.recipientRole,
      color: activeProfile.id === 'senior_care' ? '#0891B2' : 'var(--primary)',
      bg: activeProfile.id === 'senior_care' ? '#ECFEFF' : 'var(--primary-light)'
    };
  };

  const badge = getRoleBadge();

  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.65rem 1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
        
        {/* Brand & Client Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: activeProfile.id === 'senior_care' ? '#2563EB' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: activeProfile.id === 'senior_care' ? '0 4px 10px rgba(37, 99, 235, 0.25)' : '0 4px 10px rgba(225, 29, 72, 0.25)',
            transition: 'all 0.25s ease'
          }}>
            {activeProfile.id === 'senior_care' ? <HeartPulse size={20} /> : <Salad size={20} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                NutriKer
              </h1>
              <span className={`badge-tag ${activeProfile.id === 'senior_care' ? '' : 'badge-red'}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.7rem',
                background: activeProfile.id === 'senior_care' ? '#EFF6FF' : undefined,
                color: activeProfile.id === 'senior_care' ? '#2563EB' : undefined
              }}>
                {activeProfile.id === 'senior_care' ? <HeartPulse size={11} /> : <Building2 size={11} />}
                <strong>{activeProfile.clientProject}</strong>
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {activeProfile.id === 'senior_care' ? (
                <>Servicio Geriátrico Continuo • <strong>Texturas IDDSI</strong></>
              ) : (
                <>Entregas: <strong>Lunes, Miércoles y Viernes</strong></>
              )}
            </p>
          </div>
        </div>

        {/* Service Model Switcher (Nutrióloga, Chef, Residentes, Reportes y Compras) */}
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '3px', borderRadius: '10px', border: '1px solid #CBD5E1', gap: '3px', marginRight: '0.5rem' }}>
            <button type="button" onClick={() => setCurrentView('nutriologa')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: currentView === 'nutriologa' ? '#FFFFFF' : 'transparent', color: currentView === 'nutriologa' ? '#2563EB' : '#64748B', fontWeight: currentView === 'nutriologa' ? '800' : '600', fontSize: '0.78rem', cursor: 'pointer' }}>
              <HeartPulse size={14} /> Nutrióloga
            </button>
            <button type="button" onClick={() => setCurrentView('chef')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: currentView === 'chef' ? '#FFFFFF' : 'transparent', color: currentView === 'chef' ? 'var(--green-dark)' : '#64748B', fontWeight: currentView === 'chef' ? '800' : '600', fontSize: '0.78rem', cursor: 'pointer' }}>
              <ChefHat size={14} /> Chef
            </button>
            <button type="button" onClick={() => setCurrentView('administracion')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: currentView === 'administracion' ? '#FFFFFF' : 'transparent', color: currentView === 'administracion' ? '#B45309' : '#64748B', fontWeight: currentView === 'administracion' ? '800' : '600', fontSize: '0.78rem', cursor: 'pointer' }}>
              <Users size={14} /> Residentes
            </button>
            <button type="button" onClick={() => setCurrentView('participant')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: currentView === 'participant' ? '#FFFFFF' : 'transparent', color: currentView === 'participant' ? '#059669' : '#64748B', fontWeight: currentView === 'participant' ? '800' : '600', fontSize: '0.78rem', cursor: 'pointer' }}>
              <BarChart2 size={14} /> Reportes y Compras
            </button>
          </div>
        )}
        {/* User Info & Role Lockdown Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.35rem 0.75rem', borderRadius: '9999px', border: '1px solid #E2E8F0' }}>
            
            {currentUser?.nombre?.includes('Karla') && (
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=faces" alt="Dra. Karla" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            )}
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155' }}>
{currentUser?.nombre || 'Usuario Activo'}
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: badge.bg, color: badge.color }}>
              {badge.label}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.2s ease'
              }}
            >
              Cerrar Sesión
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
