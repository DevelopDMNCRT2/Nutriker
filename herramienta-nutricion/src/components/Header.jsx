import React from 'react';
import { Salad, Calendar, UtensilsCrossed, ShieldCheck, Building2, User, KeyRound, ChefHat, HeartPulse, Sparkles } from 'lucide-react';
import { programInfo } from '../data/mockData';

export default function Header({ currentView, setCurrentView, selectedWeek, setSelectedWeek, currentUser, onOpenLogin, onLogout }) {
  const getRoleBadge = () => {
    if (currentView === 'chef') return { label: 'Chef', color: 'var(--green-dark)', bg: 'var(--green-light)' };
    if (currentView === 'nutriologa') return { label: 'Nutrióloga', color: '#2563EB', bg: '#EFF6FF' };
    return { label: 'Empleado', color: 'var(--primary)', bg: 'var(--primary-light)' };
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
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 10px rgba(225, 29, 72, 0.25)'
          }}>
            <Salad size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                NutriKer
              </h1>
              <span className="badge-tag badge-red" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }}>
                <Building2 size={11} /> <strong>{programInfo.clientProject}</strong>
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Entregas: <strong>Lunes, Miércoles y Viernes</strong>
            </p>
          </div>
        </div>

        {/* User Info & Role Lockdown Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.35rem 0.75rem', borderRadius: '9999px', border: '1px solid #E2E8F0' }}>
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
