# Ways of Working (WOW) - NutriKer 🤝

Este documento define la metodología de trabajo, responsabilidades y el flujo de Git para el desarrollo del proyecto **NutriKer**.

---

## 📋 División de Responsabilidades (Colaboración vía Git)

*   **Ricardo (Owner & PM):**
    *   **Definición:** Explica qué se necesita y define el alcance/requerimientos del proyecto.
    *   **Gestión:** Crea los issues en GitHub y administra las prioridades.
    *   **Control de Calidad:** Revisa el código, aprueba los Pull Requests (PR) y realiza la fusión (merge) final a la rama `main`.
    *   **Front-End Cliente:** Desarrollo y maquetación de la interfaz pública en `client/`.
*   **Yael (Dev):**
    *   **Desarrollo:** Escribe y ejecuta el código en Backend (`server/`), base de datos (PostgreSQL Neon) y el Panel de Administración (`admin/`).
    *   **QA y Pruebas:** Es responsable de probar localmente y asegurar el control de calidad (QA) antes de abrir un Pull Request.
    *   **Git Flow:** Trabaja sobre la rama del issue respectivo y abre el PR correspondiente una vez completado el desarrollo.

---

## 🛠️ Flujo de Trabajo en Git y GitHub

Para mantener el repositorio limpio y ordenado, el flujo de desarrollo debe ser el siguiente:

1.  **Tomar Tarea:** 
    *   El desarrollador debe seleccionar una tarea activa de los **Issues** de GitHub.
2.  **Desarrollo en Ramas (Branching):**
    *   Se debe crear una rama específica para cada issue. 
    *   *Nomenclatura:* `feature/issue-<numero>-nombre-corto` (Ejemplo: `feature/issue-2-dashboard-buenos-dias`).
3.  **Pull Request (PR) y Aprobación:**
    *   Una vez terminada la tarea, se abre un Pull Request hacia la rama `main` y se asigna al Propietario.
    *   **Formato de Referencias:**
        *   La descripción del PR debe explicar a detalle lo realizado y contener la leyenda: `refs #<numero_de_issue>` (ej. `refs #2`).
        *   En el issue correspondiente se debe comentar: `Resuelto en PR #<numero_de_PR>` (ej. `Resuelto en PR #15`).
4.  **Cierre y Fusiones (Merges):**
    *   ⚠️ **Solo el Propietario (Owner) cierra Pull Requests.**
    *   ⚠️ **Solo el Propietario (Owner) cierra Issues.**

---

## 🎯 Plan de Implementación (8 Tareas Principales)

Las tareas detalladas que guiarán el desarrollo son:

*   **Issue #1:** [Auditoría] Validación y Estabilización de CRUDs y Endpoints Existentes.
*   **Issue #2:** [Admin/Back] Dashboard "Buenos Días" con Resumen de Citas y Tareas Diarias.
*   **Issue #3:** [Admin/Back] Panel de Gestión de Productos (E-commerce) y Categorías.
*   **Issue #4:** [Admin/Back] Administrador de Zonas de Envío y Tarifas.
*   **Issue #5:** [Admin/Back] Expediente Clínico Digital Completo (Historial y Antropometría).
*   **Issue #6:** [Admin/Back] Generador y Asignador de Menús Semanales por Paciente.
*   **Issue #7:** [Client/Back] Portal del Paciente (Autenticación y Perfil).
*   **Issue #8:** [Admin/Back] Chat Agencial (Asistente de Consulta con IA - Gemini Flash).
