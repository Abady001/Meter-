# J12 — JRXML Conversion Strategy & Final Board

**Date:** 2026-06-19

---

## Conversion Decision

### Option A: Convert JRXML → Meter Verse HTML Template (RECOMMENDED)

| Factor | Assessment |
|--------|-----------|
| **Feasibility** | ✅ HIGH — 22/22 JRXML fields already mapped 1:1 in current Master Framework |
| **Effort** | ~4h per template = ~176h for all 44 |
| **Risk** | LOW — current Puppeteer HTML→PDF pipeline works. Only CSS/HTML layout needs updating |
| **Advantage** | Full control over layout, fonts, bilingual support, QR codes |
| **Current parity** | Already at 85% visual, 100% calculation for basic invoices |

### Option B: Add JasperReports as Rendering Engine

| Factor | Assessment |
|--------|-----------|
| **Feasibility** | 🟡 MODERATE — would require JasperReports server (Java) alongside NestJS (Node) |
| **Effort** | ~80h initial integration + ~8h per template = ~432h total |
| **Risk** | HIGH — adds Java runtime dependency, complicates deployment |
| **Disadvantage** | Loses bilingual framework, amount-in-words engine, Puppeteer PDF benefits |

### Verdict: Option A — Convert JRXML logic to Meter Verse HTML templates

The current Master Invoice Framework already implements the JRXML logic correctly (100% calculation parity). The only gap is visual layout (85% parity). Converting the layout is straightforward HTML/CSS work.

---

## J11: Report Parity Board

| Category | Total | Ported | Missing | Strategy |
|----------|-------|--------|---------|----------|
| Invoice templates | 10 | 2 (elec + water) | 8 | HTML conversion |
| Financial reports | 3 | 0 | 3 | HTML + Recharts |
| Payment/Receipt | 5 | 1 | 4 | HTML conversion |
| Customer reports | 5 | 0 | 5 | HTML + SmartTable |
| Meter reports | 5 | 0 | 5 | HTML + SmartTable |
| Consumption reports | 3 | 0 | 3 | HTML + Recharts |
| Invoice reports | 3 | 0 | 3 | HTML + SmartTable |
| Tariff/Alerts | 5 | 0 | 5 | HTML conversion |
| Audit/Misc | 5 | 0 | 5 | HTML + SmartTable |
| **Total** | **44** | **3** | **41** | **~4h each** |

---

## Final Certification

| Certification | Result | Score |
|---------------|--------|-------|
| Invoice Parity | ❌ | ~85% (needs 98%+) |
| Calculation Parity | ✅ | 100% |
| Field Mapping | ✅ | 100% (22/22 fields) |
| Report Parity | ❌ | ~7% (41/44 missing) |
| Import Parity | ❌ | ~30% (5/11 templates) |
| Utility Parity | ❌ | 6/7 (Gas missing) |

**READY_FOR_SBILL_REPLACEMENT = NO**

**Required to close the gap: ~136h of focused document work**

The conversion decision is clear: **keep the current HTML/Puppeteer pipeline and convert JRXML layouts to HTML templates** — not because JRXML can't be parsed (it can), but because the current architecture already works and only needs CSS/HTML refinement.
