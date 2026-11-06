/**
 * Standings & League Table Calculations
 */

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

  // Sort matches by schedule / completion order (exclude playoff/final matches from league table)
  const completedMatches = matches.filter(
    (m) =>
      m.status === "COMPLETED" &&
      m.groupId !== "PLAYOFFS" &&
      !m.stageName?.includes("Final") &&
      !m.roundName?.includes("Final")
  );

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
    form: row.form.slice(-5)
  }));

  // Sorting hierarchy: Points -> Goal Difference -> Goals For -> Name
  standingsList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return (a.team.name || "").localeCompare(b.team.name || "");
  });

  return standingsList;
}

export function calculateGroupStandings(groups = [], matches = [], pointsConfig = {}, allTeams = []) {
  const results = {};
  groups.forEach((group) => {
    const groupMatches = matches.filter(
      (m) => m.groupId === group.id || (m.stageName && m.stageName.includes(group.name))
    );
    const teamsInGroup =
      group.teams && group.teams.length > 0
        ? group.teams
        : allTeams.filter((t) => (t.group || "Group A") === group.name || t.group === group.id);

    results[group.id] = {
      group,
      standings: calculateStandings(teamsInGroup, groupMatches, pointsConfig)
    };
  });
  return results;
}
