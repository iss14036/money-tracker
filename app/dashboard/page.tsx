"use client";

import { useEffect, useMemo, useState } from "react";

interface ReceiptSummary {
  id: string;
  merchantName: string | null;
  total: number | null;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [receipts, setReceipts] = useState<ReceiptSummary[]>([]);

  useEffect(() => {
    fetch("/api/receipts")
      .then((response) => response.json())
      .then((data) => setReceipts(data));
  }, []);

  const totals = useMemo(() => {
    return receipts.reduce(
      (acc, receipt) => {
        if (receipt.total) {
          acc.totalSpend += receipt.total;
        }
        if (receipt.status === "needs_review") {
          acc.reviewCount += 1;
        }
        return acc;
      },
      { totalSpend: 0, reviewCount: 0 }
    );
  }, [receipts]);

  return (
    <section className="grid">
      <div className="card">
        <h1>Dashboard</h1>
        <p>Total receipts: {receipts.length}</p>
        <p>Total spend: ${totals.totalSpend.toFixed(2)}</p>
        <p>Needs review: {totals.reviewCount}</p>
      </div>
      <div className="card">
        <h2>Recent Receipts</h2>
        <ul>
          {receipts.map((receipt) => (
            <li key={receipt.id}>
              {receipt.merchantName ?? "Unknown merchant"} - {receipt.status} - ${receipt.total ?? 0}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
