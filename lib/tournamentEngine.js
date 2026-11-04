/**
 * Tournament Engine — Bracket generation, round-robin fixtures,
 * auto-advancement, and standings calculation.
 */

// Generate a Single-Elimination Knockout Bracket
export function generateKnockoutBracket(teams, options = {}) {
  const count = teams.length;
  if (count < 2) throw new Error("At least 2 teams are required to generate a bracket.");

  // Find nearest power of 2 >= count
  let bracketSize = 2;
  while (bracketSize < count) {
    bracketSize *= 2;
  }

  const numRounds = Math.log2(bracketSize);

  // Standard tournament seeding order for power of 2
  const seedOrder = getSeedOrder(bracketSize);

  // Sort teams by seed (or index if no seed provided)
  const sortedTeams = [...teams].sort((a, b) => (a.seed || 999) - (b.seed || 999));

  // Map seeds to teams or null (bye)
  const seededParticipants = seedOrder.map((seedNum) => {
    return sortedTeams[seedNum - 1] || null;
  });

  const matches = [];
  const roundNames = getRoundNames(numRounds);

  // Generate matches round by round from Final backwards to Round 1
  let matchCounter = 1;
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
        stageName: roundNames[r - 1],
        teamAId: null,
        teamBId: null,
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        nextMatchId,
        nextMatchSlot,
        scheduledAt: options.startDate ? `${options.startDate} 12:00` : "TBD",
        venue: options.venue || "Main Arena"
      };

      roundMatchMap[r].push(matchObj);
      matchCounter++;
    }
  }

  // Populate Round 1 with seeded teams
  const r1Matches = roundMatchMap[1];
  for (let i = 0; i < r1Matches.length; i++) {
    const teamA = seededParticipants[i * 2];
    const teamB = seededParticipants[i * 2 + 1];

    r1Matches[i].teamAId = teamA ? teamA.id : null;
    r1Matches[i].teamBId = teamB ? teamB.id : null;

    // Handle byes: if one team is a bye, the other automatically wins
    if (teamA && !teamB) {
      r1Matches[i].status = "COMPLETED";
      r1Matches[i].winnerId = teamA.id;
      // Push to next round immediately
      advanceInMap(roundMatchMap, r1Matches[i]);
    } else if (!teamA && teamB) {
      r1Matches[i].status = "COMPLETED";
      r1Matches[i].winnerId = teamB.id;
      advanceInMap(roundMatchMap, r1Matches[i]);
    }
  }

  // Flatten matches in round order
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

// Generates classic balanced seeding array (e.g. [1, 8, 4, 5, 2, 7, 3, 6] for 8)
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
    if (fromFinal === 0) names.push("Final");
    else if (fromFinal === 1) names.push("Semi-Finals");
    else if (fromFinal === 2) names.push("Quarter-Finals");
    else if (fromFinal === 3) names.push("Round of 16");
    else names.push(`Round ${r}`);
  }
  return names;
}

// Generate Round-Robin schedule (Berger / Circle Method)
export function generateRoundRobinSchedule(teams, options = {}) {
  const count = teams.length;
  if (count < 2) throw new Error("At least 2 teams are required for Round Robin.");

  const teamList = [...teams];
  const isOdd = count % 2 !== 0;
  if (isOdd) {
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

      // Skip bye matches
      if (teamA.id === "__BYE__" || teamB.id === "__BYE__") continue;

      matches.push({
        id: `rr-r${round}-m${i + 1}`,
        round,
        roundName: `Round ${round}`,
        stageName: "League Stage",
        teamAId: teamA.id,
        teamBId: teamB.id,
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        scheduledAt: options.startDate ? `${options.startDate} 18:00` : "TBD",
        venue: options.venue || "Arena Court 1"
      });
    }

    // Rotate teams keeping first team fixed (Circle method)
    const fixed = currentTeams[0];
    const rotated = [fixed, currentTeams[n - 1], ...currentTeams.slice(1, n - 1)];
    currentTeams = rotated;
  }

  return matches;
}

// Calculate Standings Table for Round Robin or Group Stage
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

  // Calculate goal difference & sort standings
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

// Auto-advance winner in knockout matches
export function applyMatchResult(matches, matchId, { scoreA, scoreB, status, winnerId }) {
  const updatedMatches = matches.map((m) => {
    if (m.id !== matchId) return m;

    let computedWinnerId = winnerId;
    if (!computedWinnerId && status === "COMPLETED") {
      if (scoreA > scoreB) computedWinnerId = m.teamAId;
      else if (scoreB > scoreA) computedWinnerId = m.teamBId;
    }

    return {
      ...m,
      scoreA: Number(scoreA),
      scoreB: Number(scoreB),
      status,
      winnerId: computedWinnerId
    };
  });

  // Find updated match
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
