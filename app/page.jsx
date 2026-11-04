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
  RotateCcw,
  Award,
  Lock,
  ShieldCheck
} from "lucide-react";

export default function HomePage() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedSport, setSelectedSport] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchTournaments();
    const token = localStorage.getItem("sports_admin_token");
    if (token) setIsAdmin(true);

    const handleStorageChange = () => {
      setIsAdmin(!!localStorage.getItem("sports_admin_token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [selectedSport]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const url =
        selectedSport === "ALL"
          ? "/api/tournaments"
          : `/api/tournaments?sport=${encodeURIComponent(selectedSport)}`;
      const res = await fetch(url);
      const data = await res.json();
      setTournaments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm("Reset tournaments to Divine Mercy Church default data?")) return;
    try {
      await fetch("/api/tournaments/reset", { method: "POST" });
      fetchTournaments();
    } catch {
      alert("Error resetting data");
    }
  };

  const sportsList = ["ALL", "Football", "Basketball", "Cricket"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Divine Mercy Parish Sports Ministry</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Faith, Fellowship & <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">Excellence in Sports</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Welcome to the official sports and tournament portal for <strong>Divine Mercy Church</strong>.
            Follow inter-ward football group stages, round-robin youth leagues, knockout playoffs, live scorekeeping, and parish rulebooks.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* If Admin, show Create Tournament; otherwise show Schedule / Explore */}
            {isAdmin ? (
              <>
                <Link
                  href="/admin/new"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Parish Tournament</span>
                </Link>

                <button
                  onClick={handleResetData}
                  className="inline-flex items-center space-x-1.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs px-4 py-3 rounded-2xl transition-all"
                  title="Reset default parish tournaments"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Parish Demos</span>
                </button>
              </>
            ) : (
              <a
                href="#active-tournaments"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-md shadow-blue-500/20"
              >
                <span>View Tournament Brackets</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Subtle Watermark Emblem */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 pointer-events-none hidden md:flex items-center justify-center">
          <Trophy className="w-96 h-96 text-blue-400" />
        </div>
      </div>

      {/* Sport Category Filter Chips */}
      <div id="active-tournaments" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-blue-400" />
            <span>Active Parish Tournaments</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {tournaments.length} {tournaments.length === 1 ? "Tournament" : "Tournaments"}
          </span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {sportsList.map((sp) => (
            <button
              key={sp}
              onClick={() => setSelectedSport(sp)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedSport === sp
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {sp === "ALL" ? "All Parish Sports" : sp}
            </button>
          ))}
        </div>
      </div>

      {/* Tournament Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-72 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse"
            ></div>
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-bold text-base">No parish tournaments found</p>
          <p className="text-slate-500 text-xs">
            {isAdmin ? "Create your first tournament using the admin wizard." : "Please check back later for upcoming parish fixtures."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => {
            const liveMatches = t.matches?.filter((m) => m.status === "LIVE").length || 0;
            return (
              <div
                key={t.id}
                className="group relative flex flex-col rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-black/60 transition-all"
              >
                {/* Banner Thumbnail */}
                <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                  <img
                    src={t.bannerUrl}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

                  {/* Badges on top */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-xs font-bold text-white shadow">
                      <span>{t.sportIcon}</span>
                      <span>{t.sport}</span>
                    </span>

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
                  </div>

                  {/* Format tag bottom left */}
                  <div className="absolute bottom-3 left-4">
                    <span className="text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-md bg-blue-600 text-white">
                      {t.format === "GROUP_KNOCKOUT"
                        ? "Group Stage + Playoffs"
                        : t.format === "KNOCKOUT"
                        ? "Knockout Bracket"
                        : "Round Robin Table"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-extrabold text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {/* Details stats */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t.teams?.length || 0} Participating Wards</span>
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

                  {/* Action Link */}
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition-all mt-2 group-hover:shadow-md group-hover:shadow-blue-500/20"
                  >
                    <span>View Tables & Rules</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
