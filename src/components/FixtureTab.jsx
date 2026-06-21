import React from 'react';
import MatchCard from './MatchCard';
import { STAGE_LABELS } from '../constants';

export default function FixtureTab({
  scores,
  realResults,
  viewMode,
  resolvedTeams,
  handleScoreChange,
  handlePenWinner,
  handleQuickPredictWin,
  handleRandomizeMatch,
  selectedGroupFilter,
  setSelectedGroupFilter,
  selectedStageFilter,
  setSelectedStageFilter,
  searchQuery,
  setSearchQuery,
  filteredFixtures
}) {
  return (
    <div>
      {/* Filters panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filtrar por Grupo</label>
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="All">Todos los Grupos</option>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(g => (
              <option key={g} value={g}>Grupo {g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filtrar por Ronda</label>
          <select
            value={selectedStageFilter}
            onChange={(e) => setSelectedStageFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="All">Todas las Rondas</option>
            {Object.entries(STAGE_LABELS).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Buscar Equipo / Ciudad</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ej: Argentina, Seattle, Estadio..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Matches list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFixtures.length > 0 ? (
          filteredFixtures.map(f => {
            const homeResolvedName = resolvedTeams[`${f.num}_home`] || f.home;
            const awayResolvedName = resolvedTeams[`${f.num}_away`] || f.away;
            const matchScores = scores[f.num] || { home: null, away: null, penWinner: null };
            const officialScore = realResults[f.num];

            return (
              <MatchCard
                key={f.num}
                fixture={f}
                homeResolvedName={homeResolvedName}
                awayResolvedName={awayResolvedName}
                matchScores={matchScores}
                disabled={viewMode === 'official'}
                isOfficial={officialScore !== undefined}
                officialScore={officialScore}
                handleScoreChange={handleScoreChange}
                handlePenWinner={handlePenWinner}
                handleQuickPredictWin={handleQuickPredictWin}
                handleRandomizeMatch={handleRandomizeMatch}
              />
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No se encontraron partidos para los filtros seleccionados
          </div>
        )}
      </div>
    </div>
  );
}
