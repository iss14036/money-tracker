export type ReceiptStatus = "pending" | "processing" | "done" | "needs_review" | "failed";

export interface ReceiptItem {
  id: string;
  receiptId: string;
  lineNo: number;
  name: string;
  quantity: number | null;
  unitPrice: number | null;
  lineTotal: number;
  confidence: number;
}

export interface ParsedReceipt {
  merchantName: string | null;
  invoiceDate: string | null;
  currency: string;
  subtotal: number | null;
  tax: number | null;
  discount: number | null;
  total: number | null;
  summary: string | null;
}

export interface ReceiptRecord extends ParsedReceipt {
  id: string;
  userId: string;
  imageUrl: string;
  status: ReceiptStatus;
  confidence: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  items: ReceiptItem[];
  rawText?: string;
}
