# Reporting Engine Migration — Rollback Plan

**Version:** 1.0.0
**Date:** 2026-06-27
**Status:** Draft
**Owner:** DevOps Team

---

## Table of Contents

1. [Rollback Triggers](#1-rollback-triggers)
2. [Phase-by-Phase Rollback Procedures](#2-phase-by-phase-rollback-procedures)
3. [Database Rollback](#3-database-rollback)
4. [Service Rollback](#4-service-rollback)
5. [Configuration Rollback](#5-configuration-rollback)
6. [Data Integrity Verification After Rollback](#6-data-integrity-verification-after-rollback)
7. [Communication Plan During Rollback](#7-communication-plan-during-rollback)
8. [Post-Rollback Validation](#8-post-rollback-validation)
9. [Rollback Drill Schedule](#9-rollback-drill-schedule)

---

## 1. Rollback Triggers

### 1.1 Critical Triggers (Immediate Rollback)

| # | Trigger | Threshold | Response Time | Owner |
|---|---------|-----------|---------------|-------|
| T-01 | Error rate exceeds threshold | > 5% of report generation requests fail | < 5 minutes | On-Call |
| T-02 | P99 latency exceeds SLA | > 30 seconds for PDF generation | < 10 minutes | On-Call |
| T-03 | PDF output quality unacceptable | Business rejects invoice samples | < 1 hour | Product Owner |
| T-04 | Security vulnerability (CRITICAL) | CVSS >= 9.0 in new engine | < 15 minutes | Security |
| T-05 | Data corruption detected | Invoice amounts differ from expected | < 5 minutes | Tech Lead |
| T-06 | RabbitMQ queue failure | Queue not consumable for > 5 minutes | < 10 minutes | DevOps |
| T-07 | Database migration failure | Flyway migration cannot complete | < 15 minutes | DBA |
| T-08 | Complete service outage | Reporting engine returns 5xx for > 2 min | < 5 minutes | On-Call |

### 1.2 Warning Triggers (Rollback Consideration)

| # | Trigger | Threshold | Response Time | Owner |
|---|---------|-----------|---------------|-------|
| W-01 | Error rate elevated | 1-5% of requests fail | < 30 minutes | Dev Team |
| W-02 | P99 latency degraded | 15-30 seconds for PDF generation | < 30 minutes | Dev Team |
| W-03 | Memory usage high | > 80% of heap (4 GB) | < 1 hour | DevOps |
| W-04 | Queue depth growing | > 5,000 messages and rising | < 30 minutes | DevOps |
| W-05 | Font rendering issues | Arabic text glyphs incorrect | < 2 hours | Reporting Team |
| W-06 | Template versioning errors | Version conflict on save | < 1 hour | Reporting Team |
| W-07 | PDF security feature failure | Sign/encrypt/watermark intermittent | < 1 hour | Reporting Team |
| W-08 | Bulk job partial failure | > 5% of items in bulk job fail | < 30 minutes | Reporting Team |

### 1.3 Rollback Decision Matrix

```
                    ┌────────────────────────────────────────┐
                    │          Severity of Impact             │
                    │  LOW           MEDIUM         HIGH     │
┌──────────────────┼────────────────────────────────────────┤
│   Number of      │  LOW    │ Continue     │ Investigate    │ Rollback │
│   Users          │  MEDIUM │ Investigate  │ Rollback       │ Rollback │
│   Affected       │  HIGH   │ Rollback     │ Rollback       │ Rollback │
└──────────────────┴─────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Rollback Procedures

### Phase 1: Foundation & Infrastructure

**What to roll back:**
- Spring Boot project directory
- Docker Compose additions for reporting engine
- CI/CD pipeline changes
- Maven build configuration

**Rollback procedure:**
```bash
# 1. Git revert foundation commits
git revert <phase1-commit-hash> --no-edit

# 2. Remove Docker Compose reporting engine services
git checkout HEAD~1 -- docker-compose.yml

# 3. Remove CI/CD workflow for reporting engine
git checkout HEAD~1 -- .github/workflows/reporting-engine.yml

# 4. Verify Spring Boot project removed
rm -rf reporting-engine/

# 5. Rebuild and restart remaining services
cd backend && docker compose up -d --build
```

**Estimated time:** 20 minutes  
**Risk:** Low — no data affected

---

### Phase 2: Database Schema Design

**What to roll back:**
- All Flyway migrations (V1–V6)
- JPA entities and repositories
- Database schema objects

**Rollback procedure:**
```bash
# 1. Rollback Flyway migrations (undo)
cd reporting-engine
mvn flyway:undo -Dflyway.undo.count=6

# 2. If Flyway undo not available, manually revert:
# Drop all reporting engine tables
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
  DROP TABLE IF EXISTS pdf_security_log CASCADE;
  DROP TABLE IF EXISTS generated_documents CASCADE;
  DROP TABLE IF EXISTS bulk_generation_jobs CASCADE;
  DROP TABLE IF EXISTS template_versions CASCADE;
  DROP TABLE IF EXISTS report_templates CASCADE;
  DROP TABLE IF EXISTS reports CASCADE;
  DROP TABLE IF EXISTS font_registry CASCADE;
  DROP TABLE IF EXISTS export_configurations CASCADE;
  DROP TABLE IF EXISTS flyway_schema_history CASCADE;
"

# 3. Remove JPA entity files
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/**/entity/

# 4. Remove repository files
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/**/repository/
```

**Estimated time:** 30 minutes  
**Risk:** HIGH — data loss possible. Ensure no production data has been written yet.

---

### Phase 3: Report Compiler Module

**What to roll back:**
- ReportCompiler service and interface
- Caffeine cache configuration
- JRXML loading implementation

**Rollback procedure:**
```bash
# 1. Remove compiler service code
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/engine/compiler/

# 2. Revert cache configuration in application.yml
git checkout HEAD~1 -- src/main/resources/application.yml

# 3. Restore cache section to default
# (No application-level cache — rely on legacy system)
```

**Estimated time:** 15 minutes  
**Risk:** Low — no data or external dependencies

---

### Phase 4: Report Filler Module

**What to roll back:**
- ReportFiller service
- Parameter injection logic
- Data source integration

**Rollback procedure:**
```bash
# 1. Remove filler service code
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/engine/filler/

# 2. Revert any datasource config changes
git checkout HEAD~1 -- src/main/resources/application.yml
```

**Estimated time:** 15 minutes  
**Risk:** Low — no data affected

---

### Phase 5: Report Exporter Module

**What to roll back:**
- All 5 exporter implementations (PDF, XLSX, DOCX, HTML, CSV)
- Content negotiation configuration
- Export utility classes

**Rollback procedure:**
```bash
# 1. Remove exporter code
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/engine/exporter/

# 2. Remove export-related dependencies from pom.xml
# (Revert pom.xml to previous version)
git checkout HEAD~1 -- pom.xml

# 3. Clean and rebuild
mvn clean compile
```

**Estimated time:** 20 minutes  
**Risk:** Medium — Maven dependency changes could affect other modules

---

### Phase 6: PDF Security Module

**What to roll back:**
- PdfSecurityService
- Encryption, signing, watermarking implementations
- iText 9 and BouncyCastle dependencies
- Security controller endpoints

**Rollback procedure:**
```bash
# 1. Remove security service code
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/security/

# 2. Remove iText/BouncyCastle from pom.xml
git checkout HEAD~1 -- pom.xml

# 3. Remove security controller endpoints
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/api/

# 4. Revert any PDF security configuration
git checkout HEAD~1 -- src/main/resources/application.yml

# 5. Clean and rebuild
mvn clean compile
```

**Estimated time:** 20 minutes  
**Risk:** Medium — iText licensing obligations remain even after removal

---

### Phase 7: Excel Engine Module

**What to roll back:**
- Excel engine service
- JXLS template processing
- Apache POI dependencies

**Rollback procedure:**
```bash
# 1. Remove excel engine code
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/excel/

# 2. Remove JXLS/POI from pom.xml
git checkout HEAD~1 -- pom.xml

# 3. Remove Excel controller endpoints
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/api/

# 4. Clean and rebuild
mvn clean compile
```

**Estimated time:** 15 minutes  
**Risk:** Low — no data affected

---

### Phase 8: Bulk Generation Module

**What to roll back:**
- BulkGenerationService
- BulkConsumer (RabbitMQ listeners)
- Queue definitions
- Job tracking API

**Rollback procedure:**
```bash
# 1. Remove bulk generation code
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/bulk/

# 2. Remove RabbitMQ configuration
git checkout HEAD~1 -- src/main/resources/application.yml

# 3. Delete RabbitMQ queues (if no other services use them)
rabbitmqadmin -q delete queue name=reporting.bulk.generation
rabbitmqadmin -q delete queue name=reporting.bulk.generation.dlq

# 4. Remove RabbitMQ dependency from pom.xml
git checkout HEAD~1 -- pom.xml

# 5. For in-flight bulk jobs:
# - List active jobs from DB
# - Mark all as CANCELLED
UPDATE bulk_generation_jobs SET status = 'CANCELLED', error_message = 'Rollback initiated'
WHERE status IN ('PENDING', 'IN_PROGRESS');

# 6. Clean and rebuild
mvn clean compile
```

**Estimated time:** 30 minutes  
**Risk:** HIGH — in-flight jobs will be lost. Confirm with stakeholders before proceeding.

---

### Phase 9: Template Manager

**What to roll back:**
- TemplateService CRUD
- Git-based versioning integration
- Template diff and rollback APIs

**Rollback procedure:**
```bash
# 1. Remove template service code
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/template/

# 2. Remove template controller endpoints
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/api/

# 3. Remove template-related database records
DELETE FROM template_versions;
DELETE FROM report_templates;

# 4. Rollback Git integration hooks
git checkout HEAD~1 -- .git/hooks/
```

**Estimated time:** 20 minutes  
**Risk:** Medium — template data loss. Ensure templates are backed up.

---

### Phase 10: REST API Layer

**What to roll back:**
- All 5 controllers (Report, Template, Bulk, Security, Excel)
- API endpoint routing
- SpringDoc OpenAPI configuration

**Rollback procedure:**
```bash
# 1. Git revert all controller commits
git revert <phase10-commit-range> --no-edit

# 2. Remove controller files
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/api/

# 3. Revert API routing/security config
git checkout HEAD~1 -- src/main/resources/application.yml

# 4. Clean and rebuild
mvn clean compile
```

**Estimated time:** 15 minutes  
**Risk:** Low — API not yet consumed by production traffic

---

### Phase 11: Arabic/RTL Rendering

**What to roll back:**
- ICU4J configuration
- Custom Arabic font extension JAR
- JasperReportsContext RTL settings
- JRXML RTL style updates

**Rollback procedure:**
```bash
# 1. Remove font extension JAR from classpath
rm -f src/main/resources/fonts/*.jar

# 2. Revert application.yml locale settings
git checkout HEAD~1 -- src/main/resources/application.yml

# 3. Revert JRXML styles to LTR defaults
git checkout HEAD~1 -- src/main/resources/reports/common/Styles.jrxml

# 4. Revert ICU4J dependency from pom.xml
git checkout HEAD~1 -- pom.xml

# 5. Clean and rebuild
mvn clean compile
```

**Estimated time:** 25 minutes  
**Risk:** Medium — all templates revert to LTR-only

---

### Phase 12: JRXML Migration — Legacy Templates

**What to roll back:**
- All migrated JRXML content changes
- Consolidated template files

**Rollback procedure:**
```bash
# 1. Restore original JRXMLs from legacy backup
cp -r draft/legacy-templates/Meter-backup/templates/* templates/

# 2. Revert consolidated sub-reports to original 7
# (Restore from legacy-templates backup)
cp draft/legacy-templates/Meter-backup/templates/reports/user/* templates/reports/

# 3. Verify restoration
diff -r templates/ draft/legacy-templates/Meter-backup/templates/
```

**Estimated time:** 30 minutes  
**Risk:** Medium — visual differences between old and new templates

---

### Phase 13: JRXML Migration — New Templates

**What to roll back:**
- New ElectricityInvoice.jrxml
- New WaterInvoice.jrxml
- A4 Landscape/Portfolio layouts

**Rollback procedure:**
```bash
# 1. Remove new templates
rm -f src/main/resources/reports/electricity/ElectricityInvoice.jrxml
rm -f src/main/resources/reports/water/WaterInvoice.jrxml

# 2. Restore legacy invoice templates
cp templates/invoice/invoice_elec.jrxml src/main/resources/reports/electricity/
cp templates/invoice/invoice_water.jrxml src/main/resources/reports/water/

# 3. Update routing to use legacy templates
git checkout HEAD~1 -- src/main/java/com/meterverse/reporting/config/
```

**Estimated time:** 15 minutes  
**Risk:** Low — new templates not yet used in production

---

### Phase 14: Font Extension & Rendering

**What to roll back:**
- Font extension JAR build configuration
- fonts.xml configuration
- Font-related pom.xml changes

**Rollback procedure:**
```bash
# 1. Remove font extension source
rm -rf jasperreports-fonts-extension/

# 2. Revert fonts.xml
git checkout HEAD~1 -- src/main/resources/fonts/fonts.xml

# 3. Revert pom.xml font build config
git checkout HEAD~1 -- pom.xml
```

**Estimated time:** 15 minutes  
**Risk:** Low — font changes only affect rendering

---

### Phase 15: Integration with Backend API

**What to roll back:**
- API Gateway routing changes
- NestJS proxy configuration
- Frontend API client updates

**Rollback procedure:**
```bash
# 1. Revert API Gateway routing
git checkout HEAD~1 -- api-gateway/routes/reporting.yml

# 2. Revert NestJS proxy
git checkout HEAD~1 -- backend/src/app.module.ts

# 3. Revert Frontend API client
git checkout HEAD~1 -- Frontend/src/lib/api/reporting.ts

# 4. Restore feature flag to legacy system
# Set reporting-engine-v2 = false in config

# 5. Rebuild and restart affected services
docker compose up -d --build backend frontend
```

**Estimated time:** 25 minutes  
**Risk:** HIGH — this is the cutover point. Full rollback likely needed.

---

### Phase 16: Testing & Validation

**What to roll back:**
- Playwright test additions
- Integration test additions
- Performance test scripts

**Rollback procedure:**
```bash
# 1. Remove new test files
rm -rf draft/tests/reporting-engine/
rm -rf backend/test/reporting/
rm -rf Frontend/e2e/reporting/

# 2. Revert test configuration
git checkout HEAD~1 -- playwright.config.ts
git checkout HEAD~1 -- jest.config.ts
```

**Estimated time:** 10 minutes  
**Risk:** Very low — tests have no production impact

---

### Phase 17: Deployment & Cutover

**What to roll back:**
- Production deployment
- Docker image tags
- DNS/CNAME changes
- Monitoring configuration

**Rollback procedure:**
```bash
# 1. Feature flag - DISABLE NEW ENGINE
# Set in configuration service:
reporting-engine-v2: false

# 2. Revert API Gateway to route to NestJS backend
curl -X PUT https://config-server/api/v1/config \
  -H "Content-Type: application/json" \
  -d '{"reporting.api.target": "nestjs"}'

# 3. Verify legacy system serving traffic
curl http://localhost:3001/api/v1/reports/generate
# Should return 200 from legacy system

# 4. Scale down reporting engine replicas
docker service scale reporting-engine=0

# 5. Stop reporting engine Docker containers
docker stop reporting-engine
docker rm reporting-engine

# 6. Revert monitoring dashboard
git checkout HEAD~1 -- monitoring/grafana/dashboards/reporting-engine.json

# 7. Revert alerting rules
git checkout HEAD~1 -- monitoring/prometheus/alerts/reporting.yml

# 8. Send rollback notification
```

**Estimated time:** 15 minutes (feature flag) to 1 hour (full revert)  
**Risk:** CRITICAL — this is the production deployment phase

---

## 3. Database Rollback

### 3.1 Flyway Undo

```bash
# Check current migration version
mvn flyway:info

# Undo all reporting engine migrations (one by one)
mvn flyway:undo -Dflyway.undo.count=1
# Repeat until all reporting engine migrations are reverted

# Verify rollback
mvn flyway:info
# Should show no reporting engine migrations applied
```

### 3.2 Manual SQL Rollback

If Flyway undo is not available, use the manual SQL rollback script:

```sql
-- V6: Drop indexes
DROP INDEX IF EXISTS idx_generated_documents_job_id;
DROP INDEX IF EXISTS idx_generated_documents_entity;
DROP INDEX IF EXISTS idx_bulk_jobs_status;
DROP INDEX IF EXISTS idx_bulk_jobs_created;
DROP INDEX IF EXISTS idx_template_versions_template;
DROP INDEX IF EXISTS idx_templates_category;

-- V5: Drop pdf_security_log
DROP TABLE IF EXISTS pdf_security_log CASCADE;

-- V4: Drop generated_documents
DROP TABLE IF EXISTS generated_documents CASCADE;

-- V3: Drop bulk_generation_jobs
DROP TABLE IF EXISTS bulk_generation_jobs CASCADE;

-- V2: Drop template_versions and report_templates
DROP TABLE IF EXISTS template_versions CASCADE;
DROP TABLE IF EXISTS report_templates CASCADE;

-- V1: Drop reports
DROP TABLE IF EXISTS reports CASCADE;

-- V0: Drop font_registry and export_configurations
DROP TABLE IF EXISTS font_registry CASCADE;
DROP TABLE IF EXISTS export_configurations CASCADE;

-- Clean up Flyway tracking
DELETE FROM flyway_schema_history WHERE installed_rank > (
    SELECT COALESCE(MAX(installed_rank), 0) FROM flyway_schema_history
    WHERE version LIKE '0.%'  -- migrations before reporting engine
);
```

### 3.3 Database Verification After Rollback

```sql
-- Verify no reporting engine tables remain
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'reports', 'report_templates', 'template_versions',
    'bulk_generation_jobs', 'generated_documents',
    'pdf_security_log', 'font_registry', 'export_configurations'
);
-- Expected: 0 rows returned

-- Verify Flyway history clean
SELECT version, description FROM flyway_schema_history
ORDER BY installed_rank DESC LIMIT 5;
-- Expected: No reporting engine versions (V1-V6)
```

---

## 4. Service Rollback

### 4.1 Docker Rollback

```bash
# Rollback to previous Docker image tag
docker pull meterverse/reporting-engine:previous-stable-tag
docker stop reporting-engine
docker run -d \
  --name reporting-engine \
  --network meter-verse-net \
  -e DB_URL="jdbc:postgresql://db:5432/Meter_Verse_pulse" \
  meterverse/reporting-engine:previous-stable-tag

# Or using docker-compose with previous tag
docker compose -f docker-compose.reporting.yml down
# Edit docker-compose.reporting.yml to use previous tag
docker compose -f docker-compose.reporting.yml up -d
```

### 4.2 Kubernetes Rollback (if applicable)

```bash
# Rollback deployment
kubectl rollout undo deployment/reporting-engine -n meterverse

# Check rollback status
kubectl rollout status deployment/reporting-engine -n meterverse

# Verify pods running previous version
kubectl describe deployment reporting-engine -n meterverse | grep Image
```

### 4.3 Service Verification

```bash
# Check service health
curl http://localhost:8080/api/v1/actuator/health

# Check Docker container status
docker ps --filter name=reporting-engine

# Check logs for errors
docker logs reporting-engine --tail 100
```

---

## 5. Configuration Rollback

### 5.1 Feature Flag

```yaml
# Configuration service or config file
reporting:
  engine:
    v2:
      enabled: false  # Revert to false during rollback
  api:
    target: nestjs    # Direct traffic to NestJS backend
```

### 5.2 Environment Variables

```bash
# Revert environment variable overrides
export REPORTING_ENGINE_V2_ENABLED=false
export REPORTING_API_TARGET=nestjs

# If using .env file:
sed -i 's/REPORTING_ENGINE_V2_ENABLED=true/REPORTING_ENGINE_V2_ENABLED=false/' .env
```

### 5.3 API Gateway Configuration

```yaml
# Revert API Gateway routing
routes:
  - path: /api/v1/reports/**
    target: http://nestjs-backend:3001  # Back to NestJS
    # Was: target: http://reporting-engine:8080
```

---

## 6. Data Integrity Verification After Rollback

### 6.1 Invoice Data Verification

```sql
-- Verify invoices generated during migration period
SELECT COUNT(*) FROM invoices
WHERE created_at BETWEEN '{migration_start}' AND '{migration_end}';

-- Sample check invoice totals
SELECT id, total_amount, status FROM invoices
WHERE created_at BETWEEN '{migration_start}' AND '{migration_end}'
ORDER BY created_at DESC LIMIT 10;

-- Verify no duplicate invoice numbers
SELECT invoice_number, COUNT(*) as dup_count
FROM invoices
WHERE created_at BETWEEN '{migration_start}' AND '{migration_end}'
GROUP BY invoice_number
HAVING COUNT(*) > 1;
```

### 6.2 Payment Data Verification

```sql
-- Verify payment records intact
SELECT COUNT(*) FROM payments
WHERE created_at BETWEEN '{migration_start}' AND '{migration_end}';

-- Verify ledger entries balanced
SELECT SUM(amount_delta) FROM customer_ledger_entries
WHERE created_at BETWEEN '{migration_start}' AND '{migration_end}';
-- Should be 0 (debits == credits)
```

### 6.3 Report Data Verification

```sql
-- Check generated document records
SELECT COUNT(*) FROM generated_documents
WHERE created_at BETWEEN '{migration_start}' AND '{migration_end}';

-- Verify document file sizes reasonable
SELECT id, format, file_size_bytes FROM generated_documents
WHERE file_size_bytes = 0 OR file_size_bytes IS NULL;
-- Expected: 0 rows
```

### 6.4 Integrity Checklist

| # | Check | SQL/Command | Status |
|---|-------|-------------|--------|
| 1 | All invoices present | `SELECT COUNT(*) FROM invoices` | ☐ |
| 2 | No orphan payments | `SELECT * FROM payments WHERE invoice_id NOT IN (SELECT id FROM invoices)` | ☐ |
| 3 | Ledger balanced | `SELECT SUM(amount_delta) FROM customer_ledger_entries` = 0 | ☐ |
| 4 | Sequence integrity | `SELECT MAX(id) FROM invoices` ≥ pre-migration value | ☐ |
| 5 | Referential integrity | No FK violations | ☐ |
| 6 | Audit log complete | Entries for all migration operations | ☐ |
| 7 | Template files intact | All JRXMLs present | ☐ |
| 8 | No duplicate data | Unique constraints hold | ☐ |

---

## 7. Communication Plan During Rollback

### 7.1 Notification Matrix

| Audience | Channel | Message | Responsible |
|----------|---------|---------|-------------|
| Internal Team | Slack #engineering | Rollback initiated + reason | On-Call |
| Product Owner | Slack + Phone | Impact assessment + timeline | Tech Lead |
| Business Stakeholders | Email | Rollback notification + expected resolution | Product Owner |
| Support Team | Slack #support | FAQ for user inquiries | Tech Lead |
| End Users | Status Page | System status update | Product Owner |

### 7.2 Rollback Announcement Template

```
🚨 ROLLBACK INITIATED — Meter Verse Reporting Engine

TIMESTAMP: {date} {time}
TRIGGER: {trigger_id} — {trigger_description}
AFFECTED SYSTEM: Reporting Engine v2.0.0
ROLLING BACK TO: Legacy NestJS Reporting System
ESTIMATED DURATION: {estimated_minutes} minutes

CURRENT STATUS:
  □ Feature flag disabled
  □ API gateway reverted
  □ Database rollback in progress
  □ Service rollback in progress
  □ Verification running

NEXT UPDATE: {next_update_time}
ON-CALL ENGINEER: {name} — {phone}

MESSAGE: {brief description of what went wrong and what users should expect}
```

### 7.3 Communication Timeline

| Time | Action | Owner |
|------|--------|-------|
| T+0 | Rollback decision made | Tech Lead |
| T+0 | #engineering Slack alert | On-Call |
| T+2min | Start rollback procedure | DevOps |
| T+5min | #engineering status update | DevOps |
| T+15min | Notify Product Owner | Tech Lead |
| T+30min | Email to stakeholders | Product Owner |
| T+60min | Status page update | DevOps |
| T+end | Post-mortem scheduled | Tech Lead |

---

## 8. Post-Rollback Validation

### 8.1 Immediate Validation (Within 1 Hour)

| # | Check | Method | Owner |
|---|-------|--------|-------|
| 1 | Legacy system serving traffic | `curl localhost:3001/api/v1/health` | DevOps |
| 2 | Invoice PDF generation works | Generate test invoice | QA |
| 3 | Payment receipt generation works | Generate test receipt | QA |
| 4 | Report download works | Download existing report | QA |
| 5 | All 293 backend tests pass | `npm test` | QA |
| 6 | Frontend build succeeds | `bun run build` | QA |

### 8.2 Short-Term Validation (Within 24 Hours)

| # | Check | Method | Owner |
|---|-------|--------|-------|
| 7 | No error spike in logs | Check Kibana/Grafana | DevOps |
| 8 | No user complaints | Check support tickets | Support |
| 9 | Database consistent | Run integrity queries | DBA |
| 10 | All automated alerts cleared | Check monitoring | DevOps |

### 8.3 Long-Term Validation (Within 1 Week)

| # | Check | Method | Owner |
|---|-------|--------|-------|
| 11 | Root cause identified | Post-mortem analysis | Tech Lead |
| 12 | Fix deployed to staging | Code reviewed and merged | Dev Team |
| 13 | Migration plan updated with learnings | Plan revised | Tech Lead |
| 14 | Rollback drills scheduled | Calendar invite sent | DevOps |

---

## 9. Rollback Drill Schedule

### 9.1 Drill Frequency

| Phase | Frequency | Duration | Participants |
|-------|-----------|----------|--------------|
| Pre-Migration | Weekly | 30 min | DevOps + QA |
| During Migration | After each phase | 15 min | DevOps |
| Post-Migration | Monthly | 45 min | Full Team |

### 9.2 Drill Scenarios

| Drill # | Scenario | Description | Frequency |
|---------|----------|-------------|-----------|
| D-01 | Service crash | Reporting engine crashes, consumers fail | Weekly |
| D-02 | Database corruption | Report tables corrupted | Monthly |
| D-03 | Queue failure | RabbitMQ unavailable | Monthly |
| D-04 | Bad deployment | New image fails health checks | Bi-weekly |
| D-05 | Security incident | Vulnerability discovered | Monthly |
| D-06 | Full cutover rollback | Simulate production rollback | Quarterly |

### 9.3 Drill Procedure

```bash
# 1. Pre-drill checklist
echo "=== Rollback Drill D-{number} ==="
echo "Date: $(date)"
echo "Scenario: {scenario_description}"
echo "Participants: {participants}"
echo "Expected duration: {duration}"

# 2. Execute drill
echo "Starting rollback..."
# Follow phase-by-phase procedure for the relevant phase

# 3. Time each step
echo "Step 1 (feature flag): ${elapsed}s"
echo "Step 2 (gateway reverter): ${elapsed}s"
echo "Step 3 (service rollback): ${elapsed}s"
echo "Step 4 (verification): ${elapsed}s"

# 4. Record results
echo "=== Drill Results ==="
echo "Total time: ${total}s"
echo "Success: ${success}"
echo "Issues found: ${issues}"
echo "Improvements needed: ${improvements}"

# 5. Publish to #engineering
```

### 9.4 Drill Log

| Date | Drill # | Scenario | Duration | Success | Issues | Improvements |
|------|---------|----------|----------|---------|--------|--------------|
| — | D-01 | Service crash | — | — | — | — |
| — | D-02 | Database corruption | — | — | — | — |
| — | D-03 | Queue failure | — | — | — | — |
| — | D-04 | Bad deployment | — | — | — | — |
| — | D-05 | Security incident | — | — | — | — |
| — | D-06 | Full cutover rollback | — | — | — | — |

---

*End of Rollback Plan*
