# Invoice Endpoint Certification Report

**File:** D:\meter\Meter\reports\invoice-endpoint-certification.md
**Date:** 2026-06-25
**Auditor:** Principal Billing Systems Expert
**Scope:** All invoice-related backend endpoints across invoices.controller.ts, billing.controller.ts, bill-cycle.controller.ts

---

## Verification Legend

| Check | Description |
|-------|-------------|
| ✅ PASS | Criterion fully satisfied with evidence |
| ❌ FAIL | Criterion not met, partially implemented, or absent |
| ⚠️ WARN | Implementation exists but has notable gaps or risks |

---

## Endpoint Inventory

### Source Files Surveyed

| File | Path | Line Count |
|------|------|-----------|
| Invoices Controller | D:\meter\Meter\backend\src\invoices\invoices.controller.ts | 163 |
| Billing Controller | D:\meter\Meter\backend\src\billing\billing.controller.ts | 532 |
| Bill Cycle Controller | D:\meter\Meter\backend\src\bill-cycle\bill-cycle.controller.ts | 171 |
| Invoices Module | D:\meter\Meter\backend\src\invoices\invoices.module.ts | 16 |
| Billing Module | D:\meter\Meter\backend\src\billing\billing.module.ts | 19 |
| Schema (Invoice models) | D:\meter\Meter\backend\prisma\schema.prisma | Lines 500–560 |

### Global Guards & Interceptors (Applies to All Endpoints)

| Mechanism | File | Scope | Status |
|-----------|------|-------|--------|
| GlobalAuthGuard (JWT) | pp.module.ts provider, global-auth.guard.ts | APP_GUARD global | ✅ Active |
| RolesGuard | oles.guard.ts | Per-controller @UseGuards | ✅ Active |
| AuditInterceptor (global) | udit.interceptor.ts | APP_INTERCEPTOR global (POST/PUT/PATCH/DELETE only) | ✅ Active (auto-logs all mutations) |
| ProjectAccessInterceptor (global) | project-access.interceptor.ts | APP_INTERCEPTOR global | ✅ Active (checks projectId in params/query/body/header) |
| ThrottlerGuard | pp.module.ts | APP_GUARD global (100 req/min) | ✅ Active |

> **Note:** @Audit() decorator is **never used** on any invoice endpoint. Audit logging relies entirely on the global AuditInterceptor, which auto-captures POST/PUT/PATCH/DELETE with the method name as the action. No @Audit('invoice', 'generate') metadata exists.

---

## Invoice Operation: CREATE

**Endpoint:** PATCH /invoices/:id (in BillingController.updateInvoice)
**Purpose:** Update invoice metadata (dueAt, notes)

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Endpoint exists | ✅ PASS | @Patch('invoices/:id') at line 194 of illing.controller.ts |
| @Roles() decorator | ✅ PASS | @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN) at line 195 |
| Authentication guard | ✅ PASS | Controller-level @UseGuards(AuthGuard('jwt'), RolesGuard) at line 33 |
| Project isolation check | ⚠️ WARN | Global ProjectAccessInterceptor checks projectId but this endpoint only takes :id param, no projectId in body — isolation depends on invoice's existing project association |
| Input validation | ⚠️ WARN | ParseUUIDPipe on :id, but body DTO { dueAt?: string; notes?: string } has no class-validator decorators; no ValidationPipe DTO class used |
| Audit logging | ✅ PASS | Global AuditInterceptor auto-captures PATCH with esourceId from :id |
| Frontend consumer | ❌ FAIL | No frontend hook calls PATCH /invoices/:id; use-invoices.ts has no update mutation |

**Overall:** ❌ FAIL — No explicit "Create" invoice endpoint exists. Invoices are created as a side-effect of POST /invoices/generate. The PATCH endpoint updates metadata only.

---

## Invoice Operation: GENERATE

**Endpoint:** POST /invoices/generate (in BillingController.generateInvoices)
**Purpose:** Generate invoices for a billing period using tariff engine

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Endpoint exists | ✅ PASS | @Post('invoices/generate') at line 46 of illing.controller.ts |
| @Roles() decorator | ✅ PASS | @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE) at line 47 |
| Authentication guard | ✅ PASS | Controller-level @UseGuards(AuthGuard('jwt'), RolesGuard) at line 33 |
| Project isolation check | ✅ PASS | Body contains dto.projectId — global ProjectAccessInterceptor extracts and validates it |
| Input validation | ❌ FAIL | DTO { projectId: string; billingPeriodId: string; customerIds?: string[] } has **no class-validator decorators** — no @IsString(), @IsUUID(), @IsOptional(). No ValidationPipe DTO class. |
| Audit logging | ✅ PASS | Global AuditInterceptor catches POST with esourceId from body (falls back to ody.id or unknown) |
| Frontend consumer | ❌ FAIL | No frontend hook calls POST /invoices/generate; use-invoices.ts only has list, detail, and issue |

**Overall:** ⚠️ WARN — Generation logic is comprehensive (tariff engine, water difference policy, invoice lines creation) but lacks input validation DTOs and frontend integration.

---

## Invoice Operation: APPROVE (Issue)

**Endpoint:** POST /invoices/:id/issue (in BillingController.issueInvoice)
**Purpose:** Issue/approve an invoice, move from draft to issued, create ledger entry

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Endpoint exists | ✅ PASS | @Post('invoices/:id/issue') at line 163 of illing.controller.ts |
| @Roles() decorator | ✅ PASS | @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE) at line 164 |
| Authentication guard | ✅ PASS | Controller-level @UseGuards(AuthGuard('jwt'), RolesGuard) at line 33 |
| Project isolation check | ⚠️ WARN | Only :id param used; no projectId in request. Global interceptor may not find a projectId to check. |
| Input validation | ✅ PASS | ParseUUIDPipe on :id (line 167); no body required |
| State transition check | ✅ PASS | if (invoice.status !== 'draft') return { status: 'already_issued' } at line 170 |
| Audit logging | ✅ PASS | Global AuditInterceptor captures POST |
| Frontend consumer | ✅ PASS | useIssueInvoice() in Frontend/src/hooks/use-invoices.ts line 86–94 |

**Overall:** ✅ PASS — All criteria met. However, the method is named "issue" not "approve"; there is no pending_approval intermediate state used despite the enum defining it.

---

## Invoice Operation: POST

**Endpoint:** POST /bill-cycle/:id/post (in BillCycleController.post)
**Purpose:** Finalize/post a bill cycle (sets cycle status to CLOSED)

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Endpoint exists | ✅ PASS | @Post(':id/post') at line 138 of ill-cycle.controller.ts |
| @Roles() decorator | ✅ PASS | @Roles(Role.ADMIN, Role.SUPER_ADMIN) at line 139 |
| Authentication guard | ✅ PASS | Controller-level @UseGuards(GlobalAuthGuard, RolesGuard) at line 11 |
| Project isolation check | ❌ FAIL | No projectId in request; cycle-level operation; global interceptor would have no projectId to check |
| Input validation | ✅ PASS | @Param('id') string param (no ParseUUIDPipe though) |
| State transition check | ✅ PASS | if (cycle.status !== 'APPROVED') return error at line 145 |
| Audit logging | ✅ PASS | Writes to BillingCycleAudit table (line 149) AND global AuditInterceptor captures the POST |
| Frontend consumer | ❌ FAIL | No frontend hook found for bill cycle posting |

**Overall:** ⚠️ WARN — Bill cycle posting works, but no per-invoice "Post" operation exists. Posting is at the cycle level, not individual invoice level.

---

## Invoice Operation: CANCEL

**Endpoint:** POST /invoices/:id/cancel (in BillingController.cancelInvoice)
**Purpose:** Cancel an invoice (draft/issued only)

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Endpoint exists | ✅ PASS | @Post('invoices/:id/cancel') at line 211 of illing.controller.ts |
| @Roles() decorator | ✅ PASS | @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN) at line 212 |
| Authentication guard | ✅ PASS | Controller-level @UseGuards(AuthGuard('jwt'), RolesGuard) at line 33 |
| Project isolation check | ⚠️ WARN | Only :id param; no projectId extracted for project isolation |
| Input validation | ✅ PASS | ParseUUIDPipe on :id at line 215 |
| State transition check | ✅ PASS | Blocks if cancelled or paid at lines 218–219 |
| Audit logging | ✅ PASS | Global AuditInterceptor captures POST |
| Frontend consumer | ❌ FAIL | No cancel mutation found in use-invoices.ts |

**Overall:** ⚠️ WARN — Cancel is implemented with state guards but lacks reversal of ledger entries and has no frontend hook.

---

## Invoice Operation: REVERSE

**Endpoint:** None
**Purpose:** Reverse a posted/paid invoice (full financial reversal)

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Endpoint exists | ❌ FAIL | **No reverse endpoint exists** anywhere in the codebase |
| @Roles() decorator | ❌ FAIL | N/A — endpoint absent |
| Authentication guard | ❌ FAIL | N/A — endpoint absent |
| Project isolation check | ❌ FAIL | N/A — endpoint absent |
| Input validation | ❌ FAIL | N/A — endpoint absent |
| Audit logging | ❌ FAIL | N/A — endpoint absent |
| Frontend consumer | ❌ FAIL | N/A — endpoint absent |

**Overall:** ❌ FAIL — **REVERSE IS NOT IMPLEMENTED.** The InvoiceStatus enum has no eversed value. The PaymentStatus enum has eversed but no endpoint triggers it. No ledger reversal logic exists.

---

## Invoice Operation: VOID

**Endpoint:** None
**Purpose:** Void an invoice (before it's issued/posted)

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Endpoint exists | ❌ FAIL | **No void endpoint exists.** Cancel serves partial purpose but no distinct oid operation. |
| @Roles() decorator | ❌ FAIL | N/A |
| Authentication guard | ❌ FAIL | N/A |
| Project isolation check | ❌ FAIL | N/A |
| Input validation | ❌ FAIL | N/A |
| Audit logging | ❌ FAIL | N/A |
| Frontend consumer | ❌ FAIL | N/A |

**Overall:** ❌ FAIL — **VOID IS NOT IMPLEMENTED.** The InvoiceStatus enum has no oided value. Cancel is used as a substitute but does not differentiate between cancel-before-issue (void) and cancel-after-issue (cancel).

---

## Invoice Operation: DOWNLOAD

**Endpoint:** GET /invoices/:id/pdf (in InvoicesController.downloadPdf)
**Purpose:** Download individual invoice as PDF

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Endpoint exists | ✅ PASS | @Get(':id/pdf') at line 25 of invoices.controller.ts |
| @Roles() decorator | ✅ PASS | @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE) at line 26 |
| Authentication guard | ✅ PASS | Controller-level @UseGuards(GlobalAuthGuard, RolesGuard) at line 17 |
| Project isolation check | ⚠️ WARN | No projectId extracted; relies on invoice lookup to prisma.invoice.findUnique (line 29) without project filter |
| Input validation | ✅ PASS | ParseUUIDPipe on :id at line 28 |
| Audit logging | ✅ PASS | Skipped by AuditInterceptor (GET requests are excluded at line 18 of interceptor) |
| Frontend consumer | ❌ FAIL | No frontend hook for PDF download; useInvoiceDetail only fetches JSON data |

**Overall:** ⚠️ WARN — PDF generation works with Puppeteer + pdfkit fallback, but no frontend button or hook triggers this endpoint. Download via direct URL only.

---

## Invoice Operation: EXPORT

**Endpoint:** POST /invoices/batch-download (in InvoicesController.batchDownload)
**Purpose:** Batch export invoices as ZIP (JSON metadata only)

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Endpoint exists | ✅ PASS | @Post('invoices/batch-download') at line 134 of invoices.controller.ts |
| @Roles() decorator | ✅ PASS | @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN) at line 135 |
| Authentication guard | ✅ PASS | Controller-level @UseGuards(GlobalAuthGuard, RolesGuard) at line 17 |
| Project isolation check | ✅ PASS | Uses UserAccessService.resolveAccess() for non-super_admin roles (lines 141–144) |
| Input validation | ❌ FAIL | No DTO class, no class-validator decorators; ody is ny type (line 137) |
| Audit logging | ✅ PASS | Global AuditInterceptor captures POST |
| Frontend consumer | ❌ FAIL | No frontend hook uses batch download |

**🐛 Notable Bug:** The batch download only exports **up to 10 invoices** (.take(10) at line 148) and stores **JSON metadata only** (not actual PDFs). InvoiceRendererService.renderBatchPdf() exists but is never called by this controller.

**Overall:** ❌ FAIL — Batch export is incomplete: hardcoded limit of 10, JSON-only output, and a dedicated batch PDF renderer exists but is unused.

---

## Cross-Cutting Verification Matrix

| Check | Create | Generate | Approve | Post | Cancel | Reverse | Void | Download | Export |
|-------|--------|----------|---------|------|--------|---------|------|----------|--------|
| Endpoint exists | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| @Roles() decorator | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Auth guard | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Project isolation | ⚠️ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ⚠️ | ✅ |
| Input validation | ⚠️ | ❌ | ✅ | ⚠️ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Audit logging | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ⚠️ | ✅ |
| Frontend consumer | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Summary

| Metric | Count |
|--------|-------|
| Total operations required | 9 |
| Fully implemented (all ✅) | 0 |
| Partially implemented (≥1 ✅, no ❌) | 2 (Approve, Post) |
| Missing entirely (Reverse, Void) | 2 |
| Has frontend consumer | 1 (Approve/Issue only) |
| Has project isolation | 1 (Generate, Export) partially |
| Has DTO validation | 2 (Approve, Cancel) partially |

**Overall Certification: ❌ FAIL**

Critical gaps:
1. **Reverse and Void are absent** — no endpoints, no status enum values, no ledger reversal logic
2. **No DTO validation classes** — every endpoint uses inline type annotations without class-validator decorators
3. **Frontend integration is minimal** — only useIssueInvoice exists out of 9 operations
4. **Batch export is broken** — hardcoded 10-invoice limit, JSON-only, unused PDF renderer

