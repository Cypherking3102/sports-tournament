"use client";

import { useState } from "react";
import { X, Calendar, MapPin, Users, Plus, Save } from "lucide-react";

export default function AddMatchModal({ tournament, onClose, onMatchAdded }) {
  const teams = tournament?.teams || [];
  const [teamAId, setTeamAId] = useState(teams[0]?.id || "");
  const [teamBId, setTeamBId] = useState(teams[1]?.id || "");
  const [stageName, setStageName] = useState(
    tournament?.format === "GROUP_KNOCKOUT" ? "Group A" : "Matchday 1"
  );
  const [scheduledAt, setScheduledAt] = useState(`${tournament?.startDate || "2026-11-20"} 17:00`);
  const [venue, setVenue] = useState(tournament?.location || "Parish Grounds");
  const [playerNotes, setPlayerNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (teamAId && teamBId && teamAId === teamBId) {
      setError("Please select two different teams.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newMatch = {
        id: `custom-match-${Date.now()}`,
        round: 1,
        roundName: stageName,
        stageName,
        groupId: stageName.includes("Group A")
          ? "grp-a"
          : stageName.includes("Group B")
          ? "grp-b"
          : null,
        teamAId: teamAId || null,
        teamBId: teamBId || null,
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        scheduledAt,
        venue,
        playerNotes
      };

      const existingMatches = tournament.matches || [];
      const updatedMatches = [...existingMatches, newMatch];

      const res = await fetch(`/api/tournaments/${tournament.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches: updatedMatches })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add match");
      }

      const updatedTournament = await res.json();
      onMatchAdded(updatedTournament);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-blue-400" />
            <h3 className="font-extrabold text-white text-base">Add Match Manually</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">
              Stage / Round Title
            </label>
            <input
              type="text"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="e.g. Group A, Quarter-Final, Matchday 1..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          {/* Teams Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">Team A</label>
              <select
                value={teamAId}
                onChange={(e) => setTeamAId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-400"
              >
                <option value="">(TBD)</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.logo} {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">Team B</label>
              <select
                value={teamBId}
                onChange={(e) => setTeamBId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-400"
              >
                <option value="">(TBD)</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.logo} {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time & Venue */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                Match Date & Time
              </label>
              <input
                type="text"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                placeholder="YYYY-MM-DD HH:MM"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Pitch / Court"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Players / Lineup Notes */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">
              Players / Lineup Notes (Optional)
            </label>
            <input
              type="text"
              value={playerNotes}
              onChange={(e) => setPlayerNotes(e.target.value)}
              placeholder="e.g. Starting 7: Alex, Sam, Luke... | Referee: Fr. Peter"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Actions */}
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
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Adding..." : "Add Match Fixture"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
