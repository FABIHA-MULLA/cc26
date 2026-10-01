import type { Config, Context } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { items } from "../../db/schema.js";

export default async (req: Request, context: Context) => {
  if (req.method === "GET") {
    const allItems = await db.select().from(items).orderBy(desc(items.createdAt));
    return Response.json(allItems);
  }

  if (req.method === "POST") {
    let body: { name?: unknown };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const [item] = await db.insert(items).values({ name }).returning();
    return Response.json(item, { status: 201 });
  }

  if (req.method === "DELETE") {
    const rawId = context.params.id ?? new URL(req.url).searchParams.get("id");
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ error: "A valid id is required" }, { status: 400 });
    }

    const [deleted] = await db.delete(items).where(eq(items.id, id)).returning();
    if (!deleted) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }
    return Response.json(deleted);
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/items", "/api/items/:id"],
};
