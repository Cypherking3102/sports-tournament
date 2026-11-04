import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { passkey } = await request.json();
    const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || "admin123";

    if (passkey === ADMIN_PASSKEY) {
      return NextResponse.json({
        authenticated: true,
        role: "admin",
        token: `admin-session-${Date.now()}`
      });
    }

    return NextResponse.json(
      { authenticated: false, error: "Invalid Admin Passkey. Default is: admin123" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
