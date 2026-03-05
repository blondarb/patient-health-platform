import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const where: Record<string, unknown> = { userId };
  if (category) where.category = category;
  if (status) where.status = status;

  const [records, total] = await Promise.all([
    prisma.cachedRecord.findMany({
      where,
      orderBy: { effectiveDate: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.cachedRecord.count({ where }),
  ]);

  return NextResponse.json({ records, total, limit, offset });
}
