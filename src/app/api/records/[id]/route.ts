import { NextRequest, NextResponse } from "next/server";
import { getRecordById } from "@/lib/static-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { record, relatedRecords } = getRecordById(id);

  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  return NextResponse.json({ record, relatedRecords });
}
