import React, { useState, useEffect } from 'react';
import { ChefHat, ArrowLeft, ArrowRight, CheckCircle2, Clock, MapPin, Scale, Users } from 'lucide-react';
import { cyclicMenus, chefInfo, programInfo } from '../data/mockData';
import { menuStore, getWeekInfoFromDate } from '../services/menuStore';
import WeekCalendarPicker from './WeekCalendarPicker';

export default function ChefView({ selectedWeek }) {
  const [chefWeekInfo, setChefWeekInfo] = useState(() => getWeekInfoFromDate(selectedWeek || 1));
  const [activeMenu, setActiveMenu] = useState(() => menuStore.getActiveMenu(chefWeekInfo));
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [, setRefreshOrders] = useState(0);

  useEffect(() => {
    setActiveMenu(menuStore.getActiveMenu(chefWeekInfo));
  }, [chefWeekInfo]);

  useEffect(() => {
    const handleMenuUpdate = (e) => {
      if (!e.detail || e.detail.weekKey === chefWeekInfo.weekKey || e.detail.weekNumber === chefWeekInfo.weekNumber) {
        setActiveMenu(menuStore.getActiveMenu(chefWeekInfo));
      }
    };
    const handleOrdersUpdate = (e) => {
      if (!e.detail || e.detail.weekKey === chefWeekInfo.weekKey || e.detail.weekNumber === chefWeekInfo.weekNumber) {
        setRefreshOrders(prev => prev + 1);
      }
    };

    window.addEventListener('royal_canin_menu_updated', handleMenuUpdate);
    window.addEventListener('royal_canin_orders_updated', handleOrdersUpdate);

    return () => {
      window.removeEventListener('royal_canin_menu_updated', handleMenuUpdate);
      window.removeEventListener('royal_canin_orders_updated', handleOrdersUpdate);
    };
  }, [chefWeekInfo]);

  const weekData = activeMenu;
  const daysList = weekData.days || [];
  const safeDayIndex = currentDayIndex < daysList.length ? currentDayIndex : 0;
  const currentDay = daysList[safeDayIndex] || daysList[0] || {};
  
  // Métricas reales calculadas desde las órdenes de los empleados para la semana seleccionada
  const metrics = menuStore.getChefMetrics(safeDayIndex, programInfo.activeParticipantsCount, chefWeekInfo);
  const totalPortions = metrics.totalPortions;
  const countA = metrics.countA;
  const countB = metrics.countB;
  const confirmedCount = metrics.confirmedCount;

  const handleNextDay = () => {
    if (safeDayIndex < daysList.length - 1) setCurrentDayIndex(safeDayIndex + 1);
  };

  const handlePrevDay = () => {
    if (safeDayIndex > 0) setCurrentDayIndex(safeDayIndex - 1);
  };

  // Helper to safely render recipe fields
  const renderRecipeSection = (title, content, bgColor) => {
    if (!content) return (
      <div style={{ padding: '0.75rem', background: bgColor, borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <em>Pendiente por la Nutrióloga...</em>
      </div>
    );
    return (
      <div style={{ padding: '0.75rem', background: bgColor, borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-dark)', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
        <strong>{title}</strong><br/>
        {content}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Selector Dinámico de Semana por Calendario para el Chef */}
      <div style={{ marginBottom: '1.25rem' }}>
        <WeekCalendarPicker
          selectedWeekInfo={chefWeekInfo}
          onChangeWeek={(newWeekInfo) => {
            setChefWeekInfo(newWeekInfo);
            setCurrentDayIndex(0);
          }}
          label="Planificación de Cocina & Previsión de Producción:"
        />
      </div>
      {daysList.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          padding: '3rem 1.5rem',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
          fontWeight: '600'
        }}>
          Aún no hay platillos asignados para este período.
        </div>
      ) : (
        <>
          {/* Clean Day Navigation Bar */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            background: '#FFFFFF', 
            padding: '1.25rem 1.5rem', 
            borderRadius: '16px', 
            boxShadow: 'var(--shadow-card)', 
            marginBottom: '2rem',
            border: '1px solid #E2E8F0',
            gap: '0.75rem'
          }}>
            
            {/* Row 1: Date */}
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-dark)', margin: 0, textAlign: 'center' }}>
              {currentDay.dayName}, {currentDay.dateLabel?.split(',')[0]}
            </h2>

            {/* Segmented day selector */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {daysList.map((day, idx) => (
                <button
                  key={day.dayName}
                  onClick={() => setCurrentDayIndex(idx)}
                  style={{
                    border: 'none',
                    background: safeDayIndex === idx ? '#1E293B' : '#F1F5F9',
                    color: safeDayIndex === idx ? '#FFFFFF' : '#64748B',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {day.dayName}
                </button>
              ))}
            </div>

            {/* Row 2: Navigation Arrows */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <button 
                onClick={handlePrevDay} 
                disabled={safeDayIndex === 0}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: safeDayIndex === 0 ? '#F8FAFC' : '#F1F5F9',
                  color: safeDayIndex === 0 ? '#CBD5E1' : '#334155',
                  border: 'none', padding: '0.5rem 1rem', borderRadius: '10px',
                  fontWeight: '700', fontSize: '0.85rem', cursor: safeDayIndex === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <ArrowLeft size={16} /> Anterior
              </button>

              <button 
                onClick={handleNextDay} 
                disabled={safeDayIndex === daysList.length - 1}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: safeDayIndex === daysList.length - 1 ? '#F8FAFC' : '#F1F5F9',
                  color: safeDayIndex === daysList.length - 1 ? '#CBD5E1' : '#334155',
                  border: 'none', padding: '0.5rem 1rem', borderRadius: '10px',
                  fontWeight: '700', fontSize: '0.85rem', cursor: safeDayIndex === daysList.length - 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Siguiente <ArrowRight size={16} />
              </button>
            </div>
            
            {/* Row 3: Real Production Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                📋 {daysList.length} Días en Menú Oficial
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16A34A', background: '#F0FDF4', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                👥 {confirmedCount} {confirmedCount === 1 ? 'Pedido Confirmado' : 'Pedidos Confirmados'} • Plantilla: {totalPortions} Empleados
              </span>
            </div>
          </div>

          {/* Recipes Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* OPTION A */}
            <div style={{ background: '#FFFFFF', border: '2px solid #BFDBFE', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)' }}>
              <div style={{ background: '#EFF6FF', padding: '1.25rem 1.5rem', borderBottom: '1px solid #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge-tag" style={{ background: '#DBEAFE', color: '#1E40AF', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                    Opción A • {currentDay.optionA?.category}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1E3A8A', margin: 0 }}>
                    {currentDay.optionA?.name}
                  </h3>
                </div>
                <div style={{ background: '#2563EB', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.9 }}>PEDIDOS CONFIRMADOS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{countA} {countA === 1 ? 'Porción' : 'Porciones'}</div>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563EB', marginBottom: '0.3rem', fontWeight: '700' }}>
                    <Scale size={18} /> Ingredientes Base (Por porción)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#1E40AF', background: '#EFF6FF', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #BFDBFE' }}>
                    <strong>📋 PRODUCCIÓN:</strong> {countA === 0 ? 'Aún sin pedidos confirmados para esta opción.' : `Multiplicar ingredientes base x ${countA} para la producción.`}
                  </div>
                  {renderRecipeSection('Lista de Compras & gramaje:', currentDay.optionA?.recipe?.ingredients, '#F8FAFC')}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563EB', marginBottom: '0.5rem', fontWeight: '700' }}>
                    <ChefHat size={18} /> Método de Preparación
                  </div>
                  {renderRecipeSection('Paso a paso aprobado por Clínica:', currentDay.optionA?.recipe?.method, '#F8FAFC')}
                </div>
              </div>
            </div>

            {/* OPTION B */}
            <div style={{ background: '#FFFFFF', border: '2px solid #BBF7D0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)' }}>
              <div style={{ background: '#F0FDF4', padding: '1.25rem 1.5rem', borderBottom: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge-tag" style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                    Opción B • {currentDay.optionB?.category}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#14532D', margin: 0 }}>
                    {currentDay.optionB?.name}
                  </h3>
                </div>
                <div style={{ background: '#16A34A', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.9 }}>PEDIDOS CONFIRMADOS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{countB} {countB === 1 ? 'Porción' : 'Porciones'}</div>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16A34A', marginBottom: '0.3rem', fontWeight: '700' }}>
                    <Scale size={18} /> Ingredientes Base (Por porción)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#166534', background: '#F0FDF4', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #BBF7D0' }}>
                    <strong>📋 PRODUCCIÓN:</strong> {countB === 0 ? 'Aún sin pedidos confirmados para esta opción.' : `Multiplicar ingredientes base x ${countB} para la producción.`}
                  </div>
                  {renderRecipeSection('Lista de Compras & gramaje:', currentDay.optionB?.recipe?.ingredients, '#F8FAFC')}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16A34A', marginBottom: '0.5rem', fontWeight: '700' }}>
                    <ChefHat size={18} /> Método de Preparación
                  </div>
                  {renderRecipeSection('Paso a paso aprobado por Clínica:', currentDay.optionB?.recipe?.method, '#F8FAFC')}
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
