"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  BookOpen,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const SPORTS_PRESETS = [
  { name: "Football", icon: "⚽", scoreUnit: "Goals", format: "KNOCKOUT" },
  { name: "Basketball", icon: "🏀", scoreUnit: "Points", format: "ROUND_ROBIN" },
  { name: "Cricket", icon: "🏏", scoreUnit: "Runs", format: "KNOCKOUT" },
  { name: "Volleyball", icon: "🏐", scoreUnit: "Sets", format: "KNOCKOUT" },
  { name: "Tennis", icon: "🎾", scoreUnit: "Sets", format: "KNOCKOUT" },
  { name: "Esports", icon: "🎮", scoreUnit: "Points", format: "KNOCKOUT" },
  { name: "Badminton", icon: "🏸", scoreUnit: "Points", format: "KNOCKOUT" }
];

export default function TournamentWizard() {
  const router = useRouter();
  const [sport, setSport] = useState(SPORTS_PRESETS[0].name);
  const [sportIcon, setSportIcon] = useState(SPORTS_PRESETS[0].icon);
  const [scoreUnit, setScoreUnit] = useState(SPORTS_PRESETS[0].scoreUnit);
  const [format, setFormat] = useState(SPORTS_PRESETS[0].format);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Sports Complex Arena");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Teams list
  const [teams, setTeams] = useState([
    { name: "Alpha Titans", shortName: "ALT", seed: 1, logo: "🦁" },
    { name: "Vortex Hawks", shortName: "VTX", seed: 2, logo: "🦅" },
    { name: "Cyber Knights", shortName: "CYB", seed: 3, logo: "🛡️" },
    { name: "Solar Flares", shortName: "SOL", seed: 4, logo: "☀️" }
  ]);

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState("⚡");

  // Rules list
  const [rules, setRules] = useState([
    {
      title: "Match Duration",
      category: "Gameplay",
      content: "Official match time according to governing sport regulations."
    },
    {
      title: "Tie-Breakers",
      category: "Knockout",
      content: "Sudden death or shootout procedure applies to decide advancing team."
    }
  ]);

  const handleSportChange = (sportName) => {
    const preset = SPORTS_PRESETS.find((s) => s.name === sportName);
    if (preset) {
      setSport(preset.name);
      setSportIcon(preset.icon);
      setScoreUnit(preset.scoreUnit);
      setFormat(preset.format);
    }
  };

  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const nextSeed = teams.length + 1;
    setTeams([
      ...teams,
      {
        name: newTeamName.trim(),
        shortName: newTeamName.trim().substring(0, 3).toUpperCase(),
        seed: nextSeed,
        logo: newTeamLogo
      }
    ]);
    setNewTeamName("");
  };

  const handleRemoveTeam = (index) => {
    if (teams.length <= 2) {
      alert("A minimum of 2 teams is required for a tournament.");
      return;
    }
    const updated = teams.filter((_, i) => i !== index);
    // re-seed
    setTeams(updated.map((t, idx) => ({ ...t, seed: idx + 1 })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a tournament title.");
      return;
    }
    if (teams.length < 2) {
      setError("Please add at least 2 teams.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          sport,
          sportIcon,
          scoreUnit,
          format,
          startDate,
          endDate,
          location,
          description:
            description || `Official ${sport} tournament featuring ${teams.length} teams.`,
          teams,
          rules,
          autoGenerateFixtures: true
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create tournament");
      }

      const created = await res.json();
      router.push(`/tournaments/${created.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Tournament Creator Wizard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Launch a New Tournament
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
          Configure sport rules, select tournament format (Knockout / Round Robin), register teams,
          and automatically generate interactive brackets.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-2xl font-medium">
          {error}
        </div>
      )}

      {/* Step 1: Sport Selection */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-amber-400 text-zinc-950 text-xs flex items-center justify-center font-bold">
            1
          </span>
          <span>Select Sport</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {SPORTS_PRESETS.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => handleSportChange(s.name)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                sport === s.name
                  ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/10"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
              }`}
            >
              <span className="text-2xl block mb-1">{s.icon}</span>
              <span
                className={`text-xs font-bold block ${
                  sport === s.name ? "text-amber-300" : "text-zinc-300"
                }`}
              >
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Format & Basic Details */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-amber-400 text-zinc-950 text-xs flex items-center justify-center font-bold">
            2
          </span>
          <span>Tournament Format & Details</span>
        </h3>

        {/* Format radio tabs */}
        <div>
          <label className="text-xs text-zinc-400 block mb-2 font-medium">Tournament Format</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat("KNOCKOUT")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                format === "KNOCKOUT"
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-white">Knockout / Single Elimination</span>
                {format === "KNOCKOUT" && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-xs text-zinc-400">
                Visual tree bracket with automatic winner progression to the next round.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFormat("ROUND_ROBIN")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                format === "ROUND_ROBIN"
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-white">Round Robin / League Table</span>
                {format === "ROUND_ROBIN" && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-xs text-zinc-400">
                Every team plays against each other; automatically calculates live points & goal diff.
              </p>
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs text-zinc-400 block mb-1 font-medium">Tournament Title</label>
            <input
              type="text"
              placeholder="e.g. Metro Winter Championship 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1 font-medium">Score Unit</label>
            <input
              type="text"
              placeholder="e.g. Goals, Points, Sets, Runs"
              value={scoreUnit}
              onChange={(e) => setScoreUnit(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1 font-medium">Venue / Arena</label>
            <input
              type="text"
              placeholder="e.g. Central Sports Complex"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1 font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Step 3: Register Teams */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-zinc-950 text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span>Registered Teams ({teams.length})</span>
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            {format === "KNOCKOUT" ? `Bracket Size: ${teams.length} teams` : "All-play-all"}
          </span>
        </div>

        {/* Add Team bar */}
        <div className="flex space-x-2">
          <select
            value={newTeamLogo}
            onChange={(e) => setNewTeamLogo(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-base focus:outline-none"
          >
            {["🦁", "⚡", "🦅", "🐺", "🛡️", "🔥", "🐍", "🐻", "🐉", "⚔️", "🏆", "🌟"].map((em) => (
              <option key={em} value={em}>
                {em}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Team name (e.g. Phoenix Knights)..."
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="button"
            onClick={handleAddTeam}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-xl text-xs flex items-center space-x-1 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team</span>
          </button>
        </div>

        {/* Teams List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {teams.map((t, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{t.logo}</span>
                <div>
                  <span className="text-xs font-bold text-white block">{t.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Seed #{t.seed} • {t.shortName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveTeam(idx)}
                className="text-zinc-500 hover:text-red-400 p-1"
                title="Remove team"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-extrabold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50"
        >
          <span>{loading ? "Generating Brackets..." : "Create Tournament & Build Fixtures"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
