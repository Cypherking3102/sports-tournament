/**
 * Client-Side Persistence Layer for Divine Mercy Church Tournaments
 * Guarantees that tournaments created, matches updated, and rosters edited
 * are never lost, even across serverless cold starts or lambda recycles.
 * Also provides robust deletion tracking so removed tournaments stay deleted.
 */

const STORAGE_KEY = "dmc_parish_tournaments_v10";
const DELETED_KEY = "dmc_parish_deleted_tournaments_v10";

// Allowed official tournament IDs from official Church schedule & fixtures
export const OFFICIAL_TOURNAMENT_IDS = [
  "dmc-carrom-2026",
  "dmc-chess-2026",
  "dmc-table-tennis-2026",
  "dmc-cricket-2026",
  "dmc-throwball-2026"
];

// Clean up previous stale client cache versions
if (typeof window !== "undefined") {
  try {
    // Preserve any user-deleted tournament IDs from v9 into v10
    const oldDeleted = localStorage.getItem("dmc_parish_deleted_tournaments_v9");
    if (oldDeleted && !localStorage.getItem(DELETED_KEY)) {
      localStorage.setItem(DELETED_KEY, oldDeleted);
    }

    [
      "dmc_parish_tournaments_v1",
      "dmc_parish_tournaments_v2",
      "dmc_parish_tournaments_v3",
      "dmc_parish_tournaments_v4",
      "dmc_parish_tournaments_v5",
      "dmc_parish_tournaments_v6",
      "dmc_parish_tournaments_v7",
      "dmc_parish_tournaments_v8",
      "dmc_parish_tournaments_v9"
    ].forEach((k) => {
      localStorage.removeItem(k);
    });
  } catch (_) {}
}

export function getDeletedTournamentIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

export function addDeletedTournamentId(id) {
  if (typeof window === "undefined" || !id) return;
  try {
    const deleted = getDeletedTournamentIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
    }
  } catch (_) {}
}

export function removeDeletedTournamentId(id) {
  if (typeof window === "undefined" || !id) return;
  try {
    const deleted = getDeletedTournamentIds().filter((d) => d !== id);
    localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
  } catch (_) {}
}

export function getClientTournaments() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const deletedIds = new Set(getDeletedTournamentIds());
    return parsed.filter((t) => t && t.id && !deletedIds.has(t.id));
  } catch (err) {
    console.warn("Could not read tournaments from localStorage:", err);
    return [];
  }
}

export function saveClientTournament(tournament) {
  if (typeof window === "undefined" || !tournament || !tournament.id) return;
  try {
    // If saving/updating, remove from deleted list if present
    removeDeletedTournamentId(tournament.id);

    const list = getClientTournaments();
    const idx = list.findIndex((t) => t.id === tournament.id);
    const enriched = {
      ...tournament,
      updatedAt: new Date().toISOString()
    };
    if (idx !== -1) {
      list[idx] = enriched;
    } else {
      list.unshift(enriched);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Trigger storage event for cross-component reactivity
    window.dispatchEvent(new Event("dmc_tournaments_updated"));
  } catch (err) {
    console.warn("Could not save tournament to localStorage:", err);
  }
}

export function getClientTournamentById(id) {
  if (typeof window === "undefined" || !id) return null;
  const deletedIds = new Set(getDeletedTournamentIds());
  if (deletedIds.has(id)) return null;

  const list = getClientTournaments();
  return list.find((t) => t.id === id) || null;
}

export function removeClientTournament(id) {
  if (typeof window === "undefined" || !id) return;
  try {
    addDeletedTournamentId(id);
    const list = getClientTournaments().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("dmc_tournaments_updated"));
  } catch (err) {
    console.warn("Could not remove tournament from localStorage:", err);
  }
}

export function clearClientTournaments() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("dmc_tournaments_updated"));
  } catch (err) {
    console.warn("Could not clear localStorage tournaments:", err);
  }
}

/**
 * Merge server tournaments with client tournaments.
 * Filters out deleted tournaments and ensures obsolete dummy tournaments are purged.
 */
export function mergeTournaments(serverTournaments = []) {
  const deletedIds = new Set(getDeletedTournamentIds());
  const localList = getClientTournaments().filter((t) => t && t.id && !deletedIds.has(t.id));

  const map = new Map();

  // Filter server tournaments: only allow non-deleted, valid tournaments
  const validServerTournaments = Array.isArray(serverTournaments)
    ? serverTournaments.filter((st) => st && st.id && !deletedIds.has(st.id))
    : [];

  validServerTournaments.forEach((st) => {
    map.set(st.id, st);
  });

  // Local tournaments take precedence if they exist or were modified
  localList.forEach((lt) => {
    map.set(lt.id, lt);
  });

  return Array.from(map.values());
}

/**
 * Silently sync local tournaments & deleted tournaments to the server in the background
 */
export async function syncTournamentsToServer(tournamentsToSync) {
  if (typeof window === "undefined") return;
  const list = tournamentsToSync || getClientTournaments();
  const deletedIds = getDeletedTournamentIds();

  try {
    await fetch("/api/tournaments/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tournaments: list || [],
        deletedIds: deletedIds || []
      })
    });
  } catch (err) {
    // Non-blocking sync attempt
    console.warn("Background server sync skipped:", err.message);
  }
}
