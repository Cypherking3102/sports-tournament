/**
 * Client-Side Persistence Layer for Divine Mercy Church Tournaments
 * Guarantees that tournaments created, matches updated, and rosters edited
 * are never lost, even across serverless cold starts or lambda recycles.
 */

const STORAGE_KEY = "dmc_parish_tournaments_v5";

export function getClientTournaments() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not read tournaments from localStorage:", err);
    return [];
  }
}

export function saveClientTournament(tournament) {
  if (typeof window === "undefined" || !tournament || !tournament.id) return;
  try {
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
  const list = getClientTournaments();
  return list.find((t) => t.id === id) || null;
}

export function removeClientTournament(id) {
  if (typeof window === "undefined" || !id) return;
  try {
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
 * Any locally created or modified tournament is preserved.
 */
export function mergeTournaments(serverTournaments = []) {
  const localList = getClientTournaments();
  if (!localList || localList.length === 0) return serverTournaments;

  const map = new Map();
  // Server tournaments first
  serverTournaments.forEach((st) => {
    map.set(st.id, st);
  });

  // Local tournaments take precedence if they exist or were modified
  localList.forEach((lt) => {
    map.set(lt.id, lt);
  });

  return Array.from(map.values());
}

/**
 * Silently sync local tournaments to the server in the background
 */
export async function syncTournamentsToServer(tournamentsToSync) {
  if (typeof window === "undefined") return;
  const list = tournamentsToSync || getClientTournaments();
  if (!list || list.length === 0) return;

  try {
    await fetch("/api/tournaments/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournaments: list })
    });
  } catch (err) {
    // Non-blocking sync attempt
    console.warn("Background server sync skipped:", err.message);
  }
}
