// URL Serializer
export const serializeScores = (scores) => {
  let parts = [];
  for (let i = 1; i <= 104; i++) {
    const s = scores[i];
    if (!s || (s.home === null && s.away === null)) {
      parts.push('x');
    } else {
      const home = s.home === null ? '_' : s.home;
      const away = s.away === null ? '_' : s.away;
      const pen = s.penWinner ? (s.penWinner === 'home' ? 'h' : 'a') : '';
      const penScores = (s.penHome !== null && s.penHome !== undefined && s.penAway !== null && s.penAway !== undefined)
        ? `p${s.penHome}-${s.penAway}`
        : '';
      parts.push(`${home}-${away}${pen}${penScores}`);
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

export const deserializeScores = (str) => {
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
      scores[matchNum] = { home: null, away: null, penWinner: null, penHome: null, penAway: null };
    } else {
      const [mainPart, penPart] = item.split('p');
      const pen = mainPart.endsWith('h') ? 'home' : (mainPart.endsWith('a') ? 'away' : null);
      const scorePart = pen ? mainPart.slice(0, -1) : mainPart;
      const [homeStr, awayStr] = scorePart.split('-');
      
      let penHome = null;
      let penAway = null;
      if (penPart) {
        const [penHomeStr, penAwayStr] = penPart.split('-');
        penHome = (penHomeStr !== undefined && penHomeStr !== '') ? parseInt(penHomeStr, 10) : null;
        penAway = (penAwayStr !== undefined && penAwayStr !== '') ? parseInt(penAwayStr, 10) : null;
      }

      scores[matchNum] = {
        home: homeStr === '_' ? null : parseInt(homeStr, 10),
        away: awayStr === '_' ? null : parseInt(awayStr, 10),
        penWinner: pen,
        penHome,
        penAway
      };
    }
  }
  return scores;
};

// Group standings calculation
export const calculateGroupStandings = (scores, fixturesData) => {
  const standings = {};

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
};

// Rank 3rd-placed teams
export const calculateThirdPlaceRankings = (groupStandings) => {
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
};

// Resolve knockout teams
export const resolveKnockoutTeams = (scores, groupStandings, bestThirdsGroups, thirdPlaceMapping, fixturesData) => {
  const teams = {};

  // Group Winners and Runners-up
  Object.keys(groupStandings).forEach(g => {
    const gTeams = groupStandings[g];
    teams[`1${g}`] = gTeams[0] ? gTeams[0].name : `Ganador Grupo ${g}`;
    teams[`2${g}`] = gTeams[1] ? gTeams[1].name : `Segundo Grupo ${g}`;
    teams[`3${g}`] = gTeams[2] ? gTeams[2].name : `Tercero Grupo ${g}`;
  });

  // Best Thirds Allocation mapping
  const key = bestThirdsGroups;
  const mapping = thirdPlaceMapping[key];

  if (mapping) {
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

  // Knockout logic helper functions
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

    // Resolve who was playing in matchNum as home/away
    const fixture = fixturesData.find(f => f.num === matchNum);
    if (!fixture) return null;
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
};
