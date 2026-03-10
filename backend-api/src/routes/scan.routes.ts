import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { verifyAuth } from "./auth.routes";
import { analyzeImageBuffer } from "../services/ai.service";
import { uploadImageToStorage } from "../services/supabase.service";
import { prisma } from "../lib/prisma";

// ─── Routes ──────────────────────────────────────────────────────────────────

export async function scanRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/scans/analyze
   * Main endpoint: receives an image, runs AI analysis, saves result to DB.
   * Flow: Auth -> Validate File -> Upload Storage -> AI Analyze -> Save DB -> Return Result
   */
  fastify.post("/analyze", {
    preHandler: [verifyAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const supabaseUser = (request as any).supabaseUser;

    // 1. Get the user from our DB
    const user = await prisma.user.findUnique({
      where: { supabaseAuthId: supabaseUser.id },
    });

    if (!user) {
      return reply.status(403).send({ error: "User not synced. Call /auth/sync first." });
    }

    // 2. Parse the uploaded file (multipart)
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: "No image file provided" });
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(data.mimetype)) {
      return reply.status(400).send({
        error: "Invalid file type. Only JPEG, PNG, and WebP are supported.",
      });
    }

    // 3. Read buffer from stream
    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const imageBuffer = Buffer.concat(chunks);

    if (imageBuffer.length > 10 * 1024 * 1024) {
      return reply.status(400).send({ error: "File too large. Max 10MB." });
    }

    // 4. Upload image to Supabase Storage
    const fileExt = data.mimetype.split("/")[1];
    const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
    let imageUrl: string;

    try {
      imageUrl = await uploadImageToStorage(imageBuffer, fileName, data.mimetype);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Failed to upload image to storage" });
    }

    // 5. Call AI Service (Gemini Vision)
    let aiResult;
    try {
      aiResult = await analyzeImageBuffer(
        imageBuffer,
        data.mimetype as any
      );
    } catch (err: any) {
      fastify.log.error("AI analysis failed:", err);
      return reply.status(500).send({ error: "AI analysis failed. Please try again." });
    }

    // 6. Save scan result to database
    let scanRecord;
    try {
      scanRecord = await prisma.scanHistory.create({
        data: {
          userId: user.id,
          imageUrl,
          foodType: aiResult.foodType,
          safetyLevel: aiResult.safetyLevel,
          aiConfidence: aiResult.confidence,
          aiResponseJson: aiResult as any,
        },
      });
    } catch (err: any) {
      fastify.log.error("DB save failed:", err);
      return reply.status(500).send({ error: "Failed to save scan result" });
    }

    // 7. Return response to client
    return reply.status(201).send({
      success: true,
      scanId: scanRecord.id,
      imageUrl: scanRecord.imageUrl,
      result: aiResult,
    });
  });
}
