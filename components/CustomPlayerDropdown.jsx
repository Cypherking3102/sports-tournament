"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { User, ChevronDown, Check, X, Search } from "lucide-react";

export default function CustomPlayerDropdown({
  players = [],
  selectedPlayer = "",
  onSelectPlayer,
  placeholder = "Select Player (All Participants)",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Filter players by internal search
  const filteredPlayers = useMemo(() => {
    if (!searchTerm.trim()) return players;
    const q = searchTerm.trim().toLowerCase();
    return players.filter((p) => p.toLowerCase().includes(q));
  }, [players, searchTerm]);

  const handleSelect = (name) => {
    onSelectPlayer(name);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelectPlayer("");
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-semibold transition-all shadow-sm ${
          selectedPlayer
            ? "bg-blue-600/10 border-blue-500/50 text-blue-400"
            : "bg-slate-950 border-slate-700/80 text-white hover:border-slate-600"
        }`}
      >
        <div className="flex items-center space-x-2.5 truncate min-w-0 pr-2">
          {selectedPlayer ? (
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 shadow-sm">
              {selectedPlayer[0]?.toUpperCase()}
            </span>
          ) : (
            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
          )}
          <span className={`truncate ${selectedPlayer ? "font-bold text-blue-300" : "text-slate-300"}`}>
            {selectedPlayer || placeholder}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {selectedPlayer && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-blue-400" : ""
            }`}
          />
        </div>
      </button>

      {/* Floating Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 space-y-2 animate-in fade-in zoom-in-95 duration-100">
          {/* Internal Quick Search Bar */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Type to filter names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          {/* Player Options List */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin">
            {/* "Show All Players" option */}
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                !selectedPlayer
                  ? "bg-blue-600 text-white font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>-- All Participants ({players.length}) --</span>
              {!selectedPlayer && <Check className="w-3.5 h-3.5" />}
            </button>

            {filteredPlayers.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No player matching "{searchTerm}"
              </div>
            ) : (
              filteredPlayers.map((name) => {
                const isSelected = selectedPlayer === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelect(name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white font-bold shadow-sm"
                        : "text-slate-200 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate min-w-0 pr-2">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 ${
                          isSelected ? "bg-white text-blue-600" : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {name[0]?.toUpperCase()}
                      </span>
                      <span className="truncate">{name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
