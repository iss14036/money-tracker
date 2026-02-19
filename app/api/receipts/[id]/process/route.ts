import { getReceiptById, replaceReceiptItems, updateReceipt, updateReceiptStatus } from "@/lib/db/store";
import { runTesseractOCR } from "@/lib/ocr/tesseract";
import { parseReceiptText } from "@/lib/parse/receipt-parser";
import { NextResponse } from "next/server";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const receipt = getReceiptById(params.id);

  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  updateReceiptStatus(receipt.id, "processing");

  try {
    const imagePayload = Buffer.from(receipt.imageUrl);
    const ocrResult = await runTesseractOCR(imagePayload);
    const parsedOutput = parseReceiptText(ocrResult.rawText);

    replaceReceiptItems(receipt.id, parsedOutput.items);
    updateReceipt(receipt.id, {
      ...parsedOutput.parsed,
      rawText: ocrResult.rawText,
      confidence: parsedOutput.confidence,
      status: parsedOutput.confidence >= 0.75 ? "done" : "needs_review",
      errorMessage: null
    });

    return NextResponse.json({ status: "processing" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OCR error";
    updateReceiptStatus(receipt.id, "failed", message);
    return NextResponse.json({ status: "failed", errorMessage: message }, { status: 500 });
  }
}
