import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "SportSphere — Multi-Sport Tournaments & Brackets",
  description: "Create, schedule, track live brackets and manage rules for any sports tournament."
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-amber-400 selection:text-zinc-950">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-zinc-300">SportSphere</span>
              <span>• Multi-Sport Tournament Engine</span>
            </div>
            <p className="text-zinc-500 text-[11px]">
              Supports Knockout Brackets, Round-Robin Standings, Dynamic Rulebooks & Mobile Admin.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
