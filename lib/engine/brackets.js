/**
 * Bracket & Round-Robin Generators
 */

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
        venue: options.venue || "",
        official: options.official || "",
        duration: options.duration || "",
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
        venue: options.venue || "",
        official: options.official || "",
        duration: options.duration || "",
        playerNotes: ""
      });
    }

    const fixed = currentTeams[0];
    const rotated = [fixed, currentTeams[n - 1], ...currentTeams.slice(1, n - 1)];
    currentTeams = rotated;
  }

  return matches;
}

export function buildDefaultPlayoffMatches(groups = [], options = {}) {
  const groupCount = groups.length || 2;
  const playoffStage = options.playoffStage || (groupCount >= 4 ? "QUARTER_FINALS" : groupCount === 1 ? "FINAL" : "SEMI_FINALS");
  const venue = options.venue || "";
  const official = options.official || "";
  const duration = options.duration || "";

  const grpNames = groups.map((g, i) => g.name || `Group ${String.fromCharCode(65 + i)}`);
  const gA = grpNames[0] || "Group A";
  const gB = grpNames[1] || "Group B";
  const gC = grpNames[2] || "Group C";
  const gD = grpNames[3] || "Group D";

  if (playoffStage === "FINAL") {
    return [
      {
        id: "po-final",
        round: 1,
        roundName: "Championship Final",
        stageName: "Championship Final",
        groupId: "PLAYOFFS",
        groupName: "Knockout Playoffs",
        teamAId: null,
        teamBId: null,
        placeholderA: groupCount > 1 ? `Winner ${gA}` : `1st Place ${gA}`,
        placeholderB: groupCount > 1 ? `Winner ${gB}` : `2nd Place ${gA}`,
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        nextMatchId: null,
        nextMatchSlot: null,
        scheduledAt: options.finalDate || (options.startDate ? `${options.startDate} 18:00` : "TBD"),
        venue,
        official,
        duration,
        playerNotes: ""
      }
    ];
  }

  // Default: SEMI_FINALS
  const sf1TeamA = `Winner ${gA}`;
  const sf1TeamB = groupCount >= 2 ? `Runner-up ${gB}` : `Runner-up ${gA}`;
  const sf2TeamA = groupCount >= 2 ? `Winner ${gB}` : `3rd Place ${gA}`;
  const sf2TeamB = groupCount >= 3 ? `Winner ${gC}` : `Runner-up ${gA}`;

  return [
    {
      id: "po-sf-1",
      round: 1,
      roundName: "Semi-Final 1",
      stageName: "Playoff Semi-Finals",
      groupId: "PLAYOFFS",
      groupName: "Knockout Playoffs",
      teamAId: null,
      teamBId: null,
      placeholderA: sf1TeamA,
      placeholderB: sf1TeamB,
      scoreA: 0,
      scoreB: 0,
      status: "SCHEDULED",
      winnerId: null,
      nextMatchId: "po-final",
      nextMatchSlot: "A",
      scheduledAt: options.playoffDate ? `${options.playoffDate} 16:00` : "TBD",
      venue,
      official,
      duration,
      playerNotes: ""
    },
    {
      id: "po-sf-2",
      round: 1,
      roundName: "Semi-Final 2",
      stageName: "Playoff Semi-Finals",
      groupId: "PLAYOFFS",
      groupName: "Knockout Playoffs",
      teamAId: null,
      teamBId: null,
      placeholderA: sf2TeamA,
      placeholderB: sf2TeamB,
      scoreA: 0,
      scoreB: 0,
      status: "SCHEDULED",
      winnerId: null,
      nextMatchId: "po-final",
      nextMatchSlot: "B",
      scheduledAt: options.playoffDate ? `${options.playoffDate} 17:30` : "TBD",
      venue,
      official,
      duration,
      playerNotes: ""
    },
    {
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
      venue,
      official,
      duration,
      playerNotes: ""
    }
  ];
}

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

  const playoffMatches =
    options.playoffMatches && options.playoffMatches.length > 0
      ? options.playoffMatches
      : buildDefaultPlayoffMatches(groups, options);

  allMatches.push(...playoffMatches);
  return allMatches;
}
