import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import StatsView from './components/StatsView';
import AdminView from './components/AdminView';
import NutriologaView from './components/NutriologaView';
import ChefView from './components/ChefView';
import NotificationModal from './components/NotificationModal';
import LoginView from './components/LoginView';
import AdministracionView from './components/AdministracionView';
import { cyclicMenus, sampleParticipants, chefInfo, nutriologaInfo } from './data/mockData';
import { getWeekInfoFromDate, API_BASE_URL } from './services/menuStore';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('token'));
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('royal_user');
      if (savedUser) return JSON.parse(savedUser);
      const token = localStorage.getItem('token');
      if (token) {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
          return {
            id: payload.id,
            nombre: payload.nombre,
            correo: payload.correo,
            rol: payload.rol
          };
        }
      }
    } catch {}
    return { nombre: 'Dra. Karla', rol: 'Nutriologa' };
  });

  const isSuperAdmin = currentUser?.rol === 'SuperAdmin' || currentUser?.rol === 'Super Administrador';
  const isAdmin = currentUser?.rol === 'Admin' || currentUser?.rol === 'Administrador' || isSuperAdmin;

  const [currentView, setCurrentView] = useState(() => {
    const userRole = currentUser?.rol;
    if (userRole === 'Nutriologa') return 'nutriologa';
    if (userRole === 'Chef') return 'chef';
    if (userRole === 'Admin' || userRole === 'Administrador') return 'participant';
    const saved = localStorage.getItem('royal_role');
    return saved || 'nutriologa';
  });

  const [selectedWeek, setSelectedWeek] = useState(() => getWeekInfoFromDate(new Date()).weekNumber);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTarget, setNotificationTarget] = useState(null);

  // Active Service Profile (Corporate B2B vs Senior Care)
  const [serviceProfileKey, setServiceProfileKey] = useState('casa_nostra');

  const handleServiceProfileChange = (newKey) => {
    setServiceProfileKey(newKey);
    localStorage.setItem('nutriker_service_profile', newKey);
  };

  // Bloqueo estricto de vistas según el rol autenticado
  useEffect(() => {
    if (!isLoggedIn || isSuperAdmin) return;
    const userRole = currentUser?.rol;
    if (userRole === 'Nutriologa' && currentView !== 'nutriologa') {
      setCurrentView('nutriologa');
    } else if (userRole === 'Chef' && currentView !== 'chef') {
      setCurrentView('chef');
    } else if ((userRole === 'Admin' || userRole === 'Administrador') && currentView !== 'participant') {
      setCurrentView('participant');
    }
  }, [isLoggedIn, isSuperAdmin, currentUser?.rol, currentView]);

  // Detectar rol activo por parámetro de URL (?role=chef | ?role=nutriologa)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam && ['participant', 'chef', 'nutriologa', 'admin'].includes(roleParam)) {
      handleLoginSuccess(roleParam === 'admin' ? 'nutriologa' : roleParam, null);
    }
  }, []);

  const handleLoginSuccess = (roleKey, userObj) => {
    setIsLoggedIn(true);

    if (userObj) {
      setCurrentUser(userObj);
      localStorage.setItem('royal_user', JSON.stringify(userObj));
      
      const roleMap = {
        'Nutriologa': 'nutriologa',
        'Chef': 'chef',
        'Admin': 'participant',
        'Administrador': 'participant',
        'SuperAdmin': 'nutriologa',
        'Super Administrador': 'nutriologa'
      };
      const targetView = roleMap[userObj.rol] || roleKey;
      setCurrentView(targetView);
      localStorage.setItem('royal_role', targetView);
    } else {
      setCurrentView(roleKey);
      localStorage.setItem('royal_role', roleKey);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('royal_role');
    localStorage.removeItem('royal_user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  // SSO: detectar token de entrada desde NutriKer Admin al montar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('sso');
    if (!ssoToken) return;

    try {
      // Decodificar el payload del JWT (parte central, base64url)
      const payloadBase64 = ssoToken.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));

      // Mapear el rol del token a la vista correspondiente
      const rolMap = {
        'Nutriologa': 'nutriologa',
        'Chef': 'chef',
        'Empleado': 'participant',
        'Administrador': 'nutriologa',
      };
      const vista = rolMap[payload.rol] || 'nutriologa';

      const userObj = {
        id: payload.id,
        nombre: payload.nombre || (payload.rol === 'Administrador' ? 'Administrador' : 'Nutrióloga'),
        correo: payload.correo,
        rol: payload.rol || 'Administrador',
        empresa: 'Casa Nostra'
      };

      handleLoginSuccess(vista, userObj);
      localStorage.setItem('token', ssoToken);
    } catch (e) {
      console.error('SSO: token inválido', e);
    } finally {
      // Limpiar el parámetro sso de la URL sin recargar la página
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  // Asegurar token de autenticación para la demo/dev si el usuario está autenticado por defecto
  useEffect(() => {
    if (isLoggedIn && !localStorage.getItem('token')) {
      fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nutri_karla', password: 'admin123' })
      })
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data && data.token) {
            localStorage.setItem('token', data.token);
            window.dispatchEvent(new CustomEvent('casa_nostra_auth_ready'));
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn]);


  const handleOpenNotification = (dayData, optionKey, activeMenu, allSelections) => {
    setNotificationTarget({ dayData, optionKey, activeMenu, allSelections });
    setIsNotificationOpen(true);
    
    // Trigger red & green festive confetti
    confetti({
      particleCount: 55,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#DC2626', '#16A34A', '#EF4444', '#22C55E']
    });
  };

  const handleSelectRole = (roleKey) => {
    setCurrentView(roleKey);
    localStorage.setItem('royal_role', roleKey);
  };

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      
      {/* Header con Rol Aislado, Selector de Modelo de Servicio y Botón de Cerrar Sesión */}

      {/* Header con Selector Exclusivo para Super Administrador */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        currentUser={currentUser}
        isAdmin={isAdmin}
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
        serviceProfileKey={serviceProfileKey}
        onServiceProfileChange={handleServiceProfileChange}
      />

      {/* Main Container para el Rol Autenticado */}
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '1.5rem' }}>
        
        {(currentView === 'participant' || currentView === 'administracion') && (
          <StatsView
            selectedWeek={selectedWeek}
          />
        )}

        {currentView === 'chef' && (
          <ChefView
            selectedWeek={selectedWeek}
            serviceProfileKey={serviceProfileKey}
          />
        )}

        {currentView === 'nutriologa' && (
          <NutriologaView
            selectedWeek={selectedWeek}
            serviceProfileKey={serviceProfileKey}
          />
        )}

      </main>

      {/* Footer */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <strong>Nutrición</strong> • {serviceProfileKey === 'senior_care' ? 'Modelo Especializado: Residencia de Mayores (Santa Sofía)' : 'Plataforma Geriátrica (Casa Nostra)'}
          </div>
          <div>
            Acceso Directo de Presentación: 👤 {serviceProfileKey === 'senior_care' ? 'Residente / Enfermería' : 'Empleado'} • 👨‍🍳 Chef • 🥗 Nutrióloga

<strong>Nutrición</strong> • Plataforma Geriátrica (Casa Nostra)
          </div>
          {isAdmin && (
            <div style={{ fontSize: '0.75rem', color: '#6366F1', fontWeight: '700' }}>
              Modo Administrador Activo • Acceso Total a Herramientas
            </div>
          )}
        </div>
      </footer>

      {/* Interactive WhatsApp / Email Notification Modal */}
      {notificationTarget && (
        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          selectedDayData={notificationTarget.dayData}
          selectedOption={notificationTarget.optionKey}
          activeMenu={notificationTarget.activeMenu}
          allSelections={notificationTarget.allSelections}
          participantName={currentUser?.nombre || currentUser?.name || 'Residente Casa Nostra'}
        />
      )}


      {/* Demo Switcher Bar (Bottom Floating) - Visible únicamente para Super Administrador */}
      {isSuperAdmin && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '50px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 99999,
          fontSize: '0.85rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <strong style={{ color: '#FDE68A' }}>🚀 SUPER ADMIN:</strong>
          <button 
            onClick={() => setCurrentView('nutriologa')}
            style={{ background: currentView === 'nutriologa' ? '#B45309' : 'transparent', color: 'white', border: currentView === 'nutriologa' ? 'none' : '1px solid #64748B', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            🩺 Nutrióloga
          </button>
          <button 
            onClick={() => setCurrentView('chef')}
            style={{ background: currentView === 'chef' ? '#B45309' : 'transparent', color: 'white', border: currentView === 'chef' ? 'none' : '1px solid #64748B', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            👨‍🍳 Cocina
          </button>
          <button 
            onClick={() => setCurrentView('participant')}
            style={{ background: (currentView === 'participant' || currentView === 'administracion') ? '#B45309' : 'transparent', color: 'white', border: (currentView === 'participant' || currentView === 'administracion') ? 'none' : '1px solid #64748B', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            📊 Administración y Reportes
          </button>
        </div>
      )}

    </div>
  );
}
