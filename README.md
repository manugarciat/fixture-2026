# Copa Mundial FIFA 2026 - Fixture & Simulador

Enlace a la aplicación en vivo: [https://manugarciat.github.io/fixture-2026/](https://manugarciat.github.io/fixture-2026/)

Simulador interactivo y fixture de la Copa Mundial de la FIFA 2026. Esta aplicación web permite realizar el seguimiento de los partidos, simular marcadores, ver el cálculo de las posiciones de los grupos en tiempo real (según las reglas oficiales de desempate y mejores terceros) y completar el cuadro final hasta la final del torneo.

La aplicación es completamente estática y del lado del cliente. Las predicciones se guardan de forma automática en el navegador (usando `localStorage`) y pueden compartirse con otros usuarios generando un enlace comprimido en la URL.

---

## Características

*   **Fixture Completo:** Calendario de los 104 partidos del mundial de 48 selecciones.
*   **Dos Modos de Visualización:**
    *   **Resultados Reales (Oficiales):** Estado oficial del torneo en tiempo real (bloqueado para evitar alteraciones accidentales).
    *   **Mi Simulación:** Área editable interactiva donde puedes pronosticar cualquier partido. Al iniciar, carga por defecto los marcadores reales disponibles como punto de partida.
*   **Predicción Rápida en un Clic:** En modo de simulación, haz clic sobre el nombre o bandera de cualquier selección para otorgarle la victoria instantáneamente (sin necesidad de escribir marcadores a mano).
*   **Simulación Individual (Dado 🎲):** Botón para simular aleatoriamente el resultado de un partido específico (incluyendo desempates por penales si el partido pertenece a la ronda eliminatoria).
*   **Comparativa Visual:** En tu simulación, si ingresas un resultado diferente al real en un partido finalizado, se muestra una etiqueta indicando el marcador oficial (`Real: X-Y`) para comparar fácilmente tus aciertos o discrepancias.
*   **Tablas de Posiciones Dinámicas:** Recálculo en tiempo real de puntos, partidos jugados, diferencia de goles y goles a favor para los 12 grupos.
*   **Algoritmo del Anexo C de la FIFA:** Implementación de la matriz reglamentaria oficial para emparejar a los 8 mejores terceros clasificados en los Dieciseisavos de Final.
*   **Cuadro de Eliminación Directa (Bracket):** Árbol de partidos desde Dieciseisavos hasta la Final, con soporte para desempates por tanda de penaltis.
*   **Compartido por URL:** Opción para copiar y compartir una simulación mediante un enlace compacto en los parámetros de consulta (ej. `?s=2-0,1-1,x102`).

---

## Estructura del Proyecto

El código está modularizado para mayor legibilidad y mantenibilidad:

*   `src/components/`: Componentes modulares reutilizables:
    *   `Flag.jsx`: Renderizador de banderas de FlagCDN.
    *   `Header.jsx`: Panel de hero header con selector de modos y acciones.
    *   `MatchCard.jsx`: Tarjeta interactiva de partidos para la pestaña fixture.
    *   `BracketMatch.jsx`: Tarjeta compacta para la visualización del cuadro de eliminatorias.
    *   `FixtureTab.jsx`, `GroupsTab.jsx`, `ThirdsTab.jsx`, `BracketTab.jsx`: Contenedores específicos para cada pestaña de la UI.
*   `src/constants.js`: Definiciones estáticas (mapeo de banderas de selecciones, etiquetas de etapas).
*   `src/utils.js`: Lógica pura y cálculos algorítmicos desacoplados de la UI.
*   `public/real_results.json`: Archivo estático que almacena los marcadores oficiales y es consultado en tiempo real con políticas de invalidación de caché (Cache-Busting).

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

El proyecto incluye un script en Python (`update_results.py`) que descarga los resultados del mundial desde Wikipedia y los escribe simultáneamente en la carpeta de compilación (`public/real_results.json`) y de desarrollo (`src/data/real_results.json`).

### Configuración de Permisos en GitHub
Para que la automatización pueda guardar los resultados en el repositorio, es necesario otorgarle permisos de escritura:

1.  Ingresar al repositorio en **GitHub**.
2.  Ir a **Settings** (Configuración) -> **Actions** -> **General**.
3.  Desplazarse hasta la sección **Workflow permissions**.
4.  Seleccionar **"Read and write permissions"** (Permisos de lectura y escritura).
5.  Guardar los cambios.

Una vez configurado, la acción se ejecutará de forma automática cada 2 horas. También es posible iniciarla manualmente desde la pestaña **Actions** en GitHub seleccionando `Run workflow`. Al subir cambios, esta acción llamará automáticamente a la de despliegue si detecta nuevos marcadores.

> [!NOTE]
> El script está programado para dejar de realizar actualizaciones el **20 de Julio de 2026** (un día después de la final), evitando el consumo innecesario de recursos de la cuenta.

---

## Despliegue

La compilación está configurada con rutas relativas (`base: './'`), lo que facilita el despliegue en:

*   **Vercel:** Al conectar el repositorio, el despliegue se realiza de forma automática.
*   **GitHub Pages:** Se puede publicar el contenido de la carpeta `dist/` en la rama `gh-pages` del repositorio.
