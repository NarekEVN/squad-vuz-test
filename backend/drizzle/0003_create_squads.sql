CREATE TABLE "squad_members" (
	"squad_id" uuid NOT NULL,
	"character_id" integer NOT NULL,
	"position" smallint NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "squad_members_squad_id_character_id_pk" PRIMARY KEY("squad_id","character_id"),
	CONSTRAINT "squad_members_squad_id_position_key" UNIQUE("squad_id","position"),
	CONSTRAINT "squad_members_position_range" CHECK ("squad_members"."position" between 1 and 6)
);

CREATE TABLE "squads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "squad_members" ADD CONSTRAINT "squad_members_squad_id_squads_id_fk" FOREIGN KEY ("squad_id") REFERENCES "public"."squads"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "squad_members" ADD CONSTRAINT "squad_members_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "squads" ADD CONSTRAINT "squads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "squad_members_character_id_idx" ON "squad_members" USING btree ("character_id");
CREATE UNIQUE INDEX "squads_user_id_name_lower_key" ON "squads" USING btree ("user_id",lower("name"));