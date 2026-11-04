"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Trophy, Shield, PlusCircle, Compass, Menu, X, LogIn, LogOut } from "lucide-react";

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
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                SportSphere
              </span>
              <span className="text-[10px] block font-mono text-amber-400 tracking-wider font-semibold uppercase">
                Tournaments & Brackets
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="flex items-center space-x-1.5 text-zinc-300 hover:text-white transition-colors"
            >
              <Compass className="w-4 h-4 text-zinc-400" />
              <span>Tournaments</span>
            </Link>
            <Link
              href="/admin/new"
              className="flex items-center space-x-1.5 text-zinc-300 hover:text-white transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>New Tournament</span>
            </Link>

            {/* Admin status toggle */}
            {isAdmin ? (
              <div className="flex items-center space-x-3 bg-zinc-900 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs">
                <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Admin Mode Active</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-zinc-400 hover:text-red-400 ml-2"
                  title="Sign out of Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-200 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Login</span>
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            {isAdmin && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20"></span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 text-zinc-200 py-2 font-medium"
            >
              <Compass className="w-5 h-5 text-amber-400" />
              <span>Browse Tournaments</span>
            </Link>
            <Link
              href="/admin/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 text-zinc-200 py-2 font-medium"
            >
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>Create Tournament</span>
            </Link>
            <div className="pt-2 border-t border-zinc-800">
              {isAdmin ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-red-400 py-2 text-sm font-medium w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Exit Admin Mode</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowPinModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-amber-400 py-2 text-sm font-medium w-full"
                >
                  <Shield className="w-5 h-5" />
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Admin Access</h3>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Enter your admin passkey to edit scores, advance brackets, and configure rules.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Default: admin123"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-sm"
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
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-orange-500/20"
                >
                  Sign In
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 text-center">
                Default testing passkey is: <span className="font-mono text-zinc-300">admin123</span>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
