import React, { useState, useEffect } from 'react';
import { HeartPulse, ShieldCheck, CheckCircle2, AlertTriangle, Activity, Apple, Flame, Wand2, ChevronRight, ChevronDown, ArrowLeft, Check, RefreshCw, Layers, Scale, Users, Plus, Minus, Calculator, Lock, Soup, Sparkles, Sunrise, Sun, Moon, Clock } from 'lucide-react';

import { cyclicMenus, nutriologaInfo, programInfo } from '../data/mockData';
import { menuStore, getWeekInfoFromDate, DAILY_SERVICES, INSTITUTIONAL_COURSES } from '../services/menuStore';
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

const createEmptyServiceDishes = () => ({
  desayuno: createEmptyDishGrid(),
  comida: createEmptyDishGrid(),
  cena: createEmptyDishGrid()
});

export default function NutriologaView({ selectedWeek, serviceProfileKey = 'casa_nostra' }) {
  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard' | 'audit'

  // Semana en curso calculada dinámicamente según la fecha actual del sistema
  const [targetWeekInfo, setTargetWeekInfo] = useState(() => getWeekInfoFromDate(new Date()));
  const [activeMenu, setActiveMenu] = useState(() => menuStore.getActiveMenu(targetWeekInfo));

  useEffect(() => {
    setActiveMenu(menuStore.getActiveMenu(targetWeekInfo));
  }, [targetWeekInfo]);

  useEffect(() => {
    const handleMenuUpdate = (e) => {
      if (!e.detail || e.detail.weekKey === targetWeekInfo.weekKey || e.detail.weekNumber === targetWeekInfo.weekNumber) {
        setActiveMenu(menuStore.getActiveMenu(targetWeekInfo));
      }
    };
    window.addEventListener('royal_canin_menu_updated', handleMenuUpdate);
    return () => window.removeEventListener('royal_canin_menu_updated', handleMenuUpdate);
  }, [targetWeekInfo]);

  // Wizard state: Selector de Días L M I J V S D
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']);
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

  // Opciones de dieta configurables (Sopa fija; A, B, C configurables)
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

  // Soporte para 3 servicios diarios (Desayuno, Comida, Cena)
  const [activeService, setActiveService] = useState('comida'); // 'desayuno' | 'comida' | 'cena'
  const [auditService, setAuditService] = useState('comida');
  const [dishServices, setDishServices] = useState(createEmptyServiceDishes);
  const [expandedRecipe, setExpandedRecipe] = useState(null); // track which recipe is expanded e.g. "Lunes-soup"

  // Sincronizar platillos desde activeMenu si ya existen en la semana
  useEffect(() => {
    if (activeMenu?.days && activeMenu.days.length > 0) {
      const activeDayNames = activeMenu.days.map(d => d.dayName).filter(Boolean);
      if (activeDayNames.length > 0) {
        setSelectedDays(activeDayNames);
      }
      setDishServices(prev => {
        const nextServices = {
          desayuno: { ...prev.desayuno },
          comida: { ...prev.comida },
          cena: { ...prev.cena }
        };
        activeMenu.days.forEach(day => {
          const dName = day.dayName;
          if (!dName) return;
          ['desayuno', 'comida', 'cena'].forEach(sKey => {
            const sData = day.services?.[sKey] || (sKey === 'comida' ? {
              soup: day.soup,
              optionA: day.optionA,
              optionB: day.optionB,
              optionC: day.optionC
            } : null);
            if (sData) {
              if (!nextServices[sKey][dName]) nextServices[sKey][dName] = {};
              ['soup', 'optionA', 'optionB', 'optionC'].forEach(cKey => {
                const dishObj = sData[cKey];
                if (dishObj?.name && !nextServices[sKey][dName][cKey]?.name) {
                  nextServices[sKey][dName][cKey] = {
                    name: dishObj.name || '',
                    ingredients: dishObj.recipe?.ingredients || dishObj.ingredients || '',
                    method: dishObj.recipe?.method || dishObj.method || '',
                    calories: dishObj.calories,
                    protein: dishObj.protein,
                    carbs: dishObj.carbs,
                    fats: dishObj.fats,
                    sodium: dishObj.sodium || dishObj.sodio_mg,
                    clinicalProfile: dishObj.clinicalProfile,
                    allergens: dishObj.allergens
                  };
                }
              });
            }
          });
        });
        return nextServices;
      });
    }
  }, [activeMenu]);

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Validación de completitud de todos los platillos requeridos
  const totalDishesRequired = activeDays.length * 4;
  const getServiceDishesCount = (sKey) => {
    return activeDays.reduce((acc, dayName) => {
      const d = dishServices[sKey]?.[dayName] || {};
      let count = 0;
      if (d.soup?.name?.trim()) count++;
      if (d.optionA?.name?.trim()) count++;
      if (d.optionB?.name?.trim()) count++;
      if (d.optionC?.name?.trim()) count++;
      return acc + count;
    }, 0);
  };
  const completedComidaCount = getServiceDishesCount('comida');
  const completedDishesCount = getServiceDishesCount(activeService);
  const areAllDishesFilled = (completedComidaCount === totalDishesRequired || completedDishesCount === totalDishesRequired) && totalDishesRequired > 0;

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

  // Auto-enriquecer en tiempo real con IA cualquier platillo publicado que no tenga aún cálculo clínico de macros o alérgenos
  useEffect(() => {
    if (!currentDay) return;
    const enrichDish = async (dish, optionKey) => {
      if (!dish || !dish.name) return;
      const isDefaultMock = (dish.calories === 480 && (dish.protein === '35g' || dish.protein === 35) && !dish.clinicalProfile);
      const isMissingClinical = !dish.clinicalProfile || !Array.isArray(dish.allergens) || dish.allergens.length === 0;

      if ((isDefaultMock || isMissingClinical) && !dish._aiEnriching) {
        dish._aiEnriching = true;
        try {
          const res = await menuStore.analyzeDishWithAI({
            name: dish.name,
            ingredients: dish.recipe?.ingredients || '',
            category: dish.category || (optionKey === 'optionA' ? dietOptionA : dietOptionB)
          });
          if (res) {
            dish.calories = res.calorias;
            dish.protein = typeof res.proteina === 'number' ? `${res.proteina}g` : res.proteina;
            dish.carbs = typeof res.carbos === 'number' ? `${res.carbos}g` : res.carbos;
            dish.fats = typeof res.grasas === 'number' ? `${res.grasas}g` : res.grasas;
            dish.sodium = res.sodio_mg || 340;
            dish.sodio_mg = res.sodio_mg || 340;
            dish.clinicalProfile = res.perfilClinico;
            dish.allergens = res.alergenos || [];
            if (dish.recipe) {
              dish.recipe.nutrition = {
                calories: res.calorias,
                protein: dish.protein,
                carbs: dish.carbs,
                fats: dish.fats,
                sodium: res.sodio_mg || 340
              };
            }
            
            // Persistir de inmediato en localStorage y emitir evento
            const updatedMenu = { ...activeMenu };
            localStorage.setItem(`casa_nostra_menu_v2_${targetWeekInfo.weekKey}`, JSON.stringify(updatedMenu));
            localStorage.setItem(`casa_nostra_menu_v2_w${targetWeekInfo.weekNumber}`, JSON.stringify(updatedMenu));
            setActiveMenu(updatedMenu);
            window.dispatchEvent(new CustomEvent('royal_canin_menu_updated', {
              detail: { weekKey: targetWeekInfo.weekKey, weekNumber: targetWeekInfo.weekNumber, activeMenu: updatedMenu }
            }));
          }
        } catch (e) {
          console.warn('Error en enriquecimiento automático de platillo:', e);
        } finally {
          dish._aiEnriching = false;
        }
      }
    };

    if (currentDay.optionA) enrichDish(currentDay.optionA, 'optionA');
    if (currentDay.optionB) enrichDish(currentDay.optionB, 'optionB');
  }, [currentDay, targetWeekInfo]);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [humanAuditNotes, setHumanAuditNotes] = useState('');

  const [isPublishing, setIsPublishing] = useState(false);

  const handleDishChange = (dayName, option, field, newValue, serviceKey = activeService) => {
    setDishServices(prev => ({
      ...prev,
      [serviceKey]: {
        ...(prev[serviceKey] || {}),
        [dayName]: {
          ...((prev[serviceKey] && prev[serviceKey][dayName]) || {}),
          [option]: {
            ...((prev[serviceKey] && prev[serviceKey][dayName] && prev[serviceKey][dayName][option]) || {}),
            [field]: newValue
          }
        }
      }
    }));
  };

  const handlePublishMenu = async () => {
    setIsPublishing(true);
    setIsHumanVerified(true);

    // Enriquecer automáticamente todos los platillos para los 3 servicios con el nodo de IA
    const updatedServices = {
      desayuno: { ...dishServices.desayuno },
      comida: { ...dishServices.comida },
      cena: { ...dishServices.cena }
    };
    const promises = [];

    ['desayuno', 'comida', 'cena'].forEach(sKey => {
      activeDays.forEach(dayName => {
        const dayDishes = updatedServices[sKey]?.[dayName] || {};

        // 1er Tiempo: Sopa / Entrada
        if (dayDishes.soup?.name?.trim()) {
          promises.push(
            menuStore.analyzeDishWithAI({
              name: dayDishes.soup.name,
              ingredients: dayDishes.soup.ingredients || '',
              category: '1er Tiempo: Sopa / Entrada'
            }).then(res => {
              if (res) {
                updatedServices[sKey][dayName].soup = {
                  ...updatedServices[sKey][dayName].soup,
                  calories: res.calorias,
                  protein: res.proteina,
                  carbs: res.carbos,
                  fats: res.grasas,
                  clinicalProfile: res.perfilClinico,
                  allergens: res.alergenos
                };
              }
            }).catch(() => {})
          );
        }

        // 2do Tiempo: Plato Fuerte
        if (dayDishes.optionA?.name?.trim()) {
          promises.push(
            menuStore.analyzeDishWithAI({
              name: dayDishes.optionA.name,
              ingredients: dayDishes.optionA.ingredients || '',
              category: 'Platillo fuerte'
            }).then(res => {
              if (res) {
                updatedServices[sKey][dayName].optionA = {
                  ...updatedServices[sKey][dayName].optionA,
                  calories: res.calorias,
                  protein: res.proteina,
                  carbs: res.carbos,
                  fats: res.grasas,
                  sodium: res.sodio_mg || 340,
                  sodio_mg: res.sodio_mg || 340,
                  clinicalProfile: res.perfilClinico,
                  allergens: res.alergenos
                };
              }
            }).catch(() => {})
          );
        }

        // 3er Tiempo: Guarnición
        if (dayDishes.optionB?.name?.trim()) {
          promises.push(
            menuStore.analyzeDishWithAI({
              name: dayDishes.optionB.name,
              ingredients: dayDishes.optionB.ingredients || '',
              category: 'Guarnicion'
            }).then(res => {
              if (res) {
                updatedServices[sKey][dayName].optionB = {
                  ...updatedServices[sKey][dayName].optionB,
                  calories: res.calorias,
                  protein: res.proteina,
                  carbs: res.carbos,
                  fats: res.grasas,
                  sodium: res.sodio_mg || 340,
                  sodio_mg: res.sodio_mg || 340,
                  clinicalProfile: res.perfilClinico,
                  allergens: res.alergenos
                };
              }
            }).catch(() => {})
          );
        }

        // 4to Tiempo: Postre
        if (dayDishes.optionC?.name?.trim()) {
          promises.push(
            menuStore.analyzeDishWithAI({
              name: dayDishes.optionC.name,
              ingredients: dayDishes.optionC.ingredients || '',
              category: 'Postre'
            }).then(res => {
              if (res) {
                updatedServices[sKey][dayName].optionC = {
                  ...updatedServices[sKey][dayName].optionC,
                  calories: res.calorias,
                  protein: res.proteina,
                  carbs: res.carbos,
                  fats: res.grasas,
                  clinicalProfile: res.perfilClinico,
                  allergens: res.alergenos
                };
              }
            }).catch(() => {})
          );
        }
      });
    });

    try {
      await Promise.all(promises);
    } catch (_) {}

    // Persist menu in menuStore para la semana seleccionada en calendario con los 3 servicios y 4 tiempos
    const published = menuStore.publishMenu({
      weekInput: targetWeekInfo,
      daysPerWeek: String(activeDays.length),
      dietOptionA,
      dietOptionB,
      dietOptionC,
      dishServices: updatedServices,
      dishSelection: updatedServices.comida,
      daysList: activeDays
    });

    if (published) {
      setActiveMenu(published);
    }

    setIsPublishing(false);
    setWizardSuccess(true);
    setTimeout(() => {
      setWizardSuccess(false);
      setWizardStep(1);
      setActiveTab('audit');
    }, 1200);
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
          onChangeWeek={(newWeekInfo) => {
            setTargetWeekInfo(newWeekInfo);
          }}
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
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: wizardStep >= 2 ? '#2563EB' : '#94A3B8' }}>2. Tiempos</span>
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
                Siguiente: Tiempos de Menú <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: 4 TIEMPOS INSTITUCIONALES */}
          {wizardStep === 2 && (
            <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1.25rem' }}>
                Paso 2: Tiempos de menú
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
                
                {/* 1: SOPA */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#B45309', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                    1er Tiempo:
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

                {/* 2: PLATILLO FUERTE */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }}></span>
                    2do Tiempo:
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <select
                      disabled
                      value="Platillo fuerte"
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
                      <option value="Platillo fuerte">Platillo fuerte</option>
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

                {/* 3: GUARNICION */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#15803D', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }}></span>
                    3er Tiempo:
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <select
                      disabled
                      value="Guarnicion"
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
                      <option value="Guarnicion">Guarnicion</option>
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

                {/* 4: POSTRE */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }}></span>
                    4to Tiempo:
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <select
                      disabled
                      value="Postre"
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
                      <option value="Postre">Postre</option>
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

          {/* STEP 3: REJILLA MANUAL EN BLANCO (3 SERVICIOS DIARIOS Y 4 TIEMPOS INSTITUCIONALES) */}
          {wizardStep === 3 && (
            <div className="animate-fade-in">

              {/* Selector de Servicio Diario (Desayuno, Comida, Cena) */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Clock size={18} color="#2563EB" />
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                    Turno de Servicio Institucional:
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {DAILY_SERVICES.map(srv => {
                    const isSelected = activeService === srv.key;
                    const sCount = getServiceDishesCount(srv.key);
                    return (
                      <button
                        key={srv.key}
                        type="button"
                        onClick={() => setActiveService(srv.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.55rem 1.15rem',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #2563EB' : '1px solid #CBD5E1',
                          background: isSelected ? '#EFF6FF' : '#FFFFFF',
                          color: isSelected ? '#1D4ED8' : '#475569',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 4px 10px rgba(37, 99, 235, 0.15)' : 'none'
                        }}
                      >
                        {srv.key === 'desayuno' && <Sunrise size={16} color={isSelected ? '#2563EB' : '#64748B'} />}
                        {srv.key === 'comida' && <Sun size={16} color={isSelected ? '#2563EB' : '#64748B'} />}
                        {srv.key === 'cena' && <Moon size={16} color={isSelected ? '#2563EB' : '#64748B'} />}
                        <span>{srv.label}</span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          background: isSelected ? '#2563EB' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#64748B'
                        }}>
                          {sCount}/{totalDishesRequired}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Distributed Days Catalog (Active Days Grid) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {activeDays.map((dayName) => {
                  const dayDishes = dishServices[activeService]?.[dayName] || {
                    soup: { name: '', ingredients: '', method: '' },
                    optionA: { name: '', ingredients: '', method: '' },
                    optionB: { name: '', ingredients: '', method: '' },
                    optionC: { name: '', ingredients: '', method: '' }
                  };
                  const activeServiceObj = DAILY_SERVICES.find(s => s.key === activeService) || DAILY_SERVICES[1];
                  return (
                    <div key={dayName} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '1rem', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{dayName}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                          {activeServiceObj.label} • 4 Tiempos
                        </span>
                      </div>

                      {/* 1er TIEMPO: SOPA */}
                      <div style={{ background: '#FFFBEB', padding: '0.85rem', borderRadius: '12px', marginBottom: '0.85rem', border: '1px solid #FDE68A' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#B45309' }}>
                            Sopa
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#92400E' }}>1er Tiempo</span>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Nombre de la sopa (Ej. Caldo de ave, Consomé suave o Entrada ligera)"
                          value={dayDishes.soup ? dayDishes.soup.name : ''}
                          onChange={(e) => handleDishChange(dayName, 'soup', 'name', e.target.value, activeService)}
                          style={{ width: '100%', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #FCD34D', borderRadius: '8px', outline: 'none', marginBottom: '0.4rem', background: '#FFFFFF' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setExpandedRecipe(expandedRecipe === `${activeService}-${dayName}-soup` ? null : `${activeService}-${dayName}-soup`)}
                          style={{ background: 'none', border: 'none', color: '#B45309', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                        >
                          {expandedRecipe === `${activeService}-${dayName}-soup` ? '- Ocultar Receta Técnica' : '+ Ver / Editar Receta Técnica'}
                        </button>

                        {expandedRecipe === `${activeService}-${dayName}-soup` && (
                          <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <textarea
                              value={dayDishes.soup ? dayDishes.soup.ingredients : ''}
                              onChange={(e) => handleDishChange(dayName, 'soup', 'ingredients', e.target.value, activeService)}
                              placeholder="Ingredientes y gramajes (Ej. 100ml Fondo de ave, 40g Zanahoria, 30g Calabacita)"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #FCD34D', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '65px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                            <textarea
                              value={dayDishes.soup ? dayDishes.soup.method : ''}
                              onChange={(e) => handleDishChange(dayName, 'soup', 'method', e.target.value, activeService)}
                              placeholder="Método de preparación técnica"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #FCD34D', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '55px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* 2do TIEMPO: PLATILLO FUERTE */}
                      <div style={{ background: '#EFF6FF', padding: '0.85rem', borderRadius: '12px', marginBottom: '0.85rem', border: '1px solid #BFDBFE' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563EB', marginBottom: '0.3rem' }}>
                          Platillo fuerte
                        </div>
                        <input 
                          type="text" 
                          placeholder="Nombre del platillo fuerte (Ej. Filete de pescado horneado, Pechuga tierna)"
                          value={dayDishes.optionA ? dayDishes.optionA.name : ''}
                          onChange={(e) => handleDishChange(dayName, 'optionA', 'name', e.target.value, activeService)}
                          style={{ width: '100%', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #93C5FD', borderRadius: '8px', outline: 'none', marginBottom: '0.4rem', background: '#FFFFFF' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setExpandedRecipe(expandedRecipe === `${activeService}-${dayName}-A` ? null : `${activeService}-${dayName}-A`)}
                          style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                        >
                          {expandedRecipe === `${activeService}-${dayName}-A` ? '- Ocultar Receta Técnica' : '+ Ver / Editar Receta Técnica'}
                        </button>

                        {expandedRecipe === `${activeService}-${dayName}-A` && (
                          <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <textarea
                              value={dayDishes.optionA ? dayDishes.optionA.ingredients : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionA', 'ingredients', e.target.value, activeService)}
                              placeholder="Ingredientes y gramajes (Ej. 150g Pollo deshebrado, 50g Quinoa suave, 80g Calabacitas)"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #BFDBFE', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '65px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                            <textarea
                              value={dayDishes.optionA ? dayDishes.optionA.method : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionA', 'method', e.target.value, activeService)}
                              placeholder="Método de preparación técnica"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #BFDBFE', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '55px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* 3er TIEMPO: GUARNICION */}
                      <div style={{ background: '#F0FDF4', padding: '0.85rem', borderRadius: '12px', marginBottom: '0.85rem', border: '1px solid #BBF7D0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--green-dark)', marginBottom: '0.3rem' }}>
                          Guarnicion
                        </div>
                        <input 
                          type="text" 
                          placeholder="Nombre de la guarnicion (Ej. Puré de camote amarillo, Arroz salvaje al vapor)"
                          value={dayDishes.optionB ? dayDishes.optionB.name : ''}
                          onChange={(e) => handleDishChange(dayName, 'optionB', 'name', e.target.value, activeService)}
                          style={{ width: '100%', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #86EFAC', borderRadius: '8px', outline: 'none', marginBottom: '0.4rem', background: '#FFFFFF' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setExpandedRecipe(expandedRecipe === `${activeService}-${dayName}-B` ? null : `${activeService}-${dayName}-B`)}
                          style={{ background: 'none', border: 'none', color: '#15803D', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                        >
                          {expandedRecipe === `${activeService}-${dayName}-B` ? '- Ocultar Receta Técnica' : '+ Ver / Editar Receta Técnica'}
                        </button>

                        {expandedRecipe === `${activeService}-${dayName}-B` && (
                          <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <textarea
                              value={dayDishes.optionB ? dayDishes.optionB.ingredients : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionB', 'ingredients', e.target.value, activeService)}
                              placeholder="Ingredientes y gramajes (Ej. 120g Puré de papa o legumbre, 80g Vegetales cocidos)"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #BBF7D0', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '65px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                            <textarea
                              value={dayDishes.optionB ? dayDishes.optionB.method : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionB', 'method', e.target.value, activeService)}
                              placeholder="Método de preparación técnica"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #BBF7D0', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '55px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* 4to TIEMPO: POSTRE */}
                      <div style={{ background: '#FAF5FF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E9D5FF' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#7C3AED', marginBottom: '0.3rem' }}>
                          Postre
                        </div>
                        <input 
                          type="text" 
                          placeholder="Nombre del postre (Ej. Compota de pera, Gelatina proteica)"
                          value={dayDishes.optionC ? dayDishes.optionC.name : ''}
                          onChange={(e) => handleDishChange(dayName, 'optionC', 'name', e.target.value, activeService)}
                          style={{ width: '100%', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #D8B4FE', borderRadius: '8px', outline: 'none', marginBottom: '0.4rem', background: '#FFFFFF' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setExpandedRecipe(expandedRecipe === `${activeService}-${dayName}-C` ? null : `${activeService}-${dayName}-C`)}
                          style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                        >
                          {expandedRecipe === `${activeService}-${dayName}-C` ? '- Ocultar Receta Técnica' : '+ Ver / Editar Receta Técnica'}
                        </button>

                        {expandedRecipe === `${activeService}-${dayName}-C` && (
                          <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <textarea
                              value={dayDishes.optionC ? dayDishes.optionC.ingredients : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionC', 'ingredients', e.target.value, activeService)}
                              placeholder="Ingredientes y gramajes (Ej. 80g Fruta cocida al vapor, 10g Proteína neutra)"
                              style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-dark)', padding: '0.5rem', border: '1px solid #E9D5FF', borderRadius: '8px', outline: 'none', resize: 'vertical', minHeight: '65px', background: '#FFFFFF', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                            />
                            <textarea
                              value={dayDishes.optionC ? dayDishes.optionC.method : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionC', 'method', e.target.value, activeService)}
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

              {/* Selector de Servicio Diario para Auditoría */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '0.75rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                  <Clock size={16} color="#2563EB" />
                  <span>Servicio a Auditar:</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {DAILY_SERVICES.map(srv => {
                    const isSelected = auditService === srv.key;
                    return (
                      <button
                        key={srv.key}
                        type="button"
                        onClick={() => setAuditService(srv.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 1rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #2563EB' : '1px solid #CBD5E1',
                          background: isSelected ? '#EFF6FF' : '#FFFFFF',
                          color: isSelected ? '#1D4ED8' : '#475569',
                          fontWeight: '700',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {srv.key === 'desayuno' && <Sunrise size={15} color={isSelected ? '#2563EB' : '#64748B'} />}
                        {srv.key === 'comida' && <Sun size={15} color={isSelected ? '#2563EB' : '#64748B'} />}
                        {srv.key === 'cena' && <Moon size={15} color={isSelected ? '#2563EB' : '#64748B'} />}
                        <span>{srv.label}</span>
                        <span style={{ fontSize: '0.7rem', color: isSelected ? '#2563EB' : '#94A3B8', fontWeight: '600' }}>
                          ({srv.timeLabel})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Control de Cálculo Automático: Porción Unitaria vs Lote de Producción */}
              {(() => {
                const activeAuditServiceData = currentDay?.services?.[auditService] || (auditService === 'comida' ? currentDay : currentDay?.services?.[auditService]) || {};
                const dishSoup = activeAuditServiceData.soup;
                const dishOptionA = activeAuditServiceData.optionA;
                const dishOptionB = activeAuditServiceData.optionB;
                const dishOptionC = activeAuditServiceData.optionC;

                const portionsToScale = auditMode === 'production' ? Math.max(1, auditPortions) : 1;
                const nutritionSoup = dishSoup ? scaleNutrition(dishSoup, portionsToScale) : null;
                const nutritionA = dishOptionA ? scaleNutrition(dishOptionA, portionsToScale) : null;
                const nutritionB = dishOptionB ? scaleNutrition(dishOptionB, portionsToScale) : null;
                const nutritionC = dishOptionC ? scaleNutrition(dishOptionC, portionsToScale) : null;

                const scaledSoup = dishSoup?.recipe?.ingredients ? scaleIngredients(dishSoup.recipe.ingredients, portionsToScale) : [];
                const scaledA = dishOptionA?.recipe?.ingredients ? scaleIngredients(dishOptionA.recipe.ingredients, portionsToScale) : [];
                const scaledB = dishOptionB?.recipe?.ingredients ? scaleIngredients(dishOptionB.recipe.ingredients, portionsToScale) : [];
                const scaledC = dishOptionC?.recipe?.ingredients ? scaleIngredients(dishOptionC.recipe.ingredients, portionsToScale) : [];

                return (
                  <>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0.85rem 1.25rem', borderRadius: '14px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563EB', fontWeight: '700', fontSize: '0.85rem' }}>
                          <Calculator size={18} />
                          <span>Cálculo Nutricional & Recetas (4 Tiempos):</span>
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

                    {/* Comparative Clinical Cards (4 Tiempos Institucionales) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                      
                      {/* 1er TIEMPO: SOPA */}
                      {dishSoup && (
                        <div className="uber-card" style={{ padding: '1.5rem', borderTop: '4px solid #F59E0B' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                            <span className="badge-tag" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: '800' }}>
                              1er Tiempo • Sopa
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: '700', background: '#FFFBEB', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                              Inicio
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                            {dishSoup?.name || 'Sopa'}
                          </h4>

                          {/* Clinical Macro Breakdown Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', background: '#FFFBEB', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', margin: '0.85rem 0', border: '1px solid #FDE68A' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Calorías</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#B45309' }}>
                                {auditMode === 'production' ? `${nutritionSoup?.totalProduction.calories} kcal` : `${nutritionSoup?.unit.calories || dishSoup?.calories || 220} kcal`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Proteína</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#B45309' }}>
                                {auditMode === 'production' ? `${nutritionSoup?.totalProduction.protein}g` : `${nutritionSoup?.unit.protein || 12}g`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Carbos</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#B45309' }}>
                                {auditMode === 'production' ? `${nutritionSoup?.totalProduction.carbs}g` : `${nutritionSoup?.unit.carbs || 24}g`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Grasas</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#B45309' }}>
                                {auditMode === 'production' ? `${nutritionSoup?.totalProduction.fats}g` : `${nutritionSoup?.unit.fats || 6}g`}
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                            <strong>Perfil Clínico:</strong> {dishSoup?.clinicalProfile || 'Caldo natural rico en electrolitos, favorece vaciado gástrico y deglución suave.'}
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
                                            {item.amountScaled !== null ? `${item.amountScaled} ${item.unitScaled}` : item.displayScaled}
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

                      {/* 2do TIEMPO: PLATO FUERTE */}
                      {dishOptionA && (
                        <div className="uber-card" style={{ padding: '1.5rem', borderTop: '4px solid #2563EB' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                            <span className="badge-tag" style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: '800' }}>
                              2do Tiempo • Platillo fuerte
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: '700', background: '#F0FDF4', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                              ✓ Aprobado
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                            {dishOptionA?.name || 'Platillo fuerte'}
                          </h4>

                          {/* Clinical Macro Breakdown Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem', background: '#F8FAFC', padding: '0.75rem 0.5rem', borderRadius: '10px', textAlign: 'center', margin: '1rem 0', border: '1px solid #E2E8F0' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Calorías</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)' }}>
                                {auditMode === 'production' ? `${nutritionA?.totalProduction.calories} kcal` : `${nutritionA?.unit.calories || dishOptionA?.calories || 480} kcal`}
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
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: (dishOptionA?.sodium || dishOptionA?.sodio_mg || 340) <= 500 ? '#065F46' : '#991B1B' }}>
                                {dishOptionA?.sodium || dishOptionA?.sodio_mg || 340}mg
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                            <strong>Perfil Clínico:</strong> {dishOptionA?.clinicalProfile || 'Índice glucémico controlado, digestión ágil sin pesadez post-almuerzo.'}
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            <strong>Alérgenos registrados:</strong> {(dishOptionA?.allergens || []).length > 0 ? dishOptionA.allergens.join(', ') : 'Ninguno (Libre de alérgenos comunes)'}
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
                                            {item.amountScaled !== null ? `${item.amountScaled} ${item.unitScaled}` : item.displayScaled}
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

                      {/* 3er TIEMPO: GUARNICIÓN */}
                      {dishOptionB && (
                        <div className="uber-card" style={{ padding: '1.5rem', borderTop: '4px solid #16A34A' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                            <span className="badge-tag" style={{ background: '#F0FDF4', color: '#16A34A', fontWeight: '800' }}>
                              3er Tiempo • Guarnicion
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: '700', background: '#F0FDF4', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                              ✓ Aprobado
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                            {dishOptionB?.name || 'Guarnicion'}
                          </h4>

                          {/* Clinical Macro Breakdown Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem', background: '#F8FAFC', padding: '0.75rem 0.5rem', borderRadius: '10px', textAlign: 'center', margin: '1rem 0', border: '1px solid #E2E8F0' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Calorías</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)' }}>
                                {auditMode === 'production' ? `${nutritionB?.totalProduction.calories} kcal` : `${nutritionB?.unit.calories || dishOptionB?.calories || 430} kcal`}
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
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: (dishOptionB?.sodium || dishOptionB?.sodio_mg || 320) <= 500 ? '#065F46' : '#991B1B' }}>
                                {dishOptionB?.sodium || dishOptionB?.sodio_mg || 320}mg
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                            <strong>Perfil Clínico:</strong> {dishOptionB?.clinicalProfile || 'Alto contenido de fibra vegetal e ingredientes antioxidantes antiinflamatorios.'}
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            <strong>Alérgenos registrados:</strong> {(dishOptionB?.allergens || []).length > 0 ? dishOptionB.allergens.join(', ') : 'Ninguno (Libre de alérgenos comunes)'}
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
                                            {item.amountScaled !== null ? `${item.amountScaled} ${item.unitScaled}` : item.displayScaled}
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

                      {/* 4to TIEMPO: POSTRE */}
                      {dishOptionC && (
                        <div className="uber-card" style={{ padding: '1.5rem', borderTop: '4px solid #8B5CF6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                            <span className="badge-tag" style={{ background: '#FAF5FF', color: '#7C3AED', fontWeight: '800' }}>
                              4to Tiempo • Postre
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: '700', background: '#F0FDF4', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                              ✓ Aprobado
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                            {dishOptionC?.name || 'Postre'}
                          </h4>

                          {/* Clinical Macro Breakdown Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', background: '#FAF5FF', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', margin: '0.85rem 0', border: '1px solid #E9D5FF' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#7C3AED' }}>Calorías</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#7C3AED' }}>
                                {auditMode === 'production' ? `${nutritionC?.totalProduction.calories} kcal` : `${nutritionC?.unit.calories || dishOptionC?.calories || 390} kcal`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#7C3AED' }}>Proteína</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#7C3AED' }}>
                                {auditMode === 'production' ? `${nutritionC?.totalProduction.protein}g` : `${nutritionC?.unit.protein || 28}g`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#7C3AED' }}>Carbos</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#7C3AED' }}>
                                {auditMode === 'production' ? `${nutritionC?.totalProduction.carbs}g` : `${nutritionC?.unit.carbs || 38}g`}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#7C3AED' }}>Grasas</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#7C3AED' }}>
                                {auditMode === 'production' ? `${nutritionC?.totalProduction.fats}g` : `${nutritionC?.unit.fats || 12}g`}
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                            <strong>Perfil Clínico:</strong> {dishOptionC?.clinicalProfile || 'Formulación balanceada, control estricto de sodio e ingredientes digestivos.'}
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
                                            {item.amountScaled !== null ? `${item.amountScaled} ${item.unitScaled}` : item.displayScaled}
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
    </div>
  );
}
