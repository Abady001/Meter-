# Tariff Discovery Report

**Source:** Live SBill API — 11 tariffs discovered
**Date:** 2026-06-20
**Status:** Investigation / Planning

---

## JWT Payload (Admin User)

| Field       | Value                                                                      |
|-------------|----------------------------------------------------------------------------|
| Username    | admin                                                                      |
| Roles       | BILLING_ADMIN, CS_TEAM, CUSTOMER, SYSTEM_ADMIN, TECH_TEAM                  |
| projectId   | 1                                                                          |

The admin token carries 5 roles plus a single `projectId=1`, indicating a multi-tenant SBill setup scoped to project 1.

---

## Tariff Inventory (11 Total)

### Tariff 1 — "منزلي" (Residential) — ELECTRICITY

| Property       | Value                              |
|----------------|------------------------------------|
| ID             | 1                                  |
| Name (AR)      | منزلي                              |
| Type           | ELECTRICITY                        |
| Mode           | STEP                               |
| Start Date     | 2020-07-01                         |
| End Date       | 2024-01-31                         |
| Charges        | 6 total (see below)                |

**Charges:**

| # | Name | Charge Group | Type | Details |
|---|------|-------------|------|---------|
| 1 | Consumption | CONSUMPTION | STEPS | Progressive tier rates |
| 2 | Customer Service Fees | CUSTOMERCARE | STEPS | Tiered service fee |
| 3 | المقروء بصفر (Zero Reading) | ZERO | ZERO | flatAmount=9000 milliemes (**9 EGP**) — MONTHLY |
| 4 | Radio Fees | TAX | PER_UNIT | flatRate=90, upperLimit=90 — MONTHLY |
| 5 | Governmental | TAX | STATIC | flatAmount=10 milliemes — MONTHLY |
| 6 | دمغة عقد (Stamp) | TAX | STATIC | flatAmount=3000 milliemes (**3 EGP**) — YEARLY (January) |

---

### Tariff 2 — "منزلي" (Residential) — WATER

| Property       | Value                              |
|----------------|------------------------------------|
| ID             | 2                                  |
| Name (AR)      | منزلي                              |
| Type           | WATER                              |
| Mode           | STEP                               |
| Start Date     | 2019-07-01                         |
| End Date       | 2024-09-30                         |
| Charges        | 5 total (see below)                |

**Charges:**

| # | Name | Charge Group | Type | Details |
|---|------|-------------|------|---------|
| 1 | Consumption | CONSUMPTION | STEPS | Progressive tier rates |
| 2 | مصاريف استدامة خدمة (Service Sustainability) | CUSTOMERCARE | STEPS | Tiered sustainability fee |
| 3 | المقروء بصفر (Zero Reading) | ZERO | ZERO | flatAmount=9000 milliemes (**9 EGP**) — MONTHLY |
| 4 | مصاريف أخرى (Other Fees) | ISSUE | STATIC | flatAmount=27000 milliemes (**27 EGP**) — MONTHLY |
| 5 | خدمات الجهاز التنظيمي (Regulatory Services) | ISSUE | PER_UNIT | flatRate=10 milliemes — MONTHLY |

---

### Tariff 3 — "تجاري" (Commercial) — ELECTRICITY

| Property       | Value                              |
|----------------|------------------------------------|
| ID             | 3                                  |
| Name (AR)      | تجاري                              |
| Type           | ELECTRICITY                        |
| Mode           | STEP                               |
| Start Date     | 2020-07-01                         |
| End Date       | 2024-01-31                         |
| Charges        | 7 total (see below)                |

**Charges:**

| # | Name | Charge Group | Type | Details |
|---|------|-------------|------|---------|
| 1 | Consumption | CONSUMPTION | STEPS | Progressive tier rates |
| 2 | Customer Service Fees | CUSTOMERCARE | STEPS | Tiered service fee |
| 3 | المقروء بصفر (Zero Reading) | ZERO | ZERO | flatAmount=9000 milliemes (**9 EGP**) — MONTHLY |
| 4 | Radio Fees | TAX | STATIC | flatAmount=90 milliemes — MONTHLY |
| 5 | Governmental | TAX | STATIC | flatAmount=10 milliemes — MONTHLY |
| 6 | تمغة إستهلاك (Consumption Stamp) | TAX | PER_UNIT | flatRate=32 milliemes — MONTHLY |
| 7 | دمغة عقد (Stamp) | TAX | STATIC | flatAmount=3000 milliemes (**3 EGP**) — YEARLY |

---

### Tariff 5 — "مياه منزلي خدمي حدائق" (Residential Service Gardens) — WATER

| Property       | Value                                          |
|----------------|------------------------------------------------|
| ID             | 5                                              |
| Name (AR)      | مياه منزلي خدمي حدائق                          |
| Type           | WATER                                          |
| Mode           | STEP                                           |
| Start Date     | 2022-01-01                                     |
| End Date       | 2022-01-01                                     |
| Charges        | *(To be fetched from API)*                     |

Note: This tariff has a single-day validity window (Jan 1 2022 only) — likely a legacy/year-specific tariff.

---

### Tariff 10016 — "مياه خدمي حمام سباحه" (Service Swimming Pool) — WATER

| Property       | Value                              |
|----------------|------------------------------------|
| ID             | 10016                              |
| Name (AR)      | مياه خدمي حمام سباحه               |
| Type           | WATER                              |
| Mode           | STEP                               |
| Start Date     | 2023-03-01                         |
| End Date       | 2024-02-29                         |
| Charges        | *(To be fetched from API)*         |

---

### Tariff 10017 — "مياه خدمى" (Service Water) — WATER

| Property       | Value                              |
|----------------|------------------------------------|
| ID             | 10017                              |
| Name (AR)      | مياه خدمى                          |
| Type           | WATER                              |
| Mode           | STEP                               |
| Start Date     | 2023-03-01                         |
| End Date       | 2025-11-30                         |
| Charges        | *(To be fetched from API)*         |

---

### Tariff 10018 — "مياه تجارى" (Commercial Water) — WATER

| Property       | Value                              |
|----------------|------------------------------------|
| ID             | 10018                              |
| Name (AR)      | مياه تجارى                         |
| Type           | WATER                              |
| Mode           | STEP                               |
| Start Date     | 2019-07-01                         |
| End Date       | 2024-09-30                         |
| Charges        | *(To be fetched from API)*         |

---

### Tariff 10022 — "مياه منزلى" (Domestic Water) — WATER

| Property       | Value                              |
|----------------|------------------------------------|
| ID             | 10022                              |
| Name (AR)      | مياه منزلى                         |
| Type           | WATER                              |
| Mode           | STEP                               |
| Start Date     | 2023-03-01                         |
| End Date       | 2025-11-29                         |
| Charges        | *(To be fetched from API)*         |

---

### Tariff 10054 — "Chilled Water" — ELECTRICITY (actually Chilled Water)

| Property       | Value                              |
|----------------|------------------------------------|
| ID             | 10054                              |
| Name (EN)      | Chilled Water                      |
| Type           | ELECTRICITY *(misclassified)*      |
| Mode           | FLAT                               |
| flatRate       | 3000 milliemes (**3 EGP/unit**)    |
| Start Date     | 2024-07-03                         |
| End Date       | null (ongoing)                     |
| Charges        | *(To be fetched from API)*         |

---

### Tariff 10062 — "chilled_3" — ELECTRICITY (actually Chilled Water)

| Property       | Value                              |
|----------------|------------------------------------|
| ID             | 10062                              |
| Name (EN)      | chilled_3                          |
| Type           | ELECTRICITY *(misclassified)*      |
| Mode           | FLAT                               |
| flatRate       | 3000 milliemes (**3 EGP/unit**)    |
| Start Date     | 2024-06-01                         |
| End Date       | null (ongoing)                     |
| Charges        | *(To be fetched from API)*         |

---

### Tariff 10078 — "Electric Car Charging" — ELECTRICITY

| Property       | Value                              |
|----------------|------------------------------------|
| ID             | 10078                              |
| Name (EN)      | Electric Car Charging              |
| Type           | ELECTRICITY                        |
| Mode           | FLAT                               |
| flatRate       | 1890 milliemes (**1.89 EGP/unit**) |
| Start Date     | 2019-01-01                         |
| End Date       | 2024-10-31                         |
| Charges        | *(To be fetched from API)*         |

---

## Summary Matrix

| ID | Name | Utility | Mode | Period | Charges Count |
|----|------|---------|------|--------|---------------|
| 1 | منزلي (Residential) | ELECTRICITY | STEP | 2020-07-01 → 2024-01-31 | 6 |
| 2 | منزلي (Residential) | WATER | STEP | 2019-07-01 → 2024-09-30 | 5 |
| 3 | تجاري (Commercial) | ELECTRICITY | STEP | 2020-07-01 → 2024-01-31 | 7 |
| 5 | مياه منزلي خدمي حدائق | WATER | STEP | 2022-01-01 only | TBD |
| 10016 | مياه خدمي حمام سباحه | WATER | STEP | 2023-03-01 → 2024-02-29 | TBD |
| 10017 | مياه خدمى | WATER | STEP | 2023-03-01 → 2025-11-30 | TBD |
| 10018 | مياه تجارى | WATER | STEP | 2019-07-01 → 2024-09-30 | TBD |
| 10022 | مياه منزلى | WATER | STEP | 2023-03-01 → 2025-11-29 | TBD |
| 10054 | Chilled Water | ELECTRICITY* | FLAT | 2024-07-03 → ongoing | TBD |
| 10062 | chilled_3 | ELECTRICITY* | FLAT | 2024-06-01 → ongoing | TBD |
| 10078 | Electric Car Charging | ELECTRICITY | FLAT | 2019-01-01 → 2024-10-31 | TBD |

\* — stored as ELECTRICITY type in SBill but functionally chilled water.

---

## Charge Group Mapping (Cross-Reference)

| SBill DB String | JRXML Constant | Meter Verse Number | Purpose                           |
|-----------------|----------------|--------------------|-----------------------------------|
| CONSUMPTION     | CONSUMPTION(0) | 0                  | Energy/water consumption charges  |
| CUSTOMERCARE    | CUSTOMER_SERVICE(2,3) | 2,3          | Customer service / sustainability |
| ISSUE           | ISSUE_FEES(4)  | 4                  | Issue fees / other fees           |
| TAX             | TAX(6)         | 6                  | Taxes (governmental, stamp, radio)|
| ZERO            | —              | —                  | Zero-reading penalty              |
| —               | FEES(1)        | 1                  | General fees                      |
| —               | PERCENTAGE(5)  | 5                  | Percentage-based charges          |

---

## Amount Conventions

- All amounts stored in **milliemes** (1,000 milliemes = 1 EGP)
- Display conversion: `amount / 1000` → EGP
- Example: flatAmount=9000 → 9 EGP
- Example: flatAmount=27000 → 27 EGP
- Example: flatAmount=3000 → 3 EGP
- Example: flatRate=1890 → 1.89 EGP/unit
