import React, { useState } from 'react';
import { X, Send, CheckCheck, Mail, MessageSquare, PhoneCall, Sparkles, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { chefInfo } from '../data/mockData';

export default function NotificationModal({ isOpen, onClose, selectedDayData, selectedOption, participantName = "Nutrióloga Karla" }) {
  const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp' | 'email'

  if (!isOpen || !selectedDayData) return null;

  const dishChosen = (typeof selectedOption === 'string' && selectedOption === 'B') 
    ? selectedDayData.optionB 
    : selectedDayData.optionA;

  const renderSelectedMenuText = () => {
    if (typeof selectedOption === 'string') {
      return `Opción ${selectedOption} (${dishChosen.name})`;
    }
    return `Sopa ${selectedOption.sopa} y Plato ${selectedOption.platoFuerte}`;
  };

  const menuText = renderSelectedMenuText();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(17, 24, 39, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: '#FFFFFF',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                Simulador de Notificación Automatizada
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Demostración visual de notificación enviada a los participantes de Retodali.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Channel Selector Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: '#FFFFFF'
        }}>
          <button
            onClick={() => setActiveTab('whatsapp')}
            style={{
              flex: 1,
              padding: '0.9rem',
              border: 'none',
              background: activeTab === 'whatsapp' ? 'var(--green-light)' : 'transparent',
              borderBottom: activeTab === 'whatsapp' ? '3px solid #16A34A' : '3px solid transparent',
              color: activeTab === 'whatsapp' ? '#15803D' : 'var(--text-muted)',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <MessageSquare size={18} color="#16A34A" />
            <span>Notificación WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            style={{
              flex: 1,
              padding: '0.9rem',
              border: 'none',
              background: activeTab === 'email' ? 'var(--primary-light)' : 'transparent',
              borderBottom: activeTab === 'email' ? '3px solid #DC2626' : '3px solid transparent',
              color: activeTab === 'email' ? '#DC2626' : 'var(--text-muted)',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Mail size={18} color="#DC2626" />
            <span>Notificación Correo Electrónico</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#F9FAFB', display: 'flex', justifyContent: 'center' }}>
          
          {activeTab === 'whatsapp' ? (
            /* WhatsApp Phone Mockup */
            <div className="phone-mockup">
              {/* WhatsApp Phone Header */}
              <div className="whatsapp-header">
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #16A34A, #15803D)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '0.9rem'
                }}>
                  N
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#E9EDEF' }}>
                    Nutrición | Retodali
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#8696A0' }}>
                    Cuenta de Empresa Verificada ✓
                  </div>
                </div>
              </div>

              {/* WhatsApp Chat Body */}
              <div className="whatsapp-chat">
                <div style={{
                  background: '#182229',
                  color: '#8696A0',
                  fontSize: '0.7rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  alignSelf: 'center',
                  margin: '0.2rem 0'
                }}>
                  Hoy, {selectedDayData.dateLabel}
                </div>

                {/* Incoming Bot Message */}
                <div className="whatsapp-bubble whatsapp-bubble-in">
                  <div style={{ fontWeight: '700', color: '#25D366', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    🥗 Menú Nutrición - Entrega {selectedDayData.dayName}
                  </div>
                  Hola <strong>{participantName}</strong>, recuerda personalizar tu menú para el <strong>{selectedDayData.dayName} ({selectedDayData.dateLabel})</strong> a través de la plataforma.
                  <div style={{ fontSize: '0.65rem', color: '#8696A0', textAlign: 'right', marginTop: '0.4rem' }}>
                    08:30 AM
                  </div>
                </div>

                {/* User Reply Bubble */}
                <div className="whatsapp-bubble">
                  Confirmado: {menuText} 👍
                  <div style={{ fontSize: '0.65rem', color: '#8696A0', textAlign: 'right', marginTop: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                    08:32 AM <CheckCheck size={13} color="#53BDEB" />
                  </div>
                </div>

                {/* Instant Bot Confirmation */}
                <div className="whatsapp-bubble whatsapp-bubble-in">
                  <div style={{ fontWeight: '600', color: '#25D366', marginBottom: '0.2rem' }}>
                    ¡Registrado con éxito! ✨
                  </div>
                  El Chef Mateo preparará tu platillo. Entrega estimada en tu oficina el {selectedDayData.dayName} a las 12:15 PM. ¡Que disfrutes tu comida!
                  <div style={{ fontSize: '0.65rem', color: '#8696A0', textAlign: 'right', marginTop: '0.4rem' }}>
                    08:32 AM
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Email HTML Template Mockup */
            <div style={{
              width: '100%',
              maxWidth: '580px',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}>
              {/* Email Client Header */}
              <div style={{ background: '#F9FAFB', padding: '0.85rem 1.25rem', borderBottom: '1px solid #E5E7EB', fontSize: '0.82rem', color: '#4B5563' }}>
                <div><strong>De:</strong> Nutrición Retodali &lt;notificaciones@nutricion.com&gt;</div>
                <div><strong>Para:</strong> {participantName} &lt;karla@retodali.com&gt;</div>
                <div><strong>Asunto:</strong> 🥗 Tu Menú de Nutrición para el {selectedDayData.dayName} ({selectedDayData.dateLabel})</div>
              </div>

              {/* Email Content Body */}
              <div style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '2px solid #FEF2F2', paddingBottom: '1rem' }}>
                  <div style={{ background: '#DC2626', color: 'white', padding: '0.5rem 0.8rem', borderRadius: '10px', fontWeight: '700' }}>
                    Nutrición
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Programa de Nutrición Empresarial</span>
                </div>

                <h3 style={{ color: 'var(--primary)', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                  ¡Hola {participantName}!
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  Aquí tienes la selección gastronómica programada para la entrega del <strong>{selectedDayData.dayName} ({selectedDayData.dateLabel})</strong> en las instalaciones de Retodali.
                </p>

                {/* Selected Dish Card in Email */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center'
                }}>
                  <img
                    src={dishChosen.image}
                    alt={dishChosen.name}
                    style={{ width: '85px', height: '85px', borderRadius: '12px', objectFit: 'cover' }}
                  />
                  <div>
                    <span className="badge-tag badge-red" style={{ marginBottom: '0.3rem' }}>
                      Menú Seleccionado
                    </span>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>
                      {typeof selectedOption === 'string' ? dishChosen.name : menuText}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {dishChosen.calories} kcal • Proteína: {dishChosen.protein} • Carbohidratos: {dishChosen.carbs}
                    </p>
                  </div>
                </div>

                <div style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--green-dark)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Clock size={18} />
                  <span><strong>Entrega Estimada:</strong> {selectedDayData.dayName} entre 12:00 PM y 12:30 PM.</span>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={chefInfo.avatar} alt={chefInfo.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{chefInfo.name}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{chefInfo.role}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          background: '#FFFFFF',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={15} color="var(--green-primary)" /> Notificaciones automáticas listas para producción
          </div>
          <button onClick={onClose} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            Cerrar Simulador
          </button>
        </div>

      </div>
    </div>
  );
}
