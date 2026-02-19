import type { ParsedReceipt, ReceiptItem } from "@/types/receipt";
import { validateLineItemSum, validateTotals } from "@/lib/parse/validators";

interface ParsedOutput {
  parsed: ParsedReceipt;
  items: Omit<ReceiptItem, "id" | "receiptId">[];
  confidence: number;
}

function parseAmount(text: string, label: string): number | null {
  const regex = new RegExp(`${label}[^\\d]*(\\d+[.,]?\\d*)`, "i");
  const match = text.match(regex);
  return match ? Number(match[1].replace(",", ".")) : null;
}

export function parseReceiptText(rawText: string): ParsedOutput {
  const merchantLine = rawText.split("\n").find((line) => /mart|store|cafe|shop|market/i.test(line));
  const dateMatch = rawText.match(/(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/);

  const subtotal = parseAmount(rawText, "subtotal");
  const tax = parseAmount(rawText, "tax");
  const discount = parseAmount(rawText, "discount") ?? 0;
  const total = parseAmount(rawText, "total");

  const items = rawText
    .split("\n")
    .map((line, idx) => {
      const row = line.match(/^([\w\s\-]+?)\s+(\d+)\s*[xX]\s*(\d+[.,]?\d*)\s+(\d+[.,]?\d*)$/);
      if (!row) {
        return null;
      }
      return {
        lineNo: idx + 1,
        name: row[1].trim(),
        quantity: Number(row[2]),
        unitPrice: Number(row[3].replace(",", ".")),
        lineTotal: Number(row[4].replace(",", ".")),
        confidence: 0.8
      };
    })
    .filter((item): item is Omit<ReceiptItem, "id" | "receiptId"> => Boolean(item));

  const parsed: ParsedReceipt = {
    merchantName: merchantLine?.trim() ?? null,
    invoiceDate: dateMatch?.[1] ?? null,
    currency: "USD",
    subtotal,
    tax,
    discount,
    total,
    summary: merchantLine && total ? `${merchantLine.trim()} purchase totaling $${total.toFixed(2)}.` : null
  };

  let confidence = 0.9;
  const totalValidation = validateTotals(parsed);
  if (!totalValidation.valid) {
    confidence -= 0.25;
  }

  const tempItems: ReceiptItem[] = items.map((item, idx) => ({
    ...item,
    id: `${idx}`,
    receiptId: "temp"
  }));
  const lineValidation = validateLineItemSum(tempItems, subtotal);
  if (!lineValidation.valid) {
    confidence -= 0.15;
  }

  if (!parsed.merchantName || !parsed.invoiceDate) {
    confidence -= 0.1;
  }

  return {
    parsed,
    items,
    confidence: Math.max(0.1, Number(confidence.toFixed(2)))
  };
}
