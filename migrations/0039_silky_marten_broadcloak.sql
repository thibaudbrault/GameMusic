CREATE TABLE IF NOT EXISTS "games_authors" (
	"game_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	CONSTRAINT "games_authors_game_id_author_id_pk" PRIMARY KEY("game_id","author_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "history" (
	"user_id" uuid NOT NULL,
	"music_id" uuid NOT NULL,
	"listened_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "history_user_id_music_id_pk" PRIMARY KEY("user_id","music_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "games_authors" ADD CONSTRAINT "games_authors_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "games_authors" ADD CONSTRAINT "games_authors_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "history" ADD CONSTRAINT "history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "history" ADD CONSTRAINT "history_music_id_musics_id_fk" FOREIGN KEY ("music_id") REFERENCES "public"."musics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
