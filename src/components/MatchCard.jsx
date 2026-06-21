import React from 'react';
import Flag from './Flag';
import { STAGE_LABELS } from '../constants';

export default function MatchCard({
  fixture,
  homeResolvedName,
  awayResolvedName,
  matchScores,
  handleScoreChange,
  handlePenWinner
}) {
  const isKnockout = fixture.stage !== 'group-stage';
  const showPenaltiesInput = isKnockout && matchScores.home !== null && matchScores.away !== null && matchScores.home === matchScores.away;

  return (
    <div
      className={`relative bg-slate-900/60 backdrop-blur-sm border rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition duration-200 ${
        isKnockout ? 'border-slate-800/80 shadow-purple-950/5 shadow-md' : 'border-slate-800'
      }`}
    >
      {/* Match header info */}
      <div className="flex justify-between items-center text-xs text-slate-500 mb-3 border-b border-slate-800/60 pb-2">
        <span className="font-semibold text-slate-400">Match #{fixture.num}</span>
        <div className="flex gap-2">
          <span className="font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-slate-400">
            {fixture.group ? `Grupo ${fixture.group}` : STAGE_LABELS[fixture.stage]}
          </span>
          <span>{fixture.date} ({fixture.time} UTC)</span>
        </div>
      </div>

      {/* Score inputs block */}
      <div className="grid grid-cols-12 items-center gap-2 my-2">
        {/* Home Team */}
        <div className="col-span-5 flex items-center gap-3">
          <Flag teamName={homeResolvedName} />
          <span className="text-sm font-semibold truncate text-slate-200" title={homeResolvedName}>
            {homeResolvedName}
          </span>
        </div>

        {/* Scores */}
        <div className="col-span-2 flex items-center justify-center gap-1 select-none">
          <input
            type="number"
            min="0"
            max="99"
            value={matchScores.home === null ? '' : matchScores.home}
            onChange={(e) => handleScoreChange(fixture.num, 'home', e.target.value)}
            className="w-8 h-8 text-center bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded text-sm font-bold text-slate-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="-"
          />
          <span className="text-slate-600 font-bold text-xs">:</span>
          <input
            type="number"
            min="0"
            max="99"
            value={matchScores.away === null ? '' : matchScores.away}
            onChange={(e) => handleScoreChange(fixture.num, 'away', e.target.value)}
            className="w-8 h-8 text-center bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded text-sm font-bold text-slate-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="-"
          />
        </div>

        {/* Away Team */}
        <div className="col-span-5 flex items-center justify-end gap-3 text-right">
          <span className="text-sm font-semibold truncate text-slate-200" title={awayResolvedName}>
            {awayResolvedName}
          </span>
          <Flag teamName={awayResolvedName} />
        </div>
      </div>

      {/* Penalty tie-breaker for Knockouts */}
      {showPenaltiesInput && (
        <div className="mt-3 p-2 bg-purple-950/10 border border-purple-900/30 rounded-lg text-center">
          <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-2">Empate - Define quién avanza</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handlePenWinner(fixture.num, 'home')}
              className={`px-3 py-1 text-xs rounded border transition font-semibold ${
                matchScores.penWinner === 'home'
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              ⚽ Avanza {homeResolvedName}
            </button>
            <button
              onClick={() => handlePenWinner(fixture.num, 'away')}
              className={`px-3 py-1 text-xs rounded border transition font-semibold ${
                matchScores.penWinner === 'away'
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              ⚽ Avanza {awayResolvedName}
            </button>
          </div>
        </div>
      )}

      {/* Stadium & City info */}
      <div className="mt-3 pt-2 border-t border-slate-800/40 text-[10px] text-slate-500 flex justify-between">
        <span className="truncate max-w-[60%]">{fixture.stadium}</span>
        <span className="font-semibold text-slate-400">{fixture.city.replace('-', ' ').toUpperCase()}</span>
      </div>
    </div>
  );
}
