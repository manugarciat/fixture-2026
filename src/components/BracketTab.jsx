import React from 'react';
import BracketMatch from './BracketMatch';
import fixturesData from '../data/fixtures.json';

export default function BracketTab({
  scores,
  realResults,
  viewMode,
  resolvedTeams,
  handleScoreChange,
  handlePenWinner,
  handleQuickPredictWin
}) {
  const getPlaceholder = (rawName) => {
    if (!rawName) return '';
    if (rawName.startsWith('Winner Match')) {
      return `Ganador Match ${rawName.split('Match ')[1]}`;
    }
    if (rawName.startsWith('Loser Match')) {
      return `Perdedor Match ${rawName.split('Match ')[1]}`;
    }
    return rawName;
  };

  const getMatchProps = (num) => {
    const f = fixturesData.find(m => m.num === num);
    const h = resolvedTeams[`${num}_home`];
    const a = resolvedTeams[`${num}_away`];
    const s = scores[num] || { home: null, away: null, penWinner: null };
    const officialScore = realResults[num];

    return {
      matchNum: num,
      city: f?.city || '',
      homeResolvedName: h,
      awayResolvedName: a,
      matchScores: s,
      disabled: viewMode === 'official',
      isOfficial: officialScore !== undefined,
      officialScore: officialScore,
      handleScoreChange: handleScoreChange,
      handlePenWinner: handlePenWinner,
      handleQuickPredictWin: handleQuickPredictWin,
      placeholderHome: getPlaceholder(f?.home),
      placeholderAway: getPlaceholder(f?.away)
    };
  };

  return (
    <div className="flex flex-col gap-8 overflow-x-auto pb-8 scrollbar-thin">
      {/* Quick Helper */}
      <div className="bg-purple-950/10 border border-purple-900/30 rounded-xl p-4 max-w-2xl mx-auto text-center">
        <h4 className="text-purple-300 font-bold text-sm mb-1">Simulación del Cuadro</h4>
        <p className="text-slate-400 text-xs">
          Los cruces de los Dieciseisavos de Final se calculan automáticamente de acuerdo al reglamento del **Anexo C de la FIFA** basándose en los grupos de los mejores terceros clasificados. Introduce resultados para avanzar a los equipos.
        </p>
      </div>

      {/* Bracket Flow columns */}
      <div className="min-w-[1200px] grid grid-cols-5 gap-4 mt-6">
        {/* ROUND OF 32 */}
        <div className="flex flex-col justify-around gap-4">
          <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-800 pb-1">
            Dieciseisavos (32)
          </div>
          {[73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88].map(num => (
            <BracketMatch key={num} {...getMatchProps(num)} />
          ))}
        </div>

        {/* ROUND OF 16 */}
        <div className="flex flex-col justify-around gap-8">
          <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-800 pb-1">
            Octavos de Final (16)
          </div>
          {[89, 90, 91, 92, 93, 94, 95, 96].map(num => (
            <BracketMatch key={num} {...getMatchProps(num)} />
          ))}
        </div>

        {/* QUARTER FINALS */}
        <div className="flex flex-col justify-around gap-16">
          <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-800 pb-1">
            Cuartos de Final (8)
          </div>
          {[97, 98, 99, 100].map(num => (
            <BracketMatch key={num} {...getMatchProps(num)} />
          ))}
        </div>

        {/* SEMI FINALS */}
        <div className="flex flex-col justify-around gap-24">
          <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-800 pb-1">
            Semifinales (4)
          </div>
          {[101, 102].map(num => (
            <BracketMatch key={num} {...getMatchProps(num)} />
          ))}
        </div>

        {/* FINAL & 3RD PLACE */}
        <div className="flex flex-col justify-around gap-12">
          {/* FINAL */}
          <div>
            <div className="text-center font-bold text-xs uppercase tracking-wider text-amber-500 mb-2 border-b border-slate-800 pb-1">
              🏆 Gran Final
            </div>
            <BracketMatch {...getMatchProps(104)} isFinal={true} />
          </div>

          {/* THIRD PLACE */}
          <div>
            <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-800 pb-1">
              🥉 Tercer Puesto
            </div>
            <BracketMatch {...getMatchProps(103)} isThirdPlace={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
