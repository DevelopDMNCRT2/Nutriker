import React from 'react';
import { X, Lock, Mail, Building2, ShieldCheck, User, ChefHat, HeartPulse, Sparkles, ArrowRight } from 'lucide-react';
import { sampleParticipants, chefInfo, nutriologaInfo } from '../data/mockData';

export default function LoginModal({ isOpen, onClose, onSelectRole }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: '1rem',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #E2E8F0'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white' }}>
                Acceso Rápido de Demostración (Presentación Cliente)
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
              Selecciona cualquier rol con un clic para probar la plataforma desde diferentes perspectivas.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Quick Access Role Cards Grid */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', background: '#F8FAFC' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            
            {/* ROLE 1: EMPLEADO */}
            <button
              onClick={() => { onSelectRole('participant'); onClose(); }}
              style={{
                background: '#FFFFFF',
                border: '2px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.25rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem' }}>
                  <User size={22} />
                </div>
                <span className="badge-tag badge-red">Vista Empleado</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>
                1. Empleado (Ana Sofía Morales)
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Selección de platillos para L/M/V y simulación de notificaciones por WhatsApp.
              </p>
              <div style={{ marginTop: 'auto', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Entrar como Empleado <ArrowRight size={14} />
              </div>
            </button>

            {/* ROLE 2: ADMINISTRADOR (Oculto temporalmente)
            <button
              onClick={() => { onSelectRole('admin'); onClose(); }}
              style={{
                background: '#FFFFFF',
                border: '2px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.25rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F1F5F9', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem' }}>
                  <Building2 size={22} />
                </div>
                <span className="badge-tag" style={{ background: '#F1F5F9', color: '#0F172A' }}>Vista Admin</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>
                2. Administrador (Dirección & Gil)
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Desglose financiero mensual ($50,760 MXN), transparencia fiscal, facturación y despacho masivo.
              </p>
              <div style={{ marginTop: 'auto', fontSize: '0.8rem', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Entrar como Administrador <ArrowRight size={14} />
              </div>
            </button>
            */}

            {/* ROLE 3: CHEF */}
            <button
              onClick={() => { onSelectRole('chef'); onClose(); }}
              style={{
                background: '#FFFFFF',
                border: '2px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.25rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--green-light)', color: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem' }}>
                  <ChefHat size={22} />
                </div>
                <span className="badge-tag badge-green">Vista Chef</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>
                3. Chef ({chefInfo.name})
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Consolidado de porciones por platillo para producción de cocina en Lunes, Miércoles y Viernes.
              </p>
              <div style={{ marginTop: 'auto', fontSize: '0.8rem', fontWeight: '700', color: 'var(--green-dark)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Entrar como Chef <ArrowRight size={14} />
              </div>
            </button>

            {/* ROLE 4: NUTRIOLOGA */}
            <button
              onClick={() => { onSelectRole('nutriologa'); onClose(); }}
              style={{
                background: '#FFFFFF',
                border: '2px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.25rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem' }}>
                  <HeartPulse size={22} />
                </div>
                <span className="badge-tag" style={{ background: '#EFF6FF', color: '#2563EB' }}>Vista Nutrióloga</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>
                4. Nutrióloga ({nutriologaInfo.name})
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Supervisión calórica (menor a 520 kcal), semáforo de alérgenos, aporte de proteínas y fibra.
              </p>
              <div style={{ marginTop: 'auto', fontSize: '0.8rem', fontWeight: '700', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Entrar como Nutrióloga <ArrowRight size={14} />
              </div>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
