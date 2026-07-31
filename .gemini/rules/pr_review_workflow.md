---
description: Reglas estrictas y flujo de trabajo que el agente debe seguir siempre que el usuario le pida revisar un Pull Request (PR).
---

# Flujo de Revisión de Pull Requests

Siempre que el usuario te pida revisar un Pull Request, DEBES poner atención a los siguientes puntos y verificarlos exhaustivamente:

1. **Origen de la Rama**: La rama en revisión no debe venir con cambios arrastrados de otra rama; debe haber sido clonada/creada a partir de `main`.
2. **CI/CD**: El PR debe pasar las pruebas de CI/CD cuando este pipeline esté activo.
3. **Conflictos**: El PR no debe tener conflictos de merge con la rama base (`main`).
4. **Scope (Alcance)**: El scope del PR no debe venir inflado o contaminado con commits o archivos de otras features.
5. **Referencias**: El PR debe hacer referencia explícita a un Issue (ej. `refs #123` o `Closes #123`).

## Acciones Post-Revisión

**Si el PR PASA TODAS las validaciones:**
1. Envía un mensaje de review positivo aprobando el PR (e.g. `gh pr review --approve`).
2. Haz merge del PR a la rama base (e.g. `gh pr merge --squash`).
3. Busca el issue de origen vinculado al PR.
4. Responde en el issue mencionando en qué PR se resolvió la tarea.
5. Cierra el issue.

**Si el PR NO PASA alguna validación:**
1. Especifica claramente la razón del rechazo al usuario y en el PR.
2. Propón una posible solución o idea para arreglarlo (ej. hacer rebase, cherry-pick, resolver conflictos).
3. Solicita cambios en el PR (e.g. `gh pr review --request-changes`).
4. Asigna el PR a quien lo envió para que lo resuelva (e.g. `gh pr edit --add-assignee yaywiin`).
5. **MUY IMPORTANTE**: Quita tu propia asignación del PR (e.g. `gh pr edit --remove-assignee "@me"`). De esta manera, el "balón" pasa exclusivamente a la cancha del desarrollador, y el equipo sabrá que te toca revisar de nuevo cuando él te devuelva la asignación manualmente.

## PRs Creados por el Usuario
**Regla de Revisión Invertida:** Todos los issues que el usuario (Ricardo) resuelva y para los cuales cree un Pull Request, **DEBEN** ser asignados a Yael (`yaywiin`) para que él los revise y los apruebe antes de fusionarse. El agente debe ejecutar `gh pr edit <PR_NUMBER> --add-reviewer yaywiin --add-assignee yaywiin` automáticamente.
