CREATE TABLE "pipelines" (
	"id" text PRIMARY KEY NOT NULL,
	"webhook_path" text NOT NULL,
	"action_type" text NOT NULL,
	"action_config" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
