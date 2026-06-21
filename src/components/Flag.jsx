import React from 'react';
import { TEAM_FLAGS } from '../constants';

export default function Flag({ teamName, sizeClass = "w-6 h-4" }) {
  const code = TEAM_FLAGS[teamName];
  if (code) {
    return (
      <img
        src={`https://flagcdn.com/w40/${code}.png`}
        alt={`Bandera de ${teamName}`}
        className={`${sizeClass} object-cover rounded shadow-sm`}
        loading="lazy"
      />
    );
  }
  return (
    <div className={`${sizeClass} bg-slate-800 border border-slate-700 flex items-center justify-center rounded text-[10px] font-bold text-slate-400 select-none`}>
      ?
    </div>
  );
}
