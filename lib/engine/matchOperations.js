/**
 * Match Updates, Stats, and Player Helpers
 */

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

export function normalizePlayers(players) {
  if (!players) return [];
  if (Array.isArray(players)) {
    return players.map((p, idx) => {
      if (typeof p === "string") {
        const isCapt = p.includes("(C)");
        const isVC = p.includes("(VC)");
        const cleanName = p.replace(/\(C\)|\(VC\)/g, "").trim();
        return {
          id: `pl-${idx}-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          name: cleanName,
          role: isCapt ? "CAPTAIN" : isVC ? "VICE_CAPTAIN" : "PLAYER"
        };
      }
      return p;
    });
  }
  return [];
}

export function getCaptain(team) {
  if (!team || !team.players) return null;
  const players = Array.isArray(team.players) ? team.players : [];
  return players.find((p) => p.role === "CAPTAIN" || p.isCaptain) || players[0] || null;
}

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
