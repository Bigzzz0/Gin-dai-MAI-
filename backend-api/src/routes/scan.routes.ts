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

    // 1. Manually iterate over parts to see what exactly is coming in
    let imageBuffer: Buffer | null = null;
    let imageMimetype = "";
    let userNote: string | undefined = undefined;

    try {
      for await (const part of request.parts()) {
        fastify.log.info(`Received part: ${part.type} | name: ${part.fieldname} | mimetype: ${part.type === 'file' ? part.mimetype : 'N/A'}`);
        if (part.type === 'file' && part.fieldname === 'file') {
          imageMimetype = part.mimetype;
          imageBuffer = await part.toBuffer();
        } else if (part.type === 'field' && part.fieldname === 'note') {
          userNote = part.value as string;
        } else if (part.type === 'field' && part.fieldname === 'file') {
          // If RN fetch sent the file as a string field due to stringification error
          fastify.log.error(`File was received as a text FIELD with value: ${part.value}`);
        }
      }
    } catch (err: any) {
      fastify.log.error("multipart parse failed:", err);
      return reply.status(400).send({ error: "Failed to parse request. Please try again." });
    }

    if (!imageBuffer) {
      fastify.log.warn("400 Error: No image file provided in FormData");
      return reply.status(400).send({ error: "No image file provided" });
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(imageMimetype)) {
      fastify.log.warn(`400 Error: Invalid file type ${imageMimetype}`);
      return reply.status(400).send({
        error: "Invalid file type. Only JPEG, PNG, and WebP are supported.",
      });
    }

    if (imageBuffer.length > 10 * 1024 * 1024) {
      fastify.log.warn("400 Error: File too large");
      return reply.status(400).send({ error: "File too large. Max 10MB." });
    }

    // 3. Upload image to Supabase Storage
    const fileExt = imageMimetype.split("/")[1];
    const storageFileName = `${user.id}/${uuidv4()}.${fileExt}`;
    let imageUrl: string;

    try {
      imageUrl = await uploadImageToStorage(imageBuffer, storageFileName, imageMimetype);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Failed to upload image to storage" });
    }

    // 4. Call AI Service (Gemini Vision) — user note appended AFTER the system prompt
    let aiResult;
    try {
      aiResult = await analyzeImageBuffer(
        imageBuffer,
        imageMimetype as any,
        userNote?.trim() || undefined
      );
    } catch (err: any) {
      fastify.log.error({
        msg: "AI analysis failed detailed error",
        error: err.message,
        stack: err.stack,
        details: err.response?.data || err
      });
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