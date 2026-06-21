import React from 'react';
import Flag from './Flag';

export default function GroupsTab({ groupStandings }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(groupStandings).map(([groupLetter, teams]) => (
        <div
          key={groupLetter}
          className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition duration-200"
        >
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <h3 className="font-bold text-lg text-emerald-400">Grupo {groupLetter}</h3>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80 uppercase">
              1ra y 2da Ronda
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800/60">
                  <th className="py-2 font-medium w-6">#</th>
                  <th className="py-2 font-medium">Equipo</th>
                  <th className="py-2 font-medium text-center w-8">PTS</th>
                  <th className="py-2 font-medium text-center w-6">PJ</th>
                  <th className="py-2 font-medium text-center w-6">DG</th>
                  <th className="py-2 font-medium text-center w-6">GF</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, idx) => {
                  const isQualifying = idx < 2;
                  const isThird = idx === 2;

                  return (
                    <tr
                      key={t.name}
                      className={`border-b border-slate-800/30 hover:bg-slate-850/20 transition ${
                        isQualifying
                          ? 'bg-emerald-950/5 text-slate-100'
                          : isThird
                          ? 'bg-purple-950/5 text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      <td className="py-2.5">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isQualifying
                              ? 'bg-emerald-900/60 text-emerald-300'
                              : isThird
                              ? 'bg-purple-900/40 text-purple-300'
                              : 'bg-slate-800 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-2.5 font-semibold">
                        <div className="flex items-center gap-2">
                          <Flag teamName={t.name} />
                          <span className="truncate max-w-[120px]">{t.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-center font-bold text-slate-200">{t.pts}</td>
                      <td className="py-2.5 text-center text-slate-400">{t.pld}</td>
                      <td className="py-2.5 text-center font-medium text-slate-300">
                        {t.gd > 0 ? `+${t.gd}` : t.gd}
                      </td>
                      <td className="py-2.5 text-center text-slate-400">{t.gf}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-2 text-[9px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Clasifica Directo
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Zona de 3ros
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
