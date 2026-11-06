"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Settings,
  Shield,
  Trophy,
  Save,
  Trash2,
  Plus,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Users,
  User,
  Check,
  Calendar,
  MapPin,
  Flame,
  Layers,
  Star,
  UserPlus
} from "lucide-react";
import { normalizePlayers, formatRosterString } from "@/lib/tournamentEngine";
import { saveClientTournament, removeClientTournament } from "@/lib/clientStorage";

export default function TournamentEditModal({ tournament, onClose, onUpdated }) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("teams"); // Start on teams/rosters for fast access
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Participant Type: "TEAM" or "INDIVIDUAL"
  const [participantType, setParticipantType] = useState(
    tournament.participantType || "TEAM"
  );

  // General details
  const [title, setTitle] = useState(tournament.title || "");
  const [sport, setSport] = useState(tournament.sport || "Football");
  const [sportIcon, setSportIcon] = useState(tournament.sportIcon || "");
  const [status, setStatus] = useState(tournament.status || "UPCOMING");
  const [location, setLocation] = useState(tournament.location || "");
  const [startDate, setStartDate] = useState(tournament.startDate || "");
  const [scoreUnit, setScoreUnit] = useState(tournament.scoreUnit || "Goals");
  const [bannerUrl, setBannerUrl] = useState(
    tournament.bannerUrl ||
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80"
  );
  const [organizer, setOrganizer] = useState(
    tournament.organizer || "Divine Mercy Church"
  );
  const [description, setDescription] = useState(tournament.description || "");

  // Dynamic Multi-Group Management
  const [groups, setGroups] = useState(
    tournament.groups && tournament.groups.length > 0
      ? tournament.groups
      : [
          { id: "grp-a", name: "Group A", teams: [] },
          { id: "grp-b", name: "Group B", teams: [] }
        ]
  );
  const [newTeamGroup, setNewTeamGroup] = useState(
    tournament.groups?.[0]?.id || "grp-a"
  );

  // Playoff Matches for bracket & seed customization
  const [playoffMatches, setPlayoffMatches] = useState(
    (tournament.matches || []).filter(
      (m) =>
        m.groupId === "PLAYOFFS" ||
        m.stageName?.includes("Playoff") ||
        m.stageName?.includes("Final") ||
        m.stageName?.includes("Semi") ||
        m.stageName?.includes("Quarter")
    )
  );

  // Group helpers
  const handleAddGroup = () => {
    const nextLetter = String.fromCharCode(65 + groups.length);
    const newGrp = {
      id: `grp-${String.fromCharCode(97 + groups.length)}`,
      name: `Group ${nextLetter}`,
      teams: []
    };
    setGroups([...groups, newGrp]);
  };

  const handleRemoveGroup = (groupId) => {
    if (groups.length <= 1) return;
    const remaining = groups.filter((g) => g.id !== groupId);
    setGroups(remaining);
    const fallbackId = remaining[0].id;
    setTeams(
      teams.map((t) => (t.groupId === groupId ? { ...t, groupId: fallbackId } : t))
    );
  };

  const handleAutoBalanceTeams = () => {
    if (!groups.length || !teams.length) return;
    setTeams(
      teams.map((t, idx) => ({
        ...t,
        groupId: groups[idx % groups.length].id
      }))
    );
  };

  const handleUpdatePlayoffMatch = (matchId, field, value) => {
    setPlayoffMatches(
      playoffMatches.map((m) => (m.id === matchId ? { ...m, [field]: value } : m))
    );
  };

  // Points & Scoring Engine
  const [winPoints, setWinPoints] = useState(tournament.pointsConfig?.win ?? 3);
  const [drawPoints, setDrawPoints] = useState(tournament.pointsConfig?.draw ?? 1);
  const [lossPoints, setLossPoints] = useState(tournament.pointsConfig?.loss ?? 0);
  const [showForm, setShowForm] = useState(tournament.pointsConfig?.showForm ?? true);
  const [showGoalDiff, setShowGoalDiff] = useState(tournament.pointsConfig?.showGoalDiff ?? true);
  const [customPointRules, setCustomPointRules] = useState(
    tournament.pointsConfig?.customRules || []
  );
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleValue, setNewRuleValue] = useState("");

  // Participants & Teams with structured rosters
  const [teams, setTeams] = useState(
    (tournament.teams || []).map((t) => ({
      ...t,
      groupId: t.groupId || tournament.groups?.[0]?.id || "grp-a",
      players: normalizePlayers(t.players)
    }))
  );

  // Inputs for adding a new team
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState("");

  // Inputs for adding an individual player to a specific team
  const [activeAddTeamId, setActiveAddTeamId] = useState(null);
  const [teamPlayerName, setTeamPlayerName] = useState("");
  const [teamPlayerRole, setTeamPlayerRole] = useState("PLAYER");

  // Inputs for adding an individual participant (solo sport)
  const [newSoloName, setNewSoloName] = useState("");
  const [newSoloAvatar, setNewSoloAvatar] = useState("");

  // Rules list
  const [rules, setRules] = useState(tournament.rules || []);
  const [newHandbookTitle, setNewHandbookTitle] = useState("");
  const [newHandbookCategory, setNewHandbookCategory] = useState("Match Rules");
  const [newHandbookContent, setNewHandbookContent] = useState("");

  const bannerPresets = [
    { label: "Football Field", url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80" },
    { label: "Indoor Arena", url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80" },
    { label: "Turf Night", url: "https://images.unsplash.com/photo-1529900245584-882ca8882835?auto=format&fit=crop&w=1200&q=80" },
    { label: "Community Court", url: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=1200&q=80" }
  ];

  // Custom point rules
  const handleAddCustomPointRule = () => {
    if (!newRuleTitle.trim()) return;
    setCustomPointRules([
      ...customPointRules,
      { id: `cpr-${Date.now()}`, title: newRuleTitle.trim(), value: newRuleValue.trim() || "+1 pt" }
    ]);
    setNewRuleTitle("");
    setNewRuleValue("");
  };

  const handleRemoveCustomPointRule = (id) => {
    setCustomPointRules(customPointRules.filter((r) => r.id !== id));
  };

  // Add new team
  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeamObj = {
      id: `tm-${Date.now()}`,
      name: newTeamName.trim(),
      shortName: newTeamName.trim().substring(0, 3).toUpperCase(),
      logo: "",
      players: [],
      seed: teams.length + 1,
      groupId: newTeamGroup || groups[0]?.id || "grp-a"
    };
    setTeams([...teams, newTeamObj]);
    setNewTeamName("");
  };

  // Add individual participant (solo mode)
  const handleAddSoloParticipant = () => {
    if (!newSoloName.trim()) return;
    const newSoloObj = {
      id: `tm-${Date.now()}`,
      name: newSoloName.trim(),
      shortName: newSoloName.trim().substring(0, 3).toUpperCase(),
      logo: "",
      players: [],
      seed: teams.length + 1,
      groupId: groups[0]?.id || "grp-a"
    };
    setTeams([...teams, newSoloObj]);
    setNewSoloName("");
  };

  // Add individual player to a specific team
  const handleAddPlayerToTeam = (teamId) => {
    if (!teamPlayerName.trim()) return;
    setTeams(
      teams.map((t) => {
        if (t.id !== teamId) return t;

        const currentPlayers = t.players || [];
        let role = teamPlayerRole;

        // Auto make captain if first player
        if (currentPlayers.length === 0) {
          role = "CAPTAIN";
        } else if (role === "CAPTAIN") {
          // Demote any existing captain
          currentPlayers.forEach((p) => {
            if (p.role === "CAPTAIN") p.role = "PLAYER";
          });
        }

        const newP = {
          id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
          name: teamPlayerName.trim(),
          role
        };

        return {
          ...t,
          players: [...currentPlayers, newP]
        };
      })
    );
    setTeamPlayerName("");
    setTeamPlayerRole("PLAYER");
  };

  // Designate Captain on a team
  const handleSetTeamCaptain = (teamId, playerId) => {
    setTeams(
      teams.map((t) => {
        if (t.id !== teamId) return t;
        const updatedPlayers = (t.players || []).map((p) => ({
          ...p,
          role: p.id === playerId ? "CAPTAIN" : p.role === "CAPTAIN" ? "PLAYER" : p.role
        }));
        return { ...t, players: updatedPlayers };
      })
    );
  };

  // Designate Vice-Captain on a team
  const handleSetTeamViceCaptain = (teamId, playerId) => {
    setTeams(
      teams.map((t) => {
        if (t.id !== teamId) return t;
        const updatedPlayers = (t.players || []).map((p) => ({
          ...p,
          role: p.id === playerId ? "VICE_CAPTAIN" : p.role === "VICE_CAPTAIN" ? "PLAYER" : p.role
        }));
        return { ...t, players: updatedPlayers };
      })
    );
  };

  // Remove player from team
  const handleRemovePlayerFromTeam = (teamId, playerId) => {
    setTeams(
      teams.map((t) => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          players: (t.players || []).filter((p) => p.id !== playerId)
        };
      })
    );
  };

  const handleUpdateTeam = (id, field, value) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleRemoveTeam = (id) => {
    if (confirm("Are you sure you want to remove this participant?")) {
      setTeams(teams.filter((t) => t.id !== id));
    }
  };

  // Handbook rules
  const handleAddHandbookRule = () => {
    if (!newHandbookTitle.trim() || !newHandbookContent.trim()) return;
    setRules([
      ...rules,
      {
        id: `r-${Date.now()}`,
        title: newHandbookTitle.trim(),
        category: newHandbookCategory.trim() || "General",
        content: newHandbookContent.trim()
      }
    ]);
    setNewHandbookTitle("");
    setNewHandbookContent("");
  };

  const handleRemoveHandbookRule = (id) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  // Save all changes
  const handleSaveAll = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const updatedPointsConfig = {
      win: Number(winPoints),
      draw: Number(drawPoints),
      loss: Number(lossPoints),
      showForm,
      showGoalDiff,
      customRules: customPointRules
    };

    // Format teams with captain & player string
    const formattedTeams = teams.map((t) => {
      const playersList = Array.isArray(t.players) ? t.players : [];
      const captainObj = playersList.find((p) => p.role === "CAPTAIN");
      return {
        ...t,
        captain: captainObj ? captainObj.name : null,
        players: playersList,
        playersString: formatRosterString(playersList)
      };
    });

    let updatedGroups = tournament.groups;
    if (tournament.format === "GROUP_KNOCKOUT") {
      updatedGroups = groups.map((grp) => ({
        ...grp,
        teams: formattedTeams.filter((t) => t.groupId === grp.id)
      }));
    }

    // Merge updated playoff matches back into matches array
    const originalMatches = tournament.matches || [];
    const nonPlayoffMatches = originalMatches.filter(
      (m) =>
        m.groupId !== "PLAYOFFS" &&
        !m.stageName?.includes("Playoff") &&
        !m.stageName?.includes("Final") &&
        !m.stageName?.includes("Semi") &&
        !m.stageName?.includes("Quarter")
    );
    const updatedMatches = [...nonPlayoffMatches, ...playoffMatches];

    const payload = {
      title,
      sport,
      sportIcon,
      status,
      location,
      startDate,
      scoreUnit,
      participantType,
      bannerUrl,
      organizer: organizer || "Divine Mercy Church",
      description,
      pointsConfig: updatedPointsConfig,
      teams: formattedTeams,
      groups: updatedGroups,
      matches: updatedMatches,
      rules
    };

    const locallyUpdated = {
      ...tournament,
      ...payload,
      updatedAt: new Date().toISOString()
    };
    saveClientTournament(locallyUpdated);
    if (onUpdated) onUpdated(locallyUpdated);

    try {
      const res = await fetch(`/api/tournaments/${tournament.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        saveClientTournament(updated);
        if (onUpdated) onUpdated(updated);
      }
      setSuccessMsg("Tournament settings & rosters updated successfully!");
      setTimeout(() => {
        setSuccessMsg("");
      }, 2500);
    } catch (err) {
      console.warn("Server sync warning (saved locally):", err.message);
      setSuccessMsg("Changes saved successfully to your device!");
      setTimeout(() => {
        setSuccessMsg("");
      }, 2500);
    } finally {
      setLoading(false);
    }
  };

  // Reset matches to 0-0
  const handleResetMatches = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all match results to 0-0? This cannot be undone."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const resetMatches = (tournament.matches || []).map((m) => ({
        ...m,
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null
      }));

      const locallyUpdated = {
        ...tournament,
        matches: resetMatches,
        updatedAt: new Date().toISOString()
      };
      saveClientTournament(locallyUpdated);
      if (onUpdated) onUpdated(locallyUpdated);

      await fetch(`/api/tournaments/${tournament.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches: resetMatches })
      });

      setSuccessMsg("All matches reset to scheduled!");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Tournament
  const handleDeleteTournament = async () => {
    if (
      !confirm(
        `Are you completely sure you want to permanently delete "${tournament.title}"? This cannot be recovered.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      removeClientTournament(tournament.id);
      await fetch(`/api/tournaments/${tournament.id}`, {
        method: "DELETE"
      });
      router.push("/");
    } catch (err) {
      removeClientTournament(tournament.id);
      router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Settings className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-white text-base">Tournament Settings & Edit</h3>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Admin Active
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">{tournament.title}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center space-x-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Bar */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab("teams")}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === "teams"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>
              {participantType === "TEAM"
                ? `Teams & Rosters (${teams.length})`
                : `Players (${teams.length})`}
            </span>
          </button>

          {tournament.format === "GROUP_KNOCKOUT" && (
            <button
              onClick={() => setActiveTab("groups")}
              className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                activeTab === "groups"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Groups & Playoff Seeds ({groups.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("points")}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === "points"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Points & Scoring Engine</span>
          </button>

          <button
            onClick={() => setActiveTab("general")}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === "general"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>General Info</span>
          </button>

          <button
            onClick={() => setActiveTab("rules")}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === "rules"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rules & Handbook</span>
          </button>

          <button
            onClick={() => setActiveTab("danger")}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === "danger"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-500 hover:text-red-400"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Danger Zone</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-6">
          {/* TAB: Teams & Individual Rosters */}
          {activeTab === "teams" && (
            <div className="space-y-5">
              {/* Participant Type Switcher */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-slate-300 font-semibold">Competition Mode:</span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setParticipantType("TEAM")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      participantType === "TEAM"
                        ? "bg-blue-600 text-white shadow"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Teams (with Squad Rosters & Captains)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipantType("INDIVIDUAL")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      participantType === "INDIVIDUAL"
                        ? "bg-emerald-600 text-white shadow"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Individual Players (Singles / 1v1)</span>
                  </button>
                </div>
              </div>

              {participantType === "INDIVIDUAL" ? (
                /* Individual Players Management */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row gap-2">
                    <select
                      value={newSoloAvatar}
                      onChange={(e) => setNewSoloAvatar(e.target.value)}
                      className="w-14 bg-slate-900 border border-slate-700 rounded-xl p-2 text-base text-center text-white focus:outline-none"
                    >
                      {["", "", "", "", "️", "", "", "", ""].map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Player Full Name..."
                      value={newSoloName}
                      onChange={(e) => setNewSoloName(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddSoloParticipant}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Player</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {teams.map((t, idx) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-slate-500 text-[10px]">#{idx + 1}</span>
                          <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">{(t.name || "P")[0]?.toUpperCase()}</span>
                          <input
                            type="text"
                            value={t.name}
                            onChange={(e) => handleUpdateTeam(t.id, "name", e.target.value)}
                            className="bg-transparent border-0 border-b border-slate-700 focus:border-blue-400 font-bold text-white text-xs px-1 py-0.5 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          {tournament.format === "GROUP_KNOCKOUT" && (
                            <select
                              value={t.groupId || groups[0]?.id}
                              onChange={(e) => handleUpdateTeam(t.id, "groupId", e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-blue-400 font-bold text-xs rounded-xl px-2 py-1 focus:outline-none"
                            >
                              {groups.map((grp) => (
                                <option key={grp.id} value={grp.id}>
                                  {grp.name}
                                </option>
                              ))}
                            </select>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveTeam(t.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Team & Squad Rosters Management */
                <div className="space-y-5">
                  {/* Create New Team */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Plus className="w-4 h-4 text-blue-400" />
                      <span>Add New Team</span>
                    </span>
                    <div className="flex gap-2">
                      <select
                        value={newTeamLogo}
                        onChange={(e) => setNewTeamLogo(e.target.value)}
                        className="w-14 bg-slate-900 border border-slate-700 rounded-xl p-2 text-base text-center text-white focus:outline-none"
                      >
                        {["️", "", "", "", "", "️", "", "", "", "", "", ""].map(
                          (l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          )
                        )}
                      </select>
                      <input
                        type="text"
                        placeholder="Team Name (e.g. Thunderbolts FC)"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
                      />
                      {tournament.format === "GROUP_KNOCKOUT" && (
                        <select
                          value={newTeamGroup}
                          onChange={(e) => setNewTeamGroup(e.target.value)}
                          className="w-28 bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-blue-400 font-bold focus:outline-none"
                        >
                          {groups.map((grp) => (
                            <option key={grp.id} value={grp.id}>
                              {grp.name}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        type="button"
                        onClick={handleAddTeam}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Team</span>
                      </button>
                    </div>
                  </div>

                  {/* Team Cards with Individual Squad Roster Manager */}
                  <div className="space-y-4">
                    {teams.map((t, idx) => {
                      const players = t.players || [];
                      const captain = players.find((p) => p.role === "CAPTAIN");

                      return (
                        <div
                          key={t.id}
                          className="rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-lg"
                        >
                          {/* Team Details Bar */}
                          <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <span className="font-mono text-slate-500 text-[10px]">
                                #{idx + 1}
                              </span>
                              <span className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">{(t.name || "T")[0]?.toUpperCase()}</span>
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={t.name}
                                  onChange={(e) => handleUpdateTeam(t.id, "name", e.target.value)}
                                  className="bg-transparent border-0 border-b border-slate-700 focus:border-blue-400 font-extrabold text-white text-sm px-1 py-0.5 focus:outline-none max-w-[200px]"
                                />
                                <input
                                  type="text"
                                  value={t.shortName || ""}
                                  onChange={(e) =>
                                    handleUpdateTeam(t.id, "shortName", e.target.value.toUpperCase())
                                  }
                                  placeholder="CODE"
                                  maxLength={4}
                                  className="w-14 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-blue-400 text-center uppercase focus:outline-none"
                                />
                                {captain && (
                                  <span className="text-amber-400 text-[11px] font-semibold flex items-center space-x-1 ml-2">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    <span>Capt: {captain.name}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {tournament.format === "GROUP_KNOCKOUT" && (
                                <select
                                  value={t.groupId || groups[0]?.id}
                                  onChange={(e) =>
                                    handleUpdateTeam(t.id, "groupId", e.target.value)
                                  }
                                  className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-blue-400 font-bold focus:outline-none focus:border-blue-400"
                                >
                                  {groups.map((grp) => (
                                    <option key={grp.id} value={grp.id}>
                                      {grp.name}
                                    </option>
                                  ))}
                                </select>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveTeam(t.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors"
                                title="Delete Team"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Squad Roster & Individual Player Editor */}
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-300 uppercase tracking-wider">
                                Squad Roster ({players.length} Players)
                              </span>
                              <span className="text-slate-500">
                                Assign Captain (C) or Vice-Captain (VC)
                              </span>
                            </div>

                            {/* Player Badges */}
                            {players.length === 0 ? (
                              <p className="text-slate-500 text-xs italic py-1">
                                No individual players added to {t.name} yet.
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
                                          ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold"
                                          : isVC
                                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-semibold"
                                          : "bg-slate-900 border-slate-800 text-slate-200"
                                      }`}
                                    >
                                      {isCapt && (
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                      )}
                                      {isVC && (
                                        <span className="text-cyan-400 font-mono text-[10px] font-bold">
                                          VC
                                        </span>
                                      )}
                                      <span>{p.name}</span>

                                      <div className="flex items-center space-x-1 ml-1 border-l border-slate-700/60 pl-1.5">
                                        {!isCapt && (
                                          <button
                                            type="button"
                                            onClick={() => handleSetTeamCaptain(t.id, p.id)}
                                            className="text-slate-500 hover:text-amber-400 p-0.5"
                                            title="Promote to Captain"
                                          >
                                            <Star className="w-3 h-3" />
                                          </button>
                                        )}
                                        {!isVC && !isCapt && (
                                          <button
                                            type="button"
                                            onClick={() => handleSetTeamViceCaptain(t.id, p.id)}
                                            className="text-slate-500 hover:text-cyan-400 text-[10px] font-mono font-bold px-1"
                                            title="Make Vice-Captain"
                                          >
                                            VC
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleRemovePlayerFromTeam(t.id, p.id)}
                                          className="text-slate-500 hover:text-red-400 p-0.5"
                                          title="Remove Player"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Add Player Input Row for this team */}
                            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                placeholder={`Add player to ${t.name}...`}
                                value={activeAddTeamId === t.id ? teamPlayerName : ""}
                                onFocus={() => setActiveAddTeamId(t.id)}
                                onChange={(e) => {
                                  setActiveAddTeamId(t.id);
                                  setTeamPlayerName(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddPlayerToTeam(t.id);
                                  }
                                }}
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
                              />

                              <div className="flex space-x-1.5">
                                <select
                                  value={activeAddTeamId === t.id ? teamPlayerRole : "PLAYER"}
                                  onChange={(e) => {
                                    setActiveAddTeamId(t.id);
                                    setTeamPlayerRole(e.target.value);
                                  }}
                                  className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                                >
                                  <option value="PLAYER">Player</option>
                                  <option value="CAPTAIN">Captain (C)</option>
                                  <option value="VICE_CAPTAIN">Vice-Captain (VC)</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => handleAddPlayerToTeam(t.id)}
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
                </div>
              )}
            </div>
          )}

          {/* TAB: Groups & Playoff Seeds */}
          {activeTab === "groups" && (
            <div className="space-y-6">
              {/* Groups Management */}
              <div className="space-y-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h4 className="font-extrabold text-white text-sm flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span>Tournament Groups ({groups.length})</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Add as many groups as needed (Group A, B, C, D...). Move teams between groups under the Teams tab or auto-balance below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddGroup}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Group</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {groups.map((grp) => {
                    const teamsInGrp = teams.filter((t) => t.groupId === grp.id);
                    return (
                      <div
                        key={grp.id}
                        className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{grp.name}</span>
                          {groups.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveGroup(grp.id)}
                              className="text-slate-500 hover:text-red-400 p-1"
                              title={`Delete ${grp.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-blue-400 font-mono block">
                          {teamsInGrp.length} {participantType === "TEAM" ? "Teams" : "Players"}
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {teamsInGrp.length === 0 ? (
                            <span className="text-[10px] text-slate-500 italic">No teams in this group</span>
                          ) : (
                            teamsInGrp.map((t) => (
                              <span
                                key={t.id}
                                className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-slate-300"
                              >
                                {t.logo} {t.name}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {teams.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoBalanceTeams}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1.5 hover:underline"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Auto-balance teams evenly across all active groups</span>
                  </button>
                )}
              </div>

              {/* Playoff Seeds & Bracket Matchups Editor */}
              <div className="space-y-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
                <div className="border-b border-slate-800/80 pb-3">
                  <h4 className="font-extrabold text-white text-sm flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Playoff Bracket & Seed Pairings</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize the seeds and pairings for knockout playoff matches. You can edit slot descriptions (e.g. "Winner Group A") or assign a team directly.
                  </p>
                </div>

                {playoffMatches.length === 0 ? (
                  <p className="text-slate-500 text-xs italic py-2">
                    No playoff fixtures configured for this tournament.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {playoffMatches.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                          <input
                            type="text"
                            value={m.roundName || m.stageName || "Playoff Match"}
                            onChange={(e) => handleUpdatePlayoffMatch(m.id, "roundName", e.target.value)}
                            className="bg-transparent font-bold text-white text-xs border-b border-slate-700 focus:border-blue-400 focus:outline-none px-1"
                          />
                          <span className="font-mono text-slate-500 text-[11px]">{m.id}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Slot A */}
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                            <label className="text-[10px] text-blue-400 font-bold uppercase block">
                              Slot A (Seed or Team)
                            </label>
                            <input
                              type="text"
                              value={m.placeholderA || ""}
                              onChange={(e) => handleUpdatePlayoffMatch(m.id, "placeholderA", e.target.value)}
                              placeholder="e.g. Winner Group A"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-400"
                            />
                            <select
                              value={m.teamAId || ""}
                              onChange={(e) => handleUpdatePlayoffMatch(m.id, "teamAId", e.target.value || null)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                            >
                              <option value="">(Auto from result / TBD)</option>
                              {teams.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.logo} {t.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Slot B */}
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                            <label className="text-[10px] text-emerald-400 font-bold uppercase block">
                              Slot B (Seed or Team)
                            </label>
                            <input
                              type="text"
                              value={m.placeholderB || ""}
                              onChange={(e) => handleUpdatePlayoffMatch(m.id, "placeholderB", e.target.value)}
                              placeholder="e.g. Runner-up Group B"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-400"
                            />
                            <select
                              value={m.teamBId || ""}
                              onChange={(e) => handleUpdatePlayoffMatch(m.id, "teamBId", e.target.value || null)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                            >
                              <option value="">(Auto from result / TBD)</option>
                              {teams.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.logo} {t.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Schedule & Venue */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <input
                            type="text"
                            value={m.scheduledAt || ""}
                            onChange={(e) => handleUpdatePlayoffMatch(m.id, "scheduledAt", e.target.value)}
                            placeholder="Schedule (e.g. 2026-11-20 17:00)"
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-blue-400"
                          />
                          <input
                            type="text"
                            value={m.venue || ""}
                            onChange={(e) => handleUpdatePlayoffMatch(m.id, "venue", e.target.value)}
                            placeholder="Venue / Pitch"
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-blue-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: General Info */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                    Tournament Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="LIVE">Live Now</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">Sport</label>
                  <input
                    type="text"
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">Sport Icon</label>
                  <select
                    value={sportIcon}
                    onChange={(e) => setSportIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  >
                    {["", "", "", "", "", "", "", "", "", "", ""].map((em) => (
                      <option key={em} value={em}>
                        {em} Icon
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">Score Unit</label>
                  <input
                    type="text"
                    value={scoreUnit}
                    onChange={(e) => setScoreUnit(e.target.value)}
                    placeholder="Goals, Points, Runs..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                    Venue / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Banner Image URL & Presets */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                  Cover / Banner Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 py-1">Quick Presets:</span>
                  {bannerPresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setBannerUrl(p.url)}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                    Host / Organizer
                  </label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Points & Scoring Engine */}
          {activeTab === "points" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <span className="font-bold">Standings Points System:</span> Changes to points will
                instantly recalculate the leaderboard ranking for this tournament upon saving.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Points for WIN
                  </span>
                  <input
                    type="number"
                    value={winPoints}
                    onChange={(e) => setWinPoints(e.target.value)}
                    className="w-20 mx-auto text-center bg-slate-900 border border-slate-700 rounded-xl py-2 text-2xl font-mono font-extrabold text-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Points for DRAW
                  </span>
                  <input
                    type="number"
                    value={drawPoints}
                    onChange={(e) => setDrawPoints(e.target.value)}
                    className="w-20 mx-auto text-center bg-slate-900 border border-slate-700 rounded-xl py-2 text-2xl font-mono font-extrabold text-amber-400 focus:outline-none"
                  />
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                    Points for LOSS
                  </span>
                  <input
                    type="number"
                    value={lossPoints}
                    onChange={(e) => setLossPoints(e.target.value)}
                    className="w-20 mx-auto text-center bg-slate-900 border border-slate-700 rounded-xl py-2 text-2xl font-mono font-extrabold text-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-white block">Table Display Columns</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showForm}
                      onChange={(e) => setShowForm(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    <span>Show Team Form Guide (Last 5: W, D, L)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGoalDiff}
                      onChange={(e) => setShowGoalDiff(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    <span>Show Goal / Point Difference</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Custom Point Modifiers / Rules</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {customPointRules.length} active custom rules
                  </span>
                </div>

                {customPointRules.map((cr) => (
                  <div
                    key={cr.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-200">{cr.title}</span>
                      <span className="text-blue-400 font-mono font-bold ml-2">({cr.value})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomPointRule(cr.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Rule title (e.g. 4+ Goals Bonus, Clean Sheet)"
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Value (+1 pt)"
                      value={newRuleValue}
                      onChange={(e) => setNewRuleValue(e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomPointRule}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Rules & Handbook */}
          {activeTab === "rules" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-blue-400" />
                  <span>Add Rule or Regulation</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Rule Title"
                    value={newHandbookTitle}
                    onChange={(e) => setNewHandbookTitle(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Category (e.g. Conduct, Timing, Points)"
                    value={newHandbookCategory}
                    onChange={(e) => setNewHandbookCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddHandbookRule}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl px-3 py-2 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rule</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="Rule details and enforcement guidelines..."
                  value={newHandbookContent}
                  onChange={(e) => setNewHandbookContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400"
                ></textarea>
              </div>

              <div className="space-y-2">
                {rules.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{r.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {r.category}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{r.content}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveHandbookRule(r.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Danger Zone */}
          {activeTab === "danger" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Match Fixture Scores</span>
                </div>
                <p className="text-slate-400 text-xs">
                  Sets all match results back to 0-0 and reverts statuses to Scheduled.
                </p>
                <button
                  type="button"
                  onClick={handleResetMatches}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all"
                >
                  Reset Match Scores
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-red-400 font-bold text-xs">
                  <Trash2 className="w-4 h-4" />
                  <span>Permanently Delete Tournament</span>
                </div>
                <p className="text-slate-400 text-xs">
                  Permanently deletes this tournament, all teams, all match records, and standings.
                  This action cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteTournament}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Delete Entire Tournament
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Divine Mercy Parish Tournament Engine v2.0
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
