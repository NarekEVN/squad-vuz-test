CREATE TYPE "public"."ability_name" AS ENUM('Mobility', 'Technique', 'Survivability', 'Power', 'Energy');--> statement-breakpoint
CREATE TABLE "character_abilities" (
	"character_id" integer NOT NULL,
	"ability" "ability_name" NOT NULL,
	"score" smallint NOT NULL,
	CONSTRAINT "character_abilities_character_id_ability_pk" PRIMARY KEY("character_id","ability"),
	CONSTRAINT "character_abilities_score_range" CHECK ("character_abilities"."score" between 1 and 10)
);

CREATE TABLE "character_tags" (
	"character_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"slot" smallint NOT NULL,
	CONSTRAINT "character_tags_character_id_tag_id_pk" PRIMARY KEY("character_id","tag_id"),
	CONSTRAINT "character_tags_character_slot_key" UNIQUE("character_id","slot"),
	CONSTRAINT "character_tags_slot_positive" CHECK ("character_tags"."slot" >= 1)
);

CREATE TABLE "characters" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"quote" text,
	"image" text NOT NULL,
	"thumbnail" text,
	"universe_id" integer NOT NULL
);

CREATE TABLE "tags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);

CREATE TABLE "universes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "universes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	CONSTRAINT "universes_name_unique" UNIQUE("name")
);

ALTER TABLE "character_abilities" ADD CONSTRAINT "character_abilities_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_tags" ADD CONSTRAINT "character_tags_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_tags" ADD CONSTRAINT "character_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_universe_id_universes_id_fk" FOREIGN KEY ("universe_id") REFERENCES "public"."universes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "character_tags_tag_id_character_id_idx" ON "character_tags" USING btree ("tag_id","character_id");
CREATE INDEX "characters_name_id_idx" ON "characters" USING btree ("name","id");
CREATE INDEX "characters_name_trgm_idx" ON "characters" USING gin (lower("name") gin_trgm_ops);
CREATE INDEX "characters_universe_id_idx" ON "characters" USING btree ("universe_id");