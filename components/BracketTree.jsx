"use client";

import { useMemo } from "react";
import { Trophy, ChevronRight, Edit3, Flame } from "lucide-react";

export default function BracketTree({ tournament, onEditMatch, isAdmin }) {
  const { matches = [], teams = [], scoreUnit = "Score" } = tournament;

  // Map teams for fast lookup
  const teamMap = useMemo(() => {
    const map = {};
    teams.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [teams]);

  // Group matches by round
  const rounds = useMemo(() => {
    const map = {};
    matches.forEach((m) => {
      if (!map[m.round]) map[m.round] = [];
      map[m.round].push(m);
    });
    return Object.keys(map)
      .sort((a, b) => Number(a) - Number(b))
      .map((r) => ({
        roundNumber: Number(r),
        roundName: map[r][0]?.roundName || `Round ${r}`,
        matches: map[r]
      }));
  }, [matches]);

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center">
        <Trophy className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
        <p className="text-zinc-400 font-medium text-sm">No bracket generated yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Mobile Hint */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-4 px-1 md:hidden">
        <span className="flex items-center space-x-1">
          <span>👈 Swipe horizontally to view full bracket 👉</span>
        </span>
        {isAdmin && <span className="text-amber-400 font-medium">Tap match to edit</span>}
      </div>

      {/* Scrollable Bracket Board */}
      <div className="overflow-x-auto pb-8 pt-2 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="flex items-stretch space-x-8 min-w-max px-2">
          {rounds.map((round, rIndex) => (
            <div key={round.roundNumber} className="flex flex-col w-72">
              {/* Round Header */}
              <div className="mb-4 pb-2 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <h3 className="font-bold text-white text-sm tracking-wide uppercase">
                    {round.roundName}
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {round.matches.length} {round.matches.length === 1 ? "Match" : "Matches"}
                </span>
              </div>

              {/* Match Cards List */}
              <div className="flex-1 flex flex-col justify-around space-y-6">
                {round.matches.map((match) => {
                  const teamA = teamMap[match.teamAId];
                  const teamB = teamMap[match.teamBId];
                  const isCompleted = match.status === "COMPLETED";
                  const isLive = match.status === "LIVE";
                  const winnerIsA = isCompleted && match.winnerId === match.teamAId;
                  const winnerIsB = isCompleted && match.winnerId === match.teamBId;

                  return (
                    <div
                      key={match.id}
                      onClick={() => isAdmin && onEditMatch && onEditMatch(match)}
                      className={`group relative rounded-xl border transition-all ${
                        isAdmin ? "cursor-pointer hover:border-amber-400/80 hover:shadow-lg hover:shadow-amber-500/10" : ""
                      } ${
                        isLive
                          ? "border-red-500/50 bg-gradient-to-b from-red-950/20 to-zinc-900/90 shadow-md shadow-red-500/10"
                          : "border-zinc-800 bg-zinc-900/90 hover:border-zinc-700"
                      }`}
                    >
                      {/* Top Bar: Round & Status */}
                      <div className="px-3 py-1.5 border-b border-zinc-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400 font-mono">{match.scheduledAt || "TBD"}</span>
                        <div className="flex items-center space-x-1.5">
                          {isLive && (
                            <span className="flex items-center space-x-1 text-red-400 font-bold animate-pulse">
                              <Flame className="w-3 h-3" />
                              <span>LIVE</span>
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-zinc-500 font-semibold uppercase text-[10px]">
                              Final
                            </span>
                          )}
                          {match.status === "SCHEDULED" && (
                            <span className="text-zinc-500 text-[10px] uppercase">Upcoming</span>
                          )}
                          {isAdmin && (
                            <Edit3 className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>

                      {/* Team A Row */}
                      <div
                        className={`flex items-center justify-between px-3 py-2.5 border-b border-zinc-800/50 transition-colors ${
                          winnerIsA ? "bg-amber-500/10 font-bold" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <span className="text-base flex-shrink-0">{teamA?.logo || "❔"}</span>
                          <span
                            className={`truncate text-xs ${
                              teamA
                                ? winnerIsA
                                  ? "text-amber-300 font-bold"
                                  : "text-zinc-200"
                                : "text-zinc-600 italic"
                            }`}
                          >
                            {teamA ? teamA.name : "TBD"}
                          </span>
                          {teamA?.seed && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              #{teamA.seed}
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-mono text-sm px-2 py-0.5 rounded ${
                            winnerIsA
                              ? "text-amber-400 font-extrabold bg-amber-500/20"
                              : isCompleted || isLive
                              ? "text-white bg-zinc-800"
                              : "text-zinc-600"
                          }`}
                        >
                          {isCompleted || isLive ? match.scoreA : "-"}
                        </span>
                      </div>

                      {/* Team B Row */}
                      <div
                        className={`flex items-center justify-between px-3 py-2.5 rounded-b-xl transition-colors ${
                          winnerIsB ? "bg-amber-500/10 font-bold" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <span className="text-base flex-shrink-0">{teamB?.logo || "❔"}</span>
                          <span
                            className={`truncate text-xs ${
                              teamB
                                ? winnerIsB
                                  ? "text-amber-300 font-bold"
                                  : "text-zinc-200"
                                : "text-zinc-600 italic"
                            }`}
                          >
                            {teamB ? teamB.name : "TBD"}
                          </span>
                          {teamB?.seed && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              #{teamB.seed}
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-mono text-sm px-2 py-0.5 rounded ${
                            winnerIsB
                              ? "text-amber-400 font-extrabold bg-amber-500/20"
                              : isCompleted || isLive
                              ? "text-white bg-zinc-800"
                              : "text-zinc-600"
                          }`}
                        >
                          {isCompleted || isLive ? match.scoreB : "-"}
                        </span>
                      </div>

                      {/* Winner Crown Indicator */}
                      {isCompleted && match.winnerId && (
                        <div className="px-3 py-1 bg-zinc-950/60 rounded-b-xl border-t border-zinc-800/40 flex items-center justify-between text-[10px] text-amber-400">
                          <span className="text-zinc-500">Winner:</span>
                          <span className="font-semibold flex items-center space-x-1">
                            <Trophy className="w-3 h-3 text-amber-400" />
                            <span>{teamMap[match.winnerId]?.name || "Advancing"}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
