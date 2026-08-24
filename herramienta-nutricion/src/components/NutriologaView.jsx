import React, { useState } from 'react';
import { HeartPulse, ShieldCheck, CheckCircle2, AlertTriangle, Activity, Apple, Flame, Sparkles, Wand2, ChevronRight, ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { cyclicMenus, nutriologaInfo, programInfo } from '../data/mockData';

export default function NutriologaView({ selectedWeek }) {
  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard' | 'audit'

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [daysPerWeek, setDaysPerWeek] = useState('3'); // '3' (L/M/V) | '5' (L-V)
  const [dietOptionA, setDietOptionA] = useState('Balance Proteico');
  const [dietOptionB, setDietOptionB] = useState('Plant-Based & Digestión Ligera');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [wizardSuccess, setWizardSuccess] = useState(false);

  // Simulated dishes catalog for the wizard AI tool
  const [dishSelection, setDishSelection] = useState({
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
  });

  const [expandedRecipe, setExpandedRecipe] = useState(null); // track which recipe is expanded e.g. "Lunes-optionA"

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const weekData = cyclicMenus.find(w => w.weekNumber === selectedWeek) || cyclicMenus[0];
  const currentDay = weekData.days[selectedDayIndex];

  const handleDishChange = (dayName, option, field, newValue) => {
    setDishSelection(prev => ({
      ...prev,
      [dayName]: {
        ...prev[dayName],
        [option]: {
          ...prev[dayName][option],
          [field]: newValue
        }
      }
    }));
  };

  const handleGenerateAiMenu = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setIsAiGenerating(false);
      setWizardStep(3);
    }, 600);
  };

  const handlePublishMenu = () => {
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
          <Wand2 size={16} /> Programador de Menús (Wizard IA)
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

      {/* TAB WIZARD: PROGRAMADOR PASO A PASO CON IA */}
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
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: wizardStep >= 3 ? '#2563EB' : '#94A3B8' }}>3. Generación IA</span>
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

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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
              
              <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Días seleccionados: <strong style={{ color: '#2563EB' }}>{daysPerWeek} {daysPerWeek === 1 ? 'día' : 'días'} a la semana</strong>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#2563EB', display: 'block', marginBottom: '0.3rem' }}>
                    Enfoque para la Opción A (Proteica / Balance):
                  </label>
                  <select
                    value={dietOptionA}
                    onChange={(e) => setDietOptionA(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="Balance Proteico">Balance Proteico (Pollo magro / Pavo / Sirloin)</option>
                    <option value="Low Carb Keto">Low Carb / Keto Friendly (Bajo en carbohidratos)</option>
                    <option value="Gourmet Saludable">Gourmet Saludable de Estación</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--green-dark)', display: 'block', marginBottom: '0.3rem' }}>
                    Enfoque para la Opción B (Plant-Based / Light):
                  </label>
                  <select
                    value={dietOptionB}
                    onChange={(e) => setDietOptionB(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="Plant-Based & Digestión Ligera">Plant-Based & Vegano (Garbanzo / Tofu / Lenteja)</option>
                    <option value="Vegetariano Balance">Vegetariano con Quesos Artesanales Magros</option>
                    <option value="Superfoods & Antiinflamatorio">Superfoods Antiinflamatorios & Ensaladas</option>
                  </select>
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
                <button onClick={handleGenerateAiMenu} className="btn-uber-primary" style={{ flex: 2, justifyContent: 'center', background: '#2563EB' }}>
                  {isAiGenerating ? 'Generando menú con IA...' : <><Sparkles size={16} /> Asistente IA (Catálogo de Platillos)</>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AI GENERATED DISTRIBUTION */}
          {wizardStep === 3 && (
            <div className="animate-fade-in">
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1rem 1.25rem', borderRadius: '14px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={20} color="var(--green-dark)" />
                  <div>
                    <strong style={{ color: 'var(--green-dark)', fontSize: '0.95rem' }}>Asistente IA de Nutrición: Platillos distribuidos exitosamente</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Calorías, macros y alérgenos calculados automáticamente del catálogo clínico pre-aprobado.
                    </div>
                  </div>
                </div>
                <span className="badge-tag badge-green">3 Días • 6 Platillos</span>
              </div>

              {/* Distributed Days Catalog */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {Object.keys(dishSelection).map((dayName) => (
                  <div key={dayName} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-dark)', marginBottom: '0.75rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                      {dayName} (Entrega en Oficina)
                    </div>

                    <div style={{ background: '#EFF6FF', padding: '0.75rem', borderRadius: '10px', marginBottom: '0.6rem', border: '1px solid #BFDBFE' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#2563EB', marginBottom: '0.2rem' }}>Opción A ({dietOptionA}):</div>
                      <input 
                        type="text" 
                        value={dishSelection[dayName].optionA.name}
                        onChange={(e) => handleDishChange(dayName, 'optionA', 'name', e.target.value)}
                        style={{ width: '100%', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0.4rem', border: '1px solid #93C5FD', borderRadius: '6px', outline: 'none', marginBottom: '0.4rem' }}
                      />
                      <button 
                        onClick={() => setExpandedRecipe(expandedRecipe === `${dayName}-A` ? null : `${dayName}-A`)}
                        style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                      >
                        {expandedRecipe === `${dayName}-A` ? '- Ocultar Receta Técnica' : '+ Ver / Editar Receta Técnica'}
                      </button>

                      {expandedRecipe === `${dayName}-A` && (
                        <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <textarea
                            value={dishSelection[dayName].optionA.ingredients}
                            onChange={(e) => handleDishChange(dayName, 'optionA', 'ingredients', e.target.value)}
                            placeholder="Ingredientes (Ej. 150g Pollo, 50g Arroz)"
                            style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-dark)', padding: '0.4rem', border: '1px solid #BFDBFE', borderRadius: '6px', outline: 'none', resize: 'vertical', minHeight: '40px' }}
                          />
                          <textarea
                            value={dishSelection[dayName].optionA.method}
                            onChange={(e) => handleDishChange(dayName, 'optionA', 'method', e.target.value)}
                            placeholder="Método de preparación"
                            style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-dark)', padding: '0.4rem', border: '1px solid #BFDBFE', borderRadius: '6px', outline: 'none', resize: 'vertical', minHeight: '60px' }}
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ background: '#F0FDF4', padding: '0.75rem', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--green-dark)', marginBottom: '0.2rem' }}>Opción B ({dietOptionB}):</div>
                      <input 
                        type="text" 
                        value={dishSelection[dayName].optionB.name}
                        onChange={(e) => handleDishChange(dayName, 'optionB', 'name', e.target.value)}
                        style={{ width: '100%', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0.4rem', border: '1px solid #86EFAC', borderRadius: '6px', outline: 'none', marginBottom: '0.4rem' }}
                      />
                      <button 
                        onClick={() => setExpandedRecipe(expandedRecipe === `${dayName}-B` ? null : `${dayName}-B`)}
                        style={{ background: 'none', border: 'none', color: '#15803D', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                      >
                        {expandedRecipe === `${dayName}-B` ? '- Ocultar Receta Técnica' : '+ Ver / Editar Receta Técnica'}
                      </button>

                      {expandedRecipe === `${dayName}-B` && (
                        <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <textarea
                            value={dishSelection[dayName].optionB.ingredients}
                            onChange={(e) => handleDishChange(dayName, 'optionB', 'ingredients', e.target.value)}
                            placeholder="Ingredientes"
                            style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-dark)', padding: '0.4rem', border: '1px solid #BBF7D0', borderRadius: '6px', outline: 'none', resize: 'vertical', minHeight: '40px' }}
                          />
                          <textarea
                            value={dishSelection[dayName].optionB.method}
                            onChange={(e) => handleDishChange(dayName, 'optionB', 'method', e.target.value)}
                            placeholder="Método de preparación"
                            style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-dark)', padding: '0.4rem', border: '1px solid #BBF7D0', borderRadius: '6px', outline: 'none', resize: 'vertical', minHeight: '60px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                        background: isCaptchaVerified ? '#2563EB' : '#94A3B8',
                        cursor: isCaptchaVerified ? 'pointer' : 'not-allowed',
                        opacity: isCaptchaVerified ? 1 : 0.7
                      }}
                      disabled={!isCaptchaVerified}
                    >
                      <CheckCircle2 size={18} /> Certificar y Publicar Menú
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
                    background: selectedDayIndex === idx ? '#2563EB' : 'transparent',
                    color: selectedDayIndex === idx ? '#FFFFFF' : 'var(--text-dark)',
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

          {/* Comparative Clinical Cards */}
          <div className="comparative-grid">
            
            {/* OPTION A AUDIT */}
            <div className="uber-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span className="badge-tag badge-red">Opción A • {currentDay.optionA.category}</span>
                <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: '700', background: '#F0FDF4', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  ✓ Aprobado por Nutrición
                </span>
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                {currentDay.optionA.name}
              </h4>

              {/* Clinical Macro Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', margin: '1rem 0', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Calorías</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>{currentDay.optionA.calories} kcal</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Proteína</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#2563EB' }}>{currentDay.optionA.protein}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Carbos</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{currentDay.optionA.carbs}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Grasas</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{currentDay.optionA.fats}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                <strong>Perfil Clínico:</strong> Índice glucémico controlado, digestión ágil en oficina sin causar pesadez post-almuerzo.
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <strong>Alérgenos registrados:</strong> {currentDay.optionA.allergens.length > 0 ? currentDay.optionA.allergens.join(', ') : 'Ninguno (Libre de alérgenos comunes)'}
              </div>
            </div>

            {/* OPTION B AUDIT */}
            <div className="uber-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span className="badge-tag badge-green">Opción B • {currentDay.optionB.category}</span>
                <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: '700', background: '#F0FDF4', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  ✓ Aprobado por Nutrición
                </span>
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
                {currentDay.optionB.name}
              </h4>

              {/* Clinical Macro Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', margin: '1rem 0', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Calorías</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>{currentDay.optionB.calories} kcal</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Proteína</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#2563EB' }}>{currentDay.optionB.protein}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Carbos</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{currentDay.optionB.carbs}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Grasas</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{currentDay.optionB.fats}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                <strong>Perfil Clínico:</strong> Alto contenido de fibra vegetal e ingredientes antioxidantes antiinflamatorios.
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <strong>Alérgenos registrados:</strong> {currentDay.optionB.allergens.length > 0 ? currentDay.optionB.allergens.join(', ') : 'Ninguno (Libre de alérgenos comunes)'}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
