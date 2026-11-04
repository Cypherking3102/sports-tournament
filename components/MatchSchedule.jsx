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
  Timer
} from "lucide-react";

export default function MatchSchedule({ tournament, onEditMatch, onAddMatch, isAdmin }) {
  const { matches = [], teams = [], scoreUnit = "Score" } = tournament;
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterStage, setFilterStage] = useState("ALL");

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
      if (filterStatus !== "ALL" && m.status !== filterStatus) return false;
      if (filterStage !== "ALL" && m.stageName !== filterStage) return false;
      return true;
    });
  }, [matches, filterStatus, filterStage]);

  return (
    <div className="space-y-6">
      {/* Top Filter & Admin Add Match bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs scrollbar-none">
          {["ALL", "LIVE", "SCHEDULED", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                filterStatus === st
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              {st === "ALL" ? "All Fixtures" : st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {uniqueStages.length > 1 && (
            <div className="flex items-center space-x-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none"
              >
                <option value="ALL">All Stages</option>
                {uniqueStages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isAdmin && onAddMatch && (
            <button
              onClick={onAddMatch}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Match Fixture</span>
            </button>
          )}
        </div>
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 text-center text-slate-500 text-sm">
          No matches found for the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((m) => {
            const teamA = teamMap[m.teamAId];
            const teamB = teamMap[m.teamBId];
            const isCompleted = m.status === "COMPLETED";
            const isLive = m.status === "LIVE";
            const winnerIsA = isCompleted && m.winnerId === m.teamAId;
            const winnerIsB = isCompleted && m.winnerId === m.teamBId;

            return (
              <div
                key={m.id}
                className={`relative rounded-3xl border transition-all p-4 ${
                  isLive
                    ? "border-red-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/20 shadow-lg shadow-red-500/5"
                    : "border-slate-800 bg-slate-900/80 hover:border-slate-700 shadow-md"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2.5 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-200 font-mono text-[11px]">
                      {m.stageName || m.roundName}
                    </span>
                    {m.venue && (
                      <span className="flex items-center space-x-1 text-slate-500 text-[11px]">
                        <MapPin className="w-3 h-3 text-blue-400" />
                        <span>{m.venue}</span>
                      </span>
                    )}
                  </div>
                  <div>
                    {isLive && (
                      <span className="flex items-center space-x-1 text-red-400 font-bold animate-pulse text-[11px]">
                        <Flame className="w-3 h-3" />
                        <span>LIVE NOW</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="flex items-center space-x-1 text-slate-400 text-[11px] font-semibold uppercase">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Final Result</span>
                      </span>
                    )}
                    {m.status === "SCHEDULED" && (
                      <span className="flex items-center space-x-1 text-slate-400 text-[11px]">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span>{m.scheduledAt || "Upcoming"}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Scoreboard */}
                <div className="space-y-2 mb-3">
                  {/* Team A */}
                  <div
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                      winnerIsA ? "bg-blue-500/10 font-bold" : "bg-slate-950/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{teamA?.logo || "🛡️"}</span>
                      <div>
                        <span
                          className={`text-xs sm:text-sm ${
                            winnerIsA ? "text-blue-300 font-bold" : "text-slate-100"
                          }`}
                        >
                          {teamA ? teamA.name : m.placeholderA || "TBD"}
                        </span>
                        {teamA?.players && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                            {teamA.players}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`font-mono text-sm px-2.5 py-0.5 rounded-lg ${
                        winnerIsA
                          ? "text-blue-400 font-extrabold bg-blue-500/20"
                          : isCompleted || isLive
                          ? "text-white bg-slate-800"
                          : "text-slate-600"
                      }`}
                    >
                      {isCompleted || isLive ? m.scoreA : "-"}
                    </span>
                  </div>

                  {/* Team B */}
                  <div
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                      winnerIsB ? "bg-blue-500/10 font-bold" : "bg-slate-950/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{teamB?.logo || "🛡️"}</span>
                      <div>
                        <span
                          className={`text-xs sm:text-sm ${
                            winnerIsB ? "text-blue-300 font-bold" : "text-slate-100"
                          }`}
                        >
                          {teamB ? teamB.name : m.placeholderB || "TBD"}
                        </span>
                        {teamB?.players && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                            {teamB.players}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`font-mono text-sm px-2.5 py-0.5 rounded-lg ${
                        winnerIsB
                          ? "text-blue-400 font-extrabold bg-blue-500/20"
                          : isCompleted || isLive
                          ? "text-white bg-slate-800"
                          : "text-slate-600"
                      }`}
                    >
                      {isCompleted || isLive ? m.scoreB : "-"}
                    </span>
                  </div>
                </div>

                {/* Officials & Duration / Notes */}
                {(m.official || m.duration || m.playerNotes) && (
                  <div className="mb-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/40 text-[10px] text-slate-400 flex flex-wrap items-center gap-2">
                    {m.official && (
                      <span className="flex items-center space-x-1">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>{m.official}</span>
                      </span>
                    )}
                    {m.duration && (
                      <span className="flex items-center space-x-1 text-slate-500">
                        <Timer className="w-3 h-3 text-blue-400" />
                        <span>{m.duration}</span>
                      </span>
                    )}
                    {m.playerNotes && (
                      <span className="flex items-center space-x-1 text-slate-400 truncate max-w-full">
                        <Users className="w-3 h-3 text-blue-400" />
                        <span className="truncate">{m.playerNotes}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Footer & Admin Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    {scoreUnit}: {isCompleted || isLive ? `${m.scoreA} - ${m.scoreB}` : "Not Started"}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => onEditMatch && onEditMatch(m)}
                      className="flex items-center space-x-1.5 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg font-semibold transition-colors text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Match & Score</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
