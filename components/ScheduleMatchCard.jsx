"use client";

import { Clock, Flame, Edit3, MapPin } from "lucide-react";

export default function ScheduleMatchCard({
  match: m,
  selectedPlayer,
  isAdmin,
  onEditMatch
}) {
  const isCompleted = m.status === "COMPLETED";
  const isLive = m.status === "LIVE";
  const target = (selectedPlayer || "").trim().toLowerCase();
  const isTargetP1 = target && (m.player1 || "").toLowerCase().includes(target);
  const isTargetP2 = target && (m.player2 || "").toLowerCase().includes(target);

  const winnerIsA = isCompleted && m.winnerId === m.teamAId;
  const winnerIsB = isCompleted && m.winnerId === m.teamBId;

  return (
    <div
      onClick={() => {
        if (isAdmin && onEditMatch) onEditMatch(m);
      }}
      className={`p-4 rounded-2xl border transition-all ${
        isAdmin ? "cursor-pointer hover:border-blue-400 hover:shadow-lg" : ""
      } ${
        isLive
          ? "border-red-500/50 bg-red-950/20 shadow-md"
          : isCompleted
          ? "border-slate-800/90 bg-slate-900/80"
          : "border-slate-800 bg-slate-950/90 hover:border-slate-700 shadow"
      }`}
    >
      {/* Top Badge: Time, Sport, Status */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5 border-b border-slate-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-300 font-mono font-bold text-xs flex items-center space-x-1">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>{m.startTime ? `${m.startTime} - ${m.endTime}` : m.timeStr}</span>
          </span>
          <span className="font-extrabold text-white text-xs px-2 py-0.5 rounded bg-slate-800">
            {m.sport}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isLive && (
            <span className="flex items-center space-x-1 text-red-400 font-bold animate-pulse text-[11px]">
              <Flame className="w-3 h-3" />
              <span>LIVE</span>
            </span>
          )}
          {isCompleted && (
            <span className="text-emerald-400 font-bold text-[11px] uppercase">
              Final
            </span>
          )}
          {m.status === "SCHEDULED" && (
            <span className="text-slate-400 text-[11px] font-mono">Upcoming</span>
          )}
          {isAdmin && <Edit3 className="w-3.5 h-3.5 text-blue-400" />}
        </div>
      </div>

      {/* Matchup Line */}
      <div className="space-y-2">
        {/* Player 1 */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
            isTargetP1
              ? "bg-blue-600/20 border border-blue-500/40"
              : winnerIsA
              ? "bg-emerald-500/10 font-bold text-emerald-300"
              : "bg-slate-900/60"
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <span
              className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center flex-shrink-0 ${
                isTargetP1
                  ? "bg-blue-600 text-white font-extrabold"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {m.initialA}
            </span>
            <span
              className={`text-xs truncate ${
                isTargetP1 ? "text-white font-black" : "text-slate-200"
              }`}
            >
              {m.player1}
            </span>
          </div>

          {(isCompleted || isLive) && (
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded ${
                winnerIsA
                  ? "text-emerald-400 font-extrabold bg-emerald-500/20"
                  : "text-slate-400"
              }`}
            >
              {m.scoreA}
            </span>
          )}
        </div>

        {/* Player 2 */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
            isTargetP2
              ? "bg-blue-600/20 border border-blue-500/40"
              : winnerIsB
              ? "bg-emerald-500/10 font-bold text-emerald-300"
              : "bg-slate-900/60"
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <span
              className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center flex-shrink-0 ${
                isTargetP2
                  ? "bg-blue-600 text-white font-extrabold"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {m.initialB}
            </span>
            <span
              className={`text-xs truncate ${
                isTargetP2 ? "text-white font-black" : "text-slate-200"
              }`}
            >
              {m.player2}
            </span>
          </div>

          {(isCompleted || isLive) && (
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded ${
                winnerIsB
                  ? "text-emerald-400 font-extrabold bg-emerald-500/20"
                  : "text-slate-400"
              }`}
            >
              {m.scoreB}
            </span>
          )}
        </div>
      </div>

      {/* Footer Info: Venue & Board */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center space-x-1 truncate pr-2">
          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
          <span className="truncate">{m.venue || "Parish Venue"}</span>
        </span>
        {m.court && (
          <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded-md flex-shrink-0">
            {m.court}
          </span>
        )}
      </div>
    </div>
  );
}
