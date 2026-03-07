import { pgTable, text, jsonb, timestamp,integer } from "drizzle-orm/pg-core";
export const pipelines = pgTable("pipelines", {
  id: text("id").primaryKey(),
  webhookPath: text("webhook_path").notNull(),
  actionType: text("action_type").notNull(),
  actionConfig: jsonb("action_config").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  pipelineId: text("pipeline_id").notNull().references(() => pipelines.id, { onDelete: "cascade" }),
  payload: jsonb("payload").notNull(),
  status: text("status").notNull().default("pending"),  // pending | processing | completed | failed
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
