# Template Field Catalog — All Discoverable Fields

**Status**: INVESTIGATION / PLANNING ONLY — no code changes.
**Date**: 2026-06-20
**Source**: `invoice-template.service.ts`, `invoice-document.model.ts`, `template-config.ts`, `invoice-template.html`, SBill JRXML references

---

## 1. Field Definition Interface

```typescript
interface FieldDefinition {
  id: string;
  variable: string;              // {{VARIABLE_NAME}}
  label: string;                 // Human-readable name (EN)
  labelAr: string;               // Human-readable name (AR)
  category: FieldCategory;
  source: string;                // Data source path
  type: 'text' | 'number' | 'date' | 'image' | 'amount' | 'computed';
  conditional?: string;          // Condition expression for conditional fields
  defaultValue: string;
  required: boolean;             // Mandatory for publish
  sampleValue: string;           // For preview rendering
  format?: 'amount' | 'number' | 'date' | 'abs-amount';
}

type FieldCategory = 'header' | 'company' | 'customer' | 'meter' | 'charge' | 'financial' | 'conditional';
```

---

## 2. Header Fields (6 fields)

| # | Field | Variable | Source | Type | Required | Sample Value |
|---|-------|----------|--------|------|----------|-------------|
| 1 | Invoice Title | `{{INVOICE_TITLE}}` | `d.invoiceTitle` from `utility-config` | text | ✅ | فاتورة كهرباء |
| 2 | Invoice Number | `{{INVOICE_NUMBER}}` | `d.invoiceNumber` from `invoice.invoiceNumber` | text | ✅ | INV-2026-001234 |
| 3 | Issue Date | `{{ISSUE_DATE}}` | `d.issueDate` from `invoice.issueDate` | date | ✅ | 2026-06-15 |
| 4 | Due Date | `{{DUE_DATE}}` | `d.dueDate` from `invoice.dueDate` | date | ❌ | 2026-07-15 |
| 5 | Status | `{{STATUS}}` | `d.status` from `invoice.status` | text | ❌ | ACTIVE |
| 6 | Billing Period | `{{BILLING_PERIOD}}` | `d.billingPeriod` from `billingPeriod.periodCode` | text | ✅ | 2026-05 |

**Service mappings** (from `invoice-template.service.ts:126-171`):
```
vars.INVOICE_TITLE  = d.invoiceTitle
vars.INVOICE_NUMBER = d.invoiceNumber
vars.ISSUE_DATE     = d.issueDate
vars.DUE_DATE       = d.dueDate || '-'
vars.STATUS         = d.status
vars.BILLING_PERIOD = d.billingPeriod
```

---

## 3. Company Fields (3 fields)

| # | Field | Variable | Source | Type | Required | Sample Value |
|---|-------|----------|--------|------|----------|-------------|
| 7 | Company Name | `{{COMPANY_NAME}}` | `d.companyName` from `project.name` | text | ✅ | شركة إباور |
| 8 | Company Logo | `{{LOGO_IMG}}` | `d.companyLogo` from `project.logo` (base64) | image | ❌ | `<img src="data:base64..."/>` |
| 9 | Company License | `{{COMPANY_LICENSE}}` | `d.companyLicense` from `project.license` | text | ❌ | ترخيص: 12345 |

**Service mappings**:
```
vars.COMPANY_NAME    = d.companyName || ''
vars.LOGO_IMG        = d.companyLogo ? `<img src="${d.companyLogo}" />` : ''
vars.LICENSE_TEXT    = d.companyLicense ? `ترخيص: ${d.companyLicense}` : ''
```

Additional derived field (rendered in template, not stored):
| Field | Variable | Source |
|-------|----------|--------|
| Signature | `{{SIGNATURE_IMG}}` | `d.companySignature` (base64) |
| Generated At | `{{GENERATED_AT}}` | `d.generatedAt` |

---

## 4. Customer Fields (6 fields)

| # | Field | Variable | Source | Type | Required | Sample Value |
|---|-------|----------|--------|------|----------|-------------|
| 10 | Customer Name | `{{CUSTOMER_NAME}}` | `d.customerName` | text | ✅ | أحمد محمد |
| 11 | Customer Code | `{{CUSTOMER_CODE}}` | `d.customerCode ?? d.customerId.substring(0,8)` | text | ✅ | CUST-001 |
| 12 | Project Name | `{{PROJECT_NAME}}` | `d.projectName` | text | ❌ | بالم هيلز |
| 13 | Area Name | `{{AREA_NAME}}` | `d.areaName ?? 'أكتوبر'` | text | ❌ | أكتوبر |
| 14 | Unit Number | `{{UNIT_NUMBER}}` | `d.unitNumber ?? '-'` | text | ❌ | B-1201 |
| 15 | Address | `{{ADDRESS}}` | `d.address ?? '-'` | text | ❌ | فيلا 22, كمبوند ... |

**Service mappings**:
```
vars.CUSTOMER_NAME  = d.customerName
vars.CUSTOMER_CODE  = d.customerCode || d.customerId?.substring(0,8) || ''
vars.PROJECT_NAME   = d.projectName || '-'
vars.AREA_NAME      = d.areaName || 'أكتوبر'
vars.UNIT_NUMBER    = d.unitNumber || '-'
vars.ADDRESS        = d.address || '-'
```

---

## 5. Meter & Reading Fields (6 fields)

| # | Field | Variable | Source | Type | Required | Sample Value |
|---|-------|----------|--------|------|----------|-------------|
| 16 | Meter Serial | `{{METER_SERIAL}}` | `d.meterSerial` from `meter.serialNumber` | text | ✅ | 12345678 |
| 17 | Meter Type | `{{METER_TYPE}}` | `d.meterType ?? d.utilityType` | text | ❌ | ELECTRICITY |
| 18 | Unit Label | `{{UNIT_LABEL}}` | `cfg.unitLabel` from `template-config.ts` | text | ✅ | ك.و.س |
| 19 | Start Reading | `{{START_READING}}` | `d.startReading?.toString() ?? '-'` (2nd latest reading) | number | ✅ | 1500.000 |
| 20 | End Reading | `{{END_READING}}` | `d.endReading?.toString() ?? '-'` (latest reading) | number | ✅ | 1650.000 |
| 21 | Consumption | `{{CONSUMPTION}}` | `d.consumption.toString()` = `endReading - startReading` | number | ✅ | 150.000 |

**Service mappings**:
```
vars.METER_SERIAL   = d.meterSerial
vars.METER_TYPE     = d.meterType || d.utilityType || ''
vars.UNIT_LABEL     = ul
vars.START_READING  = d.startReading?.toString() ?? '-'
vars.END_READING    = d.endReading?.toString() ?? '-'
vars.CONSUMPTION    = d.consumption.toString()
```

**Unit Label by template** (from `TEMPLATE_REGISTRY`):

| Template | Unit Label |
|----------|-----------|
| electricity | ك.و.س |
| water, water_new | متر مكعب |
| solar | ك.و.س |
| chilled_water | ر.ت |
| gas | متر مكعب |
| outdoor_unit | (configurable) |
| settlement | '' (empty, no meter reading) |

---

## 6. Charge Fields (7 fields)

Computed from `d.chargeLines` grouped by `chargeGroup`. The engine iterates `chargeLines` and sums amounts per group.

| # | Field | Variable | Source | Type | Required | Condition |
|---|-------|----------|--------|------|----------|-----------|
| 22 | Consumption Amount | `{{CONS_AMOUNT}}` | `chargeLines` group 0 sum | amount | ✅ | All templates |
| 23 | Admin Amount | `{{ADMIN_AMOUNT}}` | `chargeLines` group 4 sum | amount | ❌ | All except water_new |
| 24 | CS Amount | `{{CS_AMOUNT}}` | `chargeLines` groups 2,3 sum | amount | ❌ | All templates |
| 25 | Other Amount | `{{OTHER_AMOUNT}}` | `chargeLines` group 1 sum | amount | ❌ | All templates |
| 26 | Settlement Amount | `{{SETTLEMENT_AMOUNT}}` | `chargeLines` group 6 sum (abs) | amount | ❌ | All templates |
| 27 | Percentage Amount | `{{PERCENTAGE_AMOUNT}}` | `chargeLines` group 5 sum | amount | ❌ | Water only |
| 28 | Settlement Type Amount | `{{SETTLEMENT_TYPE_AMT}}` | `chargeLines` groups 12,13 sum | amount | ❌ | Settlement only |

**Mapping from code** (`invoice-template.service.ts:104-118`):
```typescript
chargeGroup 0  → CONS_AMOUNT    (consumption charges)
chargeGroup 1  → OTHER_AMOUNT   (fees, stamps)
chargeGroup 2,3 → CS_AMOUNT     (customer service)
chargeGroup 4  → ADMIN_AMOUNT   (admin/issue fees)
chargeGroup 5  → PERCENTAGE_AMOUNT (water only)
chargeGroup 6  → SETTLEMENT_AMOUNT (abs value)
chargeGroup 12,13 → SETTLEMENT_TYPE_AMT (settlement template)
```

**Charge column structure** (from `template-config.ts`):
```typescript
interface TemplateColumn {
  label: string;          // Arabic column header
  x: number;              // JRXML x position
  width: number;          // Column width in pt
  chargeGroups: number[]; // Which charge groups map here
  format: 'amount' | 'number' | 'abs-amount';
}
```

**Per-template charge columns** (7 columns each, `TEMPLATE_REGISTRY`):

```
electricity:  Discounts(-1) | Admin(4) | Settlements(6) | Fees(1) | Cons(0) | CS(2,3) | Consumption(0-num)
water:        Pool(-1)      | Admin(4) | Settlements(6)  | Fees(1) | Cons(0) | CS(2,3) | Consumption(0-num)
water_new:    Pool(-1)      | VAT(6)   | Other(7)        | Sustain(4) | Cons(0) | CS(2,3) | Consumption(0-num)
solar:        Discounts(-1) | Admin(4) | Settlements(6)  | Fees(1) | Cons(0) | CS(2,3) | Consumption(0-num)
chilled_water: Discounts(-1)| Admin(4) | Settlements(6)  | Fees(1) | Cons(0) | CS(2,3) | Consumption(0-num)
gas:          Discounts(-1) | Admin(4) | Settlements(6)  | Fees(1) | Cons(0,14) | CS(2,3) | Consumption(0-num)
settlement:   Discounts(-1) | Admin(4) | Settlements(6)  | Fees(1) | Settle(12,13) | CS(2,3) | Description
```

**Note**: Group `-1` is a special "discounts" pseudo-group — always rendered as column 0.

---

## 7. Financial Fields (10 fields)

| # | Field | Variable | Source | Type | Required |
|---|-------|----------|--------|------|----------|
| 29 | Balance Before | `{{BALANCE_BEFORE}}` | `d.balanceBefore` | amount | ✅ |
| 30 | Current Charges | `{{CURRENT_CHARGES}}` | `d.currentCharges` (sum of all charge lines) | amount | ✅ |
| 31 | Subtotal | `{{SUBTOTAL}}` | `d.subtotal` | amount | ✅ |
| 32 | Tax Amount | `{{TAX_AMOUNT}}` | `d.taxAmount` | amount | ❌ |
| 33 | Payments | `{{PAYMENTS}}` | `d.payments ?? 0` | amount | ❌ |
| 34 | Total Amount | `{{TOTAL_AMOUNT}}` | `d.totalAmount` (= subtotal + tax) | amount | ✅ |
| 35 | Balance After | `{{BALANCE_AFTER}}` | `d.balanceAfter` (= balanceBefore + total) | amount | ✅ |
| 36 | Open Amount | `{{OPEN_AMOUNT}}` | `d.totalAmount - (d.payments ?? 0)` | amount | ❌ |
| 37 | Amount in Words (AR) | `{{AMOUNT_WORDS_AR}}` | `amountInWordsAr(d.totalAmount)` from `amount-words.ts` | text | ❌ |
| 38 | Amount in Words (EN) | `{{AMOUNT_WORDS_EN}}` | `amountInWordsEn(d.totalAmount)` from `amount-words.ts` | text | ❌ |

**Service mappings**:
```
vars.BALANCE_BEFORE   = fmt(d.balanceBefore)
vars.CURRENT_CHARGES  = fmt(d.currentCharges)
vars.SUBTOTAL         = fmt(d.subtotal)
vars.TAX_AMOUNT       = fmt(d.taxAmount)
vars.PAYMENTS          = fmt(d.payments || 0)
vars.TOTAL_AMOUNT     = fmt(d.totalAmount)
vars.BALANCE_AFTER    = fmt(d.balanceAfter)
vars.OPEN_AMOUNT      = fmt(d.totalAmount - (d.payments || 0))
vars.AMOUNT_WORDS_AR  = amountInWordsAr(d.totalAmount)
```

---

## 8. Conditional Fields (8 fields)

These fields only appear for specific utility types.

| # | Field | Variable | Source | Applies To |
|---|-------|----------|--------|-----------|
| 39 | Percentage Amount | `{{PERCENTAGE_AMOUNT}}` | chargeLines group 5 | `water`, `water_new` |
| 40 | Sustain Fees | `{{SUSTAIN_FEES}}` | chargeLines group 4 (water_new mapping) | `water_new` |
| 41 | Service Fees | `{{SERVICE_FEES}}` | chargeLines group 1 (water_new mapping) | `water_new` |
| 42 | VAT Amount | `{{VAT_AMOUNT}}` | chargeLines group 6 (water_new mapping) | `water_new` |
| 43 | Settlement Type | `{{SETTLEMENT_TYPE}}` | `d.utilityType` | `settlement` |
| 44 | Description | `{{DESCRIPTION}}` | `d.chargeLines.map(l => l.chargeNameAr).join(', ')` | `settlement` |
| 45 | Settlement Credit Class | `{{SETTLEMENT_CLASS}}` | CSS class `settlement-credit` when negative | `settlement` |
| 46 | Deleted Watermark | `{{DELETED_WATERMARK}}` | Red overlay when `d.status === 'DELETED'` | All (conditional on status) |

**Conditional field logic** (`invoice-template.service.ts:126-171`):
```typescript
// Settlement-specific (settlement template only)
vars.SETTLEMENT_TYPE  = d.utilityType
vars.DESCRIPTION      = d.chargeLines.map(l => l.chargeNameAr || l.chargeName).join(', ')

// Deleted watermark (all templates)
vars.DELETED_WATERMARK = isDeleted ? '<div class="deleted-watermark">ملغيــــة</div>' : ''

// Settlement color (settlement template only)
vars.SETTLEMENT_CLASS = settlementIsCredit ? 'settlement-credit' : ''
```

---

## 9. Special/System Fields (internal, not pickable)

| Variable | Purpose | Set By |
|----------|---------|--------|
| `{{CSS_CONTENT}}` | Injected CSS from `invoice-template.css` | Backend template builder |
| `{{GENERATED_AT}}` | Generation timestamp | `d.generatedAt` |
| `{{LICENSE_TEXT}}` | Formatted license string | `d.companyLicense ? \`ترخيص: ${d.companyLicense}\` : ''` |
| `{{SIGNATURE_IMG}}` | Company signature image | `d.companySignature` |
| `{{COL0_LABEL}}` | Dynamic column 0 label from `cfg.col0Label` | Template config |

---

## 10. Field Catalog Summary

| Category | Count | Required on Publish |
|----------|-------|---------------------|
| Header | 6 | 3 (Title, Number, Issue Date) |
| Company | 3 | 1 (Company Name) |
| Customer | 6 | 2 (Name, Code) |
| Meter & Reading | 6 | 4 (Serial, Unit Label, Readings, Consumption) |
| Charge | 6+ per template | At least 1 charge column |
| Financial | 10 | 4 (Balance Before, Current Charges, Subtotal, Total Amount) |
| Conditional | 8 | 0 (utility-specific) |
| **Total Pickable** | **45** | |

---

## 11. Field Data Flow

```mermaid
flowchart LR
    subgraph "Invoice Data (InvoiceDocument)"
        ID[InvoiceDocument]
        ID --> Header[header fields]
        ID --> Company[company fields]
        ID --> Customer[customer fields]
        ID --> Meter[meter/reading fields]
        ID --> Finance[financial fields]
    end

    subgraph "Computed Fields"
        CF[Charge Processor]
        CL[chargeLines array] --> CF
        CF --> Charge[charge group amounts]
        CF --> Consumption[consumption]
    end

    subgraph "Helper Functions"
        AW[amount-words.ts]
        AW --> Ar[Arabic words]
        AW --> En[English words]
    end

    subgraph "Template Engine"
        TE[buildHtml()]
        TE --> VR[Variable Replacement]
        VR --> HTML[Final HTML]
    end

    ID --> TE
    CF --> TE
    AW --> TE
```

---

## 12. Sample Data for Preview Rendering

When the visual editor renders a live preview, it uses sample `InvoiceDocument` data:

```json
{
  "invoiceTitle": "فاتورة كهرباء",
  "invoiceNumber": "INV-2026-001234",
  "utilityType": "electricity",
  "billingPeriod": "2026-05",
  "issueDate": "2026-06-15",
  "dueDate": "2026-07-15",
  "status": "ACTIVE",
  "companyName": "شركة إباور",
  "companyLogo": "data:image/png;base64,...",
  "companyLicense": "12345",
  "customerName": "أحمد محمد",
  "customerCode": "CUST-001",
  "projectName": "بالم هيلز",
  "areaName": "أكتوبر",
  "unitNumber": "B-1201",
  "address": "فيلا 22, كمبوند بالم هيلز",
  "meterSerial": "12345678",
  "meterType": "ELECTRICITY",
  "startReading": 1500,
  "endReading": 1650,
  "consumption": 150,
  "unit": "ك.و.س",
  "balanceBefore": 500,
  "currentCharges": 750,
  "subtotal": 750,
  "taxAmount": 37.5,
  "payments": 0,
  "totalAmount": 787.5,
  "balanceAfter": 1287.5,
  "chargeLines": [
    { "chargeCode": "CONS", "chargeName": "Consumption", "chargeNameAr": "الإستهلاك", "chargeGroup": 0, "quantity": 150, "rateAmount": 5, "lineAmount": 750 },
    { "chargeCode": "CS", "chargeName": "Customer Service", "chargeNameAr": "خدمة عملاء", "chargeGroup": 2, "quantity": 1, "rateAmount": 10, "lineAmount": 10 },
    { "chargeCode": "ADMIN", "chargeName": "Admin Fees", "chargeNameAr": "إدارية", "chargeGroup": 4, "quantity": 1, "rateAmount": 5, "lineAmount": 5 }
  ],
  "generatedAt": "2026-06-15T10:30:00Z"
}
```
