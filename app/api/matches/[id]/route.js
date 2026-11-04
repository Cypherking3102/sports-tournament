import { NextResponse } from "next/server";
import { updateMatchScore } from "@/lib/db";

export async function PUT(request, { params }) {
  try {
    const { id: matchId } = await params;
    const body = await request.json();
    const { tournamentId, scoreA, scoreB, status, winnerId } = body;

    if (!tournamentId) {
      return NextResponse.json(
        { error: "tournamentId is required to update match score." },
        { status: 400 }
      );
    }

    const updated = updateMatchScore(tournamentId, matchId, {
      scoreA,
      scoreB,
      status: status || "COMPLETED",
      winnerId
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Tournament or match not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
