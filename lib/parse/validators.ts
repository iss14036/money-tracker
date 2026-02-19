import type { ParsedReceipt, ReceiptItem } from "@/types/receipt";

const TOLERANCE = 0.05;

export function validateTotals(parsed: ParsedReceipt): { valid: boolean; message: string | null } {
  if (parsed.subtotal === null || parsed.tax === null || parsed.total === null) {
    return { valid: false, message: "Missing subtotal/tax/total fields." };
  }

  const expected = parsed.subtotal + parsed.tax - (parsed.discount ?? 0);
  const valid = Math.abs(expected - parsed.total) <= TOLERANCE;

  return {
    valid,
    message: valid ? null : `Total mismatch: expected ${expected.toFixed(2)}, got ${parsed.total.toFixed(2)}`
  };
}

export function validateLineItemSum(items: ReceiptItem[], subtotal: number | null): { valid: boolean; message: string | null } {
  if (subtotal === null || items.length === 0) {
    return { valid: false, message: "Missing subtotal or items." };
  }

  const sum = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const valid = Math.abs(sum - subtotal) <= TOLERANCE;

  return {
    valid,
    message: valid ? null : `Line-item sum mismatch: expected ${subtotal.toFixed(2)}, got ${sum.toFixed(2)}`
  };
}
