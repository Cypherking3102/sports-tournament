import { NextResponse } from "next/server";
import { getTournamentById, updateTournament, deleteTournament } from "@/lib/db";
import { calculateStandings } from "@/lib/tournamentEngine";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const tournament = getTournamentById(id);

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // If tournament has round robin matches, compute standings
    let standings = null;
    if (tournament.format === "ROUND_ROBIN" && tournament.teams && tournament.matches) {
      standings = calculateStandings(tournament.teams, tournament.matches);
    }

    return NextResponse.json({ ...tournament, standings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateTournament(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = deleteTournament(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
