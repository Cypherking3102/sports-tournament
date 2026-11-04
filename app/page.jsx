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
  Sparkles,
  BookOpen
} from "lucide-react";

export default function HomePage() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedSport, setSelectedSport] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
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
    if (!confirm("Reset all tournaments back to the original demo data?")) return;
    try {
      await fetch("/api/tournaments/reset", { method: "POST" });
      fetchTournaments();
    } catch (err) {
      alert("Error resetting data");
    }
  };

  const sportsList = ["ALL", "Football", "Basketball", "Cricket"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/40 border border-zinc-800 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Tournament Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Elevate Your <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Sports Leagues</span> & Tournaments
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Generate visual knockout brackets, manage round-robin tables, track live match scores,
            and establish official tournament rulebooks for any sport.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/admin/new"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-extrabold text-sm px-6 py-3 rounded-2xl transition-all shadow-lg shadow-orange-500/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Tournament</span>
            </Link>

            <button
              onClick={handleResetData}
              className="inline-flex items-center space-x-1.5 bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs px-4 py-3 rounded-2xl transition-all"
              title="Reset sample data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demos</span>
            </button>
          </div>
        </div>

        {/* Athletic Accent Backdrop */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:flex items-center justify-center">
          <Trophy className="w-96 h-96 text-amber-400" />
        </div>
      </div>

      {/* Sport Category Filter Chips */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Active Tournaments</span>
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            {tournaments.length} {tournaments.length === 1 ? "Tournament" : "Tournaments"}
          </span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {sportsList.map((sp) => (
            <button
              key={sp}
              onClick={() => setSelectedSport(sp)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedSport === sp
                  ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {sp === "ALL" ? "All Sports" : sp}
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
              className="h-72 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse"
            ></div>
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center space-y-3">
          <Trophy className="w-12 h-12 text-zinc-600 mx-auto" />
          <p className="text-zinc-300 font-bold text-base">No tournaments found</p>
          <p className="text-zinc-500 text-xs">Create your first tournament using the creator wizard!</p>
          <Link
            href="/admin/new"
            className="inline-block px-5 py-2.5 bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl"
          >
            Launch Tournament
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => {
            const liveMatches = t.matches?.filter((m) => m.status === "LIVE").length || 0;
            return (
              <div
                key={t.id}
                className="group relative flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/80 overflow-hidden hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/60 transition-all"
              >
                {/* Banner Thumbnail */}
                <div className="relative h-44 w-full bg-zinc-800 overflow-hidden">
                  <img
                    src={t.bannerUrl}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"></div>

                  {/* Badges on top */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-700/60 text-xs font-bold text-white shadow">
                      <span>{t.sportIcon}</span>
                      <span>{t.sport}</span>
                    </span>

                    {liveMatches > 0 ? (
                      <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-bold animate-pulse shadow-lg shadow-red-500/30">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{liveMatches} LIVE</span>
                      </span>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          t.status === "LIVE"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800/80 text-zinc-400 border border-zinc-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    )}
                  </div>

                  {/* Format tag bottom left */}
                  <div className="absolute bottom-3 left-4">
                    <span className="text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-md bg-amber-400/90 text-zinc-950">
                      {t.format === "KNOCKOUT" ? "Knockout Bracket" : "Round Robin Table"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-extrabold text-white text-lg tracking-tight group-hover:text-amber-300 transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {/* Details stats */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{t.teams?.length || 0} Participating Teams</span>
                      </span>
                      <span className="font-mono text-zinc-500">
                        {t.matches?.length || 0} Matches
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{t.location}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{t.startDate}</span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all mt-2 group-hover:shadow-lg group-hover:shadow-amber-400/10"
                  >
                    <span>View Brackets & Rules</span>
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
