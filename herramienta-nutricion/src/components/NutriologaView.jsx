import React, { useState, useEffect } from 'react';
import { HeartPulse, ShieldCheck, CheckCircle2, AlertTriangle, Activity, Apple, Flame, Wand2, ChevronRight, ChevronDown, ArrowLeft, Check, RefreshCw, Layers } from 'lucide-react';
import { cyclicMenus, nutriologaInfo, programInfo } from '../data/mockData';
import { menuStore, getWeekInfoFromDate } from '../services/menuStore';
import WeekCalendarPicker from './WeekCalendarPicker';

const GET_ACTIVE_DAYS = (numDays) => {
  const n = parseInt(numDays, 10) || 3;
  if (n === 1) return ['Lunes'];
  if (n === 2) return ['Lunes', 'Miércoles'];
  if (n === 3) return ['Lunes', 'Miércoles', 'Viernes'];
  if (n === 4) return ['Lunes', 'Martes', 'Miércoles', 'Jueves'];
  return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
};

const INITIAL_DISH_SELECTION = {
  Lunes: {
    optionA: {
      name: "Pechuga Grill con Crosta de Hierbas y Quinoa",
      ingredients: "150g Pechuga de Pollo, 50g Quinoa tricolor, 80g Calabacitas, 10ml Aceite, 2g Sal, 3g Romero",
      method: "1. Macerar pollo con romero, aceite y sal.\n2. Cocinar a la plancha a 180°C por 6 mins por lado.\n3. Hervir quinoa.\n4. Saltear calabacitas en cubos."
    },
    optionB: {
      name: "Bowl Mediterráneo de Garbanzos Rostizados",
      ingredients: "100g Garbanzos cocidos, 50g Pepino persa, 50g Jitomates cherry, 20g Aceitunas, 30g Aderezo tahini",
      method: "1. Rostizar garbanzos con paprika a 200°C por 15 mins.\n2. Cortar vegetales frescos.\n3. Mezclar con aderezo."
    }
  },
  Martes: {
    optionA: {
      name: "Salmón Noruego a la Plancha con Miel de Mostaza",
      ingredients: "150g Salmón fresco, 100g Camote en cubos, 80g Espárragos al vapor, 15ml Mostaza-miel",
      method: "1. Sellar salmón en plancha a 200°C por 4 mins por lado.\n2. Hornear cubos de camote.\n3. Servir con espárragos al vapor."
    },
    optionB: {
      name: "Curry Cremoso de Lentejas Amarillas y Espinacas",
      ingredients: "120g Lentejas amarillas, 60ml Leche de coco light, 50g Espinacas baby, 50g Cuscús perlado",
      method: "1. Cocer lentejas con curry y cúrcuma.\n2. Añadir leche de coco y espinacas al final.\n3. Acompañar con cuscús."
    }
  },
  Miércoles: {
    optionA: {
      name: "Wrap Ejecutivo de Pechuga de Pavo y Hummus",
      ingredients: "1 Tortilla espinaca, 100g Pavo, 40g Hummus, 40g Aguacate, 30g Pimientos",
      method: "1. Untar hummus como base.\n2. Colocar pavo y vegetales.\n3. Enrollar y cortar en dos."
    },
    optionB: {
      name: "Wok de Tofu Marinado y Edamames",
      ingredients: "120g Tofu firme, 60g Edamames, 70g Arroz integral, 40g Brócoli, 15ml Soya",
      method: "1. Prensar y sellar tofu en wok.\n2. Glasear vegetales con soya.\n3. Servir sobre arroz."
    }
  },
  Jueves: {
    optionA: {
      name: "Fajitas de Pollo Orgánico con Trilogía de Pimientos",
      ingredients: "150g Pechuga en tiras, 60g Pimiento rojo, 60g Pimiento verde, 40g Cebolla morada, 2 Tortillas maíz",
      method: "1. Saltear pollo a la plancha con cebolla y pimientos.\n2. Sazonar con orégano y sal marina.\n3. Servir caliente."
    },
    optionB: {
      name: "Bowl de Frijol Negro, Quinoa y Guacamole Fresco",
      ingredients: "100g Frijol negro cocido, 60g Quinoa cocida, 40g Guacamole casero, 30g Pico de gallo",
      method: "1. Estofar frijol negro con epazote.\n2. Montar cama de quinoa y frijoles.\n3. Coronar con guacamole y pico de gallo."
    }
  },
  Viernes: {
    optionA: {
      name: "Medallones de Cerdo Magro al Romero",
      ingredients: "150g Cerdo magro, 100g Camote horneado, 50g Espinaca baby, 15g Nuez",
      method: "1. Hornear cerdo marinado a 190°C por 20 mins.\n2. Machacar camote rústicamente."
    },
    optionB: {
      name: "Curry Verde Ligero de Lentejas Coral",
      ingredients: "100g Lentejas coral, 80ml Leche coco light, 40g Calabacita, 30g Espinaca, 5g Curry verde",
      method: "1. Sofreír curry, añadir lentejas.\n2. Hervir 15 mins.\n3. Agregar leche coco y vegetales."
    }
  }
};

export default function NutriologaView({ selectedWeek }) {
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

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [daysPerWeek, setDaysPerWeek] = useState(3); // 1 to 5
  const [dietOptionA, setDietOptionA] = useState('Balance Proteico');
  const [dietOptionB, setDietOptionB] = useState('Plant-Based & Digestión Ligera');
  const [wizardSuccess, setWizardSuccess] = useState(false);

  // Dishes selection for manual grid filling
  const [dishSelection, setDishSelection] = useState(INITIAL_DISH_SELECTION);
  const [expandedRecipes, setExpandedRecipes] = useState({}); // track expanded recipes by `${dayName}-${option}`
  const [reviewedRecipes, setReviewedRecipes] = useState({}); // track audited/reviewed recipes by `${dayName}-${option}`

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [humanAuditNotes, setHumanAuditNotes] = useState('');
  const isMenuPublished = Boolean(activeMenu && activeMenu.isPublished && activeMenu.days && activeMenu.days.length > 0);
  const weekData = isMenuPublished ? activeMenu : { days: [] };
  const safeDayIndex = selectedDayIndex < weekData.days.length ? selectedDayIndex : 0;
  const currentDay = (weekData.days && weekData.days[safeDayIndex]) || null;

  const activeDays = GET_ACTIVE_DAYS(daysPerWeek);
  const requiredRecipeKeys = activeDays.flatMap(day => [`${day}-A`, `${day}-B`]);
  const reviewedCount = requiredRecipeKeys.filter(key => reviewedRecipes[key]).length;
  const allRecipesReviewed = requiredRecipeKeys.length > 0 && reviewedCount === requiredRecipeKeys.length;

  const toggleRecipeExpansion = (recipeKey) => {
    setExpandedRecipes(prev => ({
      ...prev,
      [recipeKey]: !prev[recipeKey]
    }));
    // Mark as reviewed upon opening technical recipe
    setReviewedRecipes(prev => ({
      ...prev,
      [recipeKey]: true
    }));
  };

  const handleDishChange = (dayName, option, field, newValue) => {
    const optSuffix = option === 'optionA' ? 'A' : 'B';
    // Mark as reviewed upon editing dish or technical recipe
    setReviewedRecipes(prev => ({
      ...prev,
      [`${dayName}-${optSuffix}`]: true
    }));
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

  const handlePublishMenu = () => {
    if (!isHumanVerified) return;

    // Persist menu in menuStore para la semana seleccionada en calendario con certificación humana
    menuStore.publishMenu({
      weekInput: targetWeekInfo,
      daysPerWeek: String(daysPerWeek),
      dietOptionA,
      dietOptionB,
      dishSelection,
      humanVerification: {
        isVerified: true,
        verifiedBy: nutriologaInfo.name,
        role: nutriologaInfo.role,
        verifiedAt: new Date().toISOString(),
        certificationStatement: 'Menú auditado y certificado manualmente por especialista humano bajo responsabilidad clínica',
        notes: humanAuditNotes || 'Auditoría sin incidencias clínicas.'
      }
    });

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
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: wizardStep >= 1 ? '#2563EB' : '#94A3B8' }}>1. Frecuencia</span>
              <ChevronRight size={14} color="#CBD5E1" />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: wizardStep >= 2 ? '#2563EB' : '#94A3B8' }}>2. Dietas</span>
              <ChevronRight size={14} color="#CBD5E1" />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: wizardStep >= 3 ? '#2563EB' : '#94A3B8' }}>3. Rejilla Manual</span>
            </div>
          </div>

          {/* STEP 1: FREQUENCY */}
          {wizardStep === 1 && (
            <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Paso 1: ¿Cuántos días a la semana se entregará el servicio?
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Selecciona la frecuencia de entregas programadas para la empresa Retodali.
              </p>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((dayNum) => (
                  <button
                    key={dayNum}
                    onClick={() => setDaysPerWeek(dayNum)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: daysPerWeek === dayNum ? '#2563EB' : '#FFFFFF',
                      color: daysPerWeek === dayNum ? '#FFFFFF' : '#475569',
                      border: daysPerWeek === dayNum ? 'none' : '2px solid #E2E8F0',
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: daysPerWeek === dayNum ? '0 6px 16px rgba(37, 99, 235, 0.3)' : 'none',
                      transition: 'all 0.2s ease',
                      transform: daysPerWeek === dayNum ? 'translateY(-2px)' : 'none'
                    }}
                  >
                    {dayNum}
                  </button>
                ))}
              </div>

              <button onClick={() => setWizardStep(2)} className="btn-uber-primary" style={{ width: '100%', justifyContent: 'center', background: '#2563EB' }}>
                Siguiente: Definir Tipos de Dieta <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: DIET TYPES */}
          {wizardStep === 2 && (
            <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Paso 2: Define los 2 enfoques de dieta para las Opciones A y B
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Los empleados podrán elegir entre estas 2 vertientes gastronómicas balanceadas.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }}></span>
                    Enfoque para la Opción A (Proteica / Balance):
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
                      <option value="Balance Proteico">Balance Proteico (Pollo magro / Pavo / Sirloin)</option>
                      <option value="Low Carb Keto">Low Carb / Keto Friendly (Bajo en carbohidratos)</option>
                      <option value="Gourmet Saludable">Gourmet Saludable de Estación</option>
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

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#15803D', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }}></span>
                    Enfoque para la Opción B (Plant-Based / Light):
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
                      <option value="Plant-Based & Digestión Ligera">Plant-Based & Vegano (Garbanzo / Tofu / Lenteja)</option>
                      <option value="Vegetariano Balance">Vegetariano con Quesos Artesanales Magros</option>
                      <option value="Superfoods & Antiinflamatorio">Superfoods Antiinflamatorios & Ensaladas</option>
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

          {/* STEP 3: MANUAL GRID ASSISTANT */}
          {wizardStep === 3 && (
            <div className="animate-fade-in">
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.1rem 1.25rem', borderRadius: '14px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                    <Layers size={22} />
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-dark)', fontSize: '1rem' }}>Asistente de Menú: Rejilla Manual de Platillos</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Ingresa y ajusta directamente las opciones y recetas técnicas para cada día del servicio.
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="badge-tag" style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: '800', fontSize: '0.85rem' }}>
                    {activeDays.length} {activeDays.length === 1 ? 'Día' : 'Días'} • {activeDays.length * 2} Platillos
                  </span>
                  <span className="badge-tag" style={{
                    background: allRecipesReviewed ? '#DCFCE7' : '#FEF3C7',
                    color: allRecipesReviewed ? '#15803D' : '#B45309',
                    fontWeight: '800',
                    fontSize: '0.82rem'
                  }}>
                    {allRecipesReviewed ? `✓ ${reviewedCount}/${requiredRecipeKeys.length} Recetas Auditadas` : `Auditoría: ${reviewedCount}/${requiredRecipeKeys.length}`}
                  </span>
                </div>
              </div>

              {/* Distributed Days Catalog (Active Days Grid) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {activeDays.map((dayName) => {
                  const dayDishes = dishSelection[dayName] || {
                    optionA: { name: '', ingredients: '', method: '' },
                    optionB: { name: '', ingredients: '', method: '' }
                  };
                  return (
                    <div key={dayName} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-dark)', marginBottom: '0.75rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{dayName}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Entrega en Oficina</span>
                      </div>

                      <div style={{ background: '#EFF6FF', padding: '0.75rem', borderRadius: '10px', marginBottom: '0.75rem', border: '1px solid #BFDBFE' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#2563EB', marginBottom: '0.2rem' }}>Opción A ({dietOptionA}):</div>
                        <input 
                          type="text" 
                          placeholder="Nombre del platillo Opción A"
                          value={dayDishes.optionA ? dayDishes.optionA.name : ''}
                          onChange={(e) => handleDishChange(dayName, 'optionA', 'name', e.target.value)}
                          style={{ width: '100%', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0.45rem', border: '1px solid #93C5FD', borderRadius: '6px', outline: 'none', marginBottom: '0.4rem', background: '#FFFFFF' }}
                        />
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                          <button 
                            type="button"
                            onClick={() => toggleRecipeExpansion(`${dayName}-A`)}
                            style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                          >
                            {expandedRecipes[`${dayName}-A`] ? '- Ocultar Receta Técnica' : '+ Ver / Editar Receta Técnica'}
                          </button>
                          {reviewedRecipes[`${dayName}-A`] ? (
                            <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Check size={12} strokeWidth={3} /> Auditada
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: '600' }}>
                              • Pendiente de auditar
                            </span>
                          )}
                        </div>

                        {expandedRecipes[`${dayName}-A`] && (
                          <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <textarea
                              value={dayDishes.optionA ? dayDishes.optionA.ingredients : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionA', 'ingredients', e.target.value)}
                              placeholder="Ingredientes y gramajes (Ej. 150g Pollo, 50g Quinoa)"
                              style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-dark)', padding: '0.4rem', border: '1px solid #BFDBFE', borderRadius: '6px', outline: 'none', resize: 'vertical', minHeight: '45px', background: '#FFFFFF' }}
                            />
                            <textarea
                              value={dayDishes.optionA ? dayDishes.optionA.method : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionA', 'method', e.target.value)}
                              placeholder="Método de preparación técnica"
                              style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-dark)', padding: '0.4rem', border: '1px solid #BFDBFE', borderRadius: '6px', outline: 'none', resize: 'vertical', minHeight: '60px', background: '#FFFFFF' }}
                            />
                          </div>
                        )}
                      </div>

                      <div style={{ background: '#F0FDF4', padding: '0.75rem', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--green-dark)', marginBottom: '0.2rem' }}>Opción B ({dietOptionB}):</div>
                        <input 
                          type="text" 
                          placeholder="Nombre del platillo Opción B"
                          value={dayDishes.optionB ? dayDishes.optionB.name : ''}
                          onChange={(e) => handleDishChange(dayName, 'optionB', 'name', e.target.value)}
                          style={{ width: '100%', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0.45rem', border: '1px solid #86EFAC', borderRadius: '6px', outline: 'none', marginBottom: '0.4rem', background: '#FFFFFF' }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                          <button 
                            type="button"
                            onClick={() => toggleRecipeExpansion(`${dayName}-B`)}
                            style={{ background: 'none', border: 'none', color: '#15803D', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                          >
                            {expandedRecipes[`${dayName}-B`] ? '- Ocultar Receta Técnica' : '+ Ver / Editar Receta Técnica'}
                          </button>
                          {reviewedRecipes[`${dayName}-B`] ? (
                            <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Check size={12} strokeWidth={3} /> Auditada
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: '600' }}>
                              • Pendiente de auditar
                            </span>
                          )}
                        </div>

                        {expandedRecipes[`${dayName}-B`] && (
                          <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <textarea
                              value={dayDishes.optionB ? dayDishes.optionB.ingredients : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionB', 'ingredients', e.target.value)}
                              placeholder="Ingredientes y gramajes (Ej. 120g Tofu, 80g Vegetales)"
                              style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-dark)', padding: '0.4rem', border: '1px solid #BBF7D0', borderRadius: '6px', outline: 'none', resize: 'vertical', minHeight: '45px', background: '#FFFFFF' }}
                            />
                            <textarea
                              value={dayDishes.optionB ? dayDishes.optionB.method : ''}
                              onChange={(e) => handleDishChange(dayName, 'optionB', 'method', e.target.value)}
                              placeholder="Método de preparación técnica"
                              style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-dark)', padding: '0.4rem', border: '1px solid #BBF7D0', borderRadius: '6px', outline: 'none', resize: 'vertical', minHeight: '60px', background: '#FFFFFF' }}
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
                  {/* Mecanismo Oficial de Certificación y Verificación Humana Obligatoria */}
                  <div style={{
                    background: isHumanVerified ? '#F0FDF4' : '#FFFFFF',
                    border: `2px solid ${isHumanVerified ? '#22C55E' : '#CBD5E1'}`,
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.5rem',
                    boxShadow: isHumanVerified ? '0 4px 16px rgba(34, 197, 94, 0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.25s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          background: isHumanVerified ? '#DCFCE7' : '#EFF6FF',
                          color: isHumanVerified ? '#15803D' : '#2563EB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>
                            Certificación de Verificación Humana (Obligatoria)
                          </h4>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.72rem', background: '#FFFFFF', padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid #E2E8F0', color: '#475569', fontWeight: '600' }}>
                        Auditor: <strong>{nutriologaInfo.name}</strong> • {nutriologaInfo.role.split('&')[0]}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.45' }}>
                      Para certificar la seguridad alimentaria de los colaboradores de Royal Canin y garantizar que ningún platillo se publique sin criterio profesional, la nutrióloga responsable debe confirmar haber auditado los gramajes, ingredientes y alérgenos de los días configurados.
                    </p>

                    {/* Alerta de prerrequisito de auditoría obligatoria de recetas */}
                    {!allRecipesReviewed ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        background: '#FEF3C7',
                        border: '1px solid #FCD34D',
                        borderRadius: '10px',
                        padding: '0.7rem 0.9rem',
                        marginBottom: '1rem',
                        fontSize: '0.8rem',
                        color: '#92400E'
                      }}>
                        <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
                        <div>
                          <strong>Auditoría Requerida:</strong> Para poder certificar, es obligatorio abrir y revisar las recetas técnicas de todos los platillos ({reviewedCount} de {requiredRecipeKeys.length} auditadas).
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        background: '#F0FDF4',
                        border: '1px solid #86EFAC',
                        borderRadius: '10px',
                        padding: '0.6rem 0.9rem',
                        marginBottom: '1rem',
                        fontSize: '0.8rem',
                        color: '#15803D'
                      }}>
                        <Check size={18} color="#16A34A" style={{ flexShrink: 0 }} />
                        <span>
                          <strong>100% Auditado:</strong> Has revisado las recetas técnicas de todos los platillos ({reviewedCount}/{requiredRecipeKeys.length}). El check de certificación está habilitado.
                        </span>
                      </div>
                    )}

                    {/* Checkbox interactivo de responsabilidad clínica */}
                    <div 
                      onClick={() => {
                        if (!allRecipesReviewed) return;
                        setIsHumanVerified(!isHumanVerified);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.85rem',
                        padding: '0.85rem 1rem',
                        background: !allRecipesReviewed ? '#F1F5F9' : (isHumanVerified ? '#FFFFFF' : '#F8FAFC'),
                        borderRadius: '12px',
                        border: `1.5px solid ${!allRecipesReviewed ? '#CBD5E1' : (isHumanVerified ? '#16A34A' : '#CBD5E1')}`,
                        cursor: allRecipesReviewed ? 'pointer' : 'not-allowed',
                        opacity: allRecipesReviewed ? 1 : 0.65,
                        userSelect: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      title={!allRecipesReviewed ? 'Debes revisar todas las recetas técnicas antes de certificar' : ''}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: isHumanVerified ? '#16A34A' : '#FFFFFF',
                        border: `2px solid ${isHumanVerified ? '#16A34A' : '#94A3B8'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        flexShrink: 0,
                        marginTop: '2px',
                        transition: 'all 0.2s ease'
                      }}>
                        {isHumanVerified && <Check size={16} strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: '700', color: isHumanVerified ? '#166534' : 'var(--text-dark)', lineHeight: '1.4' }}>
                          Certifico bajo responsabilidad clínica que he auditado manualmente cada una de las opciones culinarias, garantizando el balance calórico, la rotación de insumos y la seguridad ante alérgenos.
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.25rem' }}>
                          Firma digital: {nutriologaInfo.name} • {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Campo de notas de auditoría */}
                    {isHumanVerified && (
                      <div className="animate-fade-in" style={{ marginTop: '0.75rem' }}>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#166534', display: 'block', marginBottom: '0.25rem' }}>
                          Notas de verificación clínica (opcional):
                        </label>
                        <input
                          type="text"
                          value={humanAuditNotes}
                          onChange={(e) => setHumanAuditNotes(e.target.value)}
                          placeholder="Ej. Revisión completa: gramajes estandarizados y sustituciones balanceadas."
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '0.45rem 0.75rem',
                            fontSize: '0.8rem',
                            border: '1px solid #86EFAC',
                            borderRadius: '8px',
                            background: '#FFFFFF',
                            color: 'var(--text-dark)',
                            outline: 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
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
                        background: isHumanVerified ? '#16A34A' : '#94A3B8',
                        cursor: isHumanVerified ? 'pointer' : 'not-allowed',
                        opacity: isHumanVerified ? 1 : 0.7,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: isHumanVerified ? '0 4px 14px rgba(22, 163, 74, 0.3)' : 'none'
                      }}
                      disabled={!isHumanVerified}
                    >
                      <ShieldCheck size={18} /> Certificar y Publicar Menú Oficial
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

              {/* Sello de Certificación y Supervisión Humana */}
              {weekData.humanVerification?.isVerified && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  borderRadius: '12px',
                  padding: '0.6rem 1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.8rem',
                  color: '#15803D'
                }}>
                  <ShieldCheck size={20} color="#16A34A" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Supervisión Clínica Humana Certificada:</strong> Menú auditado personalmente por <strong>{weekData.humanVerification.verifiedBy}</strong> ({weekData.humanVerification.role}) el {new Date(weekData.humanVerification.verifiedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}.
                    {weekData.humanVerification.notes && (
                      <span style={{ color: '#166534', marginLeft: '0.35rem', fontStyle: 'italic' }}>— "{weekData.humanVerification.notes}"</span>
                    )}
                  </div>
                </div>
              )}

              {/* Comparative Clinical Cards */}
              <div className="comparative-grid">
                
                {/* OPTION A AUDIT */}
                <div className="uber-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span className="badge-tag badge-red">Opción A • {currentDay.optionA?.category || dietOptionA}</span>
                    <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: '700', background: '#F0FDF4', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                      ✓ Aprobado por Nutrición
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                    {currentDay.optionA?.name || 'Platillo A'}
                  </h4>

                  {/* Clinical Macro Breakdown Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', margin: '1rem 0', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Calorías</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>{currentDay.optionA?.calories || 480} kcal</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Proteína</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#2563EB' }}>{currentDay.optionA?.protein || '35g'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Carbos</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{currentDay.optionA?.carbs || '40g'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Grasas</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{currentDay.optionA?.fats || '14g'}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                    <strong>Perfil Clínico:</strong> Índice glucémico controlado, digestión ágil en oficina sin causar pesadez post-almuerzo.
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <strong>Alérgenos registrados:</strong> {(currentDay.optionA?.allergens || []).length > 0 ? currentDay.optionA.allergens.join(', ') : 'Ninguno (Libre de alérgenos comunes)'}
                  </div>
                </div>

                {/* OPTION B AUDIT */}
                <div className="uber-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span className="badge-tag badge-green">Opción B • {currentDay.optionB?.category || dietOptionB}</span>
                    <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: '700', background: '#F0FDF4', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                      ✓ Aprobado por Nutrición
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                    {currentDay.optionB?.name || 'Platillo B'}
                  </h4>

                  {/* Clinical Macro Breakdown Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', margin: '1rem 0', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Calorías</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>{currentDay.optionB?.calories || 430} kcal</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Proteína</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#2563EB' }}>{currentDay.optionB?.protein || '18g'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Carbos</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{currentDay.optionB?.carbs || '50g'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Grasas</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{currentDay.optionB?.fats || '16g'}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                    <strong>Perfil Clínico:</strong> Alto contenido de fibra vegetal e ingredientes antioxidantes antiinflamatorios.
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <strong>Alérgenos registrados:</strong> {(currentDay.optionB?.allergens || []).length > 0 ? currentDay.optionB.allergens.join(', ') : 'Ninguno (Libre de alérgenos comunes)'}
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
