import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, scope, durationHours } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const token = randomBytes(24).toString("hex");
  const hours = durationHours || 24;
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  // Return a simulated link (no database — demo mode)
  return NextResponse.json({
    id: `link-${Date.now()}`,
    token,
    shareUrl: `/share/${token}`,
    expiresAt: expiresAt.toISOString(),
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const linkId = searchParams.get("id");

  if (!linkId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
