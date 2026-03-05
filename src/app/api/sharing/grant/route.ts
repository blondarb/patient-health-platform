import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, caregiverEmail, caregiverName, permissions, accessLevel } = body;

  if (!userId || !caregiverEmail || !caregiverName) {
    return NextResponse.json(
      { error: "userId, caregiverEmail, and caregiverName are required" },
      { status: 400 }
    );
  }

  const grant = await prisma.shareGrant.create({
    data: {
      userId,
      caregiverEmail,
      caregiverName,
      permissions: JSON.stringify(permissions || {}),
      accessLevel: accessLevel || "view",
    },
  });

  return NextResponse.json(grant);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const grantId = searchParams.get("id");

  if (!grantId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.shareGrant.update({
    where: { id: grantId },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
