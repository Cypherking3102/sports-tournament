import Link from "next/link";
import { Trophy, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
        <Trophy className="w-8 h-8 text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-white">Tournament Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-sm">
        The parish tournament or fixture page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Tournaments</span>
      </Link>
    </div>
  );
}
