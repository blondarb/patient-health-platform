import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

  const link = await prisma.providerLink.create({
    data: {
      userId,
      token,
      scope: JSON.stringify(scope || { labs: true, medications: true, conditions: true, allergies: true }),
      expiresAt,
    },
  });

  return NextResponse.json({
    id: link.id,
    token: link.token,
    shareUrl: `/share/${link.token}`,
    expiresAt: link.expiresAt.toISOString(),
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const linkId = searchParams.get("id");

  if (!linkId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.providerLink.update({
    where: { id: linkId },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
