ALTER TABLE "games" ADD COLUMN "cover" text NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_cover_unique" UNIQUE("cover");