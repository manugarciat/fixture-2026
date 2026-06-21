import React, { useState, useEffect, useMemo } from 'react';
import fixturesData from './data/fixtures.json';
import thirdPlaceMapping from './data/third_place_mapping.json';
import realResults from './data/real_results.json';
import './App.css';

// Flag mappings from FlagCDN
const TEAM_FLAGS = {
  'Algeria': 'dz',
  'Argentina': 'ar',
  'Australia': 'au',
  'Austria': 'at',
  'Belgium': 'be',
  'Bosnia and Herzegovina': 'ba',
  'Brazil': 'br',
  'Cabo Verde': 'cv',
  'Canada': 'ca',
  'Colombia': 'co',
  'Congo DR': 'cd',
  "Cote d'Ivoire": 'ci',
  'Croatia': 'hr',
  'Curacao': 'cw',
  'Czechia': 'cz',
  'Ecuador': 'ec',
  'Egypt': 'eg',
  'England': 'gb-eng',
  'France': 'fr',
  'Germany': 'de',
  'Ghana': 'gh',
  'Haiti': 'ht',
  'IR Iran': 'ir',
  'Iraq': 'iq',
  'Japan': 'jp',
  'Jordan': 'jo',
  'Korea Republic': 'kr',
  'Mexico': 'mx',
  'Morocco': 'ma',
  'Netherlands': 'nl',
  'New Zealand': 'nz',
  'Norway': 'no',
  'Panama': 'pa',
  'Paraguay': 'py',
  'Portugal': 'pt',
  'Qatar': 'qa',
  'Saudi Arabia': 'sa',
  'Scotland': 'gb-sct',
  'Senegal': 'sn',
  'South Africa': 'za',
  'Spain': 'es',
  'Sweden': 'se',
  'Switzerland': 'ch',
  'Tunisia': 'tn',
  'Turkiye': 'tr',
  'United States': 'us',
  'Uruguay': 'uy',
  'Uzbekistan': 'uz'
};

const STAGE_LABELS = {
  'group-stage': 'Fase de Grupos',
  'round-of-32': 'Dieciseisavos de Final',
  'round-of-16': 'Octavos de Final',
  'quarter-finals': 'Cuartos de Final',
  'semi-finals': 'Semifinales',
  'third-place': 'Tercer Puesto',
  'final': 'Final'
};

// URL Serializer
const serializeScores = (scores) => {
  let parts = [];
  for (let i = 1; i <= 104; i++) {
    const s = scores[i];
    if (!s || (s.home === null && s.away === null)) {
      parts.push('x');
    } else {
      const home = s.home === null ? '_' : s.home;
      const away = s.away === null ? '_' : s.away;
      const pen = s.penWinner ? (s.penWinner === 'home' ? 'h' : 'a') : '';
      parts.push(`${home}-${away}${pen}`);
    }
  }
  let compressed = [];
  let xCount = 0;
  for (let p of parts) {
    if (p === 'x') {
      xCount++;
    } else {
      if (xCount > 0) {
        compressed.push(xCount > 1 ? `x${xCount}` : 'x');
        xCount = 0;
      }
      compressed.push(p);
    }
  }
  if (xCount > 0) {
    compressed.push(xCount > 1 ? `x${xCount}` : 'x');
  }
  return compressed.join(',');
};

const deserializeScores = (str) => {
  if (!str) return {};
  let items = [];
  const parts = str.split(',');
  for (let p of parts) {
    if (p.startsWith('x')) {
      const count = p.length > 1 ? parseInt(p.substring(1), 10) : 1;
      for (let i = 0; i < count; i++) items.push('x');
    } else {
      items.push(p);
    }
  }
  let scores = {};
  for (let i = 0; i < items.length && i < 104; i++) {
    const item = items[i];
    const matchNum = i + 1;
    if (item === 'x' || !item) {
      scores[matchNum] = { home: null, away: null, penWinner: null };
    } else {
      const pen = item.endsWith('h') ? 'home' : (item.endsWith('a') ? 'away' : null);
      const scorePart = pen ? item.slice(0, -1) : item;
      const [homeStr, awayStr] = scorePart.split('-');
      scores[matchNum] = {
        home: homeStr === '_' ? null : parseInt(homeStr, 10),
        away: awayStr === '_' ? null : parseInt(awayStr, 10),
        penWinner: pen
      };
    }
  }
  return scores;
};

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
    // 3. Fallback: empty scores
    const initial = {};
    for (let i = 1; i <= 104; i++) {
      initial[i] = { home: null, away: null, penWinner: null };
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

  const loadRealResults = () => {
    if (window.confirm("¿Deseas cargar los resultados reales jugados hasta el 20 de junio de 2026?")) {
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

  // Group standings calculation
  const groupStandings = useMemo(() => {
    const standings = {};
    
    // Group definitions
    const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    
    // Initialize teams for each group
    fixturesData.forEach(f => {
      if (f.group) {
        if (!standings[f.group]) {
          standings[f.group] = {};
        }
        standings[f.group][f.home] = { name: f.home, group: f.group, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
        standings[f.group][f.away] = { name: f.away, group: f.group, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      }
    });

    // Populate stats from scores
    fixturesData.forEach(f => {
      if (f.group) {
        const matchScores = scores[f.num];
        if (matchScores && matchScores.home !== null && matchScores.away !== null) {
          const homeTeam = standings[f.group][f.home];
          const awayTeam = standings[f.group][f.away];
          
          homeTeam.pld += 1;
          awayTeam.pld += 1;
          
          homeTeam.gf += matchScores.home;
          homeTeam.ga += matchScores.away;
          awayTeam.gf += matchScores.away;
          awayTeam.ga += matchScores.home;
          
          homeTeam.gd = homeTeam.gf - homeTeam.ga;
          awayTeam.gd = awayTeam.gf - awayTeam.ga;

          if (matchScores.home > matchScores.away) {
            homeTeam.w += 1;
            homeTeam.pts += 3;
            awayTeam.l += 1;
          } else if (matchScores.home < matchScores.away) {
            awayTeam.w += 1;
            awayTeam.pts += 3;
            homeTeam.l += 1;
          } else {
            homeTeam.d += 1;
            awayTeam.d += 1;
            homeTeam.pts += 1;
            awayTeam.pts += 1;
          }
        }
      }
    });

    // Sort teams in each group
    const sortedStandings = {};
    Object.keys(standings).forEach(g => {
      sortedStandings[g] = Object.values(standings[g]).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.name.localeCompare(b.name); // Alphabetic fallback
      });
    });

    return sortedStandings;
  }, [scores]);

  // Rank 3rd-placed teams
  const thirdPlaceRankings = useMemo(() => {
    const thirds = [];
    Object.keys(groupStandings).forEach(g => {
      const teams = groupStandings[g];
      if (teams.length >= 3) {
        thirds.push(teams[2]); // The 3rd placed team (index 2)
      }
    });

    // Sort thirds
    return thirds.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      // Fallback: alphabetical group order
      return a.group.localeCompare(b.group);
    });
  }, [groupStandings]);

  // Map of 8 qualifying third-placed groups
  const bestThirdsGroups = useMemo(() => {
    return thirdPlaceRankings.slice(0, 8).map(t => t.group).sort().join('');
  }, [thirdPlaceRankings]);

  // Resolve knockout teams
  const resolvedTeams = useMemo(() => {
    const teams = {};

    // Group Winners and Runners-up
    Object.keys(groupStandings).forEach(g => {
      const gTeams = groupStandings[g];
      teams[`1${g}`] = gTeams[0] ? gTeams[0].name : `Ganador Grupo ${g}`;
      teams[`2${g}`] = gTeams[1] ? gTeams[1].name : `Segundo Grupo ${g}`;
      teams[`3${g}`] = gTeams[2] ? gTeams[2].name : `Tercero Grupo ${g}`;
    });

    // Best Thirds Allocation mapping
    // If we have less than 8 third-place teams (some groups not fully populated/initialized), fallback
    const key = bestThirdsGroups;
    const mapping = thirdPlaceMapping[key];

    if (mapping) {
      // mapping is an array of 8 group letters matching Winner slots in order: A, B, D, E, G, I, K, L
      // Winner A plays 3rd of mapping[0]
      // Winner B plays 3rd of mapping[1]
      // Winner D plays 3rd of mapping[2]
      // Winner E plays 3rd of mapping[3]
      // Winner G plays 3rd of mapping[4]
      // Winner I plays 3rd of mapping[5]
      // Winner K plays 3rd of mapping[6]
      // Winner L plays 3rd of mapping[7]
      teams['3_FOR_1A'] = teams[`3${mapping[0]}`];
      teams['3_FOR_1B'] = teams[`3${mapping[1]}`];
      teams['3_FOR_1D'] = teams[`3${mapping[2]}`];
      teams['3_FOR_1E'] = teams[`3${mapping[3]}`];
      teams['3_FOR_1G'] = teams[`3${mapping[4]}`];
      teams['3_FOR_1I'] = teams[`3${mapping[5]}`];
      teams['3_FOR_1K'] = teams[`3${mapping[6]}`];
      teams['3_FOR_1L'] = teams[`3${mapping[7]}`];
    } else {
      // Default placeholders if mapping is not resolved
      teams['3_FOR_1A'] = '3ro Grupo C/E/F/H/I';
      teams['3_FOR_1B'] = '3ro Grupo E/F/G/I/J';
      teams['3_FOR_1D'] = '3ro Grupo B/E/F/I/J';
      teams['3_FOR_1E'] = '3ro Grupo A/B/C/D/F';
      teams['3_FOR_1G'] = '3ro Grupo A/E/H/I/J';
      teams['3_FOR_1I'] = '3ro Grupo C/D/F/G/H';
      teams['3_FOR_1K'] = '3ro Grupo D/E/I/J/L';
      teams['3_FOR_1L'] = '3ro Grupo E/H/I/J/K';
    }

    // Lógica para emparejamientos del cuadro de eliminación (Octavos, Cuartos, Semis, Final)
    // We compute the winner of each match number
    const getMatchWinner = (matchNum) => {
      const matchScores = scores[matchNum];
      if (!matchScores || matchScores.home === null || matchScores.away === null) {
        return null;
      }
      if (matchScores.home > matchScores.away) return 'home';
      if (matchScores.home < matchScores.away) return 'away';
      return matchScores.penWinner; // tie breaker
    };

    const getMatchTeamName = (matchNum, side) => {
      const winnerSide = getMatchWinner(matchNum);
      if (!winnerSide) return null;
      
      // We need to resolve who was playing in matchNum as home/away
      const fixture = fixturesData.find(f => f.num === matchNum);
      const homeName = getTeamName(fixture, 'home');
      const awayName = getTeamName(fixture, 'away');
      
      if (side === 'winner') {
        return winnerSide === 'home' ? homeName : awayName;
      } else {
        return winnerSide === 'home' ? awayName : homeName;
      }
    };

    const getTeamName = (fixture, side) => {
      const rawName = side === 'home' ? fixture.home : fixture.away;
      
      // Resolve placeholders dynamically
      if (fixture.stage === 'group-stage') {
        return rawName;
      }

      // Round of 32 placeholders mapping
      if (fixture.stage === 'round-of-32') {
        if (rawName === 'Group A runners-up') return teams['2A'];
        if (rawName === 'Group B runners-up') return teams['2B'];
        if (rawName === 'Group C runners-up') return teams['2C'];
        if (rawName === 'Group D runners-up') return teams['2D'];
        if (rawName === 'Group E runners-up') return teams['2E'];
        if (rawName === 'Group F runners-up') return teams['2F'];
        if (rawName === 'Group G runners-up') return teams['2G'];
        if (rawName === 'Group H runners-up') return teams['2H'];
        if (rawName === 'Group I runners-up') return teams['2I'];
        if (rawName === 'Group J runners-up') return teams['2J'];
        if (rawName === 'Group K runners-up') return teams['2K'];
        if (rawName === 'Group L runners-up') return teams['2L'];

        if (rawName === 'Group A winners') return teams['1A'];
        if (rawName === 'Group B winners') return teams['1B'];
        if (rawName === 'Group C winners') return teams['1C'];
        if (rawName === 'Group D winners') return teams['1D'];
        if (rawName === 'Group E winners') return teams['1E'];
        if (rawName === 'Group F winners') return teams['1F'];
        if (rawName === 'Group G winners') return teams['1G'];
        if (rawName === 'Group H winners') return teams['1H'];
        if (rawName === 'Group I winners') return teams['1I'];
        if (rawName === 'Group J winners') return teams['1J'];
        if (rawName === 'Group K winners') return teams['1K'];
        if (rawName === 'Group L winners') return teams['1L'];

        if (rawName === 'Group C/E/F/H/I third place') return teams['3_FOR_1A'];
        if (rawName === 'Group E/F/G/I/J third place') return teams['3_FOR_1B'];
        if (rawName === 'Group B/E/F/I/J third place') return teams['3_FOR_1D'];
        if (rawName === 'Group A/B/C/D/F third place') return teams['3_FOR_1E'];
        if (rawName === 'Group A/E/H/I/J third place') return teams['3_FOR_1G'];
        if (rawName === 'Group C/D/F/G/H third place') return teams['3_FOR_1I'];
        if (rawName === 'Group D/E/I/J/L third place') return teams['3_FOR_1K'];
        if (rawName === 'Group E/H/I/J/K third place') return teams['3_FOR_1L'];
      }

      // Subsequent knockout matches resolve based on parents
      // format: "Winner Match XX" or "Loser Match XX"
      const matchPattern = /(Winner|Loser)\s+Match\s+(\d+)/;
      const match = rawName.match(matchPattern);
      if (match) {
        const type = match[1].toLowerCase(); // 'winner' or 'loser'
        const parentMatchNum = parseInt(match[2], 10);
        return getMatchTeamName(parentMatchNum, type) || rawName;
      }

      return rawName;
    };

    // Pre-calculate all resolved team names for the UI to prevent deep recursion issues
    const allResolved = {};
    fixturesData.forEach(f => {
      allResolved[`${f.num}_home`] = getTeamName(f, 'home') || f.home;
      allResolved[`${f.num}_away`] = getTeamName(f, 'away') || f.away;
    });

    return allResolved;
  }, [scores, groupStandings, bestThirdsGroups]);

  // Filtered fixtures for the matches tab
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

  // Flag helper
  const renderFlag = (teamName, sizeClass = "w-6 h-4") => {
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
    // Placeholder flag for group winners / placeholders
    return (
      <div className={`${sizeClass} bg-slate-800 border border-slate-700 flex items-center justify-center rounded text-[10px] font-bold text-slate-400 select-none`}>
        ?
      </div>
    );
  };

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
      <header className="relative overflow-hidden bg-gradient-to-b from-[#11182d] to-[#0a0f1d] border-b border-slate-800/80 px-4 py-8 md:py-12">
        <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[500px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[10%] right-[10%] w-[250px] h-[250px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-xs font-semibold text-emerald-400 mb-4 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            2026 FIFA World Cup Simulator
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-slate-100 to-slate-300">
            COPA MUNDIAL 2026
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-3 max-w-2xl mx-auto font-medium">
            🇺🇸 Estados Unidos · 🇨🇦 Canadá · 🇲🇽 México &nbsp;|&nbsp; 11 de Junio – 19 de Julio, 2026
          </p>
          <p className="text-slate-500 text-xs mt-2">
            104 Partidos · 48 Equipos · Primer Mundial de 48 Selecciones
          </p>

          {/* Quick Actions Panel */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <button 
              onClick={loadRealResults}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-emerald-400 hover:bg-slate-800 transition duration-200 shadow-md flex items-center gap-2"
            >
              📅 Cargar Resultados Reales (Jun 20)
            </button>
            <button 
              onClick={simulateRandomly}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-purple-400 hover:bg-slate-800 transition duration-200 shadow-md flex items-center gap-2"
            >
              🎲 Simular Grupos Aleatoriamente
            </button>
            <button 
              onClick={sharePredictions}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-50 font-bold transition duration-200 shadow-md shadow-emerald-950/20 flex items-center gap-2"
            >
              🔗 Compartir Pronósticos
            </button>
            <button 
              onClick={resetScores}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-900 hover:text-rose-400 text-slate-400 hover:bg-rose-950/20 transition duration-200"
            >
              Resetear
            </button>
          </div>
        </div>
      </header>

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
                  const isKnockout = f.stage !== 'group-stage';
                  const showPenaltiesInput = isKnockout && matchScores.home !== null && matchScores.away !== null && matchScores.home === matchScores.away;

                  return (
                    <div 
                      key={f.num} 
                      className={`relative bg-slate-900/60 backdrop-blur-sm border rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition duration-200 ${
                        isKnockout ? 'border-slate-800/80 shadow-purple-950/5 shadow-md' : 'border-slate-800'
                      }`}
                    >
                      {/* Match header info */}
                      <div className="flex justify-between items-center text-xs text-slate-500 mb-3 border-b border-slate-800/60 pb-2">
                        <span className="font-semibold text-slate-400">Match #{f.num}</span>
                        <div className="flex gap-2">
                          <span className="font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-slate-400">
                            {f.group ? `Grupo ${f.group}` : STAGE_LABELS[f.stage]}
                          </span>
                          <span>{f.date} ({f.time} UTC)</span>
                        </div>
                      </div>

                      {/* Score inputs block */}
                      <div className="grid grid-cols-12 items-center gap-2 my-2">
                        {/* Home Team */}
                        <div className="col-span-5 flex items-center gap-3">
                          {renderFlag(homeResolvedName)}
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
                            onChange={(e) => handleScoreChange(f.num, 'home', e.target.value)}
                            className="w-8 h-8 text-center bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded text-sm font-bold text-slate-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="-"
                          />
                          <span className="text-slate-600 font-bold text-xs">:</span>
                          <input 
                            type="number" 
                            min="0"
                            max="99"
                            value={matchScores.away === null ? '' : matchScores.away}
                            onChange={(e) => handleScoreChange(f.num, 'away', e.target.value)}
                            className="w-8 h-8 text-center bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded text-sm font-bold text-slate-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="-"
                          />
                        </div>

                        {/* Away Team */}
                        <div className="col-span-5 flex items-center justify-end gap-3 text-right">
                          <span className="text-sm font-semibold truncate text-slate-200" title={awayResolvedName}>
                            {awayResolvedName}
                          </span>
                          {renderFlag(awayResolvedName)}
                        </div>
                      </div>

                      {/* Penalty tie-breaker for Knockouts */}
                      {showPenaltiesInput && (
                        <div className="mt-3 p-2 bg-purple-950/10 border border-purple-900/30 rounded-lg text-center">
                          <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-2">Empate - Define quién avanza</p>
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => handlePenWinner(f.num, 'home')}
                              className={`px-3 py-1 text-xs rounded border transition font-semibold ${
                                matchScores.penWinner === 'home'
                                  ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              ⚽ Avanza {homeResolvedName}
                            </button>
                            <button 
                              onClick={() => handlePenWinner(f.num, 'away')}
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
                        <span className="truncate max-w-[60%]">{f.stadium}</span>
                        <span className="font-semibold text-slate-400">{f.city.replace('-', ' ').toUpperCase()}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No se encontraron partidos para los filtros seleccionados
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GROUPS */}
        {activeTab === 'groups' && (
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
                            className={`border-b border-slate-800/30 hover:bg-slate-800/20 transition ${
                              isQualifying 
                                ? 'bg-emerald-950/5 text-slate-100' 
                                : isThird 
                                  ? 'bg-purple-950/5 text-slate-300' 
                                  : 'text-slate-500'
                            }`}
                          >
                            <td className="py-2.5">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isQualifying 
                                  ? 'bg-emerald-900/60 text-emerald-300' 
                                  : isThird 
                                    ? 'bg-purple-900/40 text-purple-300' 
                                    : 'bg-slate-850 text-slate-600'
                              }`}>
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-2.5 font-semibold">
                              <div className="flex items-center gap-2">
                                {renderFlag(t.name)}
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
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Clasifica Directo</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Zona de 3ros</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: THIRDS */}
        {activeTab === 'thirds' && (
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
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isAdvancing 
                              ? 'bg-emerald-900/60 text-emerald-300' 
                              : 'bg-rose-950 border border-rose-800 text-rose-300'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-slate-400">Grupo {t.group}</td>
                        <td className="py-3 font-semibold">
                          <div className="flex items-center gap-2">
                            {renderFlag(t.name)}
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
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                            isAdvancing 
                              ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-400' 
                              : 'bg-rose-950/80 border border-rose-800/80 text-rose-400'
                          }`}>
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
        )}

        {/* TAB 4: BRACKET */}
        {activeTab === 'bracket' && (
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
                {[73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88].map(num => {
                  const f = fixturesData.find(m => m.num === num);
                  const h = resolvedTeams[`${num}_home`];
                  const a = resolvedTeams[`${num}_away`];
                  const s = scores[num] || { home: null, away: null, penWinner: null };
                  const isCompleted = s.home !== null && s.away !== null;
                  const winnerSide = isCompleted ? (s.home > s.away ? 'home' : (s.home < s.away ? 'away' : s.penWinner)) : null;

                  return (
                    <div key={num} className="bg-slate-900/40 border border-slate-800 rounded-lg p-2.5 text-xs hover:border-slate-700 transition">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1.5 flex justify-between">
                        <span>Partido {num}</span>
                        <span>{f.city.toUpperCase().replace('-', ' ')}</span>
                      </div>
                      
                      {/* Home */}
                      <div className={`flex items-center justify-between p-1 rounded ${winnerSide === 'home' ? 'bg-emerald-950/20 text-emerald-300 font-semibold' : ''}`}>
                        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                          {renderFlag(h, "w-4 h-3")}
                          <span className="truncate">{h}</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={s.home === null ? '' : s.home}
                          onChange={(e) => handleScoreChange(num, 'home', e.target.value)}
                          className="w-6 h-6 text-center bg-slate-950 border border-slate-800 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="-"
                        />
                      </div>

                      {/* Away */}
                      <div className={`flex items-center justify-between p-1 rounded mt-1.5 ${winnerSide === 'away' ? 'bg-emerald-950/20 text-emerald-300 font-semibold' : ''}`}>
                        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                          {renderFlag(a, "w-4 h-3")}
                          <span className="truncate">{a}</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={s.away === null ? '' : s.away}
                          onChange={(e) => handleScoreChange(num, 'away', e.target.value)}
                          className="w-6 h-6 text-center bg-slate-950 border border-slate-800 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="-"
                        />
                      </div>

                      {/* Shootout selector if tie */}
                      {isCompleted && s.home === s.away && !s.penWinner && (
                        <div className="mt-2 text-center">
                          <p className="text-[8px] text-purple-400 mb-1">Definir penales:</p>
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handlePenWinner(num, 'home')} className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:border-purple-500 rounded text-[9px] text-purple-400">Home</button>
                            <button onClick={() => handlePenWinner(num, 'away')} className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:border-purple-500 rounded text-[9px] text-purple-400">Away</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ROUND OF 16 */}
              <div className="flex flex-col justify-around gap-8">
                <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-800 pb-1">
                  Octavos de Final (16)
                </div>
                {[89, 90, 91, 92, 93, 94, 95, 96].map(num => {
                  const f = fixturesData.find(m => m.num === num);
                  const h = resolvedTeams[`${num}_home`];
                  const a = resolvedTeams[`${num}_away`];
                  const s = scores[num] || { home: null, away: null, penWinner: null };
                  const isCompleted = s.home !== null && s.away !== null;
                  const winnerSide = isCompleted ? (s.home > s.away ? 'home' : (s.home < s.away ? 'away' : s.penWinner)) : null;

                  return (
                    <div key={num} className="bg-slate-900/40 border border-slate-800 rounded-lg p-2.5 text-xs hover:border-slate-700 transition">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1.5 flex justify-between">
                        <span>Partido {num}</span>
                        <span>{f.city.toUpperCase().replace('-', ' ')}</span>
                      </div>
                      
                      {/* Home */}
                      <div className={`flex items-center justify-between p-1 rounded ${winnerSide === 'home' ? 'bg-emerald-950/20 text-emerald-300 font-semibold' : ''}`}>
                        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                          {renderFlag(h, "w-4 h-3")}
                          <span className="truncate">{h || `Ganador Match ${f.home.split('Match ')[1]}`}</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={s.home === null ? '' : s.home}
                          onChange={(e) => handleScoreChange(num, 'home', e.target.value)}
                          className="w-6 h-6 text-center bg-slate-950 border border-slate-800 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="-"
                        />
                      </div>

                      {/* Away */}
                      <div className={`flex items-center justify-between p-1 rounded mt-1.5 ${winnerSide === 'away' ? 'bg-emerald-950/20 text-emerald-300 font-semibold' : ''}`}>
                        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                          {renderFlag(a, "w-4 h-3")}
                          <span className="truncate">{a || `Ganador Match ${f.away.split('Match ')[1]}`}</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={s.away === null ? '' : s.away}
                          onChange={(e) => handleScoreChange(num, 'away', e.target.value)}
                          className="w-6 h-6 text-center bg-slate-950 border border-slate-800 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="-"
                        />
                      </div>

                      {/* Shootout tie breaker */}
                      {isCompleted && s.home === s.away && !s.penWinner && (
                        <div className="mt-2 text-center">
                          <p className="text-[8px] text-purple-400 mb-1">Definir penales:</p>
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handlePenWinner(num, 'home')} className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:border-purple-500 rounded text-[9px] text-purple-400">Home</button>
                            <button onClick={() => handlePenWinner(num, 'away')} className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:border-purple-500 rounded text-[9px] text-purple-400">Away</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* QUARTER FINALS */}
              <div className="flex flex-col justify-around gap-16">
                <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-800 pb-1">
                  Cuartos de Final (8)
                </div>
                {[97, 98, 99, 100].map(num => {
                  const f = fixturesData.find(m => m.num === num);
                  const h = resolvedTeams[`${num}_home`];
                  const a = resolvedTeams[`${num}_away`];
                  const s = scores[num] || { home: null, away: null, penWinner: null };
                  const isCompleted = s.home !== null && s.away !== null;
                  const winnerSide = isCompleted ? (s.home > s.away ? 'home' : (s.home < s.away ? 'away' : s.penWinner)) : null;

                  return (
                    <div key={num} className="bg-slate-900/40 border border-slate-800 rounded-lg p-2.5 text-xs hover:border-slate-700 transition">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1.5 flex justify-between">
                        <span>Partido {num}</span>
                        <span>{f.city.toUpperCase().replace('-', ' ')}</span>
                      </div>
                      
                      {/* Home */}
                      <div className={`flex items-center justify-between p-1 rounded ${winnerSide === 'home' ? 'bg-emerald-950/20 text-emerald-300 font-semibold' : ''}`}>
                        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                          {renderFlag(h, "w-4 h-3")}
                          <span className="truncate">{h || `Ganador Match ${f.home.split('Match ')[1]}`}</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={s.home === null ? '' : s.home}
                          onChange={(e) => handleScoreChange(num, 'home', e.target.value)}
                          className="w-6 h-6 text-center bg-slate-950 border border-slate-800 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="-"
                        />
                      </div>

                      {/* Away */}
                      <div className={`flex items-center justify-between p-1 rounded mt-1.5 ${winnerSide === 'away' ? 'bg-emerald-950/20 text-emerald-300 font-semibold' : ''}`}>
                        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                          {renderFlag(a, "w-4 h-3")}
                          <span className="truncate">{a || `Ganador Match ${f.away.split('Match ')[1]}`}</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={s.away === null ? '' : s.away}
                          onChange={(e) => handleScoreChange(num, 'away', e.target.value)}
                          className="w-6 h-6 text-center bg-slate-950 border border-slate-800 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="-"
                        />
                      </div>

                      {/* Shootout tie breaker */}
                      {isCompleted && s.home === s.away && !s.penWinner && (
                        <div className="mt-2 text-center">
                          <p className="text-[8px] text-purple-400 mb-1">Definir penales:</p>
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handlePenWinner(num, 'home')} className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:border-purple-500 rounded text-[9px] text-purple-400">Home</button>
                            <button onClick={() => handlePenWinner(num, 'away')} className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:border-purple-500 rounded text-[9px] text-purple-400">Away</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* SEMI FINALS */}
              <div className="flex flex-col justify-around gap-24">
                <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-800 pb-1">
                  Semifinales (4)
                </div>
                {[101, 102].map(num => {
                  const f = fixturesData.find(m => m.num === num);
                  const h = resolvedTeams[`${num}_home`];
                  const a = resolvedTeams[`${num}_away`];
                  const s = scores[num] || { home: null, away: null, penWinner: null };
                  const isCompleted = s.home !== null && s.away !== null;
                  const winnerSide = isCompleted ? (s.home > s.away ? 'home' : (s.home < s.away ? 'away' : s.penWinner)) : null;

                  return (
                    <div key={num} className="bg-slate-900/40 border border-slate-800 rounded-lg p-2.5 text-xs hover:border-slate-700 transition">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1.5 flex justify-between">
                        <span>Partido {num}</span>
                        <span>{f.city.toUpperCase().replace('-', ' ')}</span>
                      </div>
                      
                      {/* Home */}
                      <div className={`flex items-center justify-between p-1 rounded ${winnerSide === 'home' ? 'bg-emerald-950/20 text-emerald-300 font-semibold' : ''}`}>
                        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                          {renderFlag(h, "w-4 h-3")}
                          <span className="truncate">{h || `Ganador Match ${f.home.split('Match ')[1]}`}</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={s.home === null ? '' : s.home}
                          onChange={(e) => handleScoreChange(num, 'home', e.target.value)}
                          className="w-6 h-6 text-center bg-slate-950 border border-slate-800 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="-"
                        />
                      </div>

                      {/* Away */}
                      <div className={`flex items-center justify-between p-1 rounded mt-1.5 ${winnerSide === 'away' ? 'bg-emerald-950/20 text-emerald-300 font-semibold' : ''}`}>
                        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                          {renderFlag(a, "w-4 h-3")}
                          <span className="truncate">{a || `Ganador Match ${f.away.split('Match ')[1]}`}</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={s.away === null ? '' : s.away}
                          onChange={(e) => handleScoreChange(num, 'away', e.target.value)}
                          className="w-6 h-6 text-center bg-slate-950 border border-slate-800 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="-"
                        />
                      </div>

                      {/* Shootout tie breaker */}
                      {isCompleted && s.home === s.away && !s.penWinner && (
                        <div className="mt-2 text-center">
                          <p className="text-[8px] text-purple-400 mb-1">Definir penales:</p>
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handlePenWinner(num, 'home')} className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:border-purple-500 rounded text-[9px] text-purple-400">Home</button>
                            <button onClick={() => handlePenWinner(num, 'away')} className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:border-purple-500 rounded text-[9px] text-purple-400">Away</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* FINAL & 3RD PLACE */}
              <div className="flex flex-col justify-around gap-12">
                
                {/* FINAL */}
                <div>
                  <div className="text-center font-bold text-xs uppercase tracking-wider text-amber-500 mb-2 border-b border-slate-800 pb-1">
                    🏆 Gran Final
                  </div>
                  {(() => {
                    const num = 104;
                    const f = fixturesData.find(m => m.num === num);
                    const h = resolvedTeams[`${num}_home`];
                    const a = resolvedTeams[`${num}_away`];
                    const s = scores[num] || { home: null, away: null, penWinner: null };
                    const isCompleted = s.home !== null && s.away !== null;
                    const winnerSide = isCompleted ? (s.home > s.away ? 'home' : (s.home < s.away ? 'away' : s.penWinner)) : null;

                    return (
                      <div className="bg-slate-900/60 border-2 border-amber-500/30 rounded-xl p-3.5 text-xs hover:border-amber-500/60 transition shadow-lg shadow-amber-950/10">
                        <div className="text-[10px] text-amber-400/80 font-bold mb-2 flex justify-between items-center">
                          <span>Partido 104 - FINAL</span>
                          <span>{f.city.toUpperCase().replace('-', ' ')}</span>
                        </div>
                        
                        {/* Home */}
                        <div className={`flex items-center justify-between p-1.5 rounded ${winnerSide === 'home' ? 'bg-amber-500/10 text-amber-300 font-bold' : ''}`}>
                          <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                            {renderFlag(h, "w-5 h-3.5")}
                            <span className="truncate font-semibold text-sm">{h || `Ganador Match ${f.home.split('Match ')[1]}`}</span>
                          </div>
                          <input 
                            type="number" 
                            min="0"
                            value={s.home === null ? '' : s.home}
                            onChange={(e) => handleScoreChange(num, 'home', e.target.value)}
                            className="w-7 h-7 text-center bg-slate-950 border border-slate-800 rounded text-amber-300 text-sm font-extrabold focus:outline-none focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="-"
                          />
                        </div>

                        {/* Away */}
                        <div className={`flex items-center justify-between p-1.5 rounded mt-2.5 ${winnerSide === 'away' ? 'bg-amber-500/10 text-amber-300 font-bold' : ''}`}>
                          <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                            {renderFlag(a, "w-5 h-3.5")}
                            <span className="truncate font-semibold text-sm">{a || `Ganador Match ${f.away.split('Match ')[1]}`}</span>
                          </div>
                          <input 
                            type="number" 
                            min="0"
                            value={s.away === null ? '' : s.away}
                            onChange={(e) => handleScoreChange(num, 'away', e.target.value)}
                            className="w-7 h-7 text-center bg-slate-950 border border-slate-800 rounded text-amber-300 text-sm font-extrabold focus:outline-none focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="-"
                          />
                        </div>

                        {/* Shootout tie breaker */}
                        {isCompleted && s.home === s.away && !s.penWinner && (
                          <div className="mt-3 text-center">
                            <p className="text-[9px] text-amber-400 font-semibold mb-1">Campeón por Penales:</p>
                            <div className="flex gap-1.5 justify-center">
                              <button onClick={() => handlePenWinner(num, 'home')} className="px-2.5 py-1 bg-slate-950 border border-amber-900/40 rounded text-[9px] text-amber-300 font-bold">Home</button>
                              <button onClick={() => handlePenWinner(num, 'away')} className="px-2.5 py-1 bg-slate-950 border border-amber-900/40 rounded text-[9px] text-amber-300 font-bold">Away</button>
                            </div>
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
                  })()}
                </div>

                {/* THIRD PLACE */}
                <div>
                  <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-800 pb-1">
                    🥉 Tercer Puesto
                  </div>
                  {(() => {
                    const num = 103;
                    const f = fixturesData.find(m => m.num === num);
                    const h = resolvedTeams[`${num}_home`];
                    const a = resolvedTeams[`${num}_away`];
                    const s = scores[num] || { home: null, away: null, penWinner: null };
                    const isCompleted = s.home !== null && s.away !== null;
                    const winnerSide = isCompleted ? (s.home > s.away ? 'home' : (s.home < s.away ? 'away' : s.penWinner)) : null;

                    return (
                      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-2.5 text-xs hover:border-slate-700 transition">
                        <div className="text-[10px] text-slate-500 font-semibold mb-1.5 flex justify-between">
                          <span>Partido 103</span>
                          <span>{f.city.toUpperCase().replace('-', ' ')}</span>
                        </div>
                        
                        {/* Home */}
                        <div className={`flex items-center justify-between p-1 rounded ${winnerSide === 'home' ? 'bg-amber-900/10 text-amber-300 font-semibold' : ''}`}>
                          <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                            {renderFlag(h, "w-4 h-3")}
                            <span className="truncate">{h || `Perdedor Match ${f.home.split('Match ')[1]}`}</span>
                          </div>
                          <input 
                            type="number" 
                            min="0"
                            value={s.home === null ? '' : s.home}
                            onChange={(e) => handleScoreChange(num, 'home', e.target.value)}
                            className="w-6 h-6 text-center bg-slate-950 border border-slate-800 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="-"
                          />
                        </div>

                        {/* Away */}
                        <div className={`flex items-center justify-between p-1 rounded mt-1.5 ${winnerSide === 'away' ? 'bg-amber-900/10 text-amber-300 font-semibold' : ''}`}>
                          <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                            {renderFlag(a, "w-4 h-3")}
                            <span className="truncate">{a || `Perdedor Match ${f.away.split('Match ')[1]}`}</span>
                          </div>
                          <input 
                            type="number" 
                            min="0"
                            value={s.away === null ? '' : s.away}
                            onChange={(e) => handleScoreChange(num, 'away', e.target.value)}
                            className="w-6 h-6 text-center bg-slate-950 border border-slate-800 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="-"
                          />
                        </div>

                        {/* Shootout tie breaker */}
                        {isCompleted && s.home === s.away && !s.penWinner && (
                          <div className="mt-2 text-center">
                            <p className="text-[8px] text-purple-400 mb-1">Definir penales:</p>
                            <div className="flex gap-1 justify-center">
                              <button onClick={() => handlePenWinner(num, 'home')} className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:border-purple-500 rounded text-[9px] text-purple-400">Home</button>
                              <button onClick={() => handlePenWinner(num, 'away')} className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:border-purple-500 rounded text-[9px] text-purple-400">Away</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto text-center text-slate-600 text-xs mt-16 pt-8 border-t border-slate-900">
        <p>© 2026 Fixture & Simulador del Mundial de Fútbol 2026. Todos los derechos reservados.</p>
        <p className="mt-1">
          Las banderas se obtienen mediante FlagCDN. Los emparejamientos dinámicos de terceros cumplen rigurosamente el reglamento del Anexo C de la FIFA.
        </p>
      </footer>
    </div>
  );
}
