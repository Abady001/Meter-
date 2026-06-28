/*
  Warnings:

  - The primary key for the `login_attempts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `refresh_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- CreateEnum
CREATE TYPE "core"."user_status" AS ENUM ('active', 'inactive', 'locked', 'suspended');

-- CreateEnum
CREATE TYPE "core"."audit_action_type" AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'assign', 'unassign', 'approve', 'reject', 'correct', 'generate', 'issue', 'cancel');

-- CreateEnum
CREATE TYPE "core"."notification_type" AS ENUM ('email', 'sms', 'push', 'in_app');

-- CreateEnum
CREATE TYPE "core"."reference_object_type" AS ENUM ('invoice', 'payment', 'adjustment', 'reading', 'assignment', 'customer', 'meter');

-- CreateEnum
CREATE TYPE "core"."settlement_status" AS ENUM ('pending', 'in_progress', 'settled', 'disputed');

-- CreateEnum
CREATE TYPE "core"."zone_type" AS ENUM ('country', 'governorate', 'city', 'district', 'area');

-- AlterTable
ALTER TABLE "audit_log" ADD COLUMN     "hash" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "login_attempts" DROP CONSTRAINT "login_attempts_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "attempted_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "revoked_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");

-- DropEnum
DROP TYPE "login_attempt_status";

-- CreateTable
CREATE TABLE "project_thresholds" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "meter_type" "meter_type" NOT NULL,
    "max_consumption_per_day" DECIMAL(12,3),
    "max_consumption_per_month" DECIMAL(12,3),
    "min_consumption_per_month" DECIMAL(12,3),
    "alert_on_negative_consumption" BOOLEAN DEFAULT true,
    "alert_on_zero_consumption" BOOLEAN DEFAULT false,
    "alert_on_spike" BOOLEAN DEFAULT true,
    "spike_multiplier" DECIMAL(5,2) DEFAULT 3.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_thresholds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" TEXT,
    "status" "core"."user_status" NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMP(3),
    "password_changed_at" TIMESTAMP(3),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "refresh_token_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."roles" (
    "id" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "role_code" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."permissions" (
    "id" TEXT NOT NULL,
    "permission_code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."user_role_assignments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "area_id" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" TEXT NOT NULL,

    CONSTRAINT "user_role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."areas" (
    "id" TEXT NOT NULL,
    "area_code" TEXT NOT NULL,
    "area_name" TEXT NOT NULL,
    "database_name" TEXT NOT NULL,
    "connection_string" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."projects" (
    "id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "project_code" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "location_json" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."audit_log" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "action_type" "core"."audit_action_type" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "area_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."system_config" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "config_key" TEXT NOT NULL,
    "config_value" JSONB NOT NULL,
    "data_type" TEXT NOT NULL DEFAULT 'string',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."notification_queue" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "notification_type" "core"."notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "reference_type" "core"."reference_object_type" NOT NULL,
    "reference_id" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notification_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."payment_centers" (
    "id" TEXT NOT NULL,
    "center_code" TEXT NOT NULL,
    "center_name" TEXT NOT NULL,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "area_id" TEXT NOT NULL,

    CONSTRAINT "payment_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."bank_accounts" (
    "id" TEXT NOT NULL,
    "payment_center_id" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "branch_name" TEXT,
    "iban" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."holidays" (
    "id" TEXT NOT NULL,
    "area_id" TEXT,
    "holiday_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."location_zones" (
    "id" TEXT NOT NULL,
    "parent_zone_id" TEXT,
    "zone_code" TEXT NOT NULL,
    "zone_name" TEXT NOT NULL,
    "zone_type" "core"."zone_type" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."unit_types" (
    "id" TEXT NOT NULL,
    "type_code" TEXT NOT NULL,
    "type_name" TEXT NOT NULL,
    "meter_type_default" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."customer_groups" (
    "id" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."settlements" (
    "id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "status" "core"."settlement_status" NOT NULL DEFAULT 'pending',
    "total_invoiced" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "total_collected" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "variance" DECIMAL(14,3),
    "settled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_thresholds_project_id_key" ON "project_thresholds"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "core"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "core"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_code_key" ON "core"."roles"("role_code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_permission_code_key" ON "core"."permissions"("permission_code");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "core"."role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "areas_area_code_key" ON "core"."areas"("area_code");

-- CreateIndex
CREATE UNIQUE INDEX "projects_area_id_project_code_key" ON "core"."projects"("area_id", "project_code");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "core"."audit_log"("created_at");

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "core"."audit_log"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "core"."audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_module_config_key_key" ON "core"."system_config"("module", "config_key");

-- CreateIndex
CREATE INDEX "notification_queue_user_id_is_read_idx" ON "core"."notification_queue"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notification_queue_sent_at_idx" ON "core"."notification_queue"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_centers_center_code_key" ON "core"."payment_centers"("center_code");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_area_id_holiday_date_key" ON "core"."holidays"("area_id", "holiday_date");

-- CreateIndex
CREATE INDEX "location_zones_parent_zone_id_idx" ON "core"."location_zones"("parent_zone_id");

-- CreateIndex
CREATE UNIQUE INDEX "unit_types_type_code_key" ON "core"."unit_types"("type_code");

-- CreateIndex
CREATE UNIQUE INDEX "settlements_area_id_period_start_period_end_key" ON "core"."settlements"("area_id", "period_start", "period_end");

-- AddForeignKey
ALTER TABLE "core"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "core"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "core"."permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."user_role_assignments" ADD CONSTRAINT "user_role_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."user_role_assignments" ADD CONSTRAINT "user_role_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "core"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."projects" ADD CONSTRAINT "projects_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "core"."areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."notification_queue" ADD CONSTRAINT "notification_queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."payment_centers" ADD CONSTRAINT "payment_centers_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "core"."areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."bank_accounts" ADD CONSTRAINT "bank_accounts_payment_center_id_fkey" FOREIGN KEY ("payment_center_id") REFERENCES "core"."payment_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."holidays" ADD CONSTRAINT "holidays_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "core"."areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."location_zones" ADD CONSTRAINT "location_zones_parent_zone_id_fkey" FOREIGN KEY ("parent_zone_id") REFERENCES "core"."location_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."settlements" ADD CONSTRAINT "settlements_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "core"."areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
