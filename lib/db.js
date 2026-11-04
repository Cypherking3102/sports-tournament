import fs from "fs";
import path from "path";
import { initialTournaments } from "./seedData.js";
import { applyMatchResult } from "./tournamentEngine.js";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "tournaments.json");

function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialTournaments, null, 2), "utf-8");
  }
}

export function getAllTournaments() {
  ensureDatabase();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database:", err);
    return initialTournaments;
  }
}

export function getTournamentById(id) {
  const tournaments = getAllTournaments();
  return tournaments.find((t) => t.id === id) || null;
}

export function createTournament(tournamentData) {
  const tournaments = getAllTournaments();
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
  const tournaments = getAllTournaments();
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
  const tournaments = getAllTournaments();
  const filtered = tournaments.filter((t) => t.id !== id);
  saveTournaments(filtered);
  return true;
}

export function updateMatchScore(tournamentId, matchId, updateData) {
  const tournaments = getAllTournaments();
  const tournament = tournaments.find((t) => t.id === tournamentId);
  if (!tournament) return null;

  tournament.matches = applyMatchResult(tournament.matches, matchId, updateData);
  saveTournaments(tournaments);
  return tournament;
}

export function resetDatabase() {
  ensureDatabase();
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialTournaments, null, 2), "utf-8");
  return initialTournaments;
}

function saveTournaments(data) {
  ensureDatabase();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}
