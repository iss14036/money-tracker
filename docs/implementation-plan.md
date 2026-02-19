# Money Tracker Implementation Plan (Next.js + TypeScript + Tesseract)

## Locked Technical Choices

- **Frontend + backend:** Next.js (App Router) with TypeScript.
- **OCR (phase 1):** Tesseract OCR first (self-hosted, low cost).
- **Processing model:** async API call + simple DB status polling.
- **Primary goals:** upload receipt/invoice image, parse line items/totals, editable review, save summary.

## Architecture Overview

1. User uploads image from Next.js UI.
2. API stores file and creates a `receipt` row with status `pending`.
3. API enqueues async processing (background worker or detached job endpoint).
4. OCR + parser writes structured fields and updates status to `done` or `needs_review`.
5. Client polls `GET /api/receipts/:id/status` until completion.
6. User reviews/edits parsed data, then saves finalized receipt.

## MVP Scope

### In scope
- Email auth.
- Receipt image upload.
- Async OCR processing.
- Parsed fields:
  - merchant
  - invoice date
  - subtotal
  - tax
  - discount
  - total
  - line items (name, qty, unit price, line total)
- Confidence score and review UI.
- Transaction list and detail page.

### Out of scope (for now)
- Multi-user organizations.
- Multi-currency conversion.
- Advanced fraud detection.
- Native mobile app.

## Data Model (MVP)

### `receipts`
- `id` (uuid, pk)
- `user_id` (uuid, fk)
- `image_url` (text)
- `status` (`pending` | `processing` | `done` | `needs_review` | `failed`)
- `merchant_name` (text)
- `invoice_date` (date)
- `currency` (text)
- `subtotal` (numeric)
- `tax` (numeric)
- `discount` (numeric)
- `total` (numeric)
- `summary` (text)
- `confidence` (numeric)
- `error_message` (text)
- `created_at`, `updated_at` (timestamp)

### `receipt_items`
- `id` (uuid, pk)
- `receipt_id` (uuid, fk)
- `line_no` (int)
- `name` (text)
- `quantity` (numeric)
- `unit_price` (numeric)
- `line_total` (numeric)
- `confidence` (numeric)

### `receipt_raw_ocr`
- `id` (uuid, pk)
- `receipt_id` (uuid, fk)
- `raw_text` (text)
- `raw_blocks_json` (jsonb)
- `provider` (text, default `tesseract`)
- `created_at` (timestamp)

## API Contract (MVP)

- `POST /api/receipts/upload`
  - input: multipart file
  - output: `{ receiptId, status: "pending" }`

- `POST /api/receipts/:id/process`
  - starts/continues async processing
  - output: `{ status: "processing" }`

- `GET /api/receipts/:id/status`
  - output:
    - pending/processing: `{ status }`
    - done/needs_review: `{ status, confidence, parsed }`
    - failed: `{ status, errorMessage }`

- `PUT /api/receipts/:id`
  - updates parsed fields/items after user edits

- `GET /api/receipts`
  - list receipts for current user

- `GET /api/receipts/:id`
  - full receipt detail with items + summary

## Async + Polling Design

### Server behavior
- `upload` endpoint creates receipt with `pending`.
- A background step sets `processing`, runs OCR/parser, then final status.
- Writes progress timestamps for observability.

### Client behavior
- After upload, call process endpoint.
- Poll `/status` every 2 seconds (max ~60 seconds).
- Stop polling when final state (`done`, `needs_review`, `failed`).
- Show retry button if failed.

## OCR and Parsing Pipeline

1. **Image preprocessing**
   - normalize orientation
   - grayscale + contrast boost
   - optional resize/compress
2. **Tesseract OCR**
   - extract text + positions (if enabled)
3. **Field extraction rules**
   - regex for date/currency/amounts
   - keyword mapping for subtotal/tax/discount/total
4. **Line-item parser**
   - detect rows containing trailing amount patterns
   - infer quantity and unit price when possible
5. **Validation checks**
   - item sum vs subtotal tolerance
   - subtotal + tax - discount vs total tolerance
6. **Confidence scoring**
   - lower confidence when consistency checks fail
7. **Summary generation**
   - simple rule-based summary sentence

## Directory Blueprint

- `app/`
  - `upload/page.tsx`
  - `receipts/[id]/page.tsx`
  - `dashboard/page.tsx`
- `app/api/receipts/`
  - `upload/route.ts`
  - `[id]/status/route.ts`
  - `[id]/process/route.ts`
  - `[id]/route.ts`
- `lib/ocr/tesseract.ts`
- `lib/parse/receipt-parser.ts`
- `lib/parse/validators.ts`
- `lib/db/` (queries + schema)

## Implementation Timeline (Low-Cost)

### Week 1
- Initialize Next.js + TS project structure.
- Build auth and DB schema.
- Implement upload endpoint and receipt list/detail pages.

### Week 2
- Implement Tesseract OCR wrapper.
- Build parser for totals + line items.
- Add async process endpoint + polling UI.

### Week 3
- Add editable review UI and save corrections.
- Add confidence display and validation warnings.
- Add dashboard totals by date/category.

### Week 4
- Improve parser accuracy using real sample receipts.
- Add retries, failure handling, and metrics logs.
- Prepare deployment and basic monitoring.

## Acceptance Criteria

- User can upload receipt and see processing progress.
- At least 85% accuracy for totals/date/merchant on sample set.
- At least 75% line-item extraction baseline.
- User can correct fields and persist final result.
- Average processing under 8 seconds for normal image quality.

## Next Step (Immediate)

Start by scaffolding API routes and DB schema first, then wire the upload-to-polling flow end-to-end before improving parsing accuracy.
