import { getReceiptById, listReceiptsByUser, replaceReceiptItems, updateReceipt } from "@/lib/db/store";
import { NextResponse } from "next/server";

const DEMO_USER_ID = "demo-user";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const receipt = getReceiptById(params.id);

  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  return NextResponse.json(receipt);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const receipt = getReceiptById(params.id);

  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  const updated = updateReceipt(params.id, {
    merchantName: body.merchantName ?? receipt.merchantName,
    invoiceDate: body.invoiceDate ?? receipt.invoiceDate,
    subtotal: body.subtotal ?? receipt.subtotal,
    tax: body.tax ?? receipt.tax,
    discount: body.discount ?? receipt.discount,
    total: body.total ?? receipt.total,
    summary: body.summary ?? receipt.summary,
    confidence: body.confidence ?? receipt.confidence,
    status: "done"
  });

  if (Array.isArray(body.items)) {
    replaceReceiptItems(params.id, body.items);
  }

  return NextResponse.json(updated);
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function HEAD() {
  return new Response(null, { status: 405 });
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ["GET", "PUT"] });
}

export async function dynamicGetReceipts() {
  return NextResponse.json(listReceiptsByUser(DEMO_USER_ID));
}
