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
  ChevronUp,
  ChevronDown,
  Clock,
  Users,
  Calendar,
  Settings2,
  Plus,
  Trash2,
  Sliders
} from "lucide-react";
import {
  generateGroupKnockoutTournament,
  generateKnockoutBracket,
  generateRoundRobinSchedule
} from "@/lib/tournamentEngine";

const PRESET_SPORTS = [
  { name: "Football", icon: "⚽", unit: "Goals", format: "GROUP_KNOCKOUT", win: 3, draw: 1, loss: 0 },
  { name: "Basketball", icon: "🏀", unit: "Points", format: "ROUND_ROBIN", win: 2, draw: 0, loss: 0 },
  { name: "Cricket", icon: "🏏", unit: "Runs", format: "KNOCKOUT", win: 2, draw: 1, loss: 0 },
  { name: "Volleyball", icon: "🏐", unit: "Sets", format: "GROUP_KNOCKOUT", win: 2, draw: 0, loss: 0 },
  { name: "Badminton", icon: "🏸", unit: "Points", format: "KNOCKOUT", win: 2, draw: 0, loss: 0 },
  { name: "Table Tennis", icon: "🏓", unit: "Points", format: "KNOCKOUT", win: 2, draw: 0, loss: 0 },
  { name: "Pickleball", icon: "🎾", unit: "Points", format: "GROUP_KNOCKOUT", win: 2, draw: 0, loss: 0 },
  { name: "Carrom", icon: "🎯", unit: "Points", format: "KNOCKOUT", win: 2, draw: 0, loss: 0 },
  { name: "Chess", icon: "♟️", unit: "Points", format: "ROUND_ROBIN", win: 1, draw: 0.5, loss: 0 }
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

  // Points & Scoring Configuration (Fully Configurable)
  const [winPoints, setWinPoints] = useState(3);
  const [drawPoints, setDrawPoints] = useState(1);
  const [lossPoints, setLossPoints] = useState(0);
  const [showFormGuide, setShowFormGuide] = useState(true);
  const [showGoalDiff, setShowGoalDiff] = useState(true);
  const [customPointRules, setCustomPointRules] = useState([]);
  const [customRuleInput, setCustomRuleInput] = useState("");
  const [customRuleValInput, setCustomRuleValInput] = useState("");

  // Teams (Clean slate: starts empty, no prefilled fake names)
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamPlayers, setNewTeamPlayers] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState("🛡️");
  const [teamInputMode, setTeamInputMode] = useState("list"); // "list" or "bulk"
  const [bulkText, setBulkText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelectSportPreset = (preset) => {
    setIsCustomSport(false);
    setSelectedSportPreset(preset.name);
    setSportIcon(preset.icon);
    setScoreUnit(preset.unit);
    setFormat(preset.format);
    setWinPoints(preset.win);
    setDrawPoints(preset.draw);
    setLossPoints(preset.loss);
    setTitle(`Divine Mercy ${preset.name} Tournament 2026`);
  };

  const handleSelectCustomSport = () => {
    setIsCustomSport(true);
    setSelectedSportPreset("CUSTOM");
    setSportIcon("🏆");
    setScoreUnit("Points");
    setWinPoints(3);
    setDrawPoints(1);
    setLossPoints(0);
    setTitle("Divine Mercy Community Tournament 2026");
  };

  // Add a team cleanly
  const handleAddTeam = (e) => {
    if (e) e.preventDefault();
    if (!newTeamName.trim()) return;

    const nextSeed = teams.length + 1;
    const defaultGroup = nextSeed % 2 === 1 ? "Group A" : "Group B";

    const newTeam = {
      name: newTeamName.trim(),
      players: newTeamPlayers.trim(),
      seed: nextSeed,
      group: defaultGroup,
      logo: newTeamLogo || "🛡️"
    };

    setTeams([...teams, newTeam]);
    setNewTeamName("");
    setNewTeamPlayers("");
  };

  // Remove a team
  const handleRemoveTeam = (index) => {
    const updated = teams.filter((_, idx) => idx !== index);
    reindexSeeds(updated);
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

  // Bulk paste team list
  const handleBulkTextChange = (text) => {
    setBulkText(text);
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const half = Math.ceil(lines.length / 2);
    const parsedTeams = lines.map((line, idx) => {
      const parts = line.split("-");
      const name = parts[0].trim();
      const players = parts[1] ? parts[1].trim() : "";

      return {
        name,
        players,
        seed: idx + 1,
        group: idx < half ? "Group A" : "Group B",
        logo: ["🛡️", "⚡", "🦅", "🐺", "🔥", "⚔️", "🌟", "👑", "🚀", "🎯"][idx % 10]
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

  // Custom point rule add/remove
  const handleAddCustomPointRule = () => {
    if (!customRuleInput.trim()) return;
    setCustomPointRules([
      ...customPointRules,
      {
        id: `cpr-${Date.now()}`,
        title: customRuleInput.trim(),
        value: customRuleValInput.trim() || "+1 pt"
      }
    ]);
    setCustomRuleInput("");
    setCustomRuleValInput("");
  };

  const handleRemoveCustomPointRule = (id) => {
    setCustomPointRules(customPointRules.filter((r) => r.id !== id));
  };

  const activeSportName = isCustomSport ? customSportName || "Sports" : selectedSportPreset;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a tournament title.");
      return;
    }
    if (teams.length < 2) {
      setError("Please add at least 2 teams to create tournament fixtures.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let groups = null;
      let matches = [];

      if (format === "GROUP_KNOCKOUT") {
        const grpATeams = teams
          .filter((t) => t.group === "Group A")
          .map((t, i) => ({
            ...t,
            id: `tm-a${i + 1}`,
            shortName: t.name.substring(0, 3).toUpperCase(),
            groupId: "grp-a"
          }));
        const grpBTeams = teams
          .filter((t) => t.group === "Group B")
          .map((t, i) => ({
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

      const pointsConfig = {
        win: Number(winPoints),
        draw: Number(drawPoints),
        loss: Number(lossPoints),
        showForm: showFormGuide,
        showGoalDiff,
        customRules: customPointRules
      };

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
          bannerUrl:
            "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
          pointsConfig,
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
              content:
                "Opening prayer before kickoff is observed. Respectful behavior towards officials, referees, and fellow parishioners is required."
            },
            {
              id: "r-2",
              title: "Match Duration & Tie-Breakers",
              category: "Rules",
              content:
                "Standard game times apply. In playoff stages, tied matches proceed directly to sudden-death shootouts."
            }
          ],
          autoGenerateFixtures: false,
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
      {/* Admin Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Admin Tournament Creator</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Create Tournament & Configure Rules
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Set sport, teams, points system, and match schedule.
          </p>
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

        {/* Sport Chips */}
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
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">Icon</label>
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
          <span>Tournament Format & Dates</span>
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
              Multiple groups round-robin. Top teams advance to Semi-Finals and Final.
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
              <span className="font-bold text-xs text-white">Single League Table</span>
              {format === "ROUND_ROBIN" && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-400">
              All teams play each other in a unified standings table.
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
              Single elimination bracket tree leading to Grand Final.
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="sm:col-span-2">
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">
              Tournament Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">Start Date</label>
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

      {/* Step 3: Configurable Points & Scoring System */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
              3
            </span>
            <span>Points System & Standings Rules</span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-mono font-bold">
            Win: {winPoints}pts • Draw: {drawPoints}pts • Loss: {lossPoints}pts
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Customize points awarded for matches. Standings automatically calculate according to these
          rules.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              Win Points
            </span>
            <input
              type="number"
              value={winPoints}
              onChange={(e) => setWinPoints(e.target.value)}
              className="w-16 mx-auto text-center bg-slate-900 border border-slate-700 rounded-xl py-1 text-lg font-mono font-extrabold text-emerald-400 focus:outline-none"
            />
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Draw Points
            </span>
            <input
              type="number"
              value={drawPoints}
              onChange={(e) => setDrawPoints(e.target.value)}
              className="w-16 mx-auto text-center bg-slate-900 border border-slate-700 rounded-xl py-1 text-lg font-mono font-extrabold text-amber-400 focus:outline-none"
            />
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
              Loss Points
            </span>
            <input
              type="number"
              value={lossPoints}
              onChange={(e) => setLossPoints(e.target.value)}
              className="w-16 mx-auto text-center bg-slate-900 border border-slate-700 rounded-xl py-1 text-lg font-mono font-extrabold text-rose-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Display Toggles */}
        <div className="flex flex-wrap gap-4 pt-1">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showFormGuide}
              onChange={(e) => setShowFormGuide(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
            />
            <span>Show Team Form Guide (Last 5: 🟢 W, 🟡 D, 🔴 L)</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showGoalDiff}
              onChange={(e) => setShowGoalDiff(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
            />
            <span>Show Difference Column</span>
          </label>
        </div>

        {/* Custom Point Rules */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-300 block">
            Custom Point Metrics / Notes (Optional)
          </span>

          {customPointRules.map((cr) => (
            <div
              key={cr.id}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            >
              <div>
                <span className="text-white font-medium">{cr.title}</span>
                <span className="text-blue-400 font-mono ml-2">({cr.value})</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCustomPointRule(cr.id)}
                className="text-slate-500 hover:text-red-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="e.g. 4+ Goals Bonus, Clean Sheet Bonus..."
              value={customRuleInput}
              onChange={(e) => setCustomRuleInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
            />
            <input
              type="text"
              placeholder="+1 pt"
              value={customRuleValInput}
              onChange={(e) => setCustomRuleValInput(e.target.value)}
              className="w-20 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
            />
            <button
              type="button"
              onClick={handleAddCustomPointRule}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Step 4: Clean Teams & Rosters (No prefilled names, No randomizer) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                4
              </span>
              <span>Add Participating Teams ({teams.length})</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Add your tournament teams. Seeds and groups are organized cleanly in order.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setTeamInputMode(teamInputMode === "bulk" ? "list" : "bulk")}
              className="text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>{teamInputMode === "bulk" ? "Individual Form" : "Paste Team List"}</span>
            </button>
          </div>
        </div>

        {teamInputMode === "bulk" ? (
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Paste team names (one per line). Optional format:{" "}
              <code>Team Name - Player 1, Player 2</code>
            </label>
            <textarea
              rows={6}
              value={bulkText}
              onChange={(e) => handleBulkTextChange(e.target.value)}
              placeholder="St. Joseph Strikers - John, Mark&#10;Holy Cross FC - Luke, Peter&#10;Parish Youth Stars..."
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
            ></textarea>
            <p className="text-[10px] text-slate-500 mt-1">
              {teams.length} teams detected. Seeds #1 to #{teams.length} assigned automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Add Team Input Row */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">
                + Quick Add Team
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={newTeamLogo}
                  onChange={(e) => setNewTeamLogo(e.target.value)}
                  className="w-14 bg-slate-900 border border-slate-700 rounded-xl p-2 text-base text-center text-white focus:outline-none"
                >
                  {["🛡️", "⚡", "🦅", "🐺", "🔥", "⚔️", "🌟", "👑", "🚀", "🎯", "🦁", "🐉"].map(
                    (l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    )
                  )}
                </select>

                <input
                  type="text"
                  placeholder="Team Name (e.g. St. Jude FC)"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTeam();
                    }
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
                />

                <input
                  type="text"
                  placeholder="Captain / Key Players (optional)"
                  value={newTeamPlayers}
                  onChange={(e) => setNewTeamPlayers(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTeam();
                    }
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
                />

                <button
                  type="button"
                  onClick={handleAddTeam}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Team</span>
                </button>
              </div>
            </div>

            {/* List of Added Teams */}
            {teams.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                No teams added yet. Add at least 2 teams using the box above or paste a team list.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {teams.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800 gap-2.5 text-xs"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* Move Up/Down Controls */}
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
                        <input
                          type="text"
                          placeholder="Players / Captain..."
                          value={t.players || ""}
                          onChange={(e) => handleUpdateTeamPlayers(idx, e.target.value)}
                          className="bg-transparent border-0 border-b border-slate-800 focus:border-blue-400 text-[11px] text-slate-400 placeholder-slate-600 px-0 py-0.5 w-full focus:outline-none mt-0.5"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {format === "GROUP_KNOCKOUT" && (
                        <div className="flex items-center space-x-1">
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

                      <button
                        type="button"
                        onClick={() => handleRemoveTeam(idx)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                        title="Remove Team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 1-Click Launch Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading || teams.length < 2}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-600/25 disabled:opacity-50"
        >
          <span>
            {loading
              ? "Generating Tournament & Fixtures..."
              : `Create ${activeSportName} Tournament (${teams.length} Teams)`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
