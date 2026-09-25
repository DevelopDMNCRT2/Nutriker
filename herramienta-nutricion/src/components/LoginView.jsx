import React, { useState } from 'react';
import { Lock, User, ArrowRight, Salad } from 'lucide-react';
import { chefInfo, nutriologaInfo } from '../data/mockData';
import { API_BASE_URL } from '../services/menuStore';
import BlurredAppBackdrop from './BlurredAppBackdrop';

export default function LoginView({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        const roleMap = {
          'Nutriologa': 'nutriologa',
          'Chef': 'chef',
          'Empleado': 'participant',
          'Administrador': 'nutriologa'
        };
        const mappedRole = roleMap[data.usuario?.rol] || 'participant';
        onLoginSuccess(mappedRole, data.usuario);
      } else {
        setErrorMsg(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      // Fallback para simulación si el servidor local está en desarrollo
      const userLower = username.toLowerCase();
      if (userLower.includes('chef')) {
        onLoginSuccess('chef', { nombre: chefInfo.name, rol: 'Chef' });
      } else if (userLower.includes('nutri') || userLower.includes('karla')) {
        onLoginSuccess('nutriologa', { nombre: nutriologaInfo.name, rol: 'Nutriologa' });
      } else {
        const savedUsers = JSON.parse(localStorage.getItem('royal_registered_users') || '[]');
        const matched = savedUsers.find(u => u.correo?.toLowerCase() === username.trim().toLowerCase());
        const dynamicName = matched?.nombre || (
          username.includes('@')
            ? username.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            : username.trim()
        );
        onLoginSuccess('participant', {
          id: matched?.id || 'EMP-' + Math.floor(1000 + Math.random() * 9000),
          nombre: dynamicName,
          correo: username.trim().toLowerCase(),
          rol: 'Empleado',
          empresa: 'Royal Canin'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      overflow: 'hidden'
    }}>
      {/* Fondo Desenfocado con Profundidad Óptica (Bokeh / Profundidad de Campo) */}
      <BlurredAppBackdrop />

      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 32px 85px -15px rgba(15, 23, 42, 0.36), 0 18px 40px -10px rgba(226, 0, 26, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.7), 0 0 50px -5px rgba(226, 0, 26, 0.12)',
        padding: '2.5rem 2rem',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Header / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: '#E2001A',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(226, 0, 26, 0.25)'
          }}>
            <Salad size={26} />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A' }}>
            NutriKer <span style={{ color: '#E2001A' }}>Royal Canin</span>
          </h1>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>
            Plataforma Institucional de Nutrición Corporativa
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {/* Formulario Limpio */}
        <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Usuario / Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nombre@correo.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '12px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: '#FFFFFF'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '12px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: '#FFFFFF'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#E2001A',
              color: 'white',
              border: 'none',
              padding: '0.85rem',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(226, 0, 26, 0.25)',
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Verificando...' : <>Ingresar al Sistema <ArrowRight size={18} /></>}
          </button>
        </form>

        {/* Enlace para registrarse como empleado */}
        {onSwitchToRegister && (
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #F1F5F9',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#64748B'
          }}>
            ¿Eres colaborador de Royal Canin y aún no tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#E2001A',
                fontWeight: '800',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              Regístrate aquí
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
