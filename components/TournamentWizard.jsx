"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Layers
} from "lucide-react";
import { generateGroupKnockoutTournament, generateKnockoutBracket, generateRoundRobinSchedule } from "@/lib/tournamentEngine";

const SPORTS_PRESETS = [
  { name: "Football", icon: "⚽", scoreUnit: "Goals", format: "GROUP_KNOCKOUT" },
  { name: "Basketball", icon: "🏀", scoreUnit: "Points", format: "ROUND_ROBIN" },
  { name: "Cricket", icon: "🏏", scoreUnit: "Runs", format: "KNOCKOUT" },
  { name: "Volleyball", icon: "🏐", scoreUnit: "Sets", format: "GROUP_KNOCKOUT" },
  { name: "Badminton", icon: "🏸", scoreUnit: "Points", format: "KNOCKOUT" }
];

export default function TournamentWizard() {
  const router = useRouter();
  const [sport, setSport] = useState(SPORTS_PRESETS[0].name);
  const [sportIcon, setSportIcon] = useState(SPORTS_PRESETS[0].icon);
  const [scoreUnit, setScoreUnit] = useState(SPORTS_PRESETS[0].scoreUnit);
  const [format, setFormat] = useState("GROUP_KNOCKOUT");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Divine Mercy Parish Grounds");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Teams list (default 8 teams for Groups A and B)
  const [teams, setTeams] = useState([
    { name: "St. Joseph Ward", shortName: "SJW", seed: 1, logo: "🦁", group: "Group A" },
    { name: "St. Jude Ward", shortName: "SJD", seed: 2, logo: "🛡️", group: "Group A" },
    { name: "St. Anthony Ward", shortName: "SAW", seed: 3, logo: "⚔️", group: "Group A" },
    { name: "St. Michael Ward", shortName: "SMW", seed: 4, logo: "🦅", group: "Group A" },
    { name: "St. Peter Ward", shortName: "SPW", seed: 5, logo: "🗝️", group: "Group B" },
    { name: "Mother Teresa Community", shortName: "MTC", seed: 6, logo: "🕊️", group: "Group B" },
    { name: "St. Francis Ward", shortName: "SFW", seed: 7, logo: "🐺", group: "Group B" },
    { name: "Holy Family Youth", shortName: "HFY", seed: 8, logo: "🌟", group: "Group B" }
  ]);

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamGroup, setNewTeamGroup] = useState("Group A");
  const [newTeamLogo, setNewTeamLogo] = useState("🛡️");

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
        logo: newTeamLogo,
        group: newTeamGroup
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
      let groups = null;
      let matches = [];

      if (format === "GROUP_KNOCKOUT") {
        // Divide into Group A and Group B
        const grpATeams = teams.filter((t) => t.group === "Group A").map((t, i) => ({ ...t, id: `tm-a${i+1}`, groupId: "grp-a" }));
        const grpBTeams = teams.filter((t) => t.group === "Group B").map((t, i) => ({ ...t, id: `tm-b${i+1}`, groupId: "grp-b" }));

        groups = [
          { id: "grp-a", name: "Group A", teams: grpATeams },
          { id: "grp-b", name: "Group B", teams: grpBTeams }
        ];

        matches = generateGroupKnockoutTournament(groups, {
          startDate,
          venue: location
        });
      }

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
          organizer: "Divine Mercy Parish Sports Committee",
          description: description || `Annual ${sport} tournament organized by Divine Mercy Church.`,
          bannerUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
          teams: teams.map((t, idx) => ({
            id: `tm-${idx + 1}`,
            name: t.name,
            shortName: t.shortName,
            seed: t.seed,
            logo: t.logo,
            groupId: t.group === "Group A" ? "grp-a" : "grp-b"
          })),
          groups,
          rules: [
            {
              id: "r-1",
              title: "Christian Sportsmanship & Fellowship",
              category: "Conduct",
              content: "Teams begin every match with prayer. Respectful behavior towards officials, opponents, and parishioners is mandatory."
            },
            {
              id: "r-2",
              title: "Tournament Advancement Rules",
              category: "Format",
              content: "Top teams qualify for the championship knockout playoffs. Sudden death shootouts apply if playoff matches end tied."
            }
          ],
          autoGenerateFixtures: format !== "GROUP_KNOCKOUT",
          customMatches: format === "GROUP_KNOCKOUT" ? matches : undefined
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
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Divine Mercy Parish Tournament Wizard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Parish Tournament
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          Set up multi-group round robin stages, knockout playoffs, or straight brackets for Divine Mercy Church wards and youth communities.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-2xl font-medium">
          {error}
        </div>
      )}

      {/* Step 1: Sport Selection */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            1
          </span>
          <span>Select Sport</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SPORTS_PRESETS.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => handleSportChange(s.name)}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                sport === s.name
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                  : "border-slate-800 bg-slate-950 hover:border-slate-700"
              }`}
            >
              <span className="text-2xl block mb-1">{s.icon}</span>
              <span
                className={`text-xs font-bold block ${
                  sport === s.name ? "text-blue-300" : "text-slate-300"
                }`}
              >
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Format & Basic Details */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            2
          </span>
          <span>Tournament Format & Schedule</span>
        </h3>

        {/* 3 Formats: Group+Knockout, Round Robin, Direct Knockout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFormat("GROUP_KNOCKOUT")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              format === "GROUP_KNOCKOUT"
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-800 bg-slate-950 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs sm:text-sm text-white flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Groups + Knockouts</span>
              </span>
              {format === "GROUP_KNOCKOUT" && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Multiple groups (Group A & B) play round-robin. Top 2 advance to Semi-Finals & Final.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFormat("ROUND_ROBIN")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              format === "ROUND_ROBIN"
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-800 bg-slate-950 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs sm:text-sm text-white">Single League Table</span>
              {format === "ROUND_ROBIN" && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              All teams play each other in one combined points table (Played, Won, Lost, PTS).
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFormat("KNOCKOUT")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              format === "KNOCKOUT"
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-800 bg-slate-950 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs sm:text-sm text-white">Direct Knockout</span>
              {format === "KNOCKOUT" && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Single elimination tree bracket from Quarter/Semi-Finals directly to Grand Final.
            </p>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Tournament Title</label>
            <input
              type="text"
              placeholder="e.g. Divine Mercy Parish Football Trophy 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Score Unit</label>
            <input
              type="text"
              placeholder="e.g. Goals, Points, Sets, Runs"
              value={scoreUnit}
              onChange={(e) => setScoreUnit(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Parish Venue / Ground</label>
            <input
              type="text"
              placeholder="e.g. Divine Mercy Church Grounds"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Step 3: Register Parish Teams & Wards */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span>Registered Wards & Teams ({teams.length})</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {format === "GROUP_KNOCKOUT" ? "Assigned to Group A & B" : `${teams.length} Teams`}
          </span>
        </div>

        {/* Add Team bar */}
        <div className="flex flex-wrap gap-2">
          <select
            value={newTeamLogo}
            onChange={(e) => setNewTeamLogo(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base focus:outline-none"
          >
            {["🦁", "🛡️", "⚔️", "🦅", "🗝️", "🕊️", "🐺", "🌟", "🔥", "⚡", "👑", "🏹"].map((em) => (
              <option key={em} value={em}>
                {em}
              </option>
            ))}
          </select>

          {format === "GROUP_KNOCKOUT" && (
            <select
              value={newTeamGroup}
              onChange={(e) => setNewTeamGroup(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="Group A">Group A</option>
              <option value="Group B">Group B</option>
            </select>
          )}

          <input
            type="text"
            placeholder="Ward / Team name (e.g. St. Thomas Ward)..."
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="flex-1 min-w-[200px] bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
          />

          <button
            type="button"
            onClick={handleAddTeam}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Ward</span>
          </button>
        </div>

        {/* Teams List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {teams.map((t, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{t.logo}</span>
                <div>
                  <span className="text-xs font-bold text-white block">{t.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {t.group ? `${t.group} • ` : ""}Seed #{t.seed} • {t.shortName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveTeam(idx)}
                className="text-slate-500 hover:text-red-400 p-1"
                title="Remove team"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-600/25 disabled:opacity-50"
        >
          <span>{loading ? "Generating Group Fixtures & Playoffs..." : "Launch Divine Mercy Tournament"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
