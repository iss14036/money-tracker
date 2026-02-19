# Money Tracker

Money Tracker is a Next.js + TypeScript prototype for uploading receipt images, running OCR, parsing totals and line items, and reviewing/editing extracted data.

## Features

- Receipt upload flow (`/upload`) with client-side polling for processing state.
- OCR + parsing pipeline through API routes.
- Editable receipt detail page for correction and save.
- Dashboard showing receipt count, total spend, and review-needed count.
- In-memory data store for fast local prototyping (no DB required yet).

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Node.js runtime APIs

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or a compatible package manager)

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Available Scripts

- `npm run dev` – start local dev server.
- `npm run build` – production build.
- `npm run start` – run production server.
- `npm run lint` – run Next.js lint checks.
- `npm run typecheck` – run TypeScript type checking.

## Current User Flow

1. Start at `/upload` and submit an image/text file.
2. `POST /api/receipts/upload` creates a pending receipt record.
3. `POST /api/receipts/:id/process` runs OCR + parsing and updates status.
4. Client polls `GET /api/receipts/:id/status` until final state.
5. Open `/receipts/:id` to review extracted values and save edits.
6. View `/dashboard` for quick spend/review metrics.

## API Endpoints (Implemented)

- `GET /api/receipts` – list demo user receipts.
- `POST /api/receipts/upload` – upload receipt file and create record.
- `POST /api/receipts/:id/process` – run OCR/parse processing.
- `GET /api/receipts/:id/status` – fetch processing/result status.
- `GET /api/receipts/:id` – fetch detailed receipt data.
- `PUT /api/receipts/:id` – save user corrections.

## Project Structure

```text
app/
  api/receipts/...       # upload/process/status/detail/list endpoints
  dashboard/page.tsx     # summary metrics and recent receipts
  receipts/[id]/page.tsx # editable receipt details
  upload/page.tsx        # upload + polling UI
lib/
  db/store.ts            # in-memory receipt store
  ocr/tesseract.ts       # OCR wrapper
  parse/                 # parser + validation logic
types/receipt.ts         # shared receipt types
docs/implementation-plan.md
```

## Notes

- The app currently uses a hard-coded demo user and an in-memory store, so data resets when the server restarts.
- OCR/parsing behavior is intentionally simple for MVP iteration.
- See `docs/implementation-plan.md` for architecture and roadmap details.
