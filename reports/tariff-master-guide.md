# Phase 14: Tariff Master Guide — Creating a Tariff from Zero in Meter Verse

> **Status**: PLANNING DOCUMENT — steps reference both existing code and planned features.
> **Audience**: Developers implementing the tariff module.

---

## 1. Overview

A tariff in Meter Verse defines the pricing structure applied to a meter's consumption. The architecture mirrors SBill's `tariff → tariff_charges → tariff_charges_details` hierarchy.

### Entity Relationship

```
TARIFF (1)
  ├── has many → TARIFF_CHARGES (N)
  │                 └── has many → TARIFF_CHARGES_DETAILS (M) [if STEPS type]
  ├── assigned to → METER (via tariff_id)
  └── versioned via → parent_id chain
```

---

## 2. Step-by-Step: Create a Tariff

### Step 1: Create the Tariff Header

```sql
INSERT INTO tariff (
  name_en, name_ar, service_type, mode,
  start_date, end_date, status, flat_rate,
  parent_id
) VALUES (
  'Residential Electricity 2025', 'كهرباء سكني 2025',
  'ELECTRICITY', 'TIERED',
  '2025-01-01', '2025-12-31', 'ACTIVE',
  NULL, NULL  -- parent_id = NULL for root version
);
```

**Fields:**
| Field | Description | Example |
|-------|-------------|---------|
| `name_en` | English name | Residential Electricity 2025 |
| `name_ar` | Arabic name | كهرباء سكني 2025 |
| `service_type` | Utility type | ELECTRICITY, WATER, SOLAR, GAS, CHILLED_WATER |
| `mode` | Calculation mode | TIERED, FLAT |
| `start_date` | Effective from | 2025-01-01 |
| `end_date` | Effective until (nullable) | 2025-12-31 |
| `status` | ACTIVE or INACTIVE | ACTIVE |
| `flat_rate` | Default % rate for percentage charges | NULL |
| `parent_id` | Previous version (for versioning) | NULL |

### Step 2: Create Version Link (for renewal)

When rates change (e.g., 2026 rates), create new version:

```sql
-- Step 2a: Create new tariff version
INSERT INTO tariff (...) VALUES (
  'Residential Electricity 2026', 'كهرباء سكني 2026',
  'ELECTRICITY', 'TIERED',
  '2026-01-01', NULL, 'ACTIVE',
  NULL, (SELECT id FROM tariff WHERE name_en = 'Residential Electricity 2025')
);

-- Step 2b: Update previous version to INACTIVE
UPDATE tariff SET status = 'INACTIVE', end_date = '2025-12-31'
WHERE name_en = 'Residential Electricity 2025';
```

### Step 3: Create Charge Groups

#### 3a: Consumption Charge (STEPS/TIERED)

```sql
INSERT INTO tariff_charges (
  tariff_id, name_en, name_ar, charge_group,
  charge_type, recurring_mode,
  flat_amount, flat_rate, upper_limit
) VALUES (
  1, 'Consumption', 'استهلاك',
  'CONSUMPTION',         -- charge_group
  'STEPS',               -- charge_type
  'MONTHLY',             -- recurring_mode
  NULL, NULL, NULL
);
```

Maximum of ONE STEPS charge per charge_group per tariff.

#### 3b: Consumption Tiers

```sql
INSERT INTO tariff_charges_details (
  charge_id, from_usage, to_usage,
  rate_value, extra_amount
) VALUES
  (1, 0, 100, 50, NULL),    -- 0-100 kWh @ 50 milliemes
  (1, 101, 200, 75, NULL),  -- 101-200 kWh @ 75 milliemes
  (1, 201, 350, 100, NULL), -- 201-350 kWh @ 100 milliemes
  (1, 351, 650, 125, NULL), -- 351-650 kWh @ 125 milliemes
  (1, 651, NULL, 150, NULL);-- 651+ kWh @ 150 milliemes (∞ to)
```

#### 3c: Customer Service Charge (STEPS - consumption based)

```sql
INSERT INTO tariff_charges (
  tariff_id, name_en, charge_group,
  charge_type, recurring_mode
) VALUES (
  1, 'Customer Service Fees', 'CUSTOMER_SERVICE',
  'STEPS', 'MONTHLY'
);

-- Customer service tiers (based on consumption, not separate)
INSERT INTO tariff_charges_details (charge_id, from_usage, to_usage, rate_value) VALUES
  (2, 0, 100, 50),
  (2, 101, NULL, 75);
```

#### 3d: Fixed Charge (STATIC)

```sql
INSERT INTO tariff_charges (
  tariff_id, name_en, charge_group,
  charge_type, recurring_mode, flat_amount
) VALUES (
  1, 'Admin Fees', 'ISSUE_FEES',
  'STATIC', 'MONTHLY', 27000  -- 27 EGP
);
```

STATIC charges have no dependent `tariff_charges_details` rows.

#### 3e: Yearly Charge (STATIC + YEARLY recurring)

```sql
INSERT INTO tariff_charges (
  tariff_id, name_en, charge_group,
  charge_type, recurring_mode, flat_amount
) VALUES (
  1, 'Contract Stamp', 'FEES',
  'STATIC', 'YEARLY', 3000  -- 3 EGP, January only
);
```

The billing engine must check `recurring_mode = 'YEARLY'` and only apply in January's billing cycle.

#### 3f: Per-Unit Charge (PER_UNIT with upper_limit)

```sql
INSERT INTO tariff_charges (
  tariff_id, name_en, charge_group,
  charge_type, recurring_mode,
  flat_rate, upper_limit
) VALUES (
  1, 'Radio Fee', 'FEES',
  'PER_UNIT', 'MONTHLY',
  90,    -- 90 milliemes per unit
  90     -- capped at 90 units
);
```

**Formula**: `MIN(consumption, upper_limit) × flat_rate`

#### 3g: Zero Consumption Charge (ZERO)

```sql
INSERT INTO tariff_charges (
  tariff_id, name_en, charge_group,
  charge_type, recurring_mode, flat_amount
) VALUES (
  1, 'Zero Reading Fee', 'ISSUE_FEES',
  'ZERO', 'MONTHLY', 9000  -- 9 EGP minimum
);
```

The ZERO charge type overrides the total when consumption = 0 ONLY if the ZERO amount is higher than the natural calculation.

#### 3h: Percentage Charge

```sql
INSERT INTO tariff_charges (
  tariff_id, name_en, charge_group,
  charge_type, recurring_mode, flat_rate
) VALUES (
  1, 'Percentage Fee', 'PERCENTAGE',
  'STATIC', 'MONTHLY', 5  -- 5% of consumption charge
);
```

**Formula**: `consumption_charge × flat_rate / 100`

---

## 4. Assign Tariff to Meter

```sql
UPDATE meter SET tariff_id = 1 WHERE id = 100;
```

In Meter Verse UI:
1. Navigate to Meter Detail
2. Select "Tariff" tab
3. Choose tariff from dropdown (filtered by meter's utility type and active tariffs)
4. Set effective date (timestamp when assignment takes effect)
5. Save

---

## 5. Assign Tariff to Project

Optionally, set a default tariff for a project:

```sql
UPDATE project SET default_tariff_id = 1 WHERE id = 1;
```

New meters created under this project get the default tariff pre-assigned.

---

## 6. Activate / Deactivate Tariff

```sql
-- Activate
UPDATE tariff SET status = 'ACTIVE', end_date = NULL WHERE id = 1;

-- Deactivate (stop using, do NOT delete — needed for historical invoices)
UPDATE tariff SET status = 'INACTIVE', end_date = CURRENT_DATE WHERE id = 1;
```

**Rules:**
- Only ACTIVE tariffs appear in assignment dropdowns
- INACTIVE tariffs preserved for historical invoice recalculation
- Never DELETE a tariff — it invalidates past invoices

---

## 7. Migration (Change All Meters to New Tariff)

When replacing a tariff across all meters:

```sql
-- 1. Create new tariff version (Step 2)
-- 2. Reassign all meters from old to new
UPDATE meter SET tariff_id = (SELECT id FROM tariff WHERE name_en = 'Residential Electricity 2026')
WHERE tariff_id = (SELECT id FROM tariff WHERE name_en = 'Residential Electricity 2025');
-- 3. Deactivate old
UPDATE tariff SET status = 'INACTIVE', end_date = CURRENT_DATE
WHERE name_en = 'Residential Electricity 2025';
```

---

## 8. Rollback

```sql
-- 1. Reactivate old tariff
UPDATE tariff SET status = 'ACTIVE', end_date = NULL
WHERE name_en = 'Residential Electricity 2025';
-- 2. Reassign meters back
UPDATE meter SET tariff_id = (SELECT id FROM tariff WHERE name_en = 'Residential Electricity 2025')
WHERE tariff_id = (SELECT id FROM tariff WHERE name_en = 'Residential Electricity 2026');
-- 3. Deactivate or keep new version
UPDATE tariff SET status = 'INACTIVE'
WHERE name_en = 'Residential Electricity 2026';
```

---

## 9. API Endpoints (Planned)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/tariffs` | GET | List tariffs (filterable by service_type, status) |
| `/api/v1/tariffs` | POST | Create tariff |
| `/api/v1/tariffs/:id` | GET | Get tariff with charges and tiers |
| `/api/v1/tariffs/:id` | PUT | Update tariff header |
| `/api/v1/tariffs/:id` | PATCH | Activate/deactivate |
| `/api/v1/tariffs/:id/charges` | POST | Add charge to tariff |
| `/api/v1/tariffs/:id/charges/:cid` | PUT | Update charge |
| `/api/v1/tariffs/:id/charges/:cid/tiers` | POST | Add tier to STEPS charge |
| `/api/v1/tariffs/:id/charges/:cid/tiers/:tid` | PUT | Update tier |
| `/api/v1/tariffs/:id/version` | POST | Create new version (with parent_id) |
| `/api/v1/tariffs/:id/migrate` | POST | Migrate all meters to this tariff |
| `/api/v1/tariffs/:id/rollback` | POST | Rollback to parent version |

---

## 10. Validation Checklist

- [ ] Tariff has at least one CONSUMPTION charge (STEPS or FLAT)
- [ ] STEPS charges have at least one tier
- [ ] Tier ranges do not overlap (from_usage of next = to_usage of previous + 1)
- [ ] The last tier has to_usage = NULL (unbounded)
- [ ] Customer service charge exists (can be STEPS or STATIC)
- [ ] ZERO charge exists for minimum billing
- [ ] All charge amounts are in milliemes (integer)
- [ ] Monthly vs Yearly charges are correctly flagged
- [ ] Tariff start_date ≤ current billing date
- [ ] Tariff status = ACTIVE
- [ ] Meter assignment date falls within tariff validity period
