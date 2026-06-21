import React from 'react';

export default function Header({
  viewMode,
  setViewMode,
  lastRealMatchDate,
  loadRealResults,
  simulateRandomly,
  sharePredictions,
  resetScores
}) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-[#11182d] to-[#0a0f1d] border-b border-slate-800/80 px-4 py-8 md:py-12">
      <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[500px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[10%] right-[10%] w-[250px] h-[250px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-xs font-semibold text-emerald-400 mb-4 select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          2026 FIFA World Cup Simulator
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-slate-100 to-slate-300">
          COPA MUNDIAL 2026
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-3 max-w-2xl mx-auto font-medium">
          🇺🇸 Estados Unidos · 🇨🇦 Canadá · 🇲🇽 México &nbsp;|&nbsp; 11 de Junio – 19 de Julio, 2026
        </p>
        <p className="text-slate-500 text-xs mt-2">
          104 Partidos · 48 Equipos · Primer Mundial de 48 Selecciones
        </p>

        {/* Mode Selector Segmented Control */}
        <div className="mt-8 inline-flex p-1 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-lg backdrop-blur-sm">
          <button
            onClick={() => setViewMode('official')}
            className={`px-6 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-1.5 ${
              viewMode === 'official'
                ? 'bg-emerald-600 text-slate-50 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Resultados Reales
          </button>
          <button
            onClick={() => setViewMode('simulation')}
            className={`px-6 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-1.5 ${
              viewMode === 'simulation'
                ? 'bg-purple-600 text-slate-50 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎲 Mi Simulación
          </button>
        </div>

        {/* Contextual Action Panels */}
        {viewMode === 'official' ? (
          <div className="mt-6 max-w-xl mx-auto px-4 py-3 rounded-xl bg-emerald-950/10 border border-emerald-900/30 text-[11px] md:text-xs text-emerald-400 font-medium flex items-center justify-center gap-2">
            <span>ℹ️</span>
            <span>
              Estás viendo los <strong>Resultados Reales</strong> oficiales del torneo. Los partidos jugados están bloqueados y los futuros se actualizarán automáticamente.
            </span>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <button
              onClick={loadRealResults}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-emerald-400 hover:bg-slate-800 transition duration-200 shadow-md flex items-center gap-2"
              title="Copia todos los resultados oficiales vigentes a tu simulación"
            >
              📅 Copiar Resultados Oficiales
            </button>
            <button
              onClick={simulateRandomly}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-purple-400 hover:bg-slate-800 transition duration-200 shadow-md flex items-center gap-2"
            >
              🎲 Simular Grupos Aleatoriamente
            </button>
            <button
              onClick={sharePredictions}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-slate-50 font-bold transition duration-200 shadow-md shadow-purple-950/20 flex items-center gap-2"
            >
              🔗 Compartir Pronósticos
            </button>
            <button
              onClick={resetScores}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-900 hover:text-rose-400 text-slate-400 hover:bg-rose-950/20 transition duration-200"
            >
              Limpiar Predicciones
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
