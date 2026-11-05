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
  User,
  Calendar,
  Settings2,
  Plus,
  Trash2,
  Sliders,
  Star,
  UserCheck,
  ChevronRight,
  UserPlus
} from "lucide-react";
import {
  generateGroupKnockoutTournament,
  generateKnockoutBracket,
  generateRoundRobinSchedule,
  normalizePlayers,
  formatRosterString,
  buildDefaultPlayoffMatches
} from "@/lib/tournamentEngine";
import { saveClientTournament } from "@/lib/clientStorage";

const PRESET_SPORTS = [
  { name: "Football", icon: "⚽", unit: "Goals", format: "GROUP_KNOCKOUT", type: "TEAM", win: 3, draw: 1, loss: 0 },
  { name: "Basketball", icon: "🏀", unit: "Points", format: "ROUND_ROBIN", type: "TEAM", win: 2, draw: 0, loss: 0 },
  { name: "Cricket", icon: "🏏", unit: "Runs", format: "KNOCKOUT", type: "TEAM", win: 2, draw: 1, loss: 0 },
  { name: "Volleyball", icon: "🏐", unit: "Sets", format: "GROUP_KNOCKOUT", type: "TEAM", win: 2, draw: 0, loss: 0 },
  { name: "Badminton", icon: "🏸", unit: "Points", format: "KNOCKOUT", type: "INDIVIDUAL", win: 2, draw: 0, loss: 0 },
  { name: "Table Tennis", icon: "🏓", unit: "Points", format: "KNOCKOUT", type: "INDIVIDUAL", win: 2, draw: 0, loss: 0 },
  { name: "Pickleball", icon: "🎾", unit: "Points", format: "GROUP_KNOCKOUT", type: "INDIVIDUAL", win: 2, draw: 0, loss: 0 },
  { name: "Carrom", icon: "🎯", unit: "Points", format: "KNOCKOUT", type: "INDIVIDUAL", win: 2, draw: 0, loss: 0 },
  { name: "Chess", icon: "♟️", unit: "Points", format: "ROUND_ROBIN", type: "INDIVIDUAL", win: 1, draw: 0.5, loss: 0 }
];

export default function TournamentWizard() {
  const router = useRouter();

  // Sport selection
  const [selectedSportPreset, setSelectedSportPreset] = useState("Football");
  const [isCustomSport, setIsCustomSport] = useState(false);
  const [customSportName, setCustomSportName] = useState("");
  const [sportIcon, setSportIcon] = useState("⚽");
  const [scoreUnit, setScoreUnit] = useState("Goals");

  // Participant Type: "TEAM" (Teams with individual player rosters) or "INDIVIDUAL" (Singles / Solo players)
  const [participantType, setParticipantType] = useState("TEAM");

  // Basic Info
  const [title, setTitle] = useState("Divine Mercy Annual Football Cup 2026");
  const [format, setFormat] = useState("GROUP_KNOCKOUT");
  const [location, setLocation] = useState("Parish Sports Turf");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  // Dynamic Multi-Group Management (Can add Group A, B, C, D, E...)
  const [groupsList, setGroupsList] = useState(["Group A", "Group B"]);

  // Playoff Structure & Seed Customization
  const [playoffStage, setPlayoffStage] = useState("SEMI_FINALS"); // "FINAL", "SEMI_FINALS", "QUARTER_FINALS"
  const [customPlayoffMatchups, setCustomPlayoffMatchups] = useState([]);

  // Points & Scoring Configuration (Fully Configurable)
  const [winPoints, setWinPoints] = useState(3);
  const [drawPoints, setDrawPoints] = useState(1);
  const [lossPoints, setLossPoints] = useState(0);
  const [showFormGuide, setShowFormGuide] = useState(true);
  const [showGoalDiff, setShowGoalDiff] = useState(true);
  const [customPointRules, setCustomPointRules] = useState([]);
  const [customRuleInput, setCustomRuleInput] = useState("");
  const [customRuleValInput, setCustomRuleValInput] = useState("");

  // Participants (Clean slate: starts empty, no prefilled fake names)
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState("🛡️");

  // For adding individual players into a team
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState("PLAYER"); // "CAPTAIN", "VICE_CAPTAIN", "PLAYER"

  // Quick individual participant input (for INDIVIDUAL tournaments)
  const [newSoloName, setNewSoloName] = useState("");
  const [newSoloAvatar, setNewSoloAvatar] = useState("👤");

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
    setParticipantType(preset.type || "TEAM");
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

  // Group helpers
  const handleAddGroup = () => {
    const nextLetter = String.fromCharCode(65 + groupsList.length);
    const newGroupName = `Group ${nextLetter}`;
    setGroupsList([...groupsList, newGroupName]);
  };

  const handleRemoveGroup = (groupNameToRemove) => {
    if (groupsList.length <= 1) return;
    const remaining = groupsList.filter((g) => g !== groupNameToRemove);
    setGroupsList(remaining);
    const fallbackGroup = remaining[0];
    setTeams(
      teams.map((t) => (t.group === groupNameToRemove ? { ...t, group: fallbackGroup } : t))
    );
  };

  const handleSetPresetGroups = (count) => {
    const newGroups = [];
    for (let i = 0; i < count; i++) {
      newGroups.push(`Group ${String.fromCharCode(65 + i)}`);
    }
    setGroupsList(newGroups);
    handleAutoBalanceTeams(newGroups);
  };

  const handleAutoBalanceTeams = (groupsToUse = groupsList) => {
    if (!groupsToUse.length || !teams.length) return;
    setTeams(
      teams.map((t, idx) => ({
        ...t,
        group: groupsToUse[idx % groupsToUse.length]
      }))
    );
  };

  // Add a team (in TEAM mode)
  const handleAddTeam = (e) => {
    if (e) e.preventDefault();
    if (!newTeamName.trim()) return;

    const nextSeed = teams.length + 1;
    const defaultGroup = groupsList[teams.length % groupsList.length] || "Group A";

    const newTeam = {
      name: newTeamName.trim(),
      logo: newTeamLogo || "🛡️",
      seed: nextSeed,
      group: defaultGroup,
      players: [] // Array of { id, name, role }
    };

    const updated = [...teams, newTeam];
    setTeams(updated);
    setSelectedTeamIndex(updated.length - 1);
    setNewTeamName("");
  };

  // Add an individual participant (in INDIVIDUAL mode)
  const handleAddIndividual = (e) => {
    if (e) e.preventDefault();
    if (!newSoloName.trim()) return;

    const nextSeed = teams.length + 1;
    const defaultGroup = groupsList[teams.length % groupsList.length] || "Group A";

    const newPlayer = {
      name: newSoloName.trim(),
      logo: newSoloAvatar || "👤",
      seed: nextSeed,
      group: defaultGroup,
      players: []
    };

    setTeams([...teams, newPlayer]);
    setNewSoloName("");
  };

  // Add a player to a specific team
  const handleAddPlayerToTeam = (teamIndex) => {
    if (!newPlayerName.trim()) return;
    const updated = [...teams];
    const targetTeam = updated[teamIndex];
    if (!targetTeam) return;

    const currentPlayers = targetTeam.players || [];
    let roleToAssign = newPlayerRole;

    // If first player added, make them Captain by default
    if (currentPlayers.length === 0) {
      roleToAssign = "CAPTAIN";
    } else if (roleToAssign === "CAPTAIN") {
      // Demote previous captain to regular player
      targetTeam.players = currentPlayers.map((p) =>
        p.role === "CAPTAIN" ? { ...p, role: "PLAYER" } : p
      );
    }

    const newPlayer = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newPlayerName.trim(),
      role: roleToAssign
    };

    targetTeam.players = [...(targetTeam.players || []), newPlayer];
    setTeams(updated);
    setNewPlayerName("");
    setNewPlayerRole("PLAYER");
  };

  // Set captain on a team
  const handleSetCaptain = (teamIndex, playerId) => {
    const updated = [...teams];
    const targetTeam = updated[teamIndex];
    if (!targetTeam || !targetTeam.players) return;

    targetTeam.players = targetTeam.players.map((p) => ({
      ...p,
      role: p.id === playerId ? "CAPTAIN" : p.role === "CAPTAIN" ? "PLAYER" : p.role
    }));
    setTeams(updated);
  };

  // Set vice-captain on a team
  const handleSetViceCaptain = (teamIndex, playerId) => {
    const updated = [...teams];
    const targetTeam = updated[teamIndex];
    if (!targetTeam || !targetTeam.players) return;

    targetTeam.players = targetTeam.players.map((p) => ({
      ...p,
      role: p.id === playerId ? "VICE_CAPTAIN" : p.role === "VICE_CAPTAIN" ? "PLAYER" : p.role
    }));
    setTeams(updated);
  };

  // Remove a player from a team
  const handleRemovePlayerFromTeam = (teamIndex, playerId) => {
    const updated = [...teams];
    const targetTeam = updated[teamIndex];
    if (!targetTeam || !targetTeam.players) return;

    targetTeam.players = targetTeam.players.filter((p) => p.id !== playerId);
    setTeams(updated);
  };

  // Remove a team or individual
  const handleRemoveTeam = (index) => {
    const updated = teams.filter((_, idx) => idx !== index);
    reindexSeeds(updated);
    if (selectedTeamIndex >= updated.length) {
      setSelectedTeamIndex(Math.max(0, updated.length - 1));
    }
  };

  // Move up/down
  const handleMoveTeamUp = (index) => {
    if (index === 0) return;
    const updated = [...teams];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    reindexSeeds(updated);
  };

  const handleMoveTeamDown = (index) => {
    if (index === teams.length - 1) return;
    const updated = [...teams];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    reindexSeeds(updated);
  };

  const reindexSeeds = (list, currentGroups = groupsList) => {
    const gCount = currentGroups.length || 1;
    setTeams(
      list.map((t, idx) => ({
        ...t,
        seed: idx + 1,
        group: t.group && currentGroups.includes(t.group) ? t.group : currentGroups[idx % gCount]
      }))
    );
  };

  // Bulk paste team or individual list
  const handleBulkTextChange = (text) => {
    setBulkText(text);
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const gCount = groupsList.length || 1;

    if (participantType === "INDIVIDUAL") {
      const parsed = lines.map((line, idx) => ({
        name: line,
        seed: idx + 1,
        group: groupsList[idx % gCount] || "Group A",
        logo: "👤",
        players: []
      }));
      setTeams(parsed);
    } else {
      // Format: Team Name - Player 1 (C), Player 2, Player 3
      const parsedTeams = lines.map((line, idx) => {
        const parts = line.split("-");
        const name = parts[0].trim();
        const playersRaw = parts[1] ? parts[1].trim() : "";
        const playerObjects = normalizePlayers(playersRaw);

        return {
          name,
          players: playerObjects,
          seed: idx + 1,
          group: groupsList[idx % gCount] || "Group A",
          logo: ["🛡️", "⚡", "🦅", "🐺", "🔥", "⚔️", "🌟", "👑", "🚀", "🎯"][idx % 10]
        };
      });
      setTeams(parsedTeams);
    }
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
      setError(
        `Please add at least 2 ${
          participantType === "TEAM" ? "teams" : "players"
        } to create tournament fixtures.`
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      let groups = null;
      let matches = [];

      const formattedParticipants = teams.map((t, idx) => {
        const playersList = Array.isArray(t.players) ? t.players : [];
        const captainObj = playersList.find((p) => p.role === "CAPTAIN");

        return {
          id: `tm-${idx + 1}`,
          name: t.name,
          shortName: t.name.substring(0, 3).toUpperCase(),
          seed: t.seed,
          logo: t.logo || (participantType === "INDIVIDUAL" ? "👤" : "🛡️"),
          captain: captainObj ? captainObj.name : null,
          players: playersList,
          playersString: formatRosterString(playersList),
          group: t.group || groupsList[0],
          groupId: `grp-${String.fromCharCode(97 + Math.max(0, groupsList.indexOf(t.group)))}`
        };
      });

      if (format === "GROUP_KNOCKOUT") {
        groups = groupsList.map((grpName, gIdx) => {
          const grpId = `grp-${String.fromCharCode(97 + gIdx)}`;
          const grpTeams = formattedParticipants
            .filter((t) => t.group === grpName)
            .map((t, i) => ({
              ...t,
              id: `tm-${String.fromCharCode(97 + gIdx)}${i + 1}`,
              groupId: grpId
            }));
          return {
            id: grpId,
            name: grpName,
            teams: grpTeams
          };
        });

        const activePlayoffMatches =
          customPlayoffMatchups.length > 0
            ? customPlayoffMatchups
            : buildDefaultPlayoffMatches(groups, {
                startDate,
                venue: location,
                playoffStage
              });

        matches = generateGroupKnockoutTournament(groups, {
          startDate,
          venue: location,
          playoffMatches: activePlayoffMatches
        });
      } else if (format === "KNOCKOUT") {
        matches = generateKnockoutBracket(formattedParticipants, {
          startDate,
          venue: location
        });
      } else {
        matches = generateRoundRobinSchedule(formattedParticipants, {
          startDate,
          venue: location
        });
      }

      const pointsConfig = {
        win: Number(winPoints),
        draw: Number(drawPoints),
        loss: Number(lossPoints),
        showForm: showFormGuide,
        showGoalDiff,
        customRules: customPointRules
      };

      const tournamentId = `dmc-${Date.now()}`;
      const tournamentPayload = {
        id: tournamentId,
        title,
        sport: activeSportName,
        sportIcon,
        scoreUnit,
        participantType, // "TEAM" or "INDIVIDUAL"
        format,
        startDate,
        location,
        organizer: "Divine Mercy Church",
        description: `Official ${activeSportName} ${
          participantType === "TEAM" ? "Team" : "Individual"
        } tournament.`,
        bannerUrl:
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
        pointsConfig,
        teams: formattedParticipants,
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
        customMatches: matches,
        matches,
        playoffStage
      };

      // 1. Immediately persist to client storage so it is NEVER lost
      saveClientTournament(tournamentPayload);

      // 2. Post to server
      try {
        const res = await fetch("/api/tournaments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tournamentPayload)
        });

        if (res.ok) {
          const created = await res.json();
          saveClientTournament(created);
        }
      } catch (postErr) {
        console.warn("Server post warning, relying on local store:", postErr);
      }

      // 3. Navigate directly to tournament
      router.push(`/tournaments/${tournamentId}`);
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
            Create Tournament & Manage Rosters
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure sport, teams, individual players, captains, points, and fixtures.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-2xl font-medium">
          {error}
        </div>
      )}

      {/* Step 1: Sport & Participant Type Selection */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
              1
            </span>
            <span>Choose Sport & Competition Type</span>
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
                placeholder="e.g. Throwball, Dodgeball, Chess..."
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

        {/* Participant Type Selector: Team vs Individual */}
        <div className="pt-3 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300 block mb-2">
            Competition Structure
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setParticipantType("TEAM")}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                participantType === "TEAM"
                  ? "border-blue-500 bg-blue-500/10 shadow-md shadow-blue-500/10"
                  : "border-slate-800 bg-slate-950 hover:border-slate-700"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  participantType === "TEAM"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 text-slate-400"
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-xs block">
                  Team Tournament (Squads & Captains)
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Teams with individual player rosters, captains (C), and vice-captains (VC).
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setParticipantType("INDIVIDUAL")}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                participantType === "INDIVIDUAL"
                  ? "border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-500/10"
                  : "border-slate-800 bg-slate-950 hover:border-slate-700"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  participantType === "INDIVIDUAL"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 text-slate-400"
                }`}
              >
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-xs block">
                  Individual / Singles Tournament
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Solo players competing directly 1v1 (e.g. Chess, Badminton Singles, Carrom).
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Format & Dates */}
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
              All {participantType === "TEAM" ? "teams" : "players"} play each other in a unified
              table.
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

      {/* Dynamic Multi-Group Stage & Playoff Brackets Setup (when GROUP_KNOCKOUT is selected) */}
      {format === "GROUP_KNOCKOUT" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-0.5">
                <Layers className="w-4 h-4" />
                <span>Multi-Group & Playoff Setup</span>
              </div>
              <h3 className="font-extrabold text-white text-base">
                Configure Groups & Playoff Seeds
              </h3>
              <p className="text-xs text-slate-400">
                Create any number of groups (Group A, B, C, D...), move teams between them, and customize playoff matchups.
              </p>
            </div>
          </div>

          {/* Group Management */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Active Groups ({groupsList.length})
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
                {[2, 3, 4].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleSetPresetGroups(cnt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      groupsList.length === cnt
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {cnt} Groups
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleAddGroup}
                  className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Group</span>
                </button>
              </div>
            </div>

            {/* Group Badges Grid with team count */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {groupsList.map((grpName) => {
                const countInGrp = teams.filter((t) => t.group === grpName).length;
                return (
                  <div
                    key={grpName}
                    className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-white text-xs block">{grpName}</span>
                      <span className="text-[11px] text-blue-400 font-mono">
                        {countInGrp} {participantType === "TEAM" ? "Teams" : "Players"}
                      </span>
                    </div>
                    {groupsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(grpName)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-900 transition-colors"
                        title={`Remove ${grpName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {teams.length > 0 && (
              <button
                type="button"
                onClick={() => handleAutoBalanceTeams()}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1.5 mt-1 hover:underline"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Auto-distribute existing teams evenly across these groups</span>
              </button>
            )}
          </div>

          {/* Playoff Structure & Seed Editor */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Playoff Bracket Structure
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "FINAL", label: "Direct Final (Top 2)", desc: "Winner Group A vs Winner Group B" },
                { id: "SEMI_FINALS", label: "Semi-Finals & Final (Top 4)", desc: "2 Semis + Grand Final" },
                { id: "QUARTER_FINALS", label: "Quarter-Finals (Top 8)", desc: "4 Quarters + 2 Semis + Final" }
              ].map((stg) => (
                <button
                  key={stg.id}
                  type="button"
                  onClick={() => setPlayoffStage(stg.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    playoffStage === stg.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{stg.label}</span>
                    {playoffStage === stg.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400">{stg.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Points Engine */}
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

        <div className="flex flex-wrap gap-4 pt-1">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showFormGuide}
              onChange={(e) => setShowFormGuide(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
            />
            <span>Show Form Guide (Last 5: 🟢 W, 🟡 D, 🔴 L)</span>
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

      {/* Step 4: Participants Manager (Teams with Individual Players & Captains OR Solo Players) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                4
              </span>
              <span>
                {participantType === "TEAM"
                  ? `Teams & Player Rosters (${teams.length} Teams)`
                  : `Individual Players / Participants (${teams.length} Players)`}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {participantType === "TEAM"
                ? "Add teams, then add individual players and assign captains."
                : "Add individual players competing directly in this tournament."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTeamInputMode(teamInputMode === "bulk" ? "list" : "bulk")}
            className="text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>
              {teamInputMode === "bulk"
                ? "Form Mode"
                : participantType === "TEAM"
                ? "Paste Teams & Rosters"
                : "Paste Players List"}
            </span>
          </button>
        </div>

        {teamInputMode === "bulk" ? (
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              {participantType === "TEAM"
                ? "Paste teams (one per line). Format: Team Name - Player 1 (C), Player 2 (VC), Player 3:"
                : "Paste player names (one per line):"}
            </label>
            <textarea
              rows={6}
              value={bulkText}
              onChange={(e) => handleBulkTextChange(e.target.value)}
              placeholder={
                participantType === "TEAM"
                  ? "St. Joseph FC - Mark (C), John (VC), Peter, Luke&#10;Holy Cross SC - Alex (C), Sam, Kevin&#10;Parish Youth Stars - David (C), Brian, Tom"
                  : "John Mark&#10;Kevin Fernandes&#10;Peter D'Souza&#10;David Paul"
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
            ></textarea>
            <p className="text-[10px] text-slate-500 mt-1">
              {teams.length} {participantType === "TEAM" ? "teams" : "players"} detected.
            </p>
          </div>
        ) : participantType === "INDIVIDUAL" ? (
          /* =========================================================================
             INDIVIDUAL / SINGLES MODE
             ========================================================================= */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row gap-2">
              <select
                value={newSoloAvatar}
                onChange={(e) => setNewSoloAvatar(e.target.value)}
                className="w-14 bg-slate-900 border border-slate-700 rounded-xl p-2 text-base text-center text-white focus:outline-none"
              >
                {["👤", "🏃", "🥇", "⚡", "🛡️", "🔥", "🌟", "👑", "🎯"].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Player Full Name (e.g. John D'Souza)"
                value={newSoloName}
                onChange={(e) => setNewSoloName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddIndividual();
                  }
                }}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
              />

              <button
                type="button"
                onClick={handleAddIndividual}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Player</span>
              </button>
            </div>

            {/* List of Individual Players */}
            {teams.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                No individual players added yet. Add players using the box above.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {teams.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col space-y-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveTeamUp(idx)}
                          disabled={idx === 0}
                          className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTeamDown(idx)}
                          disabled={idx === teams.length - 1}
                          className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xl">{t.logo}</span>
                      <span className="font-bold text-white">{t.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Seed #{t.seed}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {format === "GROUP_KNOCKOUT" && (
                        <div className="flex items-center space-x-1.5">
                          <label className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">Group:</label>
                          <select
                            value={t.group || groupsList[0]}
                            onChange={(e) => handleUpdateTeamGroup(idx, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-blue-400 font-bold text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-blue-400"
                          >
                            {groupsList.map((grp) => (
                              <option key={grp} value={grp}>
                                {grp}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveTeam(idx)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             TEAM MODE (Teams + Individual Players & Captains)
             ========================================================================= */
          <div className="space-y-5">
            {/* 1. Add Team Row */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">
                + Create New Team
              </span>
              <div className="flex gap-2">
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
                  placeholder="Team Name (e.g. St. Jude Strikers, Red Dragons)"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTeam();
                    }
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
                />

                <button
                  type="button"
                  onClick={handleAddTeam}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Team</span>
                </button>
              </div>
            </div>

            {/* 2. Team Cards with Structured Roster & Captain Manager */}
            {teams.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                No teams added yet. Create your first team above, then add players and assign
                captains.
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map((team, tIdx) => {
                  const players = team.players || [];
                  const captain = players.find((p) => p.role === "CAPTAIN");

                  return (
                    <div
                      key={tIdx}
                      className="rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-lg"
                    >
                      {/* Team Header Bar */}
                      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-3 min-w-0">
                          {/* Seed order controls */}
                          <div className="flex flex-col space-y-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveTeamUp(tIdx)}
                              disabled={tIdx === 0}
                              className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveTeamDown(tIdx)}
                              disabled={tIdx === teams.length - 1}
                              className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-2xl flex-shrink-0">{team.logo}</span>

                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-white text-sm">
                                {team.name}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                                Seed #{team.seed}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {captain ? (
                                <span className="text-amber-400 font-medium flex items-center space-x-1">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>Captain: {captain.name}</span>
                                </span>
                              ) : (
                                <span className="text-slate-500">No captain assigned</span>
                              )}{" "}
                              • {players.length} {players.length === 1 ? "Player" : "Players"}
                            </span>
                          </div>
                        </div>

                        {/* Group Selection & Delete Team */}
                        <div className="flex items-center space-x-2">
                          {format === "GROUP_KNOCKOUT" && (
                            <div className="flex items-center space-x-1.5">
                              <label className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">Group:</label>
                              <select
                                value={team.group || groupsList[0]}
                                onChange={(e) => handleUpdateTeamGroup(tIdx, e.target.value)}
                                className="bg-slate-900 border border-slate-700 text-blue-400 font-bold text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-blue-400"
                              >
                                {groupsList.map((grp) => (
                                  <option key={grp} value={grp}>
                                    {grp}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveTeam(tIdx)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                            title="Remove Team"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Roster & Individual Player Builder */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-300 uppercase tracking-wider">
                            Squad Roster ({players.length})
                          </span>
                          <span className="text-slate-500">
                            Click ⭐ to designate Captain or VC
                          </span>
                        </div>

                        {/* Player Pills Grid */}
                        {players.length === 0 ? (
                          <p className="text-slate-500 text-xs italic py-1">
                            No players added to {team.name} yet. Add players below.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {players.map((p) => {
                              const isCapt = p.role === "CAPTAIN";
                              const isVC = p.role === "VICE_CAPTAIN";

                              return (
                                <div
                                  key={p.id}
                                  className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 text-xs transition-all ${
                                    isCapt
                                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-sm shadow-amber-500/10"
                                      : isVC
                                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-semibold"
                                      : "bg-slate-900 border-slate-800 text-slate-200"
                                  }`}
                                >
                                  {isCapt ? (
                                    <span
                                      className="flex items-center space-x-1 text-amber-400"
                                      title="Team Captain"
                                    >
                                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                      <span className="text-[10px] uppercase font-mono font-black">
                                        (C)
                                      </span>
                                    </span>
                                  ) : isVC ? (
                                    <span
                                      className="text-cyan-400 text-[10px] uppercase font-mono font-bold"
                                      title="Vice-Captain"
                                    >
                                      (VC)
                                    </span>
                                  ) : null}

                                  <span>{p.name}</span>

                                  {/* Quick Actions */}
                                  <div className="flex items-center space-x-1 ml-1 border-l border-slate-700/60 pl-1.5">
                                    {!isCapt && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetCaptain(tIdx, p.id)}
                                        className="text-slate-500 hover:text-amber-400 transition-colors p-0.5"
                                        title="Make Captain"
                                      >
                                        <Star className="w-3 h-3" />
                                      </button>
                                    )}
                                    {!isVC && !isCapt && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetViceCaptain(tIdx, p.id)}
                                        className="text-slate-500 hover:text-cyan-400 text-[10px] font-mono font-bold px-1"
                                        title="Make Vice-Captain"
                                      >
                                        VC
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePlayerFromTeam(tIdx, p.id)}
                                      className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
                                      title="Remove from squad"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add Player Input Row for this Team */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder={`Add player to ${team.name}...`}
                            value={selectedTeamIndex === tIdx ? newPlayerName : ""}
                            onFocus={() => setSelectedTeamIndex(tIdx)}
                            onChange={(e) => {
                              setSelectedTeamIndex(tIdx);
                              setNewPlayerName(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddPlayerToTeam(tIdx);
                              }
                            }}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
                          />

                          <div className="flex space-x-1.5">
                            <select
                              value={selectedTeamIndex === tIdx ? newPlayerRole : "PLAYER"}
                              onChange={(e) => {
                                setSelectedTeamIndex(tIdx);
                                setNewPlayerRole(e.target.value);
                              }}
                              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                            >
                              <option value="PLAYER">Player</option>
                              <option value="CAPTAIN">⭐ Captain (C)</option>
                              <option value="VICE_CAPTAIN">Vice-Captain (VC)</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleAddPlayerToTeam(tIdx)}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
              : `Create ${activeSportName} Tournament (${teams.length} ${
                  participantType === "TEAM" ? "Teams" : "Players"
                })`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
