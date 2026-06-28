erDiagram
    CORE_AREA ||--o{ CORE_PROJECT : "has"
    CORE_AREA ||--o{ CORE_HOLIDAY : "has"
    CORE_AREA ||--o{ CORE_SETTLEMENT : "has"
    CORE_AREA ||--o{ CORE_PAYMENT_CENTER : "has"

    CORE_USER ||--o{ CORE_USER_ROLE_ASSIGNMENT : "assigned"
    CORE_ROLE ||--o{ CORE_USER_ROLE_ASSIGNMENT : "used by"
    CORE_ROLE ||--o{ CORE_ROLE_PERMISSION : "grants"
    CORE_PERMISSION ||--o{ CORE_ROLE_PERMISSION : "assigned to"

    CORE_USER ||--o{ CORE_AUDIT_LOG : "audited by"

    CUSTOMER ||--o{ METER : "has"
    CUSTOMER ||--o{ INVOICE : "receives"
    CUSTOMER ||--o{ PAYMENT : "makes"
    CUSTOMER ||--o{ CUSTOMER_LEDGER_ENTRY : "has ledger"
    CUSTOMER ||--o{ WALLET : "has wallet"

    METER ||--o{ READING : "records"
    METER ||--o{ METER_ASSIGNMENT : "assigned to"

    INVOICE ||--o{ INVOICE_LINE : "contains"

    TARIFF ||--o{ TARIFF_TIER : "has tiers"

    PROJECT ||--o{ CUSTOMER : "belongs to"
    PROJECT ||--o{ METER : "contains"
    PROJECT ||--o{ UNIT : "has"

    UNIT ||--o{ METER : "serves"

    schema CORE {
        CORE_AREA "areas"
        CORE_PROJECT "projects"
        CORE_USER "users"
        CORE_ROLE "roles"
        CORE_PERMISSION "permissions"
        CORE_ROLE_PERMISSION "role_permissions"
        CORE_USER_ROLE_ASSIGNMENT "user_role_assignments"
        CORE_USER_GROUP "user_groups"
        CORE_AUDIT_LOG "audit_log"
        CORE_HOLIDAY "holidays"
        CORE_SETTLEMENT "settlements"
        CORE_PAYMENT_CENTER "payment_centers"
        CORE_SETTINGS "settings"
    }

    schema SIM_SYSTEM {
        CUSTOMER "customers"
        METER "meters"
        READING "readings"
        INVOICE "invoices"
        INVOICE_LINE "invoice_lines"
        PAYMENT "payments"
        PAYMENT_ALLOCATION "payment_allocations"
        CUSTOMER_LEDGER_ENTRY "customer_ledger_entries"
        WALLET "wallets"
        WALLET_TRANSACTION "wallet_transactions"
        TARIFF "tariffs"
        TARIFF_TIER "tariff_tiers"
        TARIFF_PLAN "tariff_plans"
        UNIT "units"
        UNIT_TYPE "unit_types"
        BILLING_PERIOD "billing_periods"
        METER_ASSIGNMENT "meter_assignments"
        SETTLEMENT "settlements"
    }
