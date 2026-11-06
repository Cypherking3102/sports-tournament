"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Flame,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  PlusCircle,
  Search,
  Award,
  Trash2,
  AlertTriangle
} from "lucide-react";
import {
  getClientTournaments,
  mergeTournaments,
  syncTournamentsToServer,
  removeClientTournament,
  clearClientTournaments
} from "@/lib/clientStorage";

export default function HomePage() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedSport, setSelectedSport] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTournament = async () => {
    if (!tournamentToDelete) return;
    setIsDeleting(true);
    try {
      removeClientTournament(tournamentToDelete.id);
      await fetch(`/api/tournaments/${tournamentToDelete.id}`, {
        method: "DELETE"
      });
      syncTournamentsToServer();
      setTournaments((prev) => prev.filter((t) => t.id !== tournamentToDelete.id));
      setTournamentToDelete(null);
    } catch (err) {
      removeClientTournament(tournamentToDelete.id);
      syncTournamentsToServer();
      setTournaments((prev) => prev.filter((t) => t.id !== tournamentToDelete.id));
      setTournamentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
    const token = localStorage.getItem("sports_admin_token");
    if (token) setIsAdmin(true);

    const handleStorageChange = () => {
      setIsAdmin(!!localStorage.getItem("sports_admin_token"));
      fetchTournaments();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("dmc_tournaments_updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("dmc_tournaments_updated", handleStorageChange);
    };
  }, [selectedSport]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const url =
        selectedSport === "ALL"
          ? "/api/tournaments"
          : `/api/tournaments?sport=${encodeURIComponent(selectedSport)}`;
      const res = await fetch(url);
      const serverData = res.ok ? await res.json() : [];
      const safeServerData = Array.isArray(serverData) ? serverData : [];

      // Merge server tournaments with client tournaments (ensures custom tournaments never vanish)
      let combined = mergeTournaments(safeServerData);

      if (selectedSport !== "ALL") {
        combined = combined.filter(
          (t) => t.sport?.toLowerCase() === selectedSport.toLowerCase()
        );
      }

      setTournaments(combined);

      // Silently sync local tournaments to the server in background
      syncTournamentsToServer();
    } catch (err) {
      console.error("Error fetching tournaments:", err);
      let localList = getClientTournaments();
      if (selectedSport !== "ALL") {
        localList = localList.filter(
          (t) => t.sport?.toLowerCase() === selectedSport.toLowerCase()
        );
      }
      setTournaments(localList);
    } finally {
      setLoading(false);
    }
  };

  const sportsList = ["ALL", "Carrom", "Chess", "Table Tennis", "Cricket", "Throwball"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-6">
      {/* Compact & Clean Announcement Bar / Mini Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Divine Mercy Parish • Saturday 7th November 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Parish Sports Day & <span className="text-blue-400">Live Fixtures</span>
          </h1>
        </div>

        {/* Quick Action Button: Find Your Match */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <Link
            href="/schedule"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            <Calendar className="w-4 h-4" />
            <span>Find Your Match</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin/new"
              className="inline-flex items-center space-x-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create</span>
            </Link>
          )}
        </div>
      </div>

      {/* Sport Category Filter Chips */}
      <div id="active-tournaments" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-blue-400" />
            <span>Active Tournaments</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {tournaments.length} {tournaments.length === 1 ? "Tournament" : "Tournaments"}
          </span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {sportsList.map((sp) => (
            <button
              key={sp}
              onClick={() => setSelectedSport(sp)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedSport === sp
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {sp === "ALL" ? "All Sports" : sp}
            </button>
          ))}
        </div>
      </div>

      {/* Tournament Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse"
            ></div>
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-bold text-sm">No tournaments found</p>
          <p className="text-slate-500 text-xs">
            {isAdmin ? "Create your first tournament using the admin wizard." : "Please check back later for upcoming fixtures."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tournaments.map((t) => {
            const liveMatches = t.matches?.filter((m) => m.status === "LIVE").length || 0;
            const isIndividual = t.participantType === "INDIVIDUAL" || t.teams?.length > 0;
            return (
              <div
                key={t.id}
                className="group relative flex flex-col rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden hover:border-slate-700 hover:shadow-2xl transition-all"
              >
                {/* Banner Thumbnail */}
                <Link href={`/tournaments/${t.id}`} className="block relative h-40 w-full bg-slate-800 overflow-hidden cursor-pointer">
                  <img
                    src={t.bannerUrl}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

                  {/* Badges on top */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-xs font-bold text-white shadow">
                      {t.sport}
                    </span>

                    <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      {liveMatches > 0 ? (
                        <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse shadow-md shadow-red-500/30">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{liveMatches} LIVE</span>
                        </span>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            t.status === "LIVE"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-800/80 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {t.status}
                        </span>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTournamentToDelete(t);
                          }}
                          className="p-1.5 rounded-full bg-red-950/80 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white transition-all shadow-md"
                          title="Delete tournament"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Format tag bottom left */}
                  <div className="absolute bottom-3 left-4">
                    <span className="text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-md bg-blue-600 text-white">
                      {t.format === "GROUP_KNOCKOUT"
                        ? "Group Stage + Knockout"
                        : t.format === "KNOCKOUT"
                        ? "Knockout Bracket"
                        : "Round Robin Table"}
                    </span>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div>
                    <Link href={`/tournaments/${t.id}`} className="block">
                      <h3 className="font-extrabold text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">
                        {t.title}
                      </h3>
                    </Link>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {/* Details stats */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t.teams?.length || 0} Players</span>
                      </span>
                      <span className="font-mono text-slate-500">
                        {t.matches?.length || 0} Matches
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{t.location}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.startDate}</span>
                    </div>
                  </div>

                  {/* Action Link & Admin Delete */}
                  <div className="flex items-center space-x-2 mt-1">
                    <Link
                      href={`/tournaments/${t.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition-all group-hover:shadow-md group-hover:shadow-blue-500/20"
                    >
                      <span>View Tables & Fixtures</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setTournamentToDelete(t);
                        }}
                        className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 font-bold text-xs flex items-center justify-center transition-all"
                        title="Delete Tournament"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Tournament Confirmation Modal */}
      {tournamentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-white">Delete Tournament</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete <span className="text-white font-bold">{tournamentToDelete.title}</span>? All match fixtures, team rosters, and standings will be removed.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setTournamentToDelete(null)}
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
