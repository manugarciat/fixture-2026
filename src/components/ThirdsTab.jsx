import React from 'react';
import Flag from './Flag';

export default function ThirdsTab({ thirdPlaceRankings }) {
  return (
    <div className="max-w-3xl mx-auto bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6">
      <h3 className="font-bold text-xl text-slate-200 mb-2">Tabla de Terceros Clasificados</h3>
      <p className="text-slate-400 text-xs mb-6">
        Los 12 equipos que finalicen en tercer lugar de sus respectivos grupos se comparan en esta tabla. Los 8 mejores avanzan a los Dieciseisavos de Final.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800">
              <th className="py-3 font-semibold w-8">#</th>
              <th className="py-3 font-semibold w-16">Grupo</th>
              <th className="py-3 font-semibold">Equipo</th>
              <th className="py-3 font-semibold text-center w-12">PTS</th>
              <th className="py-3 font-semibold text-center w-10">PJ</th>
              <th className="py-3 font-semibold text-center w-10">DG</th>
              <th className="py-3 font-semibold text-center w-10">GF</th>
              <th className="py-3 font-semibold text-right w-24">Estado</th>
            </tr>
          </thead>
          <tbody>
            {thirdPlaceRankings.map((t, idx) => {
              const isAdvancing = idx < 8;
              return (
                <tr
                  key={t.name}
                  className={`border-b border-slate-800/40 hover:bg-slate-850/30 transition ${
                    isAdvancing ? 'bg-emerald-950/5 text-slate-200' : 'text-slate-500 bg-rose-950/5'
                  }`}
                >
                  <td className="py-3 font-bold">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isAdvancing
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : 'bg-rose-950 border border-rose-800 text-rose-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-400">Grupo {t.group}</td>
                  <td className="py-3 font-semibold">
                    <div className="flex items-center gap-2">
                      <Flag teamName={t.name} />
                      <span>{t.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center font-bold text-slate-200">{t.pts}</td>
                  <td className="py-3 text-center text-slate-400">{t.pld}</td>
                  <td className="py-3 text-center font-semibold text-slate-300">
                    {t.gd > 0 ? `+${t.gd}` : t.gd}
                  </td>
                  <td className="py-3 text-center text-slate-400">{t.gf}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        isAdvancing
                          ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-400'
                          : 'bg-rose-950/80 border border-rose-800/80 text-rose-400'
                      }`}
                    >
                      {isAdvancing ? 'Avanza' : 'Eliminado'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
