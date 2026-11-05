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
  Users,
  Star,
  X
} from "lucide-react";
import { normalizePlayers, getCaptain } from "@/lib/tournamentEngine";

export default function GroupStageView({ tournament, onEditMatch, onAddMatch, isAdmin }) {
  const {
    groups = [],
    groupStandings = {},
    matches = [],
    teams = [],
    scoreUnit = "Goals",
    participantType = "TEAM",
    pointsConfig = { win: 3, draw: 1, loss: 0, showForm: true }
  } = tournament;

  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "ALL");
  const [selectedTeamRoster, setSelectedTeamRoster] = useState(null);

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
  const isIndividual = participantType === "INDIVIDUAL";

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
                    Round-Robin Stage • {group.teams?.length || 0} {isIndividual ? "Players" : "Teams"}
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
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800 font-bold font-mono">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Pos</th>
                    <th className="py-3 px-4">{isIndividual ? "Participant" : "Team & Captain"}</th>
                    <th className="py-3 px-3 text-center" title="Played">
                      P
                    </th>
                    <th className="py-3 px-3 text-center text-emerald-400" title="Won">
                      W
                    </th>
                    <th className="py-3 px-3 text-center text-amber-400" title="Drawn">
                      D
                    </th>
                    <th className="py-3 px-3 text-center text-rose-400" title="Lost">
                      L
                    </th>
                    <th className="py-3 px-4 text-center font-black text-blue-400 text-sm">PTS</th>
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
                    const teamObj = row.team || {};
                    const playersList = normalizePlayers(teamObj.players);
                    const captain = getCaptain(teamObj);

                    return (
                      <tr
                        key={teamObj.id || index}
                        className={`hover:bg-slate-800/30 transition-colors ${
                          isQualified ? "bg-emerald-500/5" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-mono font-bold ${
                              index === 0
                                ? "bg-amber-400 text-slate-950 shadow-sm"
                                : index === 1
                                ? "bg-slate-300 text-slate-950"
                                : "text-slate-400 bg-slate-800"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-lg">
                              {teamObj.logo || (isIndividual ? "👤" : "🛡️")}
                            </span>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-white">{teamObj.name || "Participant"}</span>
                                {teamObj.shortName && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    [{teamObj.shortName}]
                                  </span>
                                )}
                              </div>
                              {!isIndividual && (
                                <div className="flex items-center space-x-2 mt-0.5">
                                  {captain ? (
                                    <span className="text-[10px] text-amber-400 font-medium flex items-center space-x-1">
                                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                                      <span>Capt: {captain}</span>
                                    </span>
                                  ) : null}

                                  {playersList.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedTeamRoster({
                                          name: teamObj.name,
                                          logo: teamObj.logo,
                                          captain,
                                          players: playersList
                                        })
                                      }
                                      className="text-[10px] text-blue-400 hover:text-blue-300 font-mono hover:underline flex items-center space-x-0.5"
                                    >
                                      <Users className="w-2.5 h-2.5" />
                                      <span>({playersList.length} squad)</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">{row.played}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">
                          {row.won}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-amber-300 font-bold">
                          {row.drawn}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-rose-400 font-bold">{row.lost}</td>
                        <td className="py-3 px-4 text-center font-mono text-base font-black text-blue-400">
                          {row.points}
                        </td>

                        {showForm && (
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {row.form && row.form.length > 0 ? (
                                row.form.map((res, i) => (
                                  <span
                                    key={i}
                                    className={`w-5 h-5 rounded text-[10px] font-bold font-mono text-white flex items-center justify-center ${
                                      res === "W"
                                        ? "bg-emerald-500 shadow-sm"
                                        : res === "D"
                                        ? "bg-amber-500 shadow-sm"
                                        : "bg-rose-500 shadow-sm"
                                    }`}
                                  >
                                    {res}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-600 font-mono text-[10px]">—</span>
                              )}
                            </div>
                          </td>
                        )}

                        <td className="py-3 px-4 text-right">
                          {isQualified ? (
                            <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                              Qualified
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

            {/* Guide legend */}
            <div className="px-3 py-2 bg-slate-950/40 rounded-xl border border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center space-x-3">
                <span><strong>P</strong> = Played</span>
                <span>•</span>
                <span><strong className="text-emerald-400">W</strong> = Won</span>
                <span>•</span>
                <span><strong className="text-amber-400">D</strong> = Drawn</span>
                <span>•</span>
                <span><strong className="text-rose-400">L</strong> = Lost</span>
                <span>•</span>
                <span><strong className="text-blue-400">PTS</strong> = Points</span>
              </div>
            </div>

            {/* Group Fixtures List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-300 text-xs tracking-wider uppercase flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{group.name} Match Fixtures</span>
                </h4>
                {isAdmin && onAddMatch && (
                  <button
                    type="button"
                    onClick={onAddMatch}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1 hover:underline"
                  >
                    <span>+ Add Match</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groupMatches.map((m) => {
                  const teamA = teamMap[m.teamAId];
                  const teamB = teamMap[m.teamBId];
                  const captA = getCaptain(teamA);
                  const captB = getCaptain(teamB);
                  const isCompleted = m.status === "COMPLETED";
                  const isLive = m.status === "LIVE";

                  const winnerIsA = isCompleted && m.winnerId === m.teamAId;
                  const winnerIsB = isCompleted && m.winnerId === m.teamBId;

                  return (
                    <div
                      key={m.id}
                      onClick={() => isAdmin && onEditMatch && onEditMatch(m)}
                      className={`p-4 rounded-2xl border transition-all ${
                        isAdmin ? "cursor-pointer hover:border-blue-400 hover:shadow-lg" : ""
                      } ${
                        isLive
                          ? "border-red-500/50 bg-red-950/15 shadow-md"
                          : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5 border-b border-slate-800/60 pb-2">
                        <span className="font-bold text-slate-200">{m.roundName}</span>
                        <div className="flex items-center space-x-2">
                          {isLive && (
                            <span className="flex items-center space-x-1.5 text-red-400 font-bold animate-pulse text-xs">
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
                            <span className="text-slate-400 flex items-center space-x-1 text-xs">
                              <Clock className="w-3.5 h-3.5 text-blue-400" />
                              <span>{m.scheduledAt || "Scheduled"}</span>
                            </span>
                          )}
                          {isAdmin && (
                            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                          )}
                        </div>
                      </div>

                      {/* Teams & Scores */}
                      <div className="space-y-2">
                        <div className={`flex items-center justify-between p-2 rounded-xl text-xs sm:text-sm ${
                          winnerIsA ? "bg-emerald-500/10 font-bold" : "bg-slate-900/60"
                        }`}>
                          <span className="flex items-center space-x-2 font-medium text-white truncate min-w-0 pr-2">
                            <span className="text-base">{teamA?.logo || (isIndividual ? "👤" : "🛡️")}</span>
                            <span className={`truncate font-bold ${winnerIsA ? "text-emerald-300" : "text-white"}`}>{teamA?.name || "TBD"}</span>
                            {captA && !isIndividual && (
                              <span className="text-[10px] text-amber-400 font-medium">
                                (C: {captA})
                              </span>
                            )}
                          </span>
                          <span className={`font-mono font-black px-2.5 py-0.5 rounded-lg text-sm ${
                            winnerIsA ? "bg-emerald-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-200"
                          }`}>
                            {isCompleted || isLive ? m.scoreA : "—"}
                          </span>
                        </div>

                        <div className={`flex items-center justify-between p-2 rounded-xl text-xs sm:text-sm ${
                          winnerIsB ? "bg-emerald-500/10 font-bold" : "bg-slate-900/60"
                        }`}>
                          <span className="flex items-center space-x-2 font-medium text-white truncate min-w-0 pr-2">
                            <span className="text-base">{teamB?.logo || (isIndividual ? "👤" : "🛡️")}</span>
                            <span className={`truncate font-bold ${winnerIsB ? "text-emerald-300" : "text-white"}`}>{teamB?.name || "TBD"}</span>
                            {captB && !isIndividual && (
                              <span className="text-[10px] text-amber-400 font-medium">
                                (C: {captB})
                              </span>
                            )}
                          </span>
                          <span className={`font-mono font-black px-2.5 py-0.5 rounded-lg text-sm ${
                            winnerIsB ? "bg-emerald-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-200"
                          }`}>
                            {isCompleted || isLive ? m.scoreB : "—"}
                          </span>
                        </div>
                      </div>

                      {/* Venue, Official & Lineup notes (only if present) */}
                      {(m.venue || m.official || m.duration) && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-1.5">
                          <div className="flex items-center space-x-2 truncate">
                            {m.venue && (
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-blue-400" />
                                <span>{m.venue}</span>
                              </span>
                            )}
                            {m.official && (
                              <span className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                <Award className="w-3 h-3 text-amber-400" />
                                <span>Ref: {m.official}</span>
                              </span>
                            )}
                          </div>

                          {isAdmin && (
                            <button
                              onClick={() => onEditMatch && onEditMatch(m)}
                              className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-bold ml-auto"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Update Score</span>
                            </button>
                          )}
                        </div>
                      )}

                      {!m.venue && !m.official && !m.duration && isAdmin && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex justify-end">
                          <button
                            onClick={() => onEditMatch && onEditMatch(m)}
                            className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-bold"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Update Score</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* Squad Roster Modal Popup */}
      {selectedTeamRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">{selectedTeamRoster.logo}</span>
                <div>
                  <h4 className="font-black text-white text-base">{selectedTeamRoster.name}</h4>
                  <p className="text-xs text-slate-400">
                    Official Squad Roster ({selectedTeamRoster.players.length} Players)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeamRoster(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedTeamRoster.players.map((p, pIdx) => (
                <div
                  key={p.id || pIdx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-500 text-[10px]">#{pIdx + 1}</span>
                    <span className="text-white font-medium">{p.name}</span>
                  </div>

                  {p.role === "CAPTAIN" ? (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>Captain</span>
                    </span>
                  ) : p.role === "VICE_CAPTAIN" ? (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/30">
                      Vice-Captain
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Player</span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedTeamRoster(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
            >
              Close Roster
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
