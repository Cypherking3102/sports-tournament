/**
 * Tournament Engine — Multi-sport bracket generation,
 * multi-group round robin stage, knockout playoffs, auto-advancement,
 * and standings calculation.
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
        venue: options.venue || "Divine Mercy Parish Grounds"
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
        venue: options.venue || "Parish Arena"
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

  // 1. Generate round-robin matches for each group
  groups.forEach((group, gIdx) => {
    const groupMatches = generateRoundRobinSchedule(group.teams, {
      prefix: `grp-${group.id || gIdx}`,
      groupId: group.id || `grp-${gIdx + 1}`,
      groupName: group.name,
      stageName: `${group.name} Matches`,
      startDate: options.startDate,
      venue: options.venue
    });
    allMatches.push(...groupMatches);
  });

  // 2. Generate Playoff Knockout Matches (Semi-Finals & Final)
  // Assuming 2 groups with Top 2 advancing from each (4 teams total in playoffs)
  // Semi-Final 1: 1st Group A vs 2nd Group B
  // Semi-Final 2: 1st Group B vs 2nd Group A
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
    venue: options.venue || "Parish Main Ground"
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
    venue: options.venue || "Parish Main Ground"
  };

  const grandFinal = {
    id: "po-final",
    round: 2,
    roundName: "Grand Championship Final",
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
    venue: options.venue || "Divine Mercy Stadium Pitch"
  };

  allMatches.push(sf1, sf2, grandFinal);
  return allMatches;
}

// Calculate Standings Table for a given set of teams & matches
export function calculateStandings(teams, matches, pointsConfig = { win: 3, draw: 1, loss: 0 }) {
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
      points: 0
    };
  });

  matches.forEach((m) => {
    if (m.status !== "COMPLETED") return;
    if (!standingsMap[m.teamAId] || !standingsMap[m.teamBId]) return;

    const rowA = standingsMap[m.teamAId];
    const rowB = standingsMap[m.teamBId];

    rowA.played++;
    rowB.played++;

    rowA.goalsFor += Number(m.scoreA || 0);
    rowA.goalsAgainst += Number(m.scoreB || 0);

    rowB.goalsFor += Number(m.scoreB || 0);
    rowB.goalsAgainst += Number(m.scoreA || 0);

    if (m.scoreA > m.scoreB) {
      rowA.won++;
      rowA.points += pointsConfig.win;
      rowB.lost++;
      rowB.points += pointsConfig.loss;
    } else if (m.scoreB > m.scoreA) {
      rowB.won++;
      rowB.points += pointsConfig.win;
      rowA.lost++;
      rowA.points += pointsConfig.loss;
    } else {
      rowA.drawn++;
      rowB.drawn++;
      rowA.points += pointsConfig.draw;
      rowB.points += pointsConfig.draw;
    }
  });

  const standingsList = Object.values(standingsMap).map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst
  }));

  standingsList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return standingsList;
}

// Calculate Group Stage Standings (keyed by groupId)
export function calculateGroupStandings(groups = [], matches = []) {
  const results = {};
  groups.forEach((group) => {
    const groupMatches = matches.filter(
      (m) => m.groupId === group.id || (m.stageName && m.stageName.includes(group.name))
    );
    results[group.id] = {
      group,
      standings: calculateStandings(group.teams, groupMatches)
    };
  });
  return results;
}

// Auto-advance match results in Knockout or Group Playoff trees
export function applyMatchResult(matches, matchId, updates = {}) {
  const { scoreA, scoreB, status, winnerId, teamAId, teamBId, scheduledAt, venue } = updates;

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
