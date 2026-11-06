"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Flame,
  CheckCircle2,
  Edit3,
  Plus,
  Check,
  User,
  X
} from "lucide-react";
import CustomPlayerDropdown from "./CustomPlayerDropdown";

export default function MatchSchedule({ tournament, onEditMatch, onAddMatch, isAdmin }) {
  const { matches = [], teams = [], participantType = "INDIVIDUAL" } = tournament;
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const isIndividual = participantType === "INDIVIDUAL" || teams.length > 0;

  const teamMap = useMemo(() => {
    const map = {};
    teams.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [teams]);

  // Unique players in this tournament, sorted strictly A-Z
  const tournamentPlayers = useMemo(() => {
    const list = teams.map((t) => t.name).filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [teams]);

  // Filtered matches by selected player
  const filteredMatches = useMemo(() => {
    if (!selectedPlayer) return matches;
    const target = selectedPlayer.trim().toLowerCase();
    return matches.filter((m) => {
      const teamA = teamMap[m.teamAId];
      const teamB = teamMap[m.teamBId];
      const nameA = (teamA ? teamA.name : m.placeholderA || "").toLowerCase();
      const nameB = (teamB ? teamB.name : m.placeholderB || "").toLowerCase();
      return nameA.includes(target) || nameB.includes(target);
    });
  }, [matches, selectedPlayer, teamMap]);

  return (
    <div className="space-y-6">
      {/* Top Controls: Custom Player Dropdown & Admin Add Match Button */}
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

        {/* Custom Player Dropdown Only (Filter by Stage removed as requested) */}
        <div className="pt-2 border-t border-slate-800">
          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
            Find Your Match (Select Player)
          </label>
          <div className="max-w-md">
            <CustomPlayerDropdown
              players={tournamentPlayers}
              selectedPlayer={selectedPlayer}
              onSelectPlayer={setSelectedPlayer}
              placeholder={`Choose Player (${tournamentPlayers.length} Participants)`}
            />
          </div>
        </div>
      </div>

      {/* Active Filter Banner if player is selected */}
      {selectedPlayer && (
        <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-2xl px-4 py-2.5 text-xs">
          <div className="flex items-center space-x-2 text-blue-300">
            <User className="w-4 h-4 text-blue-400" />
            <span>
              Showing matches for: <strong>"{selectedPlayer}"</strong> ({filteredMatches.length} matches found)
            </span>
          </div>
          <button
            onClick={() => setSelectedPlayer("")}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold underline"
          >
            Show All Matches
          </button>
        </div>
      )}

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-white font-bold text-sm">No matches found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No matches scheduled for "{selectedPlayer}".
          </p>
          <button
            onClick={() => setSelectedPlayer("")}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Reset Filter
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

            const target = selectedPlayer.trim().toLowerCase();
            const isHighlightA = target && nameA.toLowerCase().includes(target);
            const isHighlightB = target && nameB.toLowerCase().includes(target);

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

                {/* Bottom Details: Location & Duration */}
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
