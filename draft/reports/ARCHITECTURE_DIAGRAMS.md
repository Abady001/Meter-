# Meter Verse — Architecture Diagrams

**Version:** 2.0.0
**Date:** 2026-06-27
**Author:** Architecture Team

---

## Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Module Dependency Graph](#2-module-dependency-graph)
3. [Report Pipeline Flow](#3-report-pipeline-flow)
4. [Invoice Pipeline Flow](#4-invoice-pipeline-flow)
5. [Billing Calculation Flow](#5-billing-calculation-flow)
6. [Bulk Generation Flow](#6-bulk-generation-flow)
7. [Excel Engine Flow](#7-excel-engine-flow)
8. [PDF Security Flow](#8-pdf-security-flow)
9. [Deployment Flow](#9-deployment-flow)
10. [Database Relationship Diagram](#10-database-relationship-diagram)

---

## 1. Project Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        FE[Next.js Frontend<br/>Port 3000]
        ADMIN[Admin Portal<br/>Port 6262]
    end

    subgraph "API Gateway"
        GW[API Gateway<br/>NestJS Gateway]
    end

    subgraph "Backend Layer - NestJS"
        AUTH[Auth Module<br/>JWT + RBAC]
        BILL[Billing Module<br/>Invoice Generation]
        CUST[Customer Module<br/>CRUD]
        METER[Meter Module<br/>Lifecycle]
        READ[Reading Module<br/>Validation]
        SYNC[Sync Module<br/>Orchestrator]
    end

    subgraph "Reporting Layer - Spring Boot"
        COMP[Report Compiler<br/>Caffeine Cache]
        FILL[Report Filler<br/>Parameter Injection]
        EXP[Report Exporter<br/>PDF / XLSX / DOCX]
        SEC[PDF Security<br/>iText 9]
        EXCEL[Excel Engine<br/>JXLS + POI]
        BULK[Bulk Generator<br/>RabbitMQ]
        TEMPL[Template Manager<br/>Git Versioned]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL 16<br/>Multi-Schema)]
        RMQ[RabbitMQ 4.x<br/>Bulk Queue]
    end

    subgraph "External Systems"
        SYMBIOT[Symbiot<br/>Meter Data]
        SBILL[SBill<br/>Billing Legacy]
    end

    FE --> GW
    ADMIN --> GW
    GW --> AUTH
    GW --> BILL
    GW --> CUST
    GW --> METER
    GW --> READ
    GW --> SYNC
    GW --> COMP

    COMP --> FILL
    FILL --> EXP
    EXP --> SEC
    EXP --> EXCEL

    TEMPL --> COMP
    BULK --> RMQ
    BULK --> EXP

    BILL --> PG
    CUST --> PG
    METER --> PG
    READ --> PG
    SYNC --> PG
    COMP --> PG
    TEMPL --> PG

    SYNC --> SYMBIOT
    SYNC --> SBILL
```

---

## 2. Module Dependency Graph

```mermaid
graph LR
    subgraph "NestJS Backend Modules"
        APP[AppModule]
        AUTH[AuthModule]
        AUDIT[AuditModule]
        BILL[BillingModule]
        CUST[CustomerModule]
        METER[MeterModule]
        READ[ReadingModule]
        PROJ[ProjectModule]
        PAY[PaymentModule]
        SYNC[SyncModule]
        REPORT[ReportModule]
        SETT[SettingsModule]
        WALL[WalletModule]
        KPI[KPIModule]
        SEARCH[SearchModule]
        UPLOAD[UploadModule]
    end

    subgraph "Shared Modules"
        COMMON[CommonModule]
        DB[DatabaseModule]
        IDEM[IdempotencyModule]
    end

    subgraph "Reporting Engine (Spring Boot)"
        REP_COMP[ReportCompiler]
        REP_FILL[ReportFiller]
        REP_EXP[ReportExporter]
        REP_SEC[PdfSecurityService]
        REP_EXCEL[ExcelEngine]
        REP_BULK[BulkGenerationService]
        REP_TMPL[TemplateService]
        REP_CTRL[ReportController]
        REP_BLK_CTRL[BulkController]
        REP_SEC_CTRL[SecurityController]
    end

    APP --> AUTH
    APP --> AUDIT
    APP --> BILL
    APP --> CUST
    APP --> METER
    APP --> READ
    APP --> PROJ
    APP --> PAY
    APP --> SYNC
    APP --> REPORT
    APP --> SETT
    APP --> WALL
    APP --> KPI
    APP --> SEARCH
    APP --> UPLOAD
    APP --> COMMON

    BILL --> AUTH
    BILL --> AUDIT
    CUST --> AUTH
    METER --> AUTH
    READ --> AUTH
    PAY --> AUTH
    PAY --> BILL
    SYNC --> METER
    SYNC --> READ

    AUTH --> DB
    AUDIT --> DB
    BILL --> DB
    CUST --> DB
    METER --> DB
    READ --> DB
    PAY --> DB

    REPORT --> COMMON
    REPORT --> AUTH

    REP_CTRL --> REP_COMP
    REP_CTRL --> REP_FILL
    REP_CTRL --> REP_EXP
    REP_BLK_CTRL --> REP_BULK
    REP_SEC_CTRL --> REP_SEC
    REP_EXCEL --> REP_TMPL
    REP_BULK --> REP_EXP
    REP_COMP --> REP_TMPL
    REP_FILL --> REP_COMP
```

---

## 3. Report Pipeline Flow

```mermaid
sequenceDiagram
    participant Client as Frontend / API Client
    participant Ctrl as ReportController
    participant Comp as ReportCompiler
    participant Fill as ReportFiller
    participant Exp as ReportExporter
    participant Cache as Caffeine Cache
    participant DB as PostgreSQL
    participant FS as File System

    Client->>+Ctrl: POST /api/v1/reports/generate<br/>{templateId, params, format}
    Ctrl->>+Comp: compileReport(templateId)

    Comp->>+DB: load JRXML content
    DB-->>-Comp: JRXML bytes

    Comp->>+Cache: get(templateId)
    alt Cache Hit
        Cache-->>Comp: Cached JasperReport
    else Cache Miss
        Comp->>Comp: JasperCompileManager.compile()
        Comp->>-Cache: put(templateId, compiled)
        Cache-->>Comp: JasperReport
    end
    Comp-->>-Ctrl: JasperReport object

    Ctrl->>+Fill: fillReport(report, params)
    Fill->>Fill: setReportParameters(params)
    Fill->>Fill: setLocale(locale)
    Fill->>Fill: applyRTLConfig()
    Fill->>+DB: execute query datasource
    DB-->>-Fill: ResultSet data
    Fill->>Fill: JasperFillManager.fill()
    Fill-->>-Ctrl: JasperPrint object

    Ctrl->>+Exp: exportReport(print, format)
    alt PDF
        Exp->>Exp: JasperExportManager.exportToPdf()
    else XLSX
        Exp->>Exp: JRXlsxExporter.export()
    else DOCX
        Exp->>Exp: JRRtfExporter.export()
    else HTML
        Exp->>Exp: JRHtmlExporter.export()
    else CSV
        Exp->>Exp: JRCsvExporter.export()
    end
    Exp-->>-Ctrl: byte[] output

    Ctrl->>Ctrl: store document record in DB
    Ctrl-->>-Client: { documentId, format, size, url }
```

---

## 4. Invoice Pipeline Flow

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant GW as API Gateway
    participant BILL as BillingModule
    participant ENG as BillingEngine
    participant INV as InvoiceService
    participant REP as ReportEngine
    participant SEC as PdfSecurityService
    participant FS as File Storage

    UI->>+GW: Generate Invoice (customerId, period)
    GW->>+BILL: POST /api/v1/billing/invoices/generate
    BILL->>+ENG: calculate(customerId, period)

    ENG->>ENG: load meter readings
    ENG->>ENG: apply tariff rates
    ENG->>ENG: calculate TOU charges
    ENG->>ENG: compute taxes & fees
    ENG->>ENG: apply adjustments

    ENG-->>-BILL: InvoiceData DTO
    BILL->>+INV: createInvoice(data)
    INV->>INV: build line items
    INV->>INV: calculate totals
    INV->>INV: generate invoice number
    INV-->>-BILL: Invoice entity

    BILL->>+REP: generateInvoicePDF(invoiceId)
    REP->>REP: compile ElectricityInvoice.jrxml
    REP->>REP: fill with invoice data
    REP->>REP: export to PDF
    REP-->>-BILL: PDF bytes

    BILL->>+SEC: protect(pdfBytes)
    SEC->>SEC: AES-256 encrypt
    SEC->>SEC: set owner password
    SEC->>SEC: set permissions (COPY, PRINT)
    SEC-->>-BILL: Secured PDF bytes

    BILL-->>-GW: { invoiceId, pdfUrl, status }
    GW-->>-UI: Response
```

---

## 5. Billing Calculation Flow

```mermaid
flowchart TD
    START([Start Billing Cycle]) --> LOAD_METERS[Load Active Meters<br/>for Area]
    LOAD_METERS --> LOAD_READINGS[Load Latest Readings<br/>per Meter]
    LOAD_READINGS --> CALC_CONSUMPTION[Calculate Consumption<br/>Current - Previous Reading]

    CALC_CONSUMPTION --> CHECK_TOU{TOU Tariff?}
    CHECK_TOU -->|Yes| TOU_CALC[Apply Time-of-Use Rates<br/>Peak / Off-Peak / Shoulder]
    CHECK_TOU -->|No| FLAT_CALC[Apply Flat Rate]

    TOU_CALC --> CALC_CHARGES
    FLAT_CALC --> CALC_CHARGES

    CALC_CHARGES[Calculate Base Charges<br/>Consumption × Rate] --> APPLY_STEPS{Step Tariff?}
    APPLY_STEPS -->|Yes| STEP_CALC[Apply Step Rates<br/>Tier 1 / Tier 2 / Tier 3]
    APPLY_STEPS -->|No| APPLY_FEES

    STEP_CALC --> APPLY_FEES[Apply Fixed Fees<br/>Service Fee / Meter Fee]
    APPLY_FEES --> APPLY_TAXES[Apply Taxes<br/>VAT / Municipal]
    APPLY_TAXES --> APPLY_ADJ[Apply Adjustments<br/>Credit / Debit Notes]

    APPLY_ADJ --> CALC_TOTAL[Calculate Total<br/>Charges + Fees + Taxes - Credits]
    CALC_TOTAL --> GEN_INV[Generate Invoice<br/>Line Items + Summary]

    GEN_INV --> POST_LEDGER[Post to Ledger<br/>Debit Entry]
    POST_LEDGER --> CHECK_BALANCE{Check Wallet Balance}
    CHECK_BALANCE -->|Sufficient| AUTO_PAY[Auto-Pay from Wallet]
    CHECK_BALANCE -->|Insufficient| MARK_DUE[Mark as Due<br/>Send Notification]

    AUTO_PAY --> COMPLETE[Complete Billing Cycle]
    MARK_DUE --> COMPLETE
```

---

## 6. Bulk Generation Flow

```mermaid
sequenceDiagram
    participant UI as Frontend / Admin
    participant API as BulkController
    participant SVC as BulkGenerationService
    participant QUEUE as RabbitMQ Queue
    participant CONSUMER as BulkConsumer (x5)
    participant ENGINE as ReportEngine
    participant DB as PostgreSQL
    participant STORE as Document Store

    UI->>+API: POST /api/v1/reports/bulk<br/>{templateId, customerIds[], format}
    API->>+SVC: createBulkJob(request)
    SVC->>SVC: validate request
    SVC->>SVC: generate jobId
    SVC->>+DB: INSERT bulk_generation_jobs
    SVC-->>-API: { jobId, status: PENDING }

    loop For each customer (batched)
        SVC->>QUEUE: send batch message
        QUEUE-->>SVC: ack
    end

    SVC-->>-UI: { jobId, totalItems, status }

    par Consumer 1 (parallel)
        CONSUMER->>+QUEUE: dequeue message
        QUEUE-->>-CONSUMER: batch payload
        CONSUMER->>+ENGINE: generateReport(customerId)
        ENGINE-->>-CONSUMER: PDF bytes
        CONSUMER->>+STORE: store document
        CONSUMER->>+DB: UPDATE generated_documents
        CONSUMER->>+DB: UPDATE job progress
    and Consumer 2
        CONSUMER->>+QUEUE: dequeue message
        QUEUE-->>-CONSUMER: batch payload
        CONSUMER->>+ENGINE: generateReport(customerId)
        ENGINE-->>-CONSUMER: PDF bytes
        CONSUMER->>+STORE: store document
        CONSUMER->>+DB: UPDATE generated_documents
        CONSUMER->>+DB: UPDATE job progress
    end

    UI->>+API: GET /api/v1/reports/bulk/{jobId}/status
    API->>+DB: SELECT progress, total, status
    DB-->>-API: { progress: 450/1000, status: IN_PROGRESS }
    API-->>-UI: Status update

    Note over CONSUMER: After all items processed
    CONSUMER->>+DB: UPDATE job status = COMPLETED

    UI->>+API: GET /api/v1/reports/bulk/{jobId}/status
    API->>+DB: SELECT status
    DB-->>-API: { status: COMPLETED, downloadUrl: ... }
    API-->>-UI: Final status
```

---

## 7. Excel Engine Flow

```mermaid
flowchart TD
    subgraph "Template Management"
        UPLOAD[Upload JXLS Template<br/>POST /api/v1/reports/excel/templates]
        STORE_T[Store in DB + Git]
        LIST_T[List Templates<br/>GET /api/v1/reports/excel/templates]
    end

    subgraph "Excel Generation"
        REQ[Generate Request<br/>POST /api/v1/reports/excel/generate]
        LOAD_T[Load JXLS Template<br/>from DB]
        LOAD_D[Load Data<br/>from Query / API]
        MERGE[JXLS merge<br/>Template + Data]
        FORMULA[Apply Formulas<br/>SUM, AVERAGE, etc.]
        STYLE[Apply Styling<br/>Fonts, Colors, Borders]
        OUTPUT[Output XLSX]
    end

    subgraph "Export Options"
        XLSX[.xlsx - Standard]
        XLS[.xls - Legacy]
        STREAM[Streaming<br/>SXSSF for 100k+ rows]
    end

    subgraph "Post-Processing"
        PASSWORD[Password Protect]
        SECURE[Remove Macros]
        VALIDATE[Validate Output]
    end

    UPLOAD --> STORE_T
    LIST_T --> REQ
    STORE_T --> REQ

    REQ --> LOAD_T
    LOAD_T --> LOAD_D
    LOAD_D --> MERGE
    MERGE --> FORMULA
    FORMULA --> STYLE
    STYLE --> OUTPUT

    OUTPUT --> XLSX
    OUTPUT --> XLS
    OUTPUT --> STREAM

    XLSX --> PASSWORD
    XLS --> PASSWORD
    STREAM --> PASSWORD

    PASSWORD --> SECURE
    SECURE --> VALIDATE
    VALIDATE --> RESP(Return download URL)
```

---

## 8. PDF Security Flow

```mermaid
sequenceDiagram
    participant API as SecurityController
    participant SEC as PdfSecurityService
    participant ENC as EncryptionEngine
    participant SIGN as SigningEngine
    participant WM as WatermarkEngine
    participant LOG as AuditLogger
    participant KEY as KeyStore

    Note over API,KEY: PROTECT - Encrypt PDF
    API->>+SEC: POST /api/v1/reports/security/protect<br/>{documentId, userPassword,<br/>ownerPassword, permissions}
    SEC->>+ENC: encrypt(pdfBytes, config)
    ENC->>ENC: AES-256 encrypt with owner password
    ENC->>ENC: set user password
    ENC->>ENC: apply permissions (COPY, PRINT, etc.)
    ENC-->>-SEC: encrypted PDF bytes
    SEC->>+LOG: log security operation
    LOG-->>-SEC: audit entry
    SEC-->>-API: { documentId, encrypted: true }

    Note over API,KEY: SIGN - Digital Signature
    API->>+SEC: POST /api/v1/reports/security/sign<br/>{documentId, keystoreAlias}
    SEC->>+KEY: load private key
    KEY-->>-SEC: PrivateKey + Certificate
    SEC->>+SIGN: sign(pdfBytes, key, cert)
    SIGN->>SIGN: create signature appearance
    SIGN->>SIGN: SHA-256 digest
    SIGN->>SIGN: embed signature field
    SIGN-->>-SEC: signed PDF bytes
    SEC->>+LOG: log signing operation
    SEC-->>-API: { documentId, signed: true }

    Note over API,KEY: WATERMARK - Add Watermark
    API->>+SEC: POST /api/v1/reports/security/watermark<br/>{documentId, text, opacity}
    SEC->>+WM: watermark(pdfBytes, text, config)
    WM->>WM: create transparent text layer
    WM->>WM: position diagonally across pages
    WM->>WM: apply opacity (default 0.3)
    WM-->>-SEC: watermarked PDF bytes
    SEC->>+LOG: log watermark operation
    SEC-->>-API: { documentId, watermarked: true }
```

---

## 9. Deployment Flow

```mermaid
graph TB
    subgraph "Development"
        DEV[Developer Workstation<br/>Java 21 + Maven]
        VSCODE[VS Code / IntelliJ]
        GIT[Git Commit & Push]
    end

    subgraph "CI Pipeline (GitHub Actions)"
        CHECKOUT[Checkout Code]
        SETUP_JDK[Setup JDK 21<br/>Eclipse Temurin]
        COMPILE[Maven Compile<br/>mvn clean compile]
        TEST[Run Tests<br/>mvn test]
        LINT[Code Quality<br/>Checkstyle + PMD]
        SCAN[Security Scan<br/>Trivy + Semgrep]
        BUILD[Maven Package<br/>mvn package]
        DOCKER[Docker Build<br/>docker build]
        PUSH[Docker Push<br/>to Registry]
    end

    subgraph "Deployment Environments"
        DEV_ENV[Development<br/>Docker Compose Local]
        STAGING[Staging<br/>Single Server]
        PROD[Production<br/>HA Pair]
    end

    subgraph "Production Stack"
        LB[Load Balancer<br/>Nginx / Traefik]
        REP1[Reporting Engine<br/>Instance 1]
        REP2[Reporting Engine<br/>Instance 2]
        PG_PROD[(PostgreSQL<br/>Primary)]
        PG_STANDBY[(PostgreSQL<br/>Standby)]
        RMQ_CLUSTER[RabbitMQ<br/>Mirrored Queue Cluster]
        MONITOR[Monitoring<br/>Prometheus + Grafana]
        ALERT[Alerting<br/>PagerDuty / Slack]
    end

    DEV --> GIT
    GIT --> CHECKOUT
    CHECKOUT --> SETUP_JDK
    SETUP_JDK --> COMPILE
    COMPILE --> TEST
    TEST --> LINT
    LINT --> SCAN
    SCAN --> BUILD
    BUILD --> DOCKER
    DOCKER --> PUSH

    PUSH --> DEV_ENV
    PUSH --> STAGING
    PUSH --> PROD

    PROD --> LB
    LB --> REP1
    LB --> REP2
    REP1 --> PG_PROD
    REP2 --> PG_PROD
    PG_PROD --> PG_STANDBY
    REP1 --> RMQ_CLUSTER
    REP2 --> RMQ_CLUSTER
    REP1 --> MONITOR
    REP2 --> MONITOR
    MONITOR --> ALERT

    DEV_ENV --> PG_DEV[(PostgreSQL<br/>Local)]
    DEV_ENV --> RMQ_DEV[RabbitMQ<br/>Local]
    STAGING --> PG_STAGE[(PostgreSQL<br/>Staging)]
    STAGING --> RMQ_STAGE[RabbitMQ<br/>Staging]
```

---

## 10. Database Relationship Diagram

```mermaid
erDiagram
    reports {
        uuid id PK
        varchar name
        varchar description
        varchar report_type
        varchar format
        text jrxml_content
        bytea compiled_report
        int version
        varchar status "ACTIVE | INACTIVE | DRAFT"
        varchar created_by
        timestamp created_at
        timestamp updated_at
    }

    report_templates {
        uuid id PK
        varchar name
        varchar description
        varchar category "INVOICE | PAYMENT | REPORT | EXCEL"
        text template_content
        int version
        uuid current_version_id FK
        varchar status
        boolean is_system
        varchar created_by
        timestamp created_at
        timestamp updated_at
    }

    template_versions {
        uuid id PK
        uuid template_id FK
        int version_number
        text template_content
        text change_summary
        varchar created_by
        timestamp created_at
    }

    bulk_generation_jobs {
        uuid id PK
        varchar job_name
        uuid template_id FK
        varchar status "PENDING | IN_PROGRESS | COMPLETED | FAILED | CANCELLED"
        int total_items
        int completed_items
        int failed_items
        jsonb parameters
        varchar output_format "PDF | XLSX | DOCX | HTML | CSV"
        text error_message
        varchar created_by
        timestamp created_at
        timestamp completed_at
        timestamp updated_at
    }

    generated_documents {
        uuid id PK
        uuid job_id FK
        uuid template_id FK
        varchar entity_type "CUSTOMER | INVOICE | PAYMENT"
        uuid entity_id
        varchar document_type
        varchar format
        bytea document_content
        int file_size_bytes
        boolean is_encrypted
        boolean is_signed
        boolean is_watermarked
        varchar created_by
        timestamp created_at
    }

    pdf_security_log {
        uuid id PK
        uuid document_id FK
        varchar operation_type "ENCRYPT | SIGN | WATERMARK | VERIFY"
        varchar status "SUCCESS | FAILED"
        text details
        varchar performed_by
        timestamp created_at
    }

    font_registry {
        uuid id PK
        varchar font_name
        varchar font_family
        varchar font_style "REGULAR | BOLD | ITALIC | BOLD_ITALIC"
        bytea font_data
        boolean is_arabic
        boolean is_active
        varchar created_by
        timestamp created_at
    }

    export_configurations {
        uuid id PK
        varchar config_name
        varchar export_type "PDF | XLSX | DOCX | HTML | CSV"
        jsonb config_properties
        boolean is_default
        varchar created_by
        timestamp created_at
        timestamp updated_at
    }

    reports ||--o{ generated_documents : "generates"
    report_templates ||--o{ template_versions : "has versions"
    report_templates ||--o{ bulk_generation_jobs : "used in"
    report_templates ||--o{ generated_documents : "template source"
    bulk_generation_jobs ||--o{ generated_documents : "produces"
    generated_documents ||--o{ pdf_security_log : "security events"
    template_versions ||--|| report_templates : "current version"
```

---

*End of Architecture Diagrams*
