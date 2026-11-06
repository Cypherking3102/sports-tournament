"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Flame,
  CheckCircle2,
  Edit3,
  Filter,
  Plus,
  Users,
  Award,
  Star,
  Check,
  Search,
  User,
  X
} from "lucide-react";
import { getCaptain } from "@/lib/tournamentEngine";

export default function MatchSchedule({ tournament, onEditMatch, onAddMatch, isAdmin }) {
  const { matches = [], teams = [], scoreUnit = "Score", participantType = "INDIVIDUAL" } = tournament;
  const [filterStage, setFilterStage] = useState("ALL");
  const [playerSearch, setPlayerSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const isIndividual = participantType === "INDIVIDUAL" || teams.length > 0;

  const teamMap = useMemo(() => {
    const map = {};
    teams.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [teams]);

  // Unique stages
  const uniqueStages = useMemo(() => {
    const sSet = new Set();
    matches.forEach((m) => {
      if (m.stageName) sSet.add(m.stageName);
    });
    return Array.from(sSet);
  }, [matches]);

  // Unique players in this tournament, sorted strictly A-Z
  const tournamentPlayers = useMemo(() => {
    const list = teams.map((t) => t.name).filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [teams]);

  // Visible players matching search query
  const visiblePlayers = useMemo(() => {
    if (!playerSearch.trim()) return tournamentPlayers;
    const q = playerSearch.trim().toLowerCase();
    return tournamentPlayers.filter((p) => p.toLowerCase().includes(q));
  }, [tournamentPlayers, playerSearch]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Stage filter
      if (filterStage !== "ALL" && m.stageName !== filterStage) return false;

      // Player filter
      const activePlayerFilter = (selectedPlayer || playerSearch).trim().toLowerCase();
      if (activePlayerFilter) {
        const teamA = teamMap[m.teamAId];
        const teamB = teamMap[m.teamBId];
        const nameA = (teamA ? teamA.name : m.placeholderA || "").toLowerCase();
        const nameB = (teamB ? teamB.name : m.placeholderB || "").toLowerCase();
        return nameA.includes(activePlayerFilter) || nameB.includes(activePlayerFilter);
      }

      return true;
    });
  }, [matches, filterStage, selectedPlayer, playerSearch, teamMap]);

  const handleSelectPlayer = (pName) => {
    if (selectedPlayer === pName) {
      setSelectedPlayer("");
    } else {
      setSelectedPlayer(pName);
      setPlayerSearch("");
    }
  };

  const handleClearFilters = () => {
    setSelectedPlayer("");
    setPlayerSearch("");
    setFilterStage("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Stage Filter, Player Search & Alphabetical Pills */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="font-extrabold text-white text-base">Match Fixtures & Schedule</h3>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredMatches.length} of {matches.length})
            </span>
          </div>

          {isAdmin && onAddMatch && (
            <button
              onClick={onAddMatch}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Fixture</span>
            </button>
          )}
        </div>

        {/* Filters Row: Stage Selector & Search Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          {/* Stage Dropdown */}
          <div>
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
              Filter by Stage / Group
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFilterStage("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterStage === "ALL"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                All Stages
              </button>
              {uniqueStages.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStage(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterStage === s
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search Input */}
          <div>
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 flex items-center justify-between">
              <span>Search Player Name</span>
              {(selectedPlayer || playerSearch) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search player name..."
                value={playerSearch}
                onChange={(e) => {
                  setPlayerSearch(e.target.value);
                  setSelectedPlayer("");
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              {(playerSearch || selectedPlayer) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alphabetical Player Chips */}
        {tournamentPlayers.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold">Tap to filter by participant:</span>
              <span className="font-mono text-slate-500">{tournamentPlayers.length} Players (A-Z)</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80 scrollbar-thin">
              {visiblePlayers.map((pName) => {
                const isSelected = selectedPlayer === pName;
                return (
                  <button
                    key={pName}
                    type="button"
                    onClick={() => handleSelectPlayer(pName)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                        : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                    <span>{pName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Pill indicator if player is selected */}
      {(selectedPlayer || playerSearch) && (
        <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-2xl px-4 py-2.5 text-xs">
          <div className="flex items-center space-x-2 text-blue-300">
            <User className="w-4 h-4 text-blue-400" />
            <span>
              Showing matches for: <strong>"{selectedPlayer || playerSearch}"</strong> ({filteredMatches.length} matches found)
            </span>
          </div>
          <button
            onClick={handleClearFilters}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold underline"
          >
            Show All
          </button>
        </div>
      )}

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-white font-bold text-sm">No matches found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try clearing your player or stage filter to see all scheduled matches.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((m) => {
            const teamA = teamMap[m.teamAId];
            const teamB = teamMap[m.teamBId];
            const nameA = teamA ? teamA.name : m.placeholderA || "TBD";
            const nameB = teamB ? teamB.name : m.placeholderB || "TBD";
            const initialA = (nameA || "P")[0]?.toUpperCase();
            const initialB = (nameB || "P")[0]?.toUpperCase();
            const isCompleted = m.status === "COMPLETED";
            const isLive = m.status === "LIVE";
            const winnerIsA = isCompleted && m.winnerId === m.teamAId;
            const winnerIsB = isCompleted && m.winnerId === m.teamBId;

            const activeTarget = (selectedPlayer || playerSearch).trim().toLowerCase();
            const isHighlightA = activeTarget && nameA.toLowerCase().includes(activeTarget);
            const isHighlightB = activeTarget && nameB.toLowerCase().includes(activeTarget);

            return (
              <div
                key={m.id}
                onClick={() => isAdmin && onEditMatch && onEditMatch(m)}
                className={`p-4 rounded-2xl border transition-all ${
                  isAdmin ? "cursor-pointer hover:border-blue-400 hover:shadow-lg" : ""
                } ${
                  isLive
                    ? "border-red-500/50 bg-red-950/20 shadow-md"
                    : isCompleted
                    ? "border-slate-800/80 bg-slate-900/80"
                    : "border-slate-800 bg-slate-950/90 hover:border-slate-700 shadow"
                }`}
              >
                {/* Top Status & Stage */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-200">
                      {m.roundName || m.stageName || "Fixture"}
                    </span>
                    {m.court && (
                      <span className="text-[11px] font-bold text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {m.court}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {isLive && (
                      <span className="flex items-center space-x-1 text-red-400 font-bold animate-pulse text-xs">
                        <Flame className="w-3.5 h-3.5" />
                        <span>LIVE NOW</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-emerald-400 font-bold text-xs uppercase">
                        Final Result
                      </span>
                    )}
                    {m.status === "SCHEDULED" && (
                      <span className="flex items-center space-x-1 text-slate-400 text-xs font-mono">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>{m.startTime ? `${m.startTime} - ${m.endTime}` : m.scheduledAt || "Scheduled"}</span>
                      </span>
                    )}
                    {isAdmin && <Edit3 className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                </div>

                {/* Participant Rows */}
                <div className="space-y-2">
                  {/* Participant A */}
                  <div
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      isHighlightA
                        ? "bg-blue-600/20 border border-blue-500/40"
                        : winnerIsA
                        ? "bg-emerald-500/10 font-bold"
                        : "bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
                        {initialA}
                      </span>
                      <span
                        className={`text-sm font-bold truncate ${
                          isHighlightA ? "text-blue-300 underline font-black" : winnerIsA ? "text-emerald-300" : "text-white"
                        }`}
                      >
                        {nameA}
                      </span>
                      {winnerIsA && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    </div>
                    <span
                      className={`font-mono text-base font-black px-3 py-0.5 rounded-xl ${
                        isCompleted || isLive
                          ? winnerIsA
                            ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                            : "bg-slate-800 text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {isCompleted || isLive ? m.scoreA : "—"}
                    </span>
                  </div>

                  {/* Participant B */}
                  <div
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      isHighlightB
                        ? "bg-blue-600/20 border border-blue-500/40"
                        : winnerIsB
                        ? "bg-emerald-500/10 font-bold"
                        : "bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
                        {initialB}
                      </span>
                      <span
                        className={`text-sm font-bold truncate ${
                          isHighlightB ? "text-blue-300 underline font-black" : winnerIsB ? "text-emerald-300" : "text-white"
                        }`}
                      >
                        {nameB}
                      </span>
                      {winnerIsB && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    </div>
                    <span
                      className={`font-mono text-base font-black px-3 py-0.5 rounded-xl ${
                        isCompleted || isLive
                          ? winnerIsB
                            ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                            : "bg-slate-800 text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {isCompleted || isLive ? m.scoreB : "—"}
                    </span>
                  </div>
                </div>

                {/* Bottom Details: Location & Duration (No referee) */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/60 text-xs text-slate-400 font-mono">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{m.venue || "Parish Complex"}</span>
                    {m.court && <span>• {m.court}</span>}
                  </div>
                  {m.duration && <span>{m.duration}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
