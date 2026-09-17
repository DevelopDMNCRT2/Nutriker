const fs = require('fs');

function injectChef() {
  let content = fs.readFileSync('herramienta-nutricion/src/components/ChefView.jsx', 'utf8');
  
  // 1. Add Modal Import
  if (!content.includes('IngredientEditorModal')) {
    content = content.replace(
      "import WeekCalendarPicker from './WeekCalendarPicker';",
      "import WeekCalendarPicker from './WeekCalendarPicker';\nimport IngredientEditorModal from './IngredientEditorModal';"
    );
  }

  // 2. Add state and handlers
  if (!content.includes('const [editingDish, setEditingDish]')) {
    content = content.replace(
      "const [activeTabB, setActiveTabB] = useState('ingredients');",
      `const [activeTabB, setActiveTabB] = useState('ingredients');\n  const [editingDish, setEditingDish] = useState(null);\n\n  const handleSaveIngredients = (newIngredients) => {\n    if (!editingDish) return;\n    menuStore.updateDishIngredients(chefWeekInfo, currentDay.dayName || safeDayIndex, editingDish.optionKey, newIngredients, 'Chef Mateo');\n    setActiveMenu(menuStore.getActiveMenu(chefWeekInfo));\n    setEditingDish(null);\n  };\n\n  const handleResetIngredients = () => {\n    if (!editingDish) return;\n    menuStore.resetDishIngredients(chefWeekInfo, currentDay.dayName || safeDayIndex, editingDish.optionKey);\n    setActiveMenu(menuStore.getActiveMenu(chefWeekInfo));\n    setEditingDish(null);\n  };`
    );
  }

  // 3. Add buttons in renderOptionContent
  if (!content.includes('setEditingDish({ dish: optionData, optionKey })')) {
    content = content.replace(
      "{/* Pestañas de Vista */}",
      `<button type="button" onClick={() => setEditingDish({ dish: optionData, optionKey })} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Ajustar Insumos</button>\n        {/* Pestañas de Vista */}`
    );
  }

  // 4. Add Modal to output
  if (!content.includes('<IngredientEditorModal')) {
    content = content.replace(
      "    </div>\n  );\n}",
      `      <IngredientEditorModal isOpen={!!editingDish} onClose={() => setEditingDish(null)} dish={editingDish?.dish} dayName={currentDay?.dayName} optionKey={editingDish?.optionKey} role="chef" onSave={handleSaveIngredients} onReset={handleResetIngredients} />\n    </div>\n  );\n}`
    );
  }
  
  // also inject Edit3 into lucide-react imports if not there
  if(!content.includes('Edit3')) {
      content = content.replace('ChefHat, ArrowLeft', 'ChefHat, ArrowLeft, Edit3');
  }

  fs.writeFileSync('herramienta-nutricion/src/components/ChefView.jsx', content);
}

function injectNutriologa() {
  let content = fs.readFileSync('herramienta-nutricion/src/components/NutriologaView.jsx', 'utf8');
  
  if (!content.includes('IngredientEditorModal')) {
    content = content.replace(
      "import WeekCalendarPicker from './WeekCalendarPicker';",
      "import WeekCalendarPicker from './WeekCalendarPicker';\nimport IngredientEditorModal from './IngredientEditorModal';"
    );
  }

  if (!content.includes('const [editingDish, setEditingDish]')) {
    content = content.replace(
      "const safeDayIndex = selectedDayIndex < weekData.days.length ? selectedDayIndex : 0;",
      `const safeDayIndex = selectedDayIndex < weekData.days.length ? selectedDayIndex : 0;\n  const [editingDish, setEditingDish] = useState(null);\n\n  const handleSaveIngredients = (newIngredients) => {\n    if (!editingDish || !currentDay) return;\n    menuStore.updateDishIngredients(targetWeekInfo, currentDay.dayName || safeDayIndex, editingDish.optionKey, newIngredients, 'Dra. Karla (Nutrióloga)');\n    setActiveMenu(menuStore.getActiveMenu(targetWeekInfo));\n    setEditingDish(null);\n  };\n\n  const handleResetIngredients = () => {\n    if (!editingDish || !currentDay) return;\n    menuStore.resetDishIngredients(targetWeekInfo, currentDay.dayName || safeDayIndex, editingDish.optionKey);\n    setActiveMenu(menuStore.getActiveMenu(targetWeekInfo));\n    setEditingDish(null);\n  };`
    );
  }

  if (!content.includes('setEditingDish({ dish: optionData, optionKey })')) {
    content = content.replace(
      "{/* Detalles de Insumos y Escalado */}",
      `<div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}><button type="button" onClick={() => setEditingDish({ dish: optionData, optionKey })} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Ajustar Insumos</button></div>\n        {/* Detalles de Insumos y Escalado */}`
    );
  }

  if (!content.includes('<IngredientEditorModal')) {
    content = content.replace(
      "    </div>\n  );\n}",
      `      <IngredientEditorModal isOpen={!!editingDish} onClose={() => setEditingDish(null)} dish={editingDish?.dish} dayName={currentDay?.dayName} optionKey={editingDish?.optionKey} role="nutriologa" onSave={handleSaveIngredients} onReset={handleResetIngredients} />\n    </div>\n  );\n}`
    );
  }

  fs.writeFileSync('herramienta-nutricion/src/components/NutriologaView.jsx', content);
}

injectChef();
injectNutriologa();
