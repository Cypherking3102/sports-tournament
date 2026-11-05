"use client";

import { useState, useEffect } from "react";
import {
  X,
  Trophy,
  Plus,
  Minus,
  Flame,
  CheckCircle,
  Save,
  Settings2,
  Calendar,
  MapPin,
  Users,
  Award,
  Clock
} from "lucide-react";

export default function ScoreModal({ match, tournament, onClose, onSave }) {
  const [activeMode, setActiveMode] = useState("score"); // "score" or "draw"
  const [scoreA, setScoreA] = useState(match?.scoreA || 0);
  const [scoreB, setScoreB] = useState(match?.scoreB || 0);
  const [status, setStatus] = useState(match?.status || "LIVE");
  const [winnerId, setWinnerId] = useState(match?.winnerId || "");

  // Draw / Schedule editing fields
  const [teamAId, setTeamAId] = useState(match?.teamAId || "");
  const [teamBId, setTeamBId] = useState(match?.teamBId || "");
  const [scheduledAt, setScheduledAt] = useState(match?.scheduledAt || "");
  const [venue, setVenue] = useState(match?.venue || "");
  const [official, setOfficial] = useState(match?.official || "");
  const [duration, setDuration] = useState(match?.duration || "");
  const [playerNotes, setPlayerNotes] = useState(match?.playerNotes || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const teams = tournament?.teams || [];
  const teamA = teams.find((t) => t.id === teamAId);
  const teamB = teams.find((t) => t.id === teamBId);

  useEffect(() => {
    if (status === "COMPLETED") {
      if (Number(scoreA) > Number(scoreB) && teamA) {
        setWinnerId(teamA.id);
      } else if (Number(scoreB) > Number(scoreA) && teamB) {
        setWinnerId(teamB.id);
      }
    }
  }, [scoreA, scoreB, status, teamA, teamB]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/matches/${match.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournament.id,
          teamAId: teamAId || null,
          teamBId: teamBId || null,
          scheduledAt: scheduledAt || match.scheduledAt,
          venue: venue || match.venue,
          official: official.trim(),
          duration: duration.trim(),
          playerNotes: playerNotes || match.playerNotes,
          scoreA: Number(scoreA),
          scoreB: Number(scoreB),
          status,
          winnerId: status === "COMPLETED" ? winnerId : null
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update match");
      }

      const updatedTournament = await res.json();
      onSave(updatedTournament);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-blue-400 font-bold tracking-wider">
              Parish Admin Controls
            </span>
            <h3 className="font-extrabold text-white text-base">
              {match.stageName || match.roundName || "Match Fixture"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Live Score vs Edit Draw / Schedule */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveMode("score")}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeMode === "score"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Update Score & Result
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("draw")}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              activeMode === "draw"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Edit Teams & Rules</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {activeMode === "score" ? (
            <>
              {/* Status Selector */}
              <div>
                <label className="text-xs text-slate-400 block mb-2 font-medium">Match Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "SCHEDULED", label: "Scheduled", icon: null },
                    { id: "LIVE", label: "Live Now", icon: Flame },
                    { id: "COMPLETED", label: "Completed", icon: CheckCircle }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setStatus(id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                        status === id
                          ? id === "LIVE"
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            : id === "COMPLETED"
                            ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                            : "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Large Scorekeeper Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* Team A */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
                  <span className="text-2xl block">{teamA?.logo || "🛡️"}</span>
                  <span className="font-bold text-white text-xs block truncate">
                    {teamA ? teamA.name : match.placeholderA || "TBD"}
                  </span>

                  <div className="flex items-center justify-center space-x-2.5">
                    <button
                      type="button"
                      onClick={() => setScoreA(Math.max(0, Number(scoreA) - 1))}
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={scoreA}
                      onChange={(e) => setScoreA(e.target.value)}
                      className="w-12 text-center bg-slate-900 border border-slate-700 rounded-xl py-1 text-xl font-mono font-extrabold text-blue-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setScoreA(Number(scoreA) + 1)}
                      className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center font-bold transition-colors shadow-sm shadow-blue-500/20"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Team B */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
                  <span className="text-2xl block">{teamB?.logo || "🛡️"}</span>
                  <span className="font-bold text-white text-xs block truncate">
                    {teamB ? teamB.name : match.placeholderB || "TBD"}
                  </span>

                  <div className="flex items-center justify-center space-x-2.5">
                    <button
                      type="button"
                      onClick={() => setScoreB(Math.max(0, Number(scoreB) - 1))}
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={scoreB}
                      onChange={(e) => setScoreB(e.target.value)}
                      className="w-12 text-center bg-slate-900 border border-slate-700 rounded-xl py-1 text-xl font-mono font-extrabold text-blue-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setScoreB(Number(scoreB) + 1)}
                      className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center font-bold transition-colors shadow-sm shadow-blue-500/20"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Winner Selector */}
              {status === "COMPLETED" && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1.5">
                  <label className="text-xs text-blue-400 font-bold flex items-center space-x-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Winner to Advance</span>
                  </label>
                  <select
                    value={winnerId}
                    onChange={(e) => setWinnerId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Select Winner...</option>
                    {teamA && <option value={teamA.id}>{teamA.name}</option>}
                    {teamB && <option value={teamB.id}>{teamB.name}</option>}
                  </select>
                </div>
              )}
            </>
          ) : (
            /* Mode "draw": Edit Teams, Officials & Reschedule */
            <div className="space-y-3.5 bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-300 font-semibold flex items-center space-x-2 border-b border-slate-800 pb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Move Teams / Change Bracket Draw</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Team A Assignment</label>
                <select
                  value={teamAId}
                  onChange={(e) => setTeamAId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="">(TBD / Blank)</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.logo} {t.name} (#{t.seed})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Team B Assignment</label>
                <select
                  value={teamBId}
                  onChange={(e) => setTeamBId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="">(TBD / Blank)</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.logo} {t.name} (#{t.seed})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Scheduled Date & Time</label>
                  <input
                    type="text"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    placeholder="YYYY-MM-DD HH:MM"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Venue / Pitch</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Court 1 / Main Turf"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Referee (Optional)</label>
                  <input
                    type="text"
                    value={official}
                    onChange={(e) => setOfficial(e.target.value)}
                    placeholder="Optional referee"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Duration (Optional)</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Optional duration"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Lineups / Notes</label>
                <input
                  type="text"
                  value={playerNotes}
                  onChange={(e) => setPlayerNotes(e.target.value)}
                  placeholder="Player roster or notes..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save Match Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
