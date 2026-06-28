# Frontend-Backend Integration Matrix — Meter Verse

**Generated:** 2026-06-25  

This matrix maps every frontend page to its corresponding backend API endpoint(s) and identifies gaps.

---

## Legend
| Status | Meaning |
|--------|---------|
| ✅ INTEGRATED | Component calls API directly |
| ⚠️ PARTIAL | Component exists but uses mock data |
| ❌ MISSING FE | No frontend component exists for this view |
| ❌ MISSING BE | No backend endpoint exists for this operation |
| ❌ BOTH MISSING | Neither frontend nor backend implemented |

---

## 1. Authentication

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| `/login` | `LoginPage.tsx` (layout/LoginPage.tsx) | `/api/v1/auth/login` | POST | ✅ INTEGRATED |
| `/register` | `register/page.tsx` | `/api/v1/auth/register` | POST | ✅ INTEGRATED |
| — (token refresh) | `api/auth.ts` | `/api/v1/auth/refresh` | POST | ✅ INTEGRATED |
| — (logout) | `api/auth.ts` | `/api/v1/auth/logout` | POST | ✅ INTEGRATED |
| — (session check) | `api/auth.ts` | `/api/v1/auth/me` | GET | ✅ INTEGRATED |
| — (dev login) | — | `/api/v1/auth/dev-login` | POST | ⚠️ Dev only |
| — (CSRF token) | — | `/api/v1/auth/csrf-token` | GET | ✅ Present |

---

## 2. Dashboard

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| `/dashboard` | `DashboardPage.tsx` | `/api/v1/projects/:projectId/dashboard/kpis` | GET | ⚠️ MOCK DATA |
| `/executive-dashboard` | `ExecutiveDashboard.tsx` | `/api/v1/kpi/executive` | GET | ⚠️ MOCK DATA |
| `/operations-dashboard` | `OperationsDashboard.tsx` | — | — | ❌ MISSING BE |
| `/billing-dashboard` | `BillingDashboard.tsx` | — | — | ❌ MISSING BE |
| `/collections-dashboard-plus` | `CollectionsDashboardPlus.tsx` | `/api/v1/collections/dashboard` | GET | ⚠️ MOCK DATA |
| `/utility-dashboard` | `UtilityDashboard.tsx` | — | — | ❌ MISSING BE |
| `/kpi-executive` | from ExecutiveDashboard | `/api/v1/kpi/executive` | GET | ⚠️ MOCK DATA |
| `/kpi-collections` | `CollectionsDashboard.tsx` | `/api/v1/kpi/collections` | GET | ⚠️ MOCK DATA |
| `/kpi-utilities` | `UtilitiesDashboard.tsx` | `/api/v1/kpi/utilities` | GET | ⚠️ MOCK DATA |

---

## 3. Customers

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| `/customers` | `CustomersPage.tsx` | `/api/v1/projects/:projectId/customers` | GET | ⚠️ MOCK DATA |
| `/customers/:id` | `CustomerDetailPage.tsx` | `/api/v1/projects/:projectId/customers/:id` | GET | ⚠️ MOCK DATA |
| — | — | `/api/v1/projects/:projectId/customers/:id/360` | GET | ✅ BE exists, no FE |
| — | — | `/api/v1/projects/:projectId/customers/:id/statement` | GET | ✅ BE exists, no FE |
| — | — | `/api/v1/projects/:projectId/customers/:id/transfer-ownership` | POST | ✅ BE exists, no FE |
| — | — | POST `/api/v1/projects/:projectId/customers` | POST | ✅ BE exists, no FE |
| ❌ `/balances` | MISSING | `/api/v1/projects/:projectId/customers/:id/statement` | GET | ❌ FE MISSING |
| ❌ `/downloads` | MISSING | `/api/v1/downloads/*` | — | ❌ FE MISSING |

---

## 4. Projects & Locations

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| `/projects` | `ProjectsPage.tsx` | `/api/v1/projects` | GET | ⚠️ MOCK DATA (React Query integrated) |
| — | `ProjectFormDialog.tsx` | `/api/v1/projects` | POST | ⚠️ MOCK DATA |
| `/projects/:id` | `ProjectDetailPage.tsx` | `/api/v1/projects/:id` | GET | ⚠️ MOCK DATA |
| `/locations` | `LocationsPage.tsx` | `/api/v1/projects/:projectId/locations` | GET | ⚠️ MOCK DATA |

---

## 5. Meters

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| `/meters` | `MetersPage.tsx` | `/api/v1/meters` | GET | ⚠️ MOCK DATA |
| — | — | `/api/v1/meters/:id` | GET | ✅ BE exists, no FE |
| — | — | POST `/api/v1/meters` | POST | ✅ BE exists, no FE |
| /meters/:id | `MeterDetailPage.tsx` | `/api/v1/meters/:id` | GET | ⚠️ MOCK DATA |
| `/meters/assign` | `MeterAssignPage.tsx` | `/api/v1/meters/:meterId/assign` | POST | ⚠️ MOCK DATA |
| `/meters/replace` | `MeterReplacePage.tsx` | — | — | ❌ MISSING BE |
| `/meters/terminate` | `MeterTerminatePage.tsx` | `/api/v1/meters/:meterId/terminate` | POST | ⚠️ MOCK DATA |
| ❌ (SIM cards) | — | `/api/v1/sim-cards` | GET/POST | ❌ FE MISSING |
| ❌ (SIM eligibility) | — | `/api/v1/sim-cards/:simId/eligibility` | GET | ❌ FE MISSING |

---

## 6. Readings

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| `/readings` | `ReadingsPage.tsx` | `/api/v1/readings` | GET | ⚠️ MOCK DATA |
| `/readings/new` | `ReadingNewPage.tsx` | `/api/v1/readings` | POST | ⚠️ MOCK DATA |
| — | — | `/api/v1/readings/review-queue` | GET | ✅ BE exists, no FE |
| — | — | `/api/v1/readings/:id/approve` | POST | ✅ BE exists, no FE |
| — | — | `/api/v1/readings/:id/reject` | POST | ✅ BE exists, no FE |
| — | — | `/api/v1/projects/:projectId/water-balance` | GET | ✅ BE exists, no FE |

---

## 7. Invoices & Billing

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| ❌ `/invoices` | MISSING | `/api/v1/billing/invoices` | GET | ❌ FE MISSING |
| ❌ `/invoices/:id` | MISSING | `/api/v1/billing/invoices/:id` | GET | ❌ FE MISSING |
| — | — | `/api/v1/invoices/:id/pdf` | GET | ✅ BE exists, no FE |
| — | — | `/api/v1/invoices/batch-download` | POST | ✅ BE exists, no FE |
| — | — | `/api/v1/billing/invoices/generate` | POST | ✅ BE exists, no FE |
| — | — | `/api/v1/billing/invoices/:id/issue` | POST | ✅ BE exists, no FE |
| — | — | `/api/v1/billing/invoices/:id/cancel` | POST | ✅ BE exists, no FE |
| — | — | `/api/v1/billing/invoices/:id/adjustments` | POST | ✅ BE exists, no FE |
| ❌ `/adjustments` | MISSING | — | — | ❌ BOTH MISSING |
| ❌ `/bill-cycle` | MISSING | `/api/v1/bill-cycle` | GET/POST | ❌ FE MISSING |
| ❌ `/payments` | MISSING | `/api/v1/billing/payments` | POST | ❌ FE MISSING |
| — | — | `/api/v1/payments` | GET | ✅ BE exists, no FE |
| — | — | `/api/v1/payments/:id/reverse` | POST | ✅ BE exists, no FE |

---

## 8. Tariffs

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| `/tariff-studio` | `TariffStudioPage.tsx` | `/api/v1/billing/tariffs` | GET/POST | ⚠️ MOCK DATA |
| — | — | `/api/v1/billing/tariffs/simulate` | POST | ✅ BE exists, no FE |
| — | — | `/api/v1/billing/periods` | GET/POST | ✅ BE exists, no FE |

---

## 9. Collections

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| ❌ `/collections` | MISSING | `/api/v1/collections/dashboard` | GET | ❌ FE MISSING |
| ❌ `/promises` | MISSING | — | — | ❌ BOTH MISSING |
| ❌ `/recovery` | MISSING | — | — | ❌ BOTH MISSING |
| — | — | `/api/v1/collections/aging` | GET | ✅ BE exists, no FE |
| — | — | `/api/v1/collections/payments/:id/receipt` | GET | ✅ BE exists, no FE |

---

## 10. Utilities & Solar

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| ❌ `/utility/electricity` | MISSING | — | — | ❌ BOTH MISSING |
| ❌ `/utility/water` | MISSING | — | — | ❌ BOTH MISSING |
| `/utility/solar` | `SolarDashboard.tsx` | `/api/v1/solar/dashboard` | GET | ⚠️ MOCK DATA |
| — | — | `/api/v1/solar/wallet/:customerId` | GET | ✅ BE exists, no FE |
| — | — | `/api/v1/solar/readings/:meterId` | GET | ✅ BE exists, no FE |
| — | — | `/api/v1/solar/statement/:customerId` | GET | ✅ BE exists, no FE |
| ❌ `/utility/gas` | MISSING | — | — | ❌ BOTH MISSING |
| ❌ `/utility/chilled-water` | MISSING | `/api/v1/chilled-water/*` | GET | ❌ FE MISSING |
| ❌ `/utility/outdoor-unit` | MISSING | — | — | ❌ BOTH MISSING |
| `/utility/settlement` | `SettlementPage.tsx` | `/api/v1/settlement` | GET/POST | ⚠️ MOCK DATA |

---

## 11. Reports

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| `/reports` | `ReportsPage.tsx` | `/api/v1/reports` | GET | ⚠️ MOCK DATA |
| — | — | `/api/v1/reports/generate/:type` | GET | ✅ BE exists, no FE |
| ❌ `/reports/operational` | MISSING | — | — | ❌ BOTH |
| ❌ `/reports/financial` | MISSING | — | — | ❌ BOTH |
| ❌ `/reports/collections` | MISSING | — | — | ❌ BOTH |
| ❌ `/reports/utility` | MISSING | — | — | ❌ BOTH |
| ❌ `/reports/regulatory` | MISSING | — | — | ❌ BOTH |

---

## 12. Settings, Uploads & Downloads

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| `/settings` | `SettingsPage.tsx` | `/api/v1/settings` | GET/PATCH | ⚠️ MOCK DATA |
| `/upload-center` | `UploadCenterPage.tsx` | `/api/v1/upload/file` | POST | ⚠️ MOCK DATA |
| — | — | `/api/v1/upload/history/:entityType` | GET | ✅ BE exists, no FE |
| — | — | `/api/v1/upload/template/:type` | GET | ✅ BE exists, no FE |
| — | — | `/api/v1/upload/customers` | POST | ✅ BE exists, no FE |
| — | — | `/api/v1/upload/meters` | POST | ✅ BE exists, no FE |
| — | — | `/api/v1/downloads/table/csv` | POST | ✅ BE exists, no FE |
| — | — | `/api/v1/downloads/table/pdf` | POST | ✅ BE exists, no FE |

---

## 13. Support & Tickets

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| `/tickets` | `TicketsPage.tsx` | `/api/v1/tickets` | GET/POST | ⚠️ MOCK DATA |
| `/support` | `SupportPage.tsx` | `/api/v1/support` | GET/POST | ⚠️ MOCK DATA |
| ❌ `/notifications` | MISSING | `/api/v1/notifications` | GET | ❌ FE MISSING |

---

## 14. Workplace & Sync

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| `/workplace` | `WorkplacePage.tsx` | — | — | ❌ MISSING BE |
| `/sync-gateway` | `SyncGatewayPage.tsx` | — | — | ❌ MISSING BE |

---

## 15. Admin

| Frontend Route | Frontend Component | Backend Endpoint | Method | Status |
|---------------|-------------------|------------------|--------|--------|
| ❌ `/rbac` | MISSING | `/api/v1/admin/*` | — | ❌ FE MISSING |
| ❌ `/feature-flags` | MISSING | — | — | ❌ BOTH MISSING |
| ❌ `/audit-logs` | MISSING | `/api/v1/admin/tables` | GET | ❌ FE MISSING |
| ❌ (Users) | MISSING | `/api/v1/users` | GET/POST | ❌ FE MISSING |
| ❌ (Areas) | MISSING | `/api/v1/areas` | GET | ❌ FE MISSING |
| ❌ (Registration mgmt) | MISSING | `/api/v1/registration/requests` | GET | ❌ FE MISSING |

---

## 16. Summary Statistics

| Metric | Count |
|--------|-------|
| Total frontend routes defined | 47 |
| Frontend components with mock data | 25 |
| Frontend components fully integrated with API | 5 (login, register, refresh, logout, me) |
| Frontend routes with NO component | 17 |
| Backend endpoints with NO frontend | 65+ |
| Backend endpoints fully covered | ~5 |
| Missing both FE + BE | ~12 |

**Integration Gap: ~85% of endpoints have no corresponding frontend integration.**
**Current state:** Mostly mock-driven UI with backend ready but not wired.
