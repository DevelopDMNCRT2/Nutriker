import React, { useState, useEffect } from 'react';
import { HeartPulse, ChefHat, ArrowLeft, Edit3, ArrowRight, Scale, Activity, Plus, Minus, RotateCcw, Utensils } from 'lucide-react';
import { programInfo } from '../data/mockData';
import { menuStore, getWeekInfoFromDate } from '../services/menuStore';
import { scaleIngredients, scaleNutrition } from '../utils/recipeScaler';
import WeekCalendarPicker from './WeekCalendarPicker';
import IngredientEditorModal from './IngredientEditorModal';

function getInitialDayIndex(days) {
  if (!days || days.length === 0) return 0;
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayName = dayNames[new Date().getDay()];
  const foundIdx = days.findIndex(d => d.dayName === todayName);
  return foundIdx !== -1 ? foundIdx : 0;
}

export default function ChefView({ selectedWeek, serviceProfileKey = 'casa_nostra' }) {
  const [chefWeekInfo, setChefWeekInfo] = useState(() => getWeekInfoFromDate(new Date()));
  const [activeMenu, setActiveMenu] = useState(() => menuStore.getActiveMenu(chefWeekInfo));
  const daysList = activeMenu.days || [];
  const [currentDayIndex, setCurrentDayIndex] = useState(() => getInitialDayIndex(daysList));
  const [, setRefreshOrders] = useState(0);

  // Estados para simulación/ajuste de porciones por el Chef
  const [overrideCountA, setOverrideCountA] = useState(null);
  const [overrideCountB, setOverrideCountB] = useState(null);
  const [activeTabA, setActiveTabA] = useState('ingredients'); // 'ingredients' | 'nutrition'
  const [activeTabB, setActiveTabB] = useState('ingredients');
  const [editingDish, setEditingDish] = useState(null);

  const handleSaveIngredients = (newIngredients) => {
    if (!editingDish) return;
    menuStore.updateDishIngredients(chefWeekInfo, currentDay.dayName || safeDayIndex, editingDish.optionKey, newIngredients, 'Chef Mateo');
    setActiveMenu(menuStore.getActiveMenu(chefWeekInfo));
    setEditingDish(null);
  };

  const handleResetIngredients = () => {
    if (!editingDish) return;
    menuStore.resetDishIngredients(chefWeekInfo, currentDay.dayName || safeDayIndex, editingDish.optionKey);
    setActiveMenu(menuStore.getActiveMenu(chefWeekInfo));
    setEditingDish(null);
  };

  useEffect(() => {
    setActiveMenu(menuStore.getActiveMenu(chefWeekInfo));
  }, [chefWeekInfo]);

  useEffect(() => {
    if (daysList.length > 0) {
      setCurrentDayIndex(getInitialDayIndex(daysList));
    }
    setOverrideCountA(null);
    setOverrideCountB(null);
  }, [chefWeekInfo.weekKey, daysList.length]);

  useEffect(() => {
    setOverrideCountA(null);
    setOverrideCountB(null);
  }, [currentDayIndex]);

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
    const handleCensusUpdate = () => {
      setRefreshOrders(prev => prev + 1);
    };

    window.addEventListener('royal_canin_menu_updated', handleMenuUpdate);
    window.addEventListener('royal_canin_orders_updated', handleOrdersUpdate);
    window.addEventListener('casa_nostra_census_updated', handleCensusUpdate);

    return () => {
      window.removeEventListener('royal_canin_menu_updated', handleMenuUpdate);
      window.removeEventListener('royal_canin_orders_updated', handleOrdersUpdate);
      window.removeEventListener('casa_nostra_census_updated', handleCensusUpdate);
    };
  }, [chefWeekInfo]);

  const safeDayIndex = currentDayIndex < daysList.length ? currentDayIndex : 0;
  const currentDay = daysList[safeDayIndex] || daysList[0] || {};
  
  // Censo activo sincronizado desde el módulo de Administración
  const activeCensus = (() => {
    const saved = localStorage.getItem('casa_nostra_active_census') || localStorage.getItem('casanostra_active_census');
    const parsed = parseInt(saved, 10);
    return (!isNaN(parsed) && parsed > 0) ? parsed : (programInfo.activeParticipantsCount || 25);
  })();

  // Métricas reales calculadas desde las órdenes o censo para la semana seleccionada
  const metrics = menuStore.getChefMetrics(safeDayIndex, activeCensus, chefWeekInfo);
  const totalPortions = metrics.totalPortions;
  const countA = metrics.countA;
  const countB = metrics.countB;
  const confirmedCount = metrics.confirmedCount;

  // Porciones activas para escalado (usar confirmadas o el override del chef)
  const portionsA = overrideCountA !== null ? overrideCountA : countA;
  const portionsB = overrideCountB !== null ? overrideCountB : countB;

  // Cálculos automáticos escalados de recetas e información nutricional
  const scaledA = scaleIngredients(currentDay.optionA?.recipe?.ingredients, Math.max(1, portionsA));
  const nutritionA = scaleNutrition(currentDay.optionA, Math.max(1, portionsA));

  const scaledB = scaleIngredients(currentDay.optionB?.recipe?.ingredients, Math.max(1, portionsB));
  const nutritionB = scaleNutrition(currentDay.optionB, Math.max(1, portionsB));

  const handleNextDay = () => {
    if (safeDayIndex < daysList.length - 1) setCurrentDayIndex(safeDayIndex + 1);
  };

  const handlePrevDay = () => {
    if (safeDayIndex > 0) setCurrentDayIndex(safeDayIndex - 1);
  };

  // Helper para renderizar tabla de insumos escalados o tabla nutricional
  const renderOptionContent = (optionKey, optionData, portions, confirmed, setOverride, activeTab, setActiveTab, brandColor, lightBg, borderCol) => {
    const isCustom = portions !== confirmed;
    const scaledList = optionKey === 'A' ? scaledA : scaledB;
    const nutritionInfo = optionKey === 'A' ? nutritionA : nutritionB;

    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Barra de Control de Producción y Porciones */}
        <div style={{ background: lightBg, border: `1px solid ${borderCol}`, padding: '0.85rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: brandColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Base de Cálculo de Producción
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>
              {portions} {portions === 1 ? 'Porción asignada' : 'Porciones asignadas'}
              {isCustom && <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#B45309', marginLeft: '0.4rem' }}>(Modo Simulación Cocina)</span>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setOverride(Math.max(1, portions - 1))}
              style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${borderCol}`, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: brandColor }}
              title="Disminuir 1 porción"
            >
              <Minus size={14} />
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: '800', minWidth: '28px', textAlign: 'center' }}>
              {portions}
            </span>
            <button
              onClick={() => setOverride(portions + 1)}
              style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${borderCol}`, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: brandColor }}
              title="Aumentar 1 porción"
            >
              <Plus size={14} />
            </button>
            {isCustom && (
              <button
                onClick={() => setOverride(null)}
                style={{ marginLeft: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.25rem 0.6rem', borderRadius: '6px', cursor: 'pointer' }}
                title="Volver a los pedidos confirmados reales"
              >
                <RotateCcw size={12} /> Restablecer ({confirmed})
              </button>
            )}
          </div>
        </div>

        {/* Pestañas: Insumos Escalados vs Tabla Nutricional */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('ingredients')}
            style={{
              padding: '0.6rem 1rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'ingredients' ? `3px solid ${brandColor}` : '3px solid transparent',
              color: activeTab === 'ingredients' ? brandColor : '#64748B',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Scale size={16} /> Receta Técnica & Compras Escaladas
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            style={{
              padding: '0.6rem 1rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'nutrition' ? `3px solid ${brandColor}` : '3px solid transparent',
              color: activeTab === 'nutrition' ? brandColor : '#64748B',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Activity size={16} /> Tabla Nutricional del Lote
          </button>
        </div>

        {/* Contenido Pestaña 1: Receta Técnica e Insumos Escalados */}
        {activeTab === 'ingredients' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                  Insumos para {portions} {portions === 1 ? 'porción' : 'porciones'}:
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#64748B', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  Cálculo automático
                </span>
              </div>

              {scaledList.length === 0 ? (
                <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <em>Pendiente por la Nutrióloga...</em>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {scaledList.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        padding: '0.55rem 0.85rem',
                        background: idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div style={{ fontWeight: '600', color: 'var(--text-dark)', flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                        {item.name}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: '800', color: brandColor, fontSize: '0.88rem' }}>
                          {item.amountScaled !== null ? `${item.amountScaled} ${item.unitScaled}` : item.displayScaled}
                        </div>
                        {item.amountBase !== null && (
                          <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.1rem' }}>
                            Base: {item.amountBase} {item.unitBase}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: brandColor, marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem' }}>
                <ChefHat size={16} /> Método de Preparación Aprobado
              </div>
              <div style={{ padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-dark)', whiteSpace: 'pre-line', lineHeight: '1.5', border: '1px solid #E2E8F0' }}>
                {optionData?.recipe?.method || <em style={{ color: 'var(--text-muted)' }}>Pendiente por la Nutrióloga...</em>}
              </div>
            </div>
          </div>
        )}

        {/* Contenido Pestaña 2: Tabla Nutricional Calculada Automáticamente */}
        {activeTab === 'nutrition' && (
          <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>Calorías</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                  {nutritionInfo.totalProduction.calories} <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>kcal</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.2rem' }}>
                  ({nutritionInfo.unit.calories} kcal / porción)
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>Proteína Total</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#2563EB' }}>
                  {nutritionInfo.totalProduction.protein} <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>g</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.2rem' }}>
                  ({nutritionInfo.unit.protein}g / porción)
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>Carbohidratos</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                  {nutritionInfo.totalProduction.carbs} <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>g</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.2rem' }}>
                  ({nutritionInfo.unit.carbs}g / porción)
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>Grasas Totales</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                  {nutritionInfo.totalProduction.fats} <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>g</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.2rem' }}>
                  ({nutritionInfo.unit.fats}g / porción)
                </div>
              </div>

            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748B', background: '#F8FAFC', padding: '0.6rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #E2E8F0' }}>
              <Utensils size={14} color={brandColor} />
              <span>Valores nutricionales calculados automáticamente multiplicando el perfil clínico unitario por las <strong>{portions} raciones</strong> de producción.</span>
            </div>
          </div>
        )}

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

      {/* Senior Care Kitchen Alert Banner */}
      {serviceProfileKey === 'senior_care' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '12px',
          padding: '0.65rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.82rem',
          color: '#1E40AF'
        }}>
          <HeartPulse size={20} color="#2563EB" style={{ flexShrink: 0 }} />
          <div>
            <strong>Estación de Cocina Geriátrica (Santa Sofía):</strong> Asegurar consistencia según ficha técnica IDDSI (Nivel 6 para Fácil Masticación, Nivel 4 para Puré sin grumos) y respetar la dosificación hiposódica estricta.
          </div>
        </div>
      )}
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
              {currentDay.dayName}{currentDay.dateLabel ? `, ${currentDay.dateLabel}` : ''}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
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
              {activeMenu?.humanVerification?.isVerified && (
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803D', background: '#F0FDF4', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} color="#16A34A" /> Fichas Certificadas por {activeMenu.humanVerification.verifiedBy}
                </span>
              )}
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
              
              {renderOptionContent('A', currentDay.optionA, portionsA, countA, setOverrideCountA, activeTabA, setActiveTabA, '#2563EB', '#EFF6FF', '#BFDBFE')}
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
              
              {renderOptionContent('B', currentDay.optionB, portionsB, countB, setOverrideCountB, activeTabB, setActiveTabB, '#16A34A', '#F0FDF4', '#BBF7D0')}
            </div>

          </div>
        </>
      )}

      <IngredientEditorModal isOpen={!!editingDish} onClose={() => setEditingDish(null)} dish={editingDish?.dish} dayName={currentDay?.dayName} optionKey={editingDish?.optionKey} role="chef" onSave={handleSaveIngredients} onReset={handleResetIngredients} />
    </div>
  );
}
