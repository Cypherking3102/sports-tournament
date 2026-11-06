import fs from "fs";
import path from "path";
import os from "os";
import { initialTournaments } from "./seedData.js";
import { applyMatchResult, calculateStandings, calculateGroupStandings } from "./tournamentEngine.js";

// In Vercel serverless / AWS Lambda, the root deployment directory (/var/task) is read-only.
// os.tmpdir() (/tmp) is the writable filesystem directory.
const isServerless =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  (typeof process.cwd === "function" && process.cwd().startsWith("/var/task"));

const DATA_DIR = isServerless ? os.tmpdir() : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "tournaments.json");

// In-memory cache to guarantee instant reads and safe fallbacks
let inMemoryTournaments = null;

function ensureDatabase() {
  if (inMemoryTournaments && inMemoryTournaments.length > 0) return;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      inMemoryTournaments = JSON.parse(raw);
    } else {
      inMemoryTournaments = JSON.parse(JSON.stringify(initialTournaments));
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryTournaments, null, 2), "utf-8");
      } catch (writeErr) {
        console.warn("Filesystem write skipped in ensureDatabase:", writeErr.message);
      }
    }
  } catch (err) {
    console.warn("Database initialization fallback to in-memory:", err.message);
    if (!inMemoryTournaments) {
      inMemoryTournaments = JSON.parse(JSON.stringify(initialTournaments));
    }
  }
}

function saveTournaments(data) {
  inMemoryTournaments = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Filesystem write warning:", err.message);
  }
}

export function getAllTournaments() {
  ensureDatabase();
  return inMemoryTournaments || initialTournaments;
}

export function getTournamentById(id) {
  const tournaments = getAllTournaments();
  const tournament = tournaments.find((t) => t.id === id);
  if (!tournament) return null;

  let standings = null;
  let groupStandings = null;

  // Defensive: Reconstruct groups if missing for a group knockout tournament
  let activeGroups = tournament.groups || [];
  if (tournament.format === "GROUP_KNOCKOUT" && activeGroups.length === 0 && tournament.teams) {
    const groupNames = Array.from(new Set(tournament.teams.map((t) => t.group || "Group A")));
    activeGroups = groupNames.map((gn, gIdx) => ({
      id: `grp-${String.fromCharCode(97 + gIdx)}`,
      name: gn,
      teams: tournament.teams.filter((t) => (t.group || "Group A") === gn)
    }));
    tournament.groups = activeGroups;
  }

  if (tournament.format === "ROUND_ROBIN" && tournament.teams && tournament.matches) {
    standings = calculateStandings(tournament.teams, tournament.matches, tournament.pointsConfig);
  } else if (tournament.format === "GROUP_KNOCKOUT" && activeGroups.length > 0 && tournament.matches) {
    groupStandings = calculateGroupStandings(activeGroups, tournament.matches, tournament.pointsConfig, tournament.teams);
  }

  return {
    ...tournament,
    standings,
    groupStandings
  };
}

export function createTournament(tournamentData) {
  ensureDatabase();
  const tournaments = [...(inMemoryTournaments || initialTournaments)];

  // Ensure unique ID
  const newId = tournamentData.id || `tourney-${Date.now()}`;
  const existingIdx = tournaments.findIndex((t) => t.id === newId);

  const newTournament = {
    ...tournamentData,
    id: newId,
    status: tournamentData.status || "UPCOMING",
    createdAt: tournamentData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (existingIdx !== -1) {
    tournaments[existingIdx] = newTournament;
  } else {
    tournaments.unshift(newTournament);
  }

  saveTournaments(tournaments);
  return newTournament;
}

export function updateTournament(id, updates) {
  ensureDatabase();
  const tournaments = [...(inMemoryTournaments || initialTournaments)];
  const index = tournaments.findIndex((t) => t.id === id);

  if (index === -1) {
    // Upsert if tournament was created on another serverless node
    const newTournament = {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    tournaments.unshift(newTournament);
    saveTournaments(tournaments);
    return newTournament;
  }

  tournaments[index] = {
    ...tournaments[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveTournaments(tournaments);
  return tournaments[index];
}

export function deleteTournament(id) {
  ensureDatabase();
  const tournaments = [...(inMemoryTournaments || initialTournaments)];
  const filtered = tournaments.filter((t) => t.id !== id);
  saveTournaments(filtered);
  return true;
}

export function updateMatchScore(tournamentId, matchId, updateData) {
  ensureDatabase();
  const tournaments = [...(inMemoryTournaments || initialTournaments)];
  let tournament = tournaments.find((t) => t.id === tournamentId);

  // If tournament is missing from current server instance but provided as fallback:
  if (!tournament && updateData.fallbackTournament) {
    tournament = updateData.fallbackTournament;
    tournaments.unshift(tournament);
  }

  if (!tournament) return null;

  tournament.matches = applyMatchResult(tournament.matches || [], matchId, updateData);
  tournament.updatedAt = new Date().toISOString();
  saveTournaments(tournaments);
  return getTournamentById(tournamentId);
}

export function syncTournaments(clientTournaments = [], deletedIds = []) {
  ensureDatabase();
  let current = [...(inMemoryTournaments || initialTournaments)];
  let changed = false;

  if (Array.isArray(deletedIds) && deletedIds.length > 0) {
    const prevLen = current.length;
    current = current.filter((t) => !deletedIds.includes(t.id));
    if (current.length !== prevLen) {
      changed = true;
    }
  }

  clientTournaments.forEach((clientT) => {
    if (!clientT || !clientT.id) return;
    if (Array.isArray(deletedIds) && deletedIds.includes(clientT.id)) return;
    const idx = current.findIndex((t) => t.id === clientT.id);
    if (idx !== -1) {
      current[idx] = {
        ...current[idx],
        ...clientT,
        updatedAt: clientT.updatedAt || new Date().toISOString()
      };
      changed = true;
    } else {
      current.unshift(clientT);
      changed = true;
    }
  });

  if (changed) {
    saveTournaments(current);
  }
  return inMemoryTournaments;
}

export function resetDatabase() {
  inMemoryTournaments = JSON.parse(JSON.stringify(initialTournaments));
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryTournaments, null, 2), "utf-8");
  } catch (e) {
    console.warn("Reset write skipped:", e.message);
  }
  return inMemoryTournaments;
}
