import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, ShoppingCart, Calendar, Info, Scale, ArrowDown, Activity } from 'lucide-react';
import { menuStore, getWeekInfoFromDate } from '../services/menuStore';
import { scaleIngredients, scaleNutrition } from '../utils/recipeScaler';
import { programInfo } from '../data/mockData';

export default function StatsView({ selectedWeek }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [census, setCensus] = useState(programInfo.activeParticipantsCount || 25);

  useEffect(() => {
    // Force a re-read when selectedWeek changes
    const targetInfo = getWeekInfoFromDate(new Date(2026, 0, 1 + (selectedWeek - 1) * 7));
    const menu = menuStore.getActiveMenu(targetInfo);
    setActiveMenu(menu);
  }, [selectedWeek]);

  const days = activeMenu?.days || [];

  // Flatten logic to get global purchase summary
  const computePurchases = () => {
    const totals = {};
    let totalCalories = 0;
    let totalProtein = 0;
    
    days.forEach(day => {
      ['optionA', 'optionB'].forEach(opt => {
        const dish = day[opt];
        if (dish && dish.recipe && dish.recipe.ingredients) {
          const scaled = scaleIngredients(dish.recipe.ingredients, census);
          scaled.forEach(ing => {
            const key = `${ing.item} (${ing.unit})`;
            if (!totals[key]) totals[key] = { amount: 0, unit: ing.unit, item: ing.item };
            totals[key].amount += ing.amount;
          });
          
          if (dish.recipe.nutrition) {
            const nut = scaleNutrition(dish, census);
            totalCalories += nut.calories || 0;
            totalProtein += nut.protein || 0;
          }
        }
      });
    });

    return {
      ingredients: Object.values(totals).sort((a, b) => b.amount - a.amount),
      totalCalories,
      totalProtein
    };
  };

  const { ingredients, totalCalories, totalProtein } = computePurchases();

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '1.5rem', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={24} color="#B45309" /> Panel de Estadísticas y Compras
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', color: '#64748B', fontSize: '0.9rem' }}>
              Histórico nutricional y proyecciones de insumos para cotejo de facturas
            </p>
          </div>
          <div style={{ background: '#FEF3C7', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#B45309' }}>Censo Activo:</span>
            <input 
              type="number" 
              value={census} 
              onChange={e => setCensus(Number(e.target.value) || 1)}
              style={{ width: '70px', padding: '0.4rem', borderRadius: '8px', border: '1px solid #FDE68A', textAlign: 'center', fontWeight: 'bold' }}
              min="1"
            />
            <span style={{ fontSize: '0.85rem', color: '#B45309' }}>Raciones/Día</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Macros Totales Card */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#334155' }}>
            <Activity size={20} color="#3B82F6" /> Macros del Periodo (Semanal)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Proteína Total Estimada</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#B45309' }}>{Math.round(totalProtein).toLocaleString()} <span style={{ fontSize: '0.9rem' }}>g</span></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Calorías Servidas</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#334155' }}>{Math.round(totalCalories).toLocaleString()} <span style={{ fontSize: '0.9rem' }}>kcal</span></span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}><Info size={12} /> Cálculo proyectado para {days.length} días de servicio x {census} raciones.</p>
          </div>
        </div>

        {/* Facturación y Compras Card */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#334155' }}>
            <ShoppingCart size={20} color="#10B981" /> Lista de Insumos (Cotejo Facturas)
          </h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {ingredients.length === 0 && <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No hay menú activo para generar la lista.</div>}
            {ingredients.map((ing, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #F8FAFC' }}>
                <span style={{ color: '#475569', fontSize: '0.85rem' }}>{ing.item}</span>
                <span style={{ fontWeight: '600', color: '#1E293B', fontSize: '0.85rem' }}>{Math.ceil(ing.amount).toLocaleString()} {ing.unit}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Histórico Día por Día */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#334155' }}>
          <Calendar size={20} color="#B45309" /> Histórico Diario (Qué se preparó)
        </h3>
        {days.length === 0 ? (
           <p style={{ color: '#94A3B8' }}>No hay registros de preparación para esta semana.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {days.map((day, i) => (
              <div key={i} style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1E293B' }}>{day.dayName}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {['optionA', 'optionB'].map((opt, oIdx) => {
                    const d = day[opt];
                    if(!d) return null;
                    return (
                      <div key={oIdx} style={{ background: '#FFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{d.category}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>{d.name}</div>
                        {d.recipe && d.recipe.nutrition && (
                          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '0.5rem' }}>
                            <span><strong>Cal:</strong> {d.recipe.nutrition.calories} kcal/ración</span>
                            <span style={{ color: '#B45309' }}><strong>Prot:</strong> {d.recipe.nutrition.protein} g/ración</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
