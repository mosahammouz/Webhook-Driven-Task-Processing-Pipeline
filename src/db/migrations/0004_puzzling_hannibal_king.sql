CREATE TABLE "idempotency_keys" (
	"key" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"status" varchar(20) DEFAULT 'processing' NOT NULL,
	"response" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;