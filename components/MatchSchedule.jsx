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
  Timer,
  Star,
  Check
} from "lucide-react";
import { getCaptain, formatRosterString } from "@/lib/tournamentEngine";

export default function MatchSchedule({ tournament, onEditMatch, onAddMatch, isAdmin }) {
  const { matches = [], teams = [], scoreUnit = "Score", participantType = "TEAM" } = tournament;
  const [filterStage, setFilterStage] = useState("ALL");
  const isIndividual = participantType === "INDIVIDUAL";

  const teamMap = useMemo(() => {
    const map = {};
    teams.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [teams]);

  const uniqueStages = useMemo(() => {
    const sSet = new Set();
    matches.forEach((m) => {
      if (m.stageName) sSet.add(m.stageName);
    });
    return Array.from(sSet);
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (filterStage !== "ALL" && m.stageName !== filterStage) return false;
      return true;
    });
  }, [matches, filterStage]);

  return (
    <div className="space-y-6">
      {/* Top Bar: Stage Selector & Admin Add Match Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-2xl">
        <div className="flex items-center space-x-2">
          {uniqueStages.length > 1 ? (
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Stages & Groups ({matches.length} Matches)</option>
                {uniqueStages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-slate-300 font-semibold flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>All Tournament Fixtures ({matches.length})</span>
            </div>
          )}
        </div>

        {isAdmin && onAddMatch && (
          <button
            onClick={onAddMatch}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Match</span>
          </button>
        )}
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-10 text-center space-y-2">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm font-medium">No matches scheduled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMatches.map((m) => {
            const teamA = teamMap[m.teamAId];
            const teamB = teamMap[m.teamBId];
            const captA = getCaptain(teamA);
            const captB = getCaptain(teamB);
            const isCompleted = m.status === "COMPLETED";
            const isLive = m.status === "LIVE";
            const winnerIsA = isCompleted && m.winnerId === m.teamAId;
            const winnerIsB = isCompleted && m.winnerId === m.teamBId;

            const nameA = teamA ? teamA.name : m.placeholderA || "TBD";
            const nameB = teamB ? teamB.name : m.placeholderB || "TBD";
            const logoA = teamA?.logo || (isIndividual ? "👤" : "🛡️");
            const logoB = teamB?.logo || (isIndividual ? "👤" : "🛡️");

            return (
              <div
                key={m.id}
                className={`relative rounded-3xl border transition-all p-5 shadow-sm ${
                  isLive
                    ? "border-red-500/60 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/20 shadow-red-500/10 shadow-lg"
                    : isCompleted
                    ? "border-slate-800 bg-slate-900/90 hover:border-slate-700"
                    : "border-slate-800/80 bg-slate-900/70 hover:border-slate-700"
                }`}
              >
                {/* Header: Stage and Live / Status badge */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-200">
                      {m.stageName || m.roundName}
                    </span>
                    {m.venue && (
                      <span className="flex items-center space-x-1 text-slate-400 text-xs hidden sm:inline-flex">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>{m.venue}</span>
                      </span>
                    )}
                  </div>

                  <div>
                    {isLive && (
                      <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-xs animate-pulse">
                        <Flame className="w-3.5 h-3.5" />
                        <span>LIVE NOW</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Final Result</span>
                      </span>
                    )}
                    {m.status === "SCHEDULED" && (
                      <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 font-semibold text-xs border border-slate-700/60">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>{m.scheduledAt || "Upcoming"}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Matchup Card: Large, Clear Names and Scores */}
                <div className="space-y-2.5">
                  {/* Participant A */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                      winnerIsA
                        ? "bg-emerald-500/10 border border-emerald-500/25"
                        : "bg-slate-950/60 border border-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <span className="text-2xl flex-shrink-0">{logoA}</span>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-sm sm:text-base font-bold truncate ${
                              winnerIsA ? "text-emerald-300" : "text-white"
                            }`}
                          >
                            {nameA}
                          </span>
                          {winnerIsA && (
                            <span className="flex-shrink-0 text-emerald-400" title="Winner">
                              <Check className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                        {!isIndividual && captA && (
                          <span className="text-xs text-amber-400 font-medium flex items-center space-x-1 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>Capt: {captA}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <span
                        className={`inline-block font-mono text-base sm:text-lg font-black px-3.5 py-1 rounded-xl ${
                          winnerIsA
                            ? "bg-emerald-500 text-slate-950 shadow-sm"
                            : isCompleted || isLive
                            ? "bg-slate-800 text-white"
                            : "bg-slate-900 text-slate-500 border border-slate-800"
                        }`}
                      >
                        {isCompleted || isLive ? m.scoreA : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Participant B */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                      winnerIsB
                        ? "bg-emerald-500/10 border border-emerald-500/25"
                        : "bg-slate-950/60 border border-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <span className="text-2xl flex-shrink-0">{logoB}</span>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-sm sm:text-base font-bold truncate ${
                              winnerIsB ? "text-emerald-300" : "text-white"
                            }`}
                          >
                            {nameB}
                          </span>
                          {winnerIsB && (
                            <span className="flex-shrink-0 text-emerald-400" title="Winner">
                              <Check className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                        {!isIndividual && captB && (
                          <span className="text-xs text-amber-400 font-medium flex items-center space-x-1 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>Capt: {captB}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <span
                        className={`inline-block font-mono text-base sm:text-lg font-black px-3.5 py-1 rounded-xl ${
                          winnerIsB
                            ? "bg-emerald-500 text-slate-950 shadow-sm"
                            : isCompleted || isLive
                            ? "bg-slate-800 text-white"
                            : "bg-slate-900 text-slate-500 border border-slate-800"
                        }`}
                      >
                        {isCompleted || isLive ? m.scoreB : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Optional Details (Venue, Referee, Duration) - Only shown if explicitly provided */}
                {(m.venue || m.official || m.duration || m.playerNotes) && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/70 flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
                    {m.venue && (
                      <span className="flex items-center space-x-1 sm:hidden">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>{m.venue}</span>
                      </span>
                    )}
                    {m.official && (
                      <span className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>Ref: {m.official}</span>
                      </span>
                    )}
                    {m.duration && (
                      <span className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Timer className="w-3 h-3 text-blue-400" />
                        <span>{m.duration}</span>
                      </span>
                    )}
                    {m.playerNotes && (
                      <span className="text-slate-400 truncate max-w-full italic text-[11px]">
                        "{m.playerNotes}"
                      </span>
                    )}
                  </div>
                )}

                {/* Admin Action Button */}
                {isAdmin && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/70 flex items-center justify-end">
                    <button
                      onClick={() => onEditMatch && onEditMatch(m)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-xl font-bold transition-colors text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Match & Score</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
