# Guía de CI/CD y Automatización de Pipelines - NutriKer 🚀

Este documento introduce el concepto de Integración Continua y Despliegue Continuo (CI/CD) para el proyecto **NutriKer** y explica su importancia en nuestra arquitectura de desarrollo.

---

## ❓ ¿Qué es CI/CD?

*   **Integración Continua (CI):** Práctica en la que el código desarrollado se integra y se valida automáticamente múltiples veces al día. Cada cambio en un Pull Request activa pruebas automatizadas y comprobaciones de sintaxis para asegurar que el nuevo código no rompe lo existente.
*   **Despliegue Continuo (CD):** Práctica de automatizar el despliegue del software una vez que los cambios han superado las pruebas del pipeline de integración y se aprueba su fusión en la rama principal (`main`).

---

## 🎯 ¿Por qué es Crucial para NutriKer?

1.  **Prevención de Errores en Producción:** El pipeline validará que tanto el backend en Express como los proyectos frontend de Vue 3 (incluyendo los tipos de TypeScript del Admin) compilen sin errores antes de mergear cualquier Pull Request.
2.  **Automatización de Despliegues:** Elimina la necesidad de desplegar manualmente en Vercel. En cuanto se fusiona un PR aprobado, Vercel compila y despliega automáticamente la nueva versión.
3.  **Seguridad y Pruebas Homogéneas:** Todo el código pasa por el mismo filtro de pruebas (linting, formateo y tests unitarios) en un entorno aislado de GitHub, garantizando homogeneidad y calidad sin depender del entorno local del desarrollador.

---

## 🛠️ Herramientas Propuestas para el Pipeline

*   **GitHub Actions:** Para el pipeline de **CI**. Se ejecutará un flujo de trabajo (workflow) en cada Pull Request que:
    *   Instale dependencias de Node.js.
    *   Ejecute el linter (`eslint`) para garantizar estilo de código.
    *   Ejecute comprobación estricta de tipos de TypeScript (`vue-tsc --build`) en el módulo `admin/`.
    *   Corra las pruebas de backend (`npm test`).
*   **Vercel GitHub Integration:** Para el pipeline de **CD**.
    *   Genera previsualizaciones (Previews) en cada PR para realizar pruebas manuales antes del merge.
    *   Despliega a producción de forma automática al mergear a la rama `main`.
*   **Neon DB Branching (Opcional):** Sincronización opcional de esquemas en bases de datos de staging.

---

## 🏁 Siguientes Pasos
Hemos creado dos nuevos Issues en el repositorio para que implementes esta automatización:
1.  **Issue #9:** Configuración de la Integración Continua (CI) mediante GitHub Actions.
2.  **Issue #10:** Integración del Despliegue Continuo (CD) con Vercel para staging y producción.
