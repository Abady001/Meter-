-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "area";

-- CreateEnum
CREATE TYPE "area"."area_customer_status" AS ENUM ('active', 'suspended', 'closed');

-- CreateEnum
CREATE TYPE "area"."area_transaction_type" AS ENUM ('invoice', 'payment', 'adjustment', 'reversal');

-- CreateEnum
CREATE TYPE "area"."area_ledger_entry_type" AS ENUM ('debit', 'credit');

-- CreateEnum
CREATE TYPE "area"."area_invoice_status" AS ENUM ('draft', 'issued', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "area"."area_alert_severity" AS ENUM ('info', 'warning', 'critical');

-- CreateEnum
CREATE TYPE "area"."area_task_priority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "area"."area_task_status" AS ENUM ('open', 'in_progress', 'pending', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "area"."area_approval_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "area"."area_ticket_category" AS ENUM ('billing', 'meter', 'technical', 'other');

-- CreateEnum
CREATE TYPE "area"."area_ticket_priority" AS ENUM ('low', 'normal', 'high', 'critical');

-- CreateEnum
CREATE TYPE "area"."area_ticket_status" AS ENUM ('open', 'in_progress', 'pending', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "area"."area_sim_status" AS ENUM ('available', 'assigned', 'activated', 'deactivated');

-- CreateEnum
CREATE TYPE "area"."area_meter_type" AS ENUM ('water', 'electric', 'gas', 'steam', 'chilled_water');

-- CreateEnum
CREATE TYPE "area"."area_reading_source" AS ENUM ('manual', 'ami', 'import');

-- CreateEnum
CREATE TYPE "area"."area_reading_status" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "area"."area_settlement_status" AS ENUM ('pending', 'approved', 'cancelled');

-- CreateEnum
CREATE TYPE "area"."area_payment_plan_status" AS ENUM ('active', 'completed', 'defaulted', 'cancelled');

-- CreateEnum
CREATE TYPE "area"."area_collection_action_type" AS ENUM ('call', 'visit', 'notice', 'legal', 'write_off');

-- CreateEnum
CREATE TYPE "area"."area_deposit_type" AS ENUM ('security', 'guarantee', 'advance');

-- CreateEnum
CREATE TYPE "area"."area_contract_status" AS ENUM ('active', 'expired', 'terminated', 'suspended');

-- CreateEnum
CREATE TYPE "area"."area_work_order_status" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "area"."customers" (
    "id" TEXT NOT NULL,
    "customer_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "national_id" TEXT,
    "address" TEXT,
    "unit_id" TEXT,
    "unit_type_id" TEXT,
    "group_id" TEXT,
    "status" "area"."area_customer_status" NOT NULL DEFAULT 'active',
    "current_balance" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "credit_limit" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "is_exempt_from_late_fee" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."customer_meters" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "meter_number" TEXT NOT NULL,
    "meter_type" "area"."area_meter_type" NOT NULL,
    "model" TEXT,
    "status" TEXT NOT NULL DEFAULT 'installed',
    "installation_date" TIMESTAMP(3),
    "last_reading_date" TIMESTAMP(3),
    "last_reading_value" DECIMAL(18,4),
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "is_smart_meter" BOOLEAN NOT NULL DEFAULT false,
    "firmware_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_meters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."meter_readings" (
    "id" BIGSERIAL NOT NULL,
    "customer_meter_id" TEXT NOT NULL,
    "reading_value" DECIMAL(18,4) NOT NULL,
    "consumption" DECIMAL(18,4),
    "reading_date" TIMESTAMP(3) NOT NULL,
    "source" "area"."area_reading_source" NOT NULL,
    "status" "area"."area_reading_status" NOT NULL DEFAULT 'pending',
    "is_estimated" BOOLEAN NOT NULL DEFAULT false,
    "read_by" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."sim_cards" (
    "id" TEXT NOT NULL,
    "iccid" TEXT NOT NULL,
    "phone_number" TEXT,
    "network_provider" TEXT,
    "status" "area"."area_sim_status" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sim_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."sim_assignments" (
    "id" TEXT NOT NULL,
    "sim_id" TEXT NOT NULL,
    "customer_meter_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP(3),

    CONSTRAINT "sim_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."meter_status_logs" (
    "id" BIGSERIAL NOT NULL,
    "customer_meter_id" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "notes" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."reading_reviews" (
    "id" BIGSERIAL NOT NULL,
    "meter_reading_id" BIGINT NOT NULL,
    "deviation_percent" DECIMAL(10,2) NOT NULL,
    "triggered_by_rule" TEXT NOT NULL,
    "status" "area"."area_reading_status" NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "review_comment" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."reading_thresholds" (
    "id" TEXT NOT NULL,
    "meter_type" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "comparison_operator" TEXT NOT NULL,
    "threshold_value" DECIMAL(18,4) NOT NULL,
    "action" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_thresholds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."meter_calibrations" (
    "id" BIGSERIAL NOT NULL,
    "customer_meter_id" TEXT NOT NULL,
    "before_value" DECIMAL(18,4) NOT NULL,
    "after_value" DECIMAL(18,4) NOT NULL,
    "calibrated_by" TEXT NOT NULL,
    "notes" TEXT,
    "calibrated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_calibrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."meter_transfers" (
    "id" BIGSERIAL NOT NULL,
    "customer_meter_id" TEXT NOT NULL,
    "from_customer_id" TEXT NOT NULL,
    "to_customer_id" TEXT NOT NULL,
    "reason" TEXT,
    "transferred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."invoice_details" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "billing_period_start" TIMESTAMP(3) NOT NULL,
    "billing_period_end" TIMESTAMP(3) NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "total_amount" DECIMAL(14,3) NOT NULL,
    "vat_amount" DECIMAL(14,3) NOT NULL,
    "net_amount" DECIMAL(14,3) NOT NULL,
    "paid_amount" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "balance_due" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "status" "area"."area_invoice_status" NOT NULL DEFAULT 'draft',
    "is_immutable" BOOLEAN NOT NULL DEFAULT false,
    "signed_document_hash" TEXT,
    "adjustment_of_invoice_id" TEXT,
    "adjustment_type" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."transactions" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" TEXT NOT NULL,
    "transaction_type" "area"."area_transaction_type" NOT NULL,
    "reference_number" TEXT NOT NULL,
    "amount" DECIMAL(14,3) NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."payment_allocations" (
    "id" TEXT NOT NULL,
    "payment_id" BIGINT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "allocated_amount" DECIMAL(14,3) NOT NULL,
    "allocated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."customer_ledger_entries" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" TEXT NOT NULL,
    "transaction_id" BIGINT NOT NULL,
    "entry_type" "area"."area_ledger_entry_type" NOT NULL,
    "amount" DECIMAL(14,3) NOT NULL,
    "running_balance" DECIMAL(14,3) NOT NULL,
    "entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "customer_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."journal_entries" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "account_code" TEXT NOT NULL,
    "debit" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "credit" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."payment_plans" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "total_amount" DECIMAL(14,3) NOT NULL,
    "installment_amount" DECIMAL(14,3) NOT NULL,
    "total_installments" INTEGER NOT NULL,
    "paid_installments" INTEGER NOT NULL DEFAULT 0,
    "frequency" TEXT NOT NULL,
    "status" "area"."area_payment_plan_status" NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."late_fees" (
    "id" BIGSERIAL NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "fee_amount" DECIMAL(14,3) NOT NULL,
    "calculated_date" TIMESTAMP(3) NOT NULL,
    "applied_status" TEXT NOT NULL DEFAULT 'pending',
    "applied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "late_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."deposits" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "amount" DECIMAL(14,3) NOT NULL,
    "deposit_type" "area"."area_deposit_type" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'held',
    "held_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."refunds" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "amount" DECIMAL(14,3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approved_by" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."disputes" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolution" TEXT,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."water_balances" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "opening_balance" DECIMAL(14,3) NOT NULL,
    "consumption_charges" DECIMAL(14,3) NOT NULL,
    "payments_received" DECIMAL(14,3) NOT NULL,
    "adjustments" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "closing_balance" DECIMAL(14,3) NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "water_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."solar_wallet_transactions" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "amount" DECIMAL(14,3) NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "wallet_balance_before" DECIMAL(14,3) NOT NULL,
    "wallet_balance_after" DECIMAL(14,3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solar_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."chilled_water_settlements" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_btu" DECIMAL(18,4) NOT NULL,
    "rate_per_btu" DECIMAL(18,6) NOT NULL,
    "total_amount" DECIMAL(14,3) NOT NULL,
    "status" "area"."area_settlement_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chilled_water_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."usage_summaries" (
    "id" BIGSERIAL NOT NULL,
    "customer_meter_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_consumption" DECIMAL(18,4) NOT NULL,
    "peak_usage" DECIMAL(18,4),
    "avg_daily" DECIMAL(18,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."alerts" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" TEXT,
    "alert_type" TEXT NOT NULL,
    "severity" "area"."area_alert_severity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."chat_messages" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" TEXT NOT NULL,
    "sender_user_id" TEXT NOT NULL,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "content" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."tasks" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT,
    "assigned_to" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "area"."area_task_priority" NOT NULL DEFAULT 'normal',
    "status" "area"."area_task_status" NOT NULL DEFAULT 'open',
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."approvals" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "status" "area"."area_approval_status" NOT NULL DEFAULT 'pending',
    "comment" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."attachments" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."trouble_tickets" (
    "id" TEXT NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "category" "area"."area_ticket_category" NOT NULL,
    "priority" "area"."area_ticket_priority" NOT NULL DEFAULT 'normal',
    "status" "area"."area_ticket_status" NOT NULL DEFAULT 'open',
    "assigned_to" TEXT,
    "sla_deadline" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trouble_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."collection_actions" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" TEXT NOT NULL,
    "action_type" "area"."area_collection_action_type" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" TEXT,
    "taken_by" TEXT,
    "taken_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."contracts" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "terms" TEXT,
    "status" "area"."area_contract_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."subscriptions" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."work_orders" (
    "id" TEXT NOT NULL,
    "customer_meter_id" TEXT NOT NULL,
    "work_type" TEXT NOT NULL,
    "status" "area"."area_work_order_status" NOT NULL DEFAULT 'scheduled',
    "assigned_to" TEXT,
    "scheduled_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."otp_codes" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."api_keys" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."webhook_subscriptions" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" JSONB NOT NULL,
    "secret_key" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_triggered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."payment_gateway_logs" (
    "id" BIGSERIAL NOT NULL,
    "payment_transaction_id" BIGINT NOT NULL,
    "gateway_response" JSONB,
    "status_code" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_gateway_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."integration_logs" (
    "id" BIGSERIAL NOT NULL,
    "integration_name" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "payload" JSONB,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."data_sync_tracker" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "last_sync_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "records_processed" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "error_log" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_sync_tracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."schema_versions" (
    "id" BIGSERIAL NOT NULL,
    "version_number" TEXT NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "script_name" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "schema_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area"."user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_code_key" ON "area"."customers"("customer_code");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "area"."customers"("status");

-- CreateIndex
CREATE INDEX "customers_unit_id_idx" ON "area"."customers"("unit_id");

-- CreateIndex
CREATE INDEX "customers_current_balance_idx" ON "area"."customers"("current_balance");

-- CreateIndex
CREATE UNIQUE INDEX "customer_meters_meter_number_key" ON "area"."customer_meters"("meter_number");

-- CreateIndex
CREATE INDEX "customer_meters_customer_id_idx" ON "area"."customer_meters"("customer_id");

-- CreateIndex
CREATE INDEX "customer_meters_status_idx" ON "area"."customer_meters"("status");

-- CreateIndex
CREATE INDEX "meter_readings_customer_meter_id_idx" ON "area"."meter_readings"("customer_meter_id");

-- CreateIndex
CREATE INDEX "meter_readings_reading_date_idx" ON "area"."meter_readings"("reading_date");

-- CreateIndex
CREATE INDEX "meter_readings_status_idx" ON "area"."meter_readings"("status");

-- CreateIndex
CREATE INDEX "meter_readings_source_idx" ON "area"."meter_readings"("source");

-- CreateIndex
CREATE UNIQUE INDEX "sim_cards_iccid_key" ON "area"."sim_cards"("iccid");

-- CreateIndex
CREATE INDEX "sim_assignments_sim_id_idx" ON "area"."sim_assignments"("sim_id");

-- CreateIndex
CREATE INDEX "sim_assignments_customer_meter_id_idx" ON "area"."sim_assignments"("customer_meter_id");

-- CreateIndex
CREATE INDEX "meter_status_logs_customer_meter_id_idx" ON "area"."meter_status_logs"("customer_meter_id");

-- CreateIndex
CREATE INDEX "meter_status_logs_changed_at_idx" ON "area"."meter_status_logs"("changed_at");

-- CreateIndex
CREATE INDEX "reading_reviews_meter_reading_id_idx" ON "area"."reading_reviews"("meter_reading_id");

-- CreateIndex
CREATE INDEX "reading_reviews_status_idx" ON "area"."reading_reviews"("status");

-- CreateIndex
CREATE INDEX "meter_calibrations_customer_meter_id_idx" ON "area"."meter_calibrations"("customer_meter_id");

-- CreateIndex
CREATE INDEX "meter_transfers_customer_meter_id_idx" ON "area"."meter_transfers"("customer_meter_id");

-- CreateIndex
CREATE INDEX "meter_transfers_from_customer_id_idx" ON "area"."meter_transfers"("from_customer_id");

-- CreateIndex
CREATE INDEX "meter_transfers_to_customer_id_idx" ON "area"."meter_transfers"("to_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_details_invoice_number_key" ON "area"."invoice_details"("invoice_number");

-- CreateIndex
CREATE INDEX "invoice_details_customer_id_idx" ON "area"."invoice_details"("customer_id");

-- CreateIndex
CREATE INDEX "invoice_details_status_idx" ON "area"."invoice_details"("status");

-- CreateIndex
CREATE INDEX "invoice_details_due_date_idx" ON "area"."invoice_details"("due_date");

-- CreateIndex
CREATE INDEX "transactions_customer_id_idx" ON "area"."transactions"("customer_id");

-- CreateIndex
CREATE INDEX "transactions_transaction_date_idx" ON "area"."transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "payment_allocations_payment_id_idx" ON "area"."payment_allocations"("payment_id");

-- CreateIndex
CREATE INDEX "payment_allocations_invoice_id_idx" ON "area"."payment_allocations"("invoice_id");

-- CreateIndex
CREATE INDEX "customer_ledger_entries_customer_id_idx" ON "area"."customer_ledger_entries"("customer_id");

-- CreateIndex
CREATE INDEX "customer_ledger_entries_entry_date_idx" ON "area"."customer_ledger_entries"("entry_date");

-- CreateIndex
CREATE INDEX "journal_entries_customer_id_idx" ON "area"."journal_entries"("customer_id");

-- CreateIndex
CREATE INDEX "journal_entries_invoice_id_idx" ON "area"."journal_entries"("invoice_id");

-- CreateIndex
CREATE INDEX "journal_entries_entry_date_idx" ON "area"."journal_entries"("entry_date");

-- CreateIndex
CREATE INDEX "payment_plans_customer_id_idx" ON "area"."payment_plans"("customer_id");

-- CreateIndex
CREATE INDEX "payment_plans_status_idx" ON "area"."payment_plans"("status");

-- CreateIndex
CREATE INDEX "late_fees_invoice_id_idx" ON "area"."late_fees"("invoice_id");

-- CreateIndex
CREATE INDEX "late_fees_customer_id_idx" ON "area"."late_fees"("customer_id");

-- CreateIndex
CREATE INDEX "deposits_customer_id_idx" ON "area"."deposits"("customer_id");

-- CreateIndex
CREATE INDEX "deposits_status_idx" ON "area"."deposits"("status");

-- CreateIndex
CREATE INDEX "refunds_customer_id_idx" ON "area"."refunds"("customer_id");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "area"."refunds"("status");

-- CreateIndex
CREATE INDEX "disputes_invoice_id_idx" ON "area"."disputes"("invoice_id");

-- CreateIndex
CREATE INDEX "disputes_customer_id_idx" ON "area"."disputes"("customer_id");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "area"."disputes"("status");

-- CreateIndex
CREATE INDEX "water_balances_customer_id_idx" ON "area"."water_balances"("customer_id");

-- CreateIndex
CREATE INDEX "water_balances_period_start_period_end_idx" ON "area"."water_balances"("period_start", "period_end");

-- CreateIndex
CREATE INDEX "solar_wallet_transactions_customer_id_idx" ON "area"."solar_wallet_transactions"("customer_id");

-- CreateIndex
CREATE INDEX "solar_wallet_transactions_created_at_idx" ON "area"."solar_wallet_transactions"("created_at");

-- CreateIndex
CREATE INDEX "chilled_water_settlements_customer_id_idx" ON "area"."chilled_water_settlements"("customer_id");

-- CreateIndex
CREATE INDEX "chilled_water_settlements_status_idx" ON "area"."chilled_water_settlements"("status");

-- CreateIndex
CREATE INDEX "usage_summaries_customer_meter_id_idx" ON "area"."usage_summaries"("customer_meter_id");

-- CreateIndex
CREATE INDEX "usage_summaries_period_start_period_end_idx" ON "area"."usage_summaries"("period_start", "period_end");

-- CreateIndex
CREATE INDEX "alerts_customer_id_idx" ON "area"."alerts"("customer_id");

-- CreateIndex
CREATE INDEX "alerts_severity_idx" ON "area"."alerts"("severity");

-- CreateIndex
CREATE INDEX "alerts_is_resolved_idx" ON "area"."alerts"("is_resolved");

-- CreateIndex
CREATE INDEX "chat_messages_customer_id_idx" ON "area"."chat_messages"("customer_id");

-- CreateIndex
CREATE INDEX "chat_messages_sent_at_idx" ON "area"."chat_messages"("sent_at");

-- CreateIndex
CREATE INDEX "tasks_customer_id_idx" ON "area"."tasks"("customer_id");

-- CreateIndex
CREATE INDEX "tasks_assigned_to_idx" ON "area"."tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "area"."tasks"("status");

-- CreateIndex
CREATE INDEX "approvals_entity_type_entity_id_idx" ON "area"."approvals"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "approvals_status_idx" ON "area"."approvals"("status");

-- CreateIndex
CREATE INDEX "attachments_entity_type_entity_id_idx" ON "area"."attachments"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "trouble_tickets_ticket_number_key" ON "area"."trouble_tickets"("ticket_number");

-- CreateIndex
CREATE INDEX "trouble_tickets_customer_id_idx" ON "area"."trouble_tickets"("customer_id");

-- CreateIndex
CREATE INDEX "trouble_tickets_assigned_to_idx" ON "area"."trouble_tickets"("assigned_to");

-- CreateIndex
CREATE INDEX "trouble_tickets_status_idx" ON "area"."trouble_tickets"("status");

-- CreateIndex
CREATE INDEX "trouble_tickets_priority_idx" ON "area"."trouble_tickets"("priority");

-- CreateIndex
CREATE INDEX "collection_actions_customer_id_idx" ON "area"."collection_actions"("customer_id");

-- CreateIndex
CREATE INDEX "collection_actions_status_idx" ON "area"."collection_actions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_contract_number_key" ON "area"."contracts"("contract_number");

-- CreateIndex
CREATE INDEX "contracts_customer_id_idx" ON "area"."contracts"("customer_id");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "area"."contracts"("status");

-- CreateIndex
CREATE INDEX "subscriptions_customer_id_idx" ON "area"."subscriptions"("customer_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "area"."subscriptions"("status");

-- CreateIndex
CREATE INDEX "work_orders_customer_meter_id_idx" ON "area"."work_orders"("customer_meter_id");

-- CreateIndex
CREATE INDEX "work_orders_assigned_to_idx" ON "area"."work_orders"("assigned_to");

-- CreateIndex
CREATE INDEX "work_orders_status_idx" ON "area"."work_orders"("status");

-- CreateIndex
CREATE INDEX "otp_codes_user_id_purpose_idx" ON "area"."otp_codes"("user_id", "purpose");

-- CreateIndex
CREATE INDEX "otp_codes_code_idx" ON "area"."otp_codes"("code");

-- CreateIndex
CREATE INDEX "api_keys_user_id_idx" ON "area"."api_keys"("user_id");

-- CreateIndex
CREATE INDEX "api_keys_key_hash_idx" ON "area"."api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "webhook_subscriptions_is_active_idx" ON "area"."webhook_subscriptions"("is_active");

-- CreateIndex
CREATE INDEX "payment_gateway_logs_payment_transaction_id_idx" ON "area"."payment_gateway_logs"("payment_transaction_id");

-- CreateIndex
CREATE INDEX "integration_logs_integration_name_logged_at_idx" ON "area"."integration_logs"("integration_name", "logged_at");

-- CreateIndex
CREATE INDEX "integration_logs_status_idx" ON "area"."integration_logs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "data_sync_tracker_entity_type_key" ON "area"."data_sync_tracker"("entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "schema_versions_version_number_key" ON "area"."schema_versions"("version_number");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "area"."user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "area"."user_sessions"("expires_at");

-- AddForeignKey
ALTER TABLE "area"."customer_meters" ADD CONSTRAINT "customer_meters_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."meter_readings" ADD CONSTRAINT "meter_readings_customer_meter_id_fkey" FOREIGN KEY ("customer_meter_id") REFERENCES "area"."customer_meters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."sim_assignments" ADD CONSTRAINT "sim_assignments_sim_id_fkey" FOREIGN KEY ("sim_id") REFERENCES "area"."sim_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."sim_assignments" ADD CONSTRAINT "sim_assignments_customer_meter_id_fkey" FOREIGN KEY ("customer_meter_id") REFERENCES "area"."customer_meters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."meter_status_logs" ADD CONSTRAINT "meter_status_logs_customer_meter_id_fkey" FOREIGN KEY ("customer_meter_id") REFERENCES "area"."customer_meters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."reading_reviews" ADD CONSTRAINT "reading_reviews_meter_reading_id_fkey" FOREIGN KEY ("meter_reading_id") REFERENCES "area"."meter_readings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."meter_calibrations" ADD CONSTRAINT "meter_calibrations_customer_meter_id_fkey" FOREIGN KEY ("customer_meter_id") REFERENCES "area"."customer_meters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."meter_transfers" ADD CONSTRAINT "meter_transfers_customer_meter_id_fkey" FOREIGN KEY ("customer_meter_id") REFERENCES "area"."customer_meters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."meter_transfers" ADD CONSTRAINT "meter_transfers_from_customer_id_fkey" FOREIGN KEY ("from_customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."meter_transfers" ADD CONSTRAINT "meter_transfers_to_customer_id_fkey" FOREIGN KEY ("to_customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."invoice_details" ADD CONSTRAINT "invoice_details_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."invoice_details" ADD CONSTRAINT "invoice_details_adjustment_of_invoice_id_fkey" FOREIGN KEY ("adjustment_of_invoice_id") REFERENCES "area"."invoice_details"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."transactions" ADD CONSTRAINT "transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "area"."transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."payment_allocations" ADD CONSTRAINT "payment_allocations_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "area"."invoice_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."customer_ledger_entries" ADD CONSTRAINT "customer_ledger_entries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."customer_ledger_entries" ADD CONSTRAINT "customer_ledger_entries_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "area"."transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."journal_entries" ADD CONSTRAINT "journal_entries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."journal_entries" ADD CONSTRAINT "journal_entries_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "area"."invoice_details"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."payment_plans" ADD CONSTRAINT "payment_plans_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."late_fees" ADD CONSTRAINT "late_fees_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "area"."invoice_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."late_fees" ADD CONSTRAINT "late_fees_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."deposits" ADD CONSTRAINT "deposits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."refunds" ADD CONSTRAINT "refunds_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."disputes" ADD CONSTRAINT "disputes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "area"."invoice_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."disputes" ADD CONSTRAINT "disputes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."water_balances" ADD CONSTRAINT "water_balances_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."solar_wallet_transactions" ADD CONSTRAINT "solar_wallet_transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."chilled_water_settlements" ADD CONSTRAINT "chilled_water_settlements_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."usage_summaries" ADD CONSTRAINT "usage_summaries_customer_meter_id_fkey" FOREIGN KEY ("customer_meter_id") REFERENCES "area"."customer_meters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."alerts" ADD CONSTRAINT "alerts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."chat_messages" ADD CONSTRAINT "chat_messages_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."tasks" ADD CONSTRAINT "tasks_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."trouble_tickets" ADD CONSTRAINT "trouble_tickets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."collection_actions" ADD CONSTRAINT "collection_actions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."contracts" ADD CONSTRAINT "contracts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."subscriptions" ADD CONSTRAINT "subscriptions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "area"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."work_orders" ADD CONSTRAINT "work_orders_customer_meter_id_fkey" FOREIGN KEY ("customer_meter_id") REFERENCES "area"."customer_meters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area"."payment_gateway_logs" ADD CONSTRAINT "payment_gateway_logs_payment_transaction_id_fkey" FOREIGN KEY ("payment_transaction_id") REFERENCES "area"."transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
