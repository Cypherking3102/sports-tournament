import { NextResponse } from "next/server";
import { getAllTournaments, createTournament } from "@/lib/db";
import { generateKnockoutBracket, generateRoundRobinSchedule } from "@/lib/tournamentEngine";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport");
    const status = searchParams.get("status");

    let tournaments = getAllTournaments();

    if (sport && sport !== "ALL") {
      tournaments = tournaments.filter(
        (t) => t.sport.toLowerCase() === sport.toLowerCase()
      );
    }
    if (status && status !== "ALL") {
      tournaments = tournaments.filter(
        (t) => t.status.toUpperCase() === status.toUpperCase()
      );
    }

    return NextResponse.json(tournaments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      sport,
      sportIcon,
      scoreUnit,
      format,
      startDate,
      endDate,
      location,
      organizer,
      description,
      bannerUrl,
      teams,
      rules,
      autoGenerateFixtures
    } = body;

    if (!title || !sport || !teams || teams.length < 2) {
      return NextResponse.json(
        { error: "Title, sport, and at least 2 teams are required." },
        { status: 400 }
      );
    }

    // Format teams with unique IDs
    const formattedTeams = teams.map((tm, idx) => ({
      id: tm.id || `tm-${Date.now()}-${idx}`,
      name: tm.name,
      shortName: tm.shortName || tm.name.substring(0, 3).toUpperCase(),
      seed: tm.seed || idx + 1,
      logo: tm.logo || "🏆"
    }));

    let matches = [];
    if (autoGenerateFixtures !== false) {
      if (format === "ROUND_ROBIN") {
        matches = generateRoundRobinSchedule(formattedTeams, { startDate, venue: location });
      } else {
        matches = generateKnockoutBracket(formattedTeams, { startDate, venue: location });
      }
    }

    const newTourney = createTournament({
      title,
      sport,
      sportIcon: sportIcon || "🏅",
      scoreUnit: scoreUnit || "Points",
      format: format || "KNOCKOUT",
      status: "UPCOMING",
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || "",
      location: location || "Sports Complex",
      organizer: organizer || "Tournament Committee",
      description: description || "Community sports tournament.",
      bannerUrl:
        bannerUrl ||
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      teams: formattedTeams,
      rules: rules || [],
      matches
    });

    return NextResponse.json(newTourney, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
