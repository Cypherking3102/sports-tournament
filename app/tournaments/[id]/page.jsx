"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Trophy,
  Calendar,
  MapPin,
  TrendingUp,
  BookOpen,
  CalendarDays,
  Shield,
  ArrowLeft,
  Flame,
  Layers,
  Plus,
  Settings,
  Users,
  Award,
  BarChart3,
  Target,
  Trash2,
  AlertTriangle
} from "lucide-react";

import BracketTree from "@/components/BracketTree";
import PointsTable from "@/components/PointsTable";
import GroupStageView from "@/components/GroupStageView";
import MatchSchedule from "@/components/MatchSchedule";
import RulesViewer from "@/components/RulesViewer";
import ScoreModal from "@/components/ScoreModal";
import AddMatchModal from "@/components/AddMatchModal";
import TournamentEditModal from "@/components/TournamentEditModal";
import {
  calculateTournamentStats,
  calculateStandings,
  calculateGroupStandings
} from "@/lib/tournamentEngine";
import {
  getClientTournamentById,
  saveClientTournament,
  removeClientTournament,
  syncTournamentsToServer
} from "@/lib/clientStorage";

export default function TournamentDetailPage({ params }) {
  const routeParams = useParams();
  const rawId = routeParams?.id || params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : (typeof rawId === "string" ? rawId : "");

  const [tournament, setTournament] = useState(null);
  const [activeTab, setActiveTab] = useState("groups");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const resolvedTab = useMemo(() => {
    if (!tournament) return activeTab;
    if (tournament.format === "ROUND_ROBIN" && activeTab === "groups") {
      return "standings";
    }
    if (tournament.format === "KNOCKOUT" && (activeTab === "groups" || activeTab === "standings")) {
      return "brackets";
    }
    return activeTab;
  }, [tournament, activeTab]);

  const handleDeleteTournament = async () => {
    setIsDeleting(true);
    try {
      removeClientTournament(id);
      await fetch(`/api/tournaments/${id}`, {
        method: "DELETE"
      });
      syncTournamentsToServer();
      window.location.href = "/";
    } catch (err) {
      removeClientTournament(id);
      syncTournamentsToServer();
      window.location.href = "/";
    }
  };

  useEffect(() => {
    fetchTournament();
    const token = localStorage.getItem("sports_admin_token");
    if (token) setIsAdmin(true);

    const handleStorageChange = () => {
      setIsAdmin(!!localStorage.getItem("sports_admin_token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [id]);

  const fetchTournament = async () => {
    if (!id) return;
    // 1. Instant optimistic load from client persistent storage
    const localData = getClientTournamentById(id);
    if (localData) {
      if (localData.format === "GROUP_KNOCKOUT" && !localData.groupStandings) {
        localData.groupStandings = calculateGroupStandings(
          localData.groups || [],
          localData.matches || [],
          localData.pointsConfig,
          localData.teams || []
        );
      } else if (localData.format === "ROUND_ROBIN" && !localData.standings) {
        localData.standings = calculateStandings(
          localData.teams || [],
          localData.matches || [],
          localData.pointsConfig
        );
      }
      setTournament(localData);
      if (localData.format === "ROUND_ROBIN") {
        setActiveTab("standings");
      } else if (localData.format === "KNOCKOUT") {
        setActiveTab("brackets");
      } else {
        setActiveTab("groups");
      }
      setLoading(false);
    }

    try {
      const res = await fetch(`/api/tournaments/${id}`);
      if (res.ok) {
        const data = await res.json();
        saveClientTournament(data);
        setTournament(data);

        if (data.format === "GROUP_KNOCKOUT") {
          setActiveTab("groups");
        } else if (data.format === "ROUND_ROBIN") {
          setActiveTab("standings");
        } else {
          setActiveTab("brackets");
        }
      } else if (localData) {
        // Re-sync local tournament to serverless container if cold start
        syncTournamentsToServer([localData]);
      } else {
        throw new Error("Failed to load tournament");
      }
    } catch (err) {
      if (!localData) {
        console.error(err);
        setTournament(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSaved = (updatedTourney) => {
    saveClientTournament(updatedTourney);
    setTournament(updatedTourney);
  };

  const handleTournamentUpdated = (updatedTourney) => {
    saveClientTournament(updatedTourney);
    setTournament(updatedTourney);
  };

  const handleAddRule = async (newRule) => {
    if (!tournament) return;
    const updatedRules = [...(tournament.rules || []), newRule];
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: updatedRules })
      });
      if (res.ok) {
        setTournament({ ...tournament, rules: updatedRules });
      }
    } catch {
      alert("Failed to save new rule");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-slate-400 text-sm font-medium">Loading tournament fixtures...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Tournament Not Found</h2>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tournaments</span>
        </Link>
      </div>
    );
  }

  const liveMatches = tournament.matches?.filter((m) => m.status === "LIVE").length || 0;
  const stats = calculateTournamentStats(tournament);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
      {/* Top Breadcrumb & Admin Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Tournaments</span>
        </Link>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Mode</span>
            </span>

            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-slate-700 transition-all shadow-sm"
              title="Edit tournament settings, points engine, rules & teams"
            >
              <Settings className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Tournament & Rules</span>
            </button>

            <button
              onClick={() => setShowAddMatch(true)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-all shadow-md shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Match</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3.5 py-1.5 rounded-full transition-all shadow-sm"
              title="Permanently delete this tournament"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete Tournament</span>
            </button>
          </div>
        )}
      </div>

      {/* Tournament Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="relative h-56 sm:h-64 w-full bg-slate-800">
          <img
            src={tournament.bannerUrl}
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent"></div>

          {/* Badges on banner */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-slate-700 text-xs font-bold text-white flex items-center space-x-1.5">
                <span>{tournament.sportIcon}</span>
                <span>{tournament.sport}</span>
              </span>
              <span className="px-3.5 py-1 rounded-full bg-blue-600 text-white text-xs font-mono font-bold uppercase shadow-sm">
                {tournament.format === "GROUP_KNOCKOUT"
                  ? "Groups + Playoff Knockouts"
                  : tournament.format === "KNOCKOUT"
                  ? "Knockout Bracket"
                  : "Round Robin League"}
              </span>
              {liveMatches > 0 && (
                <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse shadow-md shadow-red-500/30">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{liveMatches} Live Now</span>
                </span>
              )}
            </div>

            <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur border border-slate-800 text-slate-300">
              {tournament.status || "LIVE"}
            </span>
          </div>

          {/* Banner bottom details */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-8 sm:right-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {tournament.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{tournament.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{tournament.startDate}</span>
              </span>
              {tournament.organizer && (
                <span className="flex items-center space-x-1 text-slate-400">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {tournament.organizer.includes("Sports Ministry")
                      ? "Divine Mercy Church"
                      : tournament.organizer}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-8 border-t border-slate-800 bg-slate-950/95 flex items-center space-x-2 sm:space-x-4 overflow-x-auto scrollbar-none">
          {tournament.format === "GROUP_KNOCKOUT" && (
            <>
              <button
                onClick={() => setActiveTab("groups")}
                className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  resolvedTab === "groups"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Group Stage</span>
              </button>

              <button
                onClick={() => setActiveTab("brackets")}
                className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  resolvedTab === "brackets"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Playoffs</span>
              </button>
            </>
          )}

          {tournament.format === "KNOCKOUT" && (
            <button
              onClick={() => setActiveTab("brackets")}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                resolvedTab === "brackets"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Brackets</span>
            </button>
          )}

          {tournament.format === "ROUND_ROBIN" && (
            <>
              <button
                onClick={() => setActiveTab("standings")}
                className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  resolvedTab === "standings"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Standings Table</span>
              </button>

              {tournament.matches?.some((m) => m.stageName?.includes("Final") || m.roundName?.includes("Final") || m.id?.includes("Final")) && (
                <button
                  onClick={() => setActiveTab("brackets")}
                  className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                    resolvedTab === "brackets"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Final Match</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={() => setActiveTab("schedule")}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              resolvedTab === "schedule"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Fixtures & Draws</span>
          </button>

          <button
            onClick={() => setActiveTab("rules")}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              resolvedTab === "rules"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Rules</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {resolvedTab === "groups" && tournament.format === "GROUP_KNOCKOUT" && (
          <GroupStageView
            tournament={tournament}
            isAdmin={isAdmin}
            onEditMatch={(m) => setSelectedMatch(m)}
            onAddMatch={() => setShowAddMatch(true)}
          />
        )}

        {resolvedTab === "brackets" && (
          <BracketTree
            tournament={tournament}
            isAdmin={isAdmin}
            onEditMatch={(m) => setSelectedMatch(m)}
            onTournamentUpdated={handleTournamentUpdated}
          />
        )}

        {resolvedTab === "standings" && (
          <PointsTable
            tournament={tournament}
            standings={tournament.standings}
            matches={tournament.matches}
            teams={tournament.teams}
            scoreUnit={tournament.scoreUnit}
            pointsConfig={tournament.pointsConfig}
            participantType={tournament.participantType}
            isAdmin={isAdmin}
            onEditMatch={(m) => setSelectedMatch(m)}
            onAddMatch={() => setShowAddMatch(true)}
          />
        )}

        {resolvedTab === "schedule" && (
          <MatchSchedule
            tournament={tournament}
            isAdmin={isAdmin}
            onEditMatch={(m) => setSelectedMatch(m)}
            onAddMatch={() => setShowAddMatch(true)}
          />
        )}

        {resolvedTab === "rules" && (
          <RulesViewer
            tournament={tournament}
            isAdmin={isAdmin}
            onAddRule={handleAddRule}
          />
        )}
      </div>

      {/* Edit Match & Scorekeeper Modal */}
      {selectedMatch && (
        <ScoreModal
          match={selectedMatch}
          tournament={tournament}
          onClose={() => setSelectedMatch(null)}
          onSave={handleMatchSaved}
        />
      )}

      {/* Add Match Manually Modal */}
      {showAddMatch && (
        <AddMatchModal
          tournament={tournament}
          onClose={() => setShowAddMatch(false)}
          onMatchAdded={handleMatchSaved}
        />
      )}

      {/* Detailed Tournament Settings & Edit Modal */}
      {showEditModal && (
        <TournamentEditModal
          tournament={tournament}
          onClose={() => setShowEditModal(false)}
          onUpdated={handleTournamentUpdated}
        />
      )}

      {/* Delete Tournament Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-white">Delete Tournament</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete <span className="text-white font-bold">{tournament?.title}</span>? All fixture schedules, group standings, and match results will be removed.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTournament}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-red-600/30 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Deleting..." : "Yes, Delete Tournament"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
