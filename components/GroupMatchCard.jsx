"use client";

import { Flame, Clock, Edit3, MapPin, Award } from "lucide-react";
import { getCaptain } from "@/lib/tournamentEngine";

export default function GroupMatchCard({ match: m, teamMap, isAdmin, onEditMatch }) {
  const teamA = teamMap[m.teamAId];
  const teamB = teamMap[m.teamBId];
  const captA = getCaptain(teamA);
  const captB = getCaptain(teamB);
  const captNameA = typeof captA === "object" ? captA?.name : captA;
  const captNameB = typeof captB === "object" ? captB?.name : captB;
  const isCompleted = m.status === "COMPLETED";
  const isLive = m.status === "LIVE";

  const winnerIsA = isCompleted && m.winnerId === m.teamAId;
  const winnerIsB = isCompleted && m.winnerId === m.teamBId;

  const initialA = (teamA?.name || m.placeholderA || "T")[0]?.toUpperCase();
  const initialB = (teamB?.name || m.placeholderB || "T")[0]?.toUpperCase();

  return (
    <div
      key={m.id}
      onClick={() => isAdmin && onEditMatch && onEditMatch(m)}
      className={`p-4 rounded-2xl border transition-all ${
        isAdmin ? "cursor-pointer hover:border-blue-400 hover:shadow-lg" : ""
      } ${
        isLive
          ? "border-red-500/50 bg-red-950/20 shadow-md"
          : isCompleted
          ? "border-slate-800/80 bg-slate-900/80"
          : "border-slate-800 bg-slate-950/90 hover:border-slate-700 shadow"
      }`}
    >
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5 border-b border-slate-800/80 pb-2">
        <span className="font-mono font-bold text-slate-300">
          {m.roundName || m.stageName || "Fixture"}
        </span>

        <div className="flex items-center space-x-2">
          {isLive && (
            <span className="flex items-center space-x-1 text-red-400 font-bold animate-pulse text-[11px]">
              <Flame className="w-3.5 h-3.5" />
              <span>LIVE</span>
            </span>
          )}
          {isCompleted && (
            <span className="text-emerald-400 font-bold text-[11px] uppercase">
              Final Result
            </span>
          )}
          {m.status === "SCHEDULED" && (
            <span className="flex items-center space-x-1 text-slate-400 text-xs font-mono">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>{m.startTime ? `${m.startTime} - ${m.endTime}` : m.scheduledAt || "Scheduled"}</span>
            </span>
          )}
          {isAdmin && <Edit3 className="w-3.5 h-3.5 text-blue-400" />}
        </div>
      </div>

      <div className="space-y-2">
        {/* Team A */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
            winnerIsA
              ? "bg-emerald-500/10 font-bold text-emerald-300"
              : "bg-slate-900/60"
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
              {initialA}
            </span>
            <div className="truncate">
              <span className="text-xs truncate block text-slate-200">
                {teamA ? teamA.name : m.placeholderA || "TBD"}
              </span>
              {captNameA && (
                <span className="text-[10px] text-slate-500 block">
                  Capt: {captNameA}
                </span>
              )}
            </div>
          </div>
          {(isCompleted || isLive) && (
            <span
              className={`font-mono text-xs px-2.5 py-0.5 rounded ${
                winnerIsA
                  ? "text-emerald-400 font-extrabold bg-emerald-500/20"
                  : "text-slate-400"
              }`}
            >
              {m.scoreA}
            </span>
          )}
        </div>

        {/* Team B */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
            winnerIsB
              ? "bg-emerald-500/10 font-bold text-emerald-300"
              : "bg-slate-900/60"
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
              {initialB}
            </span>
            <div className="truncate">
              <span className="text-xs truncate block text-slate-200">
                {teamB ? teamB.name : m.placeholderB || "TBD"}
              </span>
              {captNameB && (
                <span className="text-[10px] text-slate-500 block">
                  Capt: {captNameB}
                </span>
              )}
            </div>
          </div>
          {(isCompleted || isLive) && (
            <span
              className={`font-mono text-xs px-2.5 py-0.5 rounded ${
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

      {(m.venue || m.court) && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-1.5 font-mono">
          <div className="flex items-center space-x-2 truncate">
            {m.venue && (
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{m.venue}</span>
              </span>
            )}
            {m.court && (
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                {m.court}
              </span>
            )}
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => onEditMatch && onEditMatch(m)}
              className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-bold ml-auto font-sans"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Score</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
