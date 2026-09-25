import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Mail, Home, ShieldCheck, User, ChefHat, HeartPulse, ArrowRight } from 'lucide-react';
import { sampleParticipants, chefInfo, nutriologaInfo } from '../data/mockData';
import { API_BASE_URL } from '../services/menuStore';

export default function LoginModal({ isOpen, onClose, onSelectRole }) {
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const [loginState, setLoginState] = useState('idle'); // 'idle' | 'loading' | 'error' | 'success'
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginState('loading');
    setErrorMessage('');

    const formData = new FormData(e.target);
    const roleId = formData.get('role');
    
    // Auth backend
    if (roleId === 'chef' || roleId === 'nutriologa' || roleId === 'participant') {
              const email = formData.get('email');
              const password = formData.get('password');
              try {
                const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                
                if (!res.ok) {
                  throw new Error(data.error || 'Credenciales incorrectas');
                }

                // Guardar token y datos localmente si es necesario
                localStorage.setItem('nutriker_token', data.token);
                localStorage.setItem('nutriker_user', JSON.stringify(data.usuario));
                
                setLoginState('success');
                setTimeout(() => {
                  onSelectRole(roleId, data.usuario);
                  onClose();
                  setLoginState('idle');
                }, 800);
              } catch (err) {
                console.error(err);
                setErrorMessage(err.message);
                setLoginState('error');
              }
              return;
    }

    // Fallback genérico para rol no definido
    setErrorMessage('Rol no válido');
    setLoginState('error');
  };

  return createPortal(
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '1.25rem',
        overflowY: 'auto',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', overflow: 'hidden',
        border: '1px solid #E2E8F0', animation: 'scaleIn 0.2s ease-out'
      }}>
        {/* Banner Casa Nostra */}
        <div style={{
          background: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
          padding: '2rem 2rem 1.5rem',
          position: 'relative',
          color: '#FFFFFF'
        }}>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#FFFFFF', transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Home size={32} color="#FEF3C7" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Casa Nostra
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#FEF3C7', opacity: 0.9 }}>
            Portal de Nutrición Geriátrica
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ padding: '2rem' }}>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Selecciona tu Perfil
            </label>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                border: '1px solid #E5E7EB', borderRadius: '12px', cursor: 'pointer',
                transition: 'all 0.2s', background: '#F9FAFB'
              }}>
                <input type="radio" name="role" value="participant" defaultChecked style={{ accentColor: '#B45309' }} />
                <User size={18} color="#6B7280" />
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1F2937' }}>Residente / Familia</span>
              </label>

              <label style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                border: '1px solid #E5E7EB', borderRadius: '12px', cursor: 'pointer',
                transition: 'all 0.2s', background: '#F9FAFB'
              }}>
                <input type="radio" name="role" value="chef" style={{ accentColor: '#B45309' }} />
                <ChefHat size={18} color="#6B7280" />
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1F2937' }}>Chef / Cocina</span>
              </label>

              <label style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                border: '1px solid #E5E7EB', borderRadius: '12px', cursor: 'pointer',
                transition: 'all 0.2s', background: '#F9FAFB'
              }}>
                <input type="radio" name="role" value="nutriologa" style={{ accentColor: '#B45309' }} />
                <HeartPulse size={18} color="#6B7280" />
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1F2937' }}>Nutrióloga Clínica</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Usuario o Correo
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                name="email"
                placeholder="Ej. nutri_karla, chef_fabiola"
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                  border: '1px solid #D1D5DB', borderRadius: '12px',
                  fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#B45309'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                  border: '1px solid #D1D5DB', borderRadius: '12px',
                  fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#B45309'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>
          </div>

          {errorMessage && (
            <div style={{ 
              marginBottom: '1.5rem', padding: '0.75rem', background: '#FEF2F2', 
              borderLeft: '4px solid #EF4444', borderRadius: '0 8px 8px 0',
              fontSize: '0.85rem', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <ShieldCheck size={16} />
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loginState === 'loading' || loginState === 'success'}
            style={{
              width: '100%', padding: '0.875rem',
              background: loginState === 'success' ? '#10B981' : '#B45309',
              color: '#FFFFFF', border: 'none', borderRadius: '12px',
              fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'background 0.2s, transform 0.1s',
              boxShadow: '0 4px 6px -1px rgba(180, 83, 9, 0.2)'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loginState === 'loading' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Verificando...
              </span>
            ) : loginState === 'success' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} /> Acceso Correcto
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Ingresar al Portal <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body
  );
}
