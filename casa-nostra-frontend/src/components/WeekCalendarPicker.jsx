import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { MONTH_NAMES, getWeekInfoFromDate } from '../services/menuStore';

export default function WeekCalendarPicker({
  selectedWeekInfo,
  onChangeWeek,
  label = "Semana del Servicio:"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize current week
  const currentWeek = selectedWeekInfo || getWeekInfoFromDate(1);
  const currentMonday = currentWeek.monday || new Date(2026, 7, 10, 12, 0, 0);

  // Viewed month/year inside calendar popover
  const [viewDate, setViewDate] = useState(() => new Date(currentMonday));
  const [hoveredWeekKey, setHoveredWeekKey] = useState(null);

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Sync viewed date whenever popover opens or current week changes
  useEffect(() => {
    if (isOpen) {
      setViewDate(new Date(currentMonday));
    }
  }, [isOpen, currentWeek.weekKey]);

  // Navigate week by week
  const handlePrevWeek = () => {
    const prevMon = new Date(currentMonday.getTime() - 7 * 86400000);
    onChangeWeek(getWeekInfoFromDate(prevMon));
  };

  const handleNextWeek = () => {
    const nextMon = new Date(currentMonday.getTime() + 7 * 86400000);
    onChangeWeek(getWeekInfoFromDate(nextMon));
  };

  // Month navigation inside popover
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1, 12, 0, 0));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1, 12, 0, 0));
  };

  // Build days matrix for the viewed month
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1, 12, 0, 0);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0, 12, 0, 0).getDate();

  // Day of week for 1st of month (0 = Sun, 1 = Mon ... 6 = Sat)
  // Shift so 0 = Monday, 6 = Sunday
  const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

  const calendarDays = [];
  // Empty slots for previous month
  for (let i = 0; i < startDayIndex; i++) {
    calendarDays.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(viewYear, viewMonth, d, 12, 0, 0));
  }

  const handleDaySelect = (dayDate) => {
    if (!dayDate) return;
    const newWeek = getWeekInfoFromDate(dayDate);
    onChangeWeek(newWeek);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      
      {/* Main Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#FFFFFF',
        padding: '0.85rem 1.25rem',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        
        {/* Left: Week Info Label */}
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {label}
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: '800',
            color: 'var(--text-dark)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '0.15rem'
          }}>
            <span>{currentWeek.title}</span>
          </div>
        </div>

        {/* Right: Controls (< Week, > Week, Calendar Picker Button) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          
          {/* Week Arrows */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#F1F5F9',
            padding: '0.2rem',
            borderRadius: '10px'
          }}>
            <button
              onClick={handlePrevWeek}
              title="Semana anterior"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#475569',
                padding: '0.45rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              onClick={handleNextWeek}
              title="Semana siguiente"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#475569',
                padding: '0.45rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <ChevronRight size={17} />
            </button>
          </div>

          {/* Calendar Trigger Button */}
          <button
            onClick={() => setIsOpen(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: isOpen ? '#2563EB' : '#FFFFFF',
              color: isOpen ? '#FFFFFF' : '#1E293B',
              border: '1.5px solid #CBD5E1',
              padding: '0.5rem 0.95rem',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isOpen ? '0 4px 12px rgba(37, 99, 235, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <CalendarIcon size={16} color={isOpen ? '#FFFFFF' : '#2563EB'} />
            <span>Selector por Calendario</span>
          </button>

        </div>

      </div>

      {/* Floating Popover Calendar */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% - 0.5rem)',
          right: 0,
          zIndex: 50,
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.05)',
          padding: '1.25rem',
          width: '340px',
          maxWidth: '92vw',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          
          {/* Calendar Header: Month + Year + Month Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #F1F5F9'
          }}>
            <button
              onClick={handlePrevMonth}
              style={{
                border: 'none',
                background: '#F1F5F9',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-dark)' }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>

            <button
              onClick={handleNextMonth}
              style={{
                border: 'none',
                background: '#F1F5F9',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day of Week Headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            gap: '2px',
            marginBottom: '0.5rem',
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--text-muted)'
          }}>
            <span>Lu</span>
            <span>Ma</span>
            <span>Mi</span>
            <span>Ju</span>
            <span>Vi</span>
            <span style={{ color: '#CBD5E1' }}>Sá</span>
            <span style={{ color: '#CBD5E1' }}>Do</span>
          </div>

          {/* Days Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '3px'
          }}>
            {calendarDays.map((dayDate, idx) => {
              if (!dayDate) {
                return <div key={`empty-${idx}`} style={{ height: '36px' }} />;
              }

              const dayWeekInfo = getWeekInfoFromDate(dayDate);
              const isSelectedWeek = dayWeekInfo.weekKey === currentWeek.weekKey;
              const isHoveredWeek = hoveredWeekKey && dayWeekInfo.weekKey === hoveredWeekKey;
              const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

              return (
                <button
                  key={dayDate.toISOString()}
                  onClick={() => handleDaySelect(dayDate)}
                  onMouseEnter={() => setHoveredWeekKey(dayWeekInfo.weekKey)}
                  onMouseLeave={() => setHoveredWeekKey(null)}
                  title={`Seleccionar semana del ${dayWeekInfo.dateRange}`}
                  style={{
                    height: '36px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSelectedWeek
                      ? '#2563EB'
                      : isHoveredWeek
                      ? '#EFF6FF'
                      : 'transparent',
                    color: isSelectedWeek
                      ? '#FFFFFF'
                      : isWeekend
                      ? '#94A3B8'
                      : 'var(--text-dark)',
                    fontWeight: isSelectedWeek ? '800' : '600',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {dayDate.getDate()}
                </button>
              );
            })}
          </div>

          {/* Calendar Footer Help Text */}
          <div style={{
            marginTop: '0.85rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #F1F5F9',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            💡 Haz clic en cualquier día para seleccionar su semana completa.
          </div>

        </div>
      )}

    </div>
  );
}
