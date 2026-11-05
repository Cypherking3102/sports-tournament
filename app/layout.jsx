import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Divine Mercy Sports — Parish Tournaments, Groups & Brackets",
  description: "Official sports and tournament portal for Divine Mercy Church community."
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
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-300">Divine Mercy Church</span>
              <span>• Parish Tournaments</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Multi-Group Stages • Round-Robin Tables • Knockout Playoffs • Parish Rulebooks
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
