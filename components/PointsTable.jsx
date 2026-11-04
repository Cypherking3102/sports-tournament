"use client";

import { useState } from "react";
import { Trophy, TrendingUp, Sparkles, Star, Users, X, User } from "lucide-react";
import { normalizePlayers, getCaptain } from "@/lib/tournamentEngine";

export default function PointsTable({
  standings,
  scoreUnit = "Goals",
  participantType = "TEAM",
  pointsConfig = { win: 3, draw: 1, loss: 0, showForm: true, showGoalDiff: true }
}) {
  const [selectedTeamRoster, setSelectedTeamRoster] = useState(null);

  if (!standings || standings.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
        <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-400 font-medium text-sm">No standings data available yet.</p>
      </div>
    );
  }

  const winPts = pointsConfig?.win ?? 3;
  const drawPts = pointsConfig?.draw ?? 1;
  const lossPts = pointsConfig?.loss ?? 0;
  const showForm = pointsConfig?.showForm !== false;
  const showGoalDiff = pointsConfig?.showGoalDiff !== false;
  const customRules = pointsConfig?.customRules || [];
  const isIndividual = participantType === "INDIVIDUAL";

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      {/* Table Header & Scoring Rule Pill */}
      <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Official League Standings</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Round-robin points table • Top 2 qualify for championship playoffs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-300 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full font-mono flex items-center space-x-1.5">
            <span className="text-emerald-400 font-bold">W: {winPts}pts</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold">D: {drawPts}pt</span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400 font-bold">L: {lossPts}pts</span>
          </span>

          {customRules.map((cr) => (
            <span
              key={cr.id}
              className="text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-mono"
            >
              {cr.title}: {cr.value}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800 font-semibold font-mono">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">Pos</th>
              <th className="py-3.5 px-4">{isIndividual ? "Player" : "Team & Captain"}</th>
              <th className="py-3.5 px-3 text-center" title="Played">
                P
              </th>
              <th className="py-3.5 px-3 text-center" title="Won">
                W
              </th>
              <th className="py-3.5 px-3 text-center" title="Drawn">
                D
              </th>
              <th className="py-3.5 px-3 text-center" title="Lost">
                L
              </th>
              <th className="py-3.5 px-3 text-center" title={`Scored (${scoreUnit})`}>
                SF
              </th>
              <th className="py-3.5 px-3 text-center" title={`Conceded (${scoreUnit})`}>
                SA
              </th>
              {showGoalDiff && (
                <th className="py-3.5 px-3 text-center" title="Difference">
                  DIFF
                </th>
              )}
              <th className="py-3.5 px-4 text-center font-bold text-blue-400">PTS</th>
              {showForm && (
                <th className="py-3.5 px-4 text-center" title="Last 5 Matches Form">
                  Form (Last 5)
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
            {standings.map((row, index) => {
              const isQualified = index < 2;
              const teamObj = row.team || {};
              const playersList = normalizePlayers(teamObj.players);
              const captain = getCaptain(teamObj);

              return (
                <tr
                  key={teamObj.id || index}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isQualified ? "bg-emerald-500/5" : ""
                  }`}
                >
                  {/* Position Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold ${
                        index === 0
                          ? "bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20"
                          : index === 1
                          ? "bg-slate-300 text-slate-950"
                          : index === 2
                          ? "bg-amber-700/80 text-white"
                          : "text-slate-500 bg-slate-800"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>

                  {/* Team / Player Info */}
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">
                        {teamObj.logo || (isIndividual ? "👤" : "🛡️")}
                      </span>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-white font-bold">{teamObj.name || "Team"}</span>
                          {teamObj.shortName && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              [{teamObj.shortName}]
                            </span>
                          )}
                        </div>

                        {/* Captain & Roster Preview Button (for Teams) */}
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

                  <td className="py-3.5 px-3 text-center font-mono">{row.played}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-emerald-400 font-semibold">
                    {row.won}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-400">{row.drawn}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-red-400">{row.lost}</td>
                  <td className="py-3.5 px-3 text-center font-mono">{row.goalsFor}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-500">
                    {row.goalsAgainst}
                  </td>

                  {showGoalDiff && (
                    <td
                      className={`py-3.5 px-3 text-center font-mono font-semibold ${
                        row.goalDifference > 0
                          ? "text-emerald-400"
                          : row.goalDifference < 0
                          ? "text-red-400"
                          : "text-slate-400"
                      }`}
                    >
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                  )}

                  {/* Points */}
                  <td className="py-3.5 px-4 text-center font-mono text-base font-black text-blue-400">
                    {row.points}
                  </td>

                  {/* Form Guide: Last 5 Match Outcomes */}
                  {showForm && (
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {row.form && row.form.length > 0 ? (
                          row.form.map((res, i) => (
                            <span
                              key={i}
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono text-white ${
                                res === "W"
                                  ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                                  : res === "D"
                                  ? "bg-amber-500 shadow-sm shadow-amber-500/30"
                                  : "bg-rose-500 shadow-sm shadow-rose-500/30"
                              }`}
                              title={res === "W" ? "Won" : res === "D" ? "Drawn" : "Lost"}
                            >
                              {res}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">-</span>
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

      {/* Table Footer */}
      <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
          <span>Qualification Zone (Top 2 advance to finals)</span>
        </span>
        <span className="font-mono">P: Played • W: Won • D: Drawn • L: Lost • DIFF: Difference</span>
      </div>

      {/* Full Squad Roster Modal Popup */}
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
