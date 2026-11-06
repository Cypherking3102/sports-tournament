"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import ScoreModal from "@/components/ScoreModal";
import ScheduleFilters from "@/components/ScheduleFilters";
import SchedulePlayerBanner from "@/components/SchedulePlayerBanner";
import ScheduleMatchCard from "@/components/ScheduleMatchCard";
import { getClientTournaments, saveClientTournament, mergeTournaments } from "@/lib/clientStorage";
import { parseTimeToMinutes } from "@/lib/utils/timeUtils";

export default function GlobalSchedulePage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedSport, setSelectedSport] = useState("ALL");
  const [selectedFloor, setSelectedFloor] = useState("ALL");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedMatchTournament, setSelectedMatchTournament] = useState(null);

  useEffect(() => {
    fetchData();
    const token = localStorage.getItem("sports_admin_token");
    if (token) setIsAdmin(true);

    const handleStorageChange = () => {
      setIsAdmin(!!localStorage.getItem("sports_admin_token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tournaments");
      if (res.ok) {
        const data = await res.json();
        setTournaments(mergeTournaments(Array.isArray(data) ? data : []));
      } else {
        setTournaments(getClientTournaments());
      }
    } catch (err) {
      console.error(err);
      setTournaments(getClientTournaments());
    } finally {
      setLoading(false);
    }
  };

  // Compile unique players across all tournaments, sorted strictly A-Z
  const allPlayers = useMemo(() => {
    const namesSet = new Set();
    tournaments.forEach((tourney) => {
      (tourney.teams || []).forEach((t) => {
        if (t.name && t.name.trim()) {
          namesSet.add(t.name.trim());
        }
      });
    });
    return Array.from(namesSet).sort((a, b) => a.localeCompare(b));
  }, [tournaments]);

  // Compile all matches across all tournaments enriched with time info
  const allEnrichedMatches = useMemo(() => {
    const list = [];
    tournaments.forEach((tourney) => {
      const teamLookup = {};
      (tourney.teams || []).forEach((t) => {
        teamLookup[t.id] = t;
      });

      (tourney.matches || []).forEach((m) => {
        const teamA = teamLookup[m.teamAId];
        const teamB = teamLookup[m.teamBId];
        const player1 = teamA ? teamA.name : m.placeholderA || "TBD";
        const player2 = teamB ? teamB.name : m.placeholderB || "TBD";
        const timeStr = m.startTime || (m.scheduledAt ? m.scheduledAt.split(" ")[1] : "00:00");

        list.push({
          ...m,
          tournamentId: tourney.id,
          tournamentTitle: tourney.title,
          sport: tourney.sport,
          player1,
          player2,
          initialA: (player1 || "P")[0]?.toUpperCase(),
          initialB: (player2 || "P")[0]?.toUpperCase(),
          timeStr,
          rawTournament: tourney
        });
      });
    });

    list.sort((a, b) => parseTimeToMinutes(a.timeStr) - parseTimeToMinutes(b.timeStr));
    return list;
  }, [tournaments]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return allEnrichedMatches.filter((m) => {
      if (selectedSport !== "ALL" && m.sport.toLowerCase() !== selectedSport.toLowerCase()) {
        return false;
      }
      if (selectedFloor === "4th" && !m.venue?.includes("4th Floor")) return false;
      if (selectedFloor === "Ground" && !m.venue?.includes("Ground Floor")) return false;
      if (selectedFloor === "Hall" && !m.venue?.includes("Church Hall") && !m.venue?.includes("Hall")) return false;
      if (selectedFloor === "Grotto" && !m.venue?.includes("Grotto")) return false;

      if (selectedPlayer) {
        const p1 = (m.player1 || "").toLowerCase();
        const p2 = (m.player2 || "").toLowerCase();
        const query = selectedPlayer.trim().toLowerCase();
        return p1.includes(query) || p2.includes(query);
      }
      return true;
    });
  }, [allEnrichedMatches, selectedSport, selectedFloor, selectedPlayer]);

  // Player summary stats when a specific player is selected
  const playerStats = useMemo(() => {
    const target = selectedPlayer.trim().toLowerCase();
    if (!target) return null;

    const playerMatches = allEnrichedMatches.filter(
      (m) => m.player1.toLowerCase().includes(target) || m.player2.toLowerCase().includes(target)
    );

    const sportsInvolved = Array.from(new Set(playerMatches.map((m) => m.sport)));
    const firstMatch = playerMatches[0]?.startTime || playerMatches[0]?.timeStr || "TBD";
    const lastMatch = playerMatches[playerMatches.length - 1]?.endTime || playerMatches[playerMatches.length - 1]?.timeStr || "TBD";
    const completed = playerMatches.filter((m) => m.status === "COMPLETED").length;
    const upcoming = playerMatches.filter((m) => m.status === "SCHEDULED").length;

    return {
      name: selectedPlayer,
      totalMatches: playerMatches.length,
      completed,
      upcoming,
      sportsInvolved,
      firstMatch,
      lastMatch
    };
  }, [allEnrichedMatches, selectedPlayer]);

  const handleClearFilters = () => {
    setSelectedPlayer("");
    setSelectedSport("ALL");
    setSelectedFloor("ALL");
  };

  const handleMatchSaved = (updatedTourney) => {
    saveClientTournament(updatedTourney);
    setTournaments((prev) =>
      prev.map((t) => (t.id === updatedTourney.id ? updatedTourney : t))
    );
    setSelectedMatch(null);
    setSelectedMatchTournament(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16 space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tournaments</span>
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          Saturday 7th November 2026 • Live Match Timeline
        </span>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/30">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Master Parish Tournament Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Know Your <span className="text-blue-400">Match Schedule</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Select your name below to view all your scheduled fixtures in order of time across Carrom, Chess, Table Tennis, Cricket & Throwball.
          </p>
        </div>
      </div>

      {/* Filters Module */}
      <ScheduleFilters
        allPlayers={allPlayers}
        selectedPlayer={selectedPlayer}
        onSelectPlayer={setSelectedPlayer}
        selectedSport={selectedSport}
        onSelectSport={setSelectedSport}
        selectedFloor={selectedFloor}
        onSelectFloor={setSelectedFloor}
        onClearFilters={handleClearFilters}
      />

      {/* Selected Player Personalized Summary Banner */}
      <SchedulePlayerBanner playerStats={playerStats} />

      {/* Match Results Counter */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>
            {selectedPlayer
              ? `Matches for "${selectedPlayer}"`
              : "All Fixtures (In Order of Time)"}
          </span>
        </h2>
        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredMatches.length} matches
        </span>
      </div>

      {/* Fixtures List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading tournament schedules...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <User className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No matches found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try picking another player name from the dropdown or resetting your filters.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            Show All Matches
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredMatches.map((m) => (
            <ScheduleMatchCard
              key={m.id}
              match={m}
              selectedPlayer={selectedPlayer}
              isAdmin={isAdmin}
              onEditMatch={(matchItem) => {
                setSelectedMatch(matchItem);
                setSelectedMatchTournament(matchItem.rawTournament);
              }}
            />
          ))}
        </div>
      )}

      {/* Admin Score / Match Editor Modal */}
      {isAdmin && selectedMatch && selectedMatchTournament && (
        <ScoreModal
          match={selectedMatch}
          tournament={selectedMatchTournament}
          isOpen={true}
          onClose={() => {
            setSelectedMatch(null);
            setSelectedMatchTournament(null);
          }}
          onSave={handleMatchSaved}
        />
      )}
    </div>
  );
}
