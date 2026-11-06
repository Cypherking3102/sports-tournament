"use client";

export default function BrandLogo({ className = "w-10 h-10", size = 40 }) {
  return (
    <div
      className={`relative rounded-2xl p-0.5 bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 shadow-md shadow-blue-500/25 flex-shrink-0 flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="rayRed" x1="50%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#be123c" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="rayBlue" x1="50%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Shield Background */}
        <path
          d="M50 8 L84 22 C84 56 68 80 50 92 C32 80 16 56 16 22 Z"
          fill="url(#shieldGrad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2.5"
        />

        {/* Divine Mercy Radiant Rays (Red & Pale Blue Beams) */}
        <path d="M50 36 L30 84 L44 88 Z" fill="url(#rayRed)" />
        <path d="M50 36 L70 84 L56 88 Z" fill="url(#rayBlue)" />

        {/* Victory Trophy Cup */}
        {/* Base */}
        <rect x="42" y="72" width="16" height="4" rx="2" fill="url(#goldGrad)" />
        <path d="M47 62 L53 62 L52 72 L48 72 Z" fill="url(#goldGrad)" />

        {/* Cup Body */}
        <path
          d="M38 38 C38 56 44 63 50 63 C56 63 62 56 62 38 Z"
          fill="url(#goldGrad)"
        />

        {/* Handles */}
        <path
          d="M38 41 C32 41 30 48 30 52 C30 56 34 58 39 56"
          stroke="url(#goldGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M62 41 C68 41 70 48 70 52 C70 56 66 58 61 56"
          stroke="url(#goldGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cross / Star on Trophy */}
        <path
          d="M50 20 L52 25 L57 25 L53 28 L55 33 L50 30 L45 33 L47 28 L43 25 L48 25 Z"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
}
