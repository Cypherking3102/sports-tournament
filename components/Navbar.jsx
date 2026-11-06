"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Trophy,
  Shield,
  PlusCircle,
  Compass,
  Menu,
  X,
  LogOut,
  Lock,
  Calendar,
  Sun,
  Moon
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [authError, setAuthError] = useState("");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Check initial admin token
    const token = localStorage.getItem("sports_admin_token");
    if (token) setIsAdmin(true);

    // Check stored theme
    const storedTheme = localStorage.getItem("dmc_theme") || "dark";
    setTheme(storedTheme);
    if (storedTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }

    const handleStorageChange = () => {
      setIsAdmin(!!localStorage.getItem("sports_admin_token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("dmc_theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

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
        window.dispatchEvent(new Event("storage"));
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
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <BrandLogo className="w-10 h-10 group-hover:scale-105 transition-transform" />
            <span className="font-black text-base sm:text-lg tracking-tight text-white group-hover:text-blue-300 transition-colors">
              Divine Mercy Sports
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-5 text-sm font-medium">
            <Link
              href="/"
              className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <Compass className="w-4 h-4 text-slate-400" />
              <span>Tournaments</span>
            </Link>

            <Link
              href="/schedule"
              className="flex items-center space-x-1.5 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Find Your Match</span>
            </Link>

            {/* Admin-only Tournament Creation Link */}
            {isAdmin && (
              <Link
                href="/admin/new"
                className="flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Create Tournament</span>
              </Link>
            )}

            {/* Admin status toggle */}
            {isAdmin ? (
              <div className="flex items-center space-x-3 bg-slate-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs">
                <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Admin Mode</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400 ml-1.5"
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
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Admin Login</span>
              </button>
            )}

            {/* Theme Toggle Button (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-500" />
              )}
            </button>
          </nav>

          {/* Mobile Right Controls: Theme Toggle + Menu */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-500" />
              )}
            </button>

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
              href="/schedule"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 text-blue-400 py-2 font-semibold"
            >
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Find Your Match</span>
            </Link>

            {/* Admin only option on mobile */}
            {isAdmin && (
              <Link
                href="/admin/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 text-emerald-400 py-2 font-medium"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Create Tournament (Admin)</span>
              </Link>
            )}

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
                  <Lock className="w-4 h-4" />
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
              Enter your admin passkey to add tournaments, edit schedules, adjust draws and brackets, and update match results.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter Admin Passkey"
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
                Authorized Parish Organizers Only
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
