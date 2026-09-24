import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperAdminDashboardMigrations1790229038502 implements MigrationInterface {
  name = 'SuperAdminDashboardMigrations1790229038502';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_307d33f2236732c3831616d355"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscriptions_plan_enum" AS ENUM('free', 'plus', 'pro')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('active', 'trialing', 'cancelled', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "user_id" uuid NOT NULL, "plan" "public"."subscriptions_plan_enum" NOT NULL DEFAULT 'free', "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'active', "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE, "cancelled_at" TIMESTAMP WITH TIME ZONE, "payment_ref" character varying(255), "provider" character varying(50), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_56e2153971e20e7443fa42455f" ON "subscriptions" ("user_id", "plan") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1a15756e257e0eaf01edc85645" ON "subscriptions" ("user_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."onboarding_leads_status_enum" AS ENUM('new', 'contacted', 'qualified', 'converted', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "onboarding_leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "first_name" character varying(255) NOT NULL, "last_name" character varying(255) NOT NULL, "email" citext NOT NULL, "phone_number" character varying(30) NOT NULL, "state" character varying(100) NOT NULL, "inverter_type" character varying(255) NOT NULL, "interest" character varying(255) NOT NULL, "source" character varying(100) NOT NULL, "message" text, "status" "public"."onboarding_leads_status_enum" NOT NULL DEFAULT 'new', "assigned_admin_id" uuid, CONSTRAINT "PK_9557dd7d181f299f4e73f2487a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_845dcfca67d96fa27d290de34d" ON "onboarding_leads" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4f8fc95c5851ddd9a6e401a9cb" ON "onboarding_leads" ("email") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."installer_profiles_type_enum" AS ENUM('partner', 'technician')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."installer_profiles_status_enum" AS ENUM('active', 'pending', 'suspended')`,
    );
    await queryRunner.query(
      `CREATE TABLE "installer_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "user_id" uuid NOT NULL, "type" "public"."installer_profiles_type_enum" NOT NULL, "company_name" character varying(255), "contact_name" character varying(255) NOT NULL, "email" citext NOT NULL, "phone_number" character varying(30), "state" character varying(100), "region" character varying(100), "supported_brands" text array NOT NULL DEFAULT '{}', "status" "public"."installer_profiles_status_enum" NOT NULL DEFAULT 'pending', "notes" text, CONSTRAINT "PK_2d06f81f9df4ac9a88e9811d599" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_772243c1cbe2da993d1c32782a" ON "installer_profiles" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4921a33efd84380da3c43b41c4" ON "installer_profiles" ("email") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_326e7889fb1e9907fdcc319815" ON "installer_profiles" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inverter_assignments_role_enum" AS ENUM('viewer', 'technician')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inverter_assignments_status_enum" AS ENUM('active', 'revoked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "inverter_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "inverter_id" uuid NOT NULL, "installer_profile_id" uuid NOT NULL, "assigned_by_user_id" uuid, "role" "public"."inverter_assignments_role_enum" NOT NULL DEFAULT 'technician', "status" "public"."inverter_assignments_status_enum" NOT NULL DEFAULT 'active', "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_095e5080696fc39aae029c76faa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dcaaeb1ee137fc3a27b26f164b" ON "inverter_assignments" ("inverter_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3dc7a78b3ddb27be6c638a44be" ON "inverter_assignments" ("installer_profile_id", "status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8c8522bd83c1700b3cdb9d410e" ON "inverter_assignments" ("inverter_id", "installer_profile_id") WHERE "status" = 'active'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."feedback_priority_enum" AS ENUM('low', 'medium', 'high')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."feedback_status_enum" AS ENUM('open', 'in_progress', 'resolved')`,
    );
    await queryRunner.query(
      `CREATE TABLE "feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "user_id" uuid, "name" character varying(255), "email" citext, "category" character varying(100) NOT NULL, "priority" "public"."feedback_priority_enum" NOT NULL DEFAULT 'medium', "message" text NOT NULL, "status" "public"."feedback_status_enum" NOT NULL DEFAULT 'open', "admin_note" text, "resolved_at" TIMESTAMP WITH TIME ZONE, "resolved_by_admin_id" uuid, CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5eaaf43e357d7c8ed7450ac2ad" ON "feedback" ("priority") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b58070b64dd68964f5a71ff021" ON "feedback" ("status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ai_usage_events_event_type_enum" AS ENUM('chat_message', 'title_generation', 'card_generation')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ai_usage_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "user_id" uuid NOT NULL, "chat_id" uuid, "event_type" "public"."ai_usage_events_event_type_enum" NOT NULL, "input_tokens" integer NOT NULL DEFAULT '0', "output_tokens" integer NOT NULL DEFAULT '0', "total_tokens" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_6c8045e563128d5468acd8e2900" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3a5f0bbe64016722da71204a9b" ON "ai_usage_events" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dfd6a0c25c75389c9571b8d1c3" ON "ai_usage_events" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_admin_status_enum" AS ENUM('active', 'invited', 'disabled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "admin_status" "public"."users_admin_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'super_admin', 'user', 'installer')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "inverter_members" DROP CONSTRAINT "FK_a626669cf750724d142ccc06145"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inverter_members" ALTER COLUMN "invited_by_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_74214514d3277cadfe67a55b4b" ON "inverter_members" ("inverter_id", "email") WHERE "status" != 'deactivated'`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inverter_members" ADD CONSTRAINT "FK_a626669cf750724d142ccc06145" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_leads" ADD CONSTRAINT "FK_d3e69b8855f4819b816dced6057" FOREIGN KEY ("assigned_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "installer_profiles" ADD CONSTRAINT "FK_326e7889fb1e9907fdcc3198150" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inverter_assignments" ADD CONSTRAINT "FK_4e9a91d7319fc1cc536d2b4a3ea" FOREIGN KEY ("inverter_id") REFERENCES "inverters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inverter_assignments" ADD CONSTRAINT "FK_17e43073ebd0bd8bcd832949d0e" FOREIGN KEY ("installer_profile_id") REFERENCES "installer_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inverter_assignments" ADD CONSTRAINT "FK_b084bdcfd925b36fce2e78353e5" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_121c67d42dd543cca0809f59901" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_8af7edf489f2b596c859178307c" FOREIGN KEY ("resolved_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_events" ADD CONSTRAINT "FK_8d28f9f4f8488049e7e8cef4fe6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_events" ADD CONSTRAINT "FK_08d9a047e100cbd35af5b0db934" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ai_usage_events" DROP CONSTRAINT "FK_08d9a047e100cbd35af5b0db934"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_events" DROP CONSTRAINT "FK_8d28f9f4f8488049e7e8cef4fe6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" DROP CONSTRAINT "FK_8af7edf489f2b596c859178307c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" DROP CONSTRAINT "FK_121c67d42dd543cca0809f59901"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inverter_assignments" DROP CONSTRAINT "FK_b084bdcfd925b36fce2e78353e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inverter_assignments" DROP CONSTRAINT "FK_17e43073ebd0bd8bcd832949d0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inverter_assignments" DROP CONSTRAINT "FK_4e9a91d7319fc1cc536d2b4a3ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "installer_profiles" DROP CONSTRAINT "FK_326e7889fb1e9907fdcc3198150"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_leads" DROP CONSTRAINT "FK_d3e69b8855f4819b816dced6057"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inverter_members" DROP CONSTRAINT "FK_a626669cf750724d142ccc06145"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_74214514d3277cadfe67a55b4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inverter_members" ALTER COLUMN "invited_by_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "inverter_members" ADD CONSTRAINT "FK_a626669cf750724d142ccc06145" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum_old" AS ENUM('admin', 'user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "admin_status"`);
    await queryRunner.query(`DROP TYPE "public"."users_admin_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dfd6a0c25c75389c9571b8d1c3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3a5f0bbe64016722da71204a9b"`,
    );
    await queryRunner.query(`DROP TABLE "ai_usage_events"`);
    await queryRunner.query(
      `DROP TYPE "public"."ai_usage_events_event_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b58070b64dd68964f5a71ff021"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5eaaf43e357d7c8ed7450ac2ad"`,
    );
    await queryRunner.query(`DROP TABLE "feedback"`);
    await queryRunner.query(`DROP TYPE "public"."feedback_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."feedback_priority_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8c8522bd83c1700b3cdb9d410e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3dc7a78b3ddb27be6c638a44be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dcaaeb1ee137fc3a27b26f164b"`,
    );
    await queryRunner.query(`DROP TABLE "inverter_assignments"`);
    await queryRunner.query(
      `DROP TYPE "public"."inverter_assignments_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."inverter_assignments_role_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_326e7889fb1e9907fdcc319815"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4921a33efd84380da3c43b41c4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_772243c1cbe2da993d1c32782a"`,
    );
    await queryRunner.query(`DROP TABLE "installer_profiles"`);
    await queryRunner.query(
      `DROP TYPE "public"."installer_profiles_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."installer_profiles_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4f8fc95c5851ddd9a6e401a9cb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_845dcfca67d96fa27d290de34d"`,
    );
    await queryRunner.query(`DROP TABLE "onboarding_leads"`);
    await queryRunner.query(
      `DROP TYPE "public"."onboarding_leads_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1a15756e257e0eaf01edc85645"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_56e2153971e20e7443fa42455f"`,
    );
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."subscriptions_plan_enum"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_307d33f2236732c3831616d355" ON "inverter_members" ("inverter_id", "email") WHERE (status <> 'deactivated'::inverter_members_status_enum)`,
    );
  }
}
