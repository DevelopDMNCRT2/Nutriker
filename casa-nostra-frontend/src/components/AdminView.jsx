import React, { useState, useEffect } from 'react';
import { ChefHat, Users, Send, CheckCircle2, DollarSign, Calendar, FileText, Download, BarChart2, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { cyclicMenus, sampleParticipants, financialStrategy, chefInfo, programInfo } from '../data/mockData';

export default function AdminView({ selectedWeek, initialTab = 'financial' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'financial' | 'production' | 'notifications'
  
  const [dispatchStatus, setDispatchStatus] = useState('idle');
  const [dispatchProgress, setDispatchProgress] = useState(0);

  useEffect(() => {
    if (initialTab) {
      // Ensure 'wizard' doesn't stay as initialTab if passed from old state
      setActiveTab(initialTab === 'wizard' ? 'financial' : initialTab);
    }
  }, [initialTab]);

  const weekData = cyclicMenus.find(w => w.weekNumber === selectedWeek) || cyclicMenus[0];

  const handleStartDispatch = () => {
    setDispatchStatus('sending');
    setDispatchProgress(10);
    const interval = setInterval(() => {
      setDispatchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDispatchStatus('completed');
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Admin Top Dashboard Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem 1.75rem',
        marginBottom: '1.5rem',
        background: '#FFFFFF',
        color: 'var(--text-dark)',
        borderRadius: '16px',
        borderLeft: '5px solid #0F172A',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <span className="badge-tag badge-red">
                Gestión Administrativa y Financiera
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cliente: Retodali S.A. de C.V.</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)' }}>
              Panel de Administración (Dirección)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Consolidado de producción, modelo comercial y notificaciones masivas.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: 'var(--green-light)', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid var(--green-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--green-dark)', fontWeight: '600' }}>Participantes Activos</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--green-dark)' }}>{programInfo.activeParticipantsCount}</div>
            </div>
            <div style={{ background: 'var(--primary-light)', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid #FCA5A5', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>Frecuencia</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>3 Días / Sem (L/M/V)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('financial')}
          className={`btn-outline ${activeTab === 'financial' ? 'active' : ''}`}
        >
          <DollarSign size={16} /> Estrategia Comercial & Facturación
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`btn-outline ${activeTab === 'production' ? 'active' : ''}`}
        >
          <ChefHat size={16} /> Lotes de Producción para Cocina
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`btn-outline ${activeTab === 'notifications' ? 'active' : ''}`}
        >
          <Send size={16} /> Despacho Masivo de Notificaciones
        </button>
      </div>

      {/* TAB FINANCIAL */}
      {activeTab === 'financial' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Summary Card */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '5px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <Shield size={18} color="var(--primary)" />
              <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--primary)' }}>
                Estrategia Comercial Acordada en Reunión (Nutrióloga Karla & Gil)
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
              Modelo de Costo Distribuido Mensual & Transparencia Fiscal
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', maxWidth: '800px' }}>
              {financialStrategy.description} Se emite factura fiscal completa por cada periodo de entrega para asegurar el cumplimiento fiscal del proyecto Retodali.
            </p>
          </div>

          {/* Cost breakdown table */}
          <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '1rem' }}>
              Desglose de Costos Mensuales Estimados
            </h4>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Concepto</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Costo Unitario Equiv.</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Estimado Mensual</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {financialStrategy.monthlyBreakdown.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>{row.concept}</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--primary)', fontWeight: '600' }}>{row.costPerMeal}</td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: '700', color: 'var(--text-dark)' }}>{row.estimatedMonthly}</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{row.detail}</td>
                  </tr>
                ))}
                <tr style={{ background: 'var(--primary-light)', fontWeight: '700' }}>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--primary)', fontSize: '1rem' }}>Total Estimado Mensual</td>
                  <td style={{ padding: '1rem 0.5rem' }}>-</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--primary)', fontSize: '1.15rem' }}>{financialStrategy.totalMonthlyEstimate}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{financialStrategy.taxIncluded}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB PRODUCTION */}
      {activeTab === 'production' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-dark)' }}>
              Consolidado de Cocina por Día de Entrega (Semana {selectedWeek})
            </h3>
            <button className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              <Download size={15} /> Exportar Hoja de Cocina (PDF/Excel)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {weekData.days.map((day) => {
              const total = programInfo.activeParticipantsCount;
              const countA = Math.round(total * 0.65);
              const countB = total - countA;

              return (
                <div key={day.dayName} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                    <div>
                      <span className="badge-tag badge-green" style={{ fontSize: '0.75rem' }}>
                        {day.dayName}
                      </span>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-dark)' }}>
                        {day.dateLabel}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Total: <strong>{total} porciones</strong>
                    </span>
                  </div>

                  {/* Option A Kitchen Batch */}
                  <div style={{
                    background: 'var(--primary-light)',
                    border: '1px solid #FCA5A5',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--primary)' }}>
                        Opción A (Balance Proteico)
                      </span>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)' }}>
                        {countA} porciones
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dark)' }}>
                      {day.optionA.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Proteína: {day.optionA.protein} • {day.optionA.calories} kcal
                    </div>
                  </div>

                  {/* Option B Kitchen Batch */}
                  <div style={{
                    background: 'var(--green-light)',
                    border: '1px solid var(--green-border)',
                    borderRadius: '12px',
                    padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--green-dark)' }}>
                        Opción B (Plant-Based / Light)
                      </span>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--green-dark)' }}>
                        {countB} porciones
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dark)' }}>
                      {day.optionB.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Proteína: {day.optionB.protein} • {day.optionB.calories} kcal
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="animate-fade-in glass-panel" style={{ padding: '2rem' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Send size={28} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
              Simulador de Envíos Masivos WhatsApp & Email
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
              Envía el menú programado de la <strong>Semana {selectedWeek}</strong> a los 45 participantes registrados de Retodali a través de WhatsApp Web API y servidor de correo SMTP.
            </p>

            {dispatchStatus === 'idle' && (
              <button onClick={handleStartDispatch} className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                <Send size={18} /> Iniciar Despacho Automatizado (45 Usuarios)
              </button>
            )}

            {dispatchStatus === 'sending' && (
              <div style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  <span>Enviando notificaciones...</span>
                  <span>{dispatchProgress}%</span>
                </div>
                <div style={{ height: '10px', background: '#E5E7EB', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${dispatchProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}

            {dispatchStatus === 'completed' && (
              <div style={{ background: 'var(--green-light)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--green-border)', color: 'var(--green-dark)' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>¡Despacho completado con éxito!</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Se han notificado 45 participantes vía WhatsApp y Correo para la Semana {selectedWeek}.
                </p>
                <button onClick={() => setDispatchStatus('idle')} className="btn-outline" style={{ marginTop: '1rem', background: 'white' }}>
                  <RefreshCw size={14} /> Enviar Nuevo Recordatorio
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
