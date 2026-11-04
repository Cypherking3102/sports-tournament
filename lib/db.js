import fs from "fs";
import path from "path";
import os from "os";
import { initialTournaments } from "./seedData.js";
import { applyMatchResult, calculateStandings, calculateGroupStandings } from "./tournamentEngine.js";

// In Vercel serverless / AWS Lambda, the root deployment directory (/var/task) is read-only.
// os.tmpdir() (/tmp) is the only writable filesystem directory.
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
    // If filesystem write fails on serverless, the in-memory store remains live for the request
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

  if (tournament.format === "ROUND_ROBIN" && tournament.teams && tournament.matches) {
    standings = calculateStandings(tournament.teams, tournament.matches);
  } else if (tournament.format === "GROUP_KNOCKOUT" && tournament.groups && tournament.matches) {
    groupStandings = calculateGroupStandings(tournament.groups, tournament.matches);
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
  const newTournament = {
    ...tournamentData,
    id: tournamentData.id || `tourney-${Date.now()}`,
    status: tournamentData.status || "UPCOMING",
    createdAt: new Date().toISOString()
  };

  tournaments.unshift(newTournament);
  saveTournaments(tournaments);
  return newTournament;
}

export function updateTournament(id, updates) {
  ensureDatabase();
  const tournaments = [...(inMemoryTournaments || initialTournaments)];
  const index = tournaments.findIndex((t) => t.id === id);
  if (index === -1) return null;

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
  const tournament = tournaments.find((t) => t.id === tournamentId);
  if (!tournament) return null;

  tournament.matches = applyMatchResult(tournament.matches, matchId, updateData);
  saveTournaments(tournaments);
  return getTournamentById(tournamentId);
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
