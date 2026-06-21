import React, { useState, useEffect, useMemo } from 'react';
import fixturesData from './data/fixtures.json';
import thirdPlaceMapping from './data/third_place_mapping.json';
import realResults from './data/real_results.json';
import './App.css';

import { STAGE_LABELS } from './constants';
import {
  serializeScores,
  deserializeScores,
  calculateGroupStandings,
  calculateThirdPlaceRankings,
  resolveKnockoutTeams
} from './utils';

import Header from './components/Header';
import FixtureTab from './components/FixtureTab';
import GroupsTab from './components/GroupsTab';
import ThirdsTab from './components/ThirdsTab';
import BracketTab from './components/BracketTab';

export default function App() {
  const [scores, setScores] = useState(() => {
    // 1. Try URL parameters first
    const params = new URLSearchParams(window.location.search);
    const sharedScores = params.get('s');
    if (sharedScores) {
      try {
        return deserializeScores(sharedScores);
      } catch (e) {
        console.error("Error reading shared scores:", e);
      }
    }
    // 2. Try localStorage
    const saved = localStorage.getItem('world_cup_2026_scores');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading saved scores:", e);
      }
    }
    // 3. Fallback: load real results by default
    const initial = {};
    for (let i = 1; i <= 104; i++) {
      const real = realResults[i];
      if (real) {
        initial[i] = { home: real[0], away: real[1], penWinner: null };
      } else {
        initial[i] = { home: null, away: null, penWinner: null };
      }
    }
    return initial;
  });

  const [activeTab, setActiveTab] = useState('fixture');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('All');
  const [selectedStageFilter, setSelectedStageFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('world_cup_2026_scores', JSON.stringify(scores));
  }, [scores]);

  // Show notification helpers
  const showNotification = (message, type = 'success') => {
    setNotification({ text: message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Score handlers
  const handleScoreChange = (matchNum, team, value) => {
    const val = value === '' ? null : parseInt(value, 10);
    setScores(prev => {
      const matchScores = { ...prev[matchNum], [team]: val };
      // Clear penWinner if score is not a tie
      if (matchScores.home !== matchScores.away || matchScores.home === null) {
        matchScores.penWinner = null;
      }
      return { ...prev, [matchNum]: matchScores };
    });
  };

  const handlePenWinner = (matchNum, winner) => {
    setScores(prev => ({
      ...prev,
      [matchNum]: { ...prev[matchNum], penWinner: winner }
    }));
  };

  const resetScores = () => {
    if (window.confirm("¿Seguro que deseas borrar todas tus simulaciones?")) {
      const initial = {};
      for (let i = 1; i <= 104; i++) {
        initial[i] = { home: null, away: null, penWinner: null };
      }
      setScores(initial);
      // Clean query string
      window.history.replaceState({}, document.title, window.location.pathname);
      showNotification("Simulador reiniciado correctamente");
    }
  };

  const lastRealMatchDate = useMemo(() => {
    let latestMatch = null;
    Object.keys(realResults).forEach(numStr => {
      const num = parseInt(numStr, 10);
      const fixture = fixturesData.find(f => f.num === num);
      if (fixture) {
        if (!latestMatch || fixture.date > latestMatch.date) {
          latestMatch = fixture;
        }
      }
    });
    if (!latestMatch) return null;
    const [year, month, day] = latestMatch.date.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthName = months[parseInt(month, 10) - 1];
    return `${parseInt(day, 10)} de ${monthName}`;
  }, []);

  const loadRealResults = () => {
    const dateStr = lastRealMatchDate ? ` hasta el ${lastRealMatchDate}` : '';
    if (window.confirm(`¿Deseas cargar los resultados reales jugados${dateStr}?`)) {
      setScores(prev => {
        const next = { ...prev };
        for (let [numStr, score] of Object.entries(realResults)) {
          next[parseInt(numStr, 10)] = { home: score[0], away: score[1], penWinner: null };
        }
        return next;
      });
      showNotification("Resultados oficiales cargados");
    }
  };

  const simulateRandomly = () => {
    setScores(prev => {
      const next = { ...prev };
      // Group Stage (1 to 72)
      for (let i = 1; i <= 72; i++) {
        const homeScore = Math.floor(Math.random() * 4);
        const awayScore = Math.floor(Math.random() * 4);
        next[i] = { home: homeScore, away: awayScore, penWinner: null };
      }
      return next;
    });
    showNotification("Fase de grupos simulada aleatoriamente");
  };

  const sharePredictions = () => {
    const code = serializeScores(scores);
    const url = `${window.location.origin}${window.location.pathname}?s=${code}`;
    navigator.clipboard.writeText(url).then(() => {
      showNotification("¡Enlace de pronósticos copiado al portapapeles!");
    }).catch(err => {
      console.error('Could not copy text: ', err);
      showNotification("Error al copiar enlace", "error");
    });
  };

  // Memoized calculations
  const groupStandings = useMemo(() => {
    return calculateGroupStandings(scores, fixturesData);
  }, [scores]);

  const thirdPlaceRankings = useMemo(() => {
    return calculateThirdPlaceRankings(groupStandings);
  }, [groupStandings]);

  const bestThirdsGroups = useMemo(() => {
    return thirdPlaceRankings.slice(0, 8).map(t => t.group).sort().join('');
  }, [thirdPlaceRankings]);

  const resolvedTeams = useMemo(() => {
    return resolveKnockoutTeams(scores, groupStandings, bestThirdsGroups, thirdPlaceMapping, fixturesData);
  }, [scores, groupStandings, bestThirdsGroups]);

  const filteredFixtures = useMemo(() => {
    return fixturesData.filter(f => {
      // 1. Group Stage Filter
      if (selectedGroupFilter !== 'All') {
        if (f.group !== selectedGroupFilter) return false;
      }
      // 2. Stage Filter
      if (selectedStageFilter !== 'All') {
        if (f.stage !== selectedStageFilter) return false;
      }
      // 3. Search Query (Team, Stadium or City)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const homeResolved = resolvedTeams[`${f.num}_home`]?.toLowerCase() || '';
        const awayResolved = resolvedTeams[`${f.num}_away`]?.toLowerCase() || '';
        const stadium = f.stadium.toLowerCase();
        const city = f.city.toLowerCase();
        const groupLabel = f.group ? `grupo ${f.group.toLowerCase()}` : '';
        const stageLabel = STAGE_LABELS[f.stage].toLowerCase();

        return homeResolved.includes(query) ||
          awayResolved.includes(query) ||
          stadium.includes(query) ||
          city.includes(query) ||
          groupLabel.includes(query) ||
          stageLabel.includes(query);
      }
      return true;
    });
  }, [selectedGroupFilter, selectedStageFilter, searchQuery, resolvedTeams]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 font-sans pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300 ${
          notification.type === 'error'
            ? 'bg-rose-950/80 border-rose-800 text-rose-200'
            : 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
        }`}>
          <span className="font-medium text-sm">{notification.text}</span>
        </div>
      )}

      {/* Hero Header */}
      <Header
        lastRealMatchDate={lastRealMatchDate}
        loadRealResults={loadRealResults}
        simulateRandomly={simulateRandomly}
        sharePredictions={sharePredictions}
        resetScores={resetScores}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 mb-6 overflow-x-auto scrollbar-none gap-2">
          <button
            onClick={() => setActiveTab('fixture')}
            className={`py-3 px-4 font-semibold text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
              activeTab === 'fixture'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📅 Partidos & Fixture
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-3 px-4 font-semibold text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
              activeTab === 'groups'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Tablas de Grupos
          </button>
          <button
            onClick={() => setActiveTab('thirds')}
            className={`py-3 px-4 font-semibold text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
              activeTab === 'thirds'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🏅 Mejores Terceros
          </button>
          <button
            onClick={() => setActiveTab('bracket')}
            className={`py-3 px-4 font-semibold text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
              activeTab === 'bracket'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🏆 Cuadro de Eliminatorias
          </button>
        </div>

        {/* TAB 1: FIXTURE */}
        {activeTab === 'fixture' && (
          <FixtureTab
            scores={scores}
            resolvedTeams={resolvedTeams}
            handleScoreChange={handleScoreChange}
            handlePenWinner={handlePenWinner}
            selectedGroupFilter={selectedGroupFilter}
            setSelectedGroupFilter={setSelectedGroupFilter}
            selectedStageFilter={selectedStageFilter}
            setSelectedStageFilter={setSelectedStageFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredFixtures={filteredFixtures}
          />
        )}

        {/* TAB 2: GROUPS */}
        {activeTab === 'groups' && (
          <GroupsTab groupStandings={groupStandings} />
        )}

        {/* TAB 3: THIRDS */}
        {activeTab === 'thirds' && (
          <ThirdsTab thirdPlaceRankings={thirdPlaceRankings} />
        )}

        {/* TAB 4: BRACKET */}
        {activeTab === 'bracket' && (
          <BracketTab
            scores={scores}
            resolvedTeams={resolvedTeams}
            handleScoreChange={handleScoreChange}
            handlePenWinner={handlePenWinner}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto text-center text-slate-600 text-xs mt-16 pt-8 border-t border-slate-900">
        <p>
          © 2026 Fixture & Simulador del Mundial de Fútbol 2026. Hecho por{' '}
          <a
            href="https://github.com/manugarciat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 hover:underline transition"
          >
            @manugarciat
          </a>{' '}
          con ayuda de Gemini.
        </p>
        <p className="mt-1">
          Las banderas se obtienen mediante FlagCDN. Los emparejamientos dinámicos de terceros cumplen rigurosamente el
          reglamento del Anexo C de la FIFA.
        </p>
      </footer>
    </div>
  );
}
