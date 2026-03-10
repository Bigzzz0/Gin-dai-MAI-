import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Please set GEMINI_API_KEY in .env file");
  process.exit(1);
}

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
        console.log("=== Available Models ===");
        data.models.forEach((m: any) => {
            console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods?.join(", ")})`);
        });
    } else {
        console.log("Response:", data);
    }
  } catch(e) {
      console.error(e);
  }
}

listModels();
