import React from 'react';
import Flag from './Flag';
import { STAGE_LABELS } from '../constants';

export default function MatchCard({
  fixture,
  homeResolvedName,
  awayResolvedName,
  matchScores,
  disabled = false,
  isOfficial = false,
  officialScore = null,
  handleScoreChange,
  handlePenWinner,
  handleQuickPredictWin,
  handleRandomizeMatch
}) {
  const isKnockout = fixture.stage !== 'group-stage';
  const showPenaltiesInput = isKnockout && matchScores.home !== null && matchScores.away !== null && matchScores.home === matchScores.away;

  // Check if simulation differs from reality
  const isDifferentFromOfficial = isOfficial && officialScore && (
    matchScores.home !== officialScore[0] || matchScores.away !== officialScore[1]
  );

  return (
    <div
      className={`relative bg-slate-900/60 backdrop-blur-sm border rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition duration-200 ${
        isKnockout ? 'border-slate-800/80 shadow-purple-950/5 shadow-md' : 'border-slate-800'
      }`}
    >
      {/* Match header info */}
      <div className="flex justify-between items-center text-xs text-slate-500 mb-3 border-b border-slate-800/60 pb-2">
        <span className="font-semibold text-slate-400">Match #{fixture.num}</span>
        <div className="flex gap-2 items-center">
          {isOfficial && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/30 text-[9px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              OFICIAL
            </span>
          )}
          <span className="font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-slate-400">
            {fixture.group ? `Grupo ${fixture.group}` : STAGE_LABELS[fixture.stage]}
          </span>
          <span>{fixture.date} ({fixture.time} UTC)</span>
        </div>
      </div>

      {/* Score inputs block */}
      <div className="grid grid-cols-12 items-center gap-2 my-2">
        {/* Home Team */}
        <div
          className={`col-span-5 flex items-center gap-3 ${
            !disabled ? 'hover:bg-slate-850/60 cursor-pointer rounded px-1.5 py-1 -mx-1.5 transition select-none' : ''
          }`}
          onClick={() => !disabled && handleQuickPredictWin && handleQuickPredictWin(fixture.num, 'home')}
          title={!disabled ? `Haz clic para predecir victoria de ${homeResolvedName}` : ''}
        >
          <Flag teamName={homeResolvedName} />
          <span className="text-sm font-semibold truncate text-slate-200" title={homeResolvedName}>
            {homeResolvedName}
          </span>
        </div>

        {/* Scores */}
        <div className="col-span-2 flex flex-col items-center justify-center select-none">
          <div className="flex items-center justify-center gap-1">
            <input
              type="number"
              min="0"
              max="99"
              disabled={disabled}
              value={matchScores.home === null ? '' : matchScores.home}
              onChange={(e) => handleScoreChange(fixture.num, 'home', e.target.value)}
              className={`w-8 h-8 text-center bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded text-sm font-bold text-slate-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                disabled ? 'opacity-70 cursor-not-allowed bg-slate-950/40 text-slate-400' : ''
              }`}
              placeholder="-"
            />
            <span className="text-slate-650 font-bold text-xs">:</span>
            <input
              type="number"
              min="0"
              max="99"
              disabled={disabled}
              value={matchScores.away === null ? '' : matchScores.away}
              onChange={(e) => handleScoreChange(fixture.num, 'away', e.target.value)}
              className={`w-8 h-8 text-center bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded text-sm font-bold text-slate-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                disabled ? 'opacity-70 cursor-not-allowed bg-slate-950/40 text-slate-400' : ''
              }`}
              placeholder="-"
            />
          </div>
          <div className="flex flex-col items-center gap-1 mt-1.5">
            {!disabled && handleRandomizeMatch && (
              <button
                onClick={(e) => { e.stopPropagation(); handleRandomizeMatch(fixture.num); }}
                className="p-1 rounded bg-slate-950 border border-slate-800 hover:border-purple-500 hover:text-purple-400 text-slate-500 text-[10px] transition cursor-pointer leading-none"
                title="Simular marcador aleatoriamente"
              >
                🎲
              </button>
            )}
            {isDifferentFromOfficial && (
              <div className="text-[9px] text-emerald-500 font-bold bg-emerald-950/20 border border-emerald-900/30 px-1 py-0.5 rounded shadow-sm whitespace-nowrap">
                Real: {officialScore[0]}-{officialScore[1]}
              </div>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div
          className={`col-span-5 flex items-center justify-end gap-3 text-right ${
            !disabled ? 'hover:bg-slate-850/60 cursor-pointer rounded px-1.5 py-1 -mx-1.5 transition select-none' : ''
          }`}
          onClick={() => !disabled && handleQuickPredictWin && handleQuickPredictWin(fixture.num, 'away')}
          title={!disabled ? `Haz clic para predecir victoria de ${awayResolvedName}` : ''}
        >
          <span className="text-sm font-semibold truncate text-slate-200" title={awayResolvedName}>
            {awayResolvedName}
          </span>
          <Flag teamName={awayResolvedName} />
        </div>
      </div>

      {/* Penalty tie-breaker for Knockouts */}
      {showPenaltiesInput && (
        <div className="mt-3 p-2 bg-purple-950/10 border border-purple-900/30 rounded-lg text-center">
          <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-2">
            Empate - Define quién avanza
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handlePenWinner(fixture.num, 'home')}
              disabled={disabled}
              className={`px-3 py-1 text-xs rounded border transition font-semibold ${
                matchScores.penWinner === 'home'
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              ⚽ Avanza {homeResolvedName}
            </button>
            <button
              onClick={() => handlePenWinner(fixture.num, 'away')}
              disabled={disabled}
              className={`px-3 py-1 text-xs rounded border transition font-semibold ${
                matchScores.penWinner === 'away'
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
