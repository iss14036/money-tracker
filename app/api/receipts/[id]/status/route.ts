import { getReceiptById } from "@/lib/db/store";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const receipt = getReceiptById(params.id);

  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  if (receipt.status === "pending" || receipt.status === "processing") {
    return NextResponse.json({ status: receipt.status });
  }

  if (receipt.status === "failed") {
    return NextResponse.json({ status: receipt.status, errorMessage: receipt.errorMessage });
  }

  return NextResponse.json({
    status: receipt.status,
    confidence: receipt.confidence,
    parsed: {
      merchant: receipt.merchantName,
      invoiceDate: receipt.invoiceDate,
      subtotal: receipt.subtotal,
      tax: receipt.tax,
      discount: receipt.discount,
      total: receipt.total,
      currency: receipt.currency,
      summary: receipt.summary,
      items: receipt.items
    }
  });
}
