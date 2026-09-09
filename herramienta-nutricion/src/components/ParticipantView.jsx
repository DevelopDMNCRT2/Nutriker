import React, { useState, useEffect } from 'react';
import { Check, Plus, Sparkles, ChevronDown, ChevronUp, MessageCircle, Clock, Info, ArrowRightLeft, Building2, ShieldCheck, Moon, Droplets, Footprints, UploadCloud, Trophy, TrendingUp, Utensils, CheckCircle2 } from 'lucide-react';
import { cyclicMenus, chefInfo, programInfo } from '../data/mockData';
import { menuStore } from '../services/menuStore';
import ProgressSection from './ProgressSection';

export default function ParticipantView({ selectedWeek = 1, onOpenNotification, currentUser, onOpenLogin }) {
  const currentWeek = selectedWeek || 1;
  const [activeMenu, setActiveMenu] = useState(() => menuStore.getActiveMenu(currentWeek));
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [expandedDishId, setExpandedDishId] = useState(null);
  const [isOrderSaved, setIsOrderSaved] = useState(false);

  useEffect(() => {
    setActiveMenu(menuStore.getActiveMenu(currentWeek));
  }, [currentWeek]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (!e.detail || e.detail.week === currentWeek) {
        setActiveMenu(menuStore.getActiveMenu(currentWeek));
      }
    };
    window.addEventListener('royal_canin_menu_updated', handleUpdate);
    return () => window.removeEventListener('royal_canin_menu_updated', handleUpdate);
  }, [currentWeek]);

  const weekData = activeMenu;
  const daysList = weekData.days || [];
  const safeDayIndex = selectedDayIndex < daysList.length ? selectedDayIndex : 0;
  const currentDayData = daysList[safeDayIndex] || daysList[0] || {};

  // Selecciones del empleado para cada día (Opción A o B)
  const [selections, setSelections] = useState({
    0: { platoFuerte: 'A' },
    1: { platoFuerte: 'A' },
    2: { platoFuerte: 'B' },
    3: { platoFuerte: 'A' },
    4: { platoFuerte: 'B' }
  });

  const [activeMainTab, setActiveMainTab] = useState('menu'); // 'menu' | 'progreso'

  // Health Habits tracking
  const [habits, setHabits] = useState({
    0: { sleepHours: '', waterGlasses: 0, stepsEvidence: false },
    1: { sleepHours: '', waterGlasses: 0, stepsEvidence: false },
    2: { sleepHours: '', waterGlasses: 0, stepsEvidence: false },
    3: { sleepHours: '', waterGlasses: 0, stepsEvidence: false },
    4: { sleepHours: '', waterGlasses: 0, stepsEvidence: false }
  });

  const updateHabit = (dayIdx, habitKey, value) => {
    setHabits(prev => ({
      ...prev,
      [dayIdx]: {
        ...prev[dayIdx],
        [habitKey]: value
      }
    }));
  };
  
  const simulateUpload = (dayIdx) => {
    updateHabit(dayIdx, 'stepsEvidence', 'loading');
    setTimeout(() => {
      updateHabit(dayIdx, 'stepsEvidence', true);
    }, 1500);
  };

  const handleSelect = (optionKey) => {
    setIsOrderSaved(false);
    setSelections(prev => ({
      ...prev,
      [safeDayIndex]: { platoFuerte: optionKey }
    }));
  };

  const handleConfirmOrder = () => {
    const employeeKey = (currentUser && (currentUser.email || currentUser.id || currentUser.name)) || 'empleado-royal-1';
    menuStore.saveEmployeeOrder(employeeKey, {
      employeeName: currentUser?.name || 'Empleado Royal Canin',
      selections,
      confirmedAt: new Date().toISOString()
    }, currentWeek);
    setIsOrderSaved(true);
    if (onOpenNotification) {
      onOpenNotification(currentDayData, selections[safeDayIndex] || { platoFuerte: 'A' }, activeMenu, selections);
    }
  };

  const toggleExpand = (dishId) => {
    setExpandedDishId(prev => prev === dishId ? null : dishId);
  };

  const renderListRow = (dish, optionKey) => {
    if (!dish) return null;
    const isSelected = selections[safeDayIndex]?.platoFuerte === optionKey;
    const isExpanded = expandedDishId === (dish.id || optionKey);
    const dishDescription = dish.description || dish.recipe?.ingredients || 'Platillo balanceado certificado por nutrición clínica.';

    return (
      <div 
        onClick={() => handleSelect(optionKey)}
        style={{ 
          display: 'flex', 
          padding: '1.25rem', 
          borderBottom: '1px solid #E2E8F0', 
          alignItems: 'flex-start',
          gap: '1rem',
          cursor: 'pointer',
          background: isSelected ? '#F0FDF4' : '#FFFFFF',
          transition: 'background 0.2s',
          borderLeft: isSelected ? '4px solid #22C55E' : '4px solid transparent',
        }}
        key={dish.id || optionKey}
      >
        {/* Text Details */}
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 0.35rem 0' }}>
            {dish.name}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0', lineHeight: '1.45' }}>
            {dishDescription}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            {dish.calories && <span style={{ fontSize: '0.75rem', background: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: '6px', color: '#334155', fontWeight: '600' }}>{dish.calories} kcal</span>}
            {dish.protein && <span style={{ fontSize: '0.75rem', background: '#F0FDF4', padding: '0.15rem 0.5rem', borderRadius: '6px', color: '#166534', fontWeight: '600' }}>{dish.protein} prot</span>}
            {dish.carbs && <span style={{ fontSize: '0.75rem', background: '#F8FAFC', padding: '0.15rem 0.5rem', borderRadius: '6px', color: '#475569', fontWeight: '600' }}>{dish.carbs} carb</span>}
            {dish.fats && <span style={{ fontSize: '0.75rem', background: '#F8FAFC', padding: '0.15rem 0.5rem', borderRadius: '6px', color: '#475569', fontWeight: '600' }}>{dish.fats} grasas</span>}
            
            {dish.allergens && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand(dish.id || optionKey); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: 0, textDecoration: 'underline' }}
              >
                <Info size={13} /> {isExpanded ? 'Ocultar alérgenos' : 'Ver alérgenos'}
              </button>
            )}
          </div>

          {isExpanded && dish.allergens && (
            <div style={{ background: '#FEF2F2', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', marginTop: '0.75rem', border: '1px solid #FCA5A5', color: '#991B1B' }}>
              <strong>Alérgenos registrados:</strong> {dish.allergens.length > 0 ? dish.allergens.join(', ') : 'Ninguno (Libre de alérgenos comunes)'}
            </div>
          )}
        </div>

        {/* Thumbnail */}
        {dish.image && (
          <div style={{ width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <img src={dish.image} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Radio Button */}
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%', 
          border: `2px solid ${isSelected ? '#22C55E' : '#CBD5E1'}`, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, margin: 'auto 0'
        }}>
          {isSelected && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22C55E' }} />}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '10rem' }}>
      
      {/* Client Corporate Header */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-dark)' }}>
            Bienvenido(a), {currentUser.name}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Selecciona tus platillos para las entregas de la <strong>Semana {currentWeek}</strong> en la oficina.
          </p>
        </div>

        {/* Schedule note */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
          <div style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)', padding: '0.65rem 1.15rem', borderRadius: '12px', color: 'var(--green-dark)', fontSize: '0.8rem', fontWeight: '600' }}>
            📍 Entregas en oficina: <strong>{daysList.map(d => d.dayName).join(', ')}</strong>
          </div>
          {isOrderSaved && (
            <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', padding: '0.35rem 0.75rem', borderRadius: '8px', color: '#166534', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={14} /> ¡Elecciones de la Semana {currentWeek} confirmadas!
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveMainTab('menu')}
          style={{
            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
            fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: activeMainTab === 'menu' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeMainTab === 'menu' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-0.6rem', transition: 'all 0.2s'
          }}
        >
          <Utensils size={18} /> Mi Menú Semanal
        </button>
        <button
          onClick={() => setActiveMainTab('progreso')}
          style={{
            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
            fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: activeMainTab === 'progreso' ? '#EAB308' : 'var(--text-muted)',
            borderBottom: activeMainTab === 'progreso' ? '3px solid #EAB308' : '3px solid transparent',
            marginBottom: '-0.6rem', transition: 'all 0.2s'
          }}
        >
          <TrendingUp size={18} /> Mi Progreso y Salud
        </button>
      </div>

      {activeMainTab === 'progreso' ? (
        <ProgressSection />
      ) : (
        <>
          {/* Day Selector Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowRightLeft size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)' }}>
            Opciones para el {currentDayData.dayName} ({currentDayData.dateLabel.split(',')[0]})
          </h3>
        </div>

        {/* Segmented Day Control */}
        <div style={{ display: 'flex', gap: '0.35rem', background: '#FFFFFF', padding: '0.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          {weekData.days.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={day.dayName}
                onClick={() => setSelectedDayIndex(idx)}
                style={{
                  border: 'none',
                  background: isSelected ? 'var(--primary)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--text-dark)',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  fontWeight: isSelected ? '700' : '600',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{day.dayName}</span>
                <span style={{ fontSize: '0.7rem', opacity: isSelected ? 1 : 0.6 }}>✓</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Builder Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* PLATO PRINCIPAL CERTIFICADO POR LA NUTRIÓLOGA */}
        <section style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 0.25rem 0' }}>
                Elige tu Platillo para el {currentDayData.dayName}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Certificado por Nutrición Clínica Royal Canin • Selecciona 1 opción para el Chef
              </p>
            </div>
            <span className="badge-tag badge-green">2 Opciones Aprobadas</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {renderListRow(currentDayData.optionA, 'A')}
            {renderListRow(currentDayData.optionB, 'B')}
          </div>
        </section>

        {/* 3. AGUA */}
        <section style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 0.25rem 0' }}>Bebida</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Incluida por defecto</p>
          </div>
          <div style={{ display: 'flex', padding: '1.25rem', alignItems: 'flex-start', gap: '1rem', background: '#F8FAFC', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Agua Fresca del Día
                <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: '800' }}>Incluida</span>
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0', lineHeight: '1.45' }}>
                Refrescante agua de sabor natural sin azúcar añadida, incluida en todos los menús.
              </p>
            </div>
            <div style={{ width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>💧</span>
            </div>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%', 
              border: `2px solid var(--primary)`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: '2.2rem'
            }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }} />
            </div>
          </div>
        </section>

      </div>

      {/* 🌟 RETOS DE SALUD (HÁBITOS) 🌟 */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} color="#EAB308" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>
              Retos de Salud del Día
            </h3>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          
          {/* SUEÑO */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Moon size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-dark)', margin: 0 }}>Registro de Sueño</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Meta: 7-8 horas</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input 
                type="number" 
                placeholder="Ej. 7.5"
                step="0.5"
                min="0"
                max="24"
                value={habits[selectedDayIndex].sleepHours}
                onChange={(e) => updateHabit(selectedDayIndex, 'sleepHours', e.target.value)}
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', width: '100%' }}
                onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
              />
              <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>hrs</span>
            </div>
          </div>

          {/* HIDRATACIÓN */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0F9FF', color: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Droplets size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-dark)', margin: 0 }}>Hidratón</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Registra vasos de agua (250ml)</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '0.5rem', borderRadius: '12px' }}>
              <button 
                onClick={() => updateHabit(selectedDayIndex, 'waterGlasses', Math.max(0, habits[selectedDayIndex].waterGlasses - 1))}
                style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#FFFFFF', color: '#64748B', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              >
                -
              </button>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0EA5E9' }}>{habits[selectedDayIndex].waterGlasses}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>vasos</span>
              </div>
              <button 
                onClick={() => updateHabit(selectedDayIndex, 'waterGlasses', habits[selectedDayIndex].waterGlasses + 1)}
                style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#0EA5E9', color: '#FFFFFF', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 1px 3px rgba(14,165,233,0.3)' }}
              >
                +
              </button>
            </div>
          </div>

          {/* CAMINAR */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FDF4FF', color: '#D946EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Footprints size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-dark)', margin: 0 }}>Caminar</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Evidencia de tu app</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              {habits[selectedDayIndex].stepsEvidence === true ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16A34A', fontWeight: '600', padding: '0.75rem 1rem', background: '#F0FDF4', borderRadius: '10px', width: '100%', justifyContent: 'center', border: '1px solid #BBF7D0' }}>
                  <Check size={18} /> Evidencia Subida
                </div>
              ) : habits[selectedDayIndex].stepsEvidence === 'loading' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontWeight: '600', padding: '0.75rem 1rem', background: '#F1F5F9', borderRadius: '10px', width: '100%', justifyContent: 'center', border: '1px solid #E2E8F0' }}>
                  <UploadCloud size={18} className="animate-pulse" /> Subiendo...
                </div>
              ) : (
                <button
                  onClick={() => simulateUpload(selectedDayIndex)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D946EF', fontWeight: '600', padding: '0.75rem 1rem', background: '#FDF4FF', borderRadius: '10px', width: '100%', justifyContent: 'center', border: '1px dashed #F5D0FE', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAE8FF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FDF4FF'; }}
                >
                  <UploadCloud size={18} /> Subir Captura
                </button>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* Sleek Full-Width Bottom Bar */}
      <div className="sleek-bottom-bar">
        <div className="sleek-bottom-bar-content">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '0.35rem 0.75rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem' }}>
              Retodali
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'white' }}>
                Tu Selección de la Semana {currentWeek}:
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                {daysList.map((d, idx) => {
                  const choice = selections[idx]?.platoFuerte || 'A';
                  const dish = (choice === 'B' ? d.optionB : d.optionA) || d.optionA || {};
                  return (
                    <span key={d.dayName}>
                      {idx > 0 ? ' • ' : ''}
                      {d.dayName.slice(0, 2)}: <strong style={{ color: '#E2E8F0' }}>{dish.name || 'Platillo'}</strong>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => onOpenNotification(currentDayData, selections[safeDayIndex] || { platoFuerte: 'A' }, activeMenu, selections)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.6rem 1.1rem',
                borderRadius: '9999px',
                fontWeight: '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <MessageCircle size={15} /> Simular WhatsApp
            </button>

            <button
              onClick={handleConfirmOrder}
              className="btn-uber-primary"
            >
              <Sparkles size={16} /> Confirmar Selección
            </button>
          </div>

        </div>
      </div>
      
        </>
      )}

    </div>
  );
}
