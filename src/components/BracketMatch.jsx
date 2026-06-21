import React from 'react';
import Flag from './Flag';

export default function BracketMatch({
  matchNum,
  city,
  homeResolvedName,
  awayResolvedName,
  matchScores,
  disabled = false,
  isOfficial = false,
  officialScore = null,
  handleScoreChange,
  handlePenWinner,
  handleQuickPredictWin,
  handleRandomizeMatch,
  placeholderHome = '',
  placeholderAway = '',
  isFinal = false,
  isThirdPlace = false
}) {
  const h = homeResolvedName;
  const a = awayResolvedName;
  const s = matchScores || { home: null, away: null, penWinner: null };
  const isCompleted = s.home !== null && s.away !== null;

  let winnerSide = null;
  if (isCompleted) {
    if (s.home > s.away) winnerSide = 'home';
    else if (s.home < s.away) winnerSide = 'away';
    else winnerSide = s.penWinner;
  }

  // Check if simulation differs from reality
  const isDifferentFromOfficial = isOfficial && officialScore && (
    s.home !== officialScore[0] || s.away !== officialScore[1]
  );

  // Final Match Card Design
  if (isFinal) {
    return (
      <div className="bg-slate-900/60 border-2 border-amber-500/30 rounded-xl p-3.5 text-xs hover:border-amber-500/60 transition shadow-lg shadow-amber-950/10">
        <div className="text-[10px] text-amber-400/80 font-bold mb-2 flex justify-between items-center select-none">
          <div className="flex gap-1.5 items-center">
            <span>Partido {matchNum} - FINAL</span>
            {!disabled && handleRandomizeMatch && (
              <button
                onClick={(e) => { e.stopPropagation(); handleRandomizeMatch(matchNum); }}
                className="p-0.5 rounded hover:bg-slate-800 text-[10px] transition cursor-pointer leading-none"
                title="Simular aleatoriamente"
              >
                🎲
              </button>
            )}
            {isOfficial && (
              <span className="inline-flex items-center px-1 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/30 text-[8px] font-bold text-emerald-400">
                OFICIAL
              </span>
            )}
          </div>
          <span>{city.toUpperCase().replace('-', ' ')}</span>
        </div>

        {/* Home */}
        <div
          className={`flex items-center justify-between p-1.5 rounded ${
            winnerSide === 'home' ? 'bg-amber-500/10 text-amber-300 font-bold' : ''
          } ${!disabled ? 'hover:bg-slate-850/50 cursor-pointer transition select-none' : ''}`}
          onClick={() => !disabled && handleQuickPredictWin && handleQuickPredictWin(matchNum, 'home')}
          title={!disabled ? `Haz clic para predecir victoria de ${h || placeholderHome}` : ''}
        >
          <div className="flex items-center gap-1.5 truncate max-w-[80%]">
            <Flag teamName={h} sizeClass="w-5 h-3.5" />
            <span className="truncate font-semibold text-sm">{h || placeholderHome}</span>
          </div>
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={s.home === null ? '' : s.home}
            onChange={(e) => handleScoreChange(matchNum, 'home', e.target.value)}
            onClick={(e) => e.stopPropagation()} // Prevent triggering quick prediction on input click
            className={`w-7 h-7 text-center bg-slate-950 border border-slate-800 rounded text-amber-300 text-sm font-extrabold focus:outline-none focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              disabled ? 'opacity-70 bg-slate-950/40 text-slate-400 cursor-not-allowed' : ''
            }`}
            placeholder="-"
          />
        </div>

        {/* Away */}
        <div
          className={`flex items-center justify-between p-1.5 rounded mt-2.5 ${
            winnerSide === 'away' ? 'bg-amber-500/10 text-amber-300 font-bold' : ''
          } ${!disabled ? 'hover:bg-slate-850/50 cursor-pointer transition select-none' : ''}`}
          onClick={() => !disabled && handleQuickPredictWin && handleQuickPredictWin(matchNum, 'away')}
          title={!disabled ? `Haz clic para predecir victoria de ${a || placeholderAway}` : ''}
        >
          <div className="flex items-center gap-1.5 truncate max-w-[80%]">
            <Flag teamName={a} sizeClass="w-5 h-3.5" />
            <span className="truncate font-semibold text-sm">{a || placeholderAway}</span>
          </div>
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={s.away === null ? '' : s.away}
            onChange={(e) => handleScoreChange(matchNum, 'away', e.target.value)}
            onClick={(e) => e.stopPropagation()} // Prevent triggering quick prediction on input click
            className={`w-7 h-7 text-center bg-slate-950 border border-slate-800 rounded text-amber-300 text-sm font-extrabold focus:outline-none focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              disabled ? 'opacity-70 bg-slate-950/40 text-slate-400 cursor-not-allowed' : ''
            }`}
            placeholder="-"
          />
        </div>

        {/* Shootout tie breaker */}
        {isCompleted && s.home === s.away && !s.penWinner && (
          <div className="mt-3 text-center">
            <p className="text-[9px] text-amber-400 font-semibold mb-1">Campeón por Penales:</p>
            <div className="flex gap-1.5 justify-center">
              <button
                disabled={disabled}
                onClick={(e) => { e.stopPropagation(); handlePenWinner(matchNum, 'home'); }}
                className="px-2.5 py-1 bg-slate-950 border border-amber-900/40 rounded text-[9px] text-amber-300 font-bold hover:border-amber-500 transition"
              >
                Home
              </button>
              <button
                disabled={disabled}
                onClick={(e) => { e.stopPropagation(); handlePenWinner(matchNum, 'away'); }}
                className="px-2.5 py-1 bg-slate-950 border border-amber-900/40 rounded text-[9px] text-amber-300 font-bold hover:border-amber-500 transition"
              >
                Away
              </button>
            </div>
          </div>
        )}

        {isDifferentFromOfficial && (
          <div className="mt-2 p-1.5 bg-emerald-950/20 border border-emerald-900/30 rounded text-[9px] text-emerald-400 font-bold text-center select-none">
            Marcador Real: {officialScore[0]} - {officialScore[1]}
          </div>
        )}

        {isCompleted && winnerSide && (
          <div className="mt-4 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest animate-pulse">👑 ¡Campeón Mundial!</p>
            <p className="text-slate-100 font-extrabold text-sm mt-1">
              {winnerSide === 'home' ? h : a}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Regular Bracket or Third Place Match
  const winnerHomeClass = winnerSide === 'home'
    ? (isThirdPlace ? 'bg-amber-900/10 text-amber-300 font-semibold' : 'bg-emerald-950/20 text-emerald-300 font-semibold')
    : '';

  const winnerAwayClass = winnerSide === 'away'
    ? (isThirdPlace ? 'bg-amber-900/10 text-amber-300 font-semibold' : 'bg-emerald-950/20 text-emerald-300 font-semibold')
    : '';

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-2.5 text-xs hover:border-slate-700 transition">
      <div className="text-[10px] text-slate-500 font-semibold mb-1.5 flex justify-between items-center select-none">
        <div className="flex gap-1.5 items-center">
          <span>Partido {matchNum}</span>
          {!disabled && handleRandomizeMatch && (
            <button
              onClick={(e) => { e.stopPropagation(); handleRandomizeMatch(matchNum); }}
              className="p-0.5 rounded hover:bg-slate-800 text-[10px] transition cursor-pointer leading-none"
              title="Simular aleatoriamente"
            >
              🎲
            </button>
          )}
        </div>
        <div className="flex gap-1 items-center">
          {isOfficial && (
            <span className="inline-flex items-center px-1 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/30 text-[8px] font-bold text-emerald-400">
              OFICIAL
            </span>
          )}
          <span>{city.toUpperCase().replace('-', ' ')}</span>
        </div>
      </div>

      {/* Home */}
      <div
        className={`flex items-center justify-between p-1 rounded ${winnerHomeClass} ${
          !disabled ? 'hover:bg-slate-850/50 cursor-pointer transition select-none' : ''
        }`}
        onClick={() => !disabled && handleQuickPredictWin && handleQuickPredictWin(matchNum, 'home')}
        title={!disabled ? `Haz clic para predecir victoria de ${h || placeholderHome}` : ''}
      >
        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
          <Flag teamName={h} sizeClass="w-4 h-3" />
          <span className="truncate">{h || placeholderHome}</span>
        </div>
        <input
          type="number"
          min="0"
          disabled={disabled}
          value={s.home === null ? '' : s.home}
          onChange={(e) => handleScoreChange(matchNum, 'home', e.target.value)}
          onClick={(e) => e.stopPropagation()} // Prevent triggering quick prediction on input click
          className={`w-6 h-6 text-center bg-slate-950 border border-slate-800 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            disabled ? 'opacity-70 bg-slate-950/40 text-slate-400 cursor-not-allowed' : ''
          }`}
          placeholder="-"
        />
      </div>

      {/* Away */}
      <div
        className={`flex items-center justify-between p-1 rounded mt-1.5 ${winnerAwayClass} ${
          !disabled ? 'hover:bg-slate-850/50 cursor-pointer transition select-none' : ''
        }`}
        onClick={() => !disabled && handleQuickPredictWin && handleQuickPredictWin(matchNum, 'away')}
        title={!disabled ? `Haz clic para predecir victoria de ${a || placeholderAway}` : ''}
      >
        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
          <Flag teamName={a} sizeClass="w-4 h-3" />
          <span className="truncate">{a || placeholderAway}</span>
        </div>
        <input
          type="number"
          min="0"
          disabled={disabled}
          value={s.away === null ? '' : s.away}
          onChange={(e) => handleScoreChange(matchNum, 'away', e.target.value)}
          onClick={(e) => e.stopPropagation()} // Prevent triggering quick prediction on input click
          className={`w-6 h-6 text-center bg-slate-950 border border-slate-800 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            disabled ? 'opacity-70 bg-slate-950/40 text-slate-400 cursor-not-allowed' : ''
          }`}
          placeholder="-"
        />
      </div>

      {/* Shootout selector if tie */}
      {isCompleted && s.home === s.away && !s.penWinner && (
        <div className="mt-2 text-center">
          <p className="text-[8px] text-purple-400 mb-1">Definir penales:</p>
          <div className="flex gap-1 justify-center">
            <button
              disabled={disabled}
              onClick={(e) => { e.stopPropagation(); handlePenWinner(matchNum, 'home'); }}
              className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:border-purple-500 rounded text-[9px] text-purple-400 hover:border-purple-300 transition animate-pulse"
            >
              Home
            </button>
            <button
              disabled={disabled}
              onClick={(e) => { e.stopPropagation(); handlePenWinner(matchNum, 'away'); }}
              className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:border-purple-500 rounded text-[9px] text-purple-400 hover:border-purple-300 transition animate-pulse"
            >
              Away
            </button>
          </div>
        </div>
      )}

      {isDifferentFromOfficial && (
        <div className="mt-1.5 p-1 bg-emerald-950/20 border border-emerald-900/30 rounded text-[9px] text-emerald-400 font-bold text-center select-none">
          Marcador Real: {officialScore[0]} - {officialScore[1]}
        </div>
      )}
    </div>
  );
}
