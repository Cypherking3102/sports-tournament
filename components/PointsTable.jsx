"use client";

import { useState } from "react";
import { Trophy, TrendingUp, Users, X, User, Star } from "lucide-react";
import { normalizePlayers, getCaptain } from "@/lib/tournamentEngine";

export default function PointsTable({
  standings,
  scoreUnit = "Goals",
  participantType = "TEAM",
  pointsConfig = { win: 3, draw: 1, loss: 0, showForm: true }
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
  const customRules = pointsConfig?.customRules || [];
  const isIndividual = participantType === "INDIVIDUAL";

  return (
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
              <th className="py-3.5 px-4 text-center font-black text-blue-400 text-sm">PTS</th>
              {showForm && (
                <th className="py-3.5 px-4 text-center" title="Last 5 Matches Form">
                  Form
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm font-medium">
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
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-mono font-bold ${
                        index === 0
                          ? "bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20"
                          : index === 1
                          ? "bg-slate-300 text-slate-950"
                          : index === 2
                          ? "bg-amber-700/80 text-white"
                          : "text-slate-400 bg-slate-800"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>

                  {/* Team / Player Info */}
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">
                        {teamObj.logo || (isIndividual ? "👤" : "🛡️")}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-bold text-sm sm:text-base">
                            {teamObj.name || "Participant"}
                          </span>
                          {teamObj.shortName && (
                            <span className="text-[11px] text-slate-500 font-mono">
                              [{teamObj.shortName}]
                            </span>
                          )}
                        </div>

                        {/* Captain & Roster Preview Button (for Teams) */}
                        {!isIndividual && (
                          <div className="flex items-center space-x-2.5 mt-0.5">
                            {captain && (
                              <span className="text-xs text-amber-400 font-medium flex items-center space-x-1">
                                <Star className="w-3 h-3 fill-amber-400" />
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
                                className="text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline flex items-center space-x-1"
                              >
                                <Users className="w-3 h-3" />
                                <span>({playersList.length} squad)</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Played */}
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-200">
                    {row.played}
                  </td>

                  {/* Won */}
                  <td className="py-3.5 px-3 text-center font-mono text-emerald-400 font-bold">
                    {row.won}
                  </td>

                  {/* Drawn */}
                  <td className="py-3.5 px-3 text-center font-mono text-amber-300 font-bold">
                    {row.drawn}
                  </td>

                  {/* Lost */}
                  <td className="py-3.5 px-3 text-center font-mono text-rose-400 font-bold">
                    {row.lost}
                  </td>

                  {/* Points (Prominent) */}
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
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono text-white ${
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
                          <span className="text-slate-600 font-mono text-xs">—</span>
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

      {/* Helper Legend beneath table for easy church parishioner understanding */}
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
