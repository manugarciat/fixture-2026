# Copa Mundial FIFA 2026 - Fixture & Simulador

Enlace a la aplicación en vivo: [https://manugarciat.github.io/fixture-2026/](https://manugarciat.github.io/fixture-2026/)

Simulador interactivo y fixture de la Copa Mundial de la FIFA 2026. Esta aplicación web permite realizar el seguimiento de los partidos, simular marcadores, ver el cálculo de las posiciones de los grupos en tiempo real (según las reglas oficiales de desempate y mejores terceros) y completar el cuadro final hasta la final del torneo.

La aplicación es completamente estática y del lado del cliente. Las predicciones se guardan de forma automática en el navegador (usando `localStorage`) y pueden compartirse con otros usuarios generando un enlace comprimido en la URL.

---

## Características

*   **Fixture Completo:** Calendario de los 104 partidos del mundial de 48 selecciones.
*   **Tablas de Posiciones Dinámicas:** Recálculo en tiempo real de puntos, partidos jugados, diferencia de goles y goles a favor para los 12 grupos.
*   **Algoritmo del Anexo C de la FIFA:** Implementación de la matriz reglamentaria oficial para emparejar a los 8 mejores terceros clasificados en los Dieciseisavos de Final.
*   **Cuadro de Eliminación Directa (Bracket):** Árbol de partidos desde Dieciseisavos hasta la Final, con soporte para desempates por tanda de penaltis.
*   **Compartido por URL:** Opción para copiar y compartir una simulación mediante un enlace compacto en los parámetros de consulta (ej. `?s=2-0,1-1,x102`).
*   **Carga de Resultados Oficiales:** Botón para cargar los resultados reales jugados durante el torneo.

---

## Tecnologías

*   **Frontend:** React (Vite)
*   **Estilos:** Tailwind CSS v4
*   **Banderas:** [FlagCDN](https://flagcdn.com/) (imágenes SVG)
*   **Automatización:** Python 3 + GitHub Actions

---

## Instalación y Desarrollo Local

Es necesario contar con [Node.js](https://nodejs.org/) instalado en el sistema.

1.  **Clonar el repositorio** e ingresar a la carpeta del proyecto.
2.  **Instalar las dependencias:**
    ```bash
    npm install
    ```
3.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.
4.  **Compilar para producción:**
    ```bash
    npm run build
    ```
    Los archivos optimizados se generarán en la carpeta `dist/`.

---

## Automatización de Resultados (GitHub Actions)

El proyecto incluye un script en Python (`update_results.py`) que descarga los resultados del mundial desde Wikipedia y actualiza los datos de la aplicación.

### Configuración de Permisos en GitHub
Para que la automatización pueda guardar los resultados en el repositorio, es necesario otorgarle permisos de escritura:

1.  Ingresar al repositorio en **GitHub**.
2.  Ir a **Settings** (Configuración) -> **Actions** -> **General**.
3.  Desplazarse hasta la sección **Workflow permissions**.
4.  Seleccionar **"Read and write permissions"** (Permisos de lectura y escritura).
5.  Guardar los cambios.

Una vez configurado, la acción se ejecutará de forma automática cada 6 horas. También es posible iniciarla manualmente desde la pestaña **Actions** en GitHub seleccionando `Run workflow`.

> [!NOTE]
> El script está programado para dejar de realizar actualizaciones el **20 de Julio de 2026** (un día después de la final), evitando el consumo innecesario de recursos de la cuenta.

---

## Despliegue

La compilación está configurada con rutas relativas (`base: './'`), lo que facilita el despliegue en:

*   **Vercel:** Al conectar el repositorio, el despliegue se realiza de forma automática.
*   **GitHub Pages:** Se puede publicar el contenido de la carpeta `dist/` en la rama `gh-pages` del repositorio.
