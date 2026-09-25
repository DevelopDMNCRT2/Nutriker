import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  BarChart2, TrendingUp, ShoppingCart, Calendar, Info, Scale, 
  Activity, CheckCircle2, AlertTriangle, Check, Plus, Minus, 
  FileSpreadsheet, RefreshCw, Printer, Search, Sparkles, Filter, 
  ChevronRight, Utensils, Award, ShieldAlert, HeartPulse, PieChart, Download,
  Users, DollarSign, RotateCcw
} from 'lucide-react';
import { menuStore, getWeekInfoFromDate } from '../services/menuStore';
import { scaleIngredients, extractMacroNumber } from '../utils/recipeScaler';
import { programInfo } from '../data/mockData';
import WeekCalendarPicker from './WeekCalendarPicker';
import AdministracionView from './AdministracionView';
import { 
  UNIT_TYPES, 
  getUnitMetadata, 
  toBaseAmount, 
  roundNumber, 
  formatSupplyDisplay, 
  calculateSupplyYield, 
  extractDishNutritionSafe,
  getEstimatedSupplyUnitPrice
} from '../utils/suppliesBalance';

const EMPTY_DAYS = [];

export default function StatsView({ selectedWeek, initialTab = 'residentes' }) {
  const [statsWeekInfo, setStatsWeekInfo] = useState(() => {
    if (selectedWeek && typeof selectedWeek === 'number') {
      return getWeekInfoFromDate(selectedWeek);
    }
    return getWeekInfoFromDate(new Date());
  });
  const [activeMenu, setActiveMenu] = useState(() => menuStore.getActiveMenu(statsWeekInfo));
  const [census, setCensus] = useState(() => {
    const saved = localStorage.getItem('casa_nostra_active_census') || localStorage.getItem('casanostra_active_census');
    const parsed = parseInt(saved, 10);
    return (!isNaN(parsed) && parsed > 0) ? parsed : (programInfo.activeParticipantsCount || 25);
  });

  useEffect(() => {
    const handleCensusUpdate = (e) => {
      if (e?.detail?.census) {
        setCensus(e.detail.census);
      } else {
        const saved = localStorage.getItem('casa_nostra_active_census') || localStorage.getItem('casanostra_active_census');
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) setCensus(parsed);
      }
    };
    window.addEventListener('casa_nostra_census_updated', handleCensusUpdate);
    return () => window.removeEventListener('casa_nostra_census_updated', handleCensusUpdate);
  }, []);

  useEffect(() => {
    if (selectedWeek && typeof selectedWeek === 'number' && selectedWeek !== statsWeekInfo.weekNumber) {
      setStatsWeekInfo(getWeekInfoFromDate(selectedWeek));
    }
  }, [selectedWeek]);
  
  // Tab activa: 'residentes' | 'servings' | 'supplies' | 'gastos' | 'nutrition'
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Registro de raciones servidas por el chef por día
  const [servingsByDay, setServingsByDay] = useState({});
  
  // Insumos comprados/recibidos capturados por el usuario
  const [purchasedSupplies, setPurchasedSupplies] = useState({});
  
  // Modal de captura de insumos
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [supplySearchTerm, setSupplySearchTerm] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [supplyFilterStatus, setSupplyFilterStatus] = useState('all'); // 'all' | 'optimal' | 'warning' | 'alert'
  
  // Notificación temporal con cleanup seguro
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Bloquear scroll de la página de fondo mientras el modal de insumos está abierto
  useEffect(() => {
    if (isPurchaseModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isPurchaseModalOpen]);

  // Guardar censo
  const handleCensusChange = (val) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    setCensus(num);
    localStorage.setItem('casanostra_active_census', String(num));
  };

  // Inicializar raciones en blanco para obligar a la administración a capturar cantidades exactas
  const initDefaultServings = (daysList) => {
    const initial = {};
    daysList.forEach(day => {
      initial[day.dayName] = {
        optionA: '',
        optionB: '',
        savedAt: null
      };
    });
    return initial;
  };

  // Cargar Menú y Persistencia al cambiar statsWeekInfo
  useEffect(() => {
    let menu = menuStore.getActiveMenu(statsWeekInfo);
    
    if (!menu || !menu.days || menu.days.length === 0) {
      menu = {
        isPublished: false,
        weekKey: statsWeekInfo.weekKey,
        weekNumber: statsWeekInfo.weekNumber,
        dateRange: statsWeekInfo.dateRange,
        title: statsWeekInfo.title,
        days: []
      };
    }
    setActiveMenu(menu);

    // Cargar Raciones Servidas desde LocalStorage (v2 inicia en blanco)
    const savedServings = localStorage.getItem(`casanostra_servings_v2_${statsWeekInfo.weekKey}`) || localStorage.getItem(`casanostra_servings_v2_w${statsWeekInfo.weekNumber}`);
    if (savedServings) {
      try {
        setServingsByDay(JSON.parse(savedServings));
      } catch (e) {
        setServingsByDay(initDefaultServings(menu?.days || []));
      }
    } else {
      setServingsByDay(initDefaultServings(menu?.days || []));
    }

    // Cargar Insumos Comprados desde LocalStorage
    const savedPurchases = localStorage.getItem(`casanostra_purchases_${statsWeekInfo.weekKey}`) || localStorage.getItem(`casanostra_purchases_w${statsWeekInfo.weekNumber}`);
    if (savedPurchases) {
      try {
        setPurchasedSupplies(JSON.parse(savedPurchases));
      } catch (e) {
        setPurchasedSupplies({});
      }
    } else {
      setPurchasedSupplies({});
    }
  }, [statsWeekInfo]);

  // Escuchar publicaciones de menú en vivo desde Nutrióloga
  useEffect(() => {
    const handleMenuUpdate = (e) => {
      if (!e.detail || e.detail.weekKey === statsWeekInfo.weekKey || e.detail.weekNumber === statsWeekInfo.weekNumber) {
        setActiveMenu(menuStore.getActiveMenu(statsWeekInfo));
      }
    };
    window.addEventListener('royal_canin_menu_updated', handleMenuUpdate);
    return () => window.removeEventListener('royal_canin_menu_updated', handleMenuUpdate);
  }, [statsWeekInfo]);

  const days = useMemo(() => activeMenu?.days || EMPTY_DAYS, [activeMenu]);

  // Reiniciar todas las raciones a blanco
  const handleClearAllServings = () => {
    const blank = initDefaultServings(days);
    setServingsByDay(blank);
    localStorage.setItem(`casanostra_servings_v2_${statsWeekInfo.weekKey}`, JSON.stringify(blank));
    localStorage.setItem(`casanostra_servings_v2_w${statsWeekInfo.weekNumber}`, JSON.stringify(blank));
    window.dispatchEvent(new CustomEvent('casanostra_servings_updated', {
      detail: { weekKey: statsWeekInfo.weekKey, weekNumber: statsWeekInfo.weekNumber, servings: blank }
    }));
    showToast('Raciones reiniciadas en blanco para registro oficial.');
  };

  // Actualizar raciones de un día y opción
  const handleServingChange = (dayName, optionKey, delta) => {
    setServingsByDay(prev => {
      const current = prev[dayName] || { optionA: '', optionB: '' };
      const currentVal = parseInt(current[optionKey], 10) || 0;
      const newVal = Math.max(0, currentVal + delta);
      const updated = {
        ...prev,
        [dayName]: {
          ...current,
          [optionKey]: newVal,
          updatedAt: new Date().toISOString()
        }
      };
      localStorage.setItem(`casanostra_servings_v2_${statsWeekInfo.weekKey}`, JSON.stringify(updated));
      localStorage.setItem(`casanostra_servings_v2_w${statsWeekInfo.weekNumber}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('casanostra_servings_updated', {
        detail: { weekKey: statsWeekInfo.weekKey, weekNumber: statsWeekInfo.weekNumber, servings: updated }
      }));
      return updated;
    });
  };

  const handleServingDirectInput = (dayName, optionKey, value) => {
    const num = value === '' ? '' : Math.max(0, parseInt(value, 10) || 0);
    setServingsByDay(prev => {
      const current = prev[dayName] || { optionA: '', optionB: '' };
      const updated = {
        ...prev,
        [dayName]: {
          ...current,
          [optionKey]: num,
          updatedAt: new Date().toISOString()
        }
      };
      localStorage.setItem(`casanostra_servings_v2_${statsWeekInfo.weekKey}`, JSON.stringify(updated));
      localStorage.setItem(`casanostra_servings_v2_w${statsWeekInfo.weekNumber}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('casanostra_servings_updated', {
        detail: { weekKey: statsWeekInfo.weekKey, weekNumber: statsWeekInfo.weekNumber, servings: updated }
      }));
      return updated;
    });
  };

  // Helper de nutrición segura por platillo (sin inventar datos con ??)
  const getDishNutrition = (dish) => {
    return extractDishNutritionSafe(dish);
  };

  // Helper para extraer lista limpia de ingredientes de un platillo para 1 porción
  const getDishIngredientsBase = (dish) => {
    if (!dish || !dish.recipe || !dish.recipe.ingredients) return [];
    const scaled = scaleIngredients(dish.recipe.ingredients, 1);
    return scaled.map(item => {
      const meta = getUnitMetadata(item.unitBase || item.unitScaled);
      const name = (item.name || item.raw || 'Insumo').trim();
      const amount = item.amountBase ?? (item.amountScaled || 0);
      return {
        name,
        amountBase: amount,
        unitBase: item.unitBase || item.unitScaled || meta.standardUnit,
        unitMeta: meta
      };
    });
  };

  // =========================================================================
  // CÁLCULOS DINÁMICOS: Raciones, Demanda de Insumos y Balance de Aprovechamiento
  // =========================================================================

  const computedData = useMemo(() => {
    let totalServingsWeek = 0;
    let totalServingsA = 0;
    let totalServingsB = 0;

    // Acumuladores de nutrientes ponderados consumidos (solo de días con datos reales)
    let sumCaloriesConsumed = 0;
    let countCalServings = 0;
    let sumProteinConsumed = 0;
    let countProtServings = 0;
    let sumCarbsConsumed = 0;
    let countCarbServings = 0;
    let sumFatsConsumed = 0;
    let countFatServings = 0;
    let sumSodiumConsumed = 0;
    let countSodiumServings = 0;

    // Desglose nutricional por día
    const dailyNutritionSummary = [];

    // Demanda de ingredientes por insumo
    // key: nombre|tipoUnidad -> { key, name, unitType, baseUnit, standardUnit, requiredBase, dishSources }
    const suppliesMap = {};

    days.forEach(day => {
      const dayServing = servingsByDay[day.dayName] || { 
        optionA: '', 
        optionB: '' 
      };
      const servA = dayServing.optionA !== '' && dayServing.optionA !== null && dayServing.optionA !== undefined ? Number(dayServing.optionA) : 0;
      const servB = dayServing.optionB !== '' && dayServing.optionB !== null && dayServing.optionB !== undefined ? Number(dayServing.optionB) : 0;
      const totalDayServings = servA + servB;

      totalServingsWeek += totalDayServings;
      totalServingsA += servA;
      totalServingsB += servB;

      // Nutrición de platillos segura (sin inventar datos con ??)
      const nutA = getDishNutrition(day.optionA);
      const nutB = getDishNutrition(day.optionB);

      const hasCal = nutA.calories !== null || nutB.calories !== null;
      const dayCal = hasCal ? (((nutA.calories || 0) * servA) + ((nutB.calories || 0) * servB)) : null;

      const hasProt = nutA.protein !== null || nutB.protein !== null;
      const dayProt = hasProt ? (((nutA.protein || 0) * servA) + ((nutB.protein || 0) * servB)) : null;

      const hasCarbs = nutA.carbs !== null || nutB.carbs !== null;
      const dayCarbs = hasCarbs ? (((nutA.carbs || 0) * servA) + ((nutB.carbs || 0) * servB)) : null;

      const hasFats = nutA.fats !== null || nutB.fats !== null;
      const dayFats = hasFats ? (((nutA.fats || 0) * servA) + ((nutB.fats || 0) * servB)) : null;

      // El sodio solo se evalúa si los platillos servidos cuentan con el dato (no inventar 420mg)
      const hasSodium = (nutA.sodium !== null || servA === 0) && (nutB.sodium !== null || servB === 0) && (nutA.sodium !== null || nutB.sodium !== null);
      const daySod = hasSodium ? (((nutA.sodium || 0) * servA) + ((nutB.sodium || 0) * servB)) : null;

      const avgFactor = totalDayServings > 0 ? totalDayServings : 1;

      const avgCaloriesPerResident = dayCal !== null ? Math.round(dayCal / avgFactor) : null;
      const avgProteinPerResident = dayProt !== null ? roundNumber(dayProt / avgFactor, 1) : null;
      const avgCarbsPerResident = dayCarbs !== null ? roundNumber(dayCarbs / avgFactor, 1) : null;
      const avgFatsPerResident = dayFats !== null ? roundNumber(dayFats / avgFactor, 1) : null;
      const avgSodiumPerResident = daySod !== null ? Math.round(daySod / avgFactor) : null;

      if (avgCaloriesPerResident !== null) {
        sumCaloriesConsumed += dayCal;
        countCalServings += totalDayServings;
      }
      if (avgProteinPerResident !== null) {
        sumProteinConsumed += dayProt;
        countProtServings += totalDayServings;
      }
      if (avgCarbsPerResident !== null) {
        sumCarbsConsumed += dayCarbs;
        countCarbServings += totalDayServings;
      }
      if (avgFatsPerResident !== null) {
        sumFatsConsumed += dayFats;
        countFatServings += totalDayServings;
      }
      if (avgSodiumPerResident !== null) {
        sumSodiumConsumed += daySod;
        countSodiumServings += totalDayServings;
      }

      // Evaluación geriátrica rigurosa
      const isSarcopeniaSafe = avgProteinPerResident !== null ? (avgProteinPerResident >= 28) : null;
      const isHyposodicSafe = avgSodiumPerResident !== null ? (avgSodiumPerResident <= 500) : null;

      let complianceStatus = 'nodata'; // 'safe' | 'fail' | 'nodata'
      let complianceLabel = 'Sin dato';

      if (isSarcopeniaSafe === false || isHyposodicSafe === false) {
        complianceStatus = 'fail';
        complianceLabel = 'No cumple';
      } else if (isSarcopeniaSafe === true && isHyposodicSafe === true) {
        complianceStatus = 'safe';
        complianceLabel = '✓ Protegido';
      } else if (isSarcopeniaSafe === true && isHyposodicSafe === null) {
        complianceStatus = 'partial_safe';
        complianceLabel = 'Proteína OK (Sodio N/D)';
      } else {
        complianceStatus = 'nodata';
        complianceLabel = 'Sin dato';
      }

      dailyNutritionSummary.push({
        dayName: day.dayName,
        dateLabel: day.dateLabel || day.dateInfo,
        dishA: day.optionA?.name || 'Opción A',
        servingsA: servA,
        dishB: day.optionB?.name || 'Opción B',
        servingsB: servB,
        totalDayServings,
        avgCaloriesPerResident,
        avgProteinPerResident,
        avgCarbsPerResident,
        avgFatsPerResident,
        avgSodiumPerResident,
        isSarcopeniaSafe,
        isHyposodicSafe,
        complianceStatus,
        complianceLabel
      });

      // Cálculo de Insumos según raciones reales servidas con normalización de unidades
      if (servA > 0) {
        const ingsA = getDishIngredientsBase(day.optionA);
        ingsA.forEach(ing => {
          const typeKey = ing.unitMeta.type === UNIT_TYPES.OTHER ? ing.unitMeta.standardUnit : ing.unitMeta.type;
          const key = `${ing.name.toLowerCase()}|${typeKey}`;
          const amountInBase = toBaseAmount(ing.amountBase, ing.unitBase) * servA;

          if (!suppliesMap[key]) {
            suppliesMap[key] = {
              key,
              name: ing.name,
              unitType: ing.unitMeta.type,
              baseUnit: ing.unitMeta.baseUnit,
              standardUnit: ing.unitMeta.standardUnit,
              requiredBase: 0,
              dishSources: []
            };
          }
          suppliesMap[key].requiredBase += amountInBase;
          if (!suppliesMap[key].dishSources.includes(day.optionA?.name)) {
            suppliesMap[key].dishSources.push(day.optionA?.name);
          }
        });
      }

      if (servB > 0) {
        const ingsB = getDishIngredientsBase(day.optionB);
        ingsB.forEach(ing => {
          const typeKey = ing.unitMeta.type === UNIT_TYPES.OTHER ? ing.unitMeta.standardUnit : ing.unitMeta.type;
          const key = `${ing.name.toLowerCase()}|${typeKey}`;
          const amountInBase = toBaseAmount(ing.amountBase, ing.unitBase) * servB;

          if (!suppliesMap[key]) {
            suppliesMap[key] = {
              key,
              name: ing.name,
              unitType: ing.unitMeta.type,
              baseUnit: ing.unitMeta.baseUnit,
              standardUnit: ing.unitMeta.standardUnit,
              requiredBase: 0,
              dishSources: []
            };
          }
          suppliesMap[key].requiredBase += amountInBase;
          if (!suppliesMap[key].dishSources.includes(day.optionB?.name)) {
            suppliesMap[key].dishSources.push(day.optionB?.name);
          }
        });
      }
    });

    // Formatear Lista de Insumos y Balance de Aprovechamiento con helper unificado
    const suppliesList = Object.values(suppliesMap).map(item => {
      // Formato homogéneo para la cantidad requerida
      const reqDisplay = formatSupplyDisplay(item.requiredBase, item.unitType, item.standardUnit);

      // Compras capturadas (clave exacta o fallback de nombre)
      const purchasedRecord = purchasedSupplies[item.key] || purchasedSupplies[item.name.toLowerCase()];
      const purchasedAmountRaw = purchasedRecord?.amount !== undefined && purchasedRecord?.amount !== null && purchasedRecord?.amount !== ''
        ? Number(purchasedRecord.amount)
        : null;
      
      const unitPrice = purchasedRecord?.unitPrice !== undefined && purchasedRecord?.unitPrice !== null && purchasedRecord?.unitPrice !== ''
        ? Number(purchasedRecord.unitPrice)
        : null;

      const totalCost = purchasedRecord?.totalCost !== undefined && purchasedRecord?.totalCost !== null && purchasedRecord?.totalCost !== ''
        ? Number(purchasedRecord.totalCost)
        : (unitPrice !== null && purchasedAmountRaw !== null ? roundNumber(unitPrice * purchasedAmountRaw, 2) : null);
      
      const purchasedBase = purchasedAmountRaw !== null
        ? toBaseAmount(purchasedAmountRaw, reqDisplay.unit)
        : null;

      const purDisplay = formatSupplyDisplay(purchasedBase, item.unitType, reqDisplay.unit);
      const yieldCalc = calculateSupplyYield(item.requiredBase, purchasedBase);
      const wasteDisplay = formatSupplyDisplay(yieldCalc.wasteBase, item.unitType, reqDisplay.unit);

      return {
        ...item,
        purchasedAmountRaw,
        purchasedBase,
        unitPrice,
        totalCost,
        displayRequired: reqDisplay.amount,
        displayPurchased: purDisplay.amount,
        displayWaste: wasteDisplay.amount,
        displayUnit: reqDisplay.unit,
        formattedRequired: reqDisplay.formattedText,
        formattedPurchased: purDisplay.formattedText,
        formattedWaste: wasteDisplay.formattedText,
        yieldPercent: yieldCalc.yieldPercent,
        wasteAmount: yieldCalc.wasteBase !== null ? roundNumber(yieldCalc.wasteBase, 1) : null,
        status: yieldCalc.status,
        statusLabel: yieldCalc.statusLabel
      };
    }).sort((a, b) => b.requiredBase - a.requiredBase);

    // Métricas Globales de Aprovechamiento
    const capturedSupplies = suppliesList.filter(s => s.yieldPercent !== null);
    const avgYield = capturedSupplies.length > 0 
      ? Math.round(capturedSupplies.reduce((acc, curr) => acc + curr.yieldPercent, 0) / capturedSupplies.length)
      : null;

    const optimalCount = suppliesList.filter(s => s.status === 'optimal').length;
    const warningCount = suppliesList.filter(s => s.status === 'warning').length;
    const alertCount = suppliesList.filter(s => s.status === 'alert').length;
    const subcompraCount = suppliesList.filter(s => s.purchasedBase === null || s.purchasedBase < s.requiredBase).length;

    // Promedios semanales globales por residente (solo de días con información válida)
    const weeklyAvgPerResident = {
      calories: countCalServings > 0 ? Math.round(sumCaloriesConsumed / countCalServings) : null,
      protein: countProtServings > 0 ? roundNumber(sumProteinConsumed / countProtServings, 1) : null,
      carbs: countCarbServings > 0 ? roundNumber(sumCarbsConsumed / countCarbServings, 1) : null,
      fats: countFatServings > 0 ? roundNumber(sumFatsConsumed / countFatServings, 1) : null,
      sodium: countSodiumServings > 0 ? Math.round(sumSodiumConsumed / countSodiumServings) : null,
    };

    // Certificación general semanal
    let weeklyComplianceStatus = 'nodata';
    let weeklyComplianceLabel = 'Sin datos';

    const evaluatedDays = dailyNutritionSummary.filter(d => d.complianceStatus !== 'nodata');
    if (evaluatedDays.length > 0) {
      const anyFailed = evaluatedDays.some(d => d.complianceStatus === 'fail');
      const allPassed = evaluatedDays.every(d => d.complianceStatus === 'safe');
      if (anyFailed) {
        weeklyComplianceStatus = 'fail';
        weeklyComplianceLabel = 'No cumple';
      } else if (allPassed && evaluatedDays.length === days.length) {
        weeklyComplianceStatus = 'safe';
        weeklyComplianceLabel = 'Protocolo Cumplido';
      } else {
        weeklyComplianceStatus = 'partial';
        weeklyComplianceLabel = 'Parcial (Faltan datos)';
      }
    }

    return {
      totalServingsWeek,
      totalServingsA,
      totalServingsB,
      expectedWeekServings: days.length * census,
      percentA: totalServingsWeek > 0 ? Math.round((totalServingsA / totalServingsWeek) * 100) : 0,
      percentB: totalServingsWeek > 0 ? Math.round((totalServingsB / totalServingsWeek) * 100) : 0,
      dailyNutritionSummary,
      suppliesList,
      capturedCount: capturedSupplies.length,
      avgYield,
      optimalCount,
      warningCount,
      alertCount,
      subcompraCount,
      weeklyAvgPerResident,
      weeklyComplianceStatus,
      weeklyComplianceLabel,
      sumCaloriesConsumed: sumCaloriesConsumed > 0 ? Math.round(sumCaloriesConsumed) : null,
      sumProteinConsumed: sumProteinConsumed > 0 ? roundNumber(sumProteinConsumed, 1) : null,
      sumCarbsConsumed: sumCarbsConsumed > 0 ? roundNumber(sumCarbsConsumed, 1) : null,
      sumFatsConsumed: sumFatsConsumed > 0 ? roundNumber(sumFatsConsumed, 1) : null,
      sumSodiumConsumed: sumSodiumConsumed > 0 ? Math.round(sumSodiumConsumed) : null
    };
  }, [days, servingsByDay, census, purchasedSupplies]);

  // Manejador para guardar compras capturadas en el modal con clave estable y soporte de precio
  const handleSavePurchaseItem = (itemKey, field, val, unitInfo = {}) => {
    setPurchasedSupplies(prev => {
      const current = prev[itemKey] || { amount: null, unitPrice: null, totalCost: null };
      let updatedItem = { ...current };

      if (field === 'amount') {
        const num = val === '' ? null : Math.max(0, parseFloat(val) || 0);
        updatedItem.amount = num;
        if (num !== null && updatedItem.unitPrice !== null) {
          updatedItem.totalCost = roundNumber(num * updatedItem.unitPrice, 2);
          updatedItem.cost = updatedItem.totalCost;
        }
      } else if (field === 'unitPrice') {
        const price = val === '' ? null : Math.max(0, parseFloat(val) || 0);
        updatedItem.unitPrice = price;
        if (price !== null && updatedItem.amount !== null) {
          updatedItem.totalCost = roundNumber(updatedItem.amount * price, 2);
          updatedItem.cost = updatedItem.totalCost;
        }
      } else if (field === 'totalCost') {
        const total = val === '' ? null : Math.max(0, parseFloat(val) || 0);
        updatedItem.totalCost = total;
        updatedItem.cost = total;
        if (total !== null && updatedItem.amount && updatedItem.amount > 0) {
          updatedItem.unitPrice = roundNumber(total / updatedItem.amount, 2);
        }
      }

      if (unitInfo) {
        if (unitInfo.displayUnit) updatedItem.unit = unitInfo.displayUnit;
        if (unitInfo.name) updatedItem.name = unitInfo.name;
      }
      if (!updatedItem.unit && current.unit) updatedItem.unit = current.unit;
      if (!updatedItem.name && current.name) updatedItem.name = current.name;

      updatedItem.updatedAt = new Date().toISOString();

      const updated = {
        ...prev,
        [itemKey]: updatedItem
      };
      localStorage.setItem(`casanostra_purchases_${statsWeekInfo.weekKey}`, JSON.stringify(updated));
      localStorage.setItem(`casanostra_purchases_w${statsWeekInfo.weekNumber}`, JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('casanostra_purchases_updated'));
      }
      return updated;
    });
  };

  const handleClearPurchases = () => {
    setPurchasedSupplies({});
    localStorage.removeItem(`casanostra_purchases_${statsWeekInfo.weekKey}`);
    localStorage.removeItem(`casanostra_purchases_w${statsWeekInfo.weekNumber}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('casanostra_purchases_updated'));
    }
    showToast('Se limpiaron los registros de compras capturadas.');
  };

  // Cálculo del costo total de facturas para la semana activa considerando la unidad de medida
  const currentWeekInvoiceTotal = useMemo(() => {
    let sum = 0;
    Object.entries(purchasedSupplies).forEach(([key, item]) => {
      if (!item) return;
      const totalCost = item.totalCost !== undefined && item.totalCost !== null ? item.totalCost : item.cost;
      if (totalCost !== undefined && totalCost !== null && !isNaN(totalCost)) {
        sum += parseFloat(totalCost);
      } else if (item.amount && !isNaN(item.amount) && item.amount > 0) {
        if (item.unitPrice !== undefined && item.unitPrice !== null && !isNaN(item.unitPrice)) {
          sum += parseFloat(item.amount) * parseFloat(item.unitPrice);
        } else {
          const matchingSupply = computedData?.suppliesList?.find(s => s.key === key || s.name.toLowerCase() === key.toLowerCase());
          const displayUnit = item.unit || matchingSupply?.displayUnit || (key.includes('volume') ? 'L' : (key.includes('piece') ? 'pza' : (item.amount >= 100 ? 'g' : 'kg')));
          const unitType = matchingSupply?.unitType || (displayUnit === 'g' || displayUnit === 'kg' ? 'mass' : (displayUnit === 'pza' ? 'piece' : 'volume'));
          const itemName = item.name || matchingSupply?.name || key.split('|')[0];
          const p = getEstimatedSupplyUnitPrice(itemName, unitType, displayUnit);
          sum += item.amount * p;
        }
      }
    });
    return roundNumber(sum, 2) || 0;
  }, [purchasedSupplies, computedData]);

  // Filtrado de insumos con soporte para subcompra / faltante
  const filteredSupplies = computedData.suppliesList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(supplySearchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (supplyFilterStatus === 'all') return true;
    if (supplyFilterStatus === 'subcompra') {
      return item.purchasedBase === null || item.purchasedBase < item.requiredBase;
    }
    return item.status === supplyFilterStatus;
  });

  // Filtrado de insumos dentro del modal de captura
  const modalFilteredSupplies = computedData.suppliesList.filter(item =>
    item.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
  );

  // Manejo de impresión acotada únicamente a esta vista para no afectar al resto de la aplicación
  const handlePrint = () => {
    document.body.classList.add('printing-casanostra-report');
    const cleanup = () => {
      document.body.classList.remove('printing-casanostra-report');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 2500);
  };

  // Exportar Reporte Estructurado y Compacto en Formato CSV (.csv) con soporte UTF-8 BOM
  const exportToCSV = () => {
    try {
      const csvLines = [];

      // Encabezados limpios y compactos idénticos a la tabla del sistema
      const nutritionHeaders = [
        "Día", "Fecha", "Platillo Principal (A)", "Platillo Ligero (B)", "Raciones", 
        "Calorías (kcal)", "Proteína (g)", "Carbohidratos (g)", "Lípidos (g)", 
        "Sodio (mg)", "Evaluación Geriátrica"
      ];
      csvLines.push(nutritionHeaders.map(h => `"${h}"`).join(','));

      // 7 días del ciclo de menú
      computedData.dailyNutritionSummary.forEach(item => {
        const dishAText = item.dishA ? `${item.dishA} (${item.servingsA})` : `Opción A (${item.servingsA})`;
        const dishBText = item.dishB ? `${item.dishB} (${item.servingsB})` : `Opción B (${item.servingsB})`;
        const row = [
          `"${item.dayName}"`,
          `"${item.dateLabel}"`,
          `"${dishAText.replace(/"/g, '""')}"`,
          `"${dishBText.replace(/"/g, '""')}"`,
          item.totalDayServings,
          item.avgCaloriesPerResident !== null ? item.avgCaloriesPerResident : 'N/D',
          item.avgProteinPerResident !== null ? item.avgProteinPerResident : 'N/D',
          item.avgCarbsPerResident !== null ? item.avgCarbsPerResident : 'N/D',
          item.avgFatsPerResident !== null ? item.avgFatsPerResident : 'N/D',
          item.avgSodiumPerResident !== null ? item.avgSodiumPerResident : 'N/D',
          `"${item.complianceLabel}"`
        ];
        csvLines.push(row.join(','));
      });

      // Fila de Promedio Diario por Residente
      const avgRow = [
        '"PROMEDIO DIARIO"',
        '""',
        `"A: ${Math.round(computedData.totalServingsA / (computedData.dailyNutritionSummary.length || 7))} rac"`,
        `"B: ${Math.round(computedData.totalServingsB / (computedData.dailyNutritionSummary.length || 7))} rac"`,
        census,
        computedData.weeklyAvgPerResident.calories !== null ? computedData.weeklyAvgPerResident.calories : 'N/D',
        computedData.weeklyAvgPerResident.protein !== null ? computedData.weeklyAvgPerResident.protein : 'N/D',
        computedData.weeklyAvgPerResident.carbs !== null ? computedData.weeklyAvgPerResident.carbs : 'N/D',
        computedData.weeklyAvgPerResident.fats !== null ? computedData.weeklyAvgPerResident.fats : 'N/D',
        computedData.weeklyAvgPerResident.sodium !== null ? computedData.weeklyAvgPerResident.sodium : 'N/D',
        `"${computedData.weeklyComplianceLabel}"`
      ];
      csvLines.push(avgRow.join(','));

      // Fila de Totales Acumulados de Cocina
      const totalRow = [
        '"TOTAL SEMANAL"',
        '""',
        `"${computedData.totalServingsA} raciones"`,
        `"${computedData.totalServingsB} raciones"`,
        computedData.totalServingsWeek,
        computedData.sumCaloriesConsumed !== null ? computedData.sumCaloriesConsumed : 'N/D',
        computedData.sumProteinConsumed !== null ? computedData.sumProteinConsumed : 'N/D',
        computedData.sumCarbsConsumed !== null ? computedData.sumCarbsConsumed : 'N/D',
        computedData.sumFatsConsumed !== null ? computedData.sumFatsConsumed : 'N/D',
        computedData.sumSodiumConsumed !== null ? computedData.sumSodiumConsumed : 'N/D',
        '"Servicio Completo"'
      ];
      csvLines.push(totalRow.join(','));

      // Byte Order Mark (BOM) UTF-8 para garantizar apertura nativa sin errores de caracteres en Microsoft Excel y Numbers
      const csvContent = "\uFEFF" + csvLines.join("\r\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Casa_Nostra_Resumen_Nutricional_Semana_${activeMenu?.weekNumber || selectedWeek}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Reporte CSV (.csv) descargado exitosamente.');
    } catch (err) {
      console.error('Error generando CSV:', err);
      showToast('Error al exportar archivo CSV.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '5rem', color: '#1E293B' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#1E293B',
          color: '#FFFFFF',
          padding: '0.85rem 1.4rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.9rem',
          fontWeight: '600',
          border: '1px solid #334155',
          animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle2 size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Selector de Calendario Semanal Sincronizado */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <WeekCalendarPicker
          selectedWeekInfo={statsWeekInfo}
          onChangeWeek={setStatsWeekInfo}
          onSelectWeek={setStatsWeekInfo}
          label="Semana del Servicio para Reportes e Insumos:"
        />
      </div>

      {/* Header Principal con Controles de Censo y Acciones Rápidas */}
      <div className="no-print" style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '1.75rem',
        boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)',
        marginBottom: '1.5rem',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ background: '#FEF3C7', color: '#B45309', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                CASA NOSTRA • GERIATRÍA
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Semana {statsWeekInfo.weekNumber} ({statsWeekInfo.dateRange})
              </span>
            </div>
            <h2 style={{ margin: '0.4rem 0 0.2rem 0', fontSize: '1.55rem', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={26} color="#B45309" /> Reportes, Raciones y Control de Insumos
            </h2>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.92rem' }}>
              Control operativo de raciones del chef, captura de compras de insumos con balance de aprovechamiento y resumen nutricional.
            </p>
          </div>

          {/* Selector de Censo Activo */}
          <div style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            padding: '0.85rem 1.25rem',
            borderRadius: '16px',
            border: '1px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 2px 4px rgba(180, 83, 9, 0.05)'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase' }}>Censo Activo Residencia</div>
              <div style={{ fontSize: '0.85rem', color: '#78350F', fontWeight: '500' }}>Residentes en Comedor</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input 
                type="number" 
                value={census} 
                onChange={e => handleCensusChange(e.target.value)}
                style={{
                  width: '65px',
                  padding: '0.45rem',
                  borderRadius: '10px',
                  border: '2px solid #F59E0B',
                  textAlign: 'center',
                  fontWeight: '800',
                  fontSize: '1.1rem',
                  color: '#78350F',
                  background: '#FFFFFF',
                  outline: 'none'
                }}
                min="1"
                max="200"
              />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#B45309' }}>camas</span>
            </div>
          </div>
        </div>

        {/* Sub-Navegación por Pestañas Compacta (5 Pestañas Integradas) */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid #F1F5F9'
        }}>
          {/* Tab 1: Censo de Residentes */}
          <button
            onClick={() => setActiveTab('residentes')}
            style={{
              flex: '1 1 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.42rem 0.65rem',
              borderRadius: '8px',
              border: activeTab === 'residentes' ? '2px solid #7C3AED' : '1px solid #E2E8F0',
              background: activeTab === 'residentes' ? '#F5F3FF' : '#FFFFFF',
              color: activeTab === 'residentes' ? '#6D28D9' : '#64748B',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Users size={14} color={activeTab === 'residentes' ? '#7C3AED' : '#64748B'} />
            <span>1. Residentes</span>
            <span style={{
              background: activeTab === 'residentes' ? '#7C3AED' : '#F1F5F9',
              color: activeTab === 'residentes' ? '#FFFFFF' : '#64748B',
              fontSize: '0.68rem',
              padding: '0.05rem 0.35rem',
              borderRadius: '999px',
              fontWeight: '800'
            }}>
              {census}
            </span>
          </button>

          {/* Tab 2: Raciones del Chef */}
          <button
            onClick={() => setActiveTab('servings')}
            style={{
              flex: '1 1 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.42rem 0.65rem',
              borderRadius: '8px',
              border: activeTab === 'servings' ? '2px solid #B45309' : '1px solid #E2E8F0',
              background: activeTab === 'servings' ? '#FEF3C7' : '#FFFFFF',
              color: activeTab === 'servings' ? '#92400E' : '#64748B',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Utensils size={14} color={activeTab === 'servings' ? '#B45309' : '#64748B'} />
            <span>2. Raciones Chef</span>
            <span style={{
              background: activeTab === 'servings' ? '#B45309' : '#F1F5F9',
              color: activeTab === 'servings' ? '#FFFFFF' : '#64748B',
              fontSize: '0.68rem',
              padding: '0.05rem 0.35rem',
              borderRadius: '999px',
              fontWeight: '800'
            }}>
              {computedData.totalServingsWeek}
            </span>
          </button>

          {/* Tab 3: Insumos de Cocina */}
          <button
            onClick={() => setActiveTab('supplies')}
            style={{
              flex: '1 1 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.42rem 0.65rem',
              borderRadius: '8px',
              border: activeTab === 'supplies' ? '2px solid #10B981' : '1px solid #E2E8F0',
              background: activeTab === 'supplies' ? '#ECFDF5' : '#FFFFFF',
              color: activeTab === 'supplies' ? '#065F46' : '#64748B',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Scale size={14} color={activeTab === 'supplies' ? '#10B981' : '#64748B'} />
            <span>3. Insumos Cocina</span>
            {computedData.avgYield !== null && (
              <span style={{
                background: computedData.avgYield >= 85 ? '#10B981' : '#F59E0B',
                color: '#FFFFFF',
                fontSize: '0.68rem',
                padding: '0.05rem 0.35rem',
                borderRadius: '999px',
                fontWeight: '800'
              }}>
                {computedData.avgYield}%
              </span>
            )}
          </button>

          {/* Tab 4: Gastos y Presupuesto */}
          <button
            onClick={() => setActiveTab('gastos')}
            style={{
              flex: '1 1 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.42rem 0.65rem',
              borderRadius: '8px',
              border: activeTab === 'gastos' ? '2px solid #EA580C' : '1px solid #E2E8F0',
              background: activeTab === 'gastos' ? '#FFF7ED' : '#FFFFFF',
              color: activeTab === 'gastos' ? '#C2410C' : '#64748B',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <DollarSign size={14} color={activeTab === 'gastos' ? '#EA580C' : '#64748B'} />
            <span>4. Gastos y Presupuesto</span>
          </button>

          {/* Tab 5: Reportes Nutricionales */}
          <button
            onClick={() => setActiveTab('nutrition')}
            style={{
              flex: '1 1 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.42rem 0.65rem',
              borderRadius: '8px',
              border: activeTab === 'nutrition' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
              background: activeTab === 'nutrition' ? '#EFF6FF' : '#FFFFFF',
              color: activeTab === 'nutrition' ? '#1E40AF' : '#64748B',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <HeartPulse size={14} color={activeTab === 'nutrition' ? '#3B82F6' : '#64748B'} />
            <span>5. Nutrición</span>
            <span style={{
              background: activeTab === 'nutrition' ? '#3B82F6' : '#F1F5F9',
              color: activeTab === 'nutrition' ? '#FFFFFF' : '#64748B',
              fontSize: '0.68rem',
              padding: '0.05rem 0.35rem',
              borderRadius: '999px',
              fontWeight: '800'
            }}>
              {computedData.weeklyAvgPerResident.calories} kcal
            </span>
          </button>
        </div>
      </div>

      {/* 1. SECCIÓN: CENSO DE RESIDENTES (INDEPENDIENTE DEL MENÚ) */}
      {activeTab === 'residentes' && (
        <div style={{ marginTop: '0.5rem' }}>
          <AdministracionView hideHeader={true} forcedTab="residentes" />
        </div>
      )}

      {/* 4. SECCIÓN: GASTOS Y PRESUPUESTO OPERATIVO (INDEPENDIENTE DEL MENÚ) */}
      {activeTab === 'gastos' && (
        <div style={{ marginTop: '0.5rem' }}>
          <AdministracionView hideHeader={true} forcedTab="compras" />
        </div>
      )}

      {/* 2, 3, 5: SECCIONES OPERATIVAS QUE DEPENDEN DEL MENÚ DE LA NUTRIÓLOGA */}
      {(activeTab === 'servings' || activeTab === 'supplies' || activeTab === 'nutrition') && (
        days.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)',
            maxWidth: '650px',
            margin: '2rem auto'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#B45309',
              margin: '0 auto 1.25rem'
            }}>
              <Utensils size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.5rem' }}>
              Sin Menú Publicado para Esta Semana
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
              La Nutrióloga aún no ha programado ni certificado platillos para la semana del <strong>{statsWeekInfo.dateRange}</strong>.
              Una vez que la Nutrióloga publique el menú en el sistema, aquí se calcularán automáticamente las raciones del chef, la lista de insumos de compras y el balance nutricional.
            </p>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* SECCIÓN 2: CONTROL DE RACIONES SERVIDAS POR EL CHEF                       */}
            {/* ========================================================================= */}
            {activeTab === 'servings' && (
        <section style={{ marginBottom: '2.5rem' }}>
          
          {/* Tarjeta de Resumen y Métricas de Raciones */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Utensils size={20} color="#B45309" /> Registro Diario de Raciones Servidas por el Chef
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                  Ajuste en tiempo real de comensales que optaron por Menú Tradicional vs. Textura Suave/Colación.
                </p>
              </div>

              {/* Indicador de captura manual de raciones */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: '#B45309', background: '#FEF3C7', padding: '0.4rem 0.85rem', borderRadius: '8px', fontWeight: '700', border: '1px solid #FDE68A' }}>
                  Captura Manual por Platillo
                </span>
                <button
                  onClick={handleClearAllServings}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  title="Reiniciar todos los campos numéricos en blanco para obligar nuevo registro"
                >
                  <RotateCcw size={13} />
                  Reiniciar a blanco
                </button>
              </div>
            </div>

            {/* Grid de KPIs de Raciones */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Total Raciones Servidas</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: '900', color: '#B45309' }}>{computedData.totalServingsWeek}</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>de {computedData.expectedWeekServings} planificadas</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: computedData.totalServingsWeek >= computedData.expectedWeekServings ? '#10B981' : '#F59E0B', fontWeight: '700', marginTop: '0.3rem' }}>
                  {computedData.totalServingsWeek === computedData.expectedWeekServings ? '✓ 100% Cobertura exacta del censo' : `${Math.round((computedData.totalServingsWeek / (computedData.expectedWeekServings || 1)) * 100)}% de asistencia registrada`}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Opción A (Menú Principal)</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1E293B' }}>{computedData.totalServingsA}</span>
                  <span style={{ fontSize: '0.85rem', color: '#B45309', fontWeight: '800' }}>({computedData.percentA}%)</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem' }}>Textura regular y fácil masticación</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Opción B (Suave / Suplementada)</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: '900', color: '#2563EB' }}>{computedData.totalServingsB}</span>
                  <span style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: '800' }}>({computedData.percentB}%)</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem' }}>Purés, papillas o colaciones proteicas</div>
              </div>
            </div>
          </div>

          {/* Días con Controles de Raciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {days.map((day, idx) => {
              const dayServing = servingsByDay[day.dayName] || { 
                optionA: '', 
                optionB: '' 
              };
              const servA = dayServing.optionA !== undefined && dayServing.optionA !== null ? dayServing.optionA : '';
              const servB = dayServing.optionB !== undefined && dayServing.optionB !== null ? dayServing.optionB : '';
              const hasCapture = servA !== '' || servB !== '';
              const numA = parseInt(servA, 10) || 0;
              const numB = parseInt(servB, 10) || 0;
              const totalDay = numA + numB;
              const diffFromCensus = totalDay - census;

              const nutA = getDishNutrition(day.optionA);
              const nutB = getDishNutrition(day.optionB);

              return (
                <div 
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '1.25rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Encabezado del Día */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ background: '#B45309', color: '#FFFFFF', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem' }}>
                        {idx + 1}
                      </span>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: '#1E293B' }}>{day.dayName}</strong>
                        <span style={{ fontSize: '0.82rem', color: '#64748B', marginLeft: '0.5rem' }}>
                          {day.dateLabel || day.dateInfo || `Día ${idx + 1}`}
                        </span>
                      </div>
                    </div>

                    {/* Resumen y estado del día */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        background: !hasCapture ? '#F1F5F9' : (diffFromCensus === 0 ? '#ECFDF5' : (diffFromCensus > 0 ? '#EFF6FF' : '#FEF3C7')),
                        color: !hasCapture ? '#64748B' : (diffFromCensus === 0 ? '#065F46' : (diffFromCensus > 0 ? '#1E40AF' : '#92400E')),
                        border: !hasCapture ? '1px solid #CBD5E1' : (diffFromCensus === 0 ? '1px solid #A7F3D0' : (diffFromCensus > 0 ? '1px solid #BFDBFE' : '1px solid #FDE68A'))
                      }}>
                        {!hasCapture && 'Pendiente de capturar'}
                        {hasCapture && diffFromCensus === 0 && `✓ Cubierto exacto: ${totalDay} raciones`}
                        {hasCapture && diffFromCensus > 0 && `+${diffFromCensus} raciones extra (${totalDay} / ${census})`}
                        {hasCapture && diffFromCensus < 0 && `${diffFromCensus} raciones (${totalDay} / ${census})`}
                      </span>
                    </div>
                  </div>

                  {/* Fila de Platillos A y B con Controles de Raciones del Chef */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                    
                    {/* Tarjeta Opción A */}
                    <div style={{
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '14px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            OPCIÓN A • {day.optionA?.category || 'Menú Tradicional'}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#92400E' }}>
                            {hasCapture && totalDay > 0 && servA !== '' ? `${Math.round((numA / totalDay) * 100)}% preferencia` : '---'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.98rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.4rem', lineHeight: '1.3' }}>
                          {day.optionA?.name || 'Platillo A'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#78350F', display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
                          <span><strong>{nutA.calories}</strong> kcal</span>
                          <span>•</span>
                          <span><strong>{nutA.protein}g</strong> prot</span>
                          <span>•</span>
                          <span><strong>{nutA.sodium}mg</strong> sodio</span>
                        </div>
                      </div>

                      {/* Controles de Raciones Opción A */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#78350F' }}>Raciones Servidas:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleServingChange(day.dayName, 'optionA', -1)}
                            style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                          >
                            <Minus size={13} />
                          </button>
                          <input 
                            type="number"
                            value={servA}
                            placeholder="0"
                            onChange={(e) => handleServingDirectInput(day.dayName, 'optionA', e.target.value)}
                            style={{ width: '50px', padding: '0.25rem', borderRadius: '6px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: '800', fontSize: '0.95rem', color: '#1E293B' }}
                            min="0"
                          />
                          <button
                            onClick={() => handleServingChange(day.dayName, 'optionA', 1)}
                            style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #B45309', background: '#B45309', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta Opción B */}
                    <div style={{
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '14px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            OPCIÓN B • {day.optionB?.category || 'Suave / Papilla'}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1E40AF' }}>
                            {hasCapture && totalDay > 0 && servB !== '' ? `${Math.round((numB / totalDay) * 100)}% preferencia` : '---'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.98rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.4rem', lineHeight: '1.3' }}>
                          {day.optionB?.name || 'Platillo B'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#1E40AF', display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
                          <span><strong>{nutB.calories}</strong> kcal</span>
                          <span>•</span>
                          <span><strong>{nutB.protein}g</strong> prot</span>
                          <span>•</span>
                          <span><strong>{nutB.sodium}mg</strong> sodio</span>
                        </div>
                      </div>

                      {/* Controles de Raciones Opción B */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1E40AF' }}>Raciones Servidas:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleServingChange(day.dayName, 'optionB', -1)}
                            style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                          >
                            <Minus size={13} />
                          </button>
                          <input 
                            type="number"
                            value={servB}
                            placeholder="0"
                            onChange={(e) => handleServingDirectInput(day.dayName, 'optionB', e.target.value)}
                            style={{ width: '50px', padding: '0.25rem', borderRadius: '6px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: '800', fontSize: '0.95rem', color: '#1E293B' }}
                            min="0"
                          />
                          <button
                            onClick={() => handleServingChange(day.dayName, 'optionB', 1)}
                            style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #2563EB', background: '#2563EB', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 2: CAPTURA Y BALANCE DE APROVECHAMIENTO DE INSUMOS                */}
      {/* ========================================================================= */}
      {activeTab === 'supplies' && (
        <section style={{ marginBottom: '2.5rem' }}>
          
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Scale size={20} color="#10B981" /> Balance de Aprovechamiento y Mermas de Insumos
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                  Comparación entre el requerimiento teórico derivado de las raciones servidas vs. compras reales capturadas.
                </p>
              </div>

              {/* Acciones de Insumos */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  style={{
                    background: '#10B981',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '0.45rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <ShoppingCart size={15} /> Capturar Factura / Entradas
                </button>
                {computedData.capturedCount > 0 && (
                  <button
                    onClick={handleClearPurchases}
                    style={{
                      background: 'transparent',
                      border: '1px solid #CBD5E1',
                      color: '#64748B',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Tarjetas KPI de Aprovechamiento */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              
              <div style={{ background: '#ECFDF5', padding: '1.25rem', borderRadius: '16px', border: '1px solid #A7F3D0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#065F46', textTransform: 'uppercase' }}>
                  Índice Global de Aprovechamiento
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.3rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: '900', color: '#065F46' }}>
                    {computedData.avgYield !== null ? `${computedData.avgYield}%` : '---'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#047857', fontWeight: '600' }}>de rendimiento</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#065F46', marginTop: '0.3rem' }}>
                  {computedData.avgYield !== null 
                    ? (computedData.avgYield >= 85 ? '✓ Rendimiento culinario en rango óptimo' : '⚠️ Atención: margen de merma elevado')
                    : 'Sin facturas capturadas aún'}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                  Insumos Auditados
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.3rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: '900', color: '#1E293B' }}>
                    {computedData.capturedCount}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>de {computedData.suppliesList.length} insumos</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem' }}>
                  {computedData.optimalCount} óptimos • {computedData.warningCount} alerta • {computedData.alertCount} críticos
                </div>
              </div>

              <div style={{ background: '#FFFBEB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase' }}>
                  Merma Culinaria Promedio
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.3rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: '900', color: '#B45309' }}>
                    {computedData.avgYield !== null ? `${Math.max(0, 100 - computedData.avgYield)}%` : '---'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#78350F' }}>merma estimada</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#78350F', marginTop: '0.3rem' }}>
                  Tolerancia máxima geriátrica: 15%
                </div>
              </div>

            </div>

            {/* Filtros y Buscador de Insumos */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.35rem 0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', width: '280px' }}>
                <Search size={16} color="#64748B" />
                <input 
                  type="text"
                  placeholder="Buscar insumo (ej. pollo, arroz)..."
                  value={supplySearchTerm}
                  onChange={e => setSupplySearchTerm(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Filter size={15} color="#64748B" />
                <button
                  onClick={() => setSupplyFilterStatus('all')}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: supplyFilterStatus === 'all' ? '#1E293B' : '#FFFFFF',
                    color: supplyFilterStatus === 'all' ? '#FFFFFF' : '#64748B',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Todos ({computedData.suppliesList.length})
                </button>
                <button
                  onClick={() => setSupplyFilterStatus('optimal')}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #A7F3D0',
                    background: supplyFilterStatus === 'optimal' ? '#10B981' : '#FFFFFF',
                    color: supplyFilterStatus === 'optimal' ? '#FFFFFF' : '#065F46',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Óptimos ({computedData.optimalCount})
                </button>
                <button
                  onClick={() => setSupplyFilterStatus('warning')}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #FDE68A',
                    background: supplyFilterStatus === 'warning' ? '#F59E0B' : '#FFFFFF',
                    color: supplyFilterStatus === 'warning' ? '#FFFFFF' : '#92400E',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Moderados ({computedData.warningCount})
                </button>
                <button
                  onClick={() => setSupplyFilterStatus('subcompra')}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #FECACA',
                    background: supplyFilterStatus === 'subcompra' ? '#DC2626' : '#FFFFFF',
                    color: supplyFilterStatus === 'subcompra' ? '#FFFFFF' : '#991B1B',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  title="Insumos con faltante o subcompra respecto al requerimiento teórico"
                >
                  <AlertTriangle size={13} />
                  Faltante ({computedData.subcompraCount})
                </button>
              </div>
            </div>

            {/* Tabla Detallada de Insumos y Rendimiento */}
            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '14px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>Insumo / Ingrediente</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>Requerido Teórico</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>Entrada / Comprado</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>Precio / Costo</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>% Aprovechamiento</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>Merma / Balance</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>Estado Operativo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSupplies.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                        No se encontraron insumos con el filtro aplicado.
                      </td>
                    </tr>
                  ) : (
                    filteredSupplies.map((item) => (
                      <tr key={item.key || item.name} style={{ borderBottom: '1px solid #F1F5F9', background: '#FFFFFF' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: '700', color: '#1E293B' }}>{item.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {item.dishSources?.slice(0, 2).join(', ')}
                            {item.dishSources?.length > 2 ? '...' : ''}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1E293B' }}>
                          {item.formattedRequired}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {item.purchasedBase !== null ? (
                            <span style={{ fontWeight: '700', color: '#065F46' }}>
                              {item.formattedPurchased}
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sin capturar</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {item.unitPrice !== null ? (
                            <div>
                              <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.85rem' }}>
                                ${Number(item.unitPrice).toFixed(2)} <span style={{ fontSize: '0.72rem', color: '#64748B' }}>/ {item.displayUnit}</span>
                              </div>
                              {item.totalCost !== null && (
                                <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: '600' }}>
                                  Total: ${Number(item.totalCost).toFixed(2)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '0.78rem', fontStyle: 'italic' }}>Sin registrar</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {item.yieldPercent !== null ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '60px', background: '#E2E8F0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${Math.min(100, item.yieldPercent)}%`,
                                  background: item.status === 'optimal' ? '#10B981' : (item.status === 'warning' ? '#F59E0B' : '#EF4444'),
                                  height: '100%'
                                }} />
                              </div>
                              <span style={{ fontWeight: '800', color: item.status === 'optimal' ? '#065F46' : (item.status === 'warning' ? '#92400E' : '#B91C1C') }}>
                                {item.yieldPercent}%
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>---</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {item.displayWaste !== null ? (
                            <span style={{ fontSize: '0.8rem', color: item.displayWaste >= 0 ? '#64748B' : '#EF4444' }}>
                              {item.displayWaste > 0 ? `+${item.formattedWaste} merma` : (item.displayWaste === 0 ? '0 merma' : `${item.formattedWaste} faltante`)}
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>---</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            background: item.status === 'optimal' ? '#ECFDF5' : (item.status === 'warning' ? '#FEF3C7' : (item.status === 'alert' ? '#FEF2F2' : '#F1F5F9')),
                            color: item.status === 'optimal' ? '#065F46' : (item.status === 'warning' ? '#92400E' : (item.status === 'alert' ? '#991B1B' : '#64748B'))
                          }}>
                            {item.statusLabel}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 3: RESUMEN DE TABLAS NUTRICIONALES CONSUMIDAS                     */}
      {/* ========================================================================= */}
      {activeTab === 'nutrition' && (
        <section style={{ marginBottom: '2.5rem' }}>
          
          {/* Contenedor Exclusivo de Ficha Clínica Casa Nostra */}
          <div id="casanostra-printable-summary" style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem'
          }}>
            
            {/* ENCABEZADO FORMAL PARA IMPRESIÓN / PDF (CASA NOSTRA) */}
            <div className="print-only" style={{ marginBottom: '1.75rem', borderBottom: '2.5px solid #B45309', paddingBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '1.7rem', fontWeight: '900', color: '#B45309', letterSpacing: '-0.5px' }}>
                    CASA NOSTRA
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', marginTop: '0.15rem' }}>
                    Residencia de Mayores • Nutrición Geriátrica y Dietética Clínica
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>
                    Ficha Técnica de Control Nutricional y Prevención de Sarcopenia
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#475569', background: '#FEF3C7', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                  <div style={{ fontWeight: '800', color: '#92400E', fontSize: '0.88rem' }}>RESUMEN CLÍNICO SEMANAL</div>
                  <div><strong>Semana:</strong> {activeMenu?.weekNumber || selectedWeek} ({activeMenu?.dateRange || 'Ciclo Operativo'})</div>
                  <div><strong>Censo Comedor:</strong> {census} Residentes Activos</div>
                  <div><strong>Emisión:</strong> {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>
            </div>

            {/* ENCABEZADO WEB (visible en pantalla, oculto al imprimir) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ background: '#FEF3C7', color: '#B45309', fontSize: '0.72rem', fontWeight: '800', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                    CASA NOSTRA
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Ficha Nutricional Semanal</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HeartPulse size={20} color="#3B82F6" /> Resumen de Tablas Nutricionales Consumidas
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                  Consolidado ponderado según las raciones efectivamente servidas por el chef en Casa Nostra.
                </p>
              </div>

              {/* Botones de Acción */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={exportToCSV}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #107C41',
                    color: '#107C41',
                    padding: '0.55rem 0.95rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 1px 3px rgba(16, 124, 65, 0.1)'
                  }}
                  title="Descargar reporte estructurado en formato CSV (.csv)"
                >
                  <Download size={15} /> Exportar CSV
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    background: '#B45309',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '0.55rem 1.15rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 2px 6px rgba(180, 83, 9, 0.25)'
                  }}
                  title="Exportar resumen clínico a PDF"
                >
                  <Printer size={16} /> Exportar a PDF
                </button>
              </div>
            </div>

            {/* Aviso si se muestra plantilla de referencia sin menú oficial */}
            {activeMenu?.isTemplate && (
              <div style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.82rem',
                color: '#92400E',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Info size={16} color="#B45309" />
                <span>
                  <strong>Plantilla de referencia:</strong> La Semana {selectedWeek} aún no tiene un menú oficial programado en el sistema. Los platillos y cálculos corresponden al ciclo base referencial.
                </span>
              </div>
            )}

            {/* Tarjetas de Metas Geriátricas (Visibles en pantalla, ocultas al imprimir para que el PDF sea 100% tabular) */}
            <div className="printable-cards-grid no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              
              {/* Meta Proteica */}
              <div style={{ background: '#FFFBEB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #FDE68A' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase' }}>
                    Prevención de Sarcopenia (Proteína)
                  </span>
                  <Award size={16} color="#B45309" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: '900', color: '#78350F' }}>
                    {computedData.weeklyAvgPerResident.protein !== null ? `${computedData.weeklyAvgPerResident.protein}g` : 'N/D'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#B45309' }}>por residente / comida</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: computedData.weeklyAvgPerResident.protein >= 28 ? '#065F46' : '#92400E', fontWeight: '700', marginTop: '0.4rem' }}>
                  {computedData.weeklyAvgPerResident.protein === null
                    ? 'Sin datos de proteína suficientes para evaluar la semana.'
                    : computedData.weeklyAvgPerResident.protein >= 28
                      ? '✓ Meta cumplida (≥ 28g). Aporte suficiente para síntesis muscular geriátrica.'
                      : '⚠️ Por debajo de la meta geriátrica (< 28g). Requiere ajuste proteico.'}
                </div>
              </div>

              {/* Meta Hiposódica */}
              <div style={{ background: '#ECFDF5', padding: '1.25rem', borderRadius: '16px', border: '1px solid #A7F3D0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#065F46', textTransform: 'uppercase' }}>
                    Protocolo Hiposódico (Sodio)
                  </span>
                  <CheckCircle2 size={16} color="#10B981" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: '900', color: '#065F46' }}>
                    {computedData.weeklyAvgPerResident.sodium !== null ? `${computedData.weeklyAvgPerResident.sodium}mg` : 'N/D'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#047857' }}>por ración servida</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: (computedData.weeklyAvgPerResident.sodium !== null && computedData.weeklyAvgPerResident.sodium <= 500) ? '#065F46' : '#92400E', fontWeight: '700', marginTop: '0.4rem' }}>
                  {computedData.weeklyAvgPerResident.sodium === null
                    ? 'Sin datos de sodio registrados en los platillos de este ciclo.'
                    : computedData.weeklyAvgPerResident.sodium <= 500
                      ? '✓ Nivel controlado (≤ 500mg). Seguro para pacientes con hipertensión.'
                      : '⚠️ Excede límite hiposódico (> 500mg). Supervisar condimentos.'}
                </div>
              </div>

              {/* Aporte Energético */}
              <div style={{ background: '#EFF6FF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1E40AF', textTransform: 'uppercase' }}>
                    Densidad Calórica Promedio
                  </span>
                  <Activity size={16} color="#3B82F6" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: '900', color: '#1E40AF' }}>
                    {computedData.weeklyAvgPerResident.calories !== null ? computedData.weeklyAvgPerResident.calories : 'N/D'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#1D4ED8' }}>kcal / comida principal</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: '700', marginTop: '0.4rem' }}>
                  {computedData.weeklyAvgPerResident.calories !== null
                    ? '✓ Cubre aproximadamente el 35% del VET diario en adultos mayores (1,800-2,000 kcal).'
                    : 'Sin datos calóricos registrados en el menú activo.'}
                </div>
              </div>

            </div>

            {/* Tabla Clínica de Consumo Diario y Semanal */}
            <div className="printable-table-wrapper" style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '14px', width: '100%' }}>
              <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <colgroup>
                  <col style={{ width: '11%' }} /> {/* Día y Fecha */}
                  <col style={{ width: '31%' }} /> {/* Platillos Servidos */}
                  <col style={{ width: '7%' }} />  {/* Raciones */}
                  <col style={{ width: '9%' }} />  {/* Calorías */}
                  <col style={{ width: '9%' }} />  {/* Proteína */}
                  <col style={{ width: '9%' }} />  {/* Carbos */}
                  <col style={{ width: '8%' }} />  {/* Grasas */}
                  <col style={{ width: '8%' }} />  {/* Sodio */}
                  <col style={{ width: '8%' }} />  {/* Validación */}
                </colgroup>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: '800' }}>Día y Fecha</th>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: '800' }}>Platillos Servidos</th>
                    <th style={{ padding: '0.65rem 0.4rem', fontWeight: '800', textAlign: 'center' }}>Raciones</th>
                    <th style={{ padding: '0.65rem 0.4rem', fontWeight: '800' }}>Calorías</th>
                    <th style={{ padding: '0.65rem 0.4rem', fontWeight: '800' }}>Proteína</th>
                    <th style={{ padding: '0.65rem 0.4rem', fontWeight: '800' }}>Carbos</th>
                    <th style={{ padding: '0.65rem 0.4rem', fontWeight: '800' }}>Grasas</th>
                    <th style={{ padding: '0.65rem 0.4rem', fontWeight: '800' }}>Sodio</th>
                    <th style={{ padding: '0.65rem 0.4rem', fontWeight: '800', textAlign: 'center' }}>Validación</th>
                  </tr>
                </thead>
                <tbody>
                  {computedData.dailyNutritionSummary.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                      <td style={{ padding: '0.65rem 0.5rem', fontWeight: '700', color: '#1E293B' }}>
                        <div>{item.dayName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.dateLabel}</div>
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1E293B', wordBreak: 'break-word' }}>
                          A: {item.dishA} ({item.servingsA})
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#2563EB', marginTop: '0.15rem', wordBreak: 'break-word' }}>
                          B: {item.dishB} ({item.servingsB})
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 0.4rem', fontWeight: '800', color: '#1E293B', textAlign: 'center' }}>
                        {item.totalDayServings}
                      </td>
                      <td style={{ padding: '0.65rem 0.4rem', fontWeight: '700', color: '#1E293B' }}>
                        {item.avgCaloriesPerResident !== null ? `${item.avgCaloriesPerResident} kcal` : 'N/D'}
                      </td>
                      <td style={{ padding: '0.65rem 0.4rem', fontWeight: '800', color: '#B45309' }}>
                        {item.avgProteinPerResident !== null ? `${item.avgProteinPerResident}g` : 'N/D'}
                      </td>
                      <td style={{ padding: '0.65rem 0.4rem', color: '#475569' }}>
                        {item.avgCarbsPerResident !== null ? `${item.avgCarbsPerResident}g` : 'N/D'}
                      </td>
                      <td style={{ padding: '0.65rem 0.4rem', color: '#475569' }}>
                        {item.avgFatsPerResident !== null ? `${item.avgFatsPerResident}g` : 'N/D'}
                      </td>
                      <td style={{ padding: '0.65rem 0.4rem', color: '#475569' }}>
                        {item.avgSodiumPerResident !== null ? `${item.avgSodiumPerResident}mg` : 'N/D'}
                      </td>
                      <td style={{ padding: '0.65rem 0.4rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.2rem 0.45rem',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          display: 'inline-block',
                          background: item.complianceStatus === 'safe' ? '#ECFDF5' : (item.complianceStatus === 'fail' ? '#FEF2F2' : (item.complianceStatus === 'partial_safe' ? '#EFF6FF' : '#F1F5F9')),
                          color: item.complianceStatus === 'safe' ? '#065F46' : (item.complianceStatus === 'fail' ? '#991B1B' : (item.complianceStatus === 'partial_safe' ? '#1E40AF' : '#64748B')),
                          border: item.complianceStatus === 'fail' ? '1px solid #FECACA' : 'none'
                        }}>
                          {item.complianceLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#F1F5F9', fontWeight: '800', color: '#1E293B', borderTop: '2px solid #CBD5E1' }}>
                    <td colSpan="3" style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem' }}>
                      PROMEDIO DIARIO POR RESIDENTE
                    </td>
                    <td style={{ padding: '0.75rem 0.4rem', color: '#1E293B', fontSize: '0.85rem' }}>
                      {computedData.weeklyAvgPerResident.calories !== null ? `${computedData.weeklyAvgPerResident.calories} kcal` : 'N/D'}
                    </td>
                    <td style={{ padding: '0.75rem 0.4rem', color: '#B45309', fontSize: '0.85rem' }}>
                      {computedData.weeklyAvgPerResident.protein !== null ? `${computedData.weeklyAvgPerResident.protein}g` : 'N/D'}
                    </td>
                    <td style={{ padding: '0.75rem 0.4rem', color: '#475569', fontSize: '0.85rem' }}>
                      {computedData.weeklyAvgPerResident.carbs !== null ? `${computedData.weeklyAvgPerResident.carbs}g` : 'N/D'}
                    </td>
                    <td style={{ padding: '0.75rem 0.4rem', color: '#475569', fontSize: '0.85rem' }}>
                      {computedData.weeklyAvgPerResident.fats !== null ? `${computedData.weeklyAvgPerResident.fats}g` : 'N/D'}
                    </td>
                    <td style={{ padding: '0.75rem 0.4rem', color: '#475569', fontSize: '0.85rem' }}>
                      {computedData.weeklyAvgPerResident.sodium !== null ? `${computedData.weeklyAvgPerResident.sodium}mg` : 'N/D'}
                    </td>
                    <td style={{ padding: '0.75rem 0.4rem', textAlign: 'center' }}>
                      <span style={{
                        background: computedData.weeklyComplianceStatus === 'safe' ? '#10B981' : (computedData.weeklyComplianceStatus === 'fail' ? '#EF4444' : '#64748B'),
                        color: 'white',
                        padding: '0.2rem 0.45rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem'
                      }}>
                        {computedData.weeklyComplianceLabel}
                      </span>
                    </td>
                  </tr>
                  <tr style={{ background: '#FFFFFF', color: '#64748B', fontSize: '0.78rem' }}>
                    <td colSpan="9" style={{ padding: '0.65rem 0.5rem' }}>
                      <strong>Acumulado Total de Cocina:</strong> {computedData.sumCaloriesConsumed !== null ? `${computedData.sumCaloriesConsumed.toLocaleString()} kcal` : 'N/D'} y {computedData.sumProteinConsumed !== null ? `${computedData.sumProteinConsumed.toLocaleString()}g de proteína` : 'N/D'} producidos en el servicio semanal.
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </div>
        </section>
      )}
          </>
        )
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CAPTURA DE FACTURA / ENTRADA DE INSUMOS (PORTAL DIRECTO A BODY)   */}
      {/* ========================================================================= */}
      {isPurchaseModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPurchaseModalOpen(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999999, // Garantizado por encima de cualquier barra fija (99999)
            padding: '1.25rem'
          }}
        >
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            
            {/* Header del Modal */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingCart size={22} color="#10B981" /> Captura de Facturas y Entradas de Insumos
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', color: '#64748B', fontSize: '0.82rem' }}>
                  Ingresa las cantidades reales compradas o despachadas a cocina para cotejar contra recetas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPurchaseModalOpen(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem'
                }}
              >
                ✕
              </button>
            </div>

            {/* Contenido / Tabla del Modal con scroll interno cómodo */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, maxHeight: 'calc(85vh - 145px)' }}>
              
              {/* Barra de Búsqueda y Acción Rápida (idéntico al de la tabla principal) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '0.85rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#F8FAFC',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  flex: '1',
                  minWidth: '220px'
                }}>
                  <Search size={16} color="#64748B" />
                  <input 
                    type="text"
                    placeholder="Buscar insumo (ej. caldo, papa, pollo, arroz)..."
                    value={modalSearchTerm}
                    onChange={e => setModalSearchTerm(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      width: '100%',
                      fontSize: '0.85rem',
                      color: '#1E293B'
                    }}
                    autoFocus
                  />
                  {modalSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setModalSearchTerm('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        padding: '0 4px',
                        fontWeight: 'bold'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

              </div>

              {/* Indicador de conteo y Total de Factura */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0 0.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                  {modalSearchTerm ? (
                    <>Mostrando <strong>{modalFilteredSupplies.length}</strong> de {computedData.suppliesList.length} insumos</>
                  ) : (
                    <>Total Insumos a Controlar: <strong>{computedData.suppliesList.length}</strong></>
                  )}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#065F46' }}>Total Factura:</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#065F46' }}>
                      ${currentWeekInvoiceTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {modalSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setModalSearchTerm('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2563EB',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Ver todos
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {modalFilteredSupplies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94A3B8', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', fontSize: '0.85rem' }}>
                    No se encontró ningún insumo con "{modalSearchTerm}".
                  </div>
                ) : (
                  modalFilteredSupplies.map((item) => {
                    const rec = purchasedSupplies[item.key] || purchasedSupplies[item.name.toLowerCase()] || {};
                    const currentPurchased = rec.amount !== undefined && rec.amount !== null ? rec.amount : '';
                    const currentUnitPrice = rec.unitPrice !== undefined && rec.unitPrice !== null ? rec.unitPrice : '';
                    const currentTotalCost = rec.totalCost !== undefined && rec.totalCost !== null ? rec.totalCost : (rec.cost !== undefined && rec.cost !== null ? rec.cost : '');

                    return (
                      <div 
                        key={item.key || item.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          gap: '1rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ flex: '1 1 200px' }}>
                          <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.88rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            Demanda Teórica: <strong>{item.formattedRequired}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          {/* Cantidad Entrada */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <label style={{ fontSize: '0.68rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                              Cant. ({item.displayUnit})
                            </label>
                            <input 
                              type="number"
                              placeholder="0"
                              value={currentPurchased}
                              onChange={(e) => handleSavePurchaseItem(item.key, 'amount', e.target.value, { displayUnit: item.displayUnit, name: item.name })}
                              style={{
                                width: '85px',
                                padding: '0.4rem 0.5rem',
                                borderRadius: '8px',
                                border: '1px solid #CBD5E1',
                                textAlign: 'right',
                                fontWeight: '700',
                                fontSize: '0.88rem',
                                color: '#1E293B'
                              }}
                              min="0"
                              step="any"
                            />
                          </div>

                          {/* Precio Unitario */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <label style={{ fontSize: '0.68rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                              Precio Unit. ($)
                            </label>
                            <input 
                              type="number"
                              placeholder="0.00"
                              value={currentUnitPrice}
                              onChange={(e) => handleSavePurchaseItem(item.key, 'unitPrice', e.target.value, { displayUnit: item.displayUnit, name: item.name })}
                              style={{
                                width: '85px',
                                padding: '0.4rem 0.5rem',
                                borderRadius: '8px',
                                border: '1px solid #CBD5E1',
                                textAlign: 'right',
                                fontWeight: '700',
                                fontSize: '0.88rem',
                                color: '#1E293B'
                              }}
                              min="0"
                              step="any"
                            />
                          </div>

                          {/* Costo Total */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <label style={{ fontSize: '0.68rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                              Costo Total ($)
                            </label>
                            <input 
                              type="number"
                              placeholder="0.00"
                              value={currentTotalCost}
                              onChange={(e) => handleSavePurchaseItem(item.key, 'totalCost', e.target.value, { displayUnit: item.displayUnit, name: item.name })}
                              style={{
                                width: '95px',
                                padding: '0.4rem 0.5rem',
                                borderRadius: '8px',
                                border: '1px solid #CBD5E1',
                                textAlign: 'right',
                                fontWeight: '700',
                                fontSize: '0.88rem',
                                color: '#166534',
                                background: '#F0FDF4'
                              }}
                              min="0"
                              step="any"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Footer del Modal */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsPurchaseModalOpen(false)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPurchaseModalOpen(false);
                  showToast('¡Balance de insumos actualizado con éxito!');
                }}
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.6rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                }}
              >
                Listo y Actualizar Balance
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
