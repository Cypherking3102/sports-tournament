"use client";

import { Search, MapPin, X } from "lucide-react";
import CustomPlayerDropdown from "./CustomPlayerDropdown";

export default function ScheduleFilters({
  allPlayers,
  selectedPlayer,
  onSelectPlayer,
  selectedSport,
  onSelectSport,
  selectedFloor,
  onSelectFloor,
  onClearFilters
}) {
  const sportsList = ["ALL", "Carrom", "Chess", "Table Tennis", "Cricket", "Throwball"];
  const venueList = [
    { id: "ALL", label: "All Areas" },
    { id: "Hall", label: "Church Hall" },
    { id: "Grotto", label: "Grotto Area" },
    { id: "4th", label: "4th Floor" },
    { id: "Ground", label: "Ground Floor" }
  ];

  const hasActiveFilters = selectedPlayer || selectedSport !== "ALL" || selectedFloor !== "ALL";

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Search Input using Custom Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span>Select Your Name (Custom Dropdown)</span>
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs text-blue-400 hover:text-blue-300 font-normal underline flex items-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </label>
        <div className="max-w-xl">
          <CustomPlayerDropdown
            players={allPlayers}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={onSelectPlayer}
            placeholder={`Choose Your Name (${allPlayers.length} Participants)`}
          />
        </div>
      </div>

      {/* Filter Chips: Sport & Floor */}
      <div className="pt-3 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 font-mono">Sport:</span>
          {sportsList.map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => onSelectSport(sp)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedSport === sp
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {sp === "ALL" ? "All Sports" : sp}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <span className="text-xs text-slate-500 font-mono">Venue:</span>
          {venueList.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelectFloor(id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedFloor === id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
