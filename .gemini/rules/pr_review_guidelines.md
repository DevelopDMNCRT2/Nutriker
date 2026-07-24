# Reglas Estrictas para Revisión de Pull Requests

Siempre que se te solicite revisar un Pull Request, DEBES auditar rigurosamente los siguientes puntos antes de emitir una aprobación. Si alguno falla, debes solicitar cambios (Request Changes).

1. **Origen Limpio de la Rama**: La rama en revisión debe nacer directamente de `main`. No debe traer commits arrastrados de otras ramas de features que aún no han sido integradas.
2. **Pruebas CI/CD**: El PR debe pasar exitosamente el pipeline de pruebas continuas (CI/CD) si este se encuentra activo.
3. **Conflictos**: La rama no debe tener conflictos de merge con `main`.
4. **Control de Scope**: El scope no debe estar inflado ni contaminado; el PR solo debe modificar los archivos pertinentes a su feature, sin mezclar funcionalidades adicionales.
5. **Referencia a Issue**: El PR o los commits deben hacer referencia explícita a un número de Issue válido (ej. `refs #123` o `Closes #123`).
