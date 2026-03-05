import { NextRequest, NextResponse } from "next/server";
import { getRecords } from "@/lib/static-data";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const { records, total } = getRecords(userId, {
    category,
    status,
    limit,
    offset,
  });

  return NextResponse.json({ records, total, limit, offset });
}
