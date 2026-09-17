# Evaluación Técnica y Plan de Adaptación: Nutriker Senior Care
## Adaptación del Sistema para Residencias de Adultos Mayores

**Documento Técnico y Base de Cotización**  
**Fecha:** Septiembre 2026  
**Proyecto:** Nutriker / Desarrollos DMNCRT2  
**Referencia:** Issue #105  

---

## 1. Resumen Ejecutivo

El presente documento evalúa la viabilidad técnica, arquitectura y esfuerzo operativo requerido para adaptar la plataforma actual de nutrición corporativa (**Nutriker B2B**) hacia un nuevo modelo de servicio especializado en **Residencias de Adultos Mayores (Senior Living & Centros Geriátricos)**.

El sistema actual cuenta con un grado de madurez que permite **reutilizar entre un 80% y 85% de la base de código**, abarcando la gestión de ciclos semanales, las interfaces de roles (Nutrióloga, Chef, Comensal/Administrador), la edición granular de ingredientes y el mecanismo de verificación clínica humana obligatoria. 

El objetivo es minimizar el costo operativo de desarrollo y proporcionar una base técnica sólida para el entregable y propuesta económica del viernes.

---

## 2. Diagnóstico de Reutilización del Código Actual

| Módulo / Componente Actual | Estado Actual en Repositorio | Nivel de Reutilización | Adaptación Requerida para Residencias |
| :--- | :--- | :---: | :--- |
| **Arquitectura Multi-Rol** | Vistas separadas para Nutrióloga, Chef, Participante y Admin. | **95%** | El rol de "Participante" se adapta a "Residente / Cuidador / Enfermería". |
| **Gestión de Menús Cíclicos (`menuStore.js`)** | Soporta semanas, días configurables (1 a 5 días) y opciones culinarias. | **85%** | Ampliar soporte a **7 días continuos** (lunes a domingo) y **múltiples tomas diarias** (Desayuno, Comida, Merienda, Cena). |
| **Editor de Ingredientes (`IngredientEditorModal.jsx`)** | Permite modificar gramajes, insumos y métodos técnicos en tiempo real con persistencia. | **90%** | Añadir selector de consistencia / textura del ingrediente adaptado. |
| **Mecanismo de Verificación Humana (Issue #104)** | Bloquea la publicación hasta auditar recetas individuales y firma clínica digital. | **100%** | Totalmente compatible; es un factor crítico de cumplimiento normativo médico en residencias. |
| **Auditoría Nutricional y Comparativas Clínicas** | Cálculo y desglose de calorías, macronutrientes, semáforos de balance. | **80%** | Ajustar rangos objetivo hacia micronutrientes geriátricos (calcio, vitamina D, potasio, sodio estricto, fibra soluble). |

---

## 3. Matriz de Brecha (Gap Analysis): Corporativo B2B vs. Residencias de Mayores

```
┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐
│       NUTRIKER B2B (CORPORATIVO)     │        │     NUTRIKER SENIOR CARE (GERIÁTRICO) │
├──────────────────────────────────────┤        ├──────────────────────────────────────┤
│ • Usuario activo / autónomo          │  ────► │ • Residente con dependencia asistida │
│ • 1 comida principal por jornada     │  ────► │ • 4 tomas diarias (Desayuno, Comida, │
│ • 1 a 5 días de servicio a oficina   │        │   Merienda, Cena) los 7 días de sem. │
│ • Enfoque en productividad y balance │  ────► │ • Enfoque en patologías geriátricas, │
│ • Presentación ergonómica individual │        │   texturas IDDSI y fácil deglución   │
│ • Menú estándar con opción A / B     │  ────► │ • Matriz de consistencia por persona │
└──────────────────────────────────────┘        └──────────────────────────────────────┘
```

### 3.1. Requerimientos Clínicos y Geriátricos Específicos
1. **Estandarización de Texturas (Escala Internacional IDDSI):**
   - **Nivel 7 (Normal / Regular):** Alimentos de textura habitual.
   - **Nivel 6 (Blanda / Fácil Masticación):** Piezas suaves que se cortan con tenedor.
   - **Nivel 5 (Picado y Húmedo / Mecánica):** Alimentos finamente picados con salsa para evitar atragantamiento.
   - **Nivel 4 (Puré / Papilla):** Consistencia homogénea sin grumos que no gotea.
   - **Nivel Líquido Engrosado:** Para control estricto de disfagia.

2. **Parámetros Nutricionales Críticos:**
   - **Control Hiposódico Estricto:** Restricción de sodio (<1,500 - 2,000 mg/día) para hipertensión e insuficiencia cardíaca.
   - **Prevención de Sarcopenia:** Alta densidad proteica biodisponible (1.2 - 1.5 g/kg peso corporal/día).
   - **Control de Hidratación:** Registro de ingesta hídrica protocolizada (mínimo 1.5 a 2 litros/día).
   - **Control Glucémico e Índice Glucémico Bajo:** Para diabetes mellitus tipo 2 prevalente en edad avanzada.

---

## 4. Estrategia Arquitectónica: ¿Clonación o Multi-Servicio Modular?

Se evaluaron dos alternativas para implementar la solución:

### Opción A: Clonación de Repositorio (Fork / Copia Independiente)
- **Ventajas:** Aislamiento total de base de datos y repositorios; permite modificaciones libres sin riesgo de regresión en el proyecto corporativo.
- **Desventajas:** Duplica los costos de mantenimiento, parches de seguridad y deuda técnica. Si se mejora el editor de recetas en un proyecto, debe portarse manualmente al otro.

### Opción B: Arquitectura Multi-Servicio Configurable (Recomendada)
- **Enfoque:** Utilizar el mismo núcleo tecnológico mediante un selector de perfil de servicio (`serviceProfile: 'corporate' | 'senior_care'`).
- **Ventajas:**
  - **Mínimo esfuerzo operativo:** Se mantiene una sola base de código con despliegues unificados en Vercel.
  - **Reutilización inmediata:** Cualquier mejora (como cálculos automáticos o verificación humana) impacta favorablemente a ambos modelos de negocio.
  - **Velocidad de entrega:** Permite presentar este mismo viernes una demostración interactiva totalmente funcional sin duplicar infraestructura.

---

## 5. Plan de Adaptación Técnica por Módulos

### Módulo 1: Modelos de Datos y Catálogos (`src/data/mockData.js` & `menuStore.js`)
- Añadir perfil `seniorCareProgramInfo` (Residencia Santa Sofía / Centro Geriátrico).
- Incorporar catálogo de texturas clínicas IDDSI.
- Configurar catálogo de platillos adaptados (ej. Papilla de Ternera con Verduras al Vapor, Crema de Salmón con Calabaza, Pescado Blanco en Textura Suave).

### Módulo 2: Vista de Nutrióloga Geriátrica (`NutriologaView.jsx`)
- Selector de tomas del día (Comida / Desayuno / Cena).
- Validación de requerimientos geriátricos (control de sodio, fibra y proteínas).
- Certificación humana de dietas terapéuticas y texturas.

### Módulo 3: Vista de Producción y Cocina (`ChefView.jsx`)
- Desglose de porciones a cocinar según textura (ej. 25 porciones Regulares, 15 porciones Fácil Masticación, 8 porciones Puré IDDSI 4).
- Fichas técnicas con instrucciones de triturado, espesado o emulsionado.

### Módulo 4: Vista de Residente / Enfermería (`ParticipantView.jsx`)
- Ficha de tolerancia clínica e ingesta.
- Alertas visibles de disfagia y alérgenos por comensal.

---

## 6. Estimación de Esfuerzo y Cotización (Entregable del Viernes)

### 6.1. Desglose de Esfuerzo en Horas de Desarrollo

| Fase / Hito | Alcance Técnico | Esfuerzo Estimado |
| :--- | :--- | :---: |
| **Fase 1: Configuración de Perfiles y Texturas Geriátricas** | Implementación del selector de modelo de servicio, modelos de datos de residencias y texturas IDDSI. | 16 horas |
| **Fase 2: Adaptación de la Estación de Cocina (Chef) y Producción** | Planilla de porcionamiento por texturas (Normal, Mecánica, Papilla) y fichas técnicas de triturado. | 14 horas |
| **Fase 3: Auditoría Clínica y Supervisión de Enfermería** | Semáforo de consistencias, control de sodio/líquidos y certificación clínica especializada. | 12 horas |
| **Fase 4: Pruebas de Calidad, QA y Despliegue Multi-Entorno** | Validación cruzada, pruebas de regresión B2B vs Residencia, CI/CD en Vercel. | 8 horas |
| **Total Estimado de Implementación:** | | **50 horas** |

### 6.2. Cronograma de Entrega Recomendado
- **Semana 1 (Inmediata):** Prototipo funcional y selector de modelo operativo (demo de viernes).
- **Semana 2:** Módulo de texturas IDDSI y consolidado de producción para cocina.
- **Semana 3:** Portal de enfermería / residentes y certificación clínica completa.
- **Semana 4:** Fase piloto en residencia y estabilización en producción.

---

## 7. Conclusión y Recomendación

La adaptación de Nutriker al mercado de residencias de mayores representa una **oportunidad de alto valor con muy bajo riesgo técnico**. Gracias a los módulos ya completados (Issues #102, #103 y #104), el sistema ya posee el 85% de la infraestructura crítica requerida.

Se recomienda adoptar la **Opción B (Multi-Servicio Configurable)** como base para la cotización del viernes, asegurando una rápida puesta en marcha y máxima rentabilidad operativa.
