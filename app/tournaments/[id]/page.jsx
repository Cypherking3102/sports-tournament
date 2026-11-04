"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
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
  Target
} from "lucide-react";

import BracketTree from "@/components/BracketTree";
import PointsTable from "@/components/PointsTable";
import GroupStageView from "@/components/GroupStageView";
import MatchSchedule from "@/components/MatchSchedule";
import RulesViewer from "@/components/RulesViewer";
import ScoreModal from "@/components/ScoreModal";
import AddMatchModal from "@/components/AddMatchModal";
import TournamentEditModal from "@/components/TournamentEditModal";
import { calculateTournamentStats } from "@/lib/tournamentEngine";

export default function TournamentDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [tournament, setTournament] = useState(null);
  const [activeTab, setActiveTab] = useState("groups");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
    try {
      setLoading(true);
      const res = await fetch(`/api/tournaments/${id}`);
      if (!res.ok) throw new Error("Failed to load tournament");
      const data = await res.json();
      setTournament(data);

      if (data.format === "GROUP_KNOCKOUT") {
        setActiveTab("groups");
      } else if (data.format === "ROUND_ROBIN") {
        setActiveTab("standings");
      } else {
        setActiveTab("brackets");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSaved = (updatedTourney) => {
    setTournament(updatedTourney);
  };

  const handleTournamentUpdated = (updatedTourney) => {
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
                  <span>{tournament.organizer}</span>
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
                  activeTab === "groups"
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
                  activeTab === "brackets"
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
                activeTab === "brackets"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Brackets</span>
            </button>
          )}

          {tournament.format === "ROUND_ROBIN" && (
            <button
              onClick={() => setActiveTab("standings")}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === "standings"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Standings Table</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("schedule")}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "schedule"
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
              activeTab === "rules"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Rules</span>
          </button>
        </div>
      </div>

      {/* Enterprise Stats Bar (Sofascore / UEFA style overview KPI cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono block">
              Teams
            </span>
            <span className="text-xl font-black text-white font-mono">{stats.totalTeams}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono block">
              Matches
            </span>
            <span className="text-xl font-black text-white font-mono">
              {stats.completedMatches} / {stats.totalMatches}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono block">
              Total {tournament.scoreUnit || "Goals"}
            </span>
            <span className="text-xl font-black text-white font-mono">{stats.totalGoals}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono block">
              Avg / Match
            </span>
            <span className="text-xl font-black text-white font-mono">{stats.avgGoals}</span>
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "groups" && tournament.format === "GROUP_KNOCKOUT" && (
          <GroupStageView
            tournament={tournament}
            isAdmin={isAdmin}
            onEditMatch={(m) => setSelectedMatch(m)}
          />
        )}

        {activeTab === "brackets" && (
          <BracketTree
            tournament={tournament}
            isAdmin={isAdmin}
            onEditMatch={(m) => setSelectedMatch(m)}
          />
        )}

        {activeTab === "standings" && (
          <PointsTable
            standings={tournament.standings}
            scoreUnit={tournament.scoreUnit}
            pointsConfig={tournament.pointsConfig}
          />
        )}

        {activeTab === "schedule" && (
          <MatchSchedule
            tournament={tournament}
            isAdmin={isAdmin}
            onEditMatch={(m) => setSelectedMatch(m)}
            onAddMatch={() => setShowAddMatch(true)}
          />
        )}

        {activeTab === "rules" && (
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
    </div>
  );
}
