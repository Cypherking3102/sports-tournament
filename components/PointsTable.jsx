"use client";

import { Trophy, TrendingUp } from "lucide-react";

export default function PointsTable({ standings, scoreUnit = "Goals" }) {
  if (!standings || standings.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
        <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-400 font-medium text-sm">No standings data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Official League Standings</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Round-robin points table • Top 2 qualify for championship finals
          </p>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full font-mono">
          Win: 3pts • Draw: 1pt • Loss: 0pts
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800 font-semibold font-mono">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Pos</th>
              <th className="py-3 px-4">Team</th>
              <th className="py-3 px-3 text-center" title="Played">P</th>
              <th className="py-3 px-3 text-center" title="Won">W</th>
              <th className="py-3 px-3 text-center" title="Drawn">D</th>
              <th className="py-3 px-3 text-center" title="Lost">L</th>
              <th className="py-3 px-3 text-center" title={`Scored (${scoreUnit})`}>SF</th>
              <th className="py-3 px-3 text-center" title={`Conceded (${scoreUnit})`}>SA</th>
              <th className="py-3 px-3 text-center" title="Difference">DIFF</th>
              <th className="py-3 px-4 text-center font-bold text-blue-400">PTS</th>
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
                  <td className="py-3.5 px-4 text-center">
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
                  <td className="py-3.5 px-4 font-semibold text-white">
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
                  <td className="py-3.5 px-3 text-center font-mono">{row.played}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-emerald-400 font-semibold">
                    {row.won}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-400">{row.drawn}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-red-400">{row.lost}</td>
                  <td className="py-3.5 px-3 text-center font-mono">{row.goalsFor}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-500">{row.goalsAgainst}</td>
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
                  <td className="py-3.5 px-4 text-center font-mono text-base font-extrabold text-blue-400">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/80"></span>
          <span>Qualification Zone (Top 2 Teams)</span>
        </span>
        <span className="font-mono">P: Played • W: Won • D: Drawn • L: Lost</span>
      </div>
    </div>
  );
}
