import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const items = pgTable("items", {
  id: serial().primaryKey(),
  name: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
