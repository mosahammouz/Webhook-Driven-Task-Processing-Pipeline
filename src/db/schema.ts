import { int } from "drizzle-orm/mysql-core";
import { varchar,serial,pgTable, text, jsonb, timestamp,integer } from "drizzle-orm/pg-core";
import { pipeline } from "node:stream";
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
export const subscribers = pgTable("subscribers",{
  id: serial("id").primaryKey(), // is automatically handled
  pipelineId: text("pipeline_id").notNull().references(()=>pipelines.id,{onDelete: "cascade"}),
  url: text("url").notNull(),
  status: varchar("status", { length: 20 }).default("active"),
});

export const deliveryAttempts = pgTable("delivery_attempts",{
  id: serial("id").primaryKey(),
  jobId: text("job_id").notNull().references(()=>jobs.id,{onDelete: "cascade"}),
  subscriberId: integer("subscriber_id").notNull().references(()=> subscribers.id,{onDelete: "cascade"}), 
  attemptsNumber: integer("attempts_number").notNull(),
  status: varchar("status",{length: 20}).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
