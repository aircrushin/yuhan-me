CREATE TABLE "travel_dumps" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"photo_wall_url" text NOT NULL,
	"place_id" text,
	"location_name" varchar(240) DEFAULT '' NOT NULL,
	"formatted_address" text DEFAULT '' NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"google_maps_url" text DEFAULT '' NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
