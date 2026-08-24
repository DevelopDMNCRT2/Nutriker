import React, { useState } from 'react';
import { Check, Plus, Sparkles, ChevronDown, ChevronUp, MessageCircle, Clock, Info, ArrowRightLeft, Building2, ShieldCheck, Moon, Droplets, Footprints, UploadCloud, Trophy, TrendingUp, Utensils } from 'lucide-react';
import { cyclicMenus, chefInfo, programInfo } from '../data/mockData';
import ProgressSection from './ProgressSection';

export default function ParticipantView({ selectedWeek, onOpenNotification, currentUser, onOpenLogin }) {
  const weekData = cyclicMenus.find(w => w.weekNumber === selectedWeek) || cyclicMenus[0];
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0: Lunes, 1: Miércoles, 2: Viernes
  const [expandedDishId, setExpandedDishId] = useState(null);

  // User selections for Lunes (0), Miércoles (1), Viernes (2)
  const [selections, setSelections] = useState({
    0: { sopa: 'A', platoFuerte: 'A' },
    1: { sopa: 'A', platoFuerte: 'A' },
    2: { sopa: 'A', platoFuerte: 'B' }
  });

  const [activeMainTab, setActiveMainTab] = useState('menu'); // 'menu' | 'progreso'

  // Health Habits tracking
  const [habits, setHabits] = useState({
    0: { sleepHours: '', waterGlasses: 0, stepsEvidence: false },
    1: { sleepHours: '', waterGlasses: 0, stepsEvidence: false },
    2: { sleepHours: '', waterGlasses: 0, stepsEvidence: false }
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

  const currentDayData = weekData.days[selectedDayIndex];

  const handleSelect = (type, optionKey) => {
    setSelections(prev => ({
      ...prev,
      [selectedDayIndex]: { ...prev[selectedDayIndex], [type]: optionKey }
    }));
  };

  const toggleExpand = (dishId) => {
    setExpandedDishId(prev => prev === dishId ? null : dishId);
  };

  const sopasData = {
    A: {
      id: 'sopa-a',
      name: 'Sopa Azteca Ligera',
      description: 'Caldo de tomate con tiritas de maíz horneadas, aguacate y queso panela.',
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
    },
    B: {
      id: 'sopa-b',
      name: 'Crema de Calabaza Asada',
      description: 'Suave crema de vegetales asados con un toque de semillas tostadas.',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
    }
  };

  const basicPlatos = {
    Pollo: {
      id: 'plato-pollo',
      name: 'Pechuga de Pollo Asada',
      description: 'Pechuga de pollo a la plancha con verduras de temporada y porción de arroz.',
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
      calories: 380,
      protein: '36g',
      carbs: '30g',
      fats: '12g',
      tags: ['Clásico', 'Ligero'],
      allergens: []
    },
    Bistec: {
      id: 'plato-bistec',
      name: 'Bistec a la Plancha',
      description: 'Filete magro de res a la plancha con verduras de temporada y porción de arroz.',
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
      calories: 450,
      protein: '38g',
      carbs: '30g',
      fats: '18g',
      tags: ['Clásico', 'Proteico'],
      allergens: []
    }
  };

  const renderListRow = (dish, type, optionKey, optionLabel) => {
    const isSelected = selections[selectedDayIndex][type] === optionKey;
    const isExpanded = expandedDishId === dish.id;

    return (
      <div 
        onClick={() => handleSelect(type, optionKey)}
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
        key={dish.id}
      >
        {/* Text Details */}
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {dish.name}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0', lineHeight: '1.45' }}>
            {dish.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            {dish.calories && <span style={{ fontSize: '0.75rem', background: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: '6px', color: '#334155', fontWeight: '600' }}>{dish.calories} kcal</span>}
            {dish.protein && <span style={{ fontSize: '0.75rem', background: '#F0FDF4', padding: '0.15rem 0.5rem', borderRadius: '6px', color: '#166534', fontWeight: '600' }}>{dish.protein} prot</span>}
            
            {dish.allergens && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand(dish.id); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: 0, textDecoration: 'underline' }}
              >
                <Info size={13} /> {isExpanded ? 'Ocultar alérgenos' : 'Ver alérgenos'}
              </button>
            )}
          </div>

          {isExpanded && dish.allergens && (
            <div style={{ background: '#FEF2F2', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', marginTop: '0.75rem', border: '1px solid #FCA5A5', color: '#991B1B' }}>
              <strong>Grasas Totales:</strong> {dish.fats} • 
              <strong> Alérgenos:</strong> {dish.allergens.length > 0 ? dish.allergens.join(', ') : 'Ninguno'}
            </div>
          )}
        </div>

        {/* Thumbnail */}
        <div style={{ width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <img src={dish.image} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

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
            Selecciona tus platillos para las entregas de la <strong>Semana {selectedWeek}</strong> en la oficina.
          </p>
        </div>

        {/* Schedule note */}
        <div style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)', padding: '0.75rem 1.25rem', borderRadius: '12px', color: 'var(--green-dark)', fontSize: '0.8rem', fontWeight: '600' }}>
          📍 Entregas directas en oficina los Lunes, Miércoles y Viernes
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
        
        {/* 1. SOPA */}
        <section style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 0.25rem 0' }}>Elige tu Sopa</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Selecciona una opción • Obligatorio</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {renderListRow(sopasData.A, 'sopa', 'A', 'Sopa A')}
            {renderListRow(sopasData.B, 'sopa', 'B', 'Sopa B')}
          </div>
        </section>

        {/* 2. PLATO FUERTE */}
        <section style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 0.25rem 0' }}>Elige tu Plato Fuerte</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Selecciona una opción • Obligatorio</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {renderListRow(currentDayData.optionA, 'platoFuerte', 'A', 'Plato Fuerte A')}
            {renderListRow(currentDayData.optionB, 'platoFuerte', 'B', 'Plato Fuerte B')}
            {renderListRow(basicPlatos.Pollo, 'platoFuerte', 'Pollo', 'Pechuga Asada')}
            {renderListRow(basicPlatos.Bistec, 'platoFuerte', 'Bistec', 'Bistec a la Plancha')}
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
                Tu Selección de la Semana {selectedWeek}:
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Lu: <strong>Sopa {selections[0].sopa}, Plato {selections[0].platoFuerte}</strong> • Mi: <strong>Sopa {selections[1].sopa}, Plato {selections[1].platoFuerte}</strong> • Vi: <strong>Sopa {selections[2].sopa}, Plato {selections[2].platoFuerte}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => onOpenNotification(currentDayData, selections[selectedDayIndex])}
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
              onClick={() => onOpenNotification(currentDayData, selections[selectedDayIndex])}
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
