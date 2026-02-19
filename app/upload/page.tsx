"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => file !== null, [file]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      return;
    }

    setError(null);
    setStatus("uploading");

    const form = new FormData();
    form.append("file", file);

    const uploadRes = await fetch("/api/receipts/upload", { method: "POST", body: form });
    const uploadJson = await uploadRes.json();

    if (!uploadRes.ok) {
      setError(uploadJson.error ?? "Upload failed");
      setStatus("failed");
      return;
    }

    setReceiptId(uploadJson.receiptId);
    setStatus(uploadJson.status);

    await fetch(`/api/receipts/${uploadJson.receiptId}/process`, { method: "POST" });
    setStatus("processing");

    const interval = setInterval(async () => {
      const statusRes = await fetch(`/api/receipts/${uploadJson.receiptId}/status`);
      const statusJson = await statusRes.json();

      setStatus(statusJson.status);
      if (["done", "needs_review", "failed"].includes(statusJson.status)) {
        clearInterval(interval);
      }
    }, 2000);
  }

  return (
    <section className="grid">
      <div className="card">
        <h1>Upload Receipt</h1>
        <form onSubmit={handleUpload} className="grid">
          <input
            type="file"
            accept="image/*,text/plain"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <button type="submit" disabled={!canSubmit}>
            Upload & Process
          </button>
        </form>
        {status ? <p>Status: {status}</p> : null}
        {error ? <p>Error: {error}</p> : null}
        {receiptId ? (
          <button type="button" onClick={() => router.push(`/receipts/${receiptId}`)}>
            Open receipt detail
          </button>
        ) : null}
      </div>
    </section>
  );
}
