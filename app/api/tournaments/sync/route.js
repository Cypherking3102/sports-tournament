import { NextResponse } from "next/server";
import { syncTournaments, getAllTournaments } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { tournaments, tournament, deletedIds } = body;

    const listToSync = Array.isArray(tournaments)
      ? tournaments
      : tournament
      ? [tournament]
      : [];

    syncTournaments(listToSync, Array.isArray(deletedIds) ? deletedIds : []);

    return NextResponse.json({
      success: true,
      tournaments: getAllTournaments()
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
