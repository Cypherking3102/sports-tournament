"use client";

import { useState } from "react";
import { BookOpen, Search, Plus, Sparkles } from "lucide-react";

export default function RulesViewer({ tournament, isAdmin, onAddRule }) {
  const { rules = [], title, sport, sportIcon } = tournament;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Code of Conduct");
  const [newContent, setNewContent] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const categories = ["ALL", ...Array.from(new Set(rules.map((r) => r.category || "General")))];

  const filteredRules = rules.filter((rule) => {
    const matchesCategory =
      selectedCategory === "ALL" || (rule.category || "General") === selectedCategory;
    const matchesSearch =
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateRule = (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    if (onAddRule) {
      onAddRule({
        id: `rule-${Date.now()}`,
        title: newTitle,
        category: newCategory,
        content: newContent
      });
    }
    setNewTitle("");
    setNewContent("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Rules Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/30 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Official Parish Rulebook & Guidelines</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {sportIcon} {sport} Regulations for {title}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Governing rules, group qualification criteria, tie-breakers, and Christian conduct.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rule Section</span>
          </button>
        )}
      </div>

      {/* Admin Add Rule Form */}
      {showAddForm && isAdmin && (
        <form
          onSubmit={handleCreateRule}
          className="bg-slate-900 border border-blue-500/40 rounded-3xl p-5 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-sm text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Create New Rule Section</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Rule Title</label>
              <input
                type="text"
                placeholder="e.g. Tie-Breaker Procedure"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Category</label>
              <input
                type="text"
                placeholder="e.g. Code of Conduct, Gameplay, Rosters"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Rule Details</label>
            <textarea
              rows={3}
              placeholder="Describe parish regulations, player eligibility, card rules..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
              required
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all"
            >
              Publish Rule
            </button>
          </div>
        </form>
      )}

      {/* Search & Category Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rules (e.g. prayer, penalties, rosters)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs scrollbar-none pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Cards */}
      {filteredRules.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-sm">
          No rules found matching your search.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRules.map((rule, idx) => (
            <div
              key={rule.id || idx}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-xs font-mono font-bold">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-white text-sm">{rule.title}</h4>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-full font-mono border border-slate-800">
                  {rule.category || "General"}
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed pl-8">
                {rule.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
