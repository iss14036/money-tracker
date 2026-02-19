import { listReceiptsByUser } from "@/lib/db/store";
import { NextResponse } from "next/server";

const DEMO_USER_ID = "demo-user";

export async function GET() {
  const receipts = listReceiptsByUser(DEMO_USER_ID);
  return NextResponse.json(receipts);
}
