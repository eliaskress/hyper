import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { cascadeEvents, posts, assignments, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

// TODO: Replace with real admin auth check (session, JWT, or role-based)
function isAdmin(): boolean {
  return true;
}

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          code: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { page, limit } = parsed.data;
    const offset = (page - 1) * limit;

    // Alias tables for source and triggered post joins
    const sourcePost = db
      .select({
        id: posts.id,
        postUrl: posts.postUrl,
        assignmentId: posts.assignmentId,
      })
      .from(posts)
      .as("source_post");

    const triggeredPost = db
      .select({
        id: posts.id,
        postUrl: posts.postUrl,
        assignmentId: posts.assignmentId,
      })
      .from(posts)
      .as("triggered_post");

    const sourceAssignment = db
      .select({
        id: assignments.id,
        creatorId: assignments.creatorId,
      })
      .from(assignments)
      .as("source_assignment");

    const triggeredAssignment = db
      .select({
        id: assignments.id,
        creatorId: assignments.creatorId,
      })
      .from(assignments)
      .as("triggered_assignment");

    const sourceCreator = db
      .select({
        id: users.id,
        handle: users.handle,
      })
      .from(users)
      .as("source_creator");

    const triggeredCreator = db
      .select({
        id: users.id,
        handle: users.handle,
      })
      .from(users)
      .as("triggered_creator");

    const events = await db
      .select({
        id: cascadeEvents.id,
        sourcePostId: cascadeEvents.sourcePostId,
        triggeredPostId: cascadeEvents.triggeredPostId,
        brandId: cascadeEvents.brandId,
        hoursElapsed: cascadeEvents.hoursElapsed,
        detectionMethod: cascadeEvents.detectionMethod,
        detectedAt: cascadeEvents.detectedAt,
        sourcePostUrl: sourcePost.postUrl,
        triggeredPostUrl: triggeredPost.postUrl,
        sourceCreatorHandle: sourceCreator.handle,
        triggeredCreatorHandle: triggeredCreator.handle,
      })
      .from(cascadeEvents)
      .leftJoin(sourcePost, eq(cascadeEvents.sourcePostId, sourcePost.id))
      .leftJoin(
        triggeredPost,
        eq(cascadeEvents.triggeredPostId, triggeredPost.id),
      )
      .leftJoin(
        sourceAssignment,
        eq(sourcePost.assignmentId, sourceAssignment.id),
      )
      .leftJoin(
        triggeredAssignment,
        eq(triggeredPost.assignmentId, triggeredAssignment.id),
      )
      .leftJoin(
        sourceCreator,
        eq(sourceAssignment.creatorId, sourceCreator.id),
      )
      .leftJoin(
        triggeredCreator,
        eq(triggeredAssignment.creatorId, triggeredCreator.id),
      )
      .orderBy(desc(cascadeEvents.detectedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [totalResult] = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(cascadeEvents);

    const total = totalResult?.value ?? 0;

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
