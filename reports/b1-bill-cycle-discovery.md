# B1: SBill Bill Cycle Discovery

## Overview

The SBill billing system at **EPower October (أكتوبر)** uses a **bill cycle** mechanism to group and track invoice generation runs. Each cycle represents a batch job that processes meters of a specific utility type for a given billing period.

---

## Bill Cycle Page (`/bill-cycle`)

URL: `http://10.50.30.2:9999/#/bill-cycle?page=1&size=10&sort=id,asc`

### Table Columns

| Column | Description |
|---|---|
| ID | Auto-increment primary key |
| Month | Billing period (e.g. "Jan 2000", "Oct 2023") |
| Service | Utility type: `ELECTRICITY` or `WATER` |
| Success Count | Number of invoices successfully generated |
| Failed Count | Number of invoices that failed to generate |
| Cancelled Count | Number of old invoices cancelled (rebill) |

### Live Records

| ID | Month | Service | Success | Failed | Cancelled |
|---|-------|---------|---------|--------|-----------|
| 1 | Jan 2000 | ELECTRICITY | -21,882 | 0 | 21,882 |
| 2 | Jan 2000 | WATER | -108 | 0 | 108 |
| 10009 | Oct 2023 | ELECTRICITY | 860 | 2 | 611 |
| 10010 | Nov 2023 | ELECTRICITY | 887 | 0 | 618 |
| 10011 | Oct 2023 | WATER | 802 | 2 | 126 |
| 10012 | Nov 2023 | WATER | 825 | 0 | 206 |
| 10013 | Sep 2023 | ELECTRICITY | 183 | 0 | 10 |
| 10014 | Aug 2023 | ELECTRICITY | 116 | 0 | 8 |
| 10015 | Dec 2023 | ELECTRICITY | 909 | 1 | 24 |
| 10016 | Dec 2023 | WATER | 861 | 0 | 149 |

### Key Mathematical Relationship

```
Success + Cancelled = Total invoices for the billing period
```

**Evidence from live data:**

- Cycle 10009 (Oct 2023 ELECTRICITY): 860 + 611 = 1,471 total invoices
- Cycle 10010: 887 + 618 = 1,505
- Cycle 10011: 802 + 126 = 928
- Cycle 10012: 825 + 206 = 1,031

### Negative Success Count = Rebilling

Cycles **ID 1** and **ID 2** (Jan 2000) show **negative success counts**:

| ID | Success | Cancelled | Net |
|---|---------|-----------|-----|
| 1 | -21,882 | 21,882 | 0 |
| 2 | -108 | 108 | 0 |

This indicates the **initial historic data migration/rebill**:
- Old invoices from before the system were cancelled (21,882 + 108 records)
- New invoices were generated in their place
- The negative success means the cancellation batch was larger than the generation
- Net = 0 indicates the cycle balanced (full replacement)

---

## New Bill Cycle Form (`/bill-cycle/new`)

URL: `http://10.50.30.2:9999/#/bill-cycle/new`

### Form Fields

| Field | Type | Options |
|---|---|---|
| Service Type | Radio buttons | Electricity, Water, Electricity Virtual, Water Virtual |
| Month | Text input | Month name or number |
| Year | Text input | 4-digit year |
| Start | Button (disabled until valid) | Triggers the billing run |

### Observations

- No "Project" selector visible — the system uses the single project (ID=1, October)
- **Electricity Virtual** and **Water Virtual** are service types for virtual meters (submeters or calculated meters)
- The Start button remains **disabled** until both Month and Year are filled and a Service Type is selected
- This confirms billing runs are **per utility type**, not a combined run

---

## Settlement Types (`/settlements`)

URL: `http://10.50.30.2:9999/#/settlements`

### Records

| ID | Name | Allowed Months |
|---|------|---------------|
| 1 | فرق تعريفة (Tariff Difference) | 1 |
| 4 | تسويه استهلاك (Consumption Settlement) | 1 |

### Purpose

- **فرق تعريفة (Tariff Difference)**: Applied when a tariff change occurs mid-period — the system recalculates consumption at the new rate and adjusts the difference
- **تسويه استهلاك (Consumption Settlement)**: Used to settle/correct consumption values when readings are adjusted or estimated readings are later replaced with actuals
- Both allow only 1 month settlement window

---

## Billing Workflow (Observed from UI)

1. **Readings Import** — Monthly readings uploaded via Data Upload; Early Readings entered manually
2. **Validation** — Readings reviewed and corrected in Early Readings screen
3. **Bill Cycle Creation** — User selects Service Type + Month + Year, clicks Start
4. **Batch Execution** — System runs the billing engine for all meters of that service type
5. **Invoice Generation** — Invoices created for each meter
6. **Old Invoice Cancellation** — If rebilling, the previous cycle's invoices for the same period are cancelled
7. **Posting** — Invoices posted to customer accounts, updating balances

---

## Relationship to Other System Components

- **Customers**: 1,422 total (1,421 active, 1 inactive)
- **Meters**: 2,913 total (2,888 active, 2 inactive, 23 new)
- **Financials**: 163,626,755 EGP invoiced total (147,860,893 paid = 90%, 15,765,862 open = 9.64%)
- **Invoices**: Each invoice links to a billing_cycle via billing_cycle_id
