ALTER TABLE "messages" ADD COLUMN "forward_status" varchar(32) DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "forward_error" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "forwarded_at" timestamp with time zone;