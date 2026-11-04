/**
 * Tournament Engine — Professional Multi-Sport Engine
 * Supports Knockout, Round-Robin, Group Stage + Playoffs,
 * Custom Points Systems (Win/Draw/Loss points), Team Form Guide (W/D/L),
 * Match auto-advancement, and tournament statistics.
 */

// Generate Knockout Bracket (Single Elimination)
export function generateKnockoutBracket(teams, options = {}) {
  const count = teams.length;
  if (count < 2) throw new Error("At least 2 teams are required to generate a bracket.");

  let bracketSize = 2;
  while (bracketSize < count) {
    bracketSize *= 2;
  }

  const numRounds = Math.log2(bracketSize);
  const seedOrder = getSeedOrder(bracketSize);
  const sortedTeams = [...teams].sort((a, b) => (a.seed || 999) - (b.seed || 999));

  const seededParticipants = seedOrder.map((seedNum) => sortedTeams[seedNum - 1] || null);
  const matches = [];
  const roundNames = getRoundNames(numRounds);
  const roundMatchMap = {};

  for (let r = numRounds; r >= 1; r--) {
    const matchesInRound = Math.pow(2, numRounds - r);
    roundMatchMap[r] = [];

    for (let m = 0; m < matchesInRound; m++) {
      const matchId = `match-r${r}-m${m + 1}`;
      const nextRoundMatchIndex = Math.floor(m / 2);
      const nextMatchId = r < numRounds ? `match-r${r + 1}-m${nextRoundMatchIndex + 1}` : null;
      const nextMatchSlot = r < numRounds ? (m % 2 === 0 ? "A" : "B") : null;

      const matchObj = {
        id: matchId,
        round: r,
        roundName: roundNames[r - 1],
        stageName: "Playoffs",
        teamAId: null,
        teamBId: null,
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        nextMatchId,
        nextMatchSlot,
        scheduledAt: options.startDate ? `${options.startDate} 16:00` : "TBD",
        venue: options.venue || "Divine Mercy Parish Grounds",
        official: options.official || "Parish Referee Panel",
        duration: options.duration || "Standard Time",
        playerNotes: ""
      };

      roundMatchMap[r].push(matchObj);
    }
  }

  // Populate Round 1
  const r1Matches = roundMatchMap[1];
  for (let i = 0; i < r1Matches.length; i++) {
    const teamA = seededParticipants[i * 2];
    const teamB = seededParticipants[i * 2 + 1];

    r1Matches[i].teamAId = teamA ? teamA.id : null;
    r1Matches[i].teamBId = teamB ? teamB.id : null;

    if (teamA && !teamB) {
      r1Matches[i].status = "COMPLETED";
      r1Matches[i].winnerId = teamA.id;
      advanceInMap(roundMatchMap, r1Matches[i]);
    } else if (!teamA && teamB) {
      r1Matches[i].status = "COMPLETED";
      r1Matches[i].winnerId = teamB.id;
      advanceInMap(roundMatchMap, r1Matches[i]);
    }
  }

  for (let r = 1; r <= numRounds; r++) {
    matches.push(...roundMatchMap[r]);
  }

  return matches;
}

function advanceInMap(roundMatchMap, completedMatch) {
  if (!completedMatch.nextMatchId || !completedMatch.winnerId) return;
  const targetRound = completedMatch.round + 1;
  const targetMatches = roundMatchMap[targetRound];
  if (!targetMatches) return;

  const targetMatch = targetMatches.find((m) => m.id === completedMatch.nextMatchId);
  if (targetMatch) {
    if (completedMatch.nextMatchSlot === "A") {
      targetMatch.teamAId = completedMatch.winnerId;
    } else {
      targetMatch.teamBId = completedMatch.winnerId;
    }
  }
}

function getSeedOrder(bracketSize) {
  let rounds = Math.log2(bracketSize) - 1;
  let pls = [1, 2];
  for (let i = 0; i < rounds; i++) {
    let nextPls = [];
    let sum = Math.pow(2, i + 2) + 1;
    for (let j = 0; j < pls.length; j++) {
      nextPls.push(pls[j]);
      nextPls.push(sum - pls[j]);
    }
    pls = nextPls;
  }
  return pls;
}

function getRoundNames(totalRounds) {
  const names = [];
  for (let r = 1; r <= totalRounds; r++) {
    const fromFinal = totalRounds - r;
    if (fromFinal === 0) names.push("Grand Final");
    else if (fromFinal === 1) names.push("Semi-Finals");
    else if (fromFinal === 2) names.push("Quarter-Finals");
    else if (fromFinal === 3) names.push("Round of 16");
    else names.push(`Round ${r}`);
  }
  return names;
}

// Generate Round-Robin schedule (Circle / Berger method)
export function generateRoundRobinSchedule(teams, options = {}) {
  const count = teams.length;
  if (count < 2) throw new Error("At least 2 teams are required for Round Robin.");

  const teamList = [...teams];
  if (count % 2 !== 0) {
    teamList.push({ id: "__BYE__", name: "BYE" });
  }

  const n = teamList.length;
  const numRounds = n - 1;
  const matchesPerRound = n / 2;
  const matches = [];

  let currentTeams = [...teamList];

  for (let round = 1; round <= numRounds; round++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const teamA = currentTeams[i];
      const teamB = currentTeams[n - 1 - i];

      if (teamA.id === "__BYE__" || teamB.id === "__BYE__") continue;

      matches.push({
        id: `${options.prefix || "rr"}-r${round}-m${i + 1}`,
        round,
        roundName: `Round ${round}`,
        stageName: options.stageName || "League Stage",
        groupId: options.groupId || null,
        groupName: options.groupName || null,
        teamAId: teamA.id,
        teamBId: teamB.id,
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        scheduledAt: options.startDate ? `${options.startDate} 17:00` : "TBD",
        venue: options.venue || "Parish Arena",
        official: options.official || "Official Referee",
        duration: options.duration || "Standard Time",
        playerNotes: ""
      });
    }

    const fixed = currentTeams[0];
    const rotated = [fixed, currentTeams[n - 1], ...currentTeams.slice(1, n - 1)];
    currentTeams = rotated;
  }

  return matches;
}

// Generate Group Stage (Multiple Groups) + Knockout Playoffs (Semi-Finals + Final)
export function generateGroupKnockoutTournament(groups, options = {}) {
  const allMatches = [];

  groups.forEach((group, gIdx) => {
    const groupMatches = generateRoundRobinSchedule(group.teams, {
      prefix: `grp-${group.id || gIdx}`,
      groupId: group.id || `grp-${gIdx + 1}`,
      groupName: group.name,
      stageName: `${group.name}`,
      startDate: options.startDate,
      venue: options.venue
    });
    allMatches.push(...groupMatches);
  });

  const sf1 = {
    id: "po-sf-1",
    round: 1,
    roundName: "Semi-Final 1",
    stageName: "Playoff Semi-Finals",
    groupId: "PLAYOFFS",
    groupName: "Knockout Playoffs",
    teamAId: null,
    teamBId: null,
    placeholderA: "Winner Group A",
    placeholderB: "Runner-up Group B",
    scoreA: 0,
    scoreB: 0,
    status: "SCHEDULED",
    winnerId: null,
    nextMatchId: "po-final",
    nextMatchSlot: "A",
    scheduledAt: options.playoffDate ? `${options.playoffDate} 16:00` : "TBD",
    venue: options.venue || "Parish Main Ground",
    official: "Lead Official",
    duration: "Extra Time + Penalties if tied",
    playerNotes: ""
  };

  const sf2 = {
    id: "po-sf-2",
    round: 1,
    roundName: "Semi-Final 2",
    stageName: "Playoff Semi-Finals",
    groupId: "PLAYOFFS",
    groupName: "Knockout Playoffs",
    teamAId: null,
    teamBId: null,
    placeholderA: "Winner Group B",
    placeholderB: "Runner-up Group A",
    scoreA: 0,
    scoreB: 0,
    status: "SCHEDULED",
    winnerId: null,
    nextMatchId: "po-final",
    nextMatchSlot: "B",
    scheduledAt: options.playoffDate ? `${options.playoffDate} 17:30` : "TBD",
    venue: options.venue || "Parish Main Ground",
    official: "Lead Official",
    duration: "Extra Time + Penalties if tied",
    playerNotes: ""
  };

  const grandFinal = {
    id: "po-final",
    round: 2,
    roundName: "Championship Final",
    stageName: "Championship Final",
    groupId: "PLAYOFFS",
    groupName: "Knockout Playoffs",
    teamAId: null,
    teamBId: null,
    placeholderA: "Winner Semi-Final 1",
    placeholderB: "Winner Semi-Final 2",
    scoreA: 0,
    scoreB: 0,
    status: "SCHEDULED",
    winnerId: null,
    nextMatchId: null,
    nextMatchSlot: null,
    scheduledAt: options.finalDate ? `${options.finalDate} 19:00` : "TBD",
    venue: options.venue || "Divine Mercy Stadium Pitch",
    official: "Head Tournament Referee",
    duration: "Full Match + Shootout",
    playerNotes: ""
  };

  allMatches.push(sf1, sf2, grandFinal);
  return allMatches;
}

// Calculate Standings Table with Configurable Points (Win, Draw, Loss) & Team Form (Last 5)
export function calculateStandings(teams, matches, pointsConfig = {}) {
  const winPts = Number(pointsConfig.win ?? 3);
  const drawPts = Number(pointsConfig.draw ?? 1);
  const lossPts = Number(pointsConfig.loss ?? 0);

  const standingsMap = {};

  teams.forEach((t) => {
    standingsMap[t.id] = {
      team: t,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [] // Last matches: 'W', 'D', 'L'
    };
  });

  // Sort matches by schedule / completion order
  const completedMatches = matches.filter((m) => m.status === "COMPLETED");

  completedMatches.forEach((m) => {
    if (!standingsMap[m.teamAId] || !standingsMap[m.teamBId]) return;

    const rowA = standingsMap[m.teamAId];
    const rowB = standingsMap[m.teamBId];

    rowA.played++;
    rowB.played++;

    const sA = Number(m.scoreA || 0);
    const sB = Number(m.scoreB || 0);

    rowA.goalsFor += sA;
    rowA.goalsAgainst += sB;

    rowB.goalsFor += sB;
    rowB.goalsAgainst += sA;

    if (sA > sB) {
      rowA.won++;
      rowA.points += winPts;
      rowA.form.push("W");

      rowB.lost++;
      rowB.points += lossPts;
      rowB.form.push("L");
    } else if (sB > sA) {
      rowB.won++;
      rowB.points += winPts;
      rowB.form.push("W");

      rowA.lost++;
      rowA.points += lossPts;
      rowA.form.push("L");
    } else {
      rowA.drawn++;
      rowA.points += drawPts;
      rowA.form.push("D");

      rowB.drawn++;
      rowB.points += drawPts;
      rowB.form.push("D");
    }
  });

  const standingsList = Object.values(standingsMap).map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst,
    // Keep only last 5 results for Form Guide
    form: row.form.slice(-5)
  }));

  // Sorting hierarchy: Points -> Goal Difference -> Goals For -> Name
  standingsList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.name.localeCompare(b.team.name);
  });

  return standingsList;
}

// Calculate Group Stage Standings (keyed by groupId) with dynamic pointsConfig
export function calculateGroupStandings(groups = [], matches = [], pointsConfig = {}) {
  const results = {};
  groups.forEach((group) => {
    const groupMatches = matches.filter(
      (m) => m.groupId === group.id || (m.stageName && m.stageName.includes(group.name))
    );
    results[group.id] = {
      group,
      standings: calculateStandings(group.teams, groupMatches, pointsConfig)
    };
  });
  return results;
}

// Auto-advance match results in Knockout or Group Playoff trees
export function applyMatchResult(matches, matchId, updates = {}) {
  const { scoreA, scoreB, status, winnerId, teamAId, teamBId, scheduledAt, venue, official, duration, playerNotes } = updates;

  const updatedMatches = matches.map((m) => {
    if (m.id !== matchId) return m;

    const newTeamA = teamAId !== undefined ? teamAId : m.teamAId;
    const newTeamB = teamBId !== undefined ? teamBId : m.teamBId;

    let computedWinnerId = winnerId;
    if (!computedWinnerId && status === "COMPLETED") {
      if (Number(scoreA) > Number(scoreB)) computedWinnerId = newTeamA;
      else if (Number(scoreB) > Number(scoreA)) computedWinnerId = newTeamB;
    }

    return {
      ...m,
      teamAId: newTeamA,
      teamBId: newTeamB,
      scheduledAt: scheduledAt !== undefined ? scheduledAt : m.scheduledAt,
      venue: venue !== undefined ? venue : m.venue,
      official: official !== undefined ? official : m.official,
      duration: duration !== undefined ? duration : m.duration,
      playerNotes: playerNotes !== undefined ? playerNotes : m.playerNotes,
      scoreA: scoreA !== undefined ? Number(scoreA) : m.scoreA,
      scoreB: scoreB !== undefined ? Number(scoreB) : m.scoreB,
      status: status !== undefined ? status : m.status,
      winnerId: computedWinnerId
    };
  });

  const match = updatedMatches.find((m) => m.id === matchId);
  if (match && match.nextMatchId && match.status === "COMPLETED" && match.winnerId) {
    const parentIndex = updatedMatches.findIndex((m) => m.id === match.nextMatchId);
    if (parentIndex !== -1) {
      const parent = { ...updatedMatches[parentIndex] };
      if (match.nextMatchSlot === "A") {
        parent.teamAId = match.winnerId;
      } else {
        parent.teamBId = match.winnerId;
      }
      updatedMatches[parentIndex] = parent;
    }
  }

  return updatedMatches;
}

// Calculate Comprehensive Tournament Overview Stats
export function calculateTournamentStats(tournament) {
  const matches = tournament?.matches || [];
  const teams = tournament?.teams || [];

  const totalMatches = matches.length;
  const completedMatches = matches.filter((m) => m.status === "COMPLETED").length;
  const liveMatches = matches.filter((m) => m.status === "LIVE").length;
  const upcomingMatches = matches.filter((m) => m.status === "SCHEDULED").length;

  let totalGoals = 0;
  matches.forEach((m) => {
    if (m.status === "COMPLETED" || m.status === "LIVE") {
      totalGoals += Number(m.scoreA || 0) + Number(m.scoreB || 0);
    }
  });

  const avgGoals = completedMatches > 0 ? (totalGoals / completedMatches).toFixed(1) : "0.0";

  return {
    totalTeams: teams.length,
    totalMatches,
    completedMatches,
    liveMatches,
    upcomingMatches,
    totalGoals,
    avgGoals
  };
}

// Normalize players into array of structured player objects
export function normalizePlayers(players) {
  if (!players) return [];
  if (Array.isArray(players)) {
    return players.map((p, idx) => {
      if (typeof p === "string") {
        const isCapt = p.includes("(C)");
        const isVC = p.includes("(VC)");
        const cleanName = p.replace(/\(C\)|\(VC\)/g, "").trim();
        return {
          id: `p-${idx + 1}`,
          name: cleanName,
          role: isCapt ? "CAPTAIN" : isVC ? "VICE_CAPTAIN" : "PLAYER"
        };
      }
      return {
        id: p.id || `p-${idx + 1}`,
        name: p.name || "",
        role: p.role || (p.isCaptain ? "CAPTAIN" : "PLAYER")
      };
    });
  }
  if (typeof players === "string") {
    return players
      .split(",")
      .map((item, idx) => {
        const trimmed = item.trim();
        if (!trimmed) return null;
        const isCapt = trimmed.includes("(C)");
        const isVC = trimmed.includes("(VC)");
        const cleanName = trimmed.replace(/\(C\)|\(VC\)/g, "").trim();
        return {
          id: `p-${idx + 1}`,
          name: cleanName,
          role: isCapt ? "CAPTAIN" : isVC ? "VICE_CAPTAIN" : "PLAYER"
        };
      })
      .filter(Boolean);
  }
  return [];
}

// Get Captain from team
export function getCaptain(team) {
  if (!team) return null;
  const players = normalizePlayers(team.players);
  const capt = players.find((p) => p.role === "CAPTAIN");
  if (capt) return capt.name;
  if (team.captain) return team.captain;
  return null;
}

// Format roster string for display
export function formatRosterString(players) {
  const norm = normalizePlayers(players);
  if (!norm.length) return "";
  return norm
    .map((p) => {
      if (p.role === "CAPTAIN") return `${p.name} (C)`;
      if (p.role === "VICE_CAPTAIN") return `${p.name} (VC)`;
      return p.name;
    })
    .join(", ");
}
