# Database Schema Overview — Meter Verse

> Complete entity relationship model for the Utility Metering and Billing Platform MVP.
> Source: `specs/001-metering-billing-platform/data-model.md`
> Last updated: 2026-05-26

---

## Modeling Conventions

| Convention | Standard |
|------------|----------|
| Identifiers | UUID for all primary entities |
| Timestamps | UTC for all time fields |
| Audit fields | `created_at`, `updated_at`, `created_by`, `updated_by` on mutable entities |
| Financial/Audit | Append-only unless explicitly marked soft-deletable |
| Enum naming | Spec prose → schema values: "main water" = `water_main`, "sub-water" = `water_child` |

---

## Entity Relationship Diagram (Text)

```
Project
  ├── LocationNode (hierarchy: zone → building → floor → unit)
  ├── Customer (belongs to project)
  │   └── CustomerUnitAssignment (links customer ↔ unit)
  ├── Meter (electricity, water_main, water_child)
  │   ├── MeterAssignment (links meter ↔ customer + unit)
  │   ├── SIMAssignment (links meter ↔ SIMCard)
  │   ├── Reading (consumption data)
  │   │   └── ReadingReview (approval/rejection)
  │   └── parent_main_Meter_Verse_id (self-ref for water_child → water_main)
  ├── SIMCard (communication asset)
  ├── TariffPlan (rate definition per meter type)
  ├── BillingPeriod (monthly cycles)
  ├── Invoice
  │   ├── InvoiceLine (individual charges)
  │   └── InvoiceAdjustment (corrections on issued invoices)
  ├── Payment
  │   └── PaymentAllocation (payment → invoice mapping)
  ├── CustomerLedgerEntry (append-only financial trail)
  ├── AuditLog (sensitive action tracking)
  └── ReportJob (async export jobs)
```

---

## Core Tables

### 1. Project
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| code | string | UNIQUE |
| name | string | |
| status | enum | active, inactive |
| tax_enabled | boolean | default false |
| tax_rate | decimal | nullable |
| reading_threshold_profile_id | uuid | nullable |
| water_difference_mode | enum | billable, report_only (default) |

### 2. LocationNode
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| project_id | uuid | FK → Project |
| parent_id | uuid | FK → LocationNode (nullable) |
| node_type | enum | zone, building, floor, unit |
| code | string | |
| name | string | |
| status | enum | active, inactive |
| **Unique** | | `(project_id, node_type, code)` |

### 3. Customer
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| project_id | uuid | FK → Project |
| customer_code | string | Unique within project |
| name | string | |
| phone | string | |
| email | string | |
| customer_type | enum | individual, company, tenant, owner |
| national_or_commercial_id | string | |
| status | enum | active, inactive |

### 4. CustomerUnitAssignment
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| customer_id | uuid | FK → Customer |
| unit_id | uuid | FK → LocationNode (unit type) |
| start_at | timestamp | |
| end_at | timestamp | nullable |
| reason | string | |
| **Partial unique** | | `(customer_id, unit_id)` WHERE end_at IS NULL |

### 5. Meter
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| serial_number | string | UNIQUE |
| Meter_Verse_type | enum | electricity, water_main, water_child |
| brand | string | |
| model | string | |
| status | enum | available, assigned, active, offline, faulty, replaced, terminated, retired |
| installation_date | date | |
| activation_date | date | |
| termination_date | date | nullable |
| project_id | uuid | FK → Project |
| location_id | uuid | FK → LocationNode (nullable) |
| parent_main_Meter_Verse_id | uuid | FK → Meter (nullable, required for water_child) |

### 6. SIMCard
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| iccid | string | UNIQUE |
| msisdn | string | |
| provider | string | |
| ip_address | string | |
| ip_type | enum | static, dynamic |
| status | enum | available, assigned, active, suspended, old, reusable, retired |
| cooldown_until | timestamp | nullable |

### 7. MeterAssignment
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| Meter_Verse_id | uuid | FK → Meter |
| customer_id | uuid | FK → Customer |
| unit_id | uuid | FK → LocationNode |
| project_id | uuid | FK → Project |
| start_at | timestamp | |
| end_at | timestamp | nullable |
| change_reason | string | |
| status | enum | active, ended |
| **Partial unique** | | `(Meter_Verse_id)` WHERE end_at IS NULL |

### 8. SIMAssignment
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| sim_id | uuid | FK → SIMCard |
| Meter_Verse_id | uuid | FK → Meter |
| start_at | timestamp | |
| end_at | timestamp | nullable |
| change_reason | string | |
| status | enum | active, ended |
| **Partial unique** | | `(sim_id)` WHERE end_at IS NULL |

### 9. Reading
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| Meter_Verse_id | uuid | FK → Meter |
| project_id | uuid | FK → Project |
| customer_id_snapshot | uuid | |
| unit_id_snapshot | uuid | |
| reading_value | decimal | |
| reading_at | timestamp | |
| source | enum | manual, import, automatic |
| previous_reading_value | decimal | nullable |
| consumption_value | decimal | nullable |
| status | enum | valid, pending_review, estimated, suspicious, corrected, rejected |
| raw_payload | jsonb | nullable |
| entered_by | uuid | |
| notes | text | nullable |
| **Unique** | | `(Meter_Verse_id, reading_at, source)` |

### 10. ReadingReview
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| reading_id | uuid | FK → Reading |
| review_action | enum | approve, reject, correct |
| reviewed_by | uuid | |
| reviewed_at | timestamp | |
| reason | text | |

### 11. TariffPlan
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| project_id | uuid | FK → Project |
| Meter_Verse_type | enum | electricity, water_main, water_child |
| rate_per_unit | decimal | |
| currency | string | |
| effective_from | date | |
| effective_to | date | nullable |
| status | enum | draft, active, retired |

### 12. BillingPeriod
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| project_id | uuid | FK → Project |
| period_code | string | e.g., "2026-05" |
| start_date | date | |
| end_date | date | |
| status | enum | open, in_review, closed |

### 13. Invoice
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| invoice_number | string | UNIQUE |
| project_id | uuid | FK → Project |
| customer_id | uuid | FK → Customer |
| unit_id | uuid | FK → LocationNode |
| Meter_Verse_id | uuid | FK → Meter |
| utility_type | enum | electricity, water |
| billing_period_id | uuid | FK → BillingPeriod |
| status | enum | draft, pending_approval, issued, partially_paid, paid, overdue, cancelled |
| subtotal_amount | decimal | |
| tax_amount | decimal | |
| total_amount | decimal | |
| paid_amount | decimal | default 0 |
| remaining_amount | decimal | |
| issued_at | timestamp | nullable |
| due_at | timestamp | nullable |
| immutable_at | timestamp | nullable |

### 14. InvoiceLine
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| invoice_id | uuid | FK → Invoice |
| reading_id | uuid | FK → Reading (nullable) |
| description | string | |
| quantity | decimal | |
| unit_price | decimal | |
| line_amount | decimal | |

### 15. InvoiceAdjustment
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| invoice_id | uuid | FK → Invoice |
| adjustment_type | enum | credit, debit |
| amount | decimal | |
| reason | text | |
| approved_by | uuid | nullable |
| created_by | uuid | |

### 16. Payment
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| payment_number | string | UNIQUE |
| project_id | uuid | FK → Project |
| customer_id | uuid | FK → Customer |
| payment_date | timestamp | |
| method | enum | cash, bank_transfer, card, online, cheque, wallet |
| amount | decimal | |
| status | enum | pending, confirmed, reversed, cancelled |
| collected_by | uuid | |
| notes | text | |

### 17. PaymentAllocation
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| payment_id | uuid | FK → Payment |
| invoice_id | uuid | FK → Invoice |
| allocated_amount | decimal | |
| allocation_order | integer | |
| **Rule** | | Sum(allocations) = payment amount |

### 18. CustomerLedgerEntry (Append-Only)
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| customer_id | uuid | FK → Customer |
| project_id | uuid | FK → Project |
| entry_type | enum | invoice_charge, adjustment_debit, adjustment_credit, payment_credit, payment_reversal |
| reference_type | enum | invoice, payment, adjustment |
| reference_id | uuid | |
| amount_delta | decimal | |
| running_balance | decimal | |
| entry_at | timestamp | |

### 19. AuditLog (Append-Only)
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| actor_user_id | uuid | |
| actor_role | string | |
| action | string | |
| resource_type | string | |
| resource_id | uuid | |
| project_id | uuid | nullable |
| request_correlation_id | string | |
| before_state | jsonb | nullable |
| after_state | jsonb | nullable |
| reason | text | nullable |
| created_at | timestamp | |

### 20. ReportJob
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| project_id | uuid | FK → Project |
| report_type | string | |
| format | enum | csv, xlsx, pdf |
| filters | jsonb | |
| status | enum | queued, running, completed, failed, expired |
| file_url | string | nullable |
| error_message | text | nullable |
| requested_by | uuid | |
| requested_at | timestamp | |

---

## State Transitions

```
Meter:     available → assigned → active → (offline|faulty|replaced|terminated|retired)
SIMCard:   available → assigned → active → (suspended|old|reusable|retired)
Reading:   pending_review → valid|suspicious|rejected|corrected
Invoice:   draft → pending_approval (optional) → issued → partially_paid → paid
Payment:   pending → confirmed → reversed|cancelled
```

---

## Derived Views

| View Name | Purpose |
|-----------|---------|
| `customer_statement_view` | Opening balance, charges, payments, adjustments, reversals, closing balance |
| `Meter_Verse_assignment_active_view` | One active row per meter |
| `sim_assignment_active_view` | One active row per SIM |

---

## Key Business Rules (DB Level)

- Meter serial number must be UNIQUE
- SIM ICCID must be UNIQUE
- A meter can have only ONE active assignment at a time
- A SIM can have only ONE active meter assignment at a time
- Issued invoices are IMMUTABLE — corrections via InvoiceAdjustment only
- CustomerLedgerEntry is APPEND-ONLY — no updates or deletes
- Payment reversal restricted to super_admin role only
- Oldest-due-first default payment allocation
