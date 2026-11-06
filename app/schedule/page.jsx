"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Trophy,
  Flame,
  CheckCircle,
  ArrowRight,
  Filter,
  Check,
  X,
  Edit3
} from "lucide-react";
import ScoreModal from "@/components/ScoreModal";
import CustomPlayerDropdown from "@/components/CustomPlayerDropdown";
import { getClientTournaments, saveClientTournament } from "@/lib/clientStorage";

export default function GlobalSchedulePage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedSport, setSelectedSport] = useState("ALL");
  const [selectedFloor, setSelectedFloor] = useState("ALL");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedMatchTournament, setSelectedMatchTournament] = useState(null);

  useEffect(() => {
    fetchData();
    const token = localStorage.getItem("sports_admin_token");
    if (token) setIsAdmin(true);

    const handleStorageChange = () => {
      setIsAdmin(!!localStorage.getItem("sports_admin_token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tournaments");
      const serverData = res.ok ? await res.json() : [];
      const localData = getClientTournaments();

      // Merge server and local
      const map = new Map();
      (Array.isArray(serverData) ? serverData : []).forEach((t) => map.set(t.id, t));
      localData.forEach((t) => map.set(t.id, t));

      setTournaments(Array.from(map.values()));
    } catch (err) {
      console.error(err);
      setTournaments(getClientTournaments());
    } finally {
      setLoading(false);
    }
  };

  // Compile unique players across all tournaments, sorted strictly A-Z (clean names, no emojis)
  const allPlayers = useMemo(() => {
    const namesSet = new Set();
    tournaments.forEach((tourney) => {
      (tourney.teams || []).forEach((t) => {
        if (t.name && t.name.trim()) {
          namesSet.add(t.name.trim());
        }
      });
    });

    return Array.from(namesSet).sort((a, b) => a.localeCompare(b));
  }, [tournaments]);

  // Compile all matches across all tournaments enriched with time info
  const allEnrichedMatches = useMemo(() => {
    const list = [];
    tournaments.forEach((tourney) => {
      const teamLookup = {};
      (tourney.teams || []).forEach((t) => {
        teamLookup[t.id] = t;
      });

      (tourney.matches || []).forEach((m) => {
        const teamA = teamLookup[m.teamAId];
        const teamB = teamLookup[m.teamBId];
        const player1 = teamA ? teamA.name : m.placeholderA || "TBD";
        const player2 = teamB ? teamB.name : m.placeholderB || "TBD";

        // Parse start time for chronological sorting
        const timeStr = m.startTime || (m.scheduledAt ? m.scheduledAt.split(" ")[1] : "00:00");

        list.push({
          ...m,
          tournamentId: tourney.id,
          tournamentTitle: tourney.title,
          sport: tourney.sport,
          player1,
          player2,
          initialA: (player1 || "P")[0]?.toUpperCase(),
          initialB: (player2 || "P")[0]?.toUpperCase(),
          timeStr,
          rawTournament: tourney
        });
      });
    });

    // Chronological Sort: by timeStr ascending
    list.sort((a, b) => (a.timeStr || "").localeCompare(b.timeStr || ""));
    return list;
  }, [tournaments]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return allEnrichedMatches.filter((m) => {
      // 1. Sport filter
      if (selectedSport !== "ALL" && m.sport.toLowerCase() !== selectedSport.toLowerCase()) {
        return false;
      }

      // 2. Floor / Area filter
      if (selectedFloor === "4th" && !m.venue?.includes("4th Floor")) return false;
      if (selectedFloor === "Ground" && !m.venue?.includes("Ground Floor")) return false;
      if (selectedFloor === "Turf" && !m.venue?.includes("Turf")) return false;
      if (selectedFloor === "Court" && !m.venue?.includes("Throwball Court") && !m.venue?.includes("Court")) return false;

      // 3. Player filter from custom dropdown
      if (selectedPlayer) {
        const p1 = (m.player1 || "").toLowerCase();
        const p2 = (m.player2 || "").toLowerCase();
        const query = selectedPlayer.trim().toLowerCase();
        return p1.includes(query) || p2.includes(query);
      }

      return true;
    });
  }, [allEnrichedMatches, selectedSport, selectedFloor, selectedPlayer]);

  // Player summary stats when a specific player is selected
  const playerStats = useMemo(() => {
    const target = selectedPlayer.trim().toLowerCase();
    if (!target) return null;

    const playerMatches = allEnrichedMatches.filter(
      (m) => m.player1.toLowerCase().includes(target) || m.player2.toLowerCase().includes(target)
    );

    if (playerMatches.length === 0) return null;

    const sportsInvolved = Array.from(new Set(playerMatches.map((m) => m.sport)));
    const completed = playerMatches.filter((m) => m.status === "COMPLETED").length;
    const upcoming = playerMatches.filter((m) => m.status === "SCHEDULED").length;
    const firstMatch = playerMatches[0]?.timeStr;
    const lastMatch =
      playerMatches[playerMatches.length - 1]?.endTime ||
      playerMatches[playerMatches.length - 1]?.timeStr;

    return {
      name: selectedPlayer,
      totalMatches: playerMatches.length,
      sportsInvolved,
      completed,
      upcoming,
      firstMatch,
      lastMatch
    };
  }, [selectedPlayer, allEnrichedMatches]);

  const handleMatchSaved = (updatedTournament) => {
    saveClientTournament(updatedTournament);
    setTournaments((prev) =>
      prev.map((t) => (t.id === updatedTournament.id ? updatedTournament : t))
    );
  };

  const handleClearFilters = () => {
    setSelectedPlayer("");
    setSelectedSport("ALL");
    setSelectedFloor("ALL");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner - Compact & Clean */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Divine Mercy Sports Day • Saturday 7th Nov 2026</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Find Your Match <span className="text-blue-400">Schedule</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Select your name or team from the dropdown below to view your scheduled match times across Carrom, Chess, Table Tennis, Cricket, and Throwball.
          </p>
        </div>
      </div>

      {/* Custom Player Dropdown & Filter Card (No clutter, purely custom dropdown) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div>
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Select Your Name or Team</span>
            </span>
            {selectedPlayer && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Show All Participants</span>
              </button>
            )}
          </label>

          <div className="max-w-md">
            <CustomPlayerDropdown
              players={allPlayers}
              selectedPlayer={selectedPlayer}
              onSelectPlayer={setSelectedPlayer}
              placeholder={`Choose Player or Team (${allPlayers.length} Participants)`}
            />
          </div>
        </div>

        {/* Filter Pills: Sport & Floor */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-mono mr-1">Sport:</span>
            {["ALL", "Carrom", "Chess", "Table Tennis", "Cricket", "Throwball"].map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSelectedSport(sp)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedSport === sp
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {sp === "ALL" ? "All Sports" : sp}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <span className="text-xs text-slate-500 font-mono">Venue:</span>
            {[
              { id: "ALL", label: "All Areas" },
              { id: "Turf", label: "Turf Pitch" },
              { id: "Court", label: "Throwball Court" },
              { id: "4th", label: "4th Floor" },
              { id: "Ground", label: "Ground Floor" }
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedFloor(id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedFloor === id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Player Personalized Summary Banner */}
      {playerStats && (
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900 border border-blue-500/40 rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-base font-black text-blue-400 font-mono shadow-inner">
              {playerStats.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg">{playerStats.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                  {playerStats.sportsInvolved.join(" & ")}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                First game at <strong className="text-white">{playerStats.firstMatch}</strong> • Last game concludes ~<strong className="text-white">{playerStats.lastMatch}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
              <span className="text-slate-400 block text-[10px]">TOTAL</span>
              <span className="font-extrabold text-white text-sm">{playerStats.totalMatches}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
              <span className="text-emerald-400 block text-[10px]">PLAYED</span>
              <span className="font-extrabold text-emerald-400 text-sm">{playerStats.completed}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
              <span className="text-blue-400 block text-[10px]">UPCOMING</span>
              <span className="font-extrabold text-blue-400 text-sm">{playerStats.upcoming}</span>
            </div>
          </div>
        </div>
      )}

      {/* Match Results Counter */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>
            {selectedPlayer
              ? `Matches for "${selectedPlayer}"`
              : "All Fixtures (In Order of Time)"}
          </span>
        </h2>
        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredMatches.length} matches
        </span>
      </div>

      {/* Fixtures List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading tournament schedules...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <User className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No matches found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try picking another player name from the dropdown or resetting your filters.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            Show All Matches
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredMatches.map((m) => {
            const isCompleted = m.status === "COMPLETED";
            const isLive = m.status === "LIVE";
            const target = selectedPlayer.trim().toLowerCase();
            const isTargetP1 = target && m.player1.toLowerCase().includes(target);
            const isTargetP2 = target && m.player2.toLowerCase().includes(target);

            const winnerIsA = isCompleted && m.winnerId === m.teamAId;
            const winnerIsB = isCompleted && m.winnerId === m.teamBId;

            return (
              <div
                key={m.id}
                onClick={() => {
                  if (isAdmin) {
                    setSelectedMatch(m);
                    setSelectedMatchTournament(m.rawTournament);
                  }
                }}
                className={`p-4 rounded-2xl border transition-all ${
                  isAdmin ? "cursor-pointer hover:border-blue-400 hover:shadow-lg" : ""
                } ${
                  isLive
                    ? "border-red-500/50 bg-red-950/20 shadow-md"
                    : isCompleted
                    ? "border-slate-800/90 bg-slate-900/80"
                    : "border-slate-800 bg-slate-950/90 hover:border-slate-700 shadow"
                }`}
              >
                {/* Top Badge: Time, Sport, Status */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-300 font-mono font-bold text-xs flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>{m.startTime ? `${m.startTime} - ${m.endTime}` : m.timeStr}</span>
                    </span>
                    <span className="font-extrabold text-white text-xs px-2 py-0.5 rounded bg-slate-800">
                      {m.sport}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isLive && (
                      <span className="flex items-center space-x-1 text-red-400 font-bold animate-pulse text-[11px]">
                        <Flame className="w-3 h-3" />
                        <span>LIVE</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-emerald-400 font-bold text-[11px] uppercase">
                        Final
                      </span>
                    )}
                    {m.status === "SCHEDULED" && (
                      <span className="text-slate-400 text-[11px] font-mono">Upcoming</span>
                    )}
                    {isAdmin && <Edit3 className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                </div>

                {/* Matchup Line */}
                <div className="space-y-2">
                  {/* Player 1 */}
                  <div
                    className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                      isTargetP1
                        ? "bg-blue-600/20 border border-blue-500/40"
                        : winnerIsA
                        ? "bg-emerald-500/10 font-bold"
                        : "bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
                        {m.initialA}
                      </span>
                      <span
                        className={`text-sm truncate font-bold ${
                          isTargetP1 ? "text-blue-300 underline font-black" : winnerIsA ? "text-emerald-300" : "text-white"
                        }`}
                      >
                        {m.player1}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-black px-2.5 py-0.5 rounded-lg bg-slate-800 text-white">
                      {isCompleted || isLive ? m.scoreA : "—"}
                    </span>
                  </div>

                  {/* Player 2 */}
                  <div
                    className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                      isTargetP2
                        ? "bg-blue-600/20 border border-blue-500/40"
                        : winnerIsB
                        ? "bg-emerald-500/10 font-bold"
                        : "bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
                        {m.initialB}
                      </span>
                      <span
                        className={`text-sm truncate font-bold ${
                          isTargetP2 ? "text-blue-300 underline font-black" : winnerIsB ? "text-emerald-300" : "text-white"
                        }`}
                      >
                        {m.player2}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-black px-2.5 py-0.5 rounded-lg bg-slate-800 text-white">
                      {isCompleted || isLive ? m.scoreB : "—"}
                    </span>
                  </div>
                </div>

                {/* Bottom Details: Stage, Board/Court, Venue Link */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-800/60 text-xs text-slate-400 font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-300">{m.stageName}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{m.court || m.venue}</span>
                    </span>
                    <span>({m.venue})</span>
                  </div>

                  <Link
                    href={`/tournaments/${m.tournamentId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1 hover:underline text-[11px]"
                  >
                    <span>Standings</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Score Modal */}
      {selectedMatch && selectedMatchTournament && (
        <ScoreModal
          match={selectedMatch}
          tournament={selectedMatchTournament}
          onClose={() => {
            setSelectedMatch(null);
            setSelectedMatchTournament(null);
          }}
          onSave={handleMatchSaved}
        />
      )}
    </div>
  );
}
