import type { Config } from "@netlify/functions";
import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "../../db/index.js";
import { items } from "../../db/schema.js";

// Hash both values so the comparison is constant-time regardless of length.
function tokensMatch(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }

  const expected = process.env.API_TOKEN;
  const provided = req.headers.get("x-api-token");
  if (!expected || !provided || !tokensMatch(provided, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const [item] = await db.insert(items).values({ name }).returning();
  return Response.json(item, { status: 200 });
};

export const config: Config = {
  path: "/api/sync",
};
