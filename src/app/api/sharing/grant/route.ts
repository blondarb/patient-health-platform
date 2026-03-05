import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, caregiverEmail, caregiverName, permissions, accessLevel } = body;

  if (!userId || !caregiverEmail || !caregiverName) {
    return NextResponse.json(
      { error: "userId, caregiverEmail, and caregiverName are required" },
      { status: 400 }
    );
  }

  // Return a simulated grant (no database — demo mode)
  const grant = {
    id: `grant-${Date.now()}`,
    userId,
    caregiverEmail,
    caregiverName,
    permissions: JSON.stringify(permissions || {}),
    accessLevel: accessLevel || "view",
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(grant);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const grantId = searchParams.get("id");

  if (!grantId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
