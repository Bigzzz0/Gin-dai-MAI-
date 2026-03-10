import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Please set GEMINI_API_KEY in .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
// Using 2.5 Flash from available models list
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function analyzeFoodImage(imagePath: string) {
  console.log(`Analyzing image: ${imagePath}...`);
  
  if (!fs.existsSync(imagePath)) {
    console.error(`File not found: ${imagePath}`);
    return;
  }
  
  // Convert local file information to a GoogleGenerativeAI.Part object.
  function fileToGenerativePart(filePath: string, mimeType: string) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
        mimeType
      },
    };
  }
  
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
  const imagePart = fileToGenerativePart(imagePath, mimeType);
  
  const prompt = `
Role: You are an elite Food Safety and Culinary Expert alongside an advanced computer vision AI.
Task: Analyze the provided food or ingredient image for signs of mold, parasites, discoloration, spoilage, or hazardous toxins (e.g., Blue-ringed octopus). Identify the main food type or ingredient shown.

CRITICAL INSTRUCTIONS:
1. All analysis and output must be translated and returned in THAI language (except JSON keys and ENUMs).
2. ONLY output a 100% valid JSON payload. Do NOT include markdown code blocks (e.g., \`\`\`json) or any conversational text.

JSON Output Schema:
{
  "isFood": boolean, 
  "foodType": string, // Example: "เนื้อหมู" (Pork), "ปลาหมึก" (Squid)
  "safetyLevel": "SAFE" | "SUSPICIOUS" | "DANGEROUS",
  "confidence": number, // Output as float (0.0 - 1.0)
  "analysisDetail": string, // Provide a concise, highly-accurate explanation in THAI. State why the ingredient is safe or dangerous based on visual evidence.
  "boundingBoxes": [ // If nothing specific is detected, return an empty array []
    {
      "label": string, // Provide the label in THAI
      "x_min": number,
      "y_min": number,
      "x_max": number,
      "y_max": number
    }
  ]
}
  `;

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON
    try {
      // Remove any potential markdown wrappers that Gemini might add
      const cleanJson = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const jsonData = JSON.parse(cleanJson);
      console.log("\n=== 🎯 AI Analysis Result ===");
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (parseError) {
      console.error("\n❌ Error parsing JSON:");
      console.log("Raw Response:");
      console.log(text);
    }
    
  } catch (error) {
    console.error("API Error:");
    console.error(error);
  }
}

const imageArg = process.argv[2];
if (imageArg) {
  analyzeFoodImage(path.resolve(imageArg));
} else {
  console.log("Usage: npm run test-ai <path-to-image>");
}
