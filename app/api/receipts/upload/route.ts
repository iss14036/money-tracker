import { createReceipt } from "@/lib/db/store";
import { NextResponse } from "next/server";

const DEMO_USER_ID = "demo-user";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const receipt = createReceipt({
    userId: DEMO_USER_ID,
    imageUrl: `/uploads/${file.name}`
  });

  return NextResponse.json({ receiptId: receipt.id, status: receipt.status });
}
