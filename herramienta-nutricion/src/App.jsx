import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import ParticipantView from './components/ParticipantView';
import AdminView from './components/AdminView';
import NutriologaView from './components/NutriologaView';
import ChefView from './components/ChefView';
import NotificationModal from './components/NotificationModal';
import LoginView from './components/LoginView';
import { cyclicMenus, sampleParticipants, chefInfo, nutriologaInfo } from './data/mockData';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('royal_role')));
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('royal_role') || 'participant'); // 'participant' | 'admin' | 'chef' | 'nutriologa'
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTarget, setNotificationTarget] = useState(null);

  // Active logged-in user state
  const [currentUser, setCurrentUser] = useState(() => {
    const role = localStorage.getItem('royal_role');
    if (role === 'chef') return { nombre: chefInfo.name, rol: 'Chef' };
    if (role === 'nutriologa') return { nombre: nutriologaInfo.name, rol: 'Nutrióloga' };
    return { nombre: 'Ana Sofía Morales', rol: 'Empleado' };
  });

  // Detectar rol activo por parámetro de URL (?role=chef | ?role=nutriologa)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam && ['participant', 'chef', 'nutriologa', 'admin'].includes(roleParam)) {
      handleLoginSuccess(roleParam, null);
    }
  }, []);

  const handleLoginSuccess = (roleKey, userObj) => {
    localStorage.setItem('royal_role', roleKey);
    setCurrentView(roleKey);
    setIsLoggedIn(true);

    if (userObj) {
      setCurrentUser(userObj);
    } else {
      if (roleKey === 'chef') setCurrentUser({ nombre: chefInfo.name, rol: 'Chef' });
      else if (roleKey === 'nutriologa') setCurrentUser({ nombre: nutriologaInfo.name, rol: 'Nutrióloga' });
      else setCurrentUser({ nombre: 'Ana Sofía Morales', rol: 'Empleado' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('royal_role');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const handleOpenNotification = (dayData, optionKey) => {
    setNotificationTarget({ dayData, optionKey });
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
      
      {/* Header con Rol Aislado y Botón de Cerrar Sesión */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container para el Rol Autenticado */}
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '1.5rem' }}>
        
        {currentView === 'participant' && (
          <ParticipantView
            selectedWeek={selectedWeek}
            onOpenNotification={handleOpenNotification}
            currentUser={currentUser}
          />
        )}

        {currentView === 'chef' && (
          <ChefView
            selectedWeek={selectedWeek}
          />
        )}

        {currentView === 'nutriologa' && (
          <NutriologaView
            selectedWeek={selectedWeek}
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
            <strong>Nutrición</strong> • Plataforma Corporativa (Cliente: Retodali)
          </div>
          <div>
            Acceso Directo de Presentación: 👤 Empleado • 👨‍🍳 Chef • 🥗 Nutrióloga
          </div>
        </div>
      </footer>

      {/* Interactive WhatsApp / Email Notification Modal */}
      {notificationTarget && (
        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          selectedDayData={notificationTarget.dayData}
          selectedOption={notificationTarget.optionKey}
          participantName={currentUser.name}
        />
      )}

    </div>
  );
}
