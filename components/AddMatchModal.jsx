"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  Users,
  Plus,
  Save,
  Clock,
  Shield,
  Award,
  Layers,
  FileText
} from "lucide-react";

export default function AddMatchModal({ tournament, onClose, onMatchAdded }) {
  const teams = tournament?.teams || [];
  const [teamAId, setTeamAId] = useState(teams[0]?.id || "");
  const [teamBId, setTeamBId] = useState(teams[1]?.id || "");

  // Stage & Round
  const [stageName, setStageName] = useState(
    tournament?.format === "GROUP_KNOCKOUT" ? "Group A" : "Matchday 1"
  );
  const [roundNumber, setRoundNumber] = useState(1);
  const [isPlayoff, setIsPlayoff] = useState(false);

  // Timing & Location
  const [scheduledDate, setScheduledDate] = useState(
    tournament?.startDate || new Date().toISOString().split("T")[0]
  );
  const [scheduledTime, setScheduledTime] = useState("17:00");
  const [venue, setVenue] = useState(tournament?.location || "");

  // Rich Match Info (all optional)
  const [official, setOfficial] = useState("");
  const [duration, setDuration] = useState("");
  const [teamALineup, setTeamALineup] = useState("");
  const [teamBLineup, setTeamBLineup] = useState("");
  const [matchNotes, setMatchNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-sync team lineup from team roster if available
  const handleSelectTeamA = (id) => {
    setTeamAId(id);
    const tm = teams.find((t) => t.id === id);
    if (tm && tm.players && !teamALineup) {
      setTeamALineup(tm.players);
    }
  };

  const handleSelectTeamB = (id) => {
    setTeamBId(id);
    const tm = teams.find((t) => t.id === id);
    if (tm && tm.players && !teamBLineup) {
      setTeamBLineup(tm.players);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (teamAId && teamBId && teamAId === teamBId) {
      setError("Please select two different teams for this match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scheduledAt = `${scheduledDate} ${scheduledTime}`;
      const compositePlayerNotes = [
        teamALineup ? `Team A: ${teamALineup}` : "",
        teamBLineup ? `Team B: ${teamBLineup}` : "",
        matchNotes ? `Note: ${matchNotes}` : ""
      ]
        .filter(Boolean)
        .join(" | ");

      const newMatch = {
        id: `fixture-${Date.now()}`,
        round: Number(roundNumber) || 1,
        roundName: stageName,
        stageName,
        groupId: stageName.includes("Group A")
          ? "grp-a"
          : stageName.includes("Group B")
          ? "grp-b"
          : isPlayoff
          ? "PLAYOFFS"
          : null,
        groupName: isPlayoff ? "Knockout Playoffs" : stageName,
        teamAId: teamAId || null,
        teamBId: teamBId || null,
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        scheduledAt,
        venue,
        official: official.trim(),
        duration: duration.trim(),
        playerNotes: compositePlayerNotes
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
        throw new Error(err.error || "Failed to schedule match");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Plus className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-white text-base">Schedule New Match Fixture</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {tournament.sport}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure teams, kickoff date/time, venue, match officials, and lineups.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Stage & Round */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Stage & Competition Phase</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                  Stage / Round Name
                </label>
                <input
                  type="text"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="e.g. Group A, Quarter-Final 1, Semi-Final, Matchday 2..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Round #</label>
                <input
                  type="number"
                  min="1"
                  value={roundNumber}
                  onChange={(e) => setRoundNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>
            </div>

            {/* Quick Stage Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 py-1">Quick Presets:</span>
              {[
                "Group A",
                "Group B",
                "Quarter-Final",
                "Semi-Final 1",
                "Semi-Final 2",
                "Championship Final"
              ].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setStageName(p);
                    if (p.includes("Final") || p.includes("Semi")) {
                      setIsPlayoff(true);
                    }
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Teams Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Participating Teams</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <label className="text-xs font-bold text-blue-400 block">Team A</label>
                <select
                  value={teamAId}
                  onChange={(e) => handleSelectTeamA(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="">(TBD / Blank)</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.logo} {t.name} (Seed #{t.seed})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Team A lineup or captain..."
                  value={teamALineup}
                  onChange={(e) => setTeamALineup(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <label className="text-xs font-bold text-emerald-400 block">Team B</label>
                <select
                  value={teamBId}
                  onChange={(e) => handleSelectTeamB(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="">(TBD / Blank)</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.logo} {t.name} (Seed #{t.seed})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Team B lineup or captain..."
                  value={teamBLineup}
                  onChange={(e) => setTeamBLineup(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Date, Time & Venue */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Kickoff Schedule & Location</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Match Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                  Kickoff Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Venue / Pitch</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Main Turf Pitch 1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Match Officials & Duration (Optional) */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>Officials & Match Info (Optional)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                  Referee / Official (Optional)
                </label>
                <input
                  type="text"
                  value={official}
                  onChange={(e) => setOfficial(e.target.value)}
                  placeholder="Optional (e.g. Fr. Jude / John D'Souza)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                  Duration (Optional)
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Optional (e.g. 20 mins / 2 halves)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                Additional Match Notes / Rules
              </label>
              <input
                type="text"
                value={matchNotes}
                onChange={(e) => setMatchNotes(e.target.value)}
                placeholder="e.g. Tied games go to penalty shootouts. Yellow card accumulation rules apply."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-3 border-t border-slate-800">
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
              <span>{loading ? "Scheduling Fixture..." : "Add Match to Schedule"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
