import React, { useState } from 'react';
import { User, Phone, Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, Utensils, Clock, Building2 } from 'lucide-react';
import { API_BASE_URL } from '../services/menuStore';
import BlurredAppBackdrop from './BlurredAppBackdrop';

export default function RegisterView({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    codigoInvitacion: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (field, value) => {
    let finalValue = value;
    if (field === 'telefono') {
      finalValue = value.replace(/\D/g, '').slice(0, 13);
    }
    setFormData(prev => ({ ...prev, [field]: finalValue }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { nombre, telefono, correo, contrasena, confirmarContrasena, codigoInvitacion } = formData;

    if (!nombre.trim() || !telefono.trim() || !correo.trim() || !contrasena) {
      setErrorMsg('Por favor completa todos los campos del formulario.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim())) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const cleanPhone = telefono.trim().replace(/\D/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 13) {
      setErrorMsg('El número de teléfono debe contener entre 8 y 13 dígitos numéricos.');
      return;
    }

    if (contrasena.length < 6) {
      setErrorMsg('La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setErrorMsg('Las contraseñas no coinciden. Verifícalas con atención.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/registro-empleado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          correo: correo.trim().toLowerCase(),
          contrasena,
          confirmarContrasena,
          codigoInvitacion: codigoInvitacion ? codigoInvitacion.trim() : undefined
        })
      });

      const data = await res.json();

      if (res.ok && data.usuario) {
        setSuccessMsg('¡Cuenta creada con éxito! Entrando al sistema...');
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        try {
          const registered = JSON.parse(localStorage.getItem('royal_registered_users') || '[]');
          const idx = registered.findIndex(u => u.correo === data.usuario.correo);
          if (idx !== -1) registered[idx] = data.usuario;
          else registered.push(data.usuario);
          localStorage.setItem('royal_registered_users', JSON.stringify(registered));
          localStorage.setItem('royal_user', JSON.stringify(data.usuario));
        } catch (e) {}

        setTimeout(() => {
          onRegisterSuccess(data.usuario, data.token);
        }, 1100);
      } else {
        setErrorMsg(data.error || 'No se pudo completar el registro. Intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error de red al registrar usuario:', err);
      setErrorMsg('No se pudo conectar con el servidor. Por favor verifica tu conexión o intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = formData.contrasena && formData.confirmarContrasena && formData.contrasena === formData.confirmarContrasena;
  const passwordsMismatch = formData.confirmarContrasena && formData.contrasena !== formData.confirmarContrasena;

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.25rem',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      overflow: 'hidden'
    }}>
      {/* Fondo Desenfocado con Profundidad Óptica (Bokeh / Profundidad de Campo) */}
      <BlurredAppBackdrop />

      {/* Modal Principal con Profundidad Optica y Elevación */}
      <div style={{
        maxWidth: '960px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '28px',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 35px 90px -15px rgba(15, 23, 42, 0.38), 0 20px 45px -10px rgba(226, 0, 26, 0.26), 0 0 0 1px rgba(255, 255, 255, 0.7), 0 0 60px -5px rgba(226, 0, 26, 0.15)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Panel Izquierdo: Branding & Identidad Royal Canin */}
        <div style={{
          background: 'linear-gradient(145deg, #111827 0%, #1F2937 60%, #374151 100%)',
          color: 'white',
          padding: '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Acento rojo superior luminoso */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(226, 0, 26, 0.45) 0%, rgba(226, 0, 26, 0) 70%)',
            filter: 'blur(20px)',
            pointerEvents: 'none'
          }} />

          <div>
            {/* Header Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
              <div style={{
                background: '#E2001A',
                color: 'white',
                fontWeight: '900',
                padding: '0.45rem 0.9rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                boxShadow: '0 4px 14px rgba(226, 0, 26, 0.4)'
              }}>
                ROYAL CANIN
              </div>
            </div>

            <h2 style={{
              fontSize: '1.85rem',
              fontWeight: '800',
              lineHeight: 1.25,
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
              color: '#FFFFFF'
            }}>
              Bienvenido al portal exclusivo de colaboradores
            </h2>

            <p style={{
              color: '#D1D5DB',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}>
              Registra tu cuenta corporativa para programar y personalizar tus opciones de menú institucional cada semana.
            </p>

            {/* Puntos clave */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{
                  background: 'rgba(226, 0, 26, 0.18)',
                  color: '#F87171',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(226, 0, 26, 0.3)'
                }}>
                  <Utensils size={18} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.88rem', fontWeight: '700', color: '#F3F4F6' }}>
                    Menús Cíclicos Especializados
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#9CA3AF' }}>
                    Opciones balanceadas avaladas por nutrición clínica.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#4ADE80',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(34, 197, 94, 0.25)'
                }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.88rem', fontWeight: '700', color: '#F3F4F6' }}>
                    Selección Rápida en 1 Clic
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#9CA3AF' }}>
                    Programa tus platillos para Lunes, Miércoles y Viernes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.75rem',
            color: '#9CA3AF'
          }}>
            Royal Canin México • Todos los derechos reservados
          </div>
        </div>

        {/* Panel Derecho: Formulario de Registro Estilizado */}
        <div style={{ padding: '2.5rem 2.25rem', background: '#FFFFFF' }}>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: '900',
              color: '#0F172A',
              margin: '0 0 0.25rem 0',
              letterSpacing: '-0.02em'
            }}>
              Crear Cuenta de Empleado
            </h1>
          </div>

          {/* Mensajes de Alerta */}
          {errorMsg && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #86EFAC',
              color: '#166534',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '700'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Formulario en Grid Compacta */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Fila 1: Nombre y Teléfono en dos columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Nombre Completo <span style={{ color: '#E2001A' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={e => handleChange('nombre', e.target.value)}
                    placeholder="Carlos Mendoza"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.75rem 0.7rem 2.4rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: '#F8FAFC'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#E2001A'; e.target.style.background = '#FFFFFF'; }}
                    onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.background = '#F8FAFC'; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Teléfono Móvil <span style={{ color: '#E2001A' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={13}
                    value={formData.telefono}
                    onChange={e => handleChange('telefono', e.target.value)}
                    placeholder="5512345678"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.75rem 0.7rem 2.4rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: '#F8FAFC'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#E2001A'; e.target.style.background = '#FFFFFF'; }}
                    onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.background = '#F8FAFC'; }}
                  />
                </div>
              </div>
            </div>

            {/* Fila 2: Correo Electrónico */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Correo Electrónico <span style={{ color: '#E2001A' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="email"
                  value={formData.correo}
                  onChange={e => handleChange('correo', e.target.value)}
                  placeholder="empleado@royalcanin.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.75rem 0.7rem 2.4rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    background: '#F8FAFC'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#E2001A'; e.target.style.background = '#FFFFFF'; }}
                  onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.background = '#F8FAFC'; }}
                />
              </div>
            </div>

            {/* Fila 2.5: Código de Invitación / Empresa (Opcional con correo corporativo) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155' }}>
                  Código de Empresa / Invitación <span style={{ color: '#64748B', fontWeight: '500', fontSize: '0.7rem' }}>(Opcional para correo corporativo)</span>
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Building2 size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  value={formData.codigoInvitacion}
                  onChange={e => handleChange('codigoInvitacion', e.target.value)}
                  placeholder="Ej. ROYAL2026 (solo si no usas @royalcanin.com)"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.75rem 0.7rem 2.4rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    background: '#F8FAFC'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#E2001A'; e.target.style.background = '#FFFFFF'; }}
                  onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.background = '#F8FAFC'; }}
                />
              </div>
            </div>

            {/* Fila 3: Contraseña y Confirmar Contraseña en dos columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Contraseña (mín. 6) <span style={{ color: '#E2001A' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.contrasena}
                    onChange={e => handleChange('contrasena', e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 2.2rem 0.7rem 2.4rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: '#F8FAFC'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#E2001A'; e.target.style.background = '#FFFFFF'; }}
                    onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.background = '#F8FAFC'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155' }}>
                    Confirmar <span style={{ color: '#E2001A' }}>*</span>
                  </label>
                  {passwordsMatch && (
                    <span style={{ fontSize: '0.68rem', color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <CheckCircle2 size={11} /> Coinciden
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span style={{ fontSize: '0.68rem', color: '#DC2626', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <AlertCircle size={11} /> No coinciden
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <ShieldCheck size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: passwordsMismatch ? '#DC2626' : (passwordsMatch ? '#16A34A' : '#94A3B8') }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmarContrasena}
                    onChange={e => handleChange('confirmarContrasena', e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 2.2rem 0.7rem 2.4rem',
                      borderRadius: '10px',
                      border: passwordsMismatch ? '1.5px solid #F87171' : (passwordsMatch ? '1.5px solid #86EFAC' : '1.5px solid #CBD5E1'),
                      fontSize: '0.85rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: '#F8FAFC'
                    }}
                    onFocus={e => {
                      if (!passwordsMismatch && !passwordsMatch) {
                        e.target.style.borderColor = '#E2001A';
                        e.target.style.background = '#FFFFFF';
                      }
                    }}
                    onBlur={e => {
                      if (!passwordsMismatch && !passwordsMatch) {
                        e.target.style.borderColor = '#CBD5E1';
                        e.target.style.background = '#F8FAFC';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Botón Principal de Envío */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #E2001A 0%, #B91C1C 100%)',
                color: 'white',
                border: 'none',
                padding: '0.85rem',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.92rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 20px -4px rgba(226, 0, 26, 0.4)',
                marginTop: '0.25rem',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.75 : 1
              }}
            >
              {loading ? 'Registrando Colaborador...' : (
                <>
                  Registrarme como Empleado <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Enlace para volver al Login */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #F1F5F9',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: '#64748B'
          }}>
            ¿Ya tienes una cuenta registrada?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
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
              Inicia Sesión aquí
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
