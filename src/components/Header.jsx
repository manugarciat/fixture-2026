import React from 'react';

export default function Header({
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

        {/* Quick Actions Panel */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={loadRealResults}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-emerald-400 hover:bg-slate-800 transition duration-200 shadow-md flex items-center gap-2"
          >
            📅 Cargar Resultados Reales {lastRealMatchDate ? `(${lastRealMatchDate})` : ''}
          </button>
          <button
            onClick={simulateRandomly}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-purple-400 hover:bg-slate-800 transition duration-200 shadow-md flex items-center gap-2"
          >
            🎲 Simular Grupos Aleatoriamente
          </button>
          <button
            onClick={sharePredictions}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-50 font-bold transition duration-200 shadow-md shadow-emerald-950/20 flex items-center gap-2"
          >
            🔗 Compartir Pronósticos
          </button>
          <button
            onClick={resetScores}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-900 hover:text-rose-400 text-slate-400 hover:bg-rose-950/20 transition duration-200"
          >
            Resetear
          </button>
        </div>
      </div>
    </header>
  );
}
