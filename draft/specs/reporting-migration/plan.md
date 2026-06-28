# Reporting Engine Migration Plan

**SpecKit ID:** REP-MIG-001
**Version:** 2.0.0
**Status:** Draft
**Author:** Architecture Team
**Date:** 2026-06-27

---

## 1. Overview

### 1.1 Purpose

Migrate the Meter Verse reporting subsystem from the legacy NestJS/Puppeteer-based PDF generation to the new **Java Spring Boot + JasperReports 7.0.1 Enterprise Reporting Engine**. This migration addresses scalability limitations, Arabic/RTL rendering issues, PDF security gaps, and the lack of bulk-generation capabilities in the current system.

### 1.2 Scope

| In Scope | Out of Scope |
|----------|--------------|
| JRXML template migration (58 legacy → 60 new) | Data migration of historical reports |
| PDF generation pipeline replacement | Symbiot bridge integration |
| Excel (JXLS) report engine | Frontend reporting UI refactoring |
| Bulk generation (RabbitMQ queue) | Collection system Flask report migration |
| PDF security (encrypt, sign, watermark) | KPI dashboard consolidation |
| Template versioning (Git-based) | Legacy report archival |
| Arabic/RTL rendering overhaul | |

### 1.3 Stakeholders

| Role | Name | Responsibility |
|------|------|----------------|
| Product Owner | TBD | Requirements signoff |
| Tech Lead | TBD | Architecture decisions |
| Reporting Team | TBD | JRXML migration, engine development |
| Backend Team | TBD | API integration, service wiring |
| QA Team | TBD | Validation, performance testing |
| DevOps | TBD | Deployment, CI/CD |

---

## 2. Current State

### 2.1 Legacy NestJS Reporting (v1.0.0)

```ascii
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Frontend    │────▶│  NestJS Backend   │────▶│  Puppeteer/     │
│  (Next.js)   │     │  (InvoiceTemplate │     │  Chrome         │
│              │     │   Service)        │     │  HTML→PDF       │
└──────────────┘     └──────────────────┘     └─────────────────┘
                             │
                             ▼
                     ┌──────────────────┐
                     │  PostgreSQL DB   │
                     │  (No template    │
                     │   storage)       │
                     └──────────────────┘
```

### 2.2 Pain Points

| Issue | Impact | Severity |
|-------|--------|----------|
| HTML→PDF rendering inconsistencies | Customer-facing invoice quality | HIGH |
| No Arabic/RTL support in Puppeteer | Water/Elec invoices corrupted | CRITICAL |
| No template versioning | Lost changes, regression risk | HIGH |
| No bulk generation | Manual per-invoice generation | CRITICAL |
| No PDF security (encrypt/sign) | Regulatory non-compliance | HIGH |
| No Excel generation | Business users cannot analyze | MEDIUM |
| No caching of compiled templates | Slow generation times | MEDIUM |
| No watermark support | Draft/confidential marking | LOW |
| Single-threaded generation | Bottleneck at 10+ concurrent | HIGH |

### 2.3 Legacy Template Inventory

| Category | Count | Source |
|----------|-------|--------|
| Invoice templates (Elec + Water) | 6 | `templates/invoice/` |
| Payment receipt templates | 6 | `templates/payment/` |
| Report templates | 46 | `templates/reports/` |
| **Total JRXMLs** | **58** | |
| Shared styles | 1 | `Styles.jrxml` |
| Sub-reports | 7 | Various |

### 2.4 Legacy Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Backend | NestJS (Node.js) | 10.x |
| PDF Engine | Puppeteer (Chrome Headless) | 21.x |
| Excel Engine | None (not implemented) | — |
| Template Format | HTML + EJS | — |
| Template Storage | File system | — |
| Bulk Generation | None | — |
| PDF Security | None | — |
| Arabic Support | CSS `dir="rtl"` (broken) | — |

---

## 3. Target State

### 3.1 New JasperReports Engine (v2.0.0)

```ascii
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  Frontend    │────▶│  Spring Boot API     │────▶│  JasperReports   │
│  (Next.js)   │     │  /api/v1/reports/    │     │  7.0.1 Engine    │
└──────────────┘     └─────────────────────┘     └──────────────────┘
                            │       │                      │
                     ┌──────┘       └──────┐       ┌──────┴──────┐
                     ▼                     ▼       ▼             ▼
             ┌─────────────┐     ┌──────────────┐ ┌───┐   ┌──────────┐
             │ PostgreSQL  │     │   RabbitMQ   │ │JXLS│   │ iText 9  │
             │ 16 + Flyway │     │  Bulk Queue  │ │XLXS│   │ PDF Sec  │
             └─────────────┘     └──────────────┘ └───┘   └──────────┘
```

### 3.2 Technology Stack (Target)

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Java (Eclipse Temurin) | 21 LTS |
| Framework | Spring Boot | 3.4.1 |
| Reporting | JasperReports | 7.0.1 |
| PDF Security | iText 9 + BouncyCastle | 9.x |
| Excel | JXLS + Apache POI | 2.x / 5.x |
| Queue | RabbitMQ | 4.x |
| Database | PostgreSQL + Flyway | 16 |
| Cache | Caffeine | 3.x |
| Fonts | Custom Arabic font extension | Built-in |
| Template Storage | DB + Git versioned | Custom |

### 3.3 Target Template Inventory

| Category | Count | Notes |
|----------|-------|-------|
| Electricity Invoice | 1 | `ElectricityInvoice.jrxml` — redesigned |
| Water Invoice | 1 | New template |
| Payment Receipt | 1 | Consolidated from 6 legacy |
| Report Templates | 52 | Migrated from legacy JRXMLs |
| Shared Styles | 1 | `Styles.jrxml` — enhanced |
| Sub-reports | 4 | Consolidated from 7 |
| **Total JRXMLs** | **60** | 58 legacy + 2 new |

### 3.4 New Capabilities

| Capability | Description | Priority |
|------------|-------------|----------|
| JRXML Compilation Cache | Caffeine cache of compiled reports | P0 |
| Multi-format Export | PDF, XLSX, DOCX, HTML, CSV | P0 |
| Bulk Generation via Queue | RabbitMQ consumer with progress tracking | P0 |
| PDF Encryption | Owner/user password with permission flags | P0 |
| Digital Signatures | SHA-256 PKCS12 signing | P1 |
| Watermarking | Text/image overlay on draft/confidential | P1 |
| Excel Engine | JXLS template-based XLSX generation | P1 |
| Template Versioning | Git-based history with diff tracking | P1 |
| Arabic/RTL | ICU4J enabled, custom Arabic font | P0 |
| A4 Landscape/Portfolio | Configurable page orientation | P0 |

---

## 4. Migration Steps

### Phase 1: Foundation & Infrastructure (Week 1)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 1.1 | Set up Java 21 + Spring Boot 3.4.1 project with Maven | Reporting Team | 1d |
| 1.2 | Configure PostgreSQL 16 + Flyway migrations | Reporting Team | 1d |
| 1.3 | Set up RabbitMQ 4.x with queue definitions | DevOps | 1d |
| 1.4 | Create Docker Compose for local dev stack | DevOps | 1d |
| 1.5 | Configure Caffeine cache with TTL settings | Reporting Team | 0.5d |
| 1.6 | Set up CI/CD pipeline for Java build | DevOps | 1d |
| 1.7 | Create project module structure (DDD modules) | Tech Lead | 1d |
| **Total** | | | **6.5d** |

### Phase 2: Database Schema Design (Week 1-2)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 2.1 | Design and create Flyway V1: `reports` table | DBA | 0.5d |
| 2.2 | Create Flyway V2: `report_templates` table with BLOB | DBA | 0.5d |
| 2.3 | Create Flyway V3: `bulk_generation_jobs` table | DBA | 0.5d |
| 2.4 | Create Flyway V4: `generated_documents` table | DBA | 0.5d |
| 2.5 | Create Flyway V5: `pdf_security_log` table | DBA | 0.5d |
| 2.6 | Create Flyway V6: Indexes + constraints | DBA | 0.5d |
| 2.7 | Create JPA entities + repositories | Reporting Team | 1d |
| **Total** | | | **4d** |

### Phase 3: Report Compiler Module (Week 2)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 3.1 | Implement `ReportCompiler` service with Caffeine cache | Reporting Team | 1d |
| 3.2 | Implement JRXML loading from DB + file system | Reporting Team | 1d |
| 3.3 | Implement `.jasper` binary compilation | Reporting Team | 0.5d |
| 3.4 | Implement sub-report resolution | Reporting Team | 0.5d |
| 3.5 | Add compilation error handling with descriptive messages | Reporting Team | 0.5d |
| 3.6 | Unit tests for compiler service | QA | 1d |
| **Total** | | | **4.5d** |

### Phase 4: Report Filler Module (Week 2-3)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 4.1 | Implement `ReportFiller` with parameter injection | Reporting Team | 1d |
| 4.2 | Implement datasource integration (JDBC + Collection) | Reporting Team | 1d |
| 4.3 | Implement locale/RTL parameter handling | Reporting Team | 0.5d |
| 4.4 | Implement sub-report data passing | Reporting Team | 0.5d |
| 4.5 | Add fill-time validation and error handling | Reporting Team | 0.5d |
| 4.6 | Unit tests for filler service | QA | 1d |
| **Total** | | | **4.5d** |

### Phase 5: Report Exporter Module (Week 3)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 5.1 | Implement PDF exporter with JasperReports library | Reporting Team | 1d |
| 5.2 | Implement XLSX exporter with Apache POI | Reporting Team | 1d |
| 5.3 | Implement DOCX exporter | Reporting Team | 0.5d |
| 5.4 | Implement HTML exporter (inline + attachment) | Reporting Team | 0.5d |
| 5.5 | Implement CSV exporter | Reporting Team | 0.5d |
| 5.6 | Add content negotiation (Accept header) | Reporting Team | 0.5d |
| 5.7 | Unit tests for all exporters | QA | 1d |
| **Total** | | | **4.5d** |

### Phase 6: PDF Security Module (Week 3-4)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 6.1 | Implement `PdfSecurityService` with iText 9 | Reporting Team | 1d |
| 6.2 | Implement PDF encryption (owner/user password) | Reporting Team | 0.5d |
| 6.3 | Implement digital signatures (PKCS12 + SHA-256) | Reporting Team | 1d |
| 6.4 | Implement watermarking (text + image overlay) | Reporting Team | 0.5d |
| 6.5 | Implement PDF/A compliance for archival | Reporting Team | 0.5d |
| 6.6 | Security audit logging for all operations | Reporting Team | 0.5d |
| 6.7 | Unit + integration tests | QA | 1d |
| **Total** | | | **5d** |

### Phase 7: Excel Engine Module (Week 4)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 7.1 | Implement JXLS template engine | Reporting Team | 1d |
| 7.2 | Implement XLSX export with formulas | Reporting Team | 0.5d |
| 7.3 | Implement XLSX export with styling | Reporting Team | 0.5d |
| 7.4 | Implement large-dataset streaming (SXSSF) | Reporting Team | 1d |
| 7.5 | Implement Excel template CRUD API | Reporting Team | 0.5d |
| 7.6 | Unit tests for Excel engine | QA | 1d |
| **Total** | | | **4.5d** |

### Phase 8: Bulk Generation Module (Week 4-5)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 8.1 | Implement RabbitMQ queue + exchange setup | Reporting Team | 0.5d |
| 8.2 | Implement `BulkGenerationService` | Reporting Team | 1d |
| 8.3 | Implement `BulkConsumer` with concurrent processing | Reporting Team | 1d |
| 8.4 | Implement progress tracking (redis/caffeine) | Reporting Team | 0.5d |
| 8.5 | Implement job status API endpoints | Reporting Team | 0.5d |
| 8.6 | Error handling + retry with dead-letter queue | Reporting Team | 0.5d |
| 8.7 | Integration tests | QA | 1d |
| **Total** | | | **5d** |

### Phase 9: Template Manager (Week 5)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 9.1 | Implement `TemplateService` CRUD | Reporting Team | 1d |
| 9.2 | Implement Git-based versioning (commit on save) | Reporting Team | 1d |
| 9.3 | Implement template diff API | Reporting Team | 0.5d |
| 9.4 | Implement template rollback | Reporting Team | 0.5d |
| 9.5 | Implement template validation on upload | Reporting Team | 0.5d |
| 9.6 | Unit tests | QA | 1d |
| **Total** | | | **4.5d** |

### Phase 10: REST API Layer (Week 5-6)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 10.1 | Implement `ReportController` — generate, export, status | Reporting Team | 1d |
| 10.2 | Implement `TemplateController` — CRUD, version, diff | Reporting Team | 0.5d |
| 10.3 | Implement `BulkController` — create job, status, cancel | Reporting Team | 0.5d |
| 10.4 | Implement `SecurityController` — protect, sign, watermark | Reporting Team | 0.5d |
| 10.5 | Implement `ExcelController` — generate, templates | Reporting Team | 0.5d |
| 10.6 | SpringDoc OpenAPI documentation | Reporting Team | 0.5d |
| 10.7 | Integration tests | QA | 1d |
| **Total** | | | **4.5d** |

### Phase 11: Arabic/RTL Rendering (Week 6)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 11.1 | Configure ICU4J for Arabic bidirectional text | Reporting Team | 1d |
| 11.2 | Build custom Arabic font extension JAR | Reporting Team | 1d |
| 11.3 | Configure JasperReportsContext for RTL | Reporting Team | 0.5d |
| 11.4 | Update all JRXMLs with RTL-aware styles | Reporting Team | 2d |
| 11.5 | Test Arabic rendering across all templates | QA | 1d |
| 11.6 | Fix identified RTL rendering issues | Reporting Team | 1d |
| **Total** | | | **6.5d** |

### Phase 12: JRXML Migration — Legacy Templates (Week 6-7)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 12.1 | Migrate shared styles (Styles.jrxml) | Reporting Team | 0.5d |
| 12.2 | Migrate invoice templates (6 → 2) | Reporting Team | 2d |
| 12.3 | Migrate payment templates (6 → 2) | Reporting Team | 1d |
| 12.4 | Migrate report templates (46) by category | Reporting Team | 5d |
| 12.5 | Consolidate sub-reports (7 → 4) | Reporting Team | 1d |
| 12.6 | Validate each migrated JRXML compiles | QA | 2d |
| **Total** | | | **11.5d** |

### Phase 13: JRXML Migration — New Templates (Week 7-8)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 13.1 | Design new ElectricityInvoice.jrxml | Designer | 2d |
| 13.2 | Design new WaterInvoice.jrxml | Designer | 1d |
| 13.3 | Implement A4 Landscape invoice layout | Reporting Team | 1d |
| 13.4 | Implement A4 Portfolio (Portrait) invoice layout | Reporting Team | 1d |
| 13.5 | Implement dynamic orientation switching | Reporting Team | 0.5d |
| 13.6 | Validate new templates compile + render | QA | 1d |
| **Total** | | | **6.5d** |

### Phase 14: Font Extension & Rendering (Week 8)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 14.1 | Build JasperReports font extension JAR | Reporting Team | 1d |
| 14.2 | Configure `fonts.xml` with Arabic glyphs | Reporting Team | 0.5d |
| 14.3 | Test Arabic glyph rendering in all exports | QA | 1d |
| 14.4 | Fix any missing glyph/hinting issues | Reporting Team | 1d |
| **Total** | | | **3.5d** |

### Phase 15: Integration with Backend API (Week 8-9)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 15.1 | Add API Gateway route for `/api/v1/reports/*` | Backend Team | 0.5d |
| 15.2 | Update NestJS to proxy report requests to Spring Boot | Backend Team | 0.5d |
| 15.3 | Update Frontend API client to use new endpoints | Frontend Team | 1d |
| 15.4 | Wire download buttons to new report engine | Frontend Team | 1d |
| 15.5 | Update bulk generation UI (progress, status) | Frontend Team | 1d |
| 15.6 | End-to-end integration tests | QA | 2d |
| **Total** | | | **6d** |

### Phase 16: Testing & Validation (Week 9-10)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 16.1 | Functionality testing (all 60 JRXMLs) | QA | 3d |
| 16.2 | PDF generation validation (sample invoice) | QA | 1d |
| 16.3 | Excel generation validation | QA | 1d |
| 16.4 | Playwright visual regression tests | QA | 2d |
| 16.5 | Arabic RTL rendering validation | QA | 1d |
| 16.6 | A4 Landscape/Portfolio validation | QA | 0.5d |
| 16.7 | Performance benchmarks (100 concurrent, 1000/min) | QA | 1d |
| 16.8 | Template versioning validation | QA | 0.5d |
| 16.9 | PDF security feature validation | QA | 0.5d |
| 16.10 | Bulk generation validation (10, 100, 1000, 10000) | QA | 1d |
| 16.11 | Regression test suite | QA | 2d |
| **Total** | | | **13.5d** |

### Phase 17: Deployment & Cutover (Week 10)

| Task | Description | Owner | Duration |
|------|-------------|-------|----------|
| 17.1 | Create production deployment runbook | DevOps | 1d |
| 17.2 | Deploy reporting engine to staging | DevOps | 0.5d |
| 17.3 | Run smoke tests on staging | QA | 0.5d |
| 17.4 | Deploy reporting engine to production | DevOps | 0.5d |
| 17.5 | Run smoke tests on production | QA | 0.5d |
| 17.6 | Monitor for 24h post-deployment | On-Call | 1d |
| 17.7 | Document lessons learned | All | 0.5d |
| **Total** | | | **4.5d** |

### Migration Timeline Summary

```
Week 1   ████████████████  Phases 1-2 (Foundation + DB)
Week 2   ████████████████  Phases 3-4 (Compiler + Filler)
Week 3   ████████████████  Phases 5-6 (Export + Security)
Week 4   ████████████████  Phases 7-8 (Excel + Bulk)
Week 5   ████████████████  Phases 9-10 (Template + API)
Week 6   ████████████████  Phases 11-12 (RTL + Legacy JRXML)
Week 7   ████████████████  Phases 12-13 (JRXML Migration)
Week 8   ████████████████  Phases 14-15 (Fonts + Integration)
Week 9   ████████████████  Phase 16 (Testing)
Week 10  ████████████████  Phase 17 (Deployment)
```

**Total estimated duration: 10 weeks**

---

## 5. Risk Analysis

### 5.1 Risk Matrix

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| R1 | Arabic/RTL rendering differs between dev and prod | Medium | High | Use identical font files in both environments; test on target OS |
| R2 | JRXML compilation fails on Java 21 | Low | High | Test compile on CI with Java 21 from day 1 |
| R3 | RabbiteMQ queue backlog during bulk generation | Medium | Medium | Implement rate-limiting; monitor queue depth; auto-scale consumers |
| R4 | PDF encryption conflicts with iText 9 licensing | Low | High | Verify AGPL compliance; purchase commercial license if needed |
| R5 | Template migration loses visual fidelity | Medium | High | Pixel-perfect comparison; side-by-side review |
| R6 | Performance regression vs NestJS HTML→PDF | Low | Medium | Benchmark before cutover; cache compiled reports |
| R7 | Database migration conflicts with backend schema | Low | High | Use separate database / schema; coordinate with DBA |
| R8 | Font extension JAR not found at runtime | Low | Medium | Verify classpath in Docker; test in CI build |
| R9 | Spring Boot version conflicts with existing infra | Low | Medium | Use compatible Spring Boot version; isolate in Docker |
| R10 | Team lacks Java/JasperReports expertise | High | High | Training sprint; pair programming; external consultant |

### 5.2 Risk Response Plan

| Trigger | Response | Owner |
|---------|----------|-------|
| Any P0 risk materializes | Halt migration, rollback | Tech Lead |
| RTL rendering > 2 days over schedule | Escalate to parallel Arabic font specialist | PM |
| Performance benchmark fails | Optimize caching; increase resources | Reporting Team |
| Build failures > 24h | Rollback to last known good commit | DevOps |
| Security audit fails | Fix findings before proceeding | Security Team |

---

## 6. Rollback Strategy

### 6.1 Pre-Cutover State

Before cutover, the legacy NestJS system remains fully operational. A feature flag `reporting-engine-v2` controls which engine serves requests.

### 6.2 Rollback Triggers

| # | Condition | Action |
|---|-----------|--------|
| 1 | Any critical report type fails to generate | Flip feature flag to `false` |
| 2 | PDF quality below acceptable threshold | Stop traffic, restore old templates |
| 3 | >1% error rate on report generation | Rollback API gateway routing |
| 4 | Performance <50% of legacy system | Scale up, investigate, rollback if needed |
| 5 | Security vulnerability found | Rollback immediately, patch offline |

### 6.3 Rollback Procedure

1. **Feature Flag**: Set `reporting-engine-v2=false` in configuration
2. **API Gateway**: Revert routing to NestJS `/api/v1/reports/*`
3. **Database**: Run `flyway undo` on reporting engine migrations (if any)
4. **Docker**: Restart NestJS backend with previous image tag
5. **Verification**: Run smoke test suite on legacy system
6. **Communication**: Notify stakeholders of rollback via email + Slack

See `draft/reports/ROLLBACK_PLAN.md` for detailed phase-by-phase rollback procedures.

---

## 7. Validation Criteria

| ID | Criterion | Method | Target |
|----|-----------|--------|--------|
| V1 | All 60 JRXMLs compile successfully | `mvn compile` | 0 errors |
| V2 | ElectricityInvoice.jrxml renders correctly | PDF comparison | Pixel-perfect |
| V3 | All 58 legacy JRXMLs produce identical output | Side-by-side diff | >=95% match |
| V4 | Bulk generation: 1000 invoices < 5 minutes | Timer | ≤5 min |
| V5 | Concurrent requests: 100 simultaneous < 30s P99 | Load test | ≤30s |
| V6 | Arabic text renders correctly in PDF | Visual inspection | No reversed/ broken glyphs |
| V7 | PDF encryption prevents unauthorized opening | Manual test | Password required |
| V8 | Digital signature verifies in Adobe Acrobat | Manual test | Valid signature |
| V9 | A4 Landscape and Portfolio both render correctly | Visual inspection | Correct orientation |
| V10 | Excel export opens without errors in MS Excel | Manual test | No corruption |
| V11 | Template versioning stores + retrieves history | API test | History preserved |
| V12 | Export rate: ≥1000 reports per minute | Load test | ≥1000/min |

---

## 8. Timeline

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| M1: Foundation Complete | Week 1 | Spring Boot project, Docker, CI/CD |
| M2: Core Engine Complete | Week 3 | Compiler + Filler + Export working |
| M3: Security + Excel Complete | Week 4 | PDF security + Excel generation |
| M4: Bulk Generation Complete | Week 5 | RabbitMQ consumer working |
| M5: API Layer Complete | Week 6 | All REST endpoints functional |
| M6: JRXML Migration Complete | Week 8 | All 60 templates migrated |
| M7: Integration Complete | Week 9 | Full stack end-to-end |
| M8: Testing Complete | Week 10 | All validation criteria met |
| M9: Production Deployment | Week 10 | Live in production |
| M10: Post-Deployment Review | Week 11 | Lessons learned documented |

---

## 9. Resource Requirements

### 9.1 Personnel

| Role | FTE | Duration | Skills Required |
|------|-----|----------|-----------------|
| Tech Lead | 1 | 10 weeks | Java, Spring Boot, JasperReports |
| Reporting Developer | 2 | 10 weeks | JasperReports, JRXML, iText |
| Backend Developer | 1 | 4 weeks | NestJS, API integration |
| Frontend Developer | 1 | 3 weeks | Next.js, React |
| QA Engineer | 1 | 6 weeks | Automation, Playwright |
| DevOps Engineer | 0.5 | 4 weeks | Docker, CI/CD, RabbitMQ |
| **Total** | **6.5** | — | — |

### 9.2 Infrastructure

| Resource | Specification | Quantity |
|----------|--------------|----------|
| Build Server | 4 vCPU, 8GB RAM | 1 |
| Staging Server | 4 vCPU, 8GB RAM | 1 |
| Production Server | 8 vCPU, 16GB RAM | 2 (HA) |
| PostgreSQL | 16, managed | 1 instance |
| RabbitMQ | 4.x, mirrored queues | 1 cluster |
| Docker Registry | Private registry | 1 |

### 9.3 Software Licenses

| Software | License Type | Cost |
|----------|-------------|------|
| iText 9 (PDF security) | Commercial | TBD |
| JasperReports Library | LGPL | Free |
| Eclipse Temurin JDK 21 | GPL v2 | Free |
| IntelliJ IDEA | Commercial | Already licensed |
| Jaspersoft Studio | EPL | Free |

### 9.4 Training

| Topic | Audience | Duration |
|-------|----------|----------|
| JasperReports fundamentals | Reporting Team | 3 days |
| iText PDF security | Reporting Team | 1 day |
| Jaspersoft Studio Designer | Reporting Team + Designers | 2 days |
| Spring Boot for NestJS devs | Backend Team | 2 days |

---

## 10. Appendices

### A. Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `spring-boot-starter-web` | 3.4.1 | REST API |
| `spring-boot-starter-data-jpa` | 3.4.1 | ORM |
| `flyway-core` | 10.x | DB migrations |
| `jasperreports` | 7.0.1 | Report engine |
| `jasperreports-functions` | 7.0.1 | Report functions |
| `itext-core` | 9.x | PDF security |
| `bouncycastle-provider` | 1.78 | Crypto |
| `jxls-poi` | 2.x | Excel |
| `apache-poi` | 5.x | Excel |
| `apache-poi-ooxml` | 5.x | XLSX |
| `spring-boot-starter-amqp` | 3.4.1 | RabbitMQ |
| `caffeine` | 3.x | Cache |
| `springdoc-openapi` | 2.6.x | API docs |
| `icu4j` | 75.x | Unicode/Bidi |

### B. Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5433/reporting` | Database connection |
| `DB_USER` | `reporting` | Database user |
| `DB_PASSWORD` | `changeit` | Database password |
| `RABBITMQ_HOST` | `localhost` | RabbitMQ host |
| `RABBITMQ_PORT` | `5672` | RabbitMQ port |
| `RABBITMQ_USER` | `guest` | RabbitMQ username |
| `RABBITMQ_PASSWORD` | `guest` | RabbitMQ password |
| `PDF_OWNER_PASSWORD` | `changeit` | PDF owner password |
| `PDF_KEYSTORE_PASSWORD` | `changeit` | PKCS12 keystore password |
| `CACHE_TTL_MINUTES` | `60` | Compiled report cache TTL |
| `BULK_CONSUMER_COUNT` | `5` | Parallel bulk consumers |
| `BULK_QUEUE_MAX` | `10000` | Max queue size |

### C. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/reports/generate` | Generate single report |
| GET | `/api/v1/reports/export/{id}` | Download generated report |
| POST | `/api/v1/reports/bulk` | Create bulk generation job |
| GET | `/api/v1/reports/bulk/{id}/status` | Get bulk job status |
| DELETE | `/api/v1/reports/bulk/{id}` | Cancel bulk job |
| POST | `/api/v1/reports/security/protect` | Encrypt PDF |
| POST | `/api/v1/reports/security/sign` | Sign PDF |
| POST | `/api/v1/reports/security/watermark` | Watermark PDF |
| POST | `/api/v1/reports/excel/generate` | Generate Excel report |
| GET | `/api/v1/reports/templates` | List templates |
| POST | `/api/v1/reports/templates` | Upload template |
| PUT | `/api/v1/reports/templates/{id}` | Update template |
| GET | `/api/v1/reports/templates/{id}/versions` | List versions |
| POST | `/api/v1/reports/templates/{id}/rollback/{version}` | Rollback template |

---

*End of Migration Plan*
