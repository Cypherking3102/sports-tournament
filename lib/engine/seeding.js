/**
 * Playoff Seeding Engine
 * Populates knockout brackets from group stage qualifiers & best 3rd place finishers
 */

import { calculateStandings, calculateGroupStandings } from "./standings.js";

export function seedPlayoffsFromGroups(groups = [], matches = [], pointsConfig = {}, allTeams = []) {
  const groupStandings = calculateGroupStandings(groups, matches, pointsConfig, allTeams);
  const updatedMatches = [...matches];

  // 1. Single League / Round-Robin (e.g. Chess): Top 2 advance to Final
  if (!groups || groups.length === 0 || groups.length === 1) {
    const overallStandings = calculateStandings(allTeams, matches, pointsConfig);
    const firstPlace = overallStandings[0]?.team || null;
    const secondPlace = overallStandings[1]?.team || null;

    return updatedMatches.map((m) => {
      const isFinal = m.roundName?.includes("Final") || m.stageName?.includes("Final") || m.id?.includes("Final");
      if (!isFinal) return m;

      let newTeamA = m.teamAId;
      let newTeamB = m.teamBId;

      if (!newTeamA && firstPlace) newTeamA = firstPlace.id;
      if (!newTeamB && secondPlace) newTeamB = secondPlace.id;

      return {
        ...m,
        teamAId: newTeamA,
        teamBId: newTeamB
      };
    });
  }

  // 2. Multi-group (e.g. Carrom, Table Tennis)
  const groupLeaders = {};
  const winnersList = [];
  const thirdPlaceList = [];

  groups.forEach((g) => {
    const s = groupStandings[g.id]?.standings || [];
    const winnerRow = s[0];
    const runnerRow = s[1];
    const thirdRow = s[2];

    groupLeaders[g.name] = {
      winner: winnerRow?.team || null,
      runnerUp: runnerRow?.team || null,
      third: thirdRow?.team || null,
      winnerPoints: winnerRow?.points || 0,
      winnerGoalDiff: winnerRow?.goalDifference || 0
    };

    if (winnerRow?.team) {
      winnersList.push({
        groupName: g.name,
        team: winnerRow.team,
        points: winnerRow.points || 0,
        diff: winnerRow.goalDifference || 0
      });
    }

    if (thirdRow?.team) {
      thirdPlaceList.push({
        groupName: g.name,
        team: thirdRow.team,
        points: thirdRow.points || 0,
        diff: thirdRow.goalDifference || 0,
        goalsFor: thirdRow.goalsFor || 0
      });
    }
  });

  // Sort group winners across all groups
  winnersList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.diff - a.diff;
  });

  const topWinner = winnersList[0]?.team || null;
  const secondWinner = winnersList[1]?.team || null;
  const thirdWinner = winnersList[2]?.team || null;

  // Sort 3rd place teams across groups by points, diff, goalsFor
  thirdPlaceList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.diff !== a.diff) return b.diff - a.diff;
    return b.goalsFor - a.goalsFor;
  });

  const bestThird1 = thirdPlaceList[0]?.team || null;
  const bestThird2 = thirdPlaceList[1]?.team || null;

  // Map existing matches by ID for Winner propagation
  const matchById = new Map();
  matches.forEach((m) => matchById.set(m.id, m));

  // Populate playoff matches
  return updatedMatches.map((m) => {
    const isPlayoff =
      m.groupId === "PLAYOFFS" ||
      m.stageName?.includes("Playoff") ||
      m.stageName?.includes("Semi") ||
      m.stageName?.includes("Final") ||
      m.stageName?.includes("Quarter") ||
      m.stageName?.includes("Prelim");

    if (!isPlayoff) return m;

    let newTeamA = m.teamAId;
    let newTeamB = m.teamBId;

    const checkPlaceholder = (p) => {
      if (!p) return null;
      const lower = p.toLowerCase();

      // Best 3rd place finishers
      if (lower.includes("best 3rd place #1") || lower.includes("best 3rd #1")) {
        return bestThird1 ? bestThird1.id : null;
      }
      if (lower.includes("best 3rd place #2") || lower.includes("best 3rd #2")) {
        return bestThird2 ? bestThird2.id : null;
      }

      // Group Winner / Runner-up by Rank notation (e.g. "Carrom Group A Rank 1", "TT Group B Rank 2")
      for (const [gName, leaders] of Object.entries(groupLeaders)) {
        const cleanG = gName.toLowerCase();
        if (lower.includes(cleanG) || (cleanG === "group a" && lower.includes("group a")) || (cleanG === "group b" && lower.includes("group b")) || (cleanG === "group c" && lower.includes("group c"))) {
          if (lower.includes("rank 1") || lower.includes("winner")) {
            return leaders.winner ? leaders.winner.id : null;
          }
          if (lower.includes("rank 2") || lower.includes("runner-up") || lower.includes("runner up")) {
            return leaders.runnerUp ? leaders.runnerUp.id : null;
          }
        }
      }

      // Ranked Group Winners across all groups
      if (lower.includes("top group winner") && topWinner) return topWinner.id;
      if (lower.includes("2nd group winner") && secondWinner) return secondWinner.id;
      if (lower.includes("3rd group winner") && thirdWinner) return thirdWinner.id;

      // Winner of previous playoff match (e.g. "Winner Carrom QF1", "Winner TT SF1")
      if (lower.includes("winner")) {
        for (const [mid, prevM] of matchById.entries()) {
          if (lower.includes(mid.toLowerCase()) || lower.includes((prevM.stageName || "").toLowerCase())) {
            if (prevM.status === "COMPLETED" && prevM.winnerId) {
              return prevM.winnerId;
            }
          }
        }
      }

      return null;
    };

    if (!newTeamA && m.placeholderA) {
      const matchFound = checkPlaceholder(m.placeholderA);
      if (matchFound) newTeamA = matchFound;
    }

    if (!newTeamB && m.placeholderB) {
      const matchFound = checkPlaceholder(m.placeholderB);
      if (matchFound) newTeamB = matchFound;
    }

    return {
      ...m,
      teamAId: newTeamA,
      teamBId: newTeamB
    };
  });
}
