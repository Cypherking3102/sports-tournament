"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  ClipboardPaste,
  Shield,
  Shuffle,
  ChevronUp,
  ChevronDown,
  Clock,
  Users,
  Calendar,
  Settings2
} from "lucide-react";
import { generateGroupKnockoutTournament, generateKnockoutBracket, generateRoundRobinSchedule } from "@/lib/tournamentEngine";

const DEFAULT_TEAMS = [
  { name: "Red Dragons", players: "Mark (C), John, Alex, David" },
  { name: "Blue Falcons", players: "Paul (C), Luke, Peter, Simon" },
  { name: "Iron Wolves", players: "Chris (C), Kevin, Ryan, Jason" },
  { name: "Apex Thunder", players: "Sam (C), Daniel, Brian, Tom" },
  { name: "Silver Strikers", players: "James (C), Joseph, Matthew, Andrew" },
  { name: "Golden Titans", players: "Michael (C), Anthony, Jude, Francis" },
  { name: "Phoenix United", players: "Gabriel (C), Raphael, Dominic, Xavier" },
  { name: "Shadow Cobras", players: "Leo (C), Carlos, Victor, Aaron" }
];

const PRESET_SPORTS = [
  { name: "Football", icon: "⚽", unit: "Goals", format: "GROUP_KNOCKOUT" },
  { name: "Basketball", icon: "🏀", unit: "Points", format: "ROUND_ROBIN" },
  { name: "Cricket", icon: "🏏", unit: "Runs", format: "KNOCKOUT" },
  { name: "Volleyball", icon: "🏐", unit: "Sets", format: "GROUP_KNOCKOUT" },
  { name: "Badminton", icon: "🏸", unit: "Points", format: "KNOCKOUT" },
  { name: "Table Tennis", icon: "🏓", unit: "Points", format: "KNOCKOUT" },
  { name: "Pickleball", icon: "🎾", unit: "Points", format: "GROUP_KNOCKOUT" },
  { name: "Carrom", icon: "🎯", unit: "Points", format: "KNOCKOUT" },
  { name: "Chess", icon: "♟️", unit: "Points", format: "ROUND_ROBIN" }
];

export default function TournamentWizard() {
  const router = useRouter();

  // Sport selection
  const [selectedSportPreset, setSelectedSportPreset] = useState("Football");
  const [isCustomSport, setIsCustomSport] = useState(false);
  const [customSportName, setCustomSportName] = useState("");
  const [sportIcon, setSportIcon] = useState("⚽");
  const [scoreUnit, setScoreUnit] = useState("Goals");

  // Basic Info
  const [title, setTitle] = useState("Divine Mercy Annual Football Cup 2026");
  const [format, setFormat] = useState("GROUP_KNOCKOUT");
  const [location, setLocation] = useState("Parish Sports Turf");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  // Fixture Mode: "auto" or "preview_manual"
  const [fixtureMode, setFixtureMode] = useState("auto"); // "auto" or "manual"

  // Teams with Seeds & Players
  const [teamInputMode, setTeamInputMode] = useState("cards"); // "cards" or "bulk"
  const [bulkText, setBulkText] = useState(DEFAULT_TEAMS.map((t) => t.name).join("\n"));
  const [teams, setTeams] = useState(
    DEFAULT_TEAMS.map((t, idx) => ({
      name: t.name,
      players: t.players,
      seed: idx + 1,
      group: idx < 4 ? "Group A" : "Group B",
      logo: ["🐉", "🦅", "🐺", "⚡", "⚔️", "🛡️", "🔥", "🐍"][idx % 8]
    }))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelectSportPreset = (preset) => {
    setIsCustomSport(false);
    setSelectedSportPreset(preset.name);
    setSportIcon(preset.icon);
    setScoreUnit(preset.unit);
    setFormat(preset.format);
    setTitle(`Divine Mercy ${preset.name} Tournament 2026`);
  };

  const handleSelectCustomSport = () => {
    setIsCustomSport(true);
    setSelectedSportPreset("CUSTOM");
    setSportIcon("🏆");
    setScoreUnit("Points");
    setTitle("Divine Mercy Community Tournament 2026");
  };

  // Seed Reordering: Move team up
  const handleMoveTeamUp = (index) => {
    if (index === 0) return;
    const updated = [...teams];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    reindexSeeds(updated);
  };

  // Move team down
  const handleMoveTeamDown = (index) => {
    if (index === teams.length - 1) return;
    const updated = [...teams];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    reindexSeeds(updated);
  };

  // Randomize / Shuffle Draw
  const handleShuffleSeeds = () => {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    reindexSeeds(shuffled);
  };

  const reindexSeeds = (list) => {
    const half = Math.ceil(list.length / 2);
    setTeams(
      list.map((t, idx) => ({
        ...t,
        seed: idx + 1,
        group: idx < half ? "Group A" : "Group B"
      }))
    );
  };

  const handleBulkTextChange = (text) => {
    setBulkText(text);
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const half = Math.ceil(lines.length / 2);
    const parsedTeams = lines.map((line, idx) => {
      // Support "Team Name - Player 1, Player 2" or just "Team Name"
      const parts = line.split("-");
      const name = parts[0].trim();
      const players = parts[1] ? parts[1].trim() : "";

      return {
        name,
        players,
        seed: idx + 1,
        group: idx < half ? "Group A" : "Group B",
        logo: ["🐉", "🦅", "🐺", "⚡", "⚔️", "🛡️", "🔥", "🐍", "🦁", "🌟"][idx % 10]
      };
    });
    setTeams(parsedTeams);
  };

  const handleUpdateTeamPlayers = (index, playersText) => {
    const updated = [...teams];
    updated[index].players = playersText;
    setTeams(updated);
  };

  const handleUpdateTeamGroup = (index, newGroup) => {
    const updated = [...teams];
    updated[index].group = newGroup;
    setTeams(updated);
  };

  const activeSportName = isCustomSport ? (customSportName || "Sports") : selectedSportPreset;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a tournament title.");
      return;
    }
    if (teams.length < 2) {
      setError("Please include at least 2 teams.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let groups = null;
      let matches = [];

      if (format === "GROUP_KNOCKOUT") {
        const grpATeams = teams.filter((t) => t.group === "Group A").map((t, i) => ({
          ...t,
          id: `tm-a${i + 1}`,
          shortName: t.name.substring(0, 3).toUpperCase(),
          groupId: "grp-a"
        }));
        const grpBTeams = teams.filter((t) => t.group === "Group B").map((t, i) => ({
          ...t,
          id: `tm-b${i + 1}`,
          shortName: t.name.substring(0, 3).toUpperCase(),
          groupId: "grp-b"
        }));

        groups = [
          { id: "grp-a", name: "Group A", teams: grpATeams },
          { id: "grp-b", name: "Group B", teams: grpBTeams }
        ];

        matches = generateGroupKnockoutTournament(groups, {
          startDate,
          venue: location
        });
      } else if (format === "KNOCKOUT") {
        matches = generateKnockoutBracket(
          teams.map((t, i) => ({
            id: `tm-${i + 1}`,
            name: t.name,
            seed: t.seed,
            players: t.players,
            logo: t.logo
          })),
          { startDate, venue: location }
        );
      } else {
        matches = generateRoundRobinSchedule(
          teams.map((t, i) => ({
            id: `tm-${i + 1}`,
            name: t.name,
            seed: t.seed,
            players: t.players,
            logo: t.logo
          })),
          { startDate, venue: location }
        );
      }

      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          sport: activeSportName,
          sportIcon,
          scoreUnit,
          format,
          startDate,
          location,
          organizer: "Divine Mercy Sports Ministry",
          description: `Official ${activeSportName} tournament.`,
          bannerUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
          teams: teams.map((t, idx) => ({
            id: `tm-${idx + 1}`,
            name: t.name,
            shortName: t.name.substring(0, 3).toUpperCase(),
            seed: t.seed,
            logo: t.logo,
            players: t.players || "",
            groupId: t.group === "Group A" ? "grp-a" : "grp-b"
          })),
          groups,
          rules: [
            {
              id: "r-1",
              title: "Fair Play & Fellowship",
              category: "Conduct",
              content: "Prayer before kickoff is observed. Respectful behavior towards officials and opponents is required."
            },
            {
              id: "r-2",
              title: "Tournament Rules",
              category: "Format",
              content: "Top teams qualify for championship playoffs. Shootout rounds apply if tied."
            }
          ],
          autoGenerateFixtures: false, // We pass our generated/custom matches directly
          customMatches: matches
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {/* Clean Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Admin Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Create Tournament & Draw Seeds
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-2xl font-medium">
          {error}
        </div>
      )}

      {/* Step 1: Sport Selection */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
              1
            </span>
            <span>Choose Sport</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {isCustomSport ? "Custom Sport" : selectedSportPreset}
          </span>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          {PRESET_SPORTS.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => handleSelectSportPreset(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                !isCustomSport && selectedSportPreset === s.name
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={handleSelectCustomSport}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              isCustomSport
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "bg-slate-950 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            <span>✨</span>
            <span>+ Custom / Any Sport</span>
          </button>
        </div>

        {/* Custom Sport Inputs */}
        {isCustomSport && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                Sport Name
              </label>
              <input
                type="text"
                placeholder="e.g. Throwball, Chess, Dodgeball..."
                value={customSportName}
                onChange={(e) => {
                  setCustomSportName(e.target.value);
                  if (e.target.value) {
                    setTitle(`Divine Mercy ${e.target.value} Tournament 2026`);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                Icon
              </label>
              <select
                value={sportIcon}
                onChange={(e) => setSportIcon(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                {["🏆", "🤾", "🏃", "🥇", "🎯", "⚡", "🔥", "🛡️", "⚔️", "🏸", "🏓", "🎾", "🎳"].map(
                  (em) => (
                    <option key={em} value={em}>
                      {em} Icon
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                Score Unit
              </label>
              <input
                type="text"
                placeholder="Points, Goals, Sets..."
                value={scoreUnit}
                onChange={(e) => setScoreUnit(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Format & Schedule Details */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
            2
          </span>
          <span>Format & Match Schedule</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setFormat("GROUP_KNOCKOUT")}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              format === "GROUP_KNOCKOUT"
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-800 bg-slate-950 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Groups + Knockouts</span>
              </span>
              {format === "GROUP_KNOCKOUT" && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-400">
              Group A & B round-robin. Top 2 advance to Playoffs.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFormat("ROUND_ROBIN")}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              format === "ROUND_ROBIN"
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-800 bg-slate-950 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">Single League</span>
              {format === "ROUND_ROBIN" && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-400">
              All teams play in one points table.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFormat("KNOCKOUT")}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              format === "KNOCKOUT"
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-800 bg-slate-950 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">Direct Knockout</span>
              {format === "KNOCKOUT" && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-400">
              Straight bracket tree to championship final.
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="sm:col-span-2">
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">Tournament Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">Match Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1 font-medium">Venue / Turf</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Step 3: Draw Seeds, Move Players & Configure Teams */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                3
              </span>
              <span>Draw Seeds & Team Players ({teams.length})</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Reorder seeds, assign players/captains, or shuffle the draw.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* 1-Click Shuffle Seeds / Blind Draw */}
            <button
              type="button"
              onClick={handleShuffleSeeds}
              className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1.5"
              title="Randomize the seed draw"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Randomize Draw</span>
            </button>

            <button
              type="button"
              onClick={() => setTeamInputMode(teamInputMode === "bulk" ? "cards" : "bulk")}
              className="text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>{teamInputMode === "bulk" ? "Seed Cards" : "Paste List"}</span>
            </button>
          </div>
        </div>

        {teamInputMode === "bulk" ? (
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Paste team names (one per line). Format: <code>Team Name - Player 1, Player 2</code>:
            </label>
            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => handleBulkTextChange(e.target.value)}
              placeholder="Red Dragons - Mark (C), John, Alex&#10;Blue Falcons - Luke, Peter&#10;Iron Wolves..."
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
            ></textarea>
            <p className="text-[10px] text-slate-500 mt-1">
              {teams.length} teams detected. Seeds #1 to #{teams.length} assigned in order.
            </p>
          </div>
        ) : (
          /* Interactive Seed Cards: Move Up/Down, Edit Players */
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {teams.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800 gap-2.5 text-xs"
              >
                {/* Team Logo, Name, Seed */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="flex flex-col space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleMoveTeamUp(idx)}
                      disabled={idx === 0}
                      className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20"
                      title="Move Seed Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveTeamDown(idx)}
                      disabled={idx === teams.length - 1}
                      className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20"
                      title="Move Seed Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xl flex-shrink-0">{t.logo}</span>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white truncate">{t.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Seed #{t.seed}
                      </span>
                    </div>

                    {/* Players / Captain Input */}
                    <input
                      type="text"
                      placeholder="Add captain or players (e.g. Mark, Alex, John)..."
                      value={t.players || ""}
                      onChange={(e) => handleUpdateTeamPlayers(idx, e.target.value)}
                      className="bg-transparent border-0 border-b border-slate-800 focus:border-blue-400 text-[11px] text-slate-300 placeholder-slate-600 px-0 py-0.5 w-full focus:outline-none mt-1"
                    />
                  </div>
                </div>

                {/* Group Selector (if Group Stage) */}
                {format === "GROUP_KNOCKOUT" && (
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateTeamGroup(idx, "Group A")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        t.group === "Group A"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-900 text-slate-500 hover:text-white"
                      }`}
                    >
                      Group A
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateTeamGroup(idx, "Group B")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        t.group === "Group B"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-900 text-slate-500 hover:text-white"
                      }`}
                    >
                      Group B
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1-Click Launch Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-600/25 disabled:opacity-50"
        >
          <span>{loading ? "Creating & Drawing Fixtures..." : `Launch ${activeSportName} Tournament`}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
