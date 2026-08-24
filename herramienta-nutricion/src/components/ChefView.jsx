import React, { useState } from 'react';
import { ChefHat, ArrowLeft, ArrowRight, CheckCircle2, Clock, MapPin, Scale } from 'lucide-react';
import { cyclicMenus, chefInfo, programInfo } from '../data/mockData';

export default function ChefView({ selectedWeek }) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const weekData = cyclicMenus.find(w => w.weekNumber === selectedWeek) || cyclicMenus[0];
  const currentDay = weekData.days[currentDayIndex];
  
  // Totals
  const totalPortions = programInfo.activeParticipantsCount;
  const countA = Math.round(totalPortions * 0.65);
  const countB = totalPortions - countA;

  const handleNextDay = () => {
    if (currentDayIndex < weekData.days.length - 1) setCurrentDayIndex(currentDayIndex + 1);
  };

  const handlePrevDay = () => {
    if (currentDayIndex > 0) setCurrentDayIndex(currentDayIndex - 1);
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
          {currentDay.dayName}, {currentDay.dateLabel.split(',')[0]}
        </h2>

        {/* Row 2: Navigation Arrows */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <button 
            onClick={handlePrevDay} 
            disabled={currentDayIndex === 0}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: currentDayIndex === 0 ? '#F8FAFC' : '#F1F5F9',
              color: currentDayIndex === 0 ? '#CBD5E1' : '#334155',
              border: 'none', padding: '0.5rem 1rem', borderRadius: '10px',
              fontWeight: '700', fontSize: '0.85rem', cursor: currentDayIndex === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} /> Anterior
          </button>

          <button 
            onClick={handleNextDay} 
            disabled={currentDayIndex === weekData.days.length - 1}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: currentDayIndex === weekData.days.length - 1 ? '#F8FAFC' : '#F1F5F9',
              color: currentDayIndex === weekData.days.length - 1 ? '#CBD5E1' : '#334155',
              border: 'none', padding: '0.5rem 1rem', borderRadius: '10px',
              fontWeight: '700', fontSize: '0.85rem', cursor: currentDayIndex === weekData.days.length - 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Siguiente <ArrowRight size={16} />
          </button>
        </div>
        
        {/* Row 3: Production Note */}
        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.25rem' }}>
          Producción • Semana {selectedWeek}
        </div>
      </div>

      {/* Recipes Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* OPTION A */}
        <div style={{ background: '#FFFFFF', border: '2px solid #BFDBFE', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)' }}>
          <div style={{ background: '#EFF6FF', padding: '1.25rem 1.5rem', borderBottom: '1px solid #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge-tag" style={{ background: '#DBEAFE', color: '#1E40AF', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                Opción A • {currentDay.optionA.category}
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1E3A8A', margin: 0 }}>
                {currentDay.optionA.name}
              </h3>
            </div>
            <div style={{ background: '#2563EB', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.9 }}>PREPARAR</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{countA} Porciones</div>
            </div>
          </div>
          
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563EB', marginBottom: '0.3rem', fontWeight: '700' }}>
                <Scale size={18} /> Ingredientes Base (Por porción)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#92400E', background: '#FEF3C7', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #FDE68A' }}>
                <strong>⚠️ IMPORTANTE:</strong> Multiplicar ingredientes x {countA} para la producción total.
              </div>
              {renderRecipeSection('Lista de Compras & gramaje:', currentDay.optionA.recipe?.ingredients, '#F8FAFC')}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563EB', marginBottom: '0.5rem', fontWeight: '700' }}>
                <ChefHat size={18} /> Método de Preparación
              </div>
              {renderRecipeSection('Paso a paso aprobado por Clínica:', currentDay.optionA.recipe?.method, '#F8FAFC')}
            </div>
          </div>
        </div>

        {/* OPTION B */}
        <div style={{ background: '#FFFFFF', border: '2px solid #BBF7D0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)' }}>
          <div style={{ background: '#F0FDF4', padding: '1.25rem 1.5rem', borderBottom: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge-tag" style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                Opción B • {currentDay.optionB.category}
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#14532D', margin: 0 }}>
                {currentDay.optionB.name}
              </h3>
            </div>
            <div style={{ background: '#16A34A', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.9 }}>PREPARAR</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{countB} Porciones</div>
            </div>
          </div>
          
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16A34A', marginBottom: '0.3rem', fontWeight: '700' }}>
                <Scale size={18} /> Ingredientes Base (Por porción)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#92400E', background: '#FEF3C7', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #FDE68A' }}>
                <strong>⚠️ IMPORTANTE:</strong> Multiplicar ingredientes x {countB} para la producción total.
              </div>
              {renderRecipeSection('Lista de Compras & gramaje:', currentDay.optionB.recipe?.ingredients, '#F8FAFC')}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16A34A', marginBottom: '0.5rem', fontWeight: '700' }}>
                <ChefHat size={18} /> Método de Preparación
              </div>
              {renderRecipeSection('Paso a paso aprobado por Clínica:', currentDay.optionB.recipe?.method, '#F8FAFC')}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
