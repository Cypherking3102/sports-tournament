"use client";

import { useState, useMemo } from "react";
import { Calendar, MapPin, Clock, Flame, CheckCircle2, Edit3, Filter } from "lucide-react";

export default function MatchSchedule({ tournament, onEditMatch, isAdmin }) {
  const { matches = [], teams = [], scoreUnit = "Score" } = tournament;
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterRound, setFilterRound] = useState("ALL");

  const teamMap = useMemo(() => {
    const map = {};
    teams.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [teams]);

  const uniqueRounds = useMemo(() => {
    const rSet = new Set();
    matches.forEach((m) => rSet.add(m.round));
    return Array.from(rSet).sort((a, b) => a - b);
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (filterStatus !== "ALL" && m.status !== filterStatus) return false;
      if (filterRound !== "ALL" && m.round !== Number(filterRound)) return false;
      return true;
    });
  }, [matches, filterStatus, filterRound]);

  return (
    <div className="space-y-6">
      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800 p-3 rounded-2xl">
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs scrollbar-none">
          {["ALL", "LIVE", "SCHEDULED", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                filterStatus === st
                  ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20"
                  : "bg-zinc-800/80 text-zinc-400 hover:text-white"
              }`}
            >
              {st === "ALL" ? "All Fixtures" : st}
            </button>
          ))}
        </div>

        {uniqueRounds.length > 1 && (
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={filterRound}
              onChange={(e) => setFilterRound(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-zinc-200 text-xs focus:outline-none"
            >
              <option value="ALL">All Rounds</option>
              {uniqueRounds.map((r) => (
                <option key={r} value={r}>
                  Round {r}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-8 text-center text-zinc-500 text-sm">
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
                className={`relative rounded-2xl border transition-all p-4 ${
                  isLive
                    ? "border-red-500/40 bg-gradient-to-br from-zinc-900 via-zinc-900 to-red-950/20 shadow-lg shadow-red-500/5"
                    : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2.5 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-zinc-300 font-mono">
                      {m.stageName || m.roundName}
                    </span>
                    {m.venue && (
                      <span className="flex items-center space-x-1 text-zinc-500 text-[11px]">
                        <MapPin className="w-3 h-3" />
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
                      <span className="flex items-center space-x-1 text-zinc-500 text-[11px] font-semibold uppercase">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Finished</span>
                      </span>
                    )}
                    {m.status === "SCHEDULED" && (
                      <span className="flex items-center space-x-1 text-zinc-500 text-[11px]">
                        <Clock className="w-3 h-3" />
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
                      winnerIsA ? "bg-amber-500/10 font-bold" : "bg-zinc-950/40"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{teamA?.logo || "🛡️"}</span>
                      <div>
                        <span
                          className={`text-sm ${
                            winnerIsA ? "text-amber-300 font-bold" : "text-zinc-100"
                          }`}
                        >
                          {teamA ? teamA.name : "TBD"}
                        </span>
                        {teamA?.shortName && (
                          <span className="text-[10px] text-zinc-500 ml-2 font-mono">
                            [{teamA.shortName}]
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`font-mono text-base px-2.5 py-0.5 rounded-lg ${
                        winnerIsA
                          ? "text-amber-400 font-extrabold bg-amber-500/20"
                          : isCompleted || isLive
                          ? "text-white bg-zinc-800"
                          : "text-zinc-600"
                      }`}
                    >
                      {isCompleted || isLive ? m.scoreA : "-"}
                    </span>
                  </div>

                  {/* Team B */}
                  <div
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                      winnerIsB ? "bg-amber-500/10 font-bold" : "bg-zinc-950/40"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{teamB?.logo || "🛡️"}</span>
                      <div>
                        <span
                          className={`text-sm ${
                            winnerIsB ? "text-amber-300 font-bold" : "text-zinc-100"
                          }`}
                        >
                          {teamB ? teamB.name : "TBD"}
                        </span>
                        {teamB?.shortName && (
                          <span className="text-[10px] text-zinc-500 ml-2 font-mono">
                            [{teamB.shortName}]
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`font-mono text-base px-2.5 py-0.5 rounded-lg ${
                        winnerIsB
                          ? "text-amber-400 font-extrabold bg-amber-500/20"
                          : isCompleted || isLive
                          ? "text-white bg-zinc-800"
                          : "text-zinc-600"
                      }`}
                    >
                      {isCompleted || isLive ? m.scoreB : "-"}
                    </span>
                  </div>
                </div>

                {/* Footer & Admin Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                  <span className="text-zinc-500 font-mono text-[11px]">
                    {scoreUnit}: {isCompleted || isLive ? `${m.scoreA} - ${m.scoreB}` : "Not Started"}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => onEditMatch && onEditMatch(m)}
                      className="flex items-center space-x-1.5 px-3 py-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg font-semibold transition-colors text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update Score</span>
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
