import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const record = await prisma.cachedRecord.findUnique({
    where: { id },
  });

  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  // Also fetch related records (same test name for trends)
  const relatedRecords = await prisma.cachedRecord.findMany({
    where: {
      userId: record.userId,
      title: record.title,
      category: record.category,
    },
    orderBy: { effectiveDate: "asc" },
  });

  return NextResponse.json({ record, relatedRecords });
}
