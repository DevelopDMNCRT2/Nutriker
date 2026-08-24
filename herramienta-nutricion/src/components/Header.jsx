import React from 'react';
import { Salad, Calendar, UtensilsCrossed, ShieldCheck, Building2, User, KeyRound, ChefHat, HeartPulse, Sparkles } from 'lucide-react';
import { programInfo } from '../data/mockData';

export default function Header({ currentView, setCurrentView, selectedWeek, setSelectedWeek, currentUser, onOpenLogin }) {
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
                Nutrición
              </h1>
              <span className="badge-tag badge-red" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }}>
                <Building2 size={11} /> Cliente: <strong>{programInfo.clientProject}</strong>
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Entregas: <strong>Lunes, Miércoles y Viernes</strong>
            </p>
          </div>
        </div>

        {/* 4 Quick Access Presentation Role Switcher (Empleado / Admin / Chef / Nutrióloga) */}
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.2rem', borderRadius: '9999px', flexWrap: 'wrap', gap: '0.15rem' }}>
          <button
            onClick={() => setCurrentView('participant')}
            style={{
              border: 'none',
              background: currentView === 'participant' ? 'var(--primary)' : 'transparent',
              color: currentView === 'participant' ? '#FFFFFF' : 'var(--text-muted)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <User size={13} /> Empleado
          </button>

          {/* Oculto temporalmente
          <button
            onClick={() => setCurrentView('admin')}
            style={{
              border: 'none',
              background: currentView === 'admin' ? '#0F172A' : 'transparent',
              color: currentView === 'admin' ? '#FFFFFF' : 'var(--text-muted)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <ShieldCheck size={13} /> Admin
          </button>
          */}

          <button
            onClick={() => setCurrentView('chef')}
            style={{
              border: 'none',
              background: currentView === 'chef' ? 'var(--green-dark)' : 'transparent',
              color: currentView === 'chef' ? '#FFFFFF' : 'var(--text-muted)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <ChefHat size={13} /> Chef
          </button>

          <button
            onClick={() => setCurrentView('nutriologa')}
            style={{
              border: 'none',
              background: currentView === 'nutriologa' ? '#2563EB' : 'transparent',
              color: currentView === 'nutriologa' ? '#FFFFFF' : 'var(--text-muted)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <HeartPulse size={13} /> Nutrióloga Karla
          </button>
        </div>

        {/* Quick Demo Switcher Trigger Button */}
        <button
          onClick={onOpenLogin}
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--primary-border)',
            color: 'var(--primary)',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            boxShadow: '0 2px 6px rgba(225, 29, 72, 0.08)'
          }}
        >
          <Sparkles size={13} /> Panel Demo
        </button>

      </div>
    </header>
  );
}
