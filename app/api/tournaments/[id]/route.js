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

    return NextResponse.json(tournament);
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

    const fullTournament = getTournamentById(id);
    return NextResponse.json(fullTournament || updated);
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
