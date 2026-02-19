export interface OcrResult {
  rawText: string;
  blocks: Array<{ text: string; confidence: number }>;
}

export async function runTesseractOCR(imageBuffer: Buffer): Promise<OcrResult> {
  const simulatedText = imageBuffer.toString("utf8").slice(0, 800).trim();

  return {
    rawText:
      simulatedText ||
      "Demo Mart\nInvoice Date: 2026-01-05\nSubtotal 24.00\nTax 2.40\nTotal 26.40\nCoffee 2 x 6.00 12.00\nSandwich 2 x 6.00 12.00",
    blocks: [{ text: "simulated", confidence: 0.7 }]
  };
}
