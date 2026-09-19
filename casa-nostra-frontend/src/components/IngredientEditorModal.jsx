import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Plus, Trash2, RotateCcw, Scale, ChefHat, Sparkles, AlertCircle } from 'lucide-react';

export default function IngredientEditorModal({
  isOpen,
  onClose,
  dish,
  dayName,
  optionKey,
  role = 'chef',
  onSave,
  onReset
}) {
  const [ingredientsList, setIngredientsList] = useState([]);
  const [activeMode, setActiveMode] = useState('list'); // 'list' | 'text'
  const [rawText, setRawText] = useState('');

  // Sincronizar ingredientes al abrir el modal
  useEffect(() => {
    if (dish && isOpen) {
      const raw = dish.recipe?.ingredients || '';
      setRawText(raw);

      // Separar por comas o saltos de línea
      const parsed = raw
        .split(/[\n,]+/)
        .map(i => i.trim())
        .filter(Boolean);

      setIngredientsList(parsed.length > 0 ? parsed : ['']);
    }
  }, [dish, isOpen]);

  // Bloquear scroll de la página de fondo mientras el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !dish) return null;

  const handleIngredientChange = (index, value) => {
    const updated = [...ingredientsList];
    updated[index] = value;
    setIngredientsList(updated);
  };

  const handleAddIngredient = () => {
    setIngredientsList([...ingredientsList, '']);
  };

  const handleRemoveIngredient = (index) => {
    const updated = ingredientsList.filter((_, i) => i !== index);
    setIngredientsList(updated.length > 0 ? updated : ['']);
  };

  const handleSave = () => {
    let finalString = '';
    if (activeMode === 'list') {
      finalString = ingredientsList
        .map(i => i.trim())
        .filter(Boolean)
        .join(', ');
    } else {
      finalString = rawText
        .split('\n')
        .map(i => i.trim())
        .filter(Boolean)
        .join(', ');
    }

    if (onSave) {
      onSave(finalString);
    }
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('¿Deseas restablecer esta receta a sus ingredientes sugeridos originales?')) {
      if (onReset) {
        onReset();
      }
      onClose();
    }
  };

  const brandColor = optionKey === 'B' || optionKey === 'optionB' ? '#16A34A' : '#2563EB';
  const brandBg = optionKey === 'B' || optionKey === 'optionB' ? '#F0FDF4' : '#EFF6FF';
  const brandBorder = optionKey === 'B' || optionKey === 'optionB' ? '#BBF7D0' : '#BFDBFE';
  const roleTitle = role === 'nutriologa' ? 'Nutrición Clínica' : 'Estación del Chef';

  const modalContent = (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #E2E8F0'
      }}>
        
        {/* Encabezado del Modal */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Scale size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'white' }}>
                Ajuste Manual de Insumos & Receta
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
              {dayName} • {roleTitle} • Royal Canin B2B
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info del Platillo */}
        <div style={{ padding: '1rem 1.5rem', background: brandBg, borderBottom: `1px solid ${brandBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: brandColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Opción {optionKey === 'B' || optionKey === 'optionB' ? 'B' : 'A'} • {dish.category || 'Categoría Nutricional'}
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginTop: '0.1rem' }}>
              {dish.name}
            </div>
          </div>

          {dish.isManuallyAdjusted && (
            <span style={{ fontSize: '0.72rem', fontWeight: '700', background: '#FEF3C7', color: '#92400E', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={12} /> Ajuste manual activo
            </span>
          )}
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Mensaje de Ayuda */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            fontSize: '0.8rem',
            color: '#475569',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            marginBottom: '1rem',
            lineHeight: '1.4'
          }}>
            <AlertCircle size={16} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Instrucción de ajuste:</strong> Puedes modificar las cantidades numéricas o sustituir insumos directamente (por ejemplo: cambiar <em>60g Edamames pelados</em> por <em>60g Garbanzos cocidos</em>). Los cambios se reflejarán de inmediato en las fichas técnicas y órdenes de producción.
            </div>
          </div>

          {/* Toggle de Modo: Lista de Insumos vs Texto Libre */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-dark)' }}>
              Lista de Insumos Base (Por porción):
            </label>
            <div style={{ display: 'flex', gap: '0.25rem', background: '#F1F5F9', padding: '0.2rem', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  if (activeMode === 'text') {
                    const parsed = rawText.split('\n').map(s => s.trim()).filter(Boolean);
                    setIngredientsList(parsed.length > 0 ? parsed : ['']);
                  }
                  setActiveMode('list');
                }}
                style={{
                  border: 'none',
                  background: activeMode === 'list' ? '#FFFFFF' : 'transparent',
                  color: activeMode === 'list' ? 'var(--text-dark)' : '#64748B',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: activeMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Por Insumo
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeMode === 'list') {
                    setRawText(ingredientsList.filter(Boolean).join('\n'));
                  }
                  setActiveMode('text');
                }}
                style={{
                  border: 'none',
                  background: activeMode === 'text' ? '#FFFFFF' : 'transparent',
                  color: activeMode === 'text' ? 'var(--text-dark)' : '#64748B',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: activeMode === 'text' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Texto Libre
              </button>
            </div>
          </div>

          {/* Modo 1: Lista Desglosada */}
          {activeMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ingredientsList.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#F8FAFC',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', width: '20px', textAlign: 'center' }}>
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleIngredientChange(idx, e.target.value)}
                    placeholder="Ej. 60g Garbanzos cocidos"
                    style={{
                      flex: 1,
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.85rem',
                      outline: 'none',
                      background: '#FFFFFF',
                      color: 'var(--text-dark)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    disabled={ingredientsList.length === 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: ingredientsList.length === 1 ? '#CBD5E1' : '#EF4444',
                      cursor: ingredientsList.length === 1 ? 'not-allowed' : 'pointer',
                      padding: '0.35rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Eliminar ingrediente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddIngredient}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  color: brandColor,
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginTop: '0.25rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Plus size={16} /> Agregar Insumo
              </button>
            </div>
          ) : (
            /* Modo 2: Texto Libre Multilínea */
            <div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={7}
                placeholder="Escribe un ingrediente por línea, ej:&#10;120g Tofu firme&#10;60g Garbanzos cocidos&#10;70g Arroz integral"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  outline: 'none',
                  fontFamily: 'inherit',
                  color: 'var(--text-dark)'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Un insumo por renglón. Al guardar se formateará automáticamente.
              </span>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div style={{
          padding: '1rem 1.5rem',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            {(dish.isManuallyAdjusted || dish.originalIngredients) && (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0.3rem 0.5rem',
                  borderRadius: '6px'
                }}
                title="Restablecer a la receta sugerida original"
              >
                <RotateCcw size={14} /> Restablecer receta original
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.55rem 1.1rem',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                background: '#FFFFFF',
                color: '#475569',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.25rem',
                border: 'none',
                borderRadius: '8px',
                background: brandColor,
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <Check size={16} /> Guardar Cambios
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
