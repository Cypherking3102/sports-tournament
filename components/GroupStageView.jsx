"use client";

import { useState, useMemo } from "react";
import {
  Trophy,
  CheckCircle,
  Flame,
  Calendar,
  MapPin,
  Edit3,
  Clock,
  Award,
  Users,
  Star,
  X
} from "lucide-react";
import { normalizePlayers, getCaptain } from "@/lib/tournamentEngine";
import { parseTimeToMinutes } from "@/lib/utils/timeUtils";
import GroupMatchCard from "./GroupMatchCard";

export default function GroupStageView({ tournament, onEditMatch, onAddMatch, isAdmin }) {
  const {
    groups = [],
    groupStandings = {},
    matches = [],
    teams = [],
    scoreUnit = "Points",
    participantType = "INDIVIDUAL",
    pointsConfig = { win: 3, draw: 1, loss: 0, showForm: true }
  } = tournament;

  const [selectedGroupId, setSelectedGroupId] = useState("ALL");
  const [selectedTeamRoster, setSelectedTeamRoster] = useState(null);

  const teamMap = useMemo(() => {
    const map = {};
    teams.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [teams]);

  if (!groups || groups.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        No group stage configured for this tournament.
      </div>
    );
  }

  const winPts = pointsConfig?.win ?? 3;
  const drawPts = pointsConfig?.draw ?? 1;
  const lossPts = pointsConfig?.loss ?? 0;
  const showForm = pointsConfig?.showForm !== false;
  const isIndividual = participantType === "INDIVIDUAL" || teams.length > 0;

  // Chronologically sorted matches across all groups
  const allChronologicalMatches = useMemo(() => {
    const list = matches.filter(
      (m) =>
        m.groupId !== "PLAYOFFS" &&
        !m.stageName?.includes("Playoff") &&
        !m.stageName?.includes("Final")
    );
    list.sort((a, b) => {
      const minA = parseTimeToMinutes(a.startTime || (a.scheduledAt ? a.scheduledAt.split(" ")[1] : ""));
      const minB = parseTimeToMinutes(b.startTime || (b.scheduledAt ? b.scheduledAt.split(" ")[1] : ""));
      return minA - minB;
    });
    return list;
  }, [matches]);

  // Matches for a specific group
  const singleGroupMatches = useMemo(() => {
    if (selectedGroupId === "ALL") return [];
    const grp = groups.find((g) => g.id === selectedGroupId);
    const grpName = grp?.name || "";
    const list = matches.filter(
      (m) => m.groupId === selectedGroupId || (m.stageName && m.stageName.includes(grpName))
    );
    list.sort((a, b) => {
      const minA = parseTimeToMinutes(a.startTime || (a.scheduledAt ? a.scheduledAt.split(" ")[1] : ""));
      const minB = parseTimeToMinutes(b.startTime || (b.scheduledAt ? b.scheduledAt.split(" ")[1] : ""));
      return minA - minB;
    });
    return list;
  }, [matches, selectedGroupId, groups]);

  const renderMatchCard = (m) => (
    <GroupMatchCard
      key={m.id}
      match={m}
      teamMap={teamMap}
      isAdmin={isAdmin}
      onEditMatch={onEditMatch}
    />
  );

  const renderStandingsTable = (group) => {
    const groupData = groupStandings[group.id] || {};
    const standings = groupData.standings || [];

    return (
      <div
        key={group.id}
        className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-sm text-blue-400 font-mono">
              {group.name.replace("Group ", "")}
            </span>
            <div>
              <h3 className="font-extrabold text-white text-base tracking-tight">
                {group.name} Standings
              </h3>
              <p className="text-xs text-slate-400">
                Round-Robin • {group.teams?.length || 0} Players
              </p>
            </div>
          </div>

          <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Top 2 Qualify for Playoffs</span>
          </span>
        </div>

        {/* Standings Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800 font-bold font-mono">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Player</th>
                <th className="py-2.5 px-2 text-center" title="Played">P</th>
                <th className="py-2.5 px-2 text-center text-emerald-400" title="Won">W</th>
                <th className="py-2.5 px-2 text-center text-amber-400" title="Drawn">D</th>
                <th className="py-2.5 px-2 text-center text-rose-400" title="Lost">L</th>
                <th className="py-2.5 px-3 text-center font-black text-blue-400 text-sm">PTS</th>
                {showForm && (
                  <th className="py-2.5 px-3 text-center" title="Form">Form</th>
                )}
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {standings.map((row, index) => {
                const isQualified = index < 2;
                const teamObj = row.team || {};
                const initial = (teamObj.name || "P")[0]?.toUpperCase();

                return (
                  <tr
                    key={teamObj.id || index}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      isQualified ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-xs font-mono font-bold ${
                          index === 0
                            ? "bg-amber-400 text-slate-950 shadow-sm"
                            : index === 1
                            ? "bg-slate-300 text-slate-950"
                            : "text-slate-400 bg-slate-800"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold font-mono">
                          {initial}
                        </span>
                        <span className="font-bold text-white">{teamObj.name || "Participant"}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-200">{row.played}</td>
                    <td className="py-2.5 px-2 text-center font-mono text-emerald-400 font-bold">{row.won}</td>
                    <td className="py-2.5 px-2 text-center font-mono text-amber-300 font-bold">{row.drawn}</td>
                    <td className="py-2.5 px-2 text-center font-mono text-rose-400 font-bold">{row.lost}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-sm font-black text-blue-400">
                      {row.points}
                    </td>

                    {showForm && (
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {row.form && row.form.length > 0 ? (
                            row.form.map((res, i) => (
                              <span
                                key={i}
                                className={`w-4 h-4 rounded text-[9px] font-bold font-mono text-white flex items-center justify-center ${
                                  res === "W"
                                    ? "bg-emerald-500"
                                    : res === "D"
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                              >
                                {res}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600 font-mono text-[10px]">—</span>
                          )}
                        </div>
                      </td>
                    )}

                    <td className="py-2.5 px-3 text-right">
                      {isQualified ? (
                        <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          Top 2
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Group Selector Pill Tabs & Points Badge */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-2xl">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedGroupId("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedGroupId === "ALL"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            All Groups
          </button>
          {groups.map((grp) => (
            <button
              key={grp.id}
              onClick={() => setSelectedGroupId(grp.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedGroupId === grp.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {grp.name}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-300 px-3 py-1 bg-slate-950/80 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold">W: {winPts}</span> •{" "}
            <span className="text-amber-400 font-bold">D: {drawPts}</span> •{" "}
            <span className="text-rose-400 font-bold">L: {lossPts}</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 hidden sm:inline-block">
            Top 2 advance
          </span>
        </div>
      </div>

      {/* When ALL GROUPS is selected: Show standings, followed by ALL matches sorted chronologically by TIME */}
      {selectedGroupId === "ALL" ? (
        <div className="space-y-8">
          {/* Standings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groups.map((grp) => renderStandingsTable(grp))}
          </div>

          {/* Chronological Fixtures Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <h3 className="font-extrabold text-white text-base">
                  All Group Matches (In Order of Time)
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  ({allChronologicalMatches.length} Matches)
                </span>
              </div>
              {isAdmin && onAddMatch && (
                <button
                  type="button"
                  onClick={onAddMatch}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1 hover:underline"
                >
                  <span>+ Add Match</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allChronologicalMatches.map((m) => renderMatchCard(m))}
            </div>
          </div>
        </div>
      ) : (
        /* When a SPECIFIC GROUP is selected: Show that group's standings and its matches */
        <div className="space-y-6">
          {displayedGroupsOrSingle(groups, selectedGroupId).map((group) => (
            <div key={group.id} className="space-y-6">
              {renderStandingsTable(group)}

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h4 className="font-bold text-slate-300 text-xs tracking-wider uppercase flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>{group.name} Match Fixtures</span>
                  </h4>
                  {isAdmin && onAddMatch && (
                    <button
                      type="button"
                      onClick={onAddMatch}
                      className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1 hover:underline"
                    >
                      <span>+ Add Match</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {singleGroupMatches.map((m) => renderMatchCard(m))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function displayedGroupsOrSingle(groups, selectedGroupId) {
  if (selectedGroupId === "ALL") return groups;
  return groups.filter((g) => g.id === selectedGroupId);
}
