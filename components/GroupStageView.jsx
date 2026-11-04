"use client";

import { useState } from "react";
import {
  Trophy,
  CheckCircle,
  Flame,
  Calendar,
  MapPin,
  Edit3,
  Shield,
  ArrowRight,
  Clock,
  Award,
  Users
} from "lucide-react";

export default function GroupStageView({ tournament, onEditMatch, isAdmin }) {
  const {
    groups = [],
    groupStandings = {},
    matches = [],
    teams = [],
    scoreUnit = "Goals",
    pointsConfig = { win: 3, draw: 1, loss: 0, showForm: true }
  } = tournament;

  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "ALL");

  const teamMap = {};
  teams.forEach((t) => {
    teamMap[t.id] = t;
  });

  if (!groups || groups.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        No group stage configured for this tournament.
      </div>
    );
  }

  const displayedGroups =
    selectedGroupId === "ALL" ? groups : groups.filter((g) => g.id === selectedGroupId);

  const winPts = pointsConfig?.win ?? 3;
  const drawPts = pointsConfig?.draw ?? 1;
  const lossPts = pointsConfig?.loss ?? 0;
  const showForm = pointsConfig?.showForm !== false;

  return (
    <div className="space-y-8">
      {/* Group Selector Pill Tabs & Points Badge */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-2xl">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedGroupId("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedGroupId === "ALL"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            All Groups
          </button>
          {groups.map((grp) => (
            <button
              key={grp.id}
              onClick={() => setSelectedGroupId(grp.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedGroupId === grp.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {grp.name}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-300 px-3 py-1 bg-slate-950/80 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold">W: {winPts}</span> •{" "}
            <span className="text-amber-400 font-bold">D: {drawPts}</span> •{" "}
            <span className="text-rose-400 font-bold">L: {lossPts}</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 hidden sm:inline-block">
            Top 2 advance to Playoffs
          </span>
        </div>
      </div>

      {/* Render Each Group Table & Group Fixtures */}
      {displayedGroups.map((group) => {
        const groupData = groupStandings[group.id] || {};
        const standings = groupData.standings || [];
        const groupMatches = matches.filter(
          (m) => m.groupId === group.id || (m.stageName && m.stageName.includes(group.name))
        );

        return (
          <div
            key={group.id}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-6 p-6"
          >
            {/* Group Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-2">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-sm text-blue-400 font-mono">
                  {group.name.replace("Group ", "")}
                </span>
                <div>
                  <h3 className="font-extrabold text-white text-lg tracking-tight">
                    {group.name} Standings
                  </h3>
                  <p className="text-xs text-slate-400">
                    Round-Robin Stage • {group.teams?.length || 0} Teams
                  </p>
                </div>
              </div>

              <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Top 2 Qualify for Playoffs</span>
              </span>
            </div>

            {/* Standings Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800 font-semibold font-mono">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Pos</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-3 text-center" title="Played">
                      P
                    </th>
                    <th className="py-3 px-3 text-center" title="Won">
                      W
                    </th>
                    <th className="py-3 px-3 text-center" title="Drawn">
                      D
                    </th>
                    <th className="py-3 px-3 text-center" title="Lost">
                      L
                    </th>
                    <th className="py-3 px-3 text-center" title="Goals For">
                      GF
                    </th>
                    <th className="py-3 px-3 text-center" title="Goals Against">
                      GA
                    </th>
                    <th className="py-3 px-3 text-center" title="Goal Difference">
                      GD
                    </th>
                    <th className="py-3 px-4 text-center font-bold text-blue-400">PTS</th>
                    {showForm && (
                      <th className="py-3 px-4 text-center" title="Last 5 Matches Form">
                        Form
                      </th>
                    )}
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {standings.map((row, index) => {
                    const isQualified = index < 2;
                    return (
                      <tr
                        key={row.team?.id || index}
                        className={`hover:bg-slate-800/30 transition-colors ${
                          isQualified ? "bg-emerald-500/5" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold ${
                              index === 0
                                ? "bg-amber-400 text-slate-950 shadow-sm"
                                : index === 1
                                ? "bg-slate-300 text-slate-950"
                                : "text-slate-500 bg-slate-800"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-lg">{row.team?.logo || "🛡️"}</span>
                            <div>
                              <span>{row.team?.name || "Team"}</span>
                              {row.team?.shortName && (
                                <span className="text-[10px] text-slate-500 ml-1.5 font-mono">
                                  [{row.team.shortName}]
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">{row.played}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400 font-semibold">
                          {row.won}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">
                          {row.drawn}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-red-400">{row.lost}</td>
                        <td className="py-3 px-3 text-center font-mono">{row.goalsFor}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-500">
                          {row.goalsAgainst}
                        </td>
                        <td
                          className={`py-3 px-3 text-center font-mono font-semibold ${
                            row.goalDifference > 0
                              ? "text-emerald-400"
                              : row.goalDifference < 0
                              ? "text-red-400"
                              : "text-slate-400"
                          }`}
                        >
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-sm font-black text-blue-400">
                          {row.points}
                        </td>

                        {showForm && (
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {row.form && row.form.length > 0 ? (
                                row.form.map((res, i) => (
                                  <span
                                    key={i}
                                    className={`w-4 h-4 rounded text-[9px] font-bold font-mono text-white flex items-center justify-center ${
                                      res === "W"
                                        ? "bg-emerald-500"
                                        : res === "D"
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                    }`}
                                  >
                                    {res}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-600 font-mono text-[10px]">-</span>
                              )}
                            </div>
                          </td>
                        )}

                        <td className="py-3 px-4 text-right">
                          {isQualified ? (
                            <span className="text-[10px] font-semibold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                              Playoff Zone
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Group Fixtures List */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-300 text-xs tracking-wider uppercase flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{group.name} Match Fixtures</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groupMatches.map((m) => {
                  const teamA = teamMap[m.teamAId];
                  const teamB = teamMap[m.teamBId];
                  const isCompleted = m.status === "COMPLETED";
                  const isLive = m.status === "LIVE";

                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isLive
                          ? "border-red-500/50 bg-red-950/10 shadow-md"
                          : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 border-b border-slate-800/60 pb-1.5">
                        <span className="font-mono text-slate-300 font-semibold">{m.roundName}</span>
                        <div>
                          {isLive && (
                            <span className="flex items-center space-x-1 text-red-400 font-bold animate-pulse">
                              <Flame className="w-3 h-3" />
                              <span>LIVE NOW</span>
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-slate-500 font-semibold uppercase">
                              Final Result
                            </span>
                          )}
                          {m.status === "SCHEDULED" && (
                            <span className="text-slate-500 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{m.scheduledAt || "Scheduled"}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Teams & Scores */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center space-x-2 font-medium text-white truncate">
                            <span>{teamA?.logo || "🛡️"}</span>
                            <span className="truncate">{teamA?.name || "TBD"}</span>
                          </span>
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                            {isCompleted || isLive ? m.scoreA : "-"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center space-x-2 font-medium text-white truncate">
                            <span>{teamB?.logo || "🛡️"}</span>
                            <span className="truncate">{teamB?.name || "TBD"}</span>
                          </span>
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                            {isCompleted || isLive ? m.scoreB : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Venue, Official & Lineup notes */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-1">
                        <div className="flex items-center space-x-2 truncate">
                          {m.venue && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-2.5 h-2.5 text-blue-400" />
                              <span>{m.venue}</span>
                            </span>
                          )}
                          {m.official && (
                            <span className="flex items-center space-x-1">
                              <Award className="w-2.5 h-2.5 text-amber-400" />
                              <span>{m.official}</span>
                            </span>
                          )}
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => onEditMatch && onEditMatch(m)}
                            className="flex items-center space-x-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium ml-auto"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Update Score</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
