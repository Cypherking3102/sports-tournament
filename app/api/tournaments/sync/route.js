import { NextResponse } from "next/server";
import { syncTournaments, getAllTournaments } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { tournaments, tournament } = body;

    const listToSync = Array.isArray(tournaments)
      ? tournaments
      : tournament
      ? [tournament]
      : [];

    if (listToSync.length > 0) {
      syncTournaments(listToSync);
    }

    return NextResponse.json({
      success: true,
      tournaments: getAllTournaments()
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
