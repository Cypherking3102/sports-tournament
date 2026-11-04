import TournamentWizard from "@/components/TournamentWizard";

export const metadata = {
  title: "Create Tournament — SportSphere",
  description: "Configure sport, rules, teams, and auto-generate tournament brackets."
};

export default function NewTournamentPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <TournamentWizard />
    </div>
  );
}
