import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getSupabaseAdmin } from "../services/supabase.service";
import { prisma } from "../lib/prisma";

// ─── Auth Middleware (exported for reuse) ─────────────────────────────────────

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);

  if (error || !data.user) {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }

  // Attach user to request for downstream use
  (request as any).supabaseUser = data.user;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

export async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/auth/sync
   * Called after a successful Supabase Auth login on the frontend.
   * Ensures a User record exists in our PostgreSQL database.
   */
  fastify.post("/sync", {
    preHandler: [verifyAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const supabaseUser = (request as any).supabaseUser;

    try {
      // Upsert: create user if not exists, or return existing
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
      });

      return reply.status(200).send({ success: true, user });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Failed to sync user" });
    }
  });

  /**
   * GET /api/v1/auth/me
   * Returns the current logged-in user's profile from our DB.
   */
  fastify.get("/me", {
    preHandler: [verifyAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const supabaseUser = (request as any).supabaseUser;

    const user = await prisma.user.findUnique({
      where: { supabaseAuthId: supabaseUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: { select: { scans: true } },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: "User not found. Please sync first." });
    }

    return reply.status(200).send({ user });
  });

  /**
   * PUT /api/v1/auth/profile
   * Update user profile (name, avatar URL, etc.)
   */
  fastify.put("/profile", {
    preHandler: [verifyAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const supabaseUser = (request as any).supabaseUser;
    const body = request.body as { name?: string; avatarUrl?: string };

    // Update user in our database
    const user = await prisma.user.update({
      where: { supabaseAuthId: supabaseUser.id },
      data: {
        name: body.name,
      },
    });

    // Update Supabase auth metadata using admin REST API
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      try {
        await fetch(`${supabaseUrl}/auth/v1/admin/users/${supabaseUser.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_metadata: {
              display_name: body.name,
              avatar_url: body.avatarUrl,
            },
          }),
        });
      } catch (error: any) {
        fastify.log.error({ err: error }, 'Failed to update Supabase user metadata');
        // Continue anyway - local DB update succeeded
      }
    }

    return reply.status(200).send({ user });
  });
}
