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
  handlePenScoreChange,
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

  // Final Match Card Design (Larger, golden themed)
  if (isFinal) {
    return (
      <div className="bg-slate-900/60 border-2 border-amber-500/30 rounded-xl p-4 text-xs md:text-sm hover:border-amber-500/60 transition shadow-lg shadow-amber-950/10">
        <div className="text-xs md:text-sm text-amber-400/80 font-bold mb-3 flex justify-between items-center select-none">
          <div className="flex gap-2 items-center">
            <span>Partido {matchNum} - FINAL</span>
            {!disabled && handleRandomizeMatch && (
              <button
                onClick={(e) => { e.stopPropagation(); handleRandomizeMatch(matchNum); }}
                className="p-1 rounded hover:bg-slate-800 text-[11px] transition cursor-pointer leading-none"
                title="Simular aleatoriamente"
              >
                🎲
              </button>
            )}
            {isOfficial && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/30 text-[9px] md:text-[10px] font-bold text-emerald-400">
                OFICIAL
              </span>
            )}
          </div>
          <span className="text-slate-400">{city.toUpperCase().replace('-', ' ')}</span>
        </div>

        {/* Home */}
        <div
          className={`flex items-center justify-between p-2 rounded-lg ${
            winnerSide === 'home' ? 'bg-amber-500/10 text-amber-300 font-bold' : ''
          } ${!disabled ? 'hover:bg-slate-850/50 cursor-pointer transition select-none' : ''}`}
          onClick={() => !disabled && handleQuickPredictWin && handleQuickPredictWin(matchNum, 'home')}
          title={!disabled ? `Haz clic para predecir victoria de ${h || placeholderHome}` : ''}
        >
          <div className="flex items-center gap-2.5 truncate max-w-[80%]">
            <Flag teamName={h} sizeClass="w-6 h-4 md:w-7 md:h-5" />
            <span className="truncate font-semibold text-sm md:text-base">{h || placeholderHome}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isCompleted && s.home === s.away && s.penHome !== null && (
              <span className="text-xs md:text-sm text-amber-400 font-extrabold" title="Goles de Penal">
                ({s.penHome})
              </span>
            )}
            <input
              type="number"
              min="0"
              disabled={disabled}
              value={s.home === null ? '' : s.home}
              onChange={(e) => handleScoreChange(matchNum, 'home', e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={`w-8 h-8 md:w-10 md:h-10 text-center bg-slate-950 border border-slate-800 rounded-lg text-amber-300 text-sm md:text-base font-extrabold focus:outline-none focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                disabled ? 'opacity-70 bg-slate-950/40 text-slate-400 cursor-not-allowed' : ''
              }`}
              placeholder="-"
            />
          </div>
        </div>

        {/* Away */}
        <div
          className={`flex items-center justify-between p-2 rounded-lg mt-3 ${
            winnerSide === 'away' ? 'bg-amber-500/10 text-amber-300 font-bold' : ''
          } ${!disabled ? 'hover:bg-slate-850/50 cursor-pointer transition select-none' : ''}`}
          onClick={() => !disabled && handleQuickPredictWin && handleQuickPredictWin(matchNum, 'away')}
          title={!disabled ? `Haz clic para predecir victoria de ${a || placeholderAway}` : ''}
        >
          <div className="flex items-center gap-2.5 truncate max-w-[80%]">
            <Flag teamName={a} sizeClass="w-6 h-4 md:w-7 md:h-5" />
            <span className="truncate font-semibold text-sm md:text-base">{a || placeholderAway}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isCompleted && s.home === s.away && s.penAway !== null && (
              <span className="text-xs md:text-sm text-amber-400 font-extrabold" title="Goles de Penal">
                ({s.penAway})
              </span>
            )}
            <input
              type="number"
              min="0"
              disabled={disabled}
              value={s.away === null ? '' : s.away}
              onChange={(e) => handleScoreChange(matchNum, 'away', e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={`w-8 h-8 md:w-10 md:h-10 text-center bg-slate-950 border border-slate-800 rounded-lg text-amber-300 text-sm md:text-base font-extrabold focus:outline-none focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                disabled ? 'opacity-70 bg-slate-950/40 text-slate-400 cursor-not-allowed' : ''
              }`}
              placeholder="-"
            />
          </div>
        </div>

        {/* Shootout tie breaker */}
        {isCompleted && s.home === s.away && (
          <div className="mt-3 p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-[10px] text-amber-400 font-bold mb-2">Goles en Penales:</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xs text-slate-400 truncate max-w-[35%]">{h || placeholderHome}</span>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={s.penHome === null ? '' : s.penHome}
                onChange={(e) => handlePenScoreChange(matchNum, 'home', e.target.value)}
                className="w-8 h-7 text-center bg-slate-950 border border-amber-900/60 rounded text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="p"
              />
              <span className="text-amber-500/60 font-semibold">-</span>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={s.penAway === null ? '' : s.penAway}
                onChange={(e) => handlePenScoreChange(matchNum, 'away', e.target.value)}
                className="w-8 h-7 text-center bg-slate-950 border border-amber-900/60 rounded text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="p"
              />
              <span className="text-xs text-slate-400 truncate max-w-[35%]">{a || placeholderAway}</span>
            </div>
            <div className="flex gap-1.5 justify-center">
              <button
                disabled={disabled}
                onClick={() => handlePenWinner(matchNum, 'home')}
                className={`px-3 py-1 rounded text-xs font-semibold border transition max-w-[48%] truncate ${
                  s.penWinner === 'home'
                    ? 'bg-amber-500/25 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-950 border-amber-900/20 text-slate-400 hover:border-amber-500/40'
                }`}
                title={`Avanza ${h || placeholderHome}`}
              >
                🏆 {h || placeholderHome}
              </button>
              <button
                disabled={disabled}
                onClick={() => handlePenWinner(matchNum, 'away')}
                className={`px-3 py-1 rounded text-xs font-semibold border transition max-w-[48%] truncate ${
                  s.penWinner === 'away'
                    ? 'bg-amber-500/25 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-950 border-amber-900/20 text-slate-400 hover:border-amber-500/40'
                }`}
                title={`Avanza ${a || placeholderAway}`}
              >
                🏆 {a || placeholderAway}
              </button>
            </div>
          </div>
        )}

        {isDifferentFromOfficial && (
          <div className="mt-3 p-1.5 bg-emerald-950/20 border border-emerald-900/30 rounded text-xs text-emerald-400 font-extrabold text-center select-none">
            Marcador Real: {officialScore[0]} - {officialScore[1]}
          </div>
        )}

        {isCompleted && winnerSide && (
          <div className="mt-4 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest animate-pulse">👑 ¡Campeón Mundial!</p>
            <p className="text-slate-100 font-extrabold text-base mt-1">
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
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 text-xs md:text-sm hover:border-slate-700 transition">
      <div className="text-[11px] text-slate-500 font-semibold mb-2 flex justify-between items-center select-none">
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
        <div className="flex gap-1.5 items-center">
          {isOfficial && (
            <span className="inline-flex items-center px-1 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/30 text-[8px] md:text-[9px] font-bold text-emerald-400">
              OFICIAL
            </span>
          )}
          <span className="text-[10px]">{city.toUpperCase().replace('-', ' ')}</span>
        </div>
      </div>

      {/* Home */}
      <div
        className={`flex items-center justify-between p-1.5 rounded-lg ${winnerHomeClass} ${
          !disabled ? 'hover:bg-slate-850/50 cursor-pointer transition select-none' : ''
        }`}
        onClick={() => !disabled && handleQuickPredictWin && handleQuickPredictWin(matchNum, 'home')}
        title={!disabled ? `Haz clic para predecir victoria de ${h || placeholderHome}` : ''}
      >
        <div className="flex items-center gap-2 truncate max-w-[80%]">
          <Flag teamName={h} sizeClass="w-5 h-3.5 md:w-6 md:h-4" />
          <span className="truncate text-xs md:text-sm font-semibold">{h || placeholderHome}</span>
        </div>
        <div className="flex items-center gap-1">
          {isCompleted && s.home === s.away && s.penHome !== null && (
            <span className="text-[10px] md:text-xs text-purple-400 font-extrabold mr-1" title="Goles de Penal">
              ({s.penHome})
            </span>
          )}
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={s.home === null ? '' : s.home}
            onChange={(e) => handleScoreChange(matchNum, 'home', e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={`w-7 h-7 md:w-8 md:h-8 text-center bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-extrabold text-xs md:text-sm focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              disabled ? 'opacity-70 bg-slate-950/40 text-slate-400 cursor-not-allowed' : ''
            }`}
            placeholder="-"
          />
        </div>
      </div>

      {/* Away */}
      <div
        className={`flex items-center justify-between p-1.5 rounded-lg mt-2 ${winnerAwayClass} ${
          !disabled ? 'hover:bg-slate-850/50 cursor-pointer transition select-none' : ''
        }`}
        onClick={() => !disabled && handleQuickPredictWin && handleQuickPredictWin(matchNum, 'away')}
        title={!disabled ? `Haz clic para predecir victoria de ${a || placeholderAway}` : ''}
      >
        <div className="flex items-center gap-2 truncate max-w-[80%]">
          <Flag teamName={a} sizeClass="w-5 h-3.5 md:w-6 md:h-4" />
          <span className="truncate text-xs md:text-sm font-semibold">{a || placeholderAway}</span>
        </div>
        <div className="flex items-center gap-1">
          {isCompleted && s.home === s.away && s.penAway !== null && (
            <span className="text-[10px] md:text-xs text-purple-400 font-extrabold mr-1" title="Goles de Penal">
              ({s.penAway})
            </span>
          )}
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={s.away === null ? '' : s.away}
            onChange={(e) => handleScoreChange(matchNum, 'away', e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={`w-7 h-7 md:w-8 md:h-8 text-center bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-extrabold text-xs md:text-sm focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              disabled ? 'opacity-70 bg-slate-950/40 text-slate-400 cursor-not-allowed' : ''
            }`}
            placeholder="-"
          />
        </div>
      </div>

      {/* Shootout selector if tie */}
      {isCompleted && s.home === s.away && (
        <div className="mt-2.5 p-1.5 bg-purple-950/10 border border-purple-900/20 rounded-lg text-center" onClick={(e) => e.stopPropagation()}>
          <p className="text-[9px] text-purple-400 font-bold mb-1">Goles en Penales:</p>
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <input
              type="number"
              min="0"
              disabled={disabled}
              value={s.penHome === null ? '' : s.penHome}
              onChange={(e) => handlePenScoreChange(matchNum, 'home', e.target.value)}
              className="w-7 h-6 text-center bg-slate-950 border border-purple-900/60 rounded text-[10px] font-bold text-purple-300 focus:outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="p"
            />
            <span className="text-purple-500/60 font-semibold text-xs">-</span>
            <input
              type="number"
              min="0"
              disabled={disabled}
              value={s.penAway === null ? '' : s.penAway}
              onChange={(e) => handlePenScoreChange(matchNum, 'away', e.target.value)}
              className="w-7 h-6 text-center bg-slate-950 border border-purple-900/60 rounded text-[10px] font-bold text-purple-300 focus:outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="p"
            />
          </div>
          <div className="flex gap-1 justify-center">
            <button
              disabled={disabled}
              onClick={() => handlePenWinner(matchNum, 'home')}
              className={`px-2 py-0.5 rounded text-[9px] font-semibold border transition max-w-[48%] truncate ${
                s.penWinner === 'home'
                  ? 'bg-purple-600/25 border-purple-500 text-purple-200 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
              title={`Avanza ${h || placeholderHome}`}
            >
              {h || placeholderHome}
            </button>
            <button
              disabled={disabled}
              onClick={() => handlePenWinner(matchNum, 'away')}
              className={`px-2 py-0.5 rounded text-[9px] font-semibold border transition max-w-[48%] truncate ${
                s.penWinner === 'away'
                  ? 'bg-purple-600/25 border-purple-500 text-purple-200 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
              title={`Avanza ${a || placeholderAway}`}
            >
              {a || placeholderAway}
            </button>
          </div>
        </div>
      )}

      {isDifferentFromOfficial && (
        <div className="mt-2 p-1 bg-emerald-950/20 border border-emerald-900/30 rounded text-[10px] md:text-xs text-emerald-450 font-extrabold text-center select-none">
          Real: {officialScore[0]} - {officialScore[1]}
        </div>
      )}
    </div>
  );
}
