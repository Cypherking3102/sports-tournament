"use client";

import { useMemo } from "react";
import { Trophy, ChevronRight, Edit3, Flame, Award } from "lucide-react";

export default function BracketTree({ tournament, onEditMatch, isAdmin }) {
  const { matches = [], teams = [], scoreUnit = "Score", format } = tournament;

  // Filter playoff matches if it's a group+knockout tournament, or all matches if pure knockout
  const playoffMatches = useMemo(() => {
    if (format === "GROUP_KNOCKOUT") {
      return matches.filter((m) => m.groupId === "PLAYOFFS" || m.stageName?.includes("Playoff") || m.stageName?.includes("Final"));
    }
    return matches;
  }, [matches, format]);

  // Map teams for lookup
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
    playoffMatches.forEach((m) => {
      if (!map[m.round]) map[m.round] = [];
      map[m.round].push(m);
    });
    return Object.keys(map)
      .sort((a, b) => Number(a) - Number(b))
      .map((r) => ({
        roundNumber: Number(r),
        roundName: map[r][0]?.roundName || (Number(r) === 2 ? "Final" : `Round ${r}`),
        matches: map[r]
      }));
  }, [playoffMatches]);

  if (!playoffMatches || playoffMatches.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
        <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-400 font-medium text-sm">No knockout bracket generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Playoff Banner Header */}
      {format === "GROUP_KNOCKOUT" && (
        <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Championship Playoff Tree</h3>
              <p className="text-xs text-slate-400">
                Top 2 qualifiers from Group A and Group B meet in single-elimination knockouts
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800">
            Semi-Finals & Final
          </span>
        </div>
      )}

      {/* Mobile Swipe Hint */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 md:hidden">
        <span>👈 Swipe horizontally to view full bracket 👉</span>
        {isAdmin && <span className="text-blue-400 font-medium">Tap match to edit</span>}
      </div>

      {/* Bracket Board */}
      <div className="overflow-x-auto pb-8 pt-2 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="flex items-stretch space-x-8 min-w-max px-2">
          {rounds.map((round) => (
            <div key={round.roundNumber} className="flex flex-col w-72 sm:w-80">
              {/* Round Header */}
              <div className="mb-4 pb-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <h4 className="font-bold text-white text-xs tracking-wider uppercase">
                    {round.roundName}
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {round.matches.length} {round.matches.length === 1 ? "Championship Match" : "Matches"}
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
                      className={`group relative rounded-2xl border transition-all ${
                        isAdmin ? "cursor-pointer hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10" : ""
                      } ${
                        isLive
                          ? "border-red-500/50 bg-gradient-to-b from-red-950/20 to-slate-900 shadow-md shadow-red-500/10"
                          : "border-slate-800/80 bg-slate-900/90 hover:border-slate-700 shadow-md"
                      }`}
                    >
                      {/* Top Bar: Round & Status */}
                      <div className="px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">{match.scheduledAt || "TBD"}</span>
                        <div className="flex items-center space-x-1.5">
                          {isLive && (
                            <span className="flex items-center space-x-1 text-red-400 font-bold animate-pulse text-[10px]">
                              <Flame className="w-3 h-3" />
                              <span>LIVE</span>
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-slate-500 font-semibold uppercase text-[10px]">
                              Final
                            </span>
                          )}
                          {match.status === "SCHEDULED" && (
                            <span className="text-slate-500 text-[10px] uppercase">Upcoming</span>
                          )}
                          {isAdmin && (
                            <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>

                      {/* Team A Row */}
                      <div
                        className={`flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/60 transition-colors ${
                          winnerIsA ? "bg-blue-500/10 font-bold" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <span className="text-base flex-shrink-0">
                            {teamA?.logo || "🛡️"}
                          </span>
                          <span
                            className={`truncate text-xs ${
                              teamA
                                ? winnerIsA
                                  ? "text-blue-300 font-bold"
                                  : "text-slate-200"
                                : "text-slate-500 italic"
                            }`}
                          >
                            {teamA ? teamA.name : match.placeholderA || "TBD"}
                          </span>
                        </div>
                        <span
                          className={`font-mono text-xs px-2.5 py-0.5 rounded ${
                            winnerIsA
                              ? "text-blue-400 font-extrabold bg-blue-500/20"
                              : isCompleted || isLive
                              ? "text-white bg-slate-800"
                              : "text-slate-600"
                          }`}
                        >
                          {isCompleted || isLive ? match.scoreA : "-"}
                        </span>
                      </div>

                      {/* Team B Row */}
                      <div
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-b-2xl transition-colors ${
                          winnerIsB ? "bg-blue-500/10 font-bold" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <span className="text-base flex-shrink-0">
                            {teamB?.logo || "🛡️"}
                          </span>
                          <span
                            className={`truncate text-xs ${
                              teamB
                                ? winnerIsB
                                  ? "text-blue-300 font-bold"
                                  : "text-slate-200"
                                : "text-slate-500 italic"
                            }`}
                          >
                            {teamB ? teamB.name : match.placeholderB || "TBD"}
                          </span>
                        </div>
                        <span
                          className={`font-mono text-xs px-2.5 py-0.5 rounded ${
                            winnerIsB
                              ? "text-blue-400 font-extrabold bg-blue-500/20"
                              : isCompleted || isLive
                              ? "text-white bg-slate-800"
                              : "text-slate-600"
                          }`}
                        >
                          {isCompleted || isLive ? match.scoreB : "-"}
                        </span>
                      </div>

                      {/* Winner Footer */}
                      {isCompleted && match.winnerId && (
                        <div className="px-3.5 py-1.5 bg-slate-950/70 rounded-b-2xl border-t border-slate-800/40 flex items-center justify-between text-[10px] text-blue-400">
                          <span className="text-slate-500">Advances:</span>
                          <span className="font-semibold flex items-center space-x-1 text-slate-200">
                            <Trophy className="w-3 h-3 text-amber-400" />
                            <span>{teamMap[match.winnerId]?.name || "Winner"}</span>
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
