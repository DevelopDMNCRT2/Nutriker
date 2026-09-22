import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Plus, 
  FileSpreadsheet, 
  Search, 
  Download, 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  Bed, 
  HeartPulse, 
  Utensils, 
  Eye, 
  Trash2, 
  Edit2, 
  FileDown, 
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  ShoppingCart
} from 'lucide-react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'casanostra_residentes_v1';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = (typeof window !== 'undefined' && window.__VITE_API_URL__)
  || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  || (isLocalhost ? 'http://localhost:3000' : 'https://nutrikerserver.vercel.app');

const DEFAULT_RESIDENTS = [
  {
    id: "RES-101",
    nombre: "Doña Carmen Salinas",
    edad: 84,
    habitacion: "101-A",
    restricciones: ["Hiposódica", "Bajo en Grasa"],
    asistencia: "Comedor General Asistido",
    observaciones: "Requiere apoyo para cortar por artritis en manos. Buena deglución."
  },
  {
    id: "RES-102",
    nombre: "Don Roberto Garza",
    edad: 89,
    habitacion: "102-B",
    restricciones: ["Diabético", "Hiposódica"],
    asistencia: "En Cama / Habitación",
    observaciones: "Disfagia moderada a líquidos finos. Utilizar espesante nivel 3."
  },
  {
    id: "RES-103",
    nombre: "Sra. Margarita Valenzuela",
    edad: 79,
    habitacion: "201-A",
    restricciones: ["Sin Lactosa"],
    asistencia: "Comedor Autónomo",
    observaciones: "Tolera carnes suaves cocidas a fuego lento. Bebe agua con normalidad."
  },
  {
    id: "RES-104",
    nombre: "Don Francisco Mendoza",
    edad: 82,
    habitacion: "203-A",
    restricciones: ["Ninguna"],
    asistencia: "Comedor Autónomo",
    observaciones: "Excelente apetito. Alta preferencia por legumbres y sopas calientes."
  },
  {
    id: "RES-105",
    nombre: "Doña Elena Castro",
    edad: 91,
    habitacion: "105-B",
    restricciones: ["Hiposódica", "Sin Gluten"],
    asistencia: "Comedor General Asistido",
    observaciones: "Monitorear fatiga durante la comida. Dividir en raciones pequeñas y frecuentes."
  },
  {
    id: "RES-106",
    nombre: "Don Alberto Ruiz",
    edad: 76,
    habitacion: "204-B",
    restricciones: ["Diabético"],
    asistencia: "Comedor Autónomo",
    observaciones: "Control de glucosa postprandial. Postres 100% sin azúcar refinada."
  }
];

export default function AdministracionView() {
  const [activeAdminTab, setActiveAdminTab] = useState('residentes');
  const [residents, setResidents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_RESIDENTS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('online');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);

  // ── Compras y Gastos ────────────────────────────────────────────────────────
  const GASTOS_KEY = 'casanostra_gastos_v1';
  const PRESUPUESTO_KEY = 'casanostra_presupuesto_v1';

  const CATEGORIAS_GASTO = [
    'Insumos Alimentarios',
    'Lácteos y Proteínas',
    'Frutas y Verduras',
    'Granos y Abarrotes',
    'Higiene y Limpieza',
    'Servicios (Gas, Agua, Luz)',
    'Equipamiento y Utensilios',
    'Medicamentos y Suplementos',
    'Otros'
  ];

  const MOCK_GASTOS = [
    { id: 'G-001', concepto: 'Compra semanal de pollo y res', proveedor: 'Carnicería El Rancho', categoria: 'Insumos Alimentarios', monto: 2850.00, fecha: '2026-09-16', notas: '5 kg pollo pechuga, 3 kg res molida' },
    { id: 'G-002', concepto: 'Frutas y verduras de temporada', proveedor: 'Mercado Juárez', categoria: 'Frutas y Verduras', monto: 1240.50, fecha: '2026-09-16', notas: 'Manzana, papaya, zanahoria, calabaza, espinaca' },
    { id: 'G-003', concepto: 'Gas LP cocina', proveedor: 'Gas Express Norte', categoria: 'Servicios (Gas, Agua, Luz)', monto: 980.00, fecha: '2026-09-15', notas: 'Recarga tanque estacionario 200 lt' },
    { id: 'G-004', concepto: 'Lácteos: leche, yogur, queso cottage', proveedor: 'Lala Distribuidora', categoria: 'Lácteos y Proteínas', monto: 760.00, fecha: '2026-09-14', notas: 'Leche deslactosada, yogur natural sin azúcar' },
    { id: 'G-005', concepto: 'Abarrotes y granos (arroz, lenteja, frijol)', proveedor: 'Bodega Aurrerá', categoria: 'Granos y Abarrotes', monto: 640.00, fecha: '2026-09-13', notas: 'Arroz 5kg, lenteja 2kg, frijol bayo 3kg' },
    { id: 'G-006', concepto: 'Desinfectante y cloro cocina', proveedor: 'Distribuidora Limpieza Total', categoria: 'Higiene y Limpieza', monto: 320.00, fecha: '2026-09-12', notas: '' },
    { id: 'G-007', concepto: 'Suplemento proteico Ensure adulto mayor', proveedor: 'Farmacia del Ahorro', categoria: 'Medicamentos y Suplementos', monto: 1580.00, fecha: '2026-09-11', notas: '4 cajas para residentes con sarcopenia' },
    { id: 'G-008', concepto: 'Pescado blanco (tilapia y merluza)', proveedor: 'Pescadería Mar Azul', categoria: 'Insumos Alimentarios', monto: 920.00, fecha: '2026-09-10', notas: 'Para menú del jueves y viernes' },
    { id: 'G-009', concepto: 'Aceite vegetal y espesante alimentario', proveedor: 'Costco Mayoreo', categoria: 'Granos y Abarrotes', monto: 480.00, fecha: '2026-09-09', notas: 'Espesante nivel 3 para residentes con disfagia' },
    { id: 'G-010', concepto: 'Mantenimiento horno industrial', proveedor: 'TecnoEquip MX', categoria: 'Equipamiento y Utensilios', monto: 1200.00, fecha: '2026-09-08', notas: 'Revisión preventiva trimestral' },
  ];

  const [gastos, setGastos] = useState(() => {
    try {
      const saved = localStorage.getItem(GASTOS_KEY);
      return saved ? JSON.parse(saved) : MOCK_GASTOS;
    } catch { return MOCK_GASTOS; }
  });

  const [presupuesto, setPresupuesto] = useState(() => {
    try {
      const saved = localStorage.getItem(PRESUPUESTO_KEY);
      return saved ? parseFloat(saved) : 15000;
    } catch { return 15000; }
  });

  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false);
  const [gastoForm, setGastoForm] = useState({
    concepto: '', proveedor: '', categoria: 'Insumos Alimentarios',
    monto: '', fecha: new Date().toISOString().slice(0, 10), notas: ''
  });
  const [gastoSearchTerm, setGastoSearchTerm] = useState('');
  const [gastoCategoryFilter, setGastoCategoryFilter] = useState('Todas');

  const saveGastos = (list) => {
    setGastos(list);
    localStorage.setItem(GASTOS_KEY, JSON.stringify(list));
  };

  const handleAddGasto = () => {
    if (!gastoForm.concepto.trim() || !gastoForm.monto || parseFloat(gastoForm.monto) <= 0) return;
    const newGasto = {
      id: `G-${Date.now()}`,
      ...gastoForm,
      monto: parseFloat(gastoForm.monto),
      fecha: gastoForm.fecha || new Date().toISOString().slice(0, 10)
    };
    saveGastos([newGasto, ...gastos]);
    setGastoForm({ concepto: '', proveedor: '', categoria: 'Insumos Alimentarios', monto: '', fecha: new Date().toISOString().slice(0, 10), notas: '' });
    setIsGastoModalOpen(false);
  };

  const handleDeleteGasto = (id) => {
    if (!window.confirm('¿Eliminar este registro de gasto?')) return;
    saveGastos(gastos.filter(g => g.id !== id));
  };

  const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);
  const gastosPorCategoria = CATEGORIAS_GASTO.map(cat => ({
    nombre: cat,
    total: gastos.filter(g => g.categoria === cat).reduce((a, g) => a + g.monto, 0)
  })).filter(c => c.total > 0);

  const filteredGastos = gastos.filter(g => {
    const matchSearch = g.concepto.toLowerCase().includes(gastoSearchTerm.toLowerCase()) ||
      g.proveedor?.toLowerCase().includes(gastoSearchTerm.toLowerCase());
    const matchCat = gastoCategoryFilter === 'Todas' || g.categoria === gastoCategoryFilter;
    return matchSearch && matchCat;
  });

  const exportGastosCSV = () => {
    const headers = ['Fecha', 'Concepto', 'Proveedor', 'Categoría', 'Monto (MXN)', 'Notas'];
    const rows = gastos.map(g => [
      `"${g.fecha}"`, `"${g.concepto.replace(/"/g, '""')}"`,
      `"${(g.proveedor || '').replace(/"/g, '""')}"`,
      `"${g.categoria}"`, g.monto, `"${(g.notas || '').replace(/"/g, '""')}"`
    ]);
    rows.push(['"TOTAL"', '', '', '', totalGastos.toFixed(2), '']);
    const csv = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `Casa_Nostra_Gastos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // Form State para Nuevo / Editar
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    habitacion: '',
    restricciones: [],
    asistencia: 'Comedor Autónomo',
    observaciones: ''
  });

  // Import State
  const [importedPreview, setImportedPreview] = useState([]);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  // Cargar residentes desde la base de datos (con fallback a localStorage)
  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/residentes`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setResidents(json.data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
          setSyncStatus('online');
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend no disponible, usando almacenamiento local:', err.message);
      setSyncStatus('offline');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // Guardar en localStorage como respaldo offline
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(residents));
    } catch (e) {}
  }, [residents]);

  // Filtrado de Residentes por búsqueda
  const filteredResidents = residents.filter(res => {
    return (
      res.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.habitacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.restricciones && res.restricciones.some(r => r.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  });

  // Abrir Modal de Nuevo Residente
  const handleOpenNewModal = () => {
    setEditingResident(null);
    setFormData({
      nombre: '',
      edad: '',
      habitacion: '',
      restricciones: [],
      asistencia: 'Comedor Autónomo',
      observaciones: ''
    });
    setIsNewModalOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEditModal = (res) => {
    setEditingResident(res);
    setFormData({
      nombre: res.nombre,
      edad: res.edad || '',
      habitacion: res.habitacion,
      restricciones: res.restricciones || [],
      asistencia: res.asistencia || 'Comedor Autónomo',
      observaciones: res.observaciones || ''
    });
    setIsNewModalOpen(true);
  };

  // Guardar Residente (Crear o Actualizar)
  const handleSaveResident = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.habitacion.trim()) {
      alert('Por favor completa el nombre y la habitación del residente.');
      return;
    }

    const payload = {
      nombre: formData.nombre.trim(),
      edad: Number(formData.edad) || 80,
      habitacion: formData.habitacion.trim().toUpperCase(),
      restricciones: formData.restricciones,
      asistencia: formData.asistencia,
      observaciones: formData.observaciones.trim()
    };

    try {
      if (editingResident) {
        const res = await fetch(`${API_BASE_URL}/api/residentes/${editingResident.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setResidents(prev => prev.map(r => r.id === editingResident.id ? json.data : r));
        } else {
          setResidents(prev => prev.map(r => r.id === editingResident.id ? { ...payload, id: editingResident.id } : r));
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/residentes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setResidents(prev => [json.data, ...prev]);
        } else {
          const fallbackRecord = { ...payload, id: `RES-${Math.floor(100 + Math.random() * 900)}` };
          setResidents(prev => [fallbackRecord, ...prev]);
        }
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Backend no disponible para guardar, persistiendo en localStorage:', err.message);
      const fallbackRecord = { ...payload, id: editingResident ? editingResident.id : `RES-${Math.floor(100 + Math.random() * 900)}` };
      if (editingResident) {
        setResidents(prev => prev.map(r => r.id === editingResident.id ? fallbackRecord : r));
      } else {
        setResidents(prev => [fallbackRecord, ...prev]);
      }
    }

    setIsNewModalOpen(false);
  };

  // Eliminar Residente
  const handleDeleteResident = async (id, nombre) => {
    if (window.confirm(`¿Confirmas que deseas retirar a "${nombre}" del censo activo de residentes?`)) {
      try {
        await fetch(`${API_BASE_URL}/api/residentes/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Backend no disponible para eliminar, eliminando localmente:', err.message);
      }
      setResidents(prev => prev.filter(r => r.id !== id));
    }
  };

  // Toggle de Alergia / Restricción en Formulario
  const toggleRestriction = (tag) => {
    setFormData(prev => {
      const exists = prev.restricciones.includes(tag);
      if (exists) {
        return { ...prev, restricciones: prev.restricciones.filter(t => t !== tag) };
      } else {
        return { ...prev, restricciones: [...prev.restricciones, tag] };
      }
    });
  };

  // ----------------------------------------------------
  // MANEJO DE IMPORTACIÓN EXCEL (XLSX)
  // ----------------------------------------------------
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setImportError('');
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawData || rawData.length === 0) {
          setImportError('La hoja de cálculo seleccionada no contiene registros o filas válidas.');
          setImportedPreview([]);
          return;
        }

        // Mapeo flexible de columnas para admitir variaciones de encabezado
        const parsedRows = rawData.map((row, index) => {
          const nombre = row['Nombre'] || row['NOMBRE'] || row['Nombre Completo'] || row['nombre'] || `Residente #${index + 1}`;
          const habitacion = String(row['Habitacion'] || row['HABITACION'] || row['Habitación'] || row['Cama'] || `Hab. ${100 + index}`);
          const edad = Number(row['Edad'] || row['EDAD'] || row['edad']) || 80;

          const rawRestr = String(row['Restricciones'] || row['Alergias'] || row['Dietas'] || 'Ninguna');
          const restricciones = rawRestr.split(/[,;/]/).map(s => s.trim()).filter(Boolean);

          const asistencia = String(row['Asistencia'] || row['Comedor'] || 'Comedor Autónomo');
          const observaciones = String(row['Observaciones'] || row['Notas'] || 'Importado vía Excel');

          return {
            id: `RES-${Math.floor(100 + Math.random() * 900)}-XLS`,
            nombre,
            edad,
            habitacion,
            restricciones: restricciones.length > 0 ? restricciones : ['Ninguna'],
            asistencia,
            observaciones
          };
        });

        setImportedPreview(parsedRows);
      } catch (err) {
        console.error('Error al parsear archivo Excel:', err);
        setImportError('No se pudo procesar el archivo. Asegúrate de que sea un archivo válido de Excel (.xlsx o .xls).');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Confirmar Importación Masiva
  const handleConfirmImport = async () => {
    if (importedPreview.length === 0) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/residentes/importar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ residentes: importedPreview, centro_residencia: 'Casa Nostra' })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setResidents(prev => {
            const newIds = new Set(json.data.map(d => d.id));
            const filteredPrev = prev.filter(p => !newIds.has(p.id));
            return [...json.data, ...filteredPrev];
          });
        } else {
          setResidents(prev => [...importedPreview, ...prev]);
        }
      } else {
        setResidents(prev => [...importedPreview, ...prev]);
      }
    } catch (err) {
      console.warn('Backend no disponible para importación, persistiendo localmente:', err.message);
      setResidents(prev => [...importedPreview, ...prev]);
    }

    setIsImportModalOpen(false);
    setImportedPreview([]);
    setImportFileName('');

    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch (e) {}

    alert(`¡Éxito! Se han importado ${importedPreview.length} residentes al censo del centro.`);
  };

  // Descargar Plantilla Excel de Ejemplo
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Nombre: "María González Rivas",
        Edad: 83,
        Habitacion: "108-A",
        Restricciones: "Hiposódica, Sin Lactosa",
        Asistencia: "Comedor General Asistido",
        Observaciones: "Control de presión arterial. Deglución asistida."
      },
      {
        Nombre: "Ignacio Torres Beltrán",
        Edad: 88,
        Habitacion: "210-B",
        Restricciones: "Diabético",
        Asistencia: "En Cama / Habitación",
        Observaciones: "Requiere apoyo y dieta controlada en glucosa."
      },
      {
        Nombre: "Beatriz Lozano Morales",
        Edad: 77,
        Habitacion: "104-A",
        Restricciones: "Ninguna",
        Asistencia: "Comedor Autónomo",
        Observaciones: "Excelente deglución. Porciones abundantes de vegetales."
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Residentes_Plantilla");
    XLSX.writeFile(wb, "plantilla_residentes_casa_nostra.xlsx");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
      
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Encabezado de Sección: Administración */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #78350F 0%, #B45309 60%, #D97706 100%)',
        color: 'white',
        borderRadius: '20px',
        padding: '1.75rem 2rem',
        boxShadow: '0 10px 25px rgba(180, 83, 9, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              fontSize: '0.75rem',
              fontWeight: '800',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Módulo Central Geriátrico
            </span>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>• Casa Nostra</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Administración del Centro
          </h2>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.9rem', opacity: 0.9, maxWidth: '640px' }}>
            Control de comensales, asignación de habitaciones y restricciones clínicas individuales.
          </p>
        </div>

        {/* Resumen numérico */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          padding: '0.75rem 1.25rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.6rem', fontWeight: '800' }}>{residents.length}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.9 }}>Residentes en Censo</div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Sub-Navbar Superior de Administración */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '0.5rem',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto'
      }}>
        {/* Pestaña 1: Residentes */}
        <button
          onClick={() => setActiveAdminTab('residentes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            border: 'none',
            background: activeAdminTab === 'residentes' ? '#B45309' : 'transparent',
            color: activeAdminTab === 'residentes' ? '#FFFFFF' : '#64748B',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeAdminTab === 'residentes' ? '0 4px 12px rgba(180, 83, 9, 0.25)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <Users size={18} />
          <span>Residentes</span>
          <span style={{
            background: activeAdminTab === 'residentes' ? 'rgba(255, 255, 255, 0.25)' : '#F1F5F9',
            color: activeAdminTab === 'residentes' ? '#FFFFFF' : '#475569',
            padding: '0.15rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '800'
          }}>
            {residents.length}
          </span>
        </button>

        {/* Pestaña 2: Compras y Gastos */}
        <button
          onClick={() => setActiveAdminTab('compras')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            border: 'none',
            background: activeAdminTab === 'compras' ? '#B45309' : 'transparent',
            color: activeAdminTab === 'compras' ? '#FFFFFF' : '#64748B',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeAdminTab === 'compras' ? '0 4px 12px rgba(180, 83, 9, 0.25)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <ShoppingCart size={18} />
          <span>Compras y Gastos</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. Barra de Acciones y Filtros de Residentes */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeAdminTab === 'residentes' && (<>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.25rem',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Buscador */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '460px' }}>
          <Search size={17} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, habitación o alergia..."
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem 0.6rem 2.5rem',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.85rem',
              outline: 'none',
              background: '#F8FAFC'
            }}
          />
        </div>

        {/* Botones de Acción: +Nuevo y Importar XLSX */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
          {/* Botón Importar Excel */}
          <button
            onClick={() => {
              setImportError('');
              setImportedPreview([]);
              setImportFileName('');
              setIsImportModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.1rem',
              borderRadius: '10px',
              border: '1.5px solid #059669',
              background: '#ECFDF5',
              color: '#065F46',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FileSpreadsheet size={17} color="#059669" />
            <span>Importar XLSX</span>
          </button>

          {/* Botón +Nuevo Residente */}
          <button
            onClick={handleOpenNewModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              background: '#B45309',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(180, 83, 9, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={18} />
            <span>+ Nuevo</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. Tabla de Residentes */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '800', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Residente</th>
                <th style={{ padding: '1rem 1rem', fontWeight: '800', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Habitación</th>
                <th style={{ padding: '1rem 1rem', fontWeight: '800', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Restricciones Clínicas</th>
                <th style={{ padding: '1rem 1rem', fontWeight: '800', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Asistencia / Comedor</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '800', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.length > 0 ? (
                filteredResidents.map((res, idx) => {
                  return (
                    <tr 
                      key={res.id || idx}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF3C720'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Columna Residente */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: '#F1F5F9',
                            color: '#78350F',
                            fontWeight: '800',
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #E2E8F0'
                          }}>
                            {res.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.92rem' }}>
                              {res.nombre}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              {res.edad} años • ID: {res.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Columna Habitación */}
                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          color: '#334155'
                        }}>
                          <Bed size={13} color="#64748B" />
                          {res.habitacion}
                        </span>
                      </td>

                      {/* Columna Restricciones / Alergias */}
                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {res.restricciones && res.restricciones.length > 0 ? (
                            res.restricciones.map((rest, rIdx) => (
                              <span 
                                key={rIdx}
                                style={{
                                  background: rest.toLowerCase().includes('ningun') ? '#F1F5F9' : '#FEF2F2',
                                  color: rest.toLowerCase().includes('ningun') ? '#64748B' : '#991B1B',
                                  border: `1px solid ${rest.toLowerCase().includes('ningun') ? '#E2E8F0' : '#FECACA'}`,
                                  fontSize: '0.72rem',
                                  fontWeight: '600',
                                  padding: '0.18rem 0.5rem',
                                  borderRadius: '6px'
                                }}
                              >
                                {rest}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Sin restricciones</span>
                          )}
                        </div>
                      </td>

                      {/* Columna Asistencia / Comedor */}
                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#334155' }}>
                          {res.asistencia || 'Comedor Autónomo'}
                        </div>
                        {res.observaciones && (
                          <div style={{ fontSize: '0.72rem', color: '#64748B', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={res.observaciones}>
                            {res.observaciones}
                          </div>
                        )}
                      </td>

                      {/* Columna Acciones */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenEditModal(res)}
                            title="Editar Residente"
                            style={{
                              background: '#F8FAFC',
                              border: '1px solid #CBD5E1',
                              color: '#334155',
                              padding: '0.35rem 0.55rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteResident(res.id, res.nombre)}
                            title="Eliminar Residente"
                            style={{
                              background: '#FEF2F2',
                              border: '1px solid #FECACA',
                              color: '#DC2626',
                              padding: '0.35rem 0.55rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: '#F8FAFC', borderRadius: '50%', marginBottom: '0.75rem' }}>
                      <Search size={28} color="#94A3B8" />
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1E293B' }}>No se encontraron residentes</div>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem' }}>
                      Prueba ajustando los términos de búsqueda.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de la Tabla con totales y estado de BD */}
        <div style={{
          padding: '0.85rem 1.25rem',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.8rem',
          color: '#64748B'
        }}>
          <div>Mostrando <strong>{filteredResidents.length}</strong> de <strong>{residents.length}</strong> residentes registrados</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: syncStatus === 'online' ? '#059669' : '#D97706', fontWeight: '600' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: syncStatus === 'online' ? '#10B981' : '#F59E0B', display: 'inline-block' }}></span>
              {syncStatus === 'online' ? 'PostgreSQL Conectado' : 'Modo Offline (Local)'}
            </span>
            <span style={{ color: '#94A3B8' }}>•</span>
            <span style={{ color: '#94A3B8' }}>Censo Activo • Casa Nostra</span>
          </div>
        </div>
      </div>
      </>)}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 5. Contenido: Compras y Gastos                              */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeAdminTab === 'compras' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ── Barra de acciones ── */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShoppingCart size={20} color="#B45309" /> Libro de Compras y Gastos
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>Registro operativo de compras, facturas e insumos de Casa Nostra.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button onClick={exportGastosCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem', borderRadius: '10px', border: '1.5px solid #107C41', background: '#FFFFFF', color: '#107C41', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}>
                <Download size={15} /> Exportar CSV
              </button>
              <button onClick={() => setIsGastoModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: '10px', border: 'none', background: '#B45309', color: '#FFFFFF', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(180,83,9,0.25)' }}>
                <Plus size={15} /> Registrar Compra
              </button>
            </div>
          </div>

          {/* ── Tarjetas de resumen ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Gasto total */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', marginBottom: '0.4rem' }}>GASTO TOTAL REGISTRADO</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1E293B' }}>${totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>{gastos.length} registros</div>
            </div>

            {/* Presupuesto mensual */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', marginBottom: '0.4rem' }}>PRESUPUESTO MENSUAL</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#94A3B8' }}>$</span>
                <input
                  type="number" min="0" value={presupuesto || ''}
                  placeholder="0.00"
                  onChange={e => { const v = parseFloat(e.target.value) || 0; setPresupuesto(v); localStorage.setItem(PRESUPUESTO_KEY, v); }}
                  style={{ width: '100%', border: 'none', fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', outline: 'none', background: 'transparent' }}
                />
              </div>
              {presupuesto > 0 && (
                <div style={{ marginTop: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginBottom: '0.25rem' }}>
                    <span>Utilizado</span>
                    <span style={{ fontWeight: '700', color: totalGastos > presupuesto ? '#EF4444' : '#059669' }}>{Math.min(100, Math.round((totalGastos / presupuesto) * 100))}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (totalGastos / presupuesto) * 100)}%`, background: totalGastos > presupuesto ? '#EF4444' : '#10B981', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Restante */}
            <div style={{ background: presupuesto > 0 && totalGastos > presupuesto ? '#FEF2F2' : '#F0FDF4', borderRadius: '16px', border: `1px solid ${presupuesto > 0 && totalGastos > presupuesto ? '#FECACA' : '#BBF7D0'}`, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', marginBottom: '0.4rem' }}>DISPONIBLE</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: presupuesto > 0 && totalGastos > presupuesto ? '#EF4444' : '#059669' }}>
                {presupuesto > 0 ? `$${Math.abs(presupuesto - totalGastos).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                {presupuesto > 0 ? (totalGastos > presupuesto ? 'Presupuesto excedido' : 'Restante del mes') : 'Fija un presupuesto'}
              </div>
            </div>
          </div>

          {/* ── Desglose por categoría ── */}
          {gastosPorCategoria.length > 0 && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#475569', marginBottom: '0.85rem' }}>DESGLOSE POR CATEGORÍA</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {gastosPorCategoria.sort((a,b) => b.total - a.total).map(cat => (
                  <div key={cat.nombre} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.82rem', color: '#475569', minWidth: '180px', flexShrink: 0 }}>{cat.nombre}</div>
                    <div style={{ flex: 1, height: '8px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${totalGastos > 0 ? (cat.total / totalGastos) * 100 : 0}%`, background: 'linear-gradient(90deg, #B45309, #D97706)', borderRadius: '99px' }} />
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1E293B', minWidth: '90px', textAlign: 'right' }}>${cat.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Filtros + Tabla historial ── */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', borderRadius: '10px', padding: '0.5rem 0.75rem', border: '1px solid #E2E8F0' }}>
                <Search size={15} color="#94A3B8" />
                <input value={gastoSearchTerm} onChange={e => setGastoSearchTerm(e.target.value)} placeholder="Buscar concepto o proveedor..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', color: '#1E293B', width: '100%' }} />
              </div>
              <select value={gastoCategoryFilter} onChange={e => setGastoCategoryFilter(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
                <option value="Todas">Todas las categorías</option>
                {CATEGORIAS_GASTO.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {filteredGastos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', fontSize: '0.88rem' }}>
                {gastos.length === 0 ? 'Aún no hay compras registradas. Presiona «Registrar Compra» para comenzar.' : 'No hay resultados con ese filtro.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', color: '#475569' }}>
                      {['Fecha', 'Concepto', 'Proveedor', 'Categoría', 'Monto', ''].map(h => (
                        <th key={h} style={{ padding: '0.65rem 0.75rem', fontWeight: '700', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGastos.map((g, i) => (
                      <tr key={g.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#64748B', whiteSpace: 'nowrap' }}>{g.fecha}</td>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: '600', color: '#1E293B' }}>{g.concepto}</td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#64748B' }}>{g.proveedor || '—'}</td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <span style={{ background: '#FEF3C7', color: '#B45309', fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>{g.categoria}</span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: '800', color: '#1E293B', whiteSpace: 'nowrap' }}>${g.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <button onClick={() => handleDeleteGasto(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0.2rem' }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#FEF3C7' }}>
                      <td colSpan={4} style={{ padding: '0.75rem', fontWeight: '800', color: '#B45309', fontSize: '0.85rem' }}>TOTAL FILTRADO</td>
                      <td style={{ padding: '0.75rem', fontWeight: '900', color: '#B45309', fontSize: '0.92rem' }}>${filteredGastos.reduce((a, g) => a + g.monto, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* ── Modal: Registrar Compra ── */}
          {isGastoModalOpen && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1E293B' }}>Registrar Compra / Gasto</h3>
                  <button onClick={() => setIsGastoModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[{ label: 'Concepto *', key: 'concepto', type: 'text', placeholder: 'Ej. Compra de pollo, gas, etc.' },
                    { label: 'Proveedor', key: 'proveedor', type: 'text', placeholder: 'Ej. Superama, Mercado Local' },
                    { label: 'Monto (MXN) *', key: 'monto', type: 'number', placeholder: '0.00' },
                    { label: 'Fecha *', key: 'fecha', type: 'date', placeholder: '' }].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#64748B', marginBottom: '0.35rem' }}>{f.label}</label>
                      <input type={f.type} value={gastoForm[f.key]} placeholder={f.placeholder}
                        onChange={e => setGastoForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#64748B', marginBottom: '0.35rem' }}>Categoría</label>
                    <select value={gastoForm.categoria} onChange={e => setGastoForm(prev => ({ ...prev, categoria: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.88rem', background: '#FFFFFF', cursor: 'pointer' }}>
                      {CATEGORIAS_GASTO.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#64748B', marginBottom: '0.35rem' }}>Notas</label>
                    <textarea value={gastoForm.notas} placeholder="Observaciones adicionales..."
                      onChange={e => setGastoForm(prev => ({ ...prev, notas: e.target.value }))}
                      rows={2} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.88rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <button onClick={handleAddGasto} disabled={!gastoForm.concepto.trim() || !gastoForm.monto}
                    style={{ padding: '0.85rem', borderRadius: '12px', border: 'none', background: !gastoForm.concepto.trim() || !gastoForm.monto ? '#E2E8F0' : '#B45309', color: !gastoForm.concepto.trim() || !gastoForm.monto ? '#94A3B8' : '#FFFFFF', fontWeight: '800', fontSize: '0.92rem', cursor: !gastoForm.concepto.trim() || !gastoForm.monto ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                    Guardar Registro
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 6. Modal: + Nuevo Residente / Editar Residente              */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isNewModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            width: '100%',
            maxWidth: '560px',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header del Modal */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  background: '#FEF3C7',
                  color: '#B45309',
                  padding: '0.5rem',
                  borderRadius: '10px'
                }}>
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1E293B' }}>
                    {editingResident ? 'Editar Ficha del Residente' : 'Registrar Nuevo Residente'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                    Información clínica y requerimientos alimentarios en Casa Nostra
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNewModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.35rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveResident} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* Fila 1: Nombre y Edad */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Nombre Completo <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Don Manuel Sánchez"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Edad
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="115"
                    value={formData.edad}
                    onChange={e => setFormData({ ...formData, edad: e.target.value })}
                    placeholder="82"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Fila 2: Habitación y Asistencia */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Habitación / Cama <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.habitacion}
                    onChange={e => setFormData({ ...formData, habitacion: e.target.value })}
                    placeholder="104-B"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Tipo de Asistencia
                  </label>
                  <select
                    value={formData.asistencia}
                    onChange={e => setFormData({ ...formData, asistencia: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      background: '#FFFFFF',
                      outline: 'none'
                    }}
                  >
                    <option value="Comedor Autónomo">Comedor Autónomo</option>
                    <option value="Comedor General Asistido">Comedor General Asistido</option>
                    <option value="En Cama / Habitación">En Cama / Habitación</option>
                  </select>
                </div>
              </div>

              {/* Fila 3: Restricciones Dietéticas / Alergias */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  Restricciones Médicas y Dietéticas
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {['Hiposódica', 'Diabético', 'Sin Lactosa', 'Sin Gluten', 'Bajo en Grasa', 'Sin Mariscos', 'Líquidos Espesados', 'Sin Azúcar'].map(tag => {
                    const active = formData.restricciones.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleRestriction(tag)}
                        style={{
                          background: active ? '#B45309' : '#F1F5F9',
                          color: active ? '#FFFFFF' : '#475569',
                          border: `1px solid ${active ? '#B45309' : '#E2E8F0'}`,
                          padding: '0.3rem 0.65rem',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {active ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fila 5: Observaciones de Deglución */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Observaciones de Deglución / Recomendación Clínica
                </label>
                <textarea
                  rows="2"
                  value={formData.observaciones}
                  onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Ej. Control de deglución por enfermería, temperatura templada..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#B45309',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(180, 83, 9, 0.25)'
                  }}
                >
                  {editingResident ? 'Guardar Cambios' : 'Registrar Residente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 6. Modal: Importar Excel (.xlsx / .xls)                    */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isImportModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            width: '100%',
            maxWidth: '640px',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            {/* Header Import */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  padding: '0.5rem',
                  borderRadius: '10px'
                }}>
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#1E293B' }}>
                    Importar Residentes desde Excel
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                    Carga masiva mediante archivo .xlsx o .xls
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsImportModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.35rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Botón Descargar Plantilla */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Info size={18} color="#B45309" />
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    ¿No tienes el formato oficial? Descarga la plantilla predeterminada.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#B45309',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <FileDown size={15} />
                  <span>Descargar Plantilla</span>
                </button>
              </div>

              {/* Zona de Drop / Selección de Archivo */}
              <div
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  border: '2px dashed #059669',
                  background: '#F0FDF4',
                  borderRadius: '14px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  color: '#059669',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <Upload size={24} />
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#065F46' }}>
                  {importFileName ? importFileName : 'Haz clic para seleccionar o arrastra tu archivo Excel'}
                </div>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: '#047857' }}>
                  Soporta formatos estándar .xlsx, .xls y .csv
                </p>
              </div>

              {importError && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={17} />
                  <span>{importError}</span>
                </div>
              )}

              {/* Previsualización de los datos leídos */}
              {importedPreview.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1E293B' }}>
                      Vista previa ({importedPreview.length} residentes detectados):
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700' }}>
                      ✓ Formato validado
                    </span>
                  </div>

                  <div style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                          <th style={{ padding: '0.5rem 0.75rem' }}>Nombre</th>
                          <th style={{ padding: '0.5rem 0.5rem' }}>Habitación</th>
                          <th style={{ padding: '0.5rem 0.75rem' }}>Restricciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importedPreview.slice(0, 10).map((r, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '0.45rem 0.75rem', fontWeight: '600' }}>{r.nombre}</td>
                            <td style={{ padding: '0.45rem 0.5rem', color: '#64748B' }}>{r.habitacion}</td>
                            <td style={{ padding: '0.45rem 0.75rem', color: '#64748B' }}>
                              {Array.isArray(r.restricciones) ? r.restricciones.join(', ') : r.restricciones}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importedPreview.length > 10 && (
                      <div style={{ padding: '0.4rem', textAlign: 'center', fontSize: '0.72rem', color: '#94A3B8', background: '#F8FAFC' }}>
                        ... y {importedPreview.length - 10} residentes más.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Acciones de Importación */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={importedPreview.length === 0}
                  onClick={handleConfirmImport}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: importedPreview.length > 0 ? '#059669' : '#CBD5E1',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: importedPreview.length > 0 ? 'pointer' : 'not-allowed',
                    boxShadow: importedPreview.length > 0 ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Check size={16} />
                  <span>Incorporar {importedPreview.length > 0 ? `${importedPreview.length} Residentes` : 'Registros'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
