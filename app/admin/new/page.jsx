"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import TournamentWizard from "@/components/TournamentWizard";

export default function NewTournamentPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sports_admin_token");
    if (token) setIsAdmin(true);
    setCheckingAuth(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey })
      });
      const data = await res.json();
      if (res.ok && data.authenticated) {
        localStorage.setItem("sports_admin_token", data.token);
        setIsAdmin(true);
        window.dispatchEvent(new Event("storage"));
      } else {
        setError(data.error || "Incorrect passkey");
      }
    } catch {
      setError("Failed to verify admin passkey");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">
        Checking admin permissions...
      </div>
    );
  }

  // If not admin, require passkey
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">Parish Admin Access Required</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Tournament creation and scheduling are restricted to Divine Mercy Church parish administrators.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Admin Passkey
              </label>
              <input
                type="password"
                placeholder="Enter passkey (default: admin123)"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Unlock Tournament Creator"}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <Link href="/" className="hover:text-white flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Tournaments</span>
            </Link>
            <span className="font-mono text-[11px] text-slate-500">Default: admin123</span>
          </div>
        </div>
      </div>
    );
  }

  // If Admin is authenticated, render the streamlined creator
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <TournamentWizard />
    </div>
  );
}
