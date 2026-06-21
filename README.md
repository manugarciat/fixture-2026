# 🏆 Copa Mundial FIFA 2026 - Fixture & Simulador

¡Bienvenido al simulador interactivo y fixture de la **Copa Mundial de la FIFA 2026**! Esta aplicación web te permite seguir los partidos, simular marcadores, ver cómo se recalculan las posiciones de los grupos en tiempo real (aplicando las reglas oficiales de desempate y mejores terceros) y completar el cuadro final hasta consagrar al campeón del mundo.

La aplicación está diseñada para ser **100% estática y sin servidor (serverless)**. Tus predicciones se guardan de manera automática en el navegador y puedes compartirlas con tus amigos generando un enlace comprimido directamente en la URL.

---

## ✨ Características Principales

*   📅 **Fixture Completo:** Lista ordenada de los 104 partidos del primer mundial de 48 selecciones.
*   📊 **Tablas de Posiciones Dinámicas:** Recálculo en tiempo real de puntos, partidos jugados, diferencia de goles y goles a favor para los 12 grupos.
*   🏅 **Algoritmo Anexo C de la FIFA:** Implementación de la matriz reglamentaria oficial para emparejar automáticamente a los 8 mejores terceros clasificados en los Dieciseisavos de Final.
*   🏆 **Cuadro de Eliminación Directa (Bracket):** Árbol visual responsivo desde Dieciseisavos hasta la Final, con soporte para desempates por tanda de penaltis.
*   🔗 **Compartido Serverless:** Copia y comparte tu simulación exacta con un enlace ultracompacto en la URL (ej: `?s=2-0,1-1,x102`).
*   ⚡ **Carga de Datos Oficiales:** Un botón te permite cargar los resultados oficiales reales jugados durante el torneo.

---

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React (Vite)
*   **Estilos:** Tailwind CSS v4 (Súper ligero y moderno)
*   **Banderas:** [FlagCDN](https://flagcdn.com/) (SVG responsivos y optimizados)
*   **Automatización:** Python 3 (urllib y regex) + GitHub Actions

---

## 🚀 Instalación y Desarrollo Local

Asegúrate de tener [Node.js](https://nodejs.org/) instalado. Luego, sigue estos pasos:

1.  **Clona el repositorio** e ingresa a la carpeta del proyecto.
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Abre `http://localhost:5173` en tu navegador.
4.  **Genera el compilado para producción:**
    ```bash
    npm run build
    ```
    Los archivos listos para subir a producción se generarán en la carpeta `dist/`.

---

## 🤖 Automatización de Resultados (GitHub Actions)

El proyecto incluye un script de automatización (`update_results.py`) que descarga los resultados oficiales del mundial directamente de Wikipedia y actualiza la aplicación web.

### ⚙️ Configuración Necesaria en GitHub
Para que GitHub Actions pueda guardar los resultados de forma automática en tu repositorio, **debes darle permisos de escritura al flujo de trabajo (Workflow)**:

1.  Entra a tu repositorio en **GitHub**.
2.  Ve a **Settings** (Configuración) -> **Actions** -> **General**.
3.  Desplázate hacia abajo hasta la sección **Workflow permissions**.
4.  Selecciona la opción **"Read and write permissions"** (Permisos de lectura y escritura).
5.  Haz clic en **Save** (Guardar).

Una vez configurado, la acción se ejecutará sola cada **6 horas** de manera totalmente gratuita y actualizará la web sin que tengas que intervenir. También puedes iniciarla manualmente desde la pestaña **Actions** en GitHub haciendo clic en `Run workflow`.

> [!NOTE]
> **Apagado Inteligente:** El script está programado para desactivarse automáticamente el **20 de Julio de 2026** (un día después de la final), asegurando que no consuma recursos de tu cuenta una vez que el torneo haya terminado.

---

## 🌐 Despliegue

La configuración del compilador está optimizada con rutas relativas (`base: './'`), lo que significa que el proyecto es compatible con:

*   **Vercel:** Importa tu repositorio (incluso si es privado) y Vercel lo desplegará de forma gratuita.
*   **GitHub Pages:** Puedes desplegar el contenido de la carpeta `dist/` en la rama `gh-pages` de tu repositorio.
