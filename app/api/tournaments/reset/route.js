import { NextResponse } from "next/server";
import { resetDatabase } from "@/lib/db";

export async function POST() {
  try {
    const data = resetDatabase();
    return NextResponse.json({ success: true, message: "Database reset to sample tournaments.", data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
