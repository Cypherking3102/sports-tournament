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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('dmc_theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-1.5">
            <p className="font-extrabold text-sm text-slate-200 tracking-tight">
              Divine mercy church • parish sports tournament
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Made by Dennies
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
