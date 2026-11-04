"use client";

import { Trophy, TrendingUp, Sparkles } from "lucide-react";

export default function PointsTable({
  standings,
  scoreUnit = "Goals",
  pointsConfig = { win: 3, draw: 1, loss: 0, showForm: true, showGoalDiff: true }
}) {
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
              <th className="py-3.5 px-4">Team</th>
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
              return (
                <tr
                  key={row.team?.id || index}
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

                  {/* Team Info */}
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">{row.team?.logo || "🛡️"}</span>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span>{row.team?.name || "Team"}</span>
                          {row.team?.shortName && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              [{row.team.shortName}]
                            </span>
                          )}
                        </div>
                        {row.team?.players && (
                          <span className="text-[10px] text-slate-500 font-normal block truncate max-w-[200px]">
                            {row.team.players}
                          </span>
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
        <span className="font-mono">P: Played • W: Won • D: Drawn • L: Lost • DIFF: Goal Diff</span>
      </div>
    </div>
  );
}
