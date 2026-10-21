CREATE TYPE "public"."simplycode_user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "simplycode_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "simplycode_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"body" text,
	"author_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simplycode_sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simplycode_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp,
	"image" text,
	"password_hash" text,
	"role" "simplycode_user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "simplycode_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "simplycode_verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "simplycode_verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "simplycode_accounts" ADD CONSTRAINT "simplycode_accounts_user_id_simplycode_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."simplycode_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simplycode_posts" ADD CONSTRAINT "simplycode_posts_author_id_simplycode_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."simplycode_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simplycode_sessions" ADD CONSTRAINT "simplycode_sessions_user_id_simplycode_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."simplycode_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "simplycode_accounts_provider_account_unique" ON "simplycode_accounts" USING btree ("provider","provider_account_id");