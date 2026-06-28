# Phase F1 — Chilled Water & Settlement Business Rule Discovery

## 1. System Overview

Meter Verse (Collection System) supports chilled water billing through **two parallel paths**:

1. **Legacy Direct Invoice** (`routes_admin.py:755`): One-off invoice creation from meter reading entry
2. **Settlement Engine** (`routes_chilled_settlement.py`): Versioned monthly settlements with approval workflow, carry-forward, and audit trail

Both paths are backed by the same data sources (BTU meters, customers) and produce invoices in the same Transaction table with `description` containing `'مياه مثلجة'` (chilled water).

## 2. BTU Reading Workflow

### 2.1 Reading Sources
- **Smart BTU meters**: Automatic monthly readings (per `Smart BTU Meter Card 04-2025.xlsx`)
- **Manual entry**: Excel files (`Golf Central Mall BTU Invoices *.xlsx`, `Palm Central BTU Invoices *.xlsx`)
- **Missing reading files**: `Palm Central Missing BTU Reading *.xlsx` (07-2025 through 12-2025)
- **IZAR Mall**: Unit-level PDF files in `Izar_Mall_Chilled_Water\Unit XXX\*.pdf`

### 2.2 Consumption Calculation
```python
# From routes_admin.py:776
consumption = max(reading - prev_reading, 0)

# From settlement XLSM template (09-2025):
# Consumption = Current Reading - Previous Reading
# If first reading: Previous Reading = 0
```

**Evidence**: Settlement XLSM files show `Previous Reading: 0 | Current Reading: 4140 | Consumption: 4140`

### 2.3 Previous Reading Discovery
The previous reading is discovered from the last chilled water invoice's notes:
```python
# From routes_admin.py:767-775
prev_inv = Transaction.query.filter_by(customer_id=customer.id, transaction_type='invoice'
    ).filter(Transaction.description.like('%مياه مثلجة%')).order_by(Transaction.id.desc()).first()
# Parse prev_reading from notes: 'قراءة: X | سابقة: Y | الاستهلاك: Z BTU'
```

**Evidence**: `routes_admin.py:783` stores reading data as `قراءة: {reading} | سابقة: {prev_reading} | الاستهلاك: {consumption} BTU`

## 3. Chilled Water Pricing

### 3.1 Default Rate
```python
# From __init__.py:69 (default tariff tiers)
'chilled': [(0, 999999, 3.0)]

# From routes_admin.py:781 (fallback)
amount = consumption * 3.0
```

**Default BTU rate: 3.0 EGP per BTU consumption unit**

### 3.2 Tariff-Based Rate
```python
# From routes_admin.py:777-779
chilled_tariff = Tariff.query.filter_by(type='chilled').first()
if chilled_tariff and chilled_tariff.mode == 'FLAT' and chilled_tariff.flat_rate:
    amount = consumption * float(chilled_tariff.flat_rate)
```

If a `Tariff` record with `type='chilled'` and `mode='FLAT'` exists, its `flat_rate` is used instead of 3.0.

### 3.3 Settlement Config Rate
```python
# From routes_chilled_settlement.py:48 (ChilledWaterConfig)
base_btu_rate = 3.0  # default, configurable per customer/meter
```

Per-customer BTU rate can be configured in `ChilledWaterConfig.base_btu_rate`.

### 3.4 No Additional Charges
**Evidence from 39 GC BTU invoices (12-2025):**
| Field | Value |
|-------|-------|
| Taxs | 0.00 for all rows |
| Fees | 0.00 for all rows |
| Customer Service | 0.00 for all rows |
| Admin Fees | 0.00 for all rows |

**Evidence from settlement XLSM files:**
| Line | Value |
|------|-------|
| رسوم ودمغات (Fees/Stamps) | 0 |
| مصاريف إدارية / أخرى (Admin/Other) | 0 |

## 4. Invoice Calculation Formula

### 4.1 Direct Invoice Path
```
Total = Consumption × BTU_Rate

Where:
- BTU_Rate = 3.0 EGP/BTU (default)
- Consumption = max(Current_Reading - Previous_Reading, 0)
- No taxes, no fees
```

**Verified examples from GC BTU Invoices 12-2025:**
| Customer | Cons | Rate | Total | Formula |
|----------|------|------|-------|---------|
| روزى نايل بوتيك | 1,279 | 3.0 | 3,837.00 | 1279 × 3 = 3837 ✓ |
| الشايع بمصر | 1,643 | 3.0 | 4,929.00 | 1643 × 3 = 4929 ✓ |
| ذا فود كالتشر | 12,584 | 3.0 | 37,752.00 | 12584 × 3 = 37752 ✓ |
| الهولندية للايس كريم | 2,486 | 3.0 | 7,458.00 | 2486 × 3 = 7458 ✓ |
| الخالدي لاقامة المطاعم | 3,166 | 3.0 | 9,498.00 | 3166 × 3 = 9498 ✓ |
| هايف مصر | 2,990 | 3.0 | 8,970.00 | 2990 × 3 = 8970 ✓ |
| البريد للاستثمار | 207 | 3.0 | 621.00 | 207 × 3 = 621 ✓ |
| معامل الفا لاب مصر | 469 | 3.0 | 1,407.00 | 469 × 3 = 1407 ✓ |

**Verified from GC correction invoice 12-2025:**
- شركة دريمز لتجارة المواد الغذائية: cons=39,819.167, total=110,324.367
  - 39,819.167 × 3 = 119,457.501 ≠ 110,324.367
  - Rate = 110,324.367 / 39,819.167 = 2.770... ❌ (this is a correction with different formula)

**PC BTU Invoices 12-2025 verification:**
| Customer | Cons | Rate | Total | Formula |
|----------|------|------|-------|---------|
| Compass Capital | 10 | 3.0 | 30.00 | 10 × 3 = 30 ✓ |
| الأرض للاستثمار العقارى | 674 | 3.0 | 2,022.00 | 674 × 3 = 2022 ✓ |
| .شركة سوليد للانشاءات | 5,600 | 3.0 | 16,800.00 | 5600 × 3 = 16800 ✓ |

### 4.2 Settlement Invoice Formula
```
Total = Fixed_Amount + (BTU_Consumption × Rate_per_BTU)
```
Where:
- `Fixed_Amount` = `ChilledWaterConfig.monthly_fixed_amount` (default 0)
- `BTU_Consumption` = from settlement record
- `Rate_per_BTU` = `ChilledWaterConfig.base_btu_rate` (default 3.0)

**From settlement XLSM (09-2025):**
```
Consumption = 4140, Rate = 3.0, Fixed = 0
Total = 0 + 4140 × 3.0 = 12,420 ✓
```

## 5. Settlement Workflow

### 5.1 Data Model
```python
class ChilledWaterSettlement:
    id, customer_id (FK), meter_serial, bill_cycle_id (FK)
    settlement_date, btu_consumption (Numeric 12,3)
    rate_per_btu (Numeric 12,4, default 3.0)
    fixed_amount, variable_amount, total_amount (Numeric 12,2)
    carry_forward, previous_balance (Numeric 12,2)
    notes, version (int)
    status: DRAFT → APPROVED → PAID
    approved_by_id (FK), approved_at
    created_by_id (FK), created_at, updated_at

class ChilledWaterConfig:
    id, customer_id (FK), meter_serial
    base_btu_rate (Numeric 12,4, default 3.0)
    monthly_fixed_amount (Numeric 12,2)
    admin_fee, service_fee (Numeric 12,2)
    description, is_active
```

### 5.2 First-Time Setup
1. POST to `/chilled-water/settlement/create`
2. System checks for active `ChilledWaterConfig`
3. If no config → returns `{first_time: true}` → redirects to `/chilled-water/settlement/config`
4. Config route: deactivates old configs → creates new `ChilledWaterConfig` → creates initial `ChilledWaterSettlement` (v1, DRAFT)

### 5.3 Carry-Forward Logic
```python
# From chilled_settlement_create()
carry_forward = prev.carry_forward if prev else 0
previous_balance = prev.total_amount if prev else 0
```

When creating a new settlement, the previous settlement's `carry_forward` and `total_amount` are carried forward to the new record. This tracks unpaid balances across months.

### 5.4 Versioning (Append-Only)
```python
# From chilled_settlement_edit()
new_v = ChilledWaterSettlement(
    ...,
    version=(settlement.version or 1) + 1,
    status='DRAFT',
    previous_balance=float(settlement.total_amount or 0),
    ...
)
```

Each edit creates a **new row** (append-only), not an update. Version numbers increment. The full history is preserved for audit.

### 5.5 Edit Guard
```python
# From chilled_settlement_edit()
active_invoice = Transaction.query.filter_by(
    customer_id=settlement.customer_id, transaction_type='invoice'
).filter(Transaction.description.contains('مياه مثلجة')).filter(
    Transaction.month_of == settlement_settlement_date.strftime('%Y-%m')
).first()
if active_invoice:
    flash('لا يمكن تعديل التسوية - توجد فاتورة نشطة لهذا الشهر', 'danger')
    return redirect(...)
```

Settlement edits are BLOCKED if an active invoice with `'مياه مثلجة'` in the description exists for the same customer and month.

### 5.6 Approval Workflow
```python
# From chilled_settlement_approve()
settlement.status = 'APPROVED'
settlement.approved_by_id = current_user.id
settlement.approved_at = datetime.datetime.utcnow()
```

Status transitions: `DRAFT → APPROVED` only. No rejection path. Sets approval metadata.

### 5.7 Calculation on Edit
```python
# From chilled_settlement_edit()
btu = float(request.form.get('btu_consumption', 0) or 0)
rate = float(request.form.get('rate_per_btu', float(settlement.rate_per_btu or 3.0)))
fixed = float(request.form.get('fixed_amount', float(settlement.fixed_amount or 0)))
variable = btu * rate
total = float(request.form.get('total_amount', 0) or 0) or (fixed + variable)
carry = float(request.form.get('carry_forward', float(settlement.carry_forward or 0)))
```

The edit form allows: BTU consumption, rate, fixed amount, total amount (auto-calculated or overridden), carry-forward. Notes field updates `'تعديل التسوية'`.

## 6. Settlements vs Invoices Relationship

The data shows two different customer sets:

**GC BTU Invoice customers (19 tenants, 12-2025):**
- Listed in `Golf Central Mall BTU Invoices 12-2025.xlsx`
- Core billed tenants with direct BTU meters
- Total consumption range: 0–12,584 BTU

**GC BTU Settlement customers (17 tenants, 12-2025):**
- Individual PDF files in `Golf Central Mall BTU Settlements 12-2025\`
- Overlap with invoice customers (e.g., Mon Maki, GIGI, Villa Luca are both invoiced and have settlements)
- Settlements are per-tenant financial documents with same BTU formula

## 7. Invoice Number Convention

```python
# From routes_admin.py:784
invoice_no = f'{month}-CHILLED-{customer.id}'

# From data
# Bill Number format: 202512XXXXX (year + month + sequential 5-digit)
```

Meter Verse uses `{month}-CHILLED-{customer.id}` format. Legacy system uses `YYYYMMXXXXX` format.

## 8. Data Sources (All Properties)

| Property | BTU Invoices | BTU Settlements | Period |
|----------|-------------|-----------------|--------|
| Golf Central Mall (GC) | Monthly XLSX + PDF | Monthly PDF per tenant | 02-2025 → 04-2026 |
| Palm Central (PC) | Monthly XLSX + PDF | — | 02-2025 → 12-2025 |
| IZAR Mall | Monthly XLSX | — | 03-2025 → 11-2025 |
| Correction Invoices | XLSX (GC 12-2025) | — | One-time |

## 9. Key Business Rules Summary

| Rule | Detail | Evidence Source |
|------|--------|----------------|
| BTU consumption = Current − Previous | Previous = 0 if first reading | `routes_admin.py:776` |
| BTU rate = 3.0 EGP (default) | Configurable per tariff or per customer | `__init__.py:69`, `routes_admin.py:781` |
| No taxes on BTU | Taxs = 0 for all 39 GC invoices | BTU Invoices 12-2025 data |
| No fees on BTU | Fees = 0, CS = 0, Admin = 0 | BTU Invoices 12-2025 data |
| Total = Consumption × Rate | Pure flat rate, no tiers | 30+ verified invoices |
| Settlement versioning | Append-only, incrementing version | `routes_chilled_settlement.py:110-121` |
| Carry-forward | Previous carry + total carried to new version | `routes_chilled_settlement.py:40-51` |
| Edit guard | Blocked if active invoice for same month | `routes_chilled_settlement.py:96-103` |
| Approval only | DRAFT → APPROVED, no rejection | `routes_chilled_settlement.py:127-137` |
| Invoice notes | Store reading data for next month's calc | `routes_admin.py:783` |
| Bill number format | YYYYMMXXXXX (legacy) or MM-CHILLED-ID (system) | Invoice data + `routes_admin.py:784` |
