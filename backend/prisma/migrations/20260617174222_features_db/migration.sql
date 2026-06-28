-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "features";

-- CreateEnum
CREATE TYPE "features"."tariff_charge_mode" AS ENUM ('STEPS', 'FLAT', 'STATIC', 'PER_UNIT', 'ZERO');

-- CreateEnum
CREATE TYPE "features"."tariff_settlement_type" AS ENUM ('FIXED', 'PERCENTAGE', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "features"."billing_cycle_status" AS ENUM ('OPEN', 'LOCKED', 'APPROVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "features"."wallet_transaction_type" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'ALLOCATION', 'REFUND');

-- CreateEnum
CREATE TYPE "features"."wallet_transfer_status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "features"."chilled_water_allocation_method" AS ENUM ('PROPORTIONAL', 'FIXED', 'METERED');

-- CreateEnum
CREATE TYPE "features"."settlement_rule_type" AS ENUM ('FIXED_PERCENTAGE', 'TIERED', 'FORMULA', 'MANUAL');

-- CreateEnum
CREATE TYPE "features"."document_status" AS ENUM ('DRAFT', 'FINAL', 'ARCHIVED');

-- CreateTable
CREATE TABLE "features"."tariffs" (
    "id" TEXT NOT NULL,
    "tariff_code" TEXT NOT NULL,
    "tariff_name" TEXT NOT NULL,
    "description" TEXT,
    "utility_type" "utility_type" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "tariffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."tariff_versions" (
    "id" TEXT NOT NULL,
    "tariff_id" TEXT NOT NULL,
    "version_no" INTEGER NOT NULL,
    "change_log" TEXT NOT NULL,
    "approved_by" TEXT NOT NULL,
    "approved_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tariff_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."tariff_charges" (
    "id" TEXT NOT NULL,
    "tariff_id" TEXT NOT NULL,
    "charge_code" TEXT NOT NULL,
    "charge_name" TEXT NOT NULL,
    "charge_mode" "features"."tariff_charge_mode" NOT NULL,
    "settlement_type" "features"."tariff_settlement_type" NOT NULL,
    "rate_amount" DECIMAL(14,6),
    "unit_of_measure" TEXT,
    "min_charge" DECIMAL(14,3),
    "max_charge" DECIMAL(14,3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "tariff_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."tariff_charge_details" (
    "id" TEXT NOT NULL,
    "charge_id" TEXT NOT NULL,
    "step_from" DECIMAL(14,3),
    "step_to" DECIMAL(14,3),
    "step_rate" DECIMAL(14,6),
    "step_amount" DECIMAL(14,3),
    "is_percentage" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tariff_charge_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."report_definitions" (
    "id" TEXT NOT NULL,
    "report_code" TEXT NOT NULL,
    "report_name" TEXT NOT NULL,
    "report_category" TEXT NOT NULL,
    "description" TEXT,
    "parameters" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "report_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."report_exports" (
    "id" TEXT NOT NULL,
    "report_def_id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "filters" JSONB,
    "file_url" TEXT,
    "file_size" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "requested_by" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "report_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."scheduled_jobs" (
    "id" TEXT NOT NULL,
    "job_name" TEXT NOT NULL,
    "job_type" TEXT NOT NULL,
    "cron_expression" TEXT NOT NULL,
    "parameters" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "scheduled_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."export_history" (
    "id" TEXT NOT NULL,
    "export_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "record_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "error_message" TEXT,
    "requested_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "export_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."running_activities" (
    "id" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "reference_type" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "progress_pct" INTEGER NOT NULL DEFAULT 0,
    "started_by" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "running_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."contractual_requests" (
    "id" TEXT NOT NULL,
    "request_code" TEXT NOT NULL,
    "request_type" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "project_id" TEXT,
    "customer_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "request_data" JSONB NOT NULL,
    "approval_data" JSONB,
    "requested_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractual_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."wallet_accounts" (
    "id" TEXT NOT NULL,
    "account_code" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "balance" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "wallet_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."wallet_transactions" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "transaction_code" TEXT NOT NULL,
    "transaction_type" "features"."wallet_transaction_type" NOT NULL,
    "amount" DECIMAL(14,3) NOT NULL,
    "balance_before" DECIMAL(14,3) NOT NULL,
    "balance_after" DECIMAL(14,3) NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performed_by" TEXT NOT NULL,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."wallet_balances" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "balance_date" TIMESTAMP(3) NOT NULL,
    "opening_balance" DECIMAL(14,3) NOT NULL,
    "closing_balance" DECIMAL(14,3) NOT NULL,
    "total_debit" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "total_credit" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."wallet_allocations" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "allocation_code" TEXT NOT NULL,
    "allocated_amount" DECIMAL(14,3) NOT NULL,
    "used_amount" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "purpose" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "expires_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "wallet_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."wallet_transfers" (
    "id" TEXT NOT NULL,
    "transfer_code" TEXT NOT NULL,
    "source_account_id" TEXT NOT NULL,
    "target_account_id" TEXT NOT NULL,
    "amount" DECIMAL(14,3) NOT NULL,
    "fee" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "status" "features"."wallet_transfer_status" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "performed_by" TEXT NOT NULL,

    CONSTRAINT "wallet_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."chilled_water_configs" (
    "id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "config_code" TEXT NOT NULL,
    "allocation_method" "features"."chilled_water_allocation_method" NOT NULL,
    "base_rate" DECIMAL(14,6) NOT NULL,
    "peak_rate" DECIMAL(14,6),
    "off_peak_rate" DECIMAL(14,6),
    "service_charge" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "billing_cycle" TEXT NOT NULL DEFAULT 'monthly',
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "chilled_water_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."chilled_water_readings" (
    "id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "reading_date" TIMESTAMP(3) NOT NULL,
    "reading_value" DECIMAL(12,3) NOT NULL,
    "previous_reading" DECIMAL(12,3),
    "consumption" DECIMAL(12,3),
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "recorded_by" TEXT NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chilled_water_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."chilled_water_consumptions" (
    "id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_consumed" DECIMAL(12,3) NOT NULL,
    "peak_consumed" DECIMAL(12,3),
    "off_peak_consumed" DECIMAL(12,3),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chilled_water_consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."chilled_water_invoices" (
    "id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "consumption_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "consumption_amount" DECIMAL(14,3) NOT NULL,
    "service_charge" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issued_at" TIMESTAMP(3),
    "due_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chilled_water_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."chilled_water_allocations" (
    "id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "allocated_amount" DECIMAL(14,3) NOT NULL,
    "allocation_pct" DECIMAL(5,2) NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chilled_water_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."settlement_configs" (
    "id" TEXT NOT NULL,
    "config_code" TEXT NOT NULL,
    "config_name" TEXT NOT NULL,
    "rule_type" "features"."settlement_rule_type" NOT NULL,
    "formula" TEXT,
    "base_value" DECIMAL(14,6),
    "min_value" DECIMAL(14,3),
    "max_value" DECIMAL(14,3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "settlement_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."settlement_periods" (
    "id" TEXT NOT NULL,
    "period_code" TEXT NOT NULL,
    "period_name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "settlement_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."settlement_rules" (
    "id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "rule_code" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "rule_type" "features"."settlement_rule_type" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions" JSONB,
    "formula" TEXT,
    "rate_value" DECIMAL(14,6),
    "min_threshold" DECIMAL(14,3),
    "max_threshold" DECIMAL(14,3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "settlement_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."settlement_transactions" (
    "id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "transaction_code" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "amount" DECIMAL(14,3) NOT NULL,
    "fee" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(14,3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "description" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settlement_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."settlement_allocations" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "allocated_amount" DECIMAL(14,3) NOT NULL,
    "allocation_pct" DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settlement_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."billing_cycles" (
    "id" TEXT NOT NULL,
    "cycle_code" TEXT NOT NULL,
    "cycle_name" TEXT NOT NULL,
    "status" "features"."billing_cycle_status" NOT NULL DEFAULT 'OPEN',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "lock_date" TIMESTAMP(3),
    "approve_date" TIMESTAMP(3),
    "close_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "billing_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."billing_cycle_projects" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "status" "features"."billing_cycle_status" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_cycle_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."billing_cycle_approvals" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "project_id" TEXT,
    "approved_by" TEXT NOT NULL,
    "approved_role" TEXT NOT NULL,
    "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "comments" TEXT,

    CONSTRAINT "billing_cycle_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."billing_cycle_audits" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "performed_by" TEXT NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_cycle_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."document_templates" (
    "id" TEXT NOT NULL,
    "template_code" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."template_versions" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "version_no" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "change_log" TEXT NOT NULL,
    "approved_by" TEXT NOT NULL,
    "approved_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."generated_documents" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "document_number" TEXT NOT NULL,
    "reference_type" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "status" "features"."document_status" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT NOT NULL,
    "rendered_html" TEXT,
    "file_url" TEXT,
    "file_size" INTEGER,
    "generated_by" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalized_at" TIMESTAMP(3),

    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."document_audits" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "document_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."invoice_hashes" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "hash_value" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'SHA-256',
    "previous_hash" TEXT,
    "signed_by" TEXT,
    "signed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_hashes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."invoice_qr_codes" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "qr_data" TEXT NOT NULL,
    "qr_image_url" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "generated_by" TEXT NOT NULL,

    CONSTRAINT "invoice_qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features"."invoice_generation_batches" (
    "id" TEXT NOT NULL,
    "batch_code" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "total_invoices" INTEGER NOT NULL DEFAULT 0,
    "successful_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(16,3) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_log" JSONB,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "invoice_generation_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tariffs_tariff_code_key" ON "features"."tariffs"("tariff_code");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_versions_tariff_id_version_no_key" ON "features"."tariff_versions"("tariff_id", "version_no");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_charges_tariff_id_charge_code_key" ON "features"."tariff_charges"("tariff_id", "charge_code");

-- CreateIndex
CREATE UNIQUE INDEX "report_definitions_report_code_key" ON "features"."report_definitions"("report_code");

-- CreateIndex
CREATE INDEX "report_exports_status_idx" ON "features"."report_exports"("status");

-- CreateIndex
CREATE INDEX "report_exports_requested_by_idx" ON "features"."report_exports"("requested_by");

-- CreateIndex
CREATE INDEX "export_history_requested_by_idx" ON "features"."export_history"("requested_by");

-- CreateIndex
CREATE INDEX "export_history_created_at_idx" ON "features"."export_history"("created_at");

-- CreateIndex
CREATE INDEX "running_activities_status_idx" ON "features"."running_activities"("status");

-- CreateIndex
CREATE INDEX "running_activities_activity_type_idx" ON "features"."running_activities"("activity_type");

-- CreateIndex
CREATE UNIQUE INDEX "contractual_requests_request_code_key" ON "features"."contractual_requests"("request_code");

-- CreateIndex
CREATE INDEX "contractual_requests_area_id_status_idx" ON "features"."contractual_requests"("area_id", "status");

-- CreateIndex
CREATE INDEX "contractual_requests_requested_by_idx" ON "features"."contractual_requests"("requested_by");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_accounts_account_code_key" ON "features"."wallet_accounts"("account_code");

-- CreateIndex
CREATE INDEX "wallet_accounts_customer_id_idx" ON "features"."wallet_accounts"("customer_id");

-- CreateIndex
CREATE INDEX "wallet_accounts_area_id_idx" ON "features"."wallet_accounts"("area_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_transaction_code_key" ON "features"."wallet_transactions"("transaction_code");

-- CreateIndex
CREATE INDEX "wallet_transactions_account_id_created_at_idx" ON "features"."wallet_transactions"("account_id", "created_at");

-- CreateIndex
CREATE INDEX "wallet_transactions_reference_type_reference_id_idx" ON "features"."wallet_transactions"("reference_type", "reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_balances_account_id_balance_date_key" ON "features"."wallet_balances"("account_id", "balance_date");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_allocations_allocation_code_key" ON "features"."wallet_allocations"("allocation_code");

-- CreateIndex
CREATE INDEX "wallet_allocations_account_id_idx" ON "features"."wallet_allocations"("account_id");

-- CreateIndex
CREATE INDEX "wallet_allocations_status_idx" ON "features"."wallet_allocations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transfers_transfer_code_key" ON "features"."wallet_transfers"("transfer_code");

-- CreateIndex
CREATE INDEX "wallet_transfers_source_account_id_idx" ON "features"."wallet_transfers"("source_account_id");

-- CreateIndex
CREATE INDEX "wallet_transfers_target_account_id_idx" ON "features"."wallet_transfers"("target_account_id");

-- CreateIndex
CREATE INDEX "wallet_transfers_status_idx" ON "features"."wallet_transfers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "chilled_water_configs_config_code_key" ON "features"."chilled_water_configs"("config_code");

-- CreateIndex
CREATE INDEX "chilled_water_readings_config_id_reading_date_idx" ON "features"."chilled_water_readings"("config_id", "reading_date");

-- CreateIndex
CREATE INDEX "chilled_water_readings_customer_id_idx" ON "features"."chilled_water_readings"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "chilled_water_consumptions_config_id_customer_id_period_sta_key" ON "features"."chilled_water_consumptions"("config_id", "customer_id", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "chilled_water_invoices_consumption_id_key" ON "features"."chilled_water_invoices"("consumption_id");

-- CreateIndex
CREATE UNIQUE INDEX "chilled_water_invoices_invoice_number_key" ON "features"."chilled_water_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "chilled_water_invoices_config_id_status_idx" ON "features"."chilled_water_invoices"("config_id", "status");

-- CreateIndex
CREATE INDEX "chilled_water_invoices_customer_id_idx" ON "features"."chilled_water_invoices"("customer_id");

-- CreateIndex
CREATE INDEX "chilled_water_allocations_config_id_period_start_idx" ON "features"."chilled_water_allocations"("config_id", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "settlement_configs_config_code_key" ON "features"."settlement_configs"("config_code");

-- CreateIndex
CREATE UNIQUE INDEX "settlement_periods_period_code_key" ON "features"."settlement_periods"("period_code");

-- CreateIndex
CREATE UNIQUE INDEX "settlement_periods_start_date_end_date_key" ON "features"."settlement_periods"("start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "settlement_rules_rule_code_key" ON "features"."settlement_rules"("rule_code");

-- CreateIndex
CREATE INDEX "settlement_rules_config_id_priority_idx" ON "features"."settlement_rules"("config_id", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "settlement_transactions_transaction_code_key" ON "features"."settlement_transactions"("transaction_code");

-- CreateIndex
CREATE INDEX "settlement_transactions_period_id_idx" ON "features"."settlement_transactions"("period_id");

-- CreateIndex
CREATE INDEX "settlement_transactions_area_id_status_idx" ON "features"."settlement_transactions"("area_id", "status");

-- CreateIndex
CREATE INDEX "settlement_allocations_transaction_id_idx" ON "features"."settlement_allocations"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_cycles_cycle_code_key" ON "features"."billing_cycles"("cycle_code");

-- CreateIndex
CREATE UNIQUE INDEX "billing_cycle_projects_cycle_id_project_id_key" ON "features"."billing_cycle_projects"("cycle_id", "project_id");

-- CreateIndex
CREATE INDEX "billing_cycle_approvals_cycle_id_idx" ON "features"."billing_cycle_approvals"("cycle_id");

-- CreateIndex
CREATE INDEX "billing_cycle_audits_cycle_id_idx" ON "features"."billing_cycle_audits"("cycle_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_templates_template_code_key" ON "features"."document_templates"("template_code");

-- CreateIndex
CREATE UNIQUE INDEX "template_versions_template_id_version_no_key" ON "features"."template_versions"("template_id", "version_no");

-- CreateIndex
CREATE UNIQUE INDEX "generated_documents_document_number_key" ON "features"."generated_documents"("document_number");

-- CreateIndex
CREATE INDEX "generated_documents_reference_type_reference_id_idx" ON "features"."generated_documents"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "generated_documents_template_id_idx" ON "features"."generated_documents"("template_id");

-- CreateIndex
CREATE INDEX "document_audits_document_id_idx" ON "features"."document_audits"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_hashes_invoice_id_key" ON "features"."invoice_hashes"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_hashes_hash_value_idx" ON "features"."invoice_hashes"("hash_value");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_qr_codes_invoice_id_key" ON "features"."invoice_qr_codes"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_qr_codes_invoice_id_idx" ON "features"."invoice_qr_codes"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_generation_batches_batch_code_key" ON "features"."invoice_generation_batches"("batch_code");

-- CreateIndex
CREATE INDEX "invoice_generation_batches_cycle_id_idx" ON "features"."invoice_generation_batches"("cycle_id");

-- CreateIndex
CREATE INDEX "invoice_generation_batches_status_idx" ON "features"."invoice_generation_batches"("status");

-- AddForeignKey
ALTER TABLE "features"."tariff_versions" ADD CONSTRAINT "tariff_versions_tariff_id_fkey" FOREIGN KEY ("tariff_id") REFERENCES "features"."tariffs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."tariff_charges" ADD CONSTRAINT "tariff_charges_tariff_id_fkey" FOREIGN KEY ("tariff_id") REFERENCES "features"."tariffs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."tariff_charge_details" ADD CONSTRAINT "tariff_charge_details_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "features"."tariff_charges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."report_exports" ADD CONSTRAINT "report_exports_report_def_id_fkey" FOREIGN KEY ("report_def_id") REFERENCES "features"."report_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."wallet_transactions" ADD CONSTRAINT "wallet_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "features"."wallet_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."wallet_balances" ADD CONSTRAINT "wallet_balances_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "features"."wallet_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."wallet_allocations" ADD CONSTRAINT "wallet_allocations_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "features"."wallet_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."wallet_transfers" ADD CONSTRAINT "wallet_transfers_source_account_id_fkey" FOREIGN KEY ("source_account_id") REFERENCES "features"."wallet_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."wallet_transfers" ADD CONSTRAINT "wallet_transfers_target_account_id_fkey" FOREIGN KEY ("target_account_id") REFERENCES "features"."wallet_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."chilled_water_readings" ADD CONSTRAINT "chilled_water_readings_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "features"."chilled_water_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."chilled_water_consumptions" ADD CONSTRAINT "chilled_water_consumptions_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "features"."chilled_water_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."chilled_water_invoices" ADD CONSTRAINT "chilled_water_invoices_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "features"."chilled_water_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."chilled_water_invoices" ADD CONSTRAINT "chilled_water_invoices_consumption_id_fkey" FOREIGN KEY ("consumption_id") REFERENCES "features"."chilled_water_consumptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."chilled_water_allocations" ADD CONSTRAINT "chilled_water_allocations_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "features"."chilled_water_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."chilled_water_allocations" ADD CONSTRAINT "chilled_water_allocations_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "features"."chilled_water_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."settlement_rules" ADD CONSTRAINT "settlement_rules_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "features"."settlement_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."settlement_transactions" ADD CONSTRAINT "settlement_transactions_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "features"."settlement_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."settlement_allocations" ADD CONSTRAINT "settlement_allocations_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "features"."settlement_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."billing_cycle_projects" ADD CONSTRAINT "billing_cycle_projects_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "features"."billing_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."billing_cycle_approvals" ADD CONSTRAINT "billing_cycle_approvals_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "features"."billing_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."billing_cycle_audits" ADD CONSTRAINT "billing_cycle_audits_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "features"."billing_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."template_versions" ADD CONSTRAINT "template_versions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "features"."document_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."generated_documents" ADD CONSTRAINT "generated_documents_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "features"."document_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features"."document_audits" ADD CONSTRAINT "document_audits_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "features"."generated_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
