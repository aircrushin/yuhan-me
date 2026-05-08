CREATE TABLE "experience" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" varchar(200) NOT NULL,
	"company" varchar(200) NOT NULL,
	"location" varchar(200) DEFAULT '' NOT NULL,
	"start_date" varchar(32) NOT NULL,
	"end_date" varchar(32),
	"description" text DEFAULT '' NOT NULL,
	"url" varchar(400) DEFAULT '' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(200) NOT NULL,
	"locale" varchar(8) DEFAULT 'en' NOT NULL,
	"title" varchar(240) NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"content_md" text DEFAULT '' NOT NULL,
	"cover_url" text DEFAULT '' NOT NULL,
	"published_at" timestamp with time zone,
	"is_draft" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"name" varchar(120) DEFAULT 'aircrushin' NOT NULL,
	"headline" text DEFAULT 'Building thoughtful tools on the web.' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"avatar_url" text DEFAULT 'https://avatars.githubusercontent.com/u/88492452?v=4' NOT NULL,
	"location" varchar(120) DEFAULT 'Chengdu, China' NOT NULL,
	"currently" text DEFAULT '' NOT NULL,
	"email" varchar(200) DEFAULT '' NOT NULL,
	"github" varchar(200) DEFAULT 'https://github.com/aircrushin' NOT NULL,
	"x" varchar(200) DEFAULT '' NOT NULL,
	"linkedin" varchar(200) DEFAULT '' NOT NULL,
	"resume_url" varchar(400) DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repos" (
	"github_id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"full_name" varchar(300) NOT NULL,
	"description" text,
	"html_url" text NOT NULL,
	"homepage" text,
	"language" varchar(80),
	"stars" integer DEFAULT 0 NOT NULL,
	"forks_count" integer DEFAULT 0 NOT NULL,
	"topics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_fork" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"pushed_at" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_visible" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"custom_title" varchar(200),
	"custom_description" text,
	"custom_cover_url" text
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"category" varchar(80) DEFAULT 'Tools' NOT NULL,
	"level" integer DEFAULT 3 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
