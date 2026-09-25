import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HeartPulse, ShieldCheck, CheckCircle2, AlertTriangle, Activity, Apple, Flame, Wand2, ChevronRight, ChevronDown, ArrowLeft, Check, RefreshCw, Layers, Scale, Users, Plus, Minus, Calculator, Lock, Soup, Sparkles } from 'lucide-react';
import { cyclicMenus, nutriologaInfo, programInfo } from '../data/mockData';
import { menuStore, getWeekInfoFromDate } from '../services/menuStore';
import { scaleIngredients, scaleNutrition } from '../utils/recipeScaler';
import WeekCalendarPicker from './WeekCalendarPicker';
import IngredientEditorModal from './IngredientEditorModal';

const DAY_BUTTONS = [
  { key: 'Lunes', label: 'L', full: 'Lunes' },
  { key: 'Martes', label: 'M', full: 'Martes' },
  { key: 'Miércoles', label: 'I', full: 'Miércoles' },
  { key: 'Jueves', label: 'J', full: 'Jueves' },
  { key: 'Viernes', label: 'V', full: 'Viernes' },
  { key: 'Sábado', label: 'S', full: 'Sábado' },
  { key: 'Domingo', label: 'D', full: 'Domingo' }
];

const createEmptyDishGrid = () => {
  const grid = {};
  DAY_BUTTONS.forEach(({ key }) => {
    grid[key] = {
      soup: { name: '', ingredients: '', method: '' },
      optionA: { name: '', ingredients: '', method: '' },
      optionB: { name: '', ingredients: '', method: '' },
      optionC: { name: '', ingredients: '', method: '' }
    };
  });
  return grid;
};

export default function NutriologaView({ selectedWeek, onWeekChange, serviceProfileKey = 'casa_nostra' }) {
  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard' | 'audit'

  // Semana calculada dinámicamente según la semana seleccionada o la sesión activa
  const [targetWeekInfo, setTargetWeekInfo] = useState(() => {
    if (selectedWeek && typeof selectedWeek === 'number') {
      return getWeekInfoFromDate(selectedWeek);
    }
    try {
      const saved = sessionStorage.getItem('nutriker_active_session_week');
      if (saved) {
        const num = parseInt(saved, 10);
        if (!isNaN(num) && num > 0) return getWeekInfoFromDate(num);
      }
    } catch (_) {}
    return getWeekInfoFromDate(new Date());
  });

  const [activeMenu, setActiveMenu] = useState(() => menuStore.getActiveMenu(targetWeekInfo));

  // Sincronizar targetWeekInfo si cambia selectedWeek desde el componente padre
  useEffect(() => {
    if (selectedWeek && typeof selectedWeek === 'number') {
      const info = getWeekInfoFromDate(selectedWeek);
      if (info.weekKey !== targetWeekInfo.weekKey) {
        setTargetWeekInfo(info);
      }
    }
  }, [selectedWeek]);

  // Actualizar reactivamente activeMenu al cambiar la semana o al alternar a la pestaña de auditoría
  useEffect(() => {
    setActiveMenu(menuStore.getActiveMenu(targetWeekInfo));
  }, [targetWeekInfo, activeTab]);

  useEffect(() => {
    const handleMenuUpdate = (e) => {
      if (!e.detail || e.detail.weekKey === targetWeekInfo.weekKey || e.detail.weekNumber === targetWeekInfo.weekNumber) {
        setActiveMenu(menuStore.getActiveMenu(targetWeekInfo));
      }
    };
    window.addEventListener('royal_canin_menu_updated', handleMenuUpdate);
    return () => window.removeEventListener('royal_canin_menu_updated', handleMenuUpdate);
  }, [targetWeekInfo]);

  const handleWeekChange = (newWeekInfo) => {
    setTargetWeekInfo(newWeekInfo);
    if (newWeekInfo?.weekNumber) {
      try {
        sessionStorage.setItem('nutriker_active_session_week', String(newWeekInfo.weekNumber));
      } catch (_) {}
      if (onWeekChange) {
        onWeekChange(newWeekInfo.weekNumber);
      }
    }
  };

  // Wizard state: Selector de Días L M I J V S D
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
  const activeDays = DAY_BUTTONS.map(d => d.key).filter(k => selectedDays.includes(k));

  const toggleDay = (dayKey) => {
    setSelectedDays(prev => {
      if (prev.includes(dayKey)) {
        if (prev.length === 1) return prev; // Mantener al menos 1 día
        return prev.filter(d => d !== dayKey);
      } else {
        return [...prev, dayKey];
      }
    });
  };

  // 4 Enfoques: Enfoque 1 (Sopa) es fijo e inmutable
  const DIET_SOUP = 'Sopa';
  const [dietOptionA, setDietOptionA] = useState(() => serviceProfileKey === 'senior_care' ? 'Fácil Masticación (IDDSI 6)' : 'Balance Proteico');
  const [dietOptionB, setDietOptionB] = useState(() => serviceProfileKey === 'senior_care' ? 'Papilla & Puré Suave (IDDSI 4)' : 'Plant-Based & Digestión Ligera');
  const [dietOptionC, setDietOptionC] = useState(() => serviceProfileKey === 'senior_care' ? 'Control Hiposódico & Sarcopenia' : 'Especial & Saludable');
  const [wizardSuccess, setWizardSuccess] = useState(false);

  useEffect(() => {
    if (serviceProfileKey === 'senior_care') {
      setDietOptionA('Fácil Masticación (IDDSI 6)');
      setDietOptionB('Papilla & Puré Suave (IDDSI 4)');
      setDietOptionC('Control Hiposódico & Sarcopenia');
    } else {
      setDietOptionA('Balance Proteico');
      setDietOptionB('Plant-Based & Digestión Ligera');
      setDietOptionC('Especial & Saludable');
    }
  }, [serviceProfileKey]);

  // Rejilla Manual de platillos inicializada en blanco (sin mockdata)
  const [dishSelection, setDishSelection] = useState(createEmptyDishGrid);
  const [expandedRecipe, setExpandedRecipe] = useState(null); // track which recipe is expanded e.g. "Lunes-soup"

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Validación de completitud de todos los platillos requeridos
  const totalDishesRequired = activeDays.length * 4;
  const completedDishesCount = activeDays.reduce((acc, dayName) => {
    const d = dishSelection[dayName] || {};
    let count = 0;
    if (d.soup?.name?.trim()) count++;
    if (d.optionA?.name?.trim()) count++;
    if (d.optionB?.name?.trim()) count++;
    if (d.optionC?.name?.trim()) count++;
    return acc + count;
  }, 0);
  const areAllDishesFilled = completedDishesCount === totalDishesRequired && totalDishesRequired > 0;

  // Estado para cálculo automático de Tabla Nutricional y Recetas Técnicas
  const [auditMode, setAuditMode] = useState('unit'); // 'unit' | 'production'
  const [auditPortions, setAuditPortions] = useState(programInfo.activeParticipantsCount || 25);
  const [expandedAuditRecipe, setExpandedAuditRecipe] = useState(null);

  const isMenuPublished = Boolean(activeMenu && activeMenu.isPublished && activeMenu.days && activeMenu.days.length > 0);
  const weekData = isMenuPublished ? activeMenu : { days: [] };
  const safeDayIndex = selectedDayIndex < weekData.days.length ? selectedDayIndex : 0;
  const [editingDish, setEditingDish] = useState(null);

  const handleSaveIngredients = async (newIngredients) => {
    if (!editingDish || !currentDay) return;
    await menuStore.updateDishIngredients(targetWeekInfo, currentDay.dayName || safeDayIndex, editingDish.optionKey, newIngredients, 'Dra. Karla (Nutrióloga)');
    setActiveMenu(menuStore.getActiveMenu(targetWeekInfo));
    setEditingDish(null);
  };

  const handleResetIngredients = () => {
    if (!editingDish || !currentDay) return;
    menuStore.resetDishIngredients(targetWeekInfo, currentDay.dayName || safeDayIndex, editingDish.optionKey);
    setActiveMenu(menuStore.getActiveMenu(targetWeekInfo));
    setEditingDish(null);
  };
  const currentDay = (weekData.days && weekData.days[safeDayIndex]) || null;


  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [humanAuditNotes, setHumanAuditNotes] = useState('');

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingState, setPublishingState] = useState({
    active: false,
    step: 'ai', // 'ai' | 'saving' | 'done'
    completed: 0,
    total: 0,
    currentDish: ''
  });

  // Bloquear scroll de la página de fondo mientras el preloader está activo
  useEffect(() => {
    if (publishingState.active) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [publishingState.active]);

  const handleDishChange = (dayName, option, field, newValue) => {
    setDishSelection(prev => ({
      ...prev,
      [dayName]: {
        ...(prev[dayName] || {}),
        [option]: {
          ...((prev[dayName] && prev[dayName][option]) || {}),
          [field]: newValue
        }
      }
    }));
  };

  const handlePublishMenu = async () => {
    setIsPublishing(true);
    setIsHumanVerified(true);

    const updatedSelection = { ...dishSelection };
    
    // Recopilar preparaciones a enriquecer (Sopa fija + 3 enfoques)
    const dishesToEnrich = [];
    activeDays.forEach(dayName => {
      const dayDishes = updatedSelection[dayName] || {};
      
      // Sopa fija obligatoria
      if (dayDishes.soup?.name) {
        dishesToEnrich.push({
          dayName,
          option: 'soup',
          name: dayDishes.soup.name,
          ingredients: dayDishes.soup.ingredients,
          category: 'Sopa'
        });
      }

      // Opción A
      if (dayDishes.optionA?.name) {
        dishesToEnrich.push({
          dayName,
          option: 'optionA',
          name: dayDishes.optionA.name,
          ingredients: dayDishes.optionA.ingredients,
          category: dietOptionA
        });
      }

      // Opción B
      if (dayDishes.optionB?.name) {
        dishesToEnrich.push({
          dayName,
          option: 'optionB',
          name: dayDishes.optionB.name,
          ingredients: dayDishes.optionB.ingredients,
          category: dietOptionB
        });
      }

      // Opción C
      if (dayDishes.optionC?.name) {
        dishesToEnrich.push({
          dayName,
          option: 'optionC',
          name: dayDishes.optionC.name,
          ingredients: dayDishes.optionC.ingredients,
          category: dietOptionC
        });
      }
    });

    const totalDishes = dishesToEnrich.length;
    setPublishingState({
      active: true,
      step: 'ai',
      completed: 0,
      total: totalDishes,
      currentDish: dishesToEnrich[0]?.name || ''
    });

    let completedCount = 0;
    const promises = dishesToEnrich.map(item => {
      return menuStore.analyzeDishWithAI({
        name: item.name,
        ingredients: item.ingredients,
        category: item.category
      }).then(res => {
        if (res) {
          updatedSelection[item.dayName] = {
            ...updatedSelection[item.dayName],
            [item.option]: {
              ...updatedSelection[item.dayName][item.option],
              calories: res.calorias,
              protein: res.proteina,
              carbs: res.carbos,
              fats: res.grasas,
              sodium: res.sodio_mg || 340,
              sodio_mg: res.sodio_mg || 340,
              clinicalProfile: res.perfilClinico,
              allergens: res.alergenos
            }
          };
        }
      }).catch(e => {
        console.warn('Error al enriquecer platillo con IA:', item.name, e);
      }).finally(() => {
        completedCount++;
        setPublishingState(prev => ({
          ...prev,
          completed: completedCount,
          currentDish: dishesToEnrich[completedCount]?.name || ''
        }));
      });
    });

    try {
      await Promise.all(promises);
    } catch (_) {}

    // Transición a etapa de guardado
    setPublishingState(prev => ({
      ...prev,
      step: 'saving',
      completed: totalDishes,
      currentDish: ''
    }));

    // Persistir menú en menuStore para la semana seleccionada en calendario con los 4 enfoques
    const published = menuStore.publishMenu({
      weekInput: targetWeekInfo,
      daysPerWeek: String(activeDays.length),
      dietOptionA,
      dietOptionB,
      dietOptionC,
      dishSelection: updatedSelection,
      daysList: activeDays
    });

    if (published) {
      setActiveMenu(published);
    }

    // Transición a éxito completado
    setPublishingState(prev => ({
      ...prev,
      step: 'done'
    }));
    setWizardSuccess(true);

    // Pausa estética para visualizar el 100% y transición suave sin saltos
    setTimeout(() => {
      setPublishingState({ active: false, step: 'ai', completed: 0, total: 0, currentDish: '' });
      setIsPublishing(false);
      setWizardSuccess(false);
      setWizardStep(1);
      setActiveTab('audit');
    }, 950);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Nutrióloga Top Profile Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem 1.75rem',
        marginBottom: '1.5rem',
        background: '#FFFFFF',
        borderRadius: '16px',
        borderLeft: '5px solid #2563EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={nutriologaInfo.avatar}
            alt={nutriologaInfo.name}
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563EB' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                {nutriologaInfo.name}
              </h2>
              <span className="badge-tag" style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: '700' }}>
                Nutrióloga Especialista
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {nutriologaInfo.role} • Auditoría clínica y Programación de menús para <strong>Retodali</strong>.
            </p>
          </div>
        </div>

        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.6rem 1rem', borderRadius: '12px', color: '#15803D', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle2 size={16} /> Menús Cíclicos Certificados 100%
        </div>
      </div>

      {/* Selector Dinámico de Semana por Calendario (Aplica a Wizard y Auditoría) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <WeekCalendarPicker
          selectedWeekInfo={targetWeekInfo}
          onChangeWeek={handleWeekChange}
          label="Semana del Servicio para Programación y Auditoría Clínica:"
        />
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('wizard')}
          style={{
            background: activeTab === 'wizard' ? '#2563EB' : '#FFFFFF',
            color: activeTab === 'wizard' ? '#FFFFFF' : '#475569',
            border: activeTab === 'wizard' ? 'none' : '1px solid #CBD5E1',
            padding: '0.6rem 1.25rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'wizard' ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
          }}
        >
          <Wand2 size={16} /> Programador de Menús (Wizard)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            background: activeTab === 'audit' ? '#2563EB' : '#FFFFFF',
            color: activeTab === 'audit' ? '#FFFFFF' : '#475569',
            border: activeTab === 'audit' ? 'none' : '1px solid #CBD5E1',
            padding: '0.6rem 1.25rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'audit' ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
          }}
        >
          <Activity size={16} /> Auditoría Médica y Clínica
        </button>
      </div>

      {/* TAB WIZARD: PROGRAMADOR PASO A PASO (REJILLA MANUAL) */}
      {activeTab === 'wizard' && (
        <div className="animate-fade-in glass-panel" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
            <div>
              <span className="badge-tag" style={{ background: '#EFF6FF', color: '#2563EB', marginBottom: '0.3rem' }}>
                Herramienta Clínica
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                Wizard de Programación de Menús Cíclicos
              </h3>
            </div>
            
            {/* Step Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: wizardStep >= 1 ? '#2563EB' : '#94A3B8' }}>1. Dias</span>
              <ChevronRight size={14} color="#CBD5E1" />
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: wizardStep >= 2 ? '#2563EB' : '#94A3B8' }}>2. Enfoques</span>
              <ChevronRight size={14} color="#CBD5E1" />
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: wizardStep >= 3 ? '#2563EB' : '#94A3B8' }}>3. Rejilla Manual</span>
            </div>
          </div>

          {/* STEP 1: DAYS SELECTION (L M I J V S D) */}
          {wizardStep === 1 && (
            <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Paso 1: Selecciona los días de entrega del servicio
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Haz clic en cualquiera de los botones para habilitar o deshabilitar los días que requieras (Lunes a Domingo):
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {DAY_BUTTONS.map((day) => {
                  const isSelected = selectedDays.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      style={{
                        width: '64px',
                        height: '68px',
                        borderRadius: '16px',
                        background: isSelected ? '#2563EB' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        border: isSelected ? '2.5px solid #1D4ED8' : '2px solid #E2E8F0',
                        fontSize: '1.45rem',
                        fontWeight: '800',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 8px 18px rgba(37, 99, 235, 0.3)' : '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isSelected ? 'translateY(-2px)' : 'none'
                      }}
                      title={day.full}
                    >
                      <span>{day.label}</span>
                      <span style={{ fontSize: '0.62rem', fontWeight: '700', opacity: isSelected ? 0.95 : 0.6, marginTop: '-2px' }}>
                        {day.full.slice(0, 3)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setWizardStep(2)}
                disabled={activeDays.length === 0}
                className="btn-uber-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: activeDays.length > 0 ? '#2563EB' : '#94A3B8',
                  cursor: activeDays.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                Siguiente: Configurar 4 Enfoques <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: 4 ENFOQUES (SOPA FIJA + 3 OPCIONES CON 3 SELECCIONES CADA UNA) */}
          {wizardStep === 2 && (
            <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Paso 2: Define los 4 enfoques de menú
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                El Enfoque 1 es obligatoriamente Sopa. Selecciona entre las 3 opciones disponibles para cada uno de los demás enfoques:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
                
                {/* ENFOQUE 1: SOPA (MISMO ASPECTO QUE LOS DEMÁS PERO SIN PODER SELECCIONAR NADA) */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#B45309', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                    Enfoque 1: Sopa (Nutritiva / Inicio):
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <select
                      disabled
                      value="Sopa"
                      style={{
                        width: '100%',
                        padding: '0.8rem 2.75rem 0.8rem 1rem',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        fontFamily: 'inherit',
                        outline: 'none',
                        cursor: 'not-allowed',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                    >
                      <option value="Sopa">Sopa</option>
                    </select>
                    <ChevronDown
                      size={18}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        color: '#64748B',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* ENFOQUE 2: OPCIÓN A (3 SELECCIONES DIFERENTES) */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }}></span>
                    Enfoque 2: Opción A (Proteica / Balance):
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <select
                      value={dietOptionA}
                      onChange={(e) => setDietOptionA(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 2.75rem 0.8rem 1rem',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        fontFamily: 'inherit',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3B82F6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.04)';
                      }}
                    >
                      <option value="Balance Proteico">Balance Proteico</option>
                      <option value="Fácil Masticación (IDDSI 6)">Fácil Masticación (IDDSI 6)</option>
                      <option value="Gourmet Saludable">Gourmet Saludable</option>
                    </select>
                    <ChevronDown
                      size={18}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        color: '#64748B',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* ENFOQUE 3: OPCIÓN B (3 SELECCIONES DIFERENTES) */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#15803D', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }}></span>
                    Enfoque 3: Opción B (Plant-Based / Texturas Asistidas):
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <select
                      value={dietOptionB}
                      onChange={(e) => setDietOptionB(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 2.75rem 0.8rem 1rem',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        fontFamily: 'inherit',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#16A34A';
                        e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.04)';
                      }}
                    >
                      <option value="Plant-Based & Digestión Ligera">Plant-Based & Digestión Ligera</option>
                      <option value="Papilla & Puré Suave (IDDSI 4)">Papilla & Puré Suave (IDDSI 4)</option>
                      <option value="Vegetariano Balance">Vegetariano Balance</option>
                    </select>
                    <ChevronDown
                      size={18}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        color: '#64748B',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* ENFOQUE 4: OPCIÓN C (3 SELECCIONES DIFERENTES) */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }}></span>
                    Enfoque 4: Opción C (Especial / Hiposódica / Menú Alternativo):
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <select
                      value={dietOptionC}
                      onChange={(e) => setDietOptionC(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 2.75rem 0.8rem 1rem',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        fontFamily: 'inherit',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8B5CF6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.04)';
                      }}
                    >
                      <option value="Control Hiposódico & Sarcopenia">Control Hiposódico & Sarcopenia</option>
                      <option value="Picada & Húmeda (IDDSI 5)">Picada & Húmeda (IDDSI 5)</option>
                      <option value="Low Carb / Keto Friendly">Low Carb / Keto Friendly</option>
                    </select>
                    <ChevronDown
                      size={18}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        color: '#64748B',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setWizardStep(1)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    background: '#FFFFFF',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    padding: '0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                >
                  <ArrowLeft size={16} /> Atrás
                </button>
                <button 
                  onClick={() => setWizardStep(3)} 
                  className="btn-uber-primary" 
                  style={{ flex: 2, justifyContent: 'center', background: '#2563EB' }}
                >
                  Configurar Rejilla Manual ({activeDays.length} {activeDays.length === 1 ? 'Día' : 'Días'}) <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REJILLA MANUAL EN BLANCO (SIN EMOJIS, CAPTURA LIMPIA A MANO) */}
          {wizardStep === 3 && (
            <div className="animate-fade-in">

              {/* Distributed Days Catalog (Active Days Grid) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {activeDays.map((dayName) => {
                  const dayDishes = dishSelection[dayName] || {
                    soup: { name: '', ingredients: '', method: '' },
                    optionA: { name: '', ingredients: '', method: '' },
                    optionB: { name: '', ingredients: '', method: '' },
                    optionC: { name: '', ingredients: '', method: '' }
                  };
                  return (
                    <div key={dayName} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '1rem', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{dayName}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                          4 Enfoques
                        </span>
                      </div>

                      {/* 1. SOPA (OBLIGATORIA) */}
                      <div style={{ background: '#FFFBEB', padding: '0.85rem', borderRadius: '12px', marginBottom: '0.85rem', border: '1px solid #FDE68A' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#B45309' }}>
                            Enfoque 1: Sopa (Fijo)
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#92400E' }}>Obligatorio</span>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Nombre de la sopa (Ej. Caldo de pollo suave)"
                          value={dayDishes.soup ? dayDishes.soup.name : ''}
                          onChange={(e) => handleDishChange(dayName, 'soup', 'name', e.target.value)}
                          style={{ width: '100%', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #FCD34D', borderRadius: '8px', outline: 'none', marginBottom: '0.4rem', background: '#FFFFFF' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setExpandedRecipe(expandedRecipe === `${dayName}-soup` ? null : `${dayName}-soup`)}
                          style={{ background: 'none', border: 'none', color: '#B45309', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                        >
                          {expandedRecipe === `${dayName}-soup` ? '- Ocultar Receta Técnica' : '+ Ver / Editar Receta Técnica'}
                        </button>

                        {expandedRecipe === `${dayName}-soup` && (
                          <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <textarea
                              value={dayDishes.soup ? dayDishes.soup.ingredients : ''}
                              onChange={(e) => handleDishChange(dayName, 'soup', 'ingredients', e.target.value)}
                              placeholder="Ingredientes y gramajes (Ej. 100ml Fondo de ave, 40g Zanahoria, 30g Calabacita)"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #FCD34D', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '65px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                            <textarea
                              value={dayDishes.soup ? dayDishes.soup.method : ''}
                              onChange={(e) => handleDishChange(dayName, 'soup', 'method', e.target.value)}
                              placeholder="Método de preparación técnica"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #FCD34D', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '55px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* 2. OPCIÓN A */}
                      <div style={{ background: '#EFF6FF', padding: '0.85rem', borderRadius: '12px', marginBottom: '0.85rem', border: '1px solid #BFDBFE' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563EB', marginBottom: '0.3rem' }}>
                          Opción A ({dietOptionA}):
                        </div>
                        <input 
                          type="text" 
                          placeholder="Nombre del platillo Opción A"
                          value={dayDishes.optionA ? dayDishes.optionA.name : ''}
                          onChange={(e) => handleDishChange(dayName, 'optionA', 'name', e.target.value)}
                          style={{ width: '100%', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #93C5FD', borderRadius: '8px', outline: 'none', marginBottom: '0.4rem', background: '#FFFFFF' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setExpandedRecipe(expandedRecipe === `${dayName}-A` ? null : `${dayName}-A`)}
                          style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                        >
                          {expandedRecipe === `${dayName}-A` ? '- Ocultar Receta Técnica' : '+ Ver / Editar Receta Técnica'}
                        </button>

                        {expandedRecipe === `${dayName}-A` && (
                          <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <textarea
                              value={dayDishes.optionA ? dayDishes.optionA.ingredients : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionA', 'ingredients', e.target.value)}
                              placeholder="Ingredientes y gramajes (Ej. 150g Pollo deshebrado, 50g Quinoa suave, 80g Calabacitas)"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #BFDBFE', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '65px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                            <textarea
                              value={dayDishes.optionA ? dayDishes.optionA.method : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionA', 'method', e.target.value)}
                              placeholder="Método de preparación técnica"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #BFDBFE', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '55px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* 3. OPCIÓN B */}
                      <div style={{ background: '#F0FDF4', padding: '0.85rem', borderRadius: '12px', marginBottom: '0.85rem', border: '1px solid #BBF7D0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--green-dark)', marginBottom: '0.3rem' }}>
                          Opción B ({dietOptionB}):
                        </div>
                        <input 
                          type="text" 
                          placeholder="Nombre del platillo Opción B"
                          value={dayDishes.optionB ? dayDishes.optionB.name : ''}
                          onChange={(e) => handleDishChange(dayName, 'optionB', 'name', e.target.value)}
                          style={{ width: '100%', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #86EFAC', borderRadius: '8px', outline: 'none', marginBottom: '0.4rem', background: '#FFFFFF' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setExpandedRecipe(expandedRecipe === `${dayName}-B` ? null : `${dayName}-B`)}
                          style={{ background: 'none', border: 'none', color: '#15803D', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                        >
                          {expandedRecipe === `${dayName}-B` ? '- Ocultar Receta Técnica' : '+ Ver / Editar Receta Técnica'}
                        </button>

                        {expandedRecipe === `${dayName}-B` && (
                          <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <textarea
                              value={dayDishes.optionB ? dayDishes.optionB.ingredients : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionB', 'ingredients', e.target.value)}
                              placeholder="Ingredientes y gramajes (Ej. 120g Tofu o Legumbre, 80g Vegetales cocidos)"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #BBF7D0', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '65px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                            <textarea
                              value={dayDishes.optionB ? dayDishes.optionB.method : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionB', 'method', e.target.value)}
                              placeholder="Método de preparación técnica"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #BBF7D0', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '55px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* 4. OPCIÓN C */}
                      <div style={{ background: '#FAF5FF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E9D5FF' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#7C3AED', marginBottom: '0.3rem' }}>
                          Opción C ({dietOptionC}):
                        </div>
                        <input 
                          type="text" 
                          placeholder="Nombre del platillo Opción C"
                          value={dayDishes.optionC ? dayDishes.optionC.name : ''}
                          onChange={(e) => handleDishChange(dayName, 'optionC', 'name', e.target.value)}
                          style={{ width: '100%', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #D8B4FE', borderRadius: '8px', outline: 'none', marginBottom: '0.4rem', background: '#FFFFFF' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setExpandedRecipe(expandedRecipe === `${dayName}-C` ? null : `${dayName}-C`)}
                          style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                        >
                          {expandedRecipe === `${dayName}-C` ? '- Ocultar Receta Técnica' : '+ Ver / Editar Receta Técnica'}
                        </button>

                        {expandedRecipe === `${dayName}-C` && (
                          <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <textarea
                              value={dayDishes.optionC ? dayDishes.optionC.ingredients : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionC', 'ingredients', e.target.value)}
                              placeholder="Ingredientes y gramajes (Ej. 100g Proteína magra, 60g Guarnición hiposódica)"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #E9D5FF', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '65px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                            <textarea
                              value={dayDishes.optionC ? dayDishes.optionC.method : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionC', 'method', e.target.value)}
                              placeholder="Método de preparación técnica"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #E9D5FF', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '55px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {wizardSuccess ? (
                <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '12px', textAlign: 'center', color: '#15803D', fontWeight: '700' }}>
                  <Check size={20} style={{ margin: '0 auto 0.2rem' }} /> ¡Menú Cíclico Certificado y Publicado a Cocina!
                </div>
              ) : (
                <>
                  {/* Mock Captcha for Human Approval */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
                    <div 
                      onClick={() => setIsCaptchaVerified(!isCaptchaVerified)}
                      style={{ 
                        background: '#FAFAFA', 
                        border: '1px solid #D4D4D8', 
                        borderRadius: '3px', 
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: 'pointer',
                        width: '300px',
                        boxShadow: '0 0 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ 
                        width: '28px', height: '28px', 
                        background: '#FFFFFF', border: '2px solid #C1C1C1', borderRadius: '2px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {isCaptchaVerified && <Check color="#0F9D58" size={20} />}
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#52525B', flex: 1 }}>I'm not a robot</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '24px', height: '24px', background: '#4285F4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                          <RefreshCw size={14} />
                        </div>
                        <span style={{ fontSize: '0.55rem', color: '#71717A', marginTop: '2px' }}>reCAPTCHA</span>
                        <span style={{ fontSize: '0.55rem', color: '#71717A' }}>Privacidad - Condiciones</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setWizardStep(2)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: '#FFFFFF',
                        color: '#475569',
                        border: '1px solid #CBD5E1',
                        padding: '0.6rem 1.25rem',
                        borderRadius: '9999px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                    >
                      Reajustar Parámetros
                    </button>
                    <button 
                      onClick={handlePublishMenu} 
                      className="btn-uber-primary" 
                      style={{ 
                        background: (isCaptchaVerified && areAllDishesFilled && !isPublishing) ? '#2563EB' : '#94A3B8',
                        cursor: (isCaptchaVerified && areAllDishesFilled && !isPublishing) ? 'pointer' : 'not-allowed',
                        opacity: (isCaptchaVerified && areAllDishesFilled && !isPublishing) ? 1 : 0.6
                      }}
                      disabled={!isCaptchaVerified || !areAllDishesFilled || isPublishing}
                    >
                      <CheckCircle2 size={18} /> {isPublishing ? 'Analizando con IA y Certificando...' : 'Certificar y Publicar Menú'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      )}

      {/* TAB AUDIT: MEDICAL/CLINICAL COMPARISON */}
      {activeTab === 'audit' && (
        <div className="animate-fade-in">
          {!isMenuPublished || !currentDay ? (
            <div style={{
              background: '#FFFFFF',
              padding: '3.5rem 1.5rem',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)',
              maxWidth: '580px',
              margin: '2rem auto'
            }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', margin: '0 auto 1.25rem' }}>
                <Activity size={28} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Sin Menú Publicado para Esta Semana
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Aún no se han configurado ni certificado platillos para la semana del <strong>{targetWeekInfo.dateRange}</strong>. Diseña el menú en el Wizard para habilitar el análisis y la auditoría clínica.
              </p>
              <button
                onClick={() => setActiveTab('wizard')}
                className="btn-uber-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#2563EB', margin: '0 auto' }}
              >
                <Wand2 size={16} /> Programar Menú en el Wizard
              </button>
            </div>
          ) : (
            <>
              {/* Audit Days Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                  Auditoría Nutricional - {currentDay.dayName} ({currentDay.dateLabel})
                </h3>
                
                <div style={{ display: 'flex', gap: '0.35rem', background: '#FFFFFF', padding: '0.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  {weekData.days.map((day, idx) => (
                    <button
                      key={day.dayName}
                      onClick={() => setSelectedDayIndex(idx)}
                      style={{
                        border: 'none',
                        background: safeDayIndex === idx ? '#2563EB' : 'transparent',
                        color: safeDayIndex === idx ? '#FFFFFF' : 'var(--text-dark)',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {day.dayName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control de Cálculo Automático: Porción Unitaria vs Lote de Producción */}
              {(() => {
                const portionsToScale = auditMode === 'production' ? Math.max(1, auditPortions) : 1;
                const nutritionSoup = currentDay?.soup ? scaleNutrition(currentDay.soup, portionsToScale) : null;
                const nutritionA = currentDay?.optionA ? scaleNutrition(currentDay.optionA, portionsToScale) : null;
                const nutritionB = currentDay?.optionB ? scaleNutrition(currentDay.optionB, portionsToScale) : null;
                const nutritionC = currentDay?.optionC ? scaleNutrition(currentDay.optionC, portionsToScale) : null;

                const scaledSoup = currentDay?.soup?.recipe?.ingredients ? scaleIngredients(currentDay.soup.recipe.ingredients, portionsToScale) : [];
                const scaledA = currentDay?.optionA?.recipe?.ingredients ? scaleIngredients(currentDay.optionA.recipe.ingredients, portionsToScale) : [];
                const scaledB = currentDay?.optionB?.recipe?.ingredients ? scaleIngredients(currentDay.optionB.recipe.ingredients, portionsToScale) : [];
                const scaledC = currentDay?.optionC?.recipe?.ingredients ? scaleIngredients(currentDay.optionC.recipe.ingredients, portionsToScale) : [];

                return (
                  <>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0.85rem 1.25rem', borderRadius: '14px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563EB', fontWeight: '700', fontSize: '0.85rem' }}>
                          <Calculator size={18} />
                          <span>Cálculo Nutricional & Recetas (4 Enfoques):</span>
                        </div>
                        <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.2rem', borderRadius: '8px', gap: '0.2rem' }}>
                          <button
                            onClick={() => setAuditMode('unit')}
                            style={{
                              border: 'none',
                              background: auditMode === 'unit' ? '#2563EB' : 'transparent',
                              color: auditMode === 'unit' ? '#FFFFFF' : '#64748B',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              fontWeight: '700',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            Por Porción Unitaria
                          </button>
                          <button
                            onClick={() => setAuditMode('production')}
                            style={{
                              border: 'none',
                              background: auditMode === 'production' ? '#2563EB' : 'transparent',
                              color: auditMode === 'production' ? '#FFFFFF' : '#64748B',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              fontWeight: '700',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            Lote de Producción
                          </button>
                        </div>
                      </div>

                      {auditMode === 'production' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Porciones asignadas:</span>
                          <button
                            onClick={() => setAuditPortions(Math.max(1, auditPortions - 1))}
                            style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Restar 1 porción"
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', minWidth: '24px', textAlign: 'center' }}>
                            {auditPortions}
                          </span>
                          <button
                            onClick={() => setAuditPortions(auditPortions + 1)}
                            style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Sumar 1 porción"
                          >
                            <Plus size={12} />
                          </button>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '0.2rem 0.5rem', borderRadius: '6px', marginLeft: '0.25rem' }}>
                            Total Lote
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Comparative Clinical Cards (Sopa, Opción A, Opción B, Opción C) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                      
                      {/* 1. SOPA AUDIT */}
                      {currentDay.soup && (
                        <div className="uber-card" style={{ padding: '1.5rem', borderTop: '4px solid #F59E0B' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                            <span className="badge-tag" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: '800' }}>
                              Enfoque 1 • Sopa (Fijo)
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: '700', background: '#FFFBEB', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                              Obligatorio
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                            {currentDay.soup?.name || 'Sopa Nutritiva'}
                          </h4>

                          {/* Clinical Macro Breakdown Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem', background: '#FFFBEB', padding: '0.75rem 0.5rem', borderRadius: '10px', textAlign: 'center', margin: '0.85rem 0', border: '1px solid #FDE68A' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Calorías</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#B45309' }}>
                                {auditMode === 'production' ? `${nutritionSoup?.totalProduction.calories} kcal` : `${nutritionSoup?.unit.calories || currentDay.soup?.calories || 220} kcal`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Proteína</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#B45309' }}>
                                {auditMode === 'production' ? `${nutritionSoup?.totalProduction.protein}g` : `${nutritionSoup?.unit.protein || 12}g`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Carbos</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#B45309' }}>
                                {auditMode === 'production' ? `${nutritionSoup?.totalProduction.carbs}g` : `${nutritionSoup?.unit.carbs || 24}g`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Grasas</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#B45309' }}>
                                {auditMode === 'production' ? `${nutritionSoup?.totalProduction.fats}g` : `${nutritionSoup?.unit.fats || 6}g`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Sodio</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: (currentDay.soup?.sodium || currentDay.soup?.sodio_mg || 260) <= 500 ? '#065F46' : '#991B1B' }}>
                                {currentDay.soup?.sodium || currentDay.soup?.sodio_mg || 260}mg
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                            <strong>Perfil Clínico:</strong> {currentDay.soup?.clinicalProfile || 'Caldo natural rico en electrolitos, favorece vaciado gástrico y deglución suave.'}
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            <strong>Alérgenos registrados:</strong> {(currentDay.soup?.allergens || []).length > 0 ? currentDay.soup.allergens.join(', ') : 'Ninguno (Libre de alérgenos comunes)'}
                          </div>

                          {/* Receta Técnica Escalada Desplegable */}
                          <div style={{ borderTop: '1px solid #FEF3C7', paddingTop: '0.75rem' }}>
                            <button
                              onClick={() => setExpandedAuditRecipe(expandedAuditRecipe === 'soup' ? null : 'soup')}
                              style={{ background: 'none', border: 'none', color: '#B45309', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: 0 }}
                            >
                              <Scale size={14} />
                              {expandedAuditRecipe === 'soup' ? 'Ocultar Insumos' : `Ver Insumos y Receta Escalada (${portionsToScale}p)`}
                            </button>
                            {expandedAuditRecipe === 'soup' && (
                              <div className="animate-fade-in" style={{ marginTop: '0.6rem' }}>
                                {scaledSoup.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    {scaledSoup.map((item, idx) => (
                                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.45rem 0.65rem', background: '#FFFDF5', borderRadius: '6px', border: '1px solid #FDE68A', fontSize: '0.78rem' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-dark)', flex: 1, minWidth: 0, wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.4' }}>
                                          {item.name}
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                          <div style={{ fontWeight: '800', color: '#B45309', fontSize: '0.82rem' }}>
                                            {item.amountScaled !== null ? `${Math.round(item.amountScaled * 100) / 100} ${item.unitScaled}` : item.displayScaled}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sin ingredientes técnicos cargados.</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 2. OPTION A AUDIT */}
                      <div className="uber-card" style={{ padding: '1.5rem', borderTop: '4px solid #2563EB' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                          <span className="badge-tag" style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: '800' }}>
                            Opción A • {currentDay.optionA?.category || dietOptionA}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: '700', background: '#F0FDF4', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                            ✓ Aprobado
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                          {currentDay.optionA?.name || 'Platillo A'}
                        </h4>

                        {/* Clinical Macro Breakdown Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem', background: '#F8FAFC', padding: '0.75rem 0.5rem', borderRadius: '10px', textAlign: 'center', margin: '1rem 0', border: '1px solid #E2E8F0' }}>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Calorías</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)' }}>
                              {auditMode === 'production' ? `${nutritionA?.totalProduction.calories} kcal` : `${nutritionA?.unit.calories || currentDay.optionA?.calories || 480} kcal`}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Proteína</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#2563EB' }}>
                              {auditMode === 'production' ? `${nutritionA?.totalProduction.protein}g` : `${nutritionA?.unit.protein || 35}g`}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Carbos</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                              {auditMode === 'production' ? `${nutritionA?.totalProduction.carbs}g` : `${nutritionA?.unit.carbs || 40}g`}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Grasas</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                              {auditMode === 'production' ? `${nutritionA?.totalProduction.fats}g` : `${nutritionA?.unit.fats || 14}g`}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Sodio</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: (currentDay.optionA?.sodium || currentDay.optionA?.sodio_mg || 340) <= 500 ? '#065F46' : '#991B1B' }}>
                              {currentDay.optionA?.sodium || currentDay.optionA?.sodio_mg || 340}mg
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                          <strong>Perfil Clínico:</strong> {currentDay.optionA?.clinicalProfile || 'Índice glucémico controlado, digestión ágil en oficina sin causar pesadez post-almuerzo.'}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                          <strong>Alérgenos registrados:</strong> {(currentDay.optionA?.allergens || []).length > 0 ? currentDay.optionA.allergens.join(', ') : 'Ninguno (Libre de alérgenos comunes)'}
                        </div>

                        {/* Receta Técnica Escalada Desplegable */}
                        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                          <button
                            onClick={() => setExpandedAuditRecipe(expandedAuditRecipe === 'A' ? null : 'A')}
                            style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: 0 }}
                          >
                            <Scale size={14} />
                            {expandedAuditRecipe === 'A' ? 'Ocultar Insumos' : `Ver Insumos y Receta Escalada (${portionsToScale}p)`}
                          </button>
                          {expandedAuditRecipe === 'A' && (
                            <div className="animate-fade-in" style={{ marginTop: '0.6rem' }}>
                              {scaledA.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                  {scaledA.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.45rem 0.65rem', background: idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
                                      <div style={{ fontWeight: '600', color: 'var(--text-dark)', flex: 1, minWidth: 0, wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.4' }}>
                                        {item.name}
                                      </div>
                                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontWeight: '800', color: '#2563EB', fontSize: '0.82rem' }}>
                                          {item.amountScaled !== null ? `${Math.round(item.amountScaled * 100) / 100} ${item.unitScaled}` : item.displayScaled}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sin ingredientes técnicos cargados.</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. OPTION B AUDIT */}
                      <div className="uber-card" style={{ padding: '1.5rem', borderTop: '4px solid #16A34A' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                          <span className="badge-tag" style={{ background: '#F0FDF4', color: '#16A34A', fontWeight: '800' }}>
                            Opción B • {currentDay.optionB?.category || dietOptionB}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: '700', background: '#F0FDF4', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                            ✓ Aprobado
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                          {currentDay.optionB?.name || 'Platillo B'}
                        </h4>

                        {/* Clinical Macro Breakdown Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem', background: '#F8FAFC', padding: '0.75rem 0.5rem', borderRadius: '10px', textAlign: 'center', margin: '1rem 0', border: '1px solid #E2E8F0' }}>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Calorías</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)' }}>
                              {auditMode === 'production' ? `${nutritionB?.totalProduction.calories} kcal` : `${nutritionB?.unit.calories || currentDay.optionB?.calories || 430} kcal`}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Proteína</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#2563EB' }}>
                              {auditMode === 'production' ? `${nutritionB?.totalProduction.protein}g` : `${nutritionB?.unit.protein || 18}g`}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Carbos</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                              {auditMode === 'production' ? `${nutritionB?.totalProduction.carbs}g` : `${nutritionB?.unit.carbs || 50}g`}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Grasas</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                              {auditMode === 'production' ? `${nutritionB?.totalProduction.fats}g` : `${nutritionB?.unit.fats || 16}g`}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Sodio</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: (currentDay.optionB?.sodium || currentDay.optionB?.sodio_mg || 320) <= 500 ? '#065F46' : '#991B1B' }}>
                              {currentDay.optionB?.sodium || currentDay.optionB?.sodio_mg || 320}mg
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                          <strong>Perfil Clínico:</strong> {currentDay.optionB?.clinicalProfile || 'Alto contenido de fibra vegetal e ingredientes antioxidantes antiinflamatorios.'}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                          <strong>Alérgenos registrados:</strong> {(currentDay.optionB?.allergens || []).length > 0 ? currentDay.optionB.allergens.join(', ') : 'Ninguno (Libre de alérgenos comunes)'}
                        </div>

                        {/* Receta Técnica Escalada Desplegable */}
                        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                          <button
                            onClick={() => setExpandedAuditRecipe(expandedAuditRecipe === 'B' ? null : 'B')}
                            style={{ background: 'none', border: 'none', color: '#15803D', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: 0 }}
                          >
                            <Scale size={14} />
                            {expandedAuditRecipe === 'B' ? 'Ocultar Insumos' : `Ver Insumos y Receta Escalada (${portionsToScale}p)`}
                          </button>
                          {expandedAuditRecipe === 'B' && (
                            <div className="animate-fade-in" style={{ marginTop: '0.6rem' }}>
                              {scaledB.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                  {scaledB.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.45rem 0.65rem', background: idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
                                      <div style={{ fontWeight: '600', color: 'var(--text-dark)', flex: 1, minWidth: 0, wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.4' }}>
                                        {item.name}
                                      </div>
                                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontWeight: '800', color: '#15803D', fontSize: '0.82rem' }}>
                                          {item.amountScaled !== null ? `${Math.round(item.amountScaled * 100) / 100} ${item.unitScaled}` : item.displayScaled}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sin ingredientes técnicos cargados.</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 4. OPTION C AUDIT */}
                      {currentDay.optionC && (
                        <div className="uber-card" style={{ padding: '1.5rem', borderTop: '4px solid #8B5CF6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                            <span className="badge-tag" style={{ background: '#FAF5FF', color: '#7C3AED', fontWeight: '800' }}>
                              Opción C • {currentDay.optionC?.category || dietOptionC}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: '700', background: '#F0FDF4', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                              ✓ Aprobado
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                            {currentDay.optionC?.name || 'Platillo C'}
                          </h4>

                          {/* Clinical Macro Breakdown Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem', background: '#FAF5FF', padding: '0.75rem 0.5rem', borderRadius: '10px', textAlign: 'center', margin: '0.85rem 0', border: '1px solid #E9D5FF' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#7C3AED' }}>Calorías</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#7C3AED' }}>
                                {auditMode === 'production' ? `${nutritionC?.totalProduction.calories} kcal` : `${nutritionC?.unit.calories || currentDay.optionC?.calories || 390} kcal`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#7C3AED' }}>Proteína</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#7C3AED' }}>
                                {auditMode === 'production' ? `${nutritionC?.totalProduction.protein}g` : `${nutritionC?.unit.protein || 28}g`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#7C3AED' }}>Carbos</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#7C3AED' }}>
                                {auditMode === 'production' ? `${nutritionC?.totalProduction.carbs}g` : `${nutritionC?.unit.carbs || 38}g`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#7C3AED' }}>Grasas</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#7C3AED' }}>
                                {auditMode === 'production' ? `${nutritionC?.totalProduction.fats}g` : `${nutritionC?.unit.fats || 12}g`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#7C3AED' }}>Sodio</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: (currentDay.optionC?.sodium || currentDay.optionC?.sodio_mg || 280) <= 500 ? '#065F46' : '#991B1B' }}>
                                {currentDay.optionC?.sodium || currentDay.optionC?.sodio_mg || 280}mg
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                            <strong>Perfil Clínico:</strong> {currentDay.optionC?.clinicalProfile || 'Formulación balanceada, control estricto de sodio e ingredientes digestivos.'}
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            <strong>Alérgenos registrados:</strong> {(currentDay.optionC?.allergens || []).length > 0 ? currentDay.optionC.allergens.join(', ') : 'Ninguno (Libre de alérgenos comunes)'}
                          </div>

                          {/* Receta Técnica Escalada Desplegable */}
                          <div style={{ borderTop: '1px solid #E9D5FF', paddingTop: '0.75rem' }}>
                            <button
                              onClick={() => setExpandedAuditRecipe(expandedAuditRecipe === 'C' ? null : 'C')}
                              style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: 0 }}
                            >
                              <Scale size={14} />
                              {expandedAuditRecipe === 'C' ? 'Ocultar Insumos' : `Ver Insumos y Receta Escalada (${portionsToScale}p)`}
                            </button>
                            {expandedAuditRecipe === 'C' && (
                              <div className="animate-fade-in" style={{ marginTop: '0.6rem' }}>
                                {scaledC.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    {scaledC.map((item, idx) => (
                                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.45rem 0.65rem', background: '#FAF5FF', borderRadius: '6px', border: '1px solid #E9D5FF', fontSize: '0.78rem' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-dark)', flex: 1, minWidth: 0, wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.4' }}>
                                          {item.name}
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                          <div style={{ fontWeight: '800', color: '#7C3AED', fontSize: '0.82rem' }}>
                                            {item.amountScaled !== null ? `${Math.round(item.amountScaled * 100) / 100} ${item.unitScaled}` : item.displayScaled}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sin ingredientes técnicos cargados.</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>
      )}

      <IngredientEditorModal isOpen={!!editingDish} onClose={() => setEditingDish(null)} dish={editingDish?.dish} dayName={currentDay?.dayName} optionKey={editingDish?.optionKey} role="nutriologa" onSave={handleSaveIngredients} onReset={handleResetIngredients} />

      {/* Preloader Modal Overlay de IA y Publicación (Renderizado con createPortal directamente en document.body) */}
      {publishingState.active && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999999,
          padding: '1rem',
          margin: 0,
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            maxWidth: '490px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            margin: 'auto',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Icono animado */}
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '22px',
              background: publishingState.step === 'done' ? '#F0FDF4' : '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: publishingState.step === 'done' ? '#16A34A' : '#2563EB',
              border: publishingState.step === 'done' ? '2px solid #BBF7D0' : '2px solid #BFDBFE',
              boxShadow: publishingState.step === 'done' ? '0 10px 25px rgba(22, 163, 74, 0.2)' : '0 10px 25px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.3s ease'
            }}>
              {publishingState.step === 'done' ? (
                <CheckCircle2 size={40} />
              ) : (
                <Sparkles size={38} style={{ animation: 'pulse 1.5s infinite ease-in-out' }} />
              )}
            </div>

            {/* Títulos y Subtítulo Informativo */}
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
                {publishingState.step === 'done'
                  ? '¡Menú Certificado y Publicado!'
                  : publishingState.step === 'saving'
                  ? 'Sincronizando Recetas y Fichas...'
                  : 'Optimizando Menú con IA Clínica'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.45', margin: 0 }}>
                {publishingState.step === 'done'
                  ? 'Todos los platillos fueron enriquecidos con macros, alérgenos y recetas técnicas.'
                  : publishingState.step === 'saving'
                  ? 'Persistiendo datos clínicos en PostgreSQL y actualizando almacén oficial...'
                  : publishingState.currentDish
                  ? `Analizando: "${publishingState.currentDish}"`
                  : 'Calculando requerimientos nutricionales para Casa Nostra...'}
              </p>
            </div>

            {/* Barra de Progreso Dinámica */}
            <div style={{ width: '100%', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                <span>Progreso de Análisis</span>
                <span style={{ color: publishingState.step === 'done' ? '#16A34A' : '#2563EB' }}>
                  {publishingState.step === 'done'
                    ? '100%'
                    : `${Math.round(((publishingState.completed || 0) / Math.max(publishingState.total || 1, 1)) * 100)}%`}
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <div style={{
                  height: '100%',
                  width: publishingState.step === 'done'
                    ? '100%'
                    : `${Math.max(10, Math.round(((publishingState.completed || 0) / Math.max(publishingState.total || 1, 1)) * 100))}%`,
                  background: publishingState.step === 'done' ? '#16A34A' : 'linear-gradient(90deg, #2563EB, #3B82F6)',
                  borderRadius: '9999px',
                  transition: 'width 0.35s ease'
                }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.4rem', textAlign: 'right' }}>
                {publishingState.completed} de {publishingState.total} preparaciones analizadas
              </div>
            </div>

            {/* Sello de Garantía Médica */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '0.6rem 1rem',
              borderRadius: '12px',
              fontSize: '0.78rem',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600'
            }}>
              <ShieldCheck size={16} color="#2563EB" />
              <span>Verificación Médica y Auditoría Clínica Automatizada</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
