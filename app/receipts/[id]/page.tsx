"use client";

import { FormEvent, useEffect, useState } from "react";

interface ReceiptItem {
  name: string;
  quantity: number | null;
  unitPrice: number | null;
  lineTotal: number;
}

interface ReceiptDetails {
  id: string;
  merchantName: string | null;
  invoiceDate: string | null;
  subtotal: number | null;
  tax: number | null;
  discount: number | null;
  total: number | null;
  summary: string | null;
  confidence: number;
  status: string;
  items: ReceiptItem[];
}

export default function ReceiptDetailPage({ params }: { params: { id: string } }) {
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/receipts/${params.id}`)
      .then((response) => response.json())
      .then((data) => setReceipt(data));
  }, [params.id]);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!receipt) {
      return;
    }

    setSaving(true);
    const formData = new FormData(event.currentTarget);

    const payload = {
      merchantName: String(formData.get("merchantName") ?? ""),
      invoiceDate: String(formData.get("invoiceDate") ?? ""),
      subtotal: Number(formData.get("subtotal") ?? 0),
      tax: Number(formData.get("tax") ?? 0),
      discount: Number(formData.get("discount") ?? 0),
      total: Number(formData.get("total") ?? 0),
      summary: String(formData.get("summary") ?? "")
    };

    const response = await fetch(`/api/receipts/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const updated = await response.json();
    setReceipt(updated);
    setSaving(false);
  }

  if (!receipt) {
    return <p>Loading...</p>;
  }

  return (
    <section className="grid">
      <div className="card">
        <h1>Receipt Detail</h1>
        <p>Status: {receipt.status}</p>
        <p>Confidence: {Math.round(receipt.confidence * 100)}%</p>
      </div>
      <form onSubmit={onSave} className="card grid">
        <label>
          Merchant
          <input name="merchantName" defaultValue={receipt.merchantName ?? ""} />
        </label>
        <label>
          Invoice Date
          <input name="invoiceDate" defaultValue={receipt.invoiceDate ?? ""} />
        </label>
        <label>
          Subtotal
          <input name="subtotal" type="number" step="0.01" defaultValue={receipt.subtotal ?? 0} />
        </label>
        <label>
          Tax
          <input name="tax" type="number" step="0.01" defaultValue={receipt.tax ?? 0} />
        </label>
        <label>
          Discount
          <input name="discount" type="number" step="0.01" defaultValue={receipt.discount ?? 0} />
        </label>
        <label>
          Total
          <input name="total" type="number" step="0.01" defaultValue={receipt.total ?? 0} />
        </label>
        <label>
          Summary
          <textarea name="summary" defaultValue={receipt.summary ?? ""} />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save corrections"}
        </button>
      </form>
    </section>
  );
}
