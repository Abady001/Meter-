# Meter Verse — Reporting Domain Knowledge

## Overview

Meter Verse has two reporting engines:

1. **Legacy NestJS/Puppeteer engine** (ACTIVE): `backend/src/invoices/` + `backend/src/reports/` — generates PDF invoices and reports on-the-fly via Puppeteer (Chrome headless) with pdfkit fallback
2. **New Java/Spring/JasperReports engine** (GENERATED, NOT DEPLOYED): `reporting-engine/` — 68 Java files across 6 modules, built as a standalone service with REST API

---

## Legacy Engine (ACTIVE)

### Invoice PDF Generation
- **InvoiceRendererService** (`backend/src/invoices/invoice-renderer.service.ts`): HTML → PDF using Puppeteer
- Chrome executable: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- PDF options: A4, landscape, 5mm margins
- Auto-fallback to pdfkit if Puppeteer unavailable
- Batch PDF generation via `renderBatchPdf()` using `archiver` zip library

### Report Service
- **ReportsService** (`backend/src/reports/reports.service.ts`): CRUD for `ReportJob` and `ReportTemplate` models
- **ReportGenerationService** (`backend/src/reports/report-generation.service.ts`): Async report generation
- Formats: PDF, Excel, CSV
- Job status tracking: pending → running → completed/failed

### Templates

**JRXML Templates (58 files, legacy — NOT actively used)**
Location: `backend/src/invoices/assets/draft/`
These are JasperReports XML templates ported from sBill. They define invoice layouts with:
- Company header (logo, name, license)
- Customer info block
- Meter/reading details
- Consumption tier table
- Charge group breakdown
- Tax summary
- Payment QR code

**HTML Templates (3 files, ACTIVE)**
Location: `backend/src/invoices/`

| Template | Usage | Features |
|----------|-------|----------|
| `invoice-template.html` | Standard utility invoices | RTL Arabic, company header, charge lines grouped by charge group, VAT, due date, QR code placeholder |
| `invoice-solar-template.html` | Solar net-metering invoices | Import/export/generation display, wallet balance, solar credit carry-forward |
| `invoice-settlement-template.html` | Settlement/credit notes | Credit/debit display, reference to original invoice |
| `invoice-template.css` | Shared styles | A4 layout, table borders, color-coded charge groups, Arabic font stack |

---

## New Reporting Engine (GENERATED — NOT DEPLOYED)

### Technology Stack
- Java 17+ with Spring Boot 3.x
- JasperReports Library 6.x
- Maven build with `pom.xml`
- Docker deployment via Dockerfile

### Structure (6 modules, 68 Java files)
```
reporting-engine/
├── src/main/java/.../
│   ├── controller/    — REST API endpoints
│   ├── service/       — Report generation logic
│   ├── repository/    — Data access
│   ├── model/         — Report data models
│   ├── config/        — Spring configuration
│   └── dto/           — Data transfer objects
├── jasperreports-fonts-extension/  — Custom fonts (Arabic support)
├── compiled/          — Pre-compiled report binaries
├── Dockerfile         — Multi-stage build
├── docker-compose.yml — Service definition
├── pom.xml            — Maven dependencies
├── PRODUCTION_READINESS.md  — Pre-deployment checklist
└── INSTALLATION.md    — Setup instructions
```

### Current Status
- **GENERATED**: All 68 Java files exist, project compiles, Docker image builds
- **NOT DEPLOYED**: No running instance. The legacy engine remains active.
- **Deployment blocker**: Needs database connection config, environment variables, and integration testing

---

## Report Types

| Category | Report | Engine | Status |
|----------|--------|--------|--------|
| **Invoices** | Standard utility invoice | Legacy (Puppeteer) | ACTIVE |
| | Solar invoice | Legacy (Puppeteer) | ACTIVE |
| | Settlement/credit note | Legacy (Puppeteer) | ACTIVE |
| | Batch invoice PDF (ZIP) | Legacy (Puppeteer) | ACTIVE |
| **Payments** | Payment receipt | Legacy (pdfkit) | ACTIVE |
| | Payment allocation summary | Legacy | ACTIVE |
| **Statements** | Customer statement | DB view + legacy | ACTIVE |
| **Collections** | Collection report | Legacy | PARTIAL |
| | Aging report | Legacy | PARTIAL |
| **Meters** | Meter master list | Legacy | ACTIVE |
| | Meter activation report | Legacy | ACTIVE |
| **Consumption** | Consumption summary | Legacy | ACTIVE |
| | Consumption by area/zone | Legacy | PARTIAL |
| **Financial** | Revenue summary | Legacy | PARTIAL |
| | Settlement report | Legacy | ACTIVE |
| | Tax summary | Legacy | PARTIAL |
| **Operations** | Sync status report | Legacy | PARTIAL |
| | Audit trail report | Legacy | PARTIAL |

---

## Report Job Model

```typescript
// sim_system.report_jobs
{
  id: string;               // UUID
  reportType: string;       // e.g. 'invoice', 'consumption', 'revenue'
  status: ReportJobStatus;  // pending | running | completed | failed
  format: ReportFormat;     // pdf | excel | csv
  filters?: Json;           // Query filters
  fileUrl?: string;         // Path to generated file
  requestedBy: string;      // Who requested
  errorMessage?: string;    // Error if failed
  createdAt: DateTime;
  startedAt?: DateTime;
  completedAt?: DateTime;
}
```

## Report Definition Model (features schema)

```typescript
// features.report_definitions
{
  id: string;
  reportCode: string;       // UNIQUE
  reportName: string;       // Display name
  reportCategory: string;   // Grouping category
  description?: string;
  parameters?: Json;        // Parameter schema
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
}
```

## Report Export Model (features schema)

```typescript
// features.report_exports
{
  id: string;
  reportDefId: string;      // FK to ReportDefinition
  format: string;           // pdf, excel, csv
  filters?: Json;
  fileUrl?: string;
  fileSize?: number;
  status: string;           // pending | completed | failed
  errorMessage?: string;
  requestedBy: string;
  requestedAt: DateTime;
  completedAt?: DateTime;
  expiresAt?: DateTime;     // Auto-expiry
}
```

---

## Source Files

| File | Purpose |
|------|---------|
| `backend/src/invoices/invoice-renderer.service.ts` | Puppeteer/pdfkit PDF generation |
| `backend/src/invoices/invoice-template.html` | Standard invoice HTML |
| `backend/src/invoices/invoice-solar-template.html` | Solar invoice HTML |
| `backend/src/invoices/invoice-settlement-template.html` | Settlement document HTML |
| `backend/src/invoices/invoice-template.css` | Shared invoice styles |
| `backend/src/invoices/assets/draft/` | 58 JRXML templates (legacy, unused) |
| `backend/src/reports/reports.service.ts` | Report CRUD |
| `backend/src/reports/report-generation.service.ts` | Async report generation |
| `backend/src/reports/reports.controller.ts` | Report API endpoints |
| `backend/src/payments/payment-receipt.service.ts` | Payment receipt generation |
| `backend/src/invoices/template-config.ts` | Template configuration |
| `reporting-engine/` | New Java/Spring/JasperReports engine (68 files, NOT DEPLOYED) |
