def fix(file):
    with open(file, 'r') as f:
        lines = f.readlines()
    with open(file, 'w') as f:
        for line in lines:
            if "IngredientEditorModal" in line and "from './WeekCalendarPicker'" in line:
                f.write('import IngredientEditorModal from "./IngredientEditorModal";\n')
            else:
                f.write(line)
fix('herramienta-nutricion/src/components/ChefView.jsx')
fix('herramienta-nutricion/src/components/NutriologaView.jsx')
