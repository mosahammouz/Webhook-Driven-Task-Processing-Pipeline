CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"pipeline_id" text NOT NULL,
	"url" text NOT NULL,
	"status" varchar(20) DEFAULT 'active'
);
--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE cascade ON UPDATE no action;