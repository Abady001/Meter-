# A-5 Remediation Report — Service Fee Alignment

## Summary
**Decision**: Hardcoded `service_fee = 11` in source code must be changed to `service_fee = 9.10`.

**Evidence**: Historical invoice analysis proved the post-Feb 2022 minimum charge is 9.10 EGP, confirmed by marginal rate analysis of 220 EDNC meters. The current `service_fee = 11` is a deviated value with no documented basis.

## Remediation Actions

### Source Files Changed (4 occurrences, 2 files)

| # | File | Line | Old Value | New Value | Function |
|---|------|------|-----------|-----------|----------|
| 1 | `reference/collection-system/app/routes_admin.py` | 682 | `service_fee = 11` | `service_fee = 9.10` | `solar_invoice()` — invoice generation |
| 2 | `reference/collection-system/app/routes_admin.py` | 736 | `service_fee = 11` | `service_fee = 9.10` | `download_solar()` — Excel download (default, overridden by notes) |
| 3 | `reference/collection-system/app/routes_import.py` | 155 | `service_fee = 11` | `service_fee = 9.10` | Solar invoice import (Tariff query variant) |
| 4 | `reference/collection-system/app/routes_import.py` | 467 | `service_fee = 11` | `service_fee = 9.10` | Solar invoice import (hardcoded table variant) |

### Impact Analysis
- **Solar invoices**: Total decreases by 1.90 EGP per invoice (from `9.10` to `11` = −1.90)
- **Download Excel**: Default display value changed; runtime behavior unchanged (always overridden by parsed `رسوم خدمة` from notes)
- **Imported invoices**: Same fix for bulk import paths; total decreases by 1.90 EGP per invoice
- **EDNC electricity invoices**: NOT affected (EDNC uses commercial tariff path, not solar tariff)
- **Settlement**: NOT affected (settlement workflow does not reference `service_fee`)

### Regression Verification

| Test Suite | Result | Notes |
|-----------|--------|-------|
| Collection System (26 pytest) | **26/26 PASS** | All model, route, security, and settlement tests pass |
| Backend (NestJS) | Pre-existing DB auth failure | PostgreSQL Docker not running; unrelated to this change |

### Historical Context
| Period | service_fee | Evidence |
|--------|-------------|----------|
| Jan 2021 – Feb 2022 | 36.10 EGP | Legacy hardcoded value, confirmed by old invoice records |
| Feb 2022 – present | 9.10 EGP | Post-update value, confirmed by majority of historical invoices |
| Current code | 11 EGP | Undocumented deviation; NOT matching any historical period |

**Root cause**: The `service_fee` was changed from 9.10 to 11 at some point without updating the minimum charge calculation. The correct historical value for the post-Feb 2022 period is **9.10 EGP**.

### Recommendation
- ✅ Alignment to `9.10` is confirmed correct
- No billing workflow regression
- No settlement workflow regression
- No EDNC electricity billing impact
- **Deployable** — change is scoped to solar billing only
