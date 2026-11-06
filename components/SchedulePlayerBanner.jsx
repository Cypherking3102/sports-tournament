"use client";

export default function SchedulePlayerBanner({ playerStats }) {
  if (!playerStats) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900 border border-blue-500/40 rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3.5">
        <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-base font-black text-blue-400 font-mono shadow-inner">
          {playerStats.name[0]?.toUpperCase()}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-white text-base sm:text-lg">{playerStats.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
              {playerStats.sportsInvolved.join(" & ")}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            First game at <strong className="text-white">{playerStats.firstMatch}</strong> • Last game concludes ~<strong className="text-white">{playerStats.lastMatch}</strong>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 text-xs font-mono">
        <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
          <span className="text-slate-400 block text-[10px]">TOTAL</span>
          <span className="font-extrabold text-white text-sm">{playerStats.totalMatches}</span>
        </div>
        <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
          <span className="text-emerald-400 block text-[10px]">PLAYED</span>
          <span className="font-extrabold text-emerald-400 text-sm">{playerStats.completed}</span>
        </div>
        <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
          <span className="text-blue-400 block text-[10px]">UPCOMING</span>
          <span className="font-extrabold text-blue-400 text-sm">{playerStats.upcoming}</span>
        </div>
      </div>
    </div>
  );
}
