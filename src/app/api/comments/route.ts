import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { comments } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";

interface CommentRequestBody {
  author: string;
  body: string;
  post_slug: string;
}

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // Fetch comments based on post_slug query parameter
  const { searchParams } = new URL(request.url);
  const postSlug = searchParams.get("post_slug");

  if (!postSlug) {
    return NextResponse.json(
      { error: "Post slug is required" },
      { status: 400 }
    );
  }

  const result = await db
    .select()
    .from(comments)
    .where(eq(comments.post_slug, postSlug));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  // Cast the JSON body to the expected type
  const { author, body, post_slug } =
    (await request.json()) as CommentRequestBody;

  // Validate required fields
  if (!author || !body || !post_slug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Fetch the highest ID in the comments table
  const maxIdResult = await db
    .select({ maxId: sql`MAX(${comments.id})` })
    .from(comments);
  const maxId = (maxIdResult[0]?.maxId as number) ?? 0; // Fallback to 0 if no comments exist
  const newId = maxId + 1; // Increment ID by 1

  // Insert the new comment into the database
  const newComment = await db.insert(comments).values({
    id: newId,
    author,
    body,
    post_slug,
  });

  return NextResponse.json(newComment);
}
