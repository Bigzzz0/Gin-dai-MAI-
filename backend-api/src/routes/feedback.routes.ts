import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";
import { verifyAuth } from "./auth.routes";

const VALID_ISSUE_TYPES = [
    "WRONG_FOOD_TYPE",
    "WRONG_SAFETY_LEVEL",
    "NOT_FOOD",
    "OTHER",
] as const;

type IssueType = (typeof VALID_ISSUE_TYPES)[number];

export async function feedbackRoutes(fastify: FastifyInstance) {
    /**
     * POST /scans/:scanId/feedback
     * Report an incorrect AI result for a given scan.
     * Body: { issueType: string, comment?: string }
     */
    fastify.post("/:scanId/feedback", {
        preHandler: [verifyAuth],
    }, async (request: FastifyRequest, reply: FastifyReply) => {

        const supabaseUser = (request as any).supabaseUser;
        const { scanId } = request.params as { scanId: string };
        const { issueType, comment } = request.body as {
            issueType: string;
            comment?: string;
        };

        // Validate issueType
        if (!issueType || !VALID_ISSUE_TYPES.includes(issueType as IssueType)) {
            return reply.status(400).send({
                error: `issueType must be one of: ${VALID_ISSUE_TYPES.join(", ")}`,
            });
        }

        // Validate comment length
        if (comment && comment.length > 500) {
            return reply.status(400).send({
                error: "comment must be 500 characters or less",
            });
        }

        // Resolve internal user ID
        const user = await prisma.user.findUnique({
            where: { supabaseAuthId: supabaseUser.id },
            select: { id: true },
        });

        if (!user) {
            return reply.status(404).send({ error: "User not found" });
        }

        // Verify the scan belongs to this user
        const scan = await prisma.scanHistory.findFirst({
            where: { id: scanId, userId: user.id },
            select: { id: true },
        });

        if (!scan) {
            return reply.status(404).send({ error: "Scan not found" });
        }

        // Create feedback record
        try {
            const feedback = await prisma.scanFeedback.create({
                data: {
                    scanId,
                    userId: user.id,
                    issueType: issueType as IssueType,
                    comment: comment?.trim() ?? null,
                },
            });

            return reply.status(201).send({
                success: true,
                feedbackId: feedback.id,
                message: "Feedback submitted successfully. Thank you for helping us improve!",
            });
        } catch (err: any) {
            fastify.log.error("Feedback save failed:", err);
            return reply.status(500).send({ error: "Failed to save feedback" });
        }
    });
}
