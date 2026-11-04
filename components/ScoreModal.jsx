"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Plus, Minus, Flame, CheckCircle, Save } from "lucide-react";

export default function ScoreModal({ match, tournament, onClose, onSave }) {
  const [scoreA, setScoreA] = useState(match?.scoreA || 0);
  const [scoreB, setScoreB] = useState(match?.scoreB || 0);
  const [status, setStatus] = useState(match?.status || "LIVE");
  const [winnerId, setWinnerId] = useState(match?.winnerId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const teams = tournament?.teams || [];
  const teamA = teams.find((t) => t.id === match?.teamAId);
  const teamB = teams.find((t) => t.id === match?.teamBId);

  // Auto-set winner when status is set to COMPLETED
  useEffect(() => {
    if (status === "COMPLETED") {
      if (scoreA > scoreB && teamA) {
        setWinnerId(teamA.id);
      } else if (scoreB > scoreA && teamB) {
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
          scoreA: Number(scoreA),
          scoreB: Number(scoreB),
          status,
          winnerId: status === "COMPLETED" ? winnerId : null
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update score");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
              Scorekeeper & Advancement
            </span>
            <h3 className="font-extrabold text-white text-base">
              {match.stageName || match.roundName || "Match"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Selector */}
          <div>
            <label className="text-xs text-zinc-400 block mb-2 font-medium">Match Status</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "SCHEDULED", label: "Scheduled", icon: null },
                { id: "LIVE", label: "Live Now", icon: Flame },
                { id: "COMPLETED", label: "Final / Completed", icon: CheckCircle }
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
                        ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20"
                        : "bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20"
                      : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Teams & Scorekeeper Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {/* Team A */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 text-center space-y-3">
              <span className="text-3xl block">{teamA?.logo || "🛡️"}</span>
              <span className="font-bold text-white text-xs block truncate">
                {teamA ? teamA.name : "TBD"}
              </span>

              {/* Large Score Counter */}
              <div className="flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setScoreA(Math.max(0, Number(scoreA) - 1))}
                  className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="0"
                  value={scoreA}
                  onChange={(e) => setScoreA(e.target.value)}
                  className="w-14 text-center bg-zinc-900 border border-zinc-700 rounded-xl py-1 text-2xl font-mono font-extrabold text-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setScoreA(Number(scoreA) + 1)}
                  className="w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center justify-center font-bold transition-colors shadow-sm shadow-amber-400/20"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Team B */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 text-center space-y-3">
              <span className="text-3xl block">{teamB?.logo || "🛡️"}</span>
              <span className="font-bold text-white text-xs block truncate">
                {teamB ? teamB.name : "TBD"}
              </span>

              {/* Large Score Counter */}
              <div className="flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setScoreB(Math.max(0, Number(scoreB) - 1))}
                  className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="0"
                  value={scoreB}
                  onChange={(e) => setScoreB(e.target.value)}
                  className="w-14 text-center bg-zinc-900 border border-zinc-700 rounded-xl py-1 text-2xl font-mono font-extrabold text-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setScoreB(Number(scoreB) + 1)}
                  className="w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center justify-center font-bold transition-colors shadow-sm shadow-amber-400/20"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Winner Picker (if completed) */}
          {status === "COMPLETED" && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 space-y-2">
              <label className="text-xs text-amber-400 font-bold flex items-center space-x-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Winner to Advance</span>
              </label>
              <select
                value={winnerId}
                onChange={(e) => setWinnerId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Select Winner...</option>
                {teamA && <option value={teamA.id}>{teamA.name}</option>}
                {teamB && <option value={teamB.id}>{teamB.name}</option>}
              </select>
              {match.nextMatchId && (
                <p className="text-[11px] text-zinc-500 italic">
                  Selecting a winner will automatically route them to the next round bracket match!
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save Match"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
