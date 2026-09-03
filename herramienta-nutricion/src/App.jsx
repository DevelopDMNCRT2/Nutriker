import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import ParticipantView from './components/ParticipantView';
import AdminView from './components/AdminView';
import NutriologaView from './components/NutriologaView';
import ChefView from './components/ChefView';
import NotificationModal from './components/NotificationModal';
import LoginModal from './components/LoginModal';
import { cyclicMenus, sampleParticipants } from './data/mockData';

export default function App() {
  const [currentView, setCurrentView] = useState('participant'); // 'participant' | 'admin' | 'chef' | 'nutriologa'
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [notificationTarget, setNotificationTarget] = useState(null);

  // Active logged-in user state
  const [currentUser, setCurrentUser] = useState(sampleParticipants[0]); // Nutrióloga Karla (Subsidized)

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
        'Administrador': 'participant',
      };
      const vista = rolMap[payload.rol] || 'participant';
      setCurrentView(vista);

      // Actualizar info del usuario si viene en el payload
      if (payload.nombre) {
        setCurrentUser(prev => ({ ...prev, name: payload.nombre }));
      }
    } catch (e) {
      console.error('SSO: token inválido', e);
    } finally {
      // Limpiar el parámetro sso de la URL sin recargar la página
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);


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
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      
      {/* Sticky Header with 4 Quick Presentation Roles */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '1.5rem' }}>
        
        {currentView === 'participant' && (
          <ParticipantView
            selectedWeek={selectedWeek}
            onOpenNotification={handleOpenNotification}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}

        {/* 
        {currentView === 'admin' && (
          <AdminView
            selectedWeek={selectedWeek}
            initialTab="financial"
          />
        )}
        */}

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

      {/* Quick Access Presentation Roles & Credentials Simulator Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSelectRole={handleSelectRole}
      />

    </div>
  );
}
