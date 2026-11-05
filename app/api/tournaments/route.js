import { NextResponse } from "next/server";
import { getAllTournaments, createTournament } from "@/lib/db";
import {
  generateKnockoutBracket,
  generateRoundRobinSchedule,
  generateGroupKnockoutTournament,
  buildDefaultPlayoffMatches
} from "@/lib/tournamentEngine";

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
      id,
      title,
      sport,
      sportIcon,
      scoreUnit,
      participantType = "TEAM",
      format = "GROUP_KNOCKOUT",
      startDate,
      endDate,
      location,
      organizer,
      description,
      bannerUrl,
      pointsConfig,
      teams = [],
      groups,
      rules,
      autoGenerateFixtures,
      customMatches,
      matches: directMatches,
      playoffStage = "SEMI_FINALS"
    } = body;

    if (!title || !sport || !teams || teams.length < 2) {
      return NextResponse.json(
        { error: "Title, sport, and at least 2 teams are required." },
        { status: 400 }
      );
    }

    // Format teams with unique IDs while strictly preserving rosters (players) and group assignment
    const formattedTeams = teams.map((tm, idx) => ({
      id: tm.id || `tm-${Date.now()}-${idx}`,
      name: tm.name,
      shortName: tm.shortName || tm.name.substring(0, 3).toUpperCase(),
      seed: tm.seed || idx + 1,
      logo: tm.logo || (participantType === "INDIVIDUAL" ? "👤" : "🛡️"),
      group: tm.group || "Group A",
      players: Array.isArray(tm.players)
        ? tm.players.map((p, pIdx) => ({
            id: p.id || `pl-${idx}-${pIdx}`,
            name: p.name,
            role: p.role || "PLAYER"
          }))
        : []
    }));

    // Reconstruct or preserve groups
    let formattedGroups = groups;
    if (!formattedGroups || formattedGroups.length === 0) {
      const distinctGroups = Array.from(new Set(formattedTeams.map((t) => t.group || "Group A")));
      formattedGroups = distinctGroups.map((gName, gIdx) => ({
        id: `grp-${String.fromCharCode(97 + gIdx)}`,
        name: gName,
        teams: formattedTeams.filter((t) => (t.group || "Group A") === gName)
      }));
    } else {
      // Ensure group.teams contains the formatted teams
      formattedGroups = formattedGroups.map((g, gIdx) => ({
        id: g.id || `grp-${String.fromCharCode(97 + gIdx)}`,
        name: g.name,
        teams: formattedTeams.filter((t) => (t.group || "Group A") === g.name)
      }));
    }

    // Determine fixtures
    let matches = [];
    if (customMatches && customMatches.length > 0) {
      matches = customMatches;
    } else if (directMatches && directMatches.length > 0) {
      matches = directMatches;
    } else if (autoGenerateFixtures !== false) {
      if (format === "GROUP_KNOCKOUT") {
        const poMatches = buildDefaultPlayoffMatches(formattedGroups, {
          startDate,
          venue: location,
          playoffStage
        });
        matches = generateGroupKnockoutTournament(formattedGroups, {
          startDate,
          venue: location,
          playoffMatches: poMatches
        });
      } else if (format === "ROUND_ROBIN") {
        matches = generateRoundRobinSchedule(formattedTeams, { startDate, venue: location });
      } else {
        matches = generateKnockoutBracket(formattedTeams, { startDate, venue: location });
      }
    }

    const newTourney = createTournament({
      id: id || `tourney-${Date.now()}`,
      title,
      sport,
      sportIcon: sportIcon || "🏅",
      scoreUnit: scoreUnit || "Points",
      participantType,
      format,
      status: "UPCOMING",
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || "",
      location: location || "Parish Sports Turf",
      organizer: organizer || "Divine Mercy Church",
      description: description || `Official ${sport} parish tournament.`,
      bannerUrl:
        bannerUrl ||
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      pointsConfig: pointsConfig || { win: 3, draw: 1, loss: 0, showForm: true },
      teams: formattedTeams,
      groups: formattedGroups,
      rules: rules || [
        {
          id: "r-1",
          title: "Fair Play & Christian Fellowship",
          category: "Conduct",
          content: "Opening prayer before kickoff. Mutual respect towards referees, coordinators, and fellow parishioners."
        }
      ],
      matches,
      playoffStage
    });

    return NextResponse.json(newTourney, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
