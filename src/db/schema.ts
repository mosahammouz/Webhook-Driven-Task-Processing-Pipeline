import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
export const pipelines = pgTable("pipelines", {
  id: text("id").primaryKey(),
  webhookPath: text("webhook_path").notNull(),
  actionType: text("action_type").notNull(),
  actionConfig: jsonb("action_config").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
