import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIScanResult {
  isFood: boolean;
  foodType: string;
  safetyLevel: "SAFE" | "SUSPICIOUS" | "DANGEROUS";
  confidence: number;
  analysisDetail: string;
  boundingBoxes: Array<{
    label: string;
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  }>;
}

// ─── Prompt ──────────────────────────────────────────────────────────────────

const FOOD_SAFETY_PROMPT = `
Role: You are an elite Food Safety and Culinary Expert alongside an advanced computer vision AI.
Task: Analyze the provided food or ingredient image for signs of mold, parasites, discoloration, spoilage, or hazardous toxins (e.g., Blue-ringed octopus). Identify the main food type or ingredient shown.

CRITICAL INSTRUCTIONS:
1. All analysis and output must be translated and returned in THAI language (except JSON keys and ENUMs).
2. ONLY output a 100% valid JSON payload. Do NOT include markdown code blocks (e.g., \`\`\`json) or any conversational text.
3. Be highly accurate and conservative: if uncertain, lean toward SUSPICIOUS rather than SAFE.

JSON Output Schema:
{
  "isFood": boolean,
  "foodType": string,
  "safetyLevel": "SAFE" | "SUSPICIOUS" | "DANGEROUS",
  "confidence": number,
  "analysisDetail": string,
  "boundingBoxes": [
    {
      "label": string,
      "x_min": number,
      "y_min": number,
      "x_max": number,
      "y_max": number
    }
  ]
}
`;

// ─── Main Analysis Function ───────────────────────────────────────────────────

/**
 * Analyzes a food image buffer using Gemini Vision API
 */
export async function analyzeImageBuffer(
  imageBuffer: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/webp"
): Promise<AIScanResult> {
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType,
    },
  };

  const result = await model.generateContent([FOOD_SAFETY_PROMPT, imagePart]);
  const response = await result.response;
  const rawText = response.text();

  // Strip markdown wrappers if the model includes them
  const cleanJson = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const parsed: AIScanResult = JSON.parse(cleanJson);
  return parsed;
}

/**
 * Analyzes a food image from a local file path (for testing)
 */
export async function analyzeImageFile(imagePath: string): Promise<AIScanResult> {
  const buffer = fs.readFileSync(imagePath);
  const ext = imagePath.toLowerCase().split(".").pop();
  const mimeType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return analyzeImageBuffer(buffer, mimeType as any);
}
