import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Money Tracker",
  description: "Receipt upload and OCR workflow"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <nav>
            <Link href="/upload">Upload</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
