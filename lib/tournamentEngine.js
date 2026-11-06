/**
 * Tournament Engine — Master Module
 * Cleanly re-exports modular engine units for maximum performance and maintainability.
 */

export {
  generateKnockoutBracket,
  generateRoundRobinSchedule,
  buildDefaultPlayoffMatches,
  generateGroupKnockoutTournament
} from "./engine/brackets.js";

export {
  calculateStandings,
  calculateGroupStandings
} from "./engine/standings.js";

export {
  seedPlayoffsFromGroups
} from "./engine/seeding.js";

export {
  applyMatchResult,
  calculateTournamentStats,
  normalizePlayers,
  getCaptain,
  formatRosterString
} from "./engine/matchOperations.js";
