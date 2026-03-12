import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { analyzeImageBuffer } from "../services/ai.service";
import { uploadImageToStorage } from "../services/supabase.service";
import { prisma } from "../lib/prisma";
import { verifyAuth } from "./auth.routes";
import fs from "fs";

export async function scanRoutes(fastify: FastifyInstance) {
  fastify.post("/analyze", {
    preHandler: [verifyAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {

    const supabaseUser = (request as any).supabaseUser;

    // Auto-upsert user
    const user = await prisma.user.upsert({
      where: { supabaseAuthId: supabaseUser.id },
      update: {
        email: supabaseUser.email ?? "",
        name: supabaseUser.user_metadata?.full_name ?? null,
      },
      create: {
        supabaseAuthId: supabaseUser.id,
        email: supabaseUser.email ?? "",
        name: supabaseUser.user_metadata?.full_name ?? null,
      },
      select: { id: true },
    });

    // 1. Save all multipart files to a temp location (handles both file & field parts cleanly)
    let savedFiles: any[];
    try {
      savedFiles = await request.saveRequestFiles();
    } catch (err: any) {
      fastify.log.error("multipart parse failed:", err);
      return reply.status(400).send({ error: "Failed to parse request. Please try again." });
    }

    // Extract the image file part and optional 'note' text field
    const imagePart = savedFiles.find((f) => f.fieldname === "file" && f.type === "file");
    const notePart = savedFiles.find((f) => f.fieldname === "note" && f.type === "field");
    const userNote: string | undefined = notePart ? (notePart as any).value : undefined;

    if (!imagePart) {
      return reply.status(400).send({ error: "No image file provided" });
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(imagePart.mimetype)) {
      return reply.status(400).send({
        error: "Invalid file type. Only JPEG, PNG, and WebP are supported.",
      });
    }

    // 2. Read the temp file into a buffer
    let imageBuffer: Buffer;
    try {
      imageBuffer = fs.readFileSync(imagePart.filepath);
    } catch (err) {
      return reply.status(500).send({ error: "Failed to read uploaded file." });
    }

    if (imageBuffer.length > 10 * 1024 * 1024) {
      return reply.status(400).send({ error: "File too large. Max 10MB." });
    }

    // 3. Upload image to Supabase Storage
    const fileExt = imagePart.mimetype.split("/")[1];
    const storageFileName = `${user.id}/${uuidv4()}.${fileExt}`;
    let imageUrl: string;

    try {
      imageUrl = await uploadImageToStorage(imageBuffer, storageFileName, imagePart.mimetype);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Failed to upload image to storage" });
    }

    // 4. Call AI Service (Gemini Vision) — user note appended AFTER the system prompt
    let aiResult;
    try {
      aiResult = await analyzeImageBuffer(
        imageBuffer,
        imagePart.mimetype as any,
        userNote?.trim() || undefined
      );
    } catch (err: any) {
      fastify.log.error("AI analysis failed:", err);
      return reply.status(500).send({ error: "AI analysis failed. Please try again." });
    }

    // 5. Save scan result to database
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
          userNote: userNote?.trim() ?? null,
        },
      });
    } catch (err: any) {
      fastify.log.error("DB save failed:", err);
      return reply.status(500).send({ error: "Failed to save scan result" });
    }

    // 6. Return response to client
    return reply.status(201).send({
      success: true,
      scanId: scanRecord.id,
      imageUrl: scanRecord.imageUrl,
      result: aiResult,
    });
  });
}