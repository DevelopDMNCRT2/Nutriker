import React from 'react';

export default function BlurredAppBackdrop() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
      background: 'radial-gradient(circle at 50% 35%, #F8FAFC 0%, #E2E8F0 55%, #CBD5E1 100%)'
    }}>
      {/* 1. Halo Central de Elevación (Iluminación Trasera / Backlight del Modal) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '800px',
        height: '520px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.9) 0%, rgba(226, 0, 26, 0.12) 40%, rgba(15, 23, 42, 0.05) 70%, transparent 100%)',
        filter: 'blur(70px)'
      }} />

      {/* 2. Orbe de Luz Difuminada Rojo Royal Canin (Superior / Lateral Izquierdo) */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '18%',
        width: '480px',
        height: '480px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(226, 0, 26, 0.30) 0%, rgba(226, 0, 26, 0.05) 55%, transparent 75%)',
        filter: 'blur(95px)',
        transform: 'translate(-30%, -20%)'
      }} />

      {/* 3. Orbe de Luz Difuminada Pizarra / Grafito (Inferior / Lateral Derecho) */}
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: '540px',
        height: '540px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(15, 23, 42, 0.22) 0%, rgba(30, 41, 59, 0.05) 60%, transparent 80%)',
        filter: 'blur(110px)'
      }} />

      {/* 4. Orbe de Acento Cálido Difuso (Superior Derecho) */}
      <div style={{
        position: 'absolute',
        top: '8%',
        right: '20%',
        width: '380px',
        height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244, 63, 94, 0.18) 0%, rgba(244, 63, 94, 0.03) 55%, transparent 75%)',
        filter: 'blur(80px)'
      }} />

      {/* 5. Textura Sutil de Matriz de Profundidad */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.07) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
        opacity: 0.5,
        pointerEvents: 'none'
      }} />

      {/* 6. Viñetado Óptico Suave (Gradiente Perimetral para Focalizar el Centro) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 45%, rgba(15, 23, 42, 0.18) 100%)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}
