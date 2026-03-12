import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { verifyAuth } from "./auth.routes";
import { prisma } from "../lib/prisma";

// ─── Routes ──────────────────────────────────────────────────────────────────

export async function historyRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/v1/history
   * Returns paginated scan history for the current user.
   * Query params: ?page=1&limit=20
   */
  fastify.get("/", {
    preHandler: [verifyAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const supabaseUser = (request as any).supabaseUser;
    const query = request.query as { page?: string; limit?: string };

    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? "20", 10)));
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { supabaseAuthId: supabaseUser.id },
      select: { id: true },
    });

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const [scans, total] = await prisma.$transaction([
      prisma.scanHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          imageUrl: true,
          foodType: true,
          safetyLevel: true,
          aiConfidence: true,
          createdAt: true,
          aiResponseJson: true,
          userNote: true,
        },
      }),
      prisma.scanHistory.count({ where: { userId: user.id } }),
    ]);

    return reply.status(200).send({
      data: scans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * GET /api/v1/history/:id
   * Returns full details of a specific scan, including the AI response JSON.
   */
  fastify.get("/:id", {
    preHandler: [verifyAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const supabaseUser = (request as any).supabaseUser;
    const { id } = request.params as { id: string };

    const user = await prisma.user.findUnique({
      where: { supabaseAuthId: supabaseUser.id },
      select: { id: true },
    });

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const scan = await prisma.scanHistory.findFirst({
      where: {
        id,
        userId: user.id, // Ownership check - users can only read their own scans
      },
    });

    if (!scan) {
      return reply.status(404).send({ error: "Scan not found" });
    }

    return reply.status(200).send({ data: scan });
  });

  /**
   * DELETE /api/v1/history/:id
   * Deletes a specific scan from history (user can only delete their own scans).
   */
  fastify.delete("/:id", {
    preHandler: [verifyAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const supabaseUser = (request as any).supabaseUser;
    const { id } = request.params as { id: string };

    const user = await prisma.user.findUnique({
      where: { supabaseAuthId: supabaseUser.id },
      select: { id: true },
    });

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    // Check ownership before deleting
    const scan = await prisma.scanHistory.findFirst({
      where: { id, userId: user.id },
    });

    if (!scan) {
      return reply.status(404).send({ error: "Scan not found or not authorized" });
    }

    await prisma.scanHistory.delete({ where: { id } });

    return reply.status(200).send({ success: true, message: "Scan deleted successfully" });
  });
}
