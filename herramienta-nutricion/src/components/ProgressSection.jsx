import React, { useState } from 'react';
import { Trophy, TrendingUp, Moon, Droplets, Footprints, Lock, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const historicalData = [
  { day: 'Lun', sleep: 7.5, water: 6, steps: 8500 },
  { day: 'Mar', sleep: 6.0, water: 8, steps: 10200 },
  { day: 'Mié', sleep: 8.0, water: 9, steps: 7500 },
  { day: 'Jue', sleep: 7.0, water: 5, steps: 6000 },
  { day: 'Vie', sleep: 7.5, water: 8, steps: 9000 },
  { day: 'Sáb', sleep: 9.0, water: 10, steps: 12000 },
  { day: 'Dom', sleep: 8.5, water: 7, steps: 5000 },
];

const badges = {
  sleep: [
    { id: 's1', name: 'Búho Dormilón', days: 3, earned: true, icon: '🥉' },
    { id: 's2', name: 'Maestro del Descanso', days: 7, earned: false, progress: 5, icon: '🥈' },
    { id: 's3', name: 'Oso Hibernador', days: 21, earned: false, progress: 5, icon: '🥇' },
  ],
  water: [
    { id: 'w1', name: 'Oasis', days: 3, earned: true, icon: '🥉' },
    { id: 'w2', name: 'Manantial', days: 7, earned: true, icon: '🥈' },
    { id: 'w3', name: 'Dios de los Mares', days: 21, earned: false, progress: 14, icon: '🥇' },
  ],
  steps: [
    { id: 'st1', name: 'Caminante', days: 3, earned: true, icon: '🥉' },
    { id: 'st2', name: 'Explorador', days: 7, earned: false, progress: 6, icon: '🥈' },
    { id: 'st3', name: 'Maratonista', days: 21, earned: false, progress: 6, icon: '🥇' },
  ]
};

export default function ProgressSection() {
  const [activeTab, setActiveTab] = useState('graficas'); // 'graficas' or 'insignias'

  const renderBadgeCard = (badge, color, bgColor) => {
    return (
      <div key={badge.id} style={{ 
        background: badge.earned ? bgColor : '#F8FAFC',
        border: `1px solid ${badge.earned ? color : '#E2E8F0'}`,
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        opacity: badge.earned ? 1 : 0.7,
        transition: 'transform 0.2s',
        cursor: 'default',
        boxShadow: badge.earned ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
      }}>
        {!badge.earned && (
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#94A3B8' }}>
            <Lock size={18} />
          </div>
        )}
        
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem', filter: badge.earned ? 'none' : 'grayscale(100%)' }}>
          {badge.icon}
        </div>
        <h5 style={{ fontSize: '1.05rem', fontWeight: '800', color: badge.earned ? 'var(--text-dark)' : '#64748B', margin: '0 0 0.5rem 0' }}>
          {badge.name}
        </h5>
        
        {badge.earned ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16A34A', fontSize: '0.85rem', fontWeight: '700', marginTop: 'auto' }}>
            <CheckCircle size={16} /> ¡Desbloqueada!
          </div>
        ) : (
          <div style={{ width: '100%', marginTop: 'auto' }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.35rem', fontWeight: '600' }}>
              {badge.progress} de {badge.days} días
            </div>
            <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${(badge.progress / badge.days) * 100}%`, height: '100%', background: '#CBD5E1' }} />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{
      background: '#FFFFFF',
      borderRadius: '24px',
      border: '1px solid #E2E8F0',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden'
    }}>
      
      {/* Internal Header / Tabs */}
      <div style={{ padding: '1.5rem 2rem 0 2rem', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '2rem', background: '#F8FAFC' }}>
        <button 
          onClick={() => setActiveTab('graficas')}
          style={{
            background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
            fontSize: '1.05rem', fontWeight: '700',
            color: activeTab === 'graficas' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'graficas' ? '3px solid var(--primary)' : '3px solid transparent',
            display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
            marginBottom: '-1px'
          }}
        >
          <TrendingUp size={20} /> Historial (7 días)
        </button>
        <button 
          onClick={() => setActiveTab('insignias')}
          style={{
            background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
            fontSize: '1.05rem', fontWeight: '700',
            color: activeTab === 'insignias' ? '#EAB308' : 'var(--text-muted)',
            borderBottom: activeTab === 'insignias' ? '3px solid #EAB308' : '3px solid transparent',
            display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
            marginBottom: '-1px'
          }}
        >
          <Trophy size={20} /> Vitrina de Insignias
        </button>
      </div>

      {/* Content area */}
      <div style={{ padding: '2.5rem', flex: 1 }}>
        
        {activeTab === 'graficas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* Sueño Chart */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#4F46E5', fontSize: '1.2rem', margin: 0 }}>
                  <div style={{ background: '#EEF2FF', padding: '0.5rem', borderRadius: '10px' }}>
                    <Moon size={20} />
                  </div>
                  Historial de Sueño (Horas)
                </h4>
                <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: '600' }}>Meta: 7-8 hrs</div>
              </div>
              
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }} dy={10} />
                    <YAxis domain={[0, 12]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
                    <Line type="monotone" dataKey="sleep" name="Horas de Sueño" stroke="#4F46E5" strokeWidth={4} dot={{ r: 6, fill: '#4F46E5', strokeWidth: 3, stroke: '#FFFFFF' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Agua Chart */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0EA5E9', fontSize: '1.2rem', margin: 0 }}>
                  <div style={{ background: '#F0F9FF', padding: '0.5rem', borderRadius: '10px' }}>
                    <Droplets size={20} />
                  </div>
                  Historial de Hidratación (Vasos)
                </h4>
                <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: '600' }}>Meta: 8+ vasos</div>
              </div>
              
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData} barSize={40} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13 }} />
                    <Tooltip cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
                    <Bar dataKey="water" name="Vasos de Agua" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'insignias' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            <section>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#4F46E5', fontSize: '1.3rem', margin: '0 0 1.5rem 0' }}>
                <Moon size={22} /> Reto de Sueño
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {badges.sleep.map(b => renderBadgeCard(b, '#C7D2FE', '#EEF2FF'))}
              </div>
            </section>

            <section>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0EA5E9', fontSize: '1.3rem', margin: '0 0 1.5rem 0' }}>
                <Droplets size={22} /> Reto Hidratón
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {badges.water.map(b => renderBadgeCard(b, '#BAE6FD', '#F0F9FF'))}
              </div>
            </section>

            <section>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#D946EF', fontSize: '1.3rem', margin: '0 0 1.5rem 0' }}>
                <Footprints size={22} /> Reto Caminar
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {badges.steps.map(b => renderBadgeCard(b, '#F5D0FE', '#FDF4FF'))}
              </div>
            </section>

          </div>
        )}

      </div>
    </div>
  );
}
