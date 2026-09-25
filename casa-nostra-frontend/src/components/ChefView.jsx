import React, { useState, useEffect, useMemo } from 'react';
import { HeartPulse, ChefHat, ArrowLeft, Edit3, ArrowRight, Scale, Activity, Plus, Minus, RotateCcw, Utensils, ShieldCheck, Sunrise, Sun, Moon, Clock, FileDown } from 'lucide-react';
import { programInfo } from '../data/mockData';
import { menuStore, getWeekInfoFromDate, DAILY_SERVICES, INSTITUTIONAL_COURSES } from '../services/menuStore';
import { scaleIngredients, scaleNutrition } from '../utils/recipeScaler';
import { exportarDiaMenuPDF } from '../utils/exportMenuPDF';
import { exportarDiaMenuCSV } from '../utils/exportMenuCSV';
import WeekCalendarPicker from './WeekCalendarPicker';
import IngredientEditorModal from './IngredientEditorModal';

function getInitialDayIndex(days) {
  if (!days || days.length === 0) return 0;
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayName = dayNames[new Date().getDay()];
  const foundIdx = days.findIndex(d => d.dayName === todayName);
  return foundIdx !== -1 ? foundIdx : 0;
}

class ChefErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ChefView Runtime Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#FEF2F2', border: '2px solid #EF4444', borderRadius: '16px', margin: '2rem auto', maxWidth: '800px', textAlign: 'center' }}>
          <h3 style={{ color: '#DC2626', fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Error al Cargar la Vista de Cocina</h3>
          <p style={{ color: '#991B1B', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {String(this.state.error?.message || this.state.error)}
          </p>
          <pre style={{ textAlign: 'left', background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #FCA5A5', color: '#B91C1C', fontSize: '0.75rem', overflowX: 'auto', maxHeight: '200px' }}>
            {String(this.state.error?.stack || '')}
          </pre>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{ marginTop: '1rem', background: '#DC2626', color: '#FFFFFF', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
          >
            Reintentar / Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ChefViewContent({ selectedWeek, serviceProfileKey = 'casa_nostra' }) {
  const [chefWeekInfo, setChefWeekInfo] = useState(() => {
    if (selectedWeek && typeof selectedWeek === 'number') {
      return getWeekInfoFromDate(selectedWeek);
    }
    return getWeekInfoFromDate(new Date());
  });

  useEffect(() => {
    if (selectedWeek && typeof selectedWeek === 'number') {
      setChefWeekInfo(getWeekInfoFromDate(selectedWeek));
    }
  }, [selectedWeek]);

  const [activeMenu, setActiveMenu] = useState(() => menuStore.getActiveMenu(chefWeekInfo));
  const daysList = activeMenu?.days || [];
  const [currentDayIndex, setCurrentDayIndex] = useState(() => getInitialDayIndex(daysList));
  const [refreshOrders, setRefreshOrders] = useState(0);

  const [selectedShift, setSelectedShift] = useState('comida'); // 'desayuno' | 'comida' | 'cena'
  const [courseTabs, setCourseTabs] = useState({
    soup: 'ingredients',
    optionA: 'ingredients',
    optionB: 'ingredients',
    optionC: 'ingredients'
  });
  const setCourseTab = (cKey, tab) => setCourseTabs(prev => ({ ...prev, [cKey]: tab }));
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
  }, [chefWeekInfo.weekKey, daysList.length]);

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

    const handleServingsUpdate = (e) => {
      if (!e.detail || e.detail.weekKey === chefWeekInfo.weekKey || e.detail.weekNumber === chefWeekInfo.weekNumber) {
        setRefreshOrders(prev => prev + 1);
      }
    };
    const handleStorageUpdate = (e) => {
      if (!e.key || e.key.includes('casanostra_servings')) {
        setRefreshOrders(prev => prev + 1);
      }
    };

    window.addEventListener('royal_canin_menu_updated', handleMenuUpdate);
    window.addEventListener('royal_canin_orders_updated', handleOrdersUpdate);
    window.addEventListener('casa_nostra_census_updated', handleCensusUpdate);
    window.addEventListener('casanostra_servings_updated', handleServingsUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('royal_canin_menu_updated', handleMenuUpdate);
      window.removeEventListener('royal_canin_orders_updated', handleOrdersUpdate);
      window.removeEventListener('casa_nostra_census_updated', handleCensusUpdate);
      window.removeEventListener('casanostra_servings_updated', handleServingsUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
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

  // Sincronización en tiempo real de raciones oficiales asignadas por Administración
  const adminServings = useMemo(() => {
    try {
      const saved = localStorage.getItem(`casanostra_servings_v2_${chefWeekInfo.weekKey}`) || 
                    localStorage.getItem(`casanostra_servings_v2_w${chefWeekInfo.weekNumber}`) ||
                    localStorage.getItem(`casanostra_servings_${chefWeekInfo.weekKey}`) || 
                    localStorage.getItem(`casanostra_servings_w${chefWeekInfo.weekNumber}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && currentDay?.dayName) {
          const dayData = parsed[currentDay.dayName];
          if (dayData) {
            const servA = dayData.optionA !== '' && dayData.optionA !== null && dayData.optionA !== undefined ? parseInt(dayData.optionA, 10) : null;
            const servB = dayData.optionB !== '' && dayData.optionB !== null && dayData.optionB !== undefined ? parseInt(dayData.optionB, 10) : null;
            return { servA, servB };
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, [chefWeekInfo.weekKey, chefWeekInfo.weekNumber, currentDay?.dayName, refreshOrders]);

  // Raciones oficiales determinadas por la administración (solo lectura en cocina)
  const portionsCensus = activeCensus || 25;
  const portionsA = adminServings && adminServings.servA !== null && !isNaN(adminServings.servA) ? adminServings.servA : (countA || portionsCensus);
  const portionsB = adminServings && adminServings.servB !== null && !isNaN(adminServings.servB) ? adminServings.servB : (countB || portionsCensus);

  // Platillos correspondientes al turno institucional seleccionado
  const currentShiftDishes = currentDay.services?.[selectedShift] || (selectedShift === 'comida' ? currentDay : currentDay.services?.[selectedShift]) || {};
  const currentDishSoup = currentShiftDishes.soup;
  const currentDishA = currentShiftDishes.optionA;
  const currentDishB = currentShiftDishes.optionB;
  const currentDishC = currentShiftDishes.optionC;

  const handleNextDay = () => {
    if (safeDayIndex < daysList.length - 1) setCurrentDayIndex(safeDayIndex + 1);
  };

  const handlePrevDay = () => {
    if (safeDayIndex > 0) setCurrentDayIndex(safeDayIndex - 1);
  };

  // Helper para renderizar tarjeta de curso institucional con recetas escaladas y tabla nutricional
  const renderCourseCard = (courseKey, courseBadge, fallbackTitle, courseData, portions, brandColor, lightBg, borderCol) => {
    const scaledList = scaleIngredients(courseData?.recipe?.ingredients, portions);
    const nutritionInfo = scaleNutrition(courseData || {}, portions);
    const activeTab = courseTabs[courseKey] || 'ingredients';
    const setActiveTab = (tab) => setCourseTab(courseKey, tab);

    return (
      <div key={courseKey} style={{ background: '#FFFFFF', border: `2px solid ${borderCol}`, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ background: lightBg, padding: '1.25rem 1.5rem', borderBottom: `1px solid ${borderCol}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge-tag" style={{ background: '#FFFFFF', color: brandColor, fontSize: '0.75rem', marginBottom: '0.4rem', border: `1px solid ${borderCol}`, fontWeight: '800' }}>
              {courseBadge} • {courseData?.category || 'Tiempo Institucional'}
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>
              {courseData?.name || fallbackTitle}
            </h3>
          </div>
          <div style={{ background: brandColor, color: 'white', padding: '0.65rem 1.25rem', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '600', opacity: 0.9 }}>RACIONES DE PRODUCCIÓN</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800' }}>{portions} {portions === 1 ? 'Porción' : 'Porciones'}</div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                  {courseData?.recipe?.method || courseData?.method || <em style={{ color: 'var(--text-muted)' }}>Pendiente por la Nutrióloga...</em>}
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
            gap: '0.9rem'
          }}>
            
            {/* Shift Selector */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {DAILY_SERVICES.map(srv => {
                const isSelected = selectedShift === srv.key;
                return (
                  <button
                    key={srv.key}
                    type="button"
                    onClick={() => setSelectedShift(srv.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.55rem 1.25rem',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #2563EB' : '1px solid #CBD5E1',
                      background: isSelected ? '#1E293B' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none'
                    }}
                  >
                    {srv.key === 'desayuno' && <Sunrise size={16} color={isSelected ? '#60A5FA' : '#64748B'} />}
                    {srv.key === 'comida' && <Sun size={16} color={isSelected ? '#FBBF24' : '#64748B'} />}
                    {srv.key === 'cena' && <Moon size={16} color={isSelected ? '#C084FC' : '#64748B'} />}
                    <span>Turno {srv.shortLabel || srv.label}</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: '600' }}>
                      ({srv.timeLabel})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Row 1: Date */}
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-dark)', margin: 0, textAlign: 'center' }}>
              {currentDay.dayName}{currentDay.dateLabel ? `, ${currentDay.dateLabel}` : ''}
            </h2>



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
            
            {/* Row 3: Production Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                📋 {daysList.length} Días en Menú Oficial
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16A34A', background: '#F0FDF4', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                👥 {portionsCensus} Residentes en Censo Oficial
              </span>
              {activeMenu?.humanVerification?.isVerified && (
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803D', background: '#F0FDF4', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} color="#16A34A" /> Fichas Certificadas por {activeMenu?.humanVerification?.verifiedBy || 'Nutrióloga'}
                </span>
              )}

              {/* Botones de Descarga del Menú: PDF y CSV */}
              {currentDay?.dayName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={() => exportarDiaMenuPDF({ day: currentDay, weekRange: chefWeekInfo.dateRange, census: portionsCensus })}
                    title={`Descargar menú de ${currentDay.dayName} en PDF`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.35rem 0.85rem', borderRadius: '8px',
                      border: '1.5px solid #7C3AED',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                      color: '#FFFFFF', fontSize: '0.75rem', fontWeight: '800',
                      cursor: 'pointer', boxShadow: '0 2px 6px rgba(124,58,237,0.3)',
                      transition: 'all 0.2s ease', fontFamily: 'inherit'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(124,58,237,0.3)'; }}
                  >
                    <FileDown size={13} /> PDF
                  </button>

                  <button
                    onClick={() => exportarDiaMenuCSV({ day: currentDay, weekRange: chefWeekInfo.dateRange, census: portionsCensus })}
                    title={`Descargar tabla de ${currentDay.dayName} en CSV para Excel`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.35rem 0.85rem', borderRadius: '8px',
                      border: '1.5px solid #059669',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#FFFFFF', fontSize: '0.75rem', fontWeight: '800',
                      cursor: 'pointer', boxShadow: '0 2px 6px rgba(5,150,105,0.3)',
                      transition: 'all 0.2s ease', fontFamily: 'inherit'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(5,150,105,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(5,150,105,0.3)'; }}
                  >
                    <FileDown size={13} /> CSV
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recipes Cards: 4 Tiempos Institucionales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 1er TIEMPO: SOPA / ENTRADA */}
            {renderCourseCard(
              'soup',
              '1er Tiempo • Sopa / Entrada',
              'Sopa / Entrada',
              currentDishSoup,
              portionsCensus,
              '#B45309',
              '#FFFBEB',
              '#FDE68A'
            )}

            {/* 2do TIEMPO: PLATO FUERTE */}
            {renderCourseCard(
              'optionA',
              '2do Tiempo • Plato Fuerte',
              'Plato Fuerte',
              currentDishA,
              portionsA,
              '#1D4ED8',
              '#EFF6FF',
              '#BFDBFE'
            )}

            {/* 3er TIEMPO: GUARNICIÓN */}
            {renderCourseCard(
              'optionB',
              '3er Tiempo • Guarnición',
              'Guarnición',
              currentDishB,
              portionsB,
              '#15803D',
              '#F0FDF4',
              '#BBF7D0'
            )}

            {/* 4to TIEMPO: POSTRE */}
            {renderCourseCard(
              'optionC',
              '4to Tiempo • Postre',
              'Postre',
              currentDishC,
              portionsCensus,
              '#7C3AED',
              '#FAF5FF',
              '#E9D5FF'
            )}

          </div>
        </>
      )}

      <IngredientEditorModal isOpen={!!editingDish} onClose={() => setEditingDish(null)} dish={editingDish?.dish} dayName={currentDay?.dayName} optionKey={editingDish?.optionKey} role="chef" onSave={handleSaveIngredients} onReset={handleResetIngredients} />
    </div>
  );
}

export default function ChefView(props) {
  return (
    <ChefErrorBoundary>
      <ChefViewContent {...props} />
    </ChefErrorBoundary>
  );
}
