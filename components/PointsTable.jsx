"use client";

import { useState } from "react";
import {
  Trophy,
  TrendingUp,
  Users,
  X,
  User,
  Star,
  Calendar,
  Flame,
  Edit3,
  Clock,
  MapPin,
  Plus
} from "lucide-react";
import { normalizePlayers, getCaptain } from "@/lib/tournamentEngine";

export default function PointsTable({
  tournament,
  standings,
  matches = [],
  teams = [],
  scoreUnit = "Goals",
  participantType = "TEAM",
  pointsConfig = { win: 3, draw: 1, loss: 0, showForm: true },
  isAdmin = false,
  onEditMatch,
  onAddMatch
}) {
  const [selectedTeamRoster, setSelectedTeamRoster] = useState(null);

  const teamList = teams.length > 0 ? teams : tournament?.teams || [];
  const matchList = matches.length > 0 ? matches : tournament?.matches || [];

  const teamMap = {};
  teamList.forEach((t) => {
    teamMap[t.id] = t;
  });

  const winPts = pointsConfig?.win ?? 3;
  const drawPts = pointsConfig?.draw ?? 1;
  const lossPts = pointsConfig?.loss ?? 0;
  const showForm = pointsConfig?.showForm !== false;
  const customRules = pointsConfig?.customRules || [];
  const isIndividual = participantType === "INDIVIDUAL";

  return (
    <div className="space-y-6">
      {/* Standings Table Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4">
        {/* Table Header & Scoring Rule Pill */}
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Tournament Standings</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Round-robin points table • Top ranked advance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-300 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-full font-mono flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">Win: {winPts}pts</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-bold">Draw: {drawPts}pt</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400 font-bold">Loss: {lossPts}pts</span>
            </span>

            {customRules.map((cr) => (
              <span
                key={cr.id}
                className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full font-mono"
              >
                {cr.title}: {cr.value}
              </span>
            ))}
          </div>
        </div>

        {(!standings || standings.length === 0) ? (
          <div className="p-8 text-center">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 font-medium text-sm">No standings data recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto px-2">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800 font-bold font-mono">
                <tr>
                  <th className="py-3.5 px-4 w-14 text-center">Pos</th>
                  <th className="py-3.5 px-4">{isIndividual ? "Participant" : "Team & Captain"}</th>
                  <th className="py-3.5 px-3 text-center" title="Matches Played">
                    P
                  </th>
                  <th className="py-3.5 px-3 text-center text-emerald-400" title="Won">
                    W
                  </th>
                  <th className="py-3.5 px-3 text-center text-amber-400" title="Drawn">
                    D
                  </th>
                  <th className="py-3.5 px-3 text-center text-rose-400" title="Lost">
                    L
                  </th>
                  <th className="py-3.5 px-4 text-center text-blue-400 font-black" title="Total Points">
                    PTS
                  </th>
                  {showForm && (
                    <th className="py-3.5 px-4 text-center" title="Last 5 Matches Form">
                      Recent Form
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {standings.map((row, index) => {
                  const teamObj = row.team;
                  const captain = getCaptain(teamObj);
                  const playersList = normalizePlayers(teamObj?.players);

                  return (
                    <tr
                      key={teamObj.id || index}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-bold ${
                            index === 0
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : index === 1
                              ? "bg-slate-700/50 text-slate-200 border border-slate-600/50"
                              : index === 2
                              ? "bg-amber-900/30 text-amber-400 border border-amber-800/30"
                              : "text-slate-500"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl flex-shrink-0">{teamObj.logo || "🛡️"}</span>
                          <div className="min-w-0">
                            <span className="font-bold text-white text-sm block truncate">
                              {teamObj.name}
                            </span>
                            {!isIndividual && (
                              <div className="flex items-center space-x-2 mt-0.5">
                                {captain && (
                                  <span className="text-[10px] text-amber-400 font-medium flex items-center space-x-1">
                                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                                    <span>Capt: {captain}</span>
                                  </span>
                                )}
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

                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-200">
                        {row.played}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-emerald-400 font-bold">
                        {row.won}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-amber-300 font-bold">
                        {row.drawn}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-rose-400 font-bold">
                        {row.lost}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-base font-black text-blue-400">
                        {row.points}
                      </td>

                      {showForm && (
                        <td className="py-3.5 px-4 text-center">
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span><strong className="text-white">P</strong> = Played</span>
            <span>•</span>
            <span><strong className="text-emerald-400">W</strong> = Won</span>
            <span>•</span>
            <span><strong className="text-amber-400">D</strong> = Drawn</span>
            <span>•</span>
            <span><strong className="text-rose-400">L</strong> = Lost</span>
            <span>•</span>
            <span><strong className="text-blue-400">PTS</strong> = Points</span>
          </div>
          <span className="text-slate-500 text-[11px]">Ranked by Points & Form</span>
        </div>
      </div>

      {/* Match Fixtures & Results Section (Matches shown right here on Standings Page) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-5 h-5 text-blue-400" />
            <div>
              <h4 className="font-extrabold text-white text-base">Match Fixtures & Results</h4>
              <p className="text-xs text-slate-400">Scores, schedules, and upcoming fixtures</p>
            </div>
          </div>
          {isAdmin && onAddMatch && (
            <button
              onClick={onAddMatch}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Match</span>
            </button>
          )}
        </div>

        {matchList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No matches scheduled for this round-robin tournament yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {matchList.map((m) => {
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
                      ? "border-red-500/50 bg-red-950/20 shadow-md"
                      : "border-slate-800 bg-slate-950/80 hover:border-slate-700 shadow"
                  }`}
                >
                  {/* Top Status & Stage */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3 border-b border-slate-800/60 pb-2">
                    <span className="font-bold text-slate-200">
                      {m.roundName || m.stageName || "Round Robin"}
                    </span>
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
                        <span className="text-slate-400 text-xs">Scheduled</span>
                      )}
                      {isAdmin && (
                        <Edit3 className="w-3.5 h-3.5 text-blue-400 ml-1" />
                      )}
                    </div>
                  </div>

                  {/* Team A */}
                  <div
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                      winnerIsA ? "bg-blue-500/15 font-bold" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <span className="text-xl flex-shrink-0">{teamA?.logo || "🛡️"}</span>
                      <div className="min-w-0">
                        <span
                          className={`block truncate text-sm font-bold ${
                            winnerIsA ? "text-blue-300" : "text-white"
                          }`}
                        >
                          {teamA?.name || m.placeholderA || "TBD"}
                        </span>
                        {captA && (
                          <span className="text-[10px] text-amber-400 font-medium">
                            Capt: {captA}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-base font-black font-mono px-3 py-1 rounded-xl ${
                        isCompleted || isLive
                          ? winnerIsA
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-800 text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {isCompleted || isLive ? m.scoreA : "—"}
                    </span>
                  </div>

                  {/* Team B */}
                  <div
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-colors mt-1 ${
                      winnerIsB ? "bg-blue-500/15 font-bold" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <span className="text-xl flex-shrink-0">{teamB?.logo || "🛡️"}</span>
                      <div className="min-w-0">
                        <span
                          className={`block truncate text-sm font-bold ${
                            winnerIsB ? "text-blue-300" : "text-white"
                          }`}
                        >
                          {teamB?.name || m.placeholderB || "TBD"}
                        </span>
                        {captB && (
                          <span className="text-[10px] text-amber-400 font-medium">
                            Capt: {captB}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-base font-black font-mono px-3 py-1 rounded-xl ${
                        isCompleted || isLive
                          ? winnerIsB
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-800 text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {isCompleted || isLive ? m.scoreB : "—"}
                    </span>
                  </div>

                  {/* Bottom info: venue, time, court */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800/50 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{m.startTime ? `${m.startTime} - ${m.endTime}` : m.scheduledAt}</span>
                      </span>
                      <span>•</span>
                      {m.venue && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{m.venue}</span>
                        </span>
                      )}
                    </div>
                    {m.court && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                        {m.court}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Squad Roster Popup Modal */}
      {selectedTeamRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">{selectedTeamRoster.logo}</span>
                <div>
                  <h4 className="font-bold text-white text-base">{selectedTeamRoster.name}</h4>
                  <p className="text-xs text-slate-400">
                    Official Roster ({selectedTeamRoster.players.length} Players)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeamRoster(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {selectedTeamRoster.players.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-500 w-5">{idx + 1}.</span>
                    <span className="text-slate-200 font-semibold">{p.name}</span>
                  </div>
                  {p.role === "CAPTAIN" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Captain (C)
                    </span>
                  )}
                  {p.role === "VICE_CAPTAIN" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Vice Captain (VC)
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedTeamRoster(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close Squad List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
