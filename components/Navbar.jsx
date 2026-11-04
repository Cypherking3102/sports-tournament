"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Trophy, Shield, PlusCircle, Compass, Menu, X, LogOut } from "lucide-react";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("sports_admin_token");
    if (token) setIsAdmin(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
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
        setShowPinModal(false);
        setPasskey("");
      } else {
        setAuthError(data.error || "Incorrect passkey");
      }
    } catch {
      setAuthError("Failed to authenticate. Try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sports_admin_token");
    setIsAdmin(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white block">
                Divine Mercy Sports
              </span>
              <span className="text-[10px] block font-mono text-blue-400 tracking-wider font-semibold uppercase">
                Parish Community Tournaments
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <Compass className="w-4 h-4 text-slate-400" />
              <span>Tournaments</span>
            </Link>
            <Link
              href="/admin/new"
              className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>New Tournament</span>
            </Link>

            {/* Admin status toggle */}
            {isAdmin ? (
              <div className="flex items-center space-x-3 bg-slate-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs">
                <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Admin Mode Active</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400 ml-2"
                  title="Sign out of Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Admin Login</span>
              </button>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden space-x-2">
            {isAdmin && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20"></span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 text-slate-200 py-2 font-medium"
            >
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Browse Tournaments</span>
            </Link>
            <Link
              href="/admin/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 text-slate-200 py-2 font-medium"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Create Tournament</span>
            </Link>
            <div className="pt-2 border-t border-slate-800">
              {isAdmin ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-red-400 py-2 text-sm font-medium w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit Admin Mode</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowPinModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-blue-400 py-2 text-sm font-medium w-full"
                >
                  <Shield className="w-4 h-4" />
                  <span>Enter Admin Passkey</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Admin Passkey Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Parish Admin Access</h3>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Enter the admin passkey to update live match scores, publish rules, and advance brackets.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Default: admin123"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 text-sm"
                  autoFocus
                />
                {authError && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{authError}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20"
                >
                  Sign In
                </button>
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Default passkey: <span className="font-mono text-slate-300">admin123</span>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
