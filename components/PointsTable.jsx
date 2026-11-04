"use client";

import { Trophy, TrendingUp, ShieldAlert } from "lucide-react";

export default function PointsTable({ standings, scoreUnit = "Goals" }) {
  if (!standings || standings.length === 0) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center">
        <Trophy className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
        <p className="text-zinc-400 font-medium text-sm">No standings data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Tournament Standings</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Top positions qualify for playoffs or championship round
          </p>
        </div>
        <span className="text-[11px] text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 px-3 py-1 rounded-full font-mono">
          Win: 3pts • Draw: 1pt • Loss: 0pts
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-950/60 border-b border-zinc-800 font-semibold font-mono">
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
              <th className="py-3 px-4 text-center font-bold text-amber-400">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-xs font-medium">
            {standings.map((row, index) => {
              const isQualified = index < 2; // top 2 playoff spots
              return (
                <tr
                  key={row.team?.id || index}
                  className={`hover:bg-zinc-800/40 transition-colors ${
                    isQualified ? "bg-emerald-500/5" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold ${
                        index === 0
                          ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20"
                          : index === 1
                          ? "bg-zinc-300 text-zinc-950"
                          : "text-zinc-500 bg-zinc-800"
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
                          <span className="text-[10px] text-zinc-500 ml-1.5 font-mono">
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
                  <td className="py-3.5 px-3 text-center font-mono text-zinc-400">{row.drawn}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-red-400">{row.lost}</td>
                  <td className="py-3.5 px-3 text-center font-mono">{row.goalsFor}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-zinc-500">{row.goalsAgainst}</td>
                  <td
                    className={`py-3.5 px-3 text-center font-mono font-semibold ${
                      row.goalDifference > 0
                        ? "text-emerald-400"
                        : row.goalDifference < 0
                        ? "text-red-400"
                        : "text-zinc-400"
                    }`}
                  >
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-base font-extrabold text-amber-400">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-zinc-950/60 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
        <span className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/80"></span>
          <span>Qualification / Championship Zone (Top 2)</span>
        </span>
        <span className="font-mono">P: Played • W: Won • D: Drawn • L: Lost</span>
      </div>
    </div>
  );
}
