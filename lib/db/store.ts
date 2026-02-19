import { randomUUID } from "crypto";
import type { ParsedReceipt, ReceiptItem, ReceiptRecord, ReceiptStatus } from "@/types/receipt";

const receipts = new Map<string, ReceiptRecord>();

const defaultParsed: ParsedReceipt = {
  merchantName: null,
  invoiceDate: null,
  currency: "USD",
  subtotal: null,
  tax: null,
  discount: null,
  total: null,
  summary: null
};

export function createReceipt(input: { userId: string; imageUrl: string }): ReceiptRecord {
  const now = new Date().toISOString();
  const receipt: ReceiptRecord = {
    id: randomUUID(),
    userId: input.userId,
    imageUrl: input.imageUrl,
    status: "pending",
    confidence: 0,
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
    items: [],
    ...defaultParsed
  };
  receipts.set(receipt.id, receipt);
  return receipt;
}

export function getReceiptById(receiptId: string): ReceiptRecord | undefined {
  return receipts.get(receiptId);
}

export function listReceiptsByUser(userId: string): ReceiptRecord[] {
  return [...receipts.values()].filter((receipt) => receipt.userId === userId);
}

export function updateReceipt(
  receiptId: string,
  patch: Partial<Omit<ReceiptRecord, "id" | "userId" | "createdAt">>
): ReceiptRecord | undefined {
  const existing = receipts.get(receiptId);
  if (!existing) {
    return undefined;
  }
  const next: ReceiptRecord = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString()
  };
  receipts.set(receiptId, next);
  return next;
}

export function updateReceiptStatus(receiptId: string, status: ReceiptStatus, errorMessage?: string): ReceiptRecord | undefined {
  return updateReceipt(receiptId, {
    status,
    errorMessage: errorMessage ?? null
  });
}

export function replaceReceiptItems(receiptId: string, items: Omit<ReceiptItem, "id" | "receiptId">[]): ReceiptRecord | undefined {
  const mappedItems: ReceiptItem[] = items.map((item) => ({
    ...item,
    id: randomUUID(),
    receiptId
  }));
  return updateReceipt(receiptId, { items: mappedItems });
}
